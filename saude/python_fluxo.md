# python_fluxo.md — Checagem independente de sessão (desenho, não implementado ainda)

## Por que isso existe

O `/loop` (`saude/.claude/commands/loop.md`) roda a checagem barata + o ciclo completo dentro da sessão do Claude Code, reagendando-se via `ScheduleWakeup`. Isso funciona, mas tem duas limitações reais:

- **`ScheduleWakeup` e `CronCreate` são presos à sessão**: `CronCreate` é explicitamente session-only ("nothing is written to disk, job is gone when Claude exits"), expira sozinho em 7 dias, e só dispara com o REPL ocioso. `ScheduleWakeup` tem a mesma dependência de a sessão continuar viva. Nenhum dos dois é "a qualquer momento" de verdade, independente de eu ter uma sessão aberta.
- **O `WebFetch` tem cache de 15 minutos por URL**, o que já é contornado hoje com um parâmetro de cache-bust na URL — mas isso só importa dentro de uma chamada de ferramenta; um processo externo não tem esse problema, porque uma request HTTP comum (`requests`/`httpx` em Python) nunca cacheia por conta própria.

Este documento descreve a versão com um script Python externo, rodando fora da sessão do Claude, que resolve os dois pontos: roda a qualquer momento (não depende de sessão viva) e não tem limitação de cache nenhuma.

## Divisão de responsabilidade

O script Python **só faz a checagem barata** (Passo 2 do `loop.md` atual) — ele não pesquisa, não escreve `index.html`, não revisa. Essa parte continua exigindo um LLM. Quando o script detecta mudança, ele invoca `claude -p "/loop"` (modo não-interativo do Claude Code CLI) para rodar o ciclo caro completo (pesquisar → escrever → revisar → commit → push), exatamente o mesmo `/loop` já escrito — nenhuma lógica de negócio duplicada em Python.

```mermaid
flowchart LR
    T[Task Scheduler / nohup loop] -->|a cada 30min| S[saude_watch.py]
    S -->|GET com cache real desligado| INV[invertexto.com/saudelcal]
    S -->|le mtime/conteudo| TOP[topicos.txt de cada pasta]
    S -->|compara com estado salvo| ST[(saude/.watch_state.json)]
    S -->|mudou algo?| D{Mudou?}
    D -- não --> FIM[sai, sem custo de LLM]
    D -- sim --> CLI["claude -p \"/loop\" (não-interativo)"]
    CLI --> LOOP[/loop.md: pesquisar→escrever→revisar→commit→push/]
```

## `saude_watch.py` — responsabilidades

1. **Ler estado anterior** de `saude/.watch_state.json` (criado na primeira execução se não existir):
   ```json
   {
     "al": { "topicos_hash": "...", "invertexto_bloco": "..." },
     "lc": { "topicos_hash": "...", "invertexto_bloco": "..." }
   }
   ```
2. **Para cada pasta em `saude/` com `topicos.txt`:**
   - Calcular hash do conteúdo atual de `topicos.txt` e comparar com `topicos_hash` salvo.
   - Buscar `https://www.invertexto.com/saudelcal` via `requests.get(url, headers={"Cache-Control": "no-cache"})` (sem necessidade de query param de cache-bust — uma request Python nova já é sempre fresca, mas manter o header não custa nada e documenta a intenção), extrair o bloco `####<pasta>####` com um parsing simples de texto (mesma lógica descrita em `pesquisar.md` Passo 0b, portada pra Python: procurar `####` + nome da pasta, pegar até o próximo `####`), e comparar com `invertexto_bloco` salvo.
3. **Se algo mudou em pelo menos uma pasta:**
   - Rodar `subprocess.run(["claude", "-p", "/loop"], cwd=<raiz do repo>, capture_output=True)`.
   - Logar stdout/stderr em `saude/.watch_log.txt` (append, com timestamp) — inclusive em caso de falha, pra dar pra debugar sem precisar estar olhando ao vivo.
   - Atualizar `saude/.watch_state.json` com os novos hashes/blocos **depois** que `claude -p` retornar (não antes — se `claude -p` falhar no meio, a próxima checagem deve tentar de novo, não achar que já processou).
4. **Se nada mudou:** sair sem chamar `claude -p` (custo zero de LLM nesse ciclo).

Não gerar nenhum arquivo dentro de `saude/<pasta>/` diretamente — isso continua sendo trabalho exclusivo do `/loop`/`/pesquisar`/`/escrever`/`/revisar` já existentes. O script só decide **se** deve chamar o Claude, nunca substitui o que o Claude escreve.

## Como manter o script rodando (decisão já tomada: processo em loop, não cron do SO)

```python
# saude_watch.py (esqueleto)
import time

INTERVALO_SEGUNDOS = 1800  # 30 min

def checar_uma_vez():
    ...  # passos 1-4 acima

if __name__ == "__main__":
    while True:
        checar_uma_vez()
        time.sleep(INTERVALO_SEGUNDOS)
```

Iniciar uma vez, em background, e deixar rodando:

```bash
nohup python3 saude/saude_watch.py > saude/.watch_stdout.log 2>&1 &
```

(ou dentro de uma sessão `tmux`/`screen`, se preferir acompanhar ao vivo). Diferente de um cron do SO, este modelo depende do processo continuar de pé (sobrevive a fechar o terminal via `nohup`, mas não sobrevive a reboot da máquina) — troca deliberada: mais simples de operar (um comando pra iniciar, `kill <pid>` pra parar), em vez de mexer em crontab do WSL ou Task Scheduler do Windows.

## Pré-requisitos antes de implementar de verdade

- Confirmar que `claude -p "<prompt>"` roda com as permissões necessárias sem pedir confirmação interativa (senão o processo trava esperando input que nunca vem) — provavelmente exige permissões pré-aprovadas em `saude/.claude/settings.local.json` ou nas settings globais para os comandos que `/loop` executa (`WebFetch`/`WebSearch`/`git add`/`git commit`/`git push`).
- Definir onde `saude/.watch_state.json`, `saude/.watch_log.txt` e `saude/.watch_stdout.log` ficam — sugestão: adicionar ao `.gitignore` do repo (estado local de automação, não conteúdo do site).

## Status

Documento de desenho apenas — **não implementado ainda**. Por ora, o ciclo recorrente roda via `saude/.claude/commands/loop.md` + `ScheduleWakeup`, dentro da sessão do Claude Code (ver Passo 6 de `loop.md`).
