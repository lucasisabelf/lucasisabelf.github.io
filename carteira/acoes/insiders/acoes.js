var dadosGlobaisCompletos = []; // tudo, sem filtro de índice
    var dadosGlobais = []; // dadosGlobaisCompletos após o filtro de índice — é isso que todos os views usam
    var opcoesInteiro = { maximumFractionDigits: 0 };
    var opcoesDecimal = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

    function celula(texto, classe) {
        var td = document.createElement('td');
        td.textContent = texto;
        if (classe) td.className = classe;
        return td;
    }

    function formatarData(iso) {
        return iso ? iso.split('-').reverse().join('/') : '-';
    }

    const dataMes = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' });
    function formatarMes(iso) {
        return iso ? dataMes.format(new Date(iso + 'T00:00:00Z')).replace('. de ', '/').replace(' de ', '/') : '-';
    }

    function classeSinal(valor) {
        return valor > 0 ? 'pos' : (valor < 0 ? 'neg' : 'neutro');
    }

    // ---------- Troca de view ----------
    function trocarView(view) {
        document.querySelectorAll('.tab-btn').forEach(function (btn) {
            var selected = btn.dataset.view === view;
            btn.classList.toggle('ativo', selected);
            btn.setAttribute('aria-pressed', String(selected));
        });
        document.querySelectorAll('.secao').forEach(function (secao) {
            secao.classList.toggle('oculto', secao.id !== 'secao-' + view);
        });
        document.getElementById('menu-explorar').open = !['painel', 'raiox'].includes(view);
        if (view === 'shorts') carregarShortsSeAindaNao();
        if (view === 'ranking') {
            const direcao = location.hash.split('=')[1];
            if (direcao === 'compra' || direcao === 'venda') document.getElementById('rankingDirecao').value = direcao;
            renderizarRanking();
        }
        if (['score', 'convergencia', 'divergencia', 'squeeze', 'raiox'].indexOf(view) !== -1) carregarCorrelacaoSeAindaNao();
    }

    document.querySelectorAll('.tab-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (location.hash === '#' + btn.dataset.view) trocarView(btn.dataset.view);
            else location.hash = btn.dataset.view;
        });
    });

    function atualizarPeriodoCustomizado(prefixo) {
        var valor = document.getElementById(prefixo + 'Periodo').value;
        document.getElementById(prefixo + 'Customizado').style.display = valor === 'custom' ? 'flex' : 'none';
    }

    // devolve { min: 'yyyy-MM-dd'|null, max: 'yyyy-MM-dd'|null }
    function calcularIntervalo(prefixo) {
        var periodo = document.getElementById(prefixo + 'Periodo').value;
        if (periodo === 'tudo') return { min: null, max: null };
        if (periodo === 'custom') {
            return {
                min: document.getElementById(prefixo + 'DataMin').value || null,
                max: document.getElementById(prefixo + 'DataMax').value || null,
            };
        }
        var meses = parseInt(periodo, 10);
        var hoje = new Date();
        var limite = new Date(hoje.getFullYear(), hoje.getMonth() - meses, hoje.getDate());
        return { min: limite.toISOString().slice(0, 10), max: null };
    }

    // ---------- View: Tabela completa ----------
    function renderizarLinhas(dados) {
        var corpo = document.getElementById('corpoInsiders');
        var frag = document.createDocumentFragment();

        dados.forEach(function (m) {
            var tipo = m.quantidade > 0 ? 'compra' : (m.quantidade < 0 ? 'venda' : 'neutro');
            var tr = document.createElement('tr');
            tr.setAttribute('data-ticker', m.ticker);
            tr.setAttribute('data-tipo', tipo);
            tr.setAttribute('data-data', m.data);

            tr.appendChild(celula(m.ticker));
            tr.appendChild(celula(formatarMes(m.data)));
            tr.appendChild(celula(m.quantidade.toLocaleString('pt-BR', opcoesInteiro), classeSinal(m.quantidade)));
            tr.appendChild(celula(reaisCompactos.format(m.valor), classeSinal(m.valor)));
            tr.appendChild(celula(m.precoMedio === 0 ? '-' : m.precoMedio.toLocaleString('pt-BR', opcoesDecimal)));
            Array.from(tr.cells).forEach((td, i) => {
                td.dataset.label = ['Ticker', 'Mês', 'Quantidade', 'Valor', 'Preço médio'][i];
            });

            frag.appendChild(tr);
        });

        corpo.appendChild(frag);
    }

    function aplicarFiltros() {
        var ticker = document.getElementById('ticker').value;
        var tipo = document.getElementById('tipo').value;
        var dataMin = document.getElementById('dataMin').value;
        var dataMax = document.getElementById('dataMax').value;
        var linhas = document.querySelectorAll('#tabelaInsiders tbody tr');
        var visiveis = 0;

        linhas.forEach(function (linha) {
            var data = linha.getAttribute('data-data');

            var ok = true;
            if (ticker && linha.getAttribute('data-ticker') !== ticker) ok = false;
            var tipoLinha = linha.dataset.tipo;
            if (tipo === 'movimento' ? tipoLinha === 'neutro' : tipo && tipoLinha !== tipo) ok = false;
            if (dataMin && data < dataMin) ok = false;
            if (dataMax && data > dataMax) ok = false;

            linha.classList.toggle('oculto', !ok);
            if (ok) visiveis++;
        });

        document.getElementById('contador').textContent = visiveis + ' de ' + linhas.length + ' movimentos exibidos';
    }

    // Reordena as <tr> já existentes (não recria) — filtro continua funcionando
    // normalmente depois, já que é baseado em atributo, não em posição no DOM.
    function ordenarTabela() {
        var campo = document.getElementById('ordenarCampo').value;
        var direcao = document.getElementById('ordenarDirecao').value;
        var corpo = document.getElementById('corpoInsiders');
        var linhas = Array.prototype.slice.call(corpo.children);

        linhas.sort(function (a, b) {
            var va = a.getAttribute('data-' + campo);
            var vb = b.getAttribute('data-' + campo);
            if (va < vb) return direcao === 'asc' ? -1 : 1;
            if (va > vb) return direcao === 'asc' ? 1 : -1;
            return 0;
        });

        linhas.forEach(function (linha) { corpo.appendChild(linha); });
    }

    // ---------- Agregação compartilhada (Ranking + Atividade) ----------
    function agruparPorTicker(dados, dataMin, dataMax) {
        var mapa = {};
        dados.forEach(function (m) {
            if (dataMin && m.data < dataMin) return;
            if (dataMax && m.data > dataMax) return;

            if (!mapa[m.ticker]) {
                mapa[m.ticker] = { ticker: m.ticker, valorLiquido: 0, quantidadeLiquida: 0, mesesCompra: 0, mesesVenda: 0, ultimoMovimento: null };
            }
            var g = mapa[m.ticker];
            g.valorLiquido += m.valor;
            g.quantidadeLiquida += m.quantidade;
            if (m.quantidade > 0) g.mesesCompra++;
            else if (m.quantidade < 0) g.mesesVenda++;
            if (m.quantidade !== 0 && (!g.ultimoMovimento || m.data > g.ultimoMovimento)) g.ultimoMovimento = m.data;
        });
        return Object.keys(mapa).map(function (t) { return mapa[t]; });
    }

    // ---------- View: Ranking ----------
    function renderizarRanking() {
        var intervalo = calcularIntervalo('ranking');
        var metrica = document.getElementById('rankingMetrica').value;
        var direcao = document.getElementById('rankingDirecao').value;
        var topN = parseInt(document.getElementById('rankingTopN').value, 10) || 10;
        var campo = metrica === 'valor' ? 'valorLiquido' : 'quantidadeLiquida';

        var grupos = agruparPorTicker(dadosGlobais, intervalo.min, intervalo.max);
        var filtrados = grupos.filter(function (g) {
            return direcao === 'compra' ? g[campo] > 0 : g[campo] < 0;
        });
        filtrados.sort(function (a, b) {
            return direcao === 'compra' ? b[campo] - a[campo] : a[campo] - b[campo];
        });
        var top = filtrados.slice(0, topN);
        renderizarBarrasRanking(grupos, campo);

        var corpo = document.getElementById('corpoRanking');
        corpo.replaceChildren();
        top.forEach(function (g, i) {
            var tr = document.createElement('tr');
            var classe = classeSinal(g.valorLiquido);
            tr.appendChild(celula(i + 1));
            tr.appendChild(celula(g.ticker));
            tr.appendChild(celula(g.valorLiquido.toLocaleString('pt-BR', opcoesInteiro), classe));
            tr.appendChild(celula(g.quantidadeLiquida.toLocaleString('pt-BR', opcoesInteiro), classe));
            tr.appendChild(celula(g.mesesCompra));
            tr.appendChild(celula(g.mesesVenda));
            tr.appendChild(celula(formatarMes(g.ultimoMovimento)));
            corpo.appendChild(tr);
        });

        document.getElementById('contadorRanking').textContent = top.length + ' de ' + filtrados.length +
            ' tickers com ' + (direcao === 'compra' ? 'compra líquida' : 'venda líquida') + ' no período';
    }

    // ---------- View: Sequências ----------
    function calcularSequencias(dados, direcao) {
        var porTicker = {};
        dados.forEach(function (m) {
            if (!porTicker[m.ticker]) porTicker[m.ticker] = [];
            porTicker[m.ticker].push(m);
        });

        var sinalAlvo = direcao === 'compra' ? 1 : -1;
        var resultado = [];

        Object.keys(porTicker).forEach(function (ticker) {
            var linhas = porTicker[ticker].slice().sort(function (a, b) {
                return a.data < b.data ? -1 : (a.data > b.data ? 1 : 0);
            });

            var count = 0, valorAcumulado = 0, dataInicio = null, dataFim = null;
            for (var i = linhas.length - 1; i >= 0; i--) {
                var m = linhas[i];
                var sinal = m.quantidade > 0 ? 1 : (m.quantidade < 0 ? -1 : 0);
                if (sinal !== sinalAlvo) break;
                if (dataFim === null) dataFim = m.data;
                dataInicio = m.data;
                valorAcumulado += m.valor;
                count++;
            }

            if (count > 0) {
                resultado.push({ ticker: ticker, meses: count, desde: dataInicio, ate: dataFim, valorAcumulado: valorAcumulado });
            }
        });

        resultado.sort(function (a, b) { return b.meses - a.meses; });
        return resultado;
    }

    function renderizarSequencias() {
        var direcao = document.getElementById('sequenciaDirecao').value;
        var topN = parseInt(document.getElementById('sequenciaTopN').value, 10) || 10;
        var todas = calcularSequencias(dadosGlobais, direcao);
        var top = todas.slice(0, topN);

        var corpo = document.getElementById('corpoSequencias');
        corpo.replaceChildren();
        top.forEach(function (s, i) {
            var tr = document.createElement('tr');
            var classe = direcao === 'compra' ? 'pos' : 'neg';
            tr.appendChild(celula(i + 1));
            tr.appendChild(celula(s.ticker));
            tr.appendChild(celula(s.meses, classe));
            tr.appendChild(celula(formatarData(s.desde)));
            tr.appendChild(celula(formatarData(s.ate)));
            tr.appendChild(celula(s.valorAcumulado.toLocaleString('pt-BR', opcoesInteiro), classe));
            corpo.appendChild(tr);
        });

        document.getElementById('contadorSequencias').textContent = top.length + ' de ' + todas.length +
            ' tickers com sequência ativa de ' + (direcao === 'compra' ? 'compra' : 'venda');
    }

    // ---------- View: Reversões (janela fixa 3+3 meses) ----------
    function calcularReversoes(dados) {
        var porTicker = {};
        dados.forEach(function (m) {
            if (!porTicker[m.ticker]) porTicker[m.ticker] = [];
            porTicker[m.ticker].push(m);
        });

        var resultado = [];
        Object.keys(porTicker).forEach(function (ticker) {
            var linhas = porTicker[ticker].slice().sort(function (a, b) {
                return a.data < b.data ? -1 : (a.data > b.data ? 1 : 0);
            });
            if (linhas.length < 6) return;

            var recentes = linhas.slice(linhas.length - 3);
            var anteriores = linhas.slice(linhas.length - 6, linhas.length - 3);
            var valorRecente = recentes.reduce(function (s, m) { return s + m.valor; }, 0);
            var valorAnterior = anteriores.reduce(function (s, m) { return s + m.valor; }, 0);

            if (valorRecente === 0 || valorAnterior === 0) return;
            var sinalRecente = valorRecente > 0 ? 1 : -1;
            var sinalAnterior = valorAnterior > 0 ? 1 : -1;
            if (sinalRecente === sinalAnterior) return;

            resultado.push({
                ticker: ticker,
                direcao: sinalAnterior < 0 ? 'venda-compra' : 'compra-venda',
                valorAnterior: valorAnterior,
                valorRecente: valorRecente,
            });
        });

        resultado.sort(function (a, b) { return Math.abs(b.valorRecente) - Math.abs(a.valorRecente); });
        return resultado;
    }

    function renderizarReversoes() {
        var direcaoFiltro = document.getElementById('reversaoDirecao').value;
        var topN = parseInt(document.getElementById('reversaoTopN').value, 10) || 10;
        var todas = calcularReversoes(dadosGlobais);
        if (direcaoFiltro) todas = todas.filter(function (r) { return r.direcao === direcaoFiltro; });
        var top = todas.slice(0, topN);

        var corpo = document.getElementById('corpoReversoes');
        corpo.replaceChildren();
        top.forEach(function (r) {
            var tr = document.createElement('tr');
            var rotulo = r.direcao === 'venda-compra' ? 'Venda → Compra' : 'Compra → Venda';
            tr.appendChild(celula(r.ticker));
            tr.appendChild(celula(rotulo, r.direcao === 'venda-compra' ? 'pos' : 'neg'));
            tr.appendChild(celula(r.valorAnterior.toLocaleString('pt-BR', opcoesInteiro), classeSinal(r.valorAnterior)));
            tr.appendChild(celula(r.valorRecente.toLocaleString('pt-BR', opcoesInteiro), classeSinal(r.valorRecente)));
            corpo.appendChild(tr);
        });

        document.getElementById('contadorReversoes').textContent = top.length + ' de ' + todas.length + ' tickers com reversão de tendência';
    }

    // ---------- View: Atividade ----------
    function renderizarAtividade() {
        var intervalo = calcularIntervalo('atividade');
        var topN = parseInt(document.getElementById('atividadeTopN').value, 10) || 10;

        var grupos = agruparPorTicker(dadosGlobais, intervalo.min, intervalo.max);
        grupos.forEach(function (g) { g.totalMeses = g.mesesCompra + g.mesesVenda; });
        var comMovimento = grupos.filter(function (g) { return g.totalMeses > 0; });
        comMovimento.sort(function (a, b) { return b.totalMeses - a.totalMeses; });
        var top = comMovimento.slice(0, topN);

        var corpo = document.getElementById('corpoAtividade');
        corpo.replaceChildren();
        top.forEach(function (g, i) {
            var tr = document.createElement('tr');
            tr.appendChild(celula(i + 1));
            tr.appendChild(celula(g.ticker));
            tr.appendChild(celula(g.totalMeses));
            tr.appendChild(celula(g.mesesCompra));
            tr.appendChild(celula(g.mesesVenda));
            tr.appendChild(celula(g.valorLiquido.toLocaleString('pt-BR', opcoesInteiro), classeSinal(g.valorLiquido)));
            corpo.appendChild(tr);
        });

        document.getElementById('contadorAtividade').textContent = top.length + ' de ' + comMovimento.length + ' tickers com movimento no período';
    }

    // ---------- Filtro global de índice (afeta todos os views) ----------
    function aplicarFiltroIndice() {
        var indice = document.getElementById('filtroIndice').value;
        dadosGlobais = indice
            ? dadosGlobaisCompletos.filter(function (m) { return m.indices.indexOf(indice) !== -1; })
            : dadosGlobaisCompletos;

        document.getElementById('corpoInsiders').replaceChildren();
        renderizarLinhas(dadosGlobais);
        ordenarTabela(); // reaplica a ordenação escolhida (renderizarLinhas volta pra ordem original)
        aplicarFiltros();
        renderizarRanking();
        renderizarSequencias();
        renderizarReversoes();
        renderizarAtividade();
        if (document.getElementById('carregar-quadrantes').hidden) renderizarQuadrantes();
    }

    // Promise exposta (não só fire-and-forget) — as views de correlação mais
    // abaixo precisam saber quando os insiders terminaram de carregar, em paralelo
    // com os shorts (ver garantirShortsCarregando/carregarCorrelacaoSeAindaNao).
    var insidersPromise = lerJson('./insiders.json')
        .then(function (dados) {
            dadosGlobaisCompletos = dados;
            aplicarFiltroIndice();
        })
        .catch(function (erro) {
            document.getElementById('contador').textContent = 'Erro ao carregar insiders.json: ' + erro;
        });

    // ---------- Shorts (aba independente, dado carregado sob demanda) ----------
    for (const [fonte, arquivo, prefixo] of [['insiders', 'insiders-meta.json', 'Dados de insiders · '], ['shorts', 'shorts-meta.json', 'Dados de shorts · ']]) {
        lerJson('./' + arquivo).then(meta => mostrarData(document.getElementById(fonte + '-data'), meta.atualizadoEm, prefixo))
            .catch(() => mostrarData(document.getElementById(fonte + '-data'), null, prefixo));
    }

    var dadosShorts = [];
    var shortsAtualizadoEm = null;
    var shortsCarregado = false;
    var shortsPollIniciado = false;
    var shortsPromise = null;

    function buscarShorts(versao) {
        document.getElementById('shortsMeta').textContent = 'Carregando dados de shorts...';
        shortsPromise = (versao ? Promise.resolve(versao) : lerJson('./shorts-meta.json', { cache: 'no-cache' })
            .then(meta => meta.atualizadoEm).catch(() => null))
            .then(data => lerJson(data ? './shorts.json?v=' + encodeURIComponent(data) : './shorts.json'))
            .then(function (payload) {
                dadosShorts = payload.pontos || [];
                shortsAtualizadoEm = payload.atualizadoEm || null;
                shortsCarregado = true;
                popularTickersShorts();
                renderizarShorts();
                mostrarData(document.getElementById('shortsMeta'), shortsAtualizadoEm, 'Dados de shorts · ');
                mostrarData(document.getElementById('shorts-data'), shortsAtualizadoEm, 'Dados de shorts · ');
                if (correlacaoIniciada) carregarCorrelacaoSeAindaNao();
            })
            .catch(function (erro) {
                document.getElementById('shortsMeta').textContent = 'Ainda não há dados de shorts publicados (' + erro + ').';
            }).finally(() => { shortsPromise = null; });
        return shortsPromise;
    }

    // Busca só o arquivo pequeno (shorts-meta.json) pra saber se o shorts.json
    // grande mudou desde a última carga — evita re-baixar/re-parsear o payload
    // inteiro e re-renderizar a tabela toda a cada poll sem necessidade.
    function verificarAtualizacaoShorts() {
        if (shortsPromise) return;
        lerJson('./shorts-meta.json', { cache: 'no-cache' })
            .then(function (meta) {
                if (meta.atualizadoEm && meta.atualizadoEm !== shortsAtualizadoEm) buscarShorts(meta.atualizadoEm);
            })
            .catch(function () { /* falha silenciosa — o próximo poll tenta de novo */ });
    }

    // Garante que a carga de shorts esteja em andamento (ou já concluída) e devolve
    // a promise correspondente — usado tanto pela aba Shorts quanto pelas views de
    // correlação, que precisam esperar essa mesma carga.
    function garantirShortsCarregando() {
        if (!shortsCarregado && !shortsPromise) buscarShorts();
        if (!shortsPollIniciado) {
            shortsPollIniciado = true;
            setInterval(verificarAtualizacaoShorts, 5 * 60 * 1000);
        }
        return shortsPromise || Promise.resolve();
    }

    function carregarShortsSeAindaNao() {
        garantirShortsCarregando();
    }

    function popularTickersShorts() {
        var select = document.getElementById('shortsTicker');
        var atual = select.value;
        var tickers = Array.from(new Set(dadosShorts.map(function (p) { return p.ticker; }))).sort();
        select.replaceChildren(new Option('Todos', ''));
        tickers.forEach(function (t) {
            var opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            select.appendChild(opt);
        });
        select.value = atual;
    }

    // Agrega a série bruta (um ponto por dia por ticker) num resumo por ticker:
    // ponto mais recente + variação semanal/mensal (~5/~21 pregões atrás, aproximação
    // por posição no array já que a fonte não marca fins de semana/feriados) + P/L
    // Short — mesmo princípio das outras views: dado bruto do servidor, métrica
    // calculada aqui no cliente.
    function calcularResumoShorts(dados) {
        var porTicker = {};
        dados.forEach(function (p) {
            if (!porTicker[p.ticker]) porTicker[p.ticker] = [];
            porTicker[p.ticker].push(p);
        });

        var resumo = [];
        Object.keys(porTicker).forEach(function (ticker) {
            var pontos = porTicker[ticker].slice().sort(function (a, b) {
                return a.data < b.data ? 1 : (a.data > b.data ? -1 : 0);
            });
            var atual = pontos[0];
            var semanal = pontos[5] || null;
            var mensal = pontos[21] || null;

            resumo.push({
                ticker: ticker,
                indices: atual.indices || [],
                data: atual.data,
                saldoQtd: atual.saldoQtd,
                precoMedio: atual.precoMedio,
                saldoValor: atual.saldoValor,
                taxaTomadorMed: atual.taxaTomadorMed,
                close: atual.close,
                varSemanal: semanal?.saldoValor ? (atual.saldoValor - semanal.saldoValor) / semanal.saldoValor * 100 : null,
                varMensal: mensal?.saldoValor ? (atual.saldoValor - mensal.saldoValor) / mensal.saldoValor * 100 : null,
                plShort: atual.precoMedio ? (atual.precoMedio - atual.close) / atual.precoMedio * 100 : null,
            });
        });

        return resumo;
    }

    function renderizarShorts() {
        if (!shortsCarregado) return;

        var tickerFiltro = document.getElementById('shortsTicker').value;
        var indiceFiltro = document.getElementById('shortsIndice').value;
        var campo = document.getElementById('shortsOrdenarCampo').value;
        var direcao = document.getElementById('shortsOrdenarDirecao').value;

        var resumo = calcularResumoShorts(dadosShorts);
        var filtrado = resumo.filter(function (r) {
            if (tickerFiltro && r.ticker !== tickerFiltro) return false;
            if (indiceFiltro && r.indices.indexOf(indiceFiltro) === -1) return false;
            return true;
        });

        renderizarGraficosShorts(filtrado);
        filtrado.sort(function (a, b) {
            var va = a[campo], vb = b[campo];
            if (va === null || va === undefined) va = -Infinity;
            if (vb === null || vb === undefined) vb = -Infinity;
            if (va < vb) return direcao === 'asc' ? -1 : 1;
            if (va > vb) return direcao === 'asc' ? 1 : -1;
            return 0;
        });

        var corpo = document.getElementById('corpoShorts');
        corpo.replaceChildren();
        filtrado.forEach(function (r) {
            var tr = document.createElement('tr');
            tr.appendChild(celula(r.ticker));
            tr.appendChild(celula(formatarData(r.data)));
            tr.appendChild(celula(r.saldoQtd.toLocaleString('pt-BR', opcoesInteiro)));
            tr.appendChild(celula(r.precoMedio.toLocaleString('pt-BR', opcoesDecimal)));
            tr.appendChild(celula(r.saldoValor.toLocaleString('pt-BR', opcoesInteiro)));
            tr.appendChild(celula((r.taxaTomadorMed * 100).toLocaleString('pt-BR', opcoesDecimal)));
            tr.appendChild(celula(r.close.toLocaleString('pt-BR', opcoesDecimal)));
            tr.appendChild(celula(r.varSemanal === null ? '-' : r.varSemanal.toLocaleString('pt-BR', opcoesDecimal), classeSinal(r.varSemanal)));
            tr.appendChild(celula(r.varMensal === null ? '-' : r.varMensal.toLocaleString('pt-BR', opcoesDecimal), classeSinal(r.varMensal)));
            tr.appendChild(celula(r.plShort === null ? '-' : r.plShort.toLocaleString('pt-BR', opcoesDecimal), classeSinal(r.plShort)));
            corpo.appendChild(tr);
        });

        document.getElementById('contadorShorts').textContent = filtrado.length + ' de ' + resumo.length + ' tickers com dado de short';
    }

    // ---------- Correlação Insiders × Shorts (Score/Convergência/Divergência/
    // Squeeze/Raio-X) ----------
    // Cruza os dois datasets já carregados (insiders.json + shorts.json)
    // inteiramente no cliente, sem nenhum dado novo do servidor. As duas cargas são
    // independentes uma da outra (arquivos diferentes, publicados em ciclos
    // diferentes) — por isso usa Promise.all pra esperar as duas em paralelo, em vez
    // de encadear uma depois da outra.
    var correlacaoIniciada = false;

    function carregarCorrelacaoSeAindaNao() {
        correlacaoIniciada = true;
        Promise.all([insidersPromise, garantirShortsCarregando()]).then(function () {
            popularTickersRaioX();
            selecionarTickerDoLink();
            renderizarScore();
            renderizarConvergencia();
            renderizarDivergencia();
            renderizarSqueeze();
            renderizarRaioX();
        });
    }

    // Rank "de competição" simplificado (empates não recebem o mesmo tratamento
    // rigoroso do RANK() do Excel/AssignRanks no backend — suficiente pra ordenar
    // estas views no cliente).
    function rankSimples(valores, descendente) {
        var indices = valores.map(function (_, i) { return i; });
        indices.sort(function (a, b) { return descendente ? valores[b] - valores[a] : valores[a] - valores[b]; });
        var ranks = new Array(valores.length);
        indices.forEach(function (idx, pos) { ranks[idx] = pos + 1; });
        return ranks;
    }

    // Combina o líquido de insider (R$, últimos 12 meses — reaproveita
    // agruparPorTicker, já usado em Ranking/Atividade) com a variação mensal do
    // saldo short invertida (short caindo = positivo/bullish — reaproveita
    // calcularResumoShorts, já usado na aba Shorts). Como as unidades são diferentes
    // (R$ vs %), a combinação usa RANKS, não os valores brutos — mesmo princípio do
    // ranking "5 em 1" de FIIs no backend: soma de ranks, menor = maior convicção.
    function calcularCorrelacaoInsiderShort() {
        var dozeMesesAtras = new Date();
        dozeMesesAtras.setMonth(dozeMesesAtras.getMonth() - 12);
        var dataMin = dozeMesesAtras.toISOString().slice(0, 10);

        var gruposInsider = agruparPorTicker(dadosGlobais, dataMin, null);
        var resumoShorts = calcularResumoShorts(dadosShorts);

        var porTickerShort = {};
        resumoShorts.forEach(function (r) { porTickerShort[r.ticker] = r; });

        var combinados = gruposInsider
            .filter(function (g) { return porTickerShort[g.ticker]; })
            .map(function (g) {
                var short = porTickerShort[g.ticker];
                var shortBullish = short.varMensal === null ? 0 : -short.varMensal;
                return {
                    ticker: g.ticker,
                    indices: short.indices,
                    insiderLiquido: g.valorLiquido,
                    shortVarMensal: short.varMensal,
                    shortBullish: shortBullish,
                    taxaTomadorMed: short.taxaTomadorMed,
                    saldoValor: short.saldoValor,
                };
            });

        var rankInsider = rankSimples(combinados.map(function (c) { return c.insiderLiquido; }), true);
        var rankShort = rankSimples(combinados.map(function (c) { return c.shortBullish; }), true);

        combinados.forEach(function (c, i) {
            c.rankInsider = rankInsider[i];
            c.rankShort = rankShort[i];
            c.scoreCombinado = rankInsider[i] + rankShort[i]; // menor = maior convicção de alta combinada
            c.direcaoInsider = c.insiderLiquido > 0 ? 'compra' : (c.insiderLiquido < 0 ? 'venda' : 'neutro');
            c.direcaoShort = c.shortBullish > 0 ? 'queda' : (c.shortBullish < 0 ? 'alta' : 'neutro'); // direção do saldo short
        });

        return combinados;
    }

    function filtrarPorIndiceCorrelacao(lista, idSelectIndice) {
        var el = document.getElementById(idSelectIndice);
        var indice = el ? el.value : '';
        if (!indice) return lista;
        return lista.filter(function (c) { return c.indices.indexOf(indice) !== -1; });
    }

    // ---------- Score de Convicção ----------
    function renderizarScore() {
        if (!correlacaoIniciada || !shortsCarregado) return;

        var direcao = document.getElementById('scoreDirecao').value;
        var topN = parseInt(document.getElementById('scoreTopN').value, 10) || 20;

        var lista = filtrarPorIndiceCorrelacao(calcularCorrelacaoInsiderShort(), 'scoreIndice');
        lista.sort(function (a, b) {
            return direcao === 'alta' ? a.scoreCombinado - b.scoreCombinado : b.scoreCombinado - a.scoreCombinado;
        });
        var top = lista.slice(0, topN);

        var corpo = document.getElementById('corpoScore');
        corpo.replaceChildren();
        top.forEach(function (c, i) {
            var tr = document.createElement('tr');
            tr.appendChild(celula(i + 1));
            tr.appendChild(celula(c.ticker));
            tr.appendChild(celula(c.insiderLiquido.toLocaleString('pt-BR', opcoesInteiro), classeSinal(c.insiderLiquido)));
            tr.appendChild(celula(c.shortVarMensal === null ? '-' : c.shortVarMensal.toLocaleString('pt-BR', opcoesDecimal), classeSinal(c.shortBullish)));
            tr.appendChild(celula(c.scoreCombinado));
            corpo.appendChild(tr);
        });

        document.getElementById('contadorScore').textContent = top.length + ' de ' + lista.length +
            ' tickers com dado de insider e de short nos últimos 12 meses';
    }

    // ---------- Convergência (sinais concordam) ----------
    function renderizarConvergencia() {
        if (!correlacaoIniciada || !shortsCarregado) return;

        var direcaoFiltro = document.getElementById('convergenciaDirecao').value;

        var convergentes = filtrarPorIndiceCorrelacao(calcularCorrelacaoInsiderShort(), 'convergenciaIndice')
            .filter(function (c) {
                return (c.direcaoInsider === 'compra' && c.direcaoShort === 'queda') ||
                       (c.direcaoInsider === 'venda' && c.direcaoShort === 'alta');
            })
            .map(function (c) {
                c.direcaoConvergencia = c.direcaoInsider === 'compra' ? 'alta' : 'baixa';
                return c;
            });

        if (direcaoFiltro) convergentes = convergentes.filter(function (c) { return c.direcaoConvergencia === direcaoFiltro; });
        convergentes.sort(function (a, b) { return a.scoreCombinado - b.scoreCombinado; });

        var corpo = document.getElementById('corpoConvergencia');
        corpo.replaceChildren();
        convergentes.forEach(function (c) {
            var tr = document.createElement('tr');
            var rotulo = c.direcaoConvergencia === 'alta' ? 'Convergência de Alta' : 'Convergência de Baixa';
            tr.appendChild(celula(c.ticker));
            tr.appendChild(celula(rotulo, c.direcaoConvergencia === 'alta' ? 'pos' : 'neg'));
            tr.appendChild(celula(c.insiderLiquido.toLocaleString('pt-BR', opcoesInteiro), classeSinal(c.insiderLiquido)));
            tr.appendChild(celula(c.shortVarMensal === null ? '-' : c.shortVarMensal.toLocaleString('pt-BR', opcoesDecimal), classeSinal(c.shortBullish)));
            corpo.appendChild(tr);
        });

        document.getElementById('contadorConvergencia').textContent = convergentes.length + ' tickers com insider e short apontando na mesma direção';
    }

    // ---------- Divergência (sinais discordam) ----------
    function renderizarDivergencia() {
        if (!correlacaoIniciada || !shortsCarregado) return;

        var divergentes = filtrarPorIndiceCorrelacao(calcularCorrelacaoInsiderShort(), 'divergenciaIndice')
            .filter(function (c) {
                return (c.direcaoInsider === 'compra' && c.direcaoShort === 'alta') ||
                       (c.direcaoInsider === 'venda' && c.direcaoShort === 'queda');
            })
            .map(function (c) {
                c.tipoDivergencia = c.direcaoInsider === 'compra' ? 'Insider compra, short sobe' : 'Insider vende, short cai';
                return c;
            });

        divergentes.sort(function (a, b) { return Math.abs(b.insiderLiquido) - Math.abs(a.insiderLiquido); });

        var corpo = document.getElementById('corpoDivergencia');
        corpo.replaceChildren();
        divergentes.forEach(function (c) {
            var tr = document.createElement('tr');
            tr.appendChild(celula(c.ticker));
            tr.appendChild(celula(c.tipoDivergencia));
            tr.appendChild(celula(c.insiderLiquido.toLocaleString('pt-BR', opcoesInteiro), classeSinal(c.insiderLiquido)));
            tr.appendChild(celula(c.shortVarMensal === null ? '-' : c.shortVarMensal.toLocaleString('pt-BR', opcoesDecimal), classeSinal(c.shortBullish)));
            corpo.appendChild(tr);
        });

        document.getElementById('contadorDivergencia').textContent = divergentes.length + ' tickers com insider e short discordando';
    }

    // ---------- Candidatos a Squeeze ----------
    // Sem % do free float nem Days to Cover (não vêm da série histórica coletada) —
    // usa como proxy de "crowding" a Taxa Tomador Média (custo de aluguel sobe
    // quando o papel fica escasso pra quem quer vender a descoberto), combinada com
    // compra recente de insider.
    function renderizarSqueeze() {
        if (!correlacaoIniciada || !shortsCarregado) return;

        var topN = parseInt(document.getElementById('squeezeTopN').value, 10) || 15;

        var lista = filtrarPorIndiceCorrelacao(calcularCorrelacaoInsiderShort(), 'squeezeIndice')
            .filter(function (c) { return c.direcaoInsider === 'compra'; });

        var rankTaxa = rankSimples(lista.map(function (c) { return c.taxaTomadorMed; }), true);
        lista.forEach(function (c, i) { c.scoreSqueeze = c.rankInsider + rankTaxa[i]; });
        lista.sort(function (a, b) { return a.scoreSqueeze - b.scoreSqueeze; });
        var top = lista.slice(0, topN);

        var corpo = document.getElementById('corpoSqueeze');
        corpo.replaceChildren();
        top.forEach(function (c, i) {
            var tr = document.createElement('tr');
            tr.appendChild(celula(i + 1));
            tr.appendChild(celula(c.ticker));
            tr.appendChild(celula((c.taxaTomadorMed * 100).toLocaleString('pt-BR', opcoesDecimal)));
            tr.appendChild(celula(c.saldoValor.toLocaleString('pt-BR', opcoesInteiro)));
            tr.appendChild(celula(c.insiderLiquido.toLocaleString('pt-BR', opcoesInteiro), 'pos'));
            corpo.appendChild(tr);
        });

        document.getElementById('contadorSqueeze').textContent = top.length + ' de ' + lista.length +
            ' tickers com compra de insider nos últimos 12 meses, ordenados por taxa de aluguel + convicção de insider';
    }

    // ---------- Raio-X por Ticker ----------
    function popularTickersRaioX() {
        var select = document.getElementById('raioxTicker');
        if (!select || select.options.length > 1) return; // popula uma vez só
        var tickersInsider = dadosGlobais.map(function (m) { return m.ticker; });
        var tickersShort = dadosShorts.map(function (p) { return p.ticker; });
        var todos = Array.from(new Set(tickersInsider.concat(tickersShort))).sort();
        todos.forEach(function (t) {
            var opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            select.appendChild(opt);
        });
    }

    function renderizarRaioX() {
        if (!correlacaoIniciada || !shortsCarregado) return;

        var ticker = document.getElementById('raioxTicker').value;

        var movimentos = dadosGlobais.filter(function (m) { return m.ticker === ticker; })
            .slice().sort(function (a, b) { return a.data < b.data ? 1 : -1; });
        var corpoInsider = document.getElementById('corpoRaioxInsider');
        corpoInsider.replaceChildren();
        movimentos.forEach(function (m) {
            var tipo = m.quantidade > 0 ? 'pos' : (m.quantidade < 0 ? 'neg' : 'neutro');
            var tr = document.createElement('tr');
            tr.appendChild(celula(formatarMes(m.data)));
            tr.appendChild(celula(m.quantidade.toLocaleString('pt-BR', opcoesInteiro), tipo));
            tr.appendChild(celula(m.valor.toLocaleString('pt-BR', opcoesInteiro), tipo));
            corpoInsider.appendChild(tr);
        });

        var pontos = dadosShorts.filter(function (p) { return p.ticker === ticker; })
            .slice().sort(function (a, b) { return a.data < b.data ? 1 : -1; })
            .slice(0, 30);
        var corpoShort = document.getElementById('corpoRaioxShort');
        corpoShort.replaceChildren();
        pontos.forEach(function (p) {
            var tr = document.createElement('tr');
            tr.appendChild(celula(formatarData(p.data)));
            tr.appendChild(celula(p.saldoQtd.toLocaleString('pt-BR', opcoesInteiro)));
            tr.appendChild(celula(p.saldoValor.toLocaleString('pt-BR', opcoesInteiro)));
            tr.appendChild(celula(p.close.toLocaleString('pt-BR', opcoesDecimal)));
            corpoShort.appendChild(tr);
        });

        renderizarVisualRaioX(ticker, movimentos, pontos);
        document.getElementById('contadorRaiox').textContent = ticker
            ? (movimentos.length + ' movimentos de insider · ' + pontos.length + ' dias de short (mais recentes)')
            : 'Selecione um ticker.';
    }
    function itemVisual(tag, text, classe) {
        const el = document.createElement(tag);
        if (text != null) el.textContent = text;
        if (classe) el.className = classe;
        return el;
    }

    function selecionarTickerDoLink() {
        const ticker = location.hash.match(/^#raiox=([A-Z0-9]+)$/i)?.[1].toUpperCase();
        const select = document.getElementById('raioxTicker');
        if (ticker && [...select.options].some(option => option.value === ticker)) select.value = ticker;
    }

    function renderizarBarrasRanking(grupos, campo) {
        const valor = campo === 'valorLiquido' ? reaisCompactos : compacto;
        const ordenar = sinal => grupos.filter(g => Math.sign(g[campo]) === sinal)
            .sort((a, b) => sinal * (b[campo] - a[campo])).slice(0, 5);
        const vendas = ordenar(-1);
        const compras = ordenar(1);
        const max = Math.max(1, ...[...vendas, ...compras].map(g => Math.abs(g[campo])));
        const linhas = [...vendas, ...compras].map(g => {
            const row = itemVisual('div', null, 'rank-row');
            const track = itemVisual('span', null, 'rank-track');
            const sinal = g[campo] > 0 ? 'pos' : 'neg';
            const bar = itemVisual('span', null, 'rank-bar ' + sinal);
            bar.style.width = 50 * Math.abs(g[campo]) / max + '%';
            track.setAttribute('aria-hidden', 'true');
            track.append(bar);
            row.append(itemVisual('strong', g.ticker), track, itemVisual('span', valor.format(g[campo]), sinal));
            return row;
        });
        document.getElementById('ranking-grafico').replaceChildren(
            itemVisual('small', 'Vendas líquidas ← 0 → Compras líquidas'),
            ...(linhas.length ? linhas : [itemVisual('p', 'Sem movimentos no período.')]));
    }

    function cartaoResumo(titulo, linhas, link, rotulo) {
        const card = itemVisual('article', null, 'mini-card');
        card.append(itemVisual('strong', titulo));
        for (const linha of linhas.length ? linhas : ['Sem dado no período']) card.append(itemVisual('span', linha));
        const atalho = itemVisual('a', rotulo);
        atalho.href = link;
        card.append(atalho);
        return card;
    }

    const resumoAcoes = document.getElementById('acoes-resumo');
    resumoAcoes.textContent = 'Carregando destaques…';
    Promise.all([lerJson('../../resumo.json'), insidersPromise]).then(([{ insiders, shorts }]) => {
        const mes = insiders.mesMovimento ? formatarMes(insiders.mesMovimento + '-01') : 'sem movimento';
        const sequencias = [...calcularSequencias(dadosGlobais, 'compra'), ...calcularSequencias(dadosGlobais, 'venda')]
            .sort((a, b) => b.meses - a.meses).slice(0, 3);
        resumoAcoes.replaceChildren(
            cartaoResumo('Compras · ' + mes, insiders.compras.map(r => `${r.ticker} · ${reaisCompactos.format(r.valor)}`), '#ranking=compra', 'Abrir ranking'),
            cartaoResumo('Vendas · ' + mes, insiders.vendas.map(r => `${r.ticker} · ${reaisCompactos.format(r.valor)}`), '#ranking=venda', 'Abrir ranking'),
            cartaoResumo('Sequências em andamento', sequencias.map(r => `${r.ticker} · ${r.meses} ${r.meses === 1 ? 'mês' : 'meses'}`), '#sequencias', 'Ver sequências'),
            cartaoResumo('Mudanças no short', shorts.variacoes.map(r => `${r.ticker} · ${r.delta > 0 ? '▲' : r.delta < 0 ? '▼' : ''} ${compacto.format(Math.abs(r.delta))} ações`), '#shorts', 'Ver posição vendida'));
    }).catch(() => { resumoAcoes.textContent = 'Destaques indisponíveis. O menu Explorar abre as tabelas.'; });

    function eixoQuadrantes(valores, exibir) {
        const absolutos = valores.map(Math.abs).filter(v => v > 0).sort((a, b) => a - b);
        if (!absolutos.length) return { posicao: () => 50, marcas: [0], exibir };
        const max = absolutos.at(-1);
        const centro = absolutos[Math.floor(absolutos.length / 2)];
        const amplitude = Math.asinh(max / centro);
        const posicao = valor => 50 + 47 * Math.asinh(valor / centro) / amplitude;
        const potencia = 10 ** Math.floor(Math.log10(centro));
        const marcas = [potencia / 10, potencia, potencia * 10, potencia * 100, potencia * 1000];
        const visiveis = [];
        let anterior = 50;
        for (const marca of marcas) {
            const pos = posicao(marca);
            if (marca <= max && pos - anterior >= 12 && pos <= 97) {
                visiveis.push(marca);
                anterior = pos;
            }
        }
        if (!visiveis.length) visiveis.push(max);
        return { posicao, marcas: [...visiveis.map(v => -v).reverse(), 0, ...visiveis], exibir };
    }

    function renderizarQuadrantes() {
        const container = document.getElementById('quadrantes');
        const linhas = calcularCorrelacaoInsiderShort().filter(r => Number.isFinite(r.shortVarMensal));
        if (!linhas.length) {
            container.textContent = 'Sem dados combinados disponíveis.';
            return;
        }
        const x = eixoQuadrantes(linhas.map(r => r.insiderLiquido), v => compacto.format(v));
        const y = eixoQuadrantes(linhas.map(r => r.shortVarMensal), v => numero.format(v) + '%');
        const plot = itemVisual('div', null, 'scatter quadrantes-plot');
        const legenda = itemVisual('div', null, 'quadrantes-legenda');
        const detalhe = itemVisual('p', 'Passe o mouse ou use Tab para ver os valores de um ticker.', 'quadrantes-detalhe');
        const quadrantes = [
            ['Venda · short sobe', 'venda-sobe'], ['Compra · short sobe', 'compra-sobe'],
            ['Venda · short cai', 'venda-cai'], ['Compra · short cai', 'compra-cai'],
        ];
        const totais = new Map(quadrantes.map(([, chave]) => [chave, 0]));
        for (const [axis, escala] of [['x', x], ['y', y]]) {
            for (const marca of escala.marcas) {
                const guia = itemVisual('div', null, `scatter-grid-${axis}${marca === 0 ? ' guia-zero' : ''}`);
                guia.style[axis === 'x' ? 'left' : 'bottom'] = escala.posicao(marca) + '%';
                guia.append(itemVisual('span', escala.exibir(marca), 'scatter-axis-label'));
                plot.append(guia);
            }
        }
        for (const row of linhas) {
            const ponto = itemVisual('a', null, 'scatter-point');
            ponto.href = '#raiox=' + encodeURIComponent(row.ticker);
            ponto.title = `${row.ticker} · Insiders: ${reais.format(row.insiderLiquido)} · Short: ${numero.format(row.shortVarMensal)}%`;
            ponto.setAttribute('aria-label', ponto.title);
            ponto.style.left = x.posicao(row.insiderLiquido) + '%';
            ponto.style.bottom = y.posicao(row.shortVarMensal) + '%';
            const chave = row.insiderLiquido && row.shortVarMensal
                ? `${row.insiderLiquido > 0 ? 'compra' : 'venda'}-${row.shortVarMensal > 0 ? 'sobe' : 'cai'}`
                : 'neutro';
            if (totais.has(chave)) totais.set(chave, totais.get(chave) + 1);
            ponto.dataset.quadrante = chave;
            const mostrar = () => { detalhe.textContent = ponto.title; };
            ponto.addEventListener('pointerenter', mostrar);
            ponto.addEventListener('focus', mostrar);
            plot.append(ponto);
        }
        const neutros = linhas.length - [...totais.values()].reduce((a, b) => a + b, 0);
        for (const [nome, chave] of [...quadrantes, ['Sobre os eixos', 'neutro']]) {
            const item = itemVisual('span', `${nome} · ${totais.get(chave) ?? neutros}`);
            item.dataset.quadrante = chave;
            legenda.append(item);
        }
        container.replaceChildren(itemVisual('small', 'Variação mensal da posição vendida (%)'), plot,
            itemVisual('small', 'Saldo de insiders (R$)', 'scatter-unit scatter-unit-x'), legenda, detalhe,
            itemVisual('small', `${linhas.length} tickers · escala simétrica que amplia a região perto de zero. Os valores nas marcas são reais.`));
    }

    document.getElementById('carregar-quadrantes').addEventListener('click', async () => {
        const button = document.getElementById('carregar-quadrantes');
        button.disabled = true;
        await Promise.all([insidersPromise, garantirShortsCarregando()]);
        renderizarQuadrantes();
        if (shortsCarregado) button.hidden = true;
        else button.disabled = false;
    });

    function renderizarVisualRaioX(ticker, movimentos, pontos) {
        const target = document.getElementById('raiox-visual');
        target.hidden = !ticker;
        if (!ticker) {
            target.replaceChildren();
            return;
        }
        const ultimo = pontos[0];
        const faixa = itemVisual('div', null, 'ticker-months');
        const ultimoMes = movimentos[0]?.data || ultimo?.data;
        if (ultimoMes) {
            const ancora = new Date(ultimoMes.slice(0, 7) + '-01T00:00:00Z');
            const meses = new Map(movimentos.map(m => [m.data.slice(0, 7), m.valor]));
            for (let i = 11; i >= 0; i--) {
                const data = new Date(Date.UTC(ancora.getUTCFullYear(), ancora.getUTCMonth() - i, 1)).toISOString().slice(0, 10);
                const valor = meses.get(data.slice(0, 7));
                const tipo = valor > 0 ? '▲' : valor < 0 ? '▼' : valor === 0 ? '·' : '–';
                const mes = itemVisual('span', tipo, classeSinal(valor));
                mes.title = `${formatarMes(data)} · ${valor === undefined ? 'sem cobertura' : reaisCompactos.format(valor)}`;
                mes.setAttribute('aria-label', mes.title);
                faixa.append(mes);
            }
        }
        target.replaceChildren(itemVisual('h2', ticker),
            itemVisual('p', ultimo ? `${reais.format(ultimo.close)} em ${formatarData(ultimo.data)} · ${(ultimo.indices || []).join(' / ')} · ${compacto.format(ultimo.saldoQtd)} ações vendidas a descoberto` : 'Sem posição vendida disponível.'),
            itemVisual('h3', 'Insiders · últimos 12 meses disponíveis'), faixa);
        if (pontos.length) {
            const serie = [...pontos].reverse();
            const corte = new Date(ultimo.data + 'T00:00:00Z');
            corte.setUTCMonth(corte.getUTCMonth() - 11, 1);
            const mensais = movimentos.filter(m => m.data >= corte.toISOString().slice(0, 10) && m.data <= ultimo.data);
            target.append(itemVisual('h3', 'Insiders e posição vendida'),
                graficoRaioX(mensais, serie, corte.getTime()),
                itemVisual('small', `${formatarMes(corte.toISOString().slice(0, 10))} a ${formatarData(ultimo.data)} · barras: saldo de insiders em R$ · linha azul: ações vendidas nas últimas observações · escalas independentes`));
        }
    }

    function graficoRaioX(movimentos, shorts, inicio) {
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 500 110');
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', 'Saldo mensal de insiders e série recente de posição vendida, com eixo temporal comum');
        svg.classList.add('line-chart');
        const fim = Date.parse(shorts.at(-1).data);
        const x = data => 8 + 484 * (Date.parse(data) - inicio) / Math.max(1, fim - inicio);
        const zero = document.createElementNS(ns, 'line');
        for (const [attr, valor] of Object.entries({ x1: 5, x2: 495, y1: 55, y2: 55, stroke: 'var(--line)' })) zero.setAttribute(attr, valor);
        svg.append(zero);
        const maxValor = Math.max(1, ...movimentos.map(m => Math.abs(m.valor)));
        for (const movimento of movimentos) {
            const altura = 50 * Math.abs(movimento.valor) / maxValor;
            const barra = document.createElementNS(ns, 'rect');
            for (const [attr, valor] of Object.entries({ x: x(movimento.data) - 4, y: movimento.valor >= 0 ? 55 - altura : 55,
                height: altura, width: 8, fill: movimento.valor >= 0 ? 'var(--green)' : 'var(--red)' })) barra.setAttribute(attr, valor);
            svg.append(barra);
        }
        const valores = shorts.map(p => p.saldoQtd);
        const min = Math.min(...valores);
        const amplitude = Math.max(...valores) - min || 1;
        const linha = document.createElementNS(ns, 'polyline');
        linha.setAttribute('points', shorts.map(p => `${x(p.data)},${105 - 100 * (p.saldoQtd - min) / amplitude}`).join(' '));
        linha.setAttribute('fill', 'none');
        linha.setAttribute('stroke', 'var(--accent)');
        linha.setAttribute('stroke-width', '2');
        svg.append(linha);
        return svg;
    }

    function graficoSeries(pontos, titulo, series) {
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 500 110');
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', titulo);
        svg.classList.add('line-chart');
        for (const [campo, cor] of series) {
            const valores = pontos.map(p => p[campo]);
            const min = Math.min(...valores);
            const amplitude = Math.max(...valores) - min || 1;
            const linha = document.createElementNS(ns, 'polyline');
            linha.setAttribute('points', valores.map((v, i) =>
                `${5 + 490 * i / Math.max(1, valores.length - 1)},${105 - (v - min) * 100 / amplitude}`).join(' '));
            linha.setAttribute('fill', 'none');
            linha.setAttribute('stroke', cor);
            linha.setAttribute('stroke-width', '2');
            linha.setAttribute('vector-effect', 'non-scaling-stroke');
            svg.append(linha);
        }
        return svg;
    }

    function renderizarGraficosShorts(resumo) {
        const destaques = resumo.filter(r => Number.isFinite(r.varSemanal))
            .sort((a, b) => Math.abs(b.varSemanal) - Math.abs(a.varSemanal)).slice(0, 3);
        const cartoes = destaques.map(r => {
            const pontos = dadosShorts.filter(p => p.ticker === r.ticker)
                .sort((a, b) => b.data.localeCompare(a.data)).slice(0, 30).reverse();
            const card = itemVisual('article', null, 'mini-card');
            const link = itemVisual('a', r.ticker + ' · Raio-X');
            link.href = '#raiox=' + encodeURIComponent(r.ticker);
            card.append(link, itemVisual('small', `Valor vendido · ${r.varSemanal > 0 ? '+' : ''}${numero.format(r.varSemanal)}% em 5 pregões`),
                graficoSeries(pontos, 'Ações vendidas e cotação de ' + r.ticker, [['saldoQtd', 'var(--accent)'], ['close', 'var(--amber)']]),
                itemVisual('small', 'Azul: ações vendidas · âmbar: cotação'));
            return card;
        });
        document.getElementById('shorts-graficos').replaceChildren(...cartoes);
    }

    function abrirViewDaUrl() {
        var view = location.hash.slice(1).split('=')[0];
        var exists = Array.from(document.querySelectorAll('.tab-btn')).some(function (btn) {
            return btn.dataset.view === view;
        });
        trocarView(exists ? view : 'painel');
    }
    window.addEventListener('hashchange', abrirViewDaUrl);
    abrirViewDaUrl();
