import 'dotenv/config'
import express from 'express'
import { pool } from './db.js'
import doadoresRouter from './routes/doadores.js'
import itensRouter from './routes/itens.js'
import doacoesRouter from './routes/doacoes.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

// Confere a API e o banco: se o MariaDB estiver parado, responde 503.
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', banco: 'ok', timestamp: new Date().toISOString() })
  } catch {
    res.status(503).json({ status: 'erro', banco: 'indisponível', timestamp: new Date().toISOString() })
  }
})

app.use('/api/doadores', doadoresRouter)
app.use('/api/itens', itensRouter)
app.use('/api/doacoes', doacoesRouter)

app.use('/api', (req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' })
})

// Tratador global: precisa dos 4 parâmetros para o Express reconhecê-lo.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' })
  }
  console.error(err)
  res.status(500).json({ erro: 'Erro interno no servidor.' })
})

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`)
})
