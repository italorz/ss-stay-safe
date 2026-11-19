import { el, campo, mensagem } from '../ui.js'
import { api, salvarSessao } from '../api.js'

export function telaLogin(aoEntrar, avisoInicial = '') {
  const aviso = el('div')
  const email = el('input', { type: 'email', name: 'email', autocomplete: 'username', required: true })
  const senha = el('input', { type: 'password', name: 'senha', autocomplete: 'current-password', required: true })
  const botao = el('button', { type: 'submit', class: 'botao botao-principal' }, 'Entrar')

  async function entrar(evento) {
    evento.preventDefault()
    mensagem(aviso, '')
    botao.disabled = true
    botao.textContent = 'Entrando...'
    try {
      const { token, usuario } = await api('/auth/login', {
        metodo: 'POST',
        corpo: { email: email.value, senha: senha.value },
      })
      salvarSessao(token, usuario)
      aoEntrar(usuario)
    } catch (err) {
      mensagem(aviso, err.message)
      senha.value = ''
      senha.focus()
    } finally {
      botao.disabled = false
      botao.textContent = 'Entrar'
    }
  }

  if (avisoInicial) mensagem(aviso, avisoInicial, 'info')

  const formulario = el(
    'form',
    { class: 'cartao login', onsubmit: entrar },
    el('h1', {}, 'SS - Stay Safe'),
    el('p', { class: 'subtitulo' }, 'Controle de doações de equipamentos de segurança'),
    campo('E-mail', email),
    campo('Senha', senha),
    aviso,
    botao,
  )

  queueMicrotask(() => email.focus())
  return el('main', { class: 'tela-login' }, formulario)
}
