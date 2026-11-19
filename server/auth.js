import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from './db.js'
import { validarLogin } from './validacao.js'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h'

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não definido. Copie o .env.example para .env e preencha o segredo.')
}

// Hash de uma senha qualquer, usado quando o e-mail não existe: assim a
// resposta demora o mesmo tempo e não revela quais e-mails estão cadastrados.
const HASH_FALSO = bcrypt.hashSync('senha-que-nao-existe', 10)

export const authRouter = Router()

authRouter.post('/login', async (req, res) => {
  const { erros, dados } = validarLogin(req.body)
  if (erros.length) return res.status(400).json({ erro: erros.join(' '), erros })

  const [linhas] = await pool.query(
    'SELECT id_usuario, nome, email, senha_hash FROM usuario WHERE email = ?',
    [dados.email],
  )
  const usuario = linhas[0]
  const senhaConfere = await bcrypt.compare(dados.senha, usuario ? usuario.senha_hash : HASH_FALSO)

  if (!usuario || !senhaConfere) {
    return res.status(401).json({ erro: 'E-mail ou senha incorretos.' })
  }

  const token = jwt.sign({ sub: usuario.id_usuario, nome: usuario.nome }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
  res.json({
    token,
    usuario: { id_usuario: usuario.id_usuario, nome: usuario.nome, email: usuario.email },
  })
})

// Middleware: exige o cabeçalho Authorization: Bearer <token>.
export function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ')
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ erro: 'Token ausente' })
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.usuario = { id_usuario: payload.sub, nome: payload.nome }
    next()
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado' })
  }
}
