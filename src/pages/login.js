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
  const linkHealth = el(
    'a',
    { class: 'link-health', href: '/api/health', target: '_blank', rel: 'noopener' },
    'Abrir /api/health',
  )
  return el('main', { class: 'tela-login' }, formulario, statusApi(), linkHealth)
}

// GET /api/health é público: mostra se a API e o banco respondem, com data e hora.
function statusApi() {
  const linha = el('p', { class: 'status-api' }, 'Consultando a API...')
  fetch('/api/health')
    .then((res) => res.json())
    .then((dados) => {
      const dataHora = new Date(dados.timestamp).toLocaleString('pt-BR')
      linha.textContent = `Status da API: ${dados.status} (${dataHora})`
    })
    .catch(() => {
      linha.textContent = 'Status da API: indisponível'
    })
  return linha
}
