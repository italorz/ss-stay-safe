// Cada função recebe o corpo da requisição e devolve { erros, dados }.
// erros: lista de mensagens para o usuário (vazia quando está tudo certo).
// dados: os valores já limpos, prontos para ir ao banco.

const STATUS_DOACAO = ['pendente', 'entregue', 'cancelada']

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : ''
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Aceita só AAAA-MM-DD e confere se a data existe (rejeita 2026-02-30).
function dataValida(valor) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false
  const [ano, mes, dia] = valor.split('-').map(Number)
  const d = new Date(Date.UTC(ano, mes - 1, dia))
  return d.getUTCFullYear() === ano && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia
}

function inteiroPositivo(valor) {
  const n = Number(valor)
  return Number.isInteger(n) && n > 0 ? n : null
}

export function validarDoador(body = {}) {
  const erros = []
  const nome = texto(body.nome)
  const email = texto(body.email)
  const telefone = texto(body.telefone)

  if (!nome) erros.push('Informe o nome do doador.')
  else if (nome.length > 150) erros.push('O nome pode ter no máximo 150 caracteres.')

  if (email && !emailValido(email)) erros.push('E-mail inválido.')
  else if (email.length > 100) erros.push('O e-mail pode ter no máximo 100 caracteres.')

  if (telefone.length > 20) erros.push('O telefone pode ter no máximo 20 caracteres.')

  if (body.ativo !== undefined && typeof body.ativo !== 'boolean') {
    erros.push('O campo ativo deve ser true ou false.')
  }

  return {
    erros,
    dados: {
      nome,
      email: email || null,
      telefone: telefone || null,
      ativo: body.ativo === undefined ? true : body.ativo,
    },
  }
}

export function validarDoacao(body = {}) {
  const erros = []
  const idDoador = inteiroPositivo(body.id_doador)
  const status = body.status === undefined || body.status === '' ? 'pendente' : body.status
  const dataEntrega = body.data_entrega || null
  const observacao = texto(body.observacao)

  if (!idDoador) erros.push('Escolha o doador.')
  if (!dataValida(body.data_doacao)) erros.push('Data da doação inválida (use AAAA-MM-DD).')
  if (!STATUS_DOACAO.includes(status)) erros.push('Status deve ser pendente, entregue ou cancelada.')

  if (dataEntrega !== null) {
    if (!dataValida(dataEntrega)) erros.push('Data de entrega inválida (use AAAA-MM-DD).')
    else if (dataValida(body.data_doacao) && dataEntrega < body.data_doacao) {
      erros.push('A data de entrega não pode ser anterior à data da doação.')
    }
  }

  if (observacao.length > 255) erros.push('A observação pode ter no máximo 255 caracteres.')

  const itens = []
  if (!Array.isArray(body.itens) || body.itens.length === 0) {
    erros.push('Adicione pelo menos um item à doação.')
  } else {
    const vistos = new Set()
    body.itens.forEach((item, i) => {
      const linha = i + 1
      const idItem = inteiroPositivo(item?.id_item)
      const quantidade = inteiroPositivo(item?.quantidade)
      const validade = item?.data_validade || null

      if (!idItem) erros.push(`Item ${linha}: escolha o item.`)
      else if (vistos.has(idItem)) erros.push(`Item ${linha}: item repetido; some as quantidades numa linha só.`)
      else vistos.add(idItem)

      if (!quantidade) erros.push(`Item ${linha}: a quantidade deve ser um número inteiro maior que zero.`)
      if (validade !== null && !dataValida(validade)) erros.push(`Item ${linha}: data de validade inválida.`)

      itens.push({ id_item: idItem, quantidade, data_validade: validade })
    })
  }

  return {
    erros,
    dados: {
      id_doador: idDoador,
      data_doacao: body.data_doacao,
      status,
      data_entrega: dataEntrega,
      observacao: observacao || null,
      itens,
    },
  }
}

export function validarLogin(body = {}) {
  const erros = []
  const email = texto(body.email)
  const senha = typeof body.senha === 'string' ? body.senha : ''

  if (!email) erros.push('Informe o e-mail.')
  if (!senha) erros.push('Informe a senha.')

  return { erros, dados: { email, senha } }
}
