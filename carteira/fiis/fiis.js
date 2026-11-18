const campo = id => document.getElementById(id);
const colunas = ['ticker', 'segmento', 'cotacao', 'liquidez', 'rankLiquidez', 'pvp', 'rankPvp',
    'dy', 'rankDy', 'imoveis', 'rankImoveis', 'vacancia', 'rankVacancia', 'sum'];
const nomes = ['Ticker', 'Segmento', 'Cotação', 'Liquidez', 'Rank liquidez', 'P/VP', 'Rank P/VP',
    'Dividend yield', 'Rank DY', 'Imóveis', 'Rank imóveis', 'Vacância', 'Rank vacância', 'Nota 5 em 1'];
const fundos = [];
const cores = ['#478bd5', '#2b9e78', '#9773d1', '#c66c4b', '#ad8129', '#409da4', '#c4678e'];
const janelaGrafico = { pvp: 2.5, dy: 25 };
let segmentos = [];
let segmentoSelecionado = '';

function elemento(tag, texto, classe) {
    const el = document.createElement(tag);
    if (texto != null) el.textContent = texto;
    if (classe) el.className = classe;
    return el;
}

function cor(segmento) {
    return cores[segmentos.indexOf(segmento) % cores.length];
}

function buscarTicker(ticker) {
    campo('buscarFii').value = ticker;
    segmentoSelecionado = '';
    aplicarFiltros();
    const match = fundos.find(({ dado, linha }) => dado.ticker === ticker && !linha.hidden);
    if (match) {
        match.linha.querySelector('button').focus({ preventScroll: true });
        match.linha.scrollIntoView({ block: 'center' });
        return;
    }
    campo('contador').scrollIntoView({ block: 'center' });
}

function abrirPonto(fundo) {
    for (const [id, valor, minimo] of [['pvpMin', fundo.pvp, true], ['pvpMax', fundo.pvp, false],
        ['dyMin', fundo.dy, true], ['dyMax', fundo.dy, false], ['imoveisMin', fundo.imoveis, true]]) {
        const campoFiltro = campo(id);
        const atual = campoFiltro.valueAsNumber;
        if (minimo ? valor < atual : valor > atual) {
            campoFiltro.value = valor;
            campoFiltro.dispatchEvent(new Event('input'));
        }
    }
    buscarTicker(fundo.ticker);
}

function aplicarFiltros() {
    const limite = id => Number.isNaN(campo(id).valueAsNumber) ? null : campo(id).valueAsNumber;
    const faixa = [limite('pvpMin'), limite('pvpMax'), limite('dyMin'), limite('dyMax')];
    const [pMin, pMax, dMin, dMax] = faixa;
    const iMin = limite('imoveisMin');
    const segmento = segmentoSelecionado;
    campo('segmentos').querySelectorAll('button').forEach(button => {
        const ativo = button.dataset.segmento === segmento;
        button.classList.toggle('ativo', ativo);
        button.setAttribute('aria-pressed', String(ativo));
    });
    const ticker = campo('buscarFii').value.trim().toUpperCase();
    const lideres = new Map();
    let total = 0;
    for (const { dado, linha } of fundos) {
        const { pvp, dy, imoveis, sum } = dado;
        const passa = (pMin === null || pvp >= pMin) && (pMax === null || pvp <= pMax) &&
            (dMin === null || dy >= dMin) && (dMax === null || dy <= dMax) && (iMin === null || imoveis >= iMin);
        const visivel = passa && (!segmento || dado.segmento === segmento) && dado.ticker.includes(ticker);
        linha.hidden = !visivel;
        if (visivel) total++;
        if (passa && (!lideres.has(dado.segmento) || sum < lideres.get(dado.segmento).sum)) lideres.set(dado.segmento, dado);
    }
    campo('contador').textContent = `${total} de ${fundos.length} FIIs exibidos`;
    const cards = segmentos.filter(seg => lideres.has(seg)).map(seg => {
        const fundo = lideres.get(seg);
        const card = elemento('button', null, 'mini-card');
        card.type = 'button';
        card.style.setProperty('--segmento', cor(seg));
        card.append(elemento('small', seg), elemento('strong', fundo.ticker),
            elemento('span', `P/VP ${numero.format(fundo.pvp)} · DY ${numero.format(fundo.dy)}%`),
            elemento('small', `${fundo.imoveis} imóveis · vacância ${fundo.vacancia}`));
        card.addEventListener('click', () => buscarTicker(fundo.ticker));
        return card;
    });
    campo('fii-lideres').replaceChildren(...(cards.length ? cards : [elemento('p', 'Nenhum líder para estes filtros.')]));
    dispersao(faixa, segmento);
}

function dispersao([pMin, pMax, dMin, dMax], segmento) {
    const area = campo('fii-dispersao');
    const completa = campo('fii-escala-completa').checked;
    const validos = fundos.map(item => item.dado).filter(f => (!segmento || f.segmento === segmento)
        && Number.isFinite(f.pvp) && f.pvp >= 0 && Number.isFinite(f.dy) && f.dy >= 0);
    const maxPvp = completa ? Math.max(janelaGrafico.pvp, ...validos.map(f => f.pvp)) : janelaGrafico.pvp;
    const maxDy = completa ? Math.max(janelaGrafico.dy, ...validos.map(f => f.dy)) : janelaGrafico.dy;
    const visiveis = validos.filter(f => f.pvp <= maxPvp && f.dy <= maxDy);
    const transformar = completa ? Math.log1p : v => v;
    const proporcao = (v, max) => 100 * transformar(Math.max(0, Math.min(v, max))) / transformar(max);
    const x = p => proporcao(p, maxPvp);
    const y = d => proporcao(d, maxDy);
    const plot = elemento('div', null, 'scatter');
    const xTicks = completa ? [0, 1, 2.5, 10, 100, 1000, 10000] : [0, .5, 1, 1.5, 2];
    const yTicks = completa ? [0, 5, 15, 30, 60] : [0, 5, 10, 15, 20];
    for (const [ticks, max, scale, axis] of [[xTicks, maxPvp, x, 'x'], [yTicks, maxDy, y, 'y']]) {
        let anterior = -100;
        for (const valor of [...ticks.filter(v => scale(v) <= 85 && v < max), max]) {
            const pos = scale(valor);
            if (pos - anterior < (axis === 'x' ? 9 : 11)) continue;
            anterior = pos;
            const guia = elemento('div', null, 'scatter-grid-' + axis);
            guia.style[axis === 'x' ? 'left' : 'bottom'] = pos + '%';
            const texto = axis === 'y' ? numero.format(valor) + '%' : (valor >= 1000 ? compacto : numero).format(valor);
            guia.append(elemento('span', texto, 'scatter-axis-label'));
            plot.append(guia);
        }
    }
    const zona = elemento('div', null, 'scatter-zone');
    const left = x(pMin ?? 0);
    const bottom = y(dMin ?? 0);
    const largura = x(pMax ?? maxPvp) - left;
    const altura = y(dMax ?? maxDy) - bottom;
    if (largura > 0 && altura > 0) {
        Object.assign(zona.style, { left: left + '%', bottom: bottom + '%', width: largura + '%', height: altura + '%' });
        plot.append(zona);
    }
    const selic = elemento('div', null, 'scatter-selic');
    const taxa = Number(campo('dyMax').defaultValue);
    selic.style.bottom = y(taxa) + '%';
    selic.title = 'Referência Selic do ranking';
    if (taxa <= maxDy) plot.append(selic);
    for (const fundo of visiveis) {
        const point = elemento('button', null, 'scatter-point');
        point.type = 'button';
        point.tabIndex = -1;
        point.title = `${fundo.ticker} · P/VP ${numero.format(fundo.pvp)} · DY ${numero.format(fundo.dy)}%`;
        point.setAttribute('aria-label', point.title);
        if (fundo.pvp >= (pMin ?? 0) && fundo.pvp <= (pMax ?? Infinity) &&
            fundo.dy >= (dMin ?? 0) && fundo.dy <= (dMax ?? Infinity)) point.classList.add('in-range');
        const liquidez = Number(fundo.liquidez.replaceAll('.', '').replace(',', '.'));
        Object.assign(point.style, { left: x(fundo.pvp) + '%', bottom: y(fundo.dy) + '%', background: cor(fundo.segmento) });
        point.style.setProperty('--size', (4 + .5 * Math.min(8, Math.log10(Math.max(1, liquidez || 1)))) + 'px');
        point.addEventListener('click', () => abrirPonto(fundo));
        plot.append(point);
    }
    const fora = validos.length - visiveis.length;
    campo('fii-escala-resumo').textContent = completa
        ? `${visiveis.length} fundos · escala logarítmica com zero nos dois eixos`
        : `${visiveis.length} fundos no recorte · ${fora} fora da escala`;
    area.replaceChildren(elemento('small', 'Dividend yield (%)', 'scatter-unit'), plot,
        elemento('small', 'P/VP', 'scatter-unit scatter-unit-x'));
}

function aplicarVisibilidadeRanks() {
    campo('tabelaFiis').classList.toggle('ocultar-ranks', campo('ocultarRanks').checked);
}

function prepararFaixa(container, dados, chave, minId, maxId, unidade) {
    const valores = dados.map(dado => dado[chave]).filter(valor => Number.isFinite(valor) && valor >= 0);
    const max = Math.max(1, Number(campo(maxId).value), Math.ceil(Math.max(...valores)));
    const foco = Math.min(max, janelaGrafico[chave]);
    const corte = max === foco ? 1 : .8;
    const cauda = Math.log(max / foco);
    const escala = v => v <= foco ? corte * v / foco : corte + (1 - corte) * Math.log(v / foco) / cauda;
    const histograma = elemento('div', null, 'histogram');
    histograma.setAttribute('aria-hidden', 'true');
    const bins = Array(24).fill(0);
    for (const valor of valores) bins[Math.min(bins.length - 1, Math.floor(escala(valor) * bins.length))]++;
    const pico = Math.max(1, ...bins);
    for (const n of bins) {
        const barra = elemento('span');
        barra.style.height = 100 * n / pico + '%';
        histograma.append(barra);
    }
    if (chave === 'dy') {
        const selic = elemento('span', null, 'histogram-selic');
        selic.style.left = escala(Number(campo(maxId).value)) * 100 + '%';
        selic.title = 'Referência Selic';
        histograma.append(selic);
    }
    const ranges = [[minId, 'mínimo'], [maxId, 'máximo']].map(([id, ponta]) => {
        const input = campo(id);
        const slider = elemento('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '1000';
        slider.step = '1';
        slider.setAttribute('aria-label', `${unidade} ${ponta}`);
        const sincronizar = () => {
            const valor = input.value === '' ? (id === minId ? 0 : max) : Number(input.value);
            slider.value = Math.round(1000 * escala(Math.max(0, Math.min(max, valor))));
            slider.setAttribute('aria-valuetext', input.value === '' ? 'Sem limite' : numero.format(valor));
        };
        slider.addEventListener('input', () => {
            const pos = Number(slider.value) / 1000;
            const valor = pos <= corte ? foco * pos / corte : foco * Math.exp(cauda * (pos - corte) / (1 - corte));
            input.value = Number(valor.toFixed(2));
            slider.setAttribute('aria-valuetext', numero.format(valor));
            aplicarFiltros();
        });
        input.addEventListener('input', sincronizar);
        sincronizar();
        return slider;
    });
    campo(container).append(histograma, ...ranges);
}

lerJson('./fiis.json').then(({ atualizadoEm, filtros, destaque, fundos: dados }) => {
    mostrarData(campo('fiis-data'), atualizadoEm, 'Dados de FIIs · ');
    for (const [id, valor] of Object.entries(filtros)) campo(id).defaultValue = valor;
    segmentos = [...new Set(dados.map(f => f.segmento))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    for (const seg of ['', ...segmentos]) {
        const button = elemento('button', seg || 'Todos', 'tab-btn');
        button.type = 'button';
        button.dataset.segmento = seg;
        if (seg) button.style.setProperty('--segmento', cor(seg));
        button.addEventListener('click', () => {
            segmentoSelecionado = seg;
            aplicarFiltros();
        });
        campo('segmentos').append(button);
    }
    prepararFaixa('faixa-pvp', dados, 'pvp', 'pvpMin', 'pvpMax', 'P/VP');
    prepararFaixa('faixa-dy', dados, 'dy', 'dyMin', 'dyMax', 'Dividend yield');
    campo('fii-escala-completa').addEventListener('change', aplicarFiltros);
    const corpo = campo('tabelaFiis').tBodies[0];
    const fragmento = document.createDocumentFragment();
    const ordenados = [...dados].sort((a, b) => a.sum - b.sum);
    ordenados.forEach((dado, index) => {
        const linha = elemento('tr');
        for (const chave of ['pvp', 'dy', 'imoveis', 'segmento', 'sum']) linha.dataset[chave] = dado[chave];
        colunas.forEach((chave, i) => {
            let valor = dado[chave];
            if (chave === 'liquidez') {
                const n = Number(valor.replaceAll('.', '').replace(',', '.'));
                if (Number.isFinite(n)) valor = reaisCompactos.format(n) + '/dia';
            }
            if (chave === 'pvp') valor = numero.format(valor);
            if (chave === 'dy') valor = numero.format(valor) + '%';
            if (chave === 'sum') valor = '#' + (index + 1);
            const celula = elemento('td', valor, chave.startsWith('rank') ? 'rank rank-col' : chave === 'sum' ? 'sum' : '');
            celula.dataset.label = nomes[i];
            if (chave === 'ticker') {
                const toggle = elemento('button', valor, 'table-detail');
                toggle.type = 'button';
                toggle.setAttribute('aria-expanded', 'false');
                const info = elemento('small', `Cotação ${dado.cotacao} · ${dado.imoveis} imóveis · Vacância ${dado.vacancia} · Soma dos ranks ${dado.sum}`, 'fii-detail');
                info.hidden = true;
                toggle.addEventListener('click', () => {
                    const expandido = linha.classList.toggle('expandido');
                    toggle.setAttribute('aria-expanded', String(expandido));
                    info.hidden = !expandido;
                });
                celula.classList.add('detail-cell');
                celula.replaceChildren(toggle, info);
            }
            if (['pvp', 'dy', 'vacancia'].includes(chave)) {
                const medido = chave === 'vacancia' ? Number(dado.vacancia.replace('%', '').replace(',', '.')) : dado[chave];
                if (Number.isFinite(medido) && medido >= 0) {
                    celula.classList.add('metric-cell');
                    const escala = chave === 'pvp' ? 2 : chave === 'dy' ? 20 : 100;
                    celula.style.setProperty('--metric', Math.min(100, 100 * medido / escala) + '%');
                }
            }
            if (chave === 'sum') celula.title = 'Soma dos ranks: ' + dado.sum;
            linha.append(celula);
        });
        fragmento.append(linha);
        fundos.push({ dado, linha });
    });
    corpo.append(fragmento);
    const card = campo('fii-destaque');
    const sinal = destaque.variacao >= 0;
    card.replaceChildren(elemento('small', 'Destaque da atualização'), elemento('strong', destaque.ticker),
        elemento('span', `${sinal ? '▲' : '▼'} ${numero.format(Math.abs(destaque.variacao))}%`, sinal ? 'pos' : 'neg'),
        elemento('span', `${reais.format(destaque.anterior)} → ${reais.format(destaque.atual)} · ${destaque.segmento}`));
    card.hidden = false;
    aplicarVisibilidadeRanks();
    aplicarFiltros();
}).catch(() => {
    campo('fiis-data').textContent = location.protocol === 'file:' ? 'Abra pelo servidor local para carregar os FIIs.' : 'Dados de FIIs indisponíveis.';
});
