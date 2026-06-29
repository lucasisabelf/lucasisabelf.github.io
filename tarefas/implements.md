# Implements — Sprint Board

## 1. Animação CSS no colapso de coluna

**Tarefa:** Em `style.css`, substituída a regra `.column--collapsed .column-body { display: none; }` por `max-height: 0; overflow: hidden; opacity: 0;`. Adicionadas ao seletor `.column-body` as propriedades `opacity: 1` e `transition: max-height .25s ease, opacity .2s ease`. A regra `@media print .column-body { max-height: none; overflow: visible; }` já existente garante que colunas colapsadas apareçam normalmente na impressão. Nenhuma alteração em JS.

**Edge case:** Nenhum

**Solução:** N/A

---

## 2. Atalho G para abrir a planilha no Google Sheets

**Tarefa:** No handler `keydown` de `document` em `app.js`, dentro do bloco `boardVisible && !inInput`, adicionado: se `e.key === 'g' || e.key === 'G'` e `edit-link` não possui `.hidden`, chama `.click()` no elemento. Em `index.html`, adicionada linha `G → Abrir planilha no Google Sheets` na tabela de atalhos do `#help-overlay`.

**Edge case:** Nenhum

**Solução:** N/A

---

## 3. Confirmação antes de limpar as configurações

**Tarefa:** Em `resetAllSettings` em `app.js`, adicionado `if (!confirm('Limpar todas as configurações e recarregar a página?')) return;` como primeiro statement. A função só prossegue com `STORAGE_KEYS.forEach` e `location.reload()` se o usuário confirmar.

**Edge case:** Nenhum

**Solução:** N/A

---

## 4. Cabeçalho com data e hora na impressão

**Tarefa:** Em `handleSubmit` (app.js), após `showState('success')`, atribuído `document.querySelector('.app-header').dataset.printDate` com a data e hora formatadas em pt-BR. Em `style.css`, dentro do bloco `@media print`, adicionada regra `.app-header::before` com `content: 'Sprint Board · Impresso em ' attr(data-print-date)`, `display: block`, `font-size: .9rem`, `margin-bottom: .5rem`, `color: #555`.

**Edge case:** Nenhum

**Solução:** N/A

---

## 5. Copiar URL da planilha atual

**Tarefa:** Em `app.js`, adicionada `copySheetUrl()` que lê `document.getElementById('edit-link').href` e chama `navigator.clipboard.writeText(url)` seguido de `flashButton(btn, '✓ Copiado!')`. Em `index.html`, adicionado `#copy-sheet-btn` após `#copy-link-btn`. Em `showState` (ui.js), `copy-sheet-btn` adicionado ao conjunto hide-all e show-on-success junto de `copy-link-btn`. Listener registrado na seção de init. `APP_VERSION` incrementada para `1.13`.

**Edge case:** Nenhum

**Solução:** N/A

---
