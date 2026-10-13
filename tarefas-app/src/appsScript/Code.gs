// Sprint Board — gravacao direta na planilha.
// Cole este arquivo em Extensoes > Apps Script da planilha e implante como
// App da Web (Executar como: Eu; Quem pode acessar: Qualquer pessoa).
// Ao atualizar o codigo: Implantar > Gerenciar implantacoes > editar > Nova versao (a URL continua a mesma).

var SCRIPT_VERSION = 3;
var BOARD_SHEETS = ['To Do', 'In Progress', 'Done'];
var LISTS_SHEET = 'Listas';

// Abas do board: dados a partir da linha 3, A:G, linha localizada por titulo + data.
// Listas extras: cabecalho na linha 1, dados a partir da 2, A:E, linha localizada so pelo nome.
var LAYOUTS = {
  board: { firstRow: 3, cols: 7, matchDate: true },
  list: { firstRow: 2, cols: 5, matchDate: false },
};

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var req = JSON.parse(e.postData.contents);
    handle_(req);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, app: 'sprint-board', version: SCRIPT_VERSION, lists: listNames_() });
}

function handle_(req) {
  if (req.action === 'batch') {
    runBatch_(req.ops || []);
    return;
  }
  var kind = req.kind === 'list' ? 'list' : 'board';
  var layout = LAYOUTS[kind];
  switch (req.action) {
    case 'create':
      appendRow_(sheet_(kind, req.sheet), req.row, layout);
      return;
    case 'update': {
      var s = sheet_(kind, req.sheet);
      s.getRange(findRow_(s, req.match, layout), 1, 1, layout.cols).setValues([normalize_(req.row, layout)]);
      return;
    }
    case 'move': {
      if (kind !== 'board') throw new Error('Mover so existe no board.');
      var from = sheet_(kind, req.from);
      var to = sheet_(kind, req.to);
      var r = findRow_(from, req.match, layout);
      var values = from.getRange(r, 1, 1, layout.cols).getValues()[0];
      appendRow_(to, values, layout);
      from.deleteRow(r);
      return;
    }
    case 'delete': {
      var d = sheet_(kind, req.sheet);
      d.deleteRow(findRow_(d, req.match, layout));
      return;
    }
    default:
      throw new Error('Acao desconhecida: ' + req.action);
  }
}

// Operacoes em lote rodam sob o mesmo lock, em ordem. Se uma falhar, as anteriores ja foram aplicadas.
function runBatch_(ops) {
  for (var i = 0; i < ops.length; i++) {
    if (ops[i].action === 'batch') throw new Error('Lote dentro de lote nao e permitido.');
    try {
      handle_(ops[i]);
    } catch (err) {
      var done = i === 0 ? 'nenhum item foi alterado' : i + ' item(ns) anterior(es) ja foram aplicados';
      throw new Error('Falha no item ' + (i + 1) + ' de ' + ops.length + ': ' + (err && err.message ? err.message : err) + ' (' + done + ').');
    }
  }
}

function sheet_(kind, name) {
  var allowed = kind === 'list' ? listNames_() : BOARD_SHEETS;
  if (allowed.indexOf(name) === -1) {
    throw new Error('Aba invalida: "' + name + '". Aceitas: ' + (allowed.join(', ') || '(nenhuma lista na aba ' + LISTS_SHEET + ')') + '.');
  }
  var s = SpreadsheetApp.getActive().getSheetByName(name);
  if (!s) throw new Error('Aba nao encontrada: ' + name);
  return s;
}

// So aceita escrever em listas cadastradas na aba "Listas" — o board nunca escreve em abas arbitrarias.
function listNames_() {
  var s = SpreadsheetApp.getActive().getSheetByName(LISTS_SHEET);
  if (!s || s.getLastRow() < 2) return [];
  return s.getRange(2, 1, s.getLastRow() - 1, 1).getDisplayValues().map(function (r) { return r[0].trim(); });
}

function normalize_(row, layout) {
  var out = [];
  for (var i = 0; i < layout.cols; i++) out.push(row && row[i] != null ? row[i] : '');
  return out;
}

function appendRow_(s, row, layout) {
  var target = Math.max(s.getLastRow() + 1, layout.firstRow);
  s.getRange(target, 1, 1, layout.cols).setValues([normalize_(row, layout)]);
}

// Linhas nao tem ID: localizadas pelo texto exibido (o mesmo que o board le via gviz).
function findRow_(s, match, layout) {
  var last = s.getLastRow();
  if (last >= layout.firstRow) {
    var values = s.getRange(layout.firstRow, 1, last - layout.firstRow + 1, 3).getDisplayValues();
    for (var i = 0; i < values.length; i++) {
      if (values[i][0].trim() !== match.title) continue;
      if (layout.matchDate && values[i][2].trim() !== (match.date || '')) continue;
      return layout.firstRow + i;
    }
  }
  throw new Error('"' + match.title + '" nao encontrado em ' + s.getName() + ' (a planilha mudou? recarregue o board).');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
