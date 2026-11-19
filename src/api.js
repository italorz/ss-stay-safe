// Todas as chamadas à API passam por aqui: monta a URL, envia o token e
// transforma respostas de erro em exceções com a mensagem da API.

const CHAVE_TOKEN = 'ss_token'
const CHAVE_USUARIO = 'ss_usuario'

// Cópia em memória para o caso de o navegador bloquear o localStorage
// (janela anônima com armazenamento desligado, por exemplo).
const memoria = {}

function ler(chave) {
  try {
    return localStorage.getItem(chave) ?? memoria[chave] ?? null
  } catch {
    return memoria[chave] ?? null
  }
}

function gravar(chave, valor) {
  memoria[chave] = valor
  try {
    if (valor === null) localStorage.removeItem(chave)
    else localStorage.setItem(chave, valor)
  } catch {
    // sem localStorage, a sessão dura até fechar a aba
  }
}

export function obterToken() {
  return ler(CHAVE_TOKEN)
}

export function obterUsuario() {
  try {
    return JSON.parse(ler(CHAVE_USUARIO))
  } catch {
    return null
  }
}

export function salvarSessao(token, usuario) {
  gravar(CHAVE_TOKEN, token)
  gravar(CHAVE_USUARIO, JSON.stringify(usuario))
}

export function encerrarSessao() {
  delete memoria[CHAVE_TOKEN]
  delete memoria[CHAVE_USUARIO]
  gravar(CHAVE_TOKEN, null)
  gravar(CHAVE_USUARIO, null)
}

// api('/doadores') | api('/doadores', { metodo: 'POST', corpo: {...} })
export async function api(caminho, { metodo = 'GET', corpo } = {}) {
  const headers = {}
  if (corpo !== undefined) headers['Content-Type'] = 'application/json'

  const token = obterToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const opcoes = { method: metodo, headers }
  if (corpo !== undefined) opcoes.body = JSON.stringify(corpo)

  let resposta
  try {
    resposta = await fetch(`/api${caminho}`, opcoes)
  } catch {
    throw new Error('Não foi possível falar com a API. Confira se ela está rodando.')
  }

  if (resposta.status === 204) return null
  const dados = await resposta.json().catch(() => null)

  if (!resposta.ok) {
    // Token vencido ou inválido: limpa a sessão e avisa o main.js para
    // voltar à tela de login.
    if (resposta.status === 401 && token) {
      encerrarSessao()
      window.dispatchEvent(new Event('sessao-expirada'))
    }
    const erro = new Error(dados?.erro || `Erro ${resposta.status} na API.`)
    erro.status = resposta.status
    throw erro
  }
  return dados
}
