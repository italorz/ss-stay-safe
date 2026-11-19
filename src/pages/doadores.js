import { el, campo, mensagem, formatarData } from '../ui.js'
import { api } from '../api.js'

export function telaDoadores() {
  let editando = null // doador sendo editado, ou null no modo "novo"
  let tempoBusca

  // ---- Formulário (novo / editar) ----
  const titulo = el('h2', {}, 'Novo doador')
  const nome = el('input', { name: 'nome', maxlength: 150, required: true })
  const email = el('input', { name: 'email', type: 'email', maxlength: 100 })
  const telefone = el('input', { name: 'telefone', type: 'tel', maxlength: 20, placeholder: '(14) 99999-0000' })
  const ativo = el('input', { name: 'ativo', type: 'checkbox', checked: true })
  const campoAtivo = el('label', { class: 'campo-check', hidden: true }, ativo, ' Doador ativo')
  const avisoForm = el('div')
  const botaoSalvar = el('button', { type: 'submit', class: 'botao botao-principal' }, 'Cadastrar')
  const botaoCancelar = el(
    'button',
    { type: 'button', class: 'botao botao-secundario', hidden: true, onclick: () => modoNovo() },
    'Cancelar edição',
  )

  const formulario = el(
    'form',
    { class: 'cartao', onsubmit: salvar },
    titulo,
    campo('Nome *', nome),
    el('div', { class: 'grade-2' }, campo('E-mail', email), campo('Telefone', telefone)),
    campoAtivo,
    avisoForm,
    el('div', { class: 'acoes' }, botaoSalvar, botaoCancelar),
  )

  function modoNovo() {
    editando = null
    formulario.reset()
    ativo.checked = true
    titulo.textContent = 'Novo doador'
    botaoSalvar.textContent = 'Cadastrar'
    campoAtivo.hidden = true
    botaoCancelar.hidden = true
    mensagem(avisoForm, '')
  }

  function modoEditar(doador) {
    editando = doador
    nome.value = doador.nome
    email.value = doador.email ?? ''
    telefone.value = doador.telefone ?? ''
    ativo.checked = doador.ativo
    titulo.textContent = `Editar: ${doador.nome}`
    botaoSalvar.textContent = 'Salvar alterações'
    campoAtivo.hidden = false
    botaoCancelar.hidden = false
    mensagem(avisoForm, '')
    formulario.scrollIntoView({ behavior: 'smooth', block: 'start' })
    nome.focus()
  }

  async function salvar(evento) {
    evento.preventDefault()
    const corpo = {
      nome: nome.value,
      email: email.value,
      telefone: telefone.value,
      ativo: ativo.checked,
    }
    botaoSalvar.disabled = true
    try {
      if (editando) {
        await api(`/doadores/${editando.id_doador}`, { metodo: 'PUT', corpo })
        modoNovo()
        mensagem(avisoForm, 'Doador atualizado.', 'sucesso')
      } else {
        await api('/doadores', { metodo: 'POST', corpo })
        modoNovo()
        mensagem(avisoForm, 'Doador cadastrado.', 'sucesso')
      }
      void carregar()
    } catch (err) {
      mensagem(avisoForm, err.message)
    } finally {
      botaoSalvar.disabled = false
    }
  }

  async function excluir(doador) {
    if (!confirm(`Excluir o doador "${doador.nome}"?`)) return
    try {
      await api(`/doadores/${doador.id_doador}`, { metodo: 'DELETE' })
      if (editando?.id_doador === doador.id_doador) modoNovo()
      mensagem(avisoLista, 'Doador excluído.', 'sucesso')
      void carregar()
    } catch (err) {
      mensagem(avisoLista, err.message)
    }
  }

  // ---- Lista com busca ----
  const busca = el('input', {
    type: 'search',
    placeholder: 'Buscar por nome ou e-mail',
    'aria-label': 'Buscar doador',
    oninput: () => {
      clearTimeout(tempoBusca)
      tempoBusca = setTimeout(carregar, 300)
    },
  })
  const avisoLista = el('div')
  const corpoTabela = el('tbody')
  const contador = el('p', { class: 'contador' })

  async function carregar() {
    const termo = busca.value.trim()
    try {
      const doadores = await api(`/doadores${termo ? `?busca=${encodeURIComponent(termo)}` : ''}`)
      contador.textContent = `${doadores.length} doador(es)`
      if (doadores.length === 0) {
        corpoTabela.replaceChildren(
          el('tr', {}, el('td', { colspan: 5, class: 'vazio' }, termo ? 'Nenhum doador encontrado.' : 'Nenhum doador cadastrado.')),
        )
        return
      }
      corpoTabela.replaceChildren(...doadores.map(linhaDoador))
    } catch (err) {
      mensagem(avisoLista, err.message)
    }
  }

  function linhaDoador(d) {
    return el(
      'tr',
      { class: d.ativo ? '' : 'inativo' },
      el('td', { 'data-rotulo': 'Nome' }, d.nome),
      el('td', { 'data-rotulo': 'Contato' }, d.email ?? '—', el('br'), el('span', { class: 'secundario' }, d.telefone ?? '')),
      el('td', { 'data-rotulo': 'Cadastro' }, formatarData(d.data_cadastro)),
      el('td', { 'data-rotulo': 'Situação' }, el('span', { class: `selo ${d.ativo ? 'selo-entregue' : 'selo-cancelada'}` }, d.ativo ? 'Ativo' : 'Inativo')),
      el(
        'td',
        { class: 'celula-acoes' },
        el('button', { type: 'button', class: 'botao botao-pequeno', onclick: () => modoEditar(d) }, 'Editar'),
        el('button', { type: 'button', class: 'botao botao-pequeno botao-perigo', onclick: () => excluir(d) }, 'Excluir'),
      ),
    )
  }

  const tabela = el(
    'table',
    { class: 'tabela' },
    el('thead', {}, el('tr', {}, el('th', {}, 'Nome'), el('th', {}, 'Contato'), el('th', {}, 'Cadastro'), el('th', {}, 'Situação'), el('th', {}, el('span', { class: 'sr-only' }, 'Ações')))),
    corpoTabela,
  )

  void carregar()

  return el(
    'section',
    { class: 'pagina pagina-dupla' },
    formulario,
    el('div', { class: 'cartao' }, el('h2', {}, 'Doadores'), busca, contador, avisoLista, tabela),
  )
}
