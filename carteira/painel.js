const get = id => document.getElementById(id);
const mes = value => value ? `${value.slice(5)}/${value.slice(0, 4)}` : '';
const dia = value => `${value.slice(8, 10)}/${value.slice(5, 7)}`;

function addItem(list, name, detail, classe = '') {
    const row = document.createElement('li');
    const title = document.createElement('strong');
    const description = document.createElement('small');
    title.textContent = name;
    description.textContent = detail;
    description.className = classe;
    row.append(title, description);
    get(list).append(row);
}

function desenhar(canvas, serie) {
    const ctx = canvas.getContext('2d');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.scale(dpr, dpr);
    const values = serie.map(point => point.saldoQtd);
    const min = Math.min(...values);
    const max = Math.max(...values);
    ctx.beginPath();
    values.forEach((value, index) => {
        const x = 5 + index * (width - 10) / Math.max(values.length - 1, 1);
        const y = height - 6 - ((value - min) / (max - min || 1)) * (height - 12);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = getComputedStyle(canvas).getPropertyValue('--accent').trim();
    ctx.lineWidth = 2;
    ctx.stroke();
}

lerJson('./resumo.json').then(({ fiis, insiders, shorts }) => {
    for (const [fonte, dados] of Object.entries({ fiis, insiders, shorts })) mostrarData(get('data-' + fonte), dados.atualizadoEm);
    for (const fundo of fiis.lideres) addItem('lista-fiis', fundo.ticker,
        `${fundo.segmento} · P/VP ${numero.format(fundo.pvp)} · DY ${numero.format(fundo.dy)}%`);
    if (!fiis.lideres.length) get('resumo-fiis').textContent = 'Nenhum líder para os filtros padrão.';

    let texto = insiders.mesMovimento ? `Último mês com movimento · ${mes(insiders.mesMovimento)}` : 'Sem movimento registrado.';
    if (insiders.mesMaisRecente && insiders.mesMaisRecente !== insiders.mesMovimento) {
        texto += ` · sem movimento registrado em ${mes(insiders.mesMaisRecente)}`;
    }
    get('resumo-insiders').textContent = texto;
    for (const row of insiders.movimentos) addItem('lista-insiders', row.ticker,
        `${row.valor > 0 ? '▲ Compra líquida' : '▼ Venda líquida'} · ${reaisCompactos.format(Math.abs(row.valor))}`,
        row.valor > 0 ? 'pos' : 'neg');

    const { ticker, serie } = shorts;
    const first = serie[0];
    const last = serie.at(-1);
    if (!last) {
        get('resumo-shorts').textContent = 'Nenhuma série disponível.';
        return;
    }
    const delta = first.saldoQtd ? 100 * (last.saldoQtd - first.saldoQtd) / first.saldoQtd : null;
    const summary = `${ticker} · ${compacto.format(last.saldoQtd)} de ações vendidas a descoberto em ${dia(last.data)}`;
    get('resumo-shorts').textContent = summary;
    const quantidades = serie.map(p => p.saldoQtd);
    get('escala-shorts').textContent = `Escala: ${compacto.format(Math.min(...quantidades))} a ${compacto.format(Math.max(...quantidades))} ações`;
    get('periodo-shorts').textContent = `${dia(first.data)} a ${dia(last.data)} · ${delta === null ? 'variação indisponível' :
        `${delta > 0 ? '▲ ' : delta < 0 ? '▼ ' : ''}${numero.format(Math.abs(delta))}%`}`;
    if (delta) get('periodo-shorts').classList.add(delta > 0 ? 'pos' : 'neg');
    get('link-raiox').href += '=' + encodeURIComponent(ticker);
    get('link-raiox').textContent = `Abrir Raio-X de ${ticker}`;
    const canvas = get('grafico-shorts');
    canvas.setAttribute('aria-label', `${summary}. ${get('periodo-shorts').textContent}.`);
    canvas.hidden = false;
    desenhar(canvas, serie);
    new ResizeObserver(() => desenhar(canvas, serie)).observe(canvas);
}).catch(() => {
    for (const fonte of ['fiis', 'insiders', 'shorts']) {
        mostrarData(get('data-' + fonte));
        get('resumo-' + fonte).textContent = location.protocol === 'file:'
            ? 'Abra pelo servidor local para carregar a prévia.' : 'Prévia indisponível.';
    }
});
