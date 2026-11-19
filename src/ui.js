// Funções de tela usadas por todas as páginas.
// Tudo é montado com createElement e textContent: um nome de doador como
// "<img onerror=...>" aparece como texto, nunca vira HTML (evita XSS).

const PROPRIEDADES = new Set(['value', 'checked', 'disabled', 'selected', 'required', 'hidden'])

// el('button', { class: 'botao', onclick: fn }, 'Salvar')
export function el(tag, atributos = {}, ...filhos) {
  const node = document.createElement(tag)

  for (const [nome, valor] of Object.entries(atributos)) {
    if (valor === undefined || valor === null || valor === false) continue
    if (nome.startsWith('on') && typeof valor === 'function') {
      node.addEventListener(nome.slice(2), valor)
    } else if (nome === 'class') {
      node.className = valor
    } else if (PROPRIEDADES.has(nome)) {
      node[nome] = valor
    } else {
      node.setAttribute(nome, valor === true ? '' : String(valor))
    }
  }

  for (const filho of filhos.flat()) {
    if (filho === null || filho === undefined || filho === false) continue
    node.append(filho instanceof Node ? filho : document.createTextNode(String(filho)))
  }
  return node
}

// Rótulo visível + campo, num <label> para o clique no texto focar o campo.
export function campo(rotulo, entrada, classe = '') {
  return el('label', { class: `campo ${classe}`.trim() }, el('span', { class: 'campo-rotulo' }, rotulo), entrada)
}

// Mostra (ou limpa, com texto vazio) uma mensagem dentro de `alvo`.
export function mensagem(alvo, texto, tipo = 'erro') {
  if (!texto) {
    alvo.replaceChildren()
    return
  }
  alvo.replaceChildren(
    el('p', { class: `aviso aviso-${tipo}`, role: tipo === 'erro' ? 'alert' : 'status' }, texto),
  )
}

// '2026-11-10' -> '10/11/2026'. Corta a string em vez de usar new Date(),
// que leria a data como UTC e poderia mostrar o dia anterior no Brasil.
export function formatarData(iso) {
  if (!iso) return '—'
  const [ano, mes, dia] = iso.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

// Data de hoje no fuso do navegador, no formato do <input type="date">.
export function hoje() {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

export const ROTULO_STATUS = { pendente: 'Pendente', entregue: 'Entregue', cancelada: 'Cancelada' }

export function seloStatus(status) {
  return el('span', { class: `selo selo-${status}` }, ROTULO_STATUS[status] ?? status)
}
