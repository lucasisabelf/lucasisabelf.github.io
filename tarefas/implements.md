# Implements — Ciclo 25

## 1. Adicionar Tailwind CSS via CDN Play

**Tarefa:** Adicionado `<script src="https://cdn.tailwindcss.com"></script>` e um segundo `<script>` inline com `tailwind.config` em `index.html`, mapeando as 31 variáveis de cor já existentes em `:root`/`[data-theme="dark"]` de `style.css` (`--bg`, `--surface`, `--text`, `--blue`, `--priority-high-bg`, `--forca-stroke` etc.) como `theme.extend.colors` via `var(--nome)` — nenhum valor hex duplicado. `style.css` não foi tocado; nenhuma classe Tailwind foi introduzida em `index.html`/`ui.js`/`app.js` ainda — apenas o bootstrap do framework, conforme a decisão registrada em `CLAUDE.md` (seção "Estilo com Tailwind CSS").

**Edge case:** `FEATURES.md` continha apenas o mapeamento comparativo das duas opções (CDN Play vs. build tool), sem uma especificação de feature concreta — a decisão (CDN Play) já havia sido tomada e registrada em `CLAUDE.md` numa conversa anterior à execução deste ciclo. Implementar literalmente "o mapeamento" não fazia sentido; o passo concreto e de baixo risco que a decisão já aprovada habilita é o bootstrap do CDN + config, sem reescrever `style.css` (a nota de migração em `CLAUDE.md` explicitamente pede migração gradual, não rewrite em lote).

**Solução:** Tratada a entrada de `FEATURES.md` como decisão já resolvida (não como spec a seguir ao pé da letra) e implementado apenas o passo já autorizado por `CLAUDE.md`: script CDN + `tailwind.config` de cores, sem tocar em `style.css` ou introduzir classes utilitárias novas neste ciclo.

---

**Nota do ciclo:** `APP_VERSION` incrementada de `1.23` para `1.24`. Nenhuma classe Tailwind está em uso ainda no HTML/JS — o CDN está carregado e configurado, mas o app continua visualmente idêntico, renderizado 100% pelo `style.css` existente. Futuras features que usem utilitários Tailwind (`class="flex gap-2"` etc.) podem agora ser implementadas incrementalmente, uma de cada vez, sem exigir rewrite do CSS existente.
