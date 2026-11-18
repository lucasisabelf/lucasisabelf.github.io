const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const compacto = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });
const reais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const reaisCompactos = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 });
const fuso = 'America/Sao_Paulo';

async function lerJson(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

function mostrarData(elemento, valor, prefixo = '') {
    const data = new Date(valor ?? NaN);
    if (!Number.isFinite(data.getTime())) {
        elemento.textContent = prefixo + 'Data indisponível';
        return;
    }
    const dias = Math.max(0, Math.floor((Date.now() - data.getTime()) / 86400000));
    const time = document.createElement('time');
    time.dateTime = data.toISOString();
    time.textContent = data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: fuso });
    elemento.replaceChildren(prefixo, time, dias ? ` · há ${dias} ${dias === 1 ? 'dia' : 'dias'}` : '');
    elemento.classList.toggle('old', dias >= 5);
}
