import { el, campo, mensagem, formatarData, hoje, seloStatus, ROTULO_STATUS } from '../ui.js'
import { api } from '../api.js'

export function telaDoacoes() {
  let catalogo = [] // itens vindos de /api/itens

  // ---- Formulário de nova doação ----
  const doador = el('select', { name: 'id_doador', required: true }, el('option', { value: '' }, 'Carregando...'))
  const dataDoacao = el('input', { name: 'data_doacao', type: 'date', required: true, value: hoje() })
  const status = el(
    'select',
    { name: 'status' },
    Object.entries(ROTULO_STATUS).map(([valor, rotulo]) => el('option', { value: valor }, rotulo)),
  )
  const dataEntrega = el('input', { name: 'data_entrega', type: 'date' })
  const observacao = el('input', { name: 'observacao', maxlength: 255, placeholder: 'Ex.: retirar no depósito' })
  const linhasItens = el('div', { class: 'linhas-itens' })
  const avisoForm = el('div')
  const botaoSalvar = el('button', { type: 'submit', class: 'botao botao-principal' }, 'Registrar doação')

  // Entrega só faz sentido quando a doação já chegou.
  status.addEventListener('change', () => {
    if (status.value === 'entregue' && !dataEntrega.value) dataEntrega.value = hoje()
  })

  function seletorItem() {
    const porCategoria = new Map()
    for (const item of catalogo) {
      if (!porCategoria.has(item.categoria)) porCategoria.set(item.categoria, [])
      porCategoria.get(item.categoria).push(item)
    }
    return el(
      'select',
      { required: true, 'aria-label': 'Item' },
      el('option', { value: '' }, 'Escolha o item'),
      [...porCategoria].map(([categoria, itens]) =>
        el(
          'optgroup',
          { label: categoria },
          itens.map((i) => el('option', { value: i.id_item }, `${i.nome} (${i.unidade})`)),
        ),
      ),
    )
  }

  function adicionarLinha(focar = true) {
    const item = seletorItem()
    const quantidade = el('input', { type: 'number', min: 1, step: 1, required: true, value: '1', 'aria-label': 'Quantidade' })
    const validade = el('input', { type: 'date', 'aria-label': 'Validade do lote' })
    const linha = el(
      'div',
      { class: 'linha-item' },
      campo('Item *', item, 'linha-item-nome'),
      campo('Qtd. *', quantidade, 'linha-item-qtd'),
      campo('Validade (se vence)', validade, 'linha-item-validade'),
      el(
        'button',
        {
          type: 'button',
          class: 'botao botao-pequeno botao-perigo linha-item-remover',
          'aria-label': 'Remover item',
          onclick: () => {
            if (linhasItens.children.length > 1) linha.remove()
          },
        },
        'Remover',
      ),
    )
    linha.dados = () => ({
      id_item: Number(item.value),
      quantidade: Number(quantidade.value),
      data_validade: validade.value || null,
    })
    linhasItens.append(linha)
    if (focar) item.focus()
  }

  async function salvar(evento) {
    evento.preventDefault()
    const corpo = {
      id_doador: Number(doador.value),
      data_doacao: dataDoacao.value,
      status: status.value,
      data_entrega: dataEntrega.value || null,
      observacao: observacao.value,
      itens: [...linhasItens.children].map((linha) => linha.dados()),
    }
    botaoSalvar.disabled = true
    try {
      await api('/doacoes', { metodo: 'POST', corpo })
      formulario.reset()
      dataDoacao.value = hoje()
      linhasItens.replaceChildren()
      adicionarLinha(false)
      mensagem(avisoForm, 'Doação registrada.', 'sucesso')
      void carregarDoacoes()
    } catch (err) {
      mensagem(avisoForm, err.message)
    } finally {
      botaoSalvar.disabled = false
    }
  }

  const formulario = el(
    'form',
    { class: 'cartao', onsubmit: salvar },
    el('h2', {}, 'Nova doação'),
    campo('Doador *', doador),
    el('div', { class: 'grade-2' }, campo('Data da doação *', dataDoacao), campo('Status', status)),
    el('div', { class: 'grade-2' }, campo('Data de entrega', dataEntrega), campo('Observação', observacao)),
    el('h3', {}, 'Itens'),
    linhasItens,
    el('button', { type: 'button', class: 'botao botao-secundario', onclick: adicionarLinha }, '+ Adicionar item'),
    avisoForm,
    el('div', { class: 'acoes' }, botaoSalvar),
  )

  // ---- Lista de doações ----
  const avisoLista = el('div')
  const corpoTabela = el('tbody')

  function listaItens(itens) {
    return el(
      'ul',
      { class: 'lista-itens' },
      itens.map((i) =>
        el(
          'li',
          {},
          `${i.quantidade} ${i.unidade} · ${i.item}`,
          i.data_validade ? el('span', { class: 'secundario' }, ` (validade ${formatarData(i.data_validade)})`) : null,
        ),
      ),
    )
  }

  async function carregarDoacoes() {
    try {
      const doacoes = await api('/doacoes')
      if (doacoes.length === 0) {
        corpoTabela.replaceChildren(el('tr', {}, el('td', { colspan: 5, class: 'vazio' }, 'Nenhuma doação registrada.')))
        return
      }
      corpoTabela.replaceChildren(
        ...doacoes.map((d) =>
          el(
            'tr',
            {},
            el('td', { 'data-rotulo': 'Data' }, formatarData(d.data_doacao)),
            el('td', { 'data-rotulo': 'Doador' }, d.doador, d.observacao ? el('div', { class: 'secundario' }, d.observacao) : null),
            el('td', { 'data-rotulo': 'Status' }, seloStatus(d.status)),
            el('td', { 'data-rotulo': 'Entrega' }, formatarData(d.data_entrega)),
            el('td', { 'data-rotulo': 'Itens' }, listaItens(d.itens)),
          ),
        ),
      )
    } catch (err) {
      mensagem(avisoLista, err.message)
    }
  }

  // Doadores ativos e catálogo chegam juntos; só então o formulário é liberado.
  async function carregarFormulario() {
    try {
      const [doadores, itens] = await Promise.all([api('/doadores'), api('/itens')])
      catalogo = itens
      const ativos = doadores.filter((d) => d.ativo)
      doador.replaceChildren(
        el('option', { value: '' }, ativos.length ? 'Escolha o doador' : 'Cadastre um doador primeiro'),
        ...ativos.map((d) => el('option', { value: d.id_doador }, d.nome)),
      )
      adicionarLinha(false)
    } catch (err) {
      mensagem(avisoForm, err.message)
    }
  }

  void carregarFormulario()
  void carregarDoacoes()

  return el(
    'section',
    { class: 'pagina' },
    formulario,
    el(
      'div',
      { class: 'cartao' },
      el('h2', {}, 'Doações registradas'),
      avisoLista,
      el(
        'table',
        { class: 'tabela' },
        el('thead', {}, el('tr', {}, el('th', {}, 'Data'), el('th', {}, 'Doador'), el('th', {}, 'Status'), el('th', {}, 'Entrega'), el('th', {}, 'Itens'))),
        corpoTabela,
      ),
    ),
  )
}
