import './style.css'
import { el } from './ui.js'
import { obterToken, obterUsuario, encerrarSessao } from './api.js'
import { telaLogin } from './pages/login.js'
import { telaDoadores } from './pages/doadores.js'
import { telaDoacoes } from './pages/doacoes.js'

const app = document.querySelector('#app')

const PAGINAS = {
  doadores: { rotulo: 'Doadores', montar: telaDoadores },
  doacoes: { rotulo: 'Doações', montar: telaDoacoes },
}

function mostrarLogin(aviso = '') {
  app.replaceChildren(telaLogin(() => mostrarSistema(), aviso))
}

function mostrarSistema() {
  const usuario = obterUsuario()
  const conteudo = el('main', { class: 'conteudo' })
  const botoes = {}

  function abrir(nome) {
    for (const [chave, botao] of Object.entries(botoes)) {
      botao.setAttribute('aria-current', chave === nome ? 'page' : 'false')
    }
    conteudo.replaceChildren(PAGINAS[nome].montar())
  }

  for (const [chave, pagina] of Object.entries(PAGINAS)) {
    botoes[chave] = el('button', { type: 'button', class: 'nav-botao', onclick: () => abrir(chave) }, pagina.rotulo)
  }

  const sair = el(
    'button',
    {
      type: 'button',
      class: 'botao botao-secundario botao-pequeno',
      onclick: () => {
        encerrarSessao()
        mostrarLogin()
      },
    },
    'Sair',
  )

  const cabecalho = el(
    'header',
    { class: 'cabecalho' },
    el('span', { class: 'marca' }, 'SS - Stay Safe'),
    el('nav', { class: 'nav', 'aria-label': 'Principal' }, Object.values(botoes)),
    el('div', { class: 'usuario' }, el('span', { class: 'usuario-nome' }, usuario?.nome ?? ''), sair),
  )

  app.replaceChildren(cabecalho, conteudo)
  abrir('doadores')
}

// Disparado pelo api.js quando a API responde 401 com um token salvo.
window.addEventListener('sessao-expirada', () => {
  mostrarLogin('Sua sessão expirou. Entre novamente.')
})

if (obterToken()) mostrarSistema()
else mostrarLogin()
