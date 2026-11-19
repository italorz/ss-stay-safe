import { Router } from 'express'
import { pool } from '../db.js'
import { validarDoador } from '../validacao.js'

const router = Router()

function idDaRota(req) {
  const id = Number(req.params.id)
  return Number.isInteger(id) && id > 0 ? id : null
}

// GET /api/doadores?busca=ana  -> busca por nome ou e-mail (opcional)
router.get('/', async (req, res) => {
  const busca = typeof req.query.busca === 'string' ? req.query.busca.trim() : ''
  let sql = 'SELECT id_doador, nome, email, telefone, ativo, data_cadastro FROM doador'
  const params = []
  if (busca) {
    sql += ' WHERE nome LIKE ? OR email LIKE ?'
    params.push(`%${busca}%`, `%${busca}%`)
  }
  sql += ' ORDER BY ativo DESC, nome'
  const [linhas] = await pool.query(sql, params)
  res.json(linhas.map((d) => ({ ...d, ativo: Boolean(d.ativo) })))
})

router.get('/:id', async (req, res) => {
  const id = idDaRota(req)
  if (!id) return res.status(400).json({ erro: 'ID inválido.' })

  const [linhas] = await pool.query(
    'SELECT id_doador, nome, email, telefone, ativo, data_cadastro FROM doador WHERE id_doador = ?',
    [id],
  )
  if (linhas.length === 0) return res.status(404).json({ erro: 'Doador não encontrado.' })
  res.json({ ...linhas[0], ativo: Boolean(linhas[0].ativo) })
})

router.post('/', async (req, res) => {
  const { erros, dados } = validarDoador(req.body)
  if (erros.length) return res.status(400).json({ erro: erros.join(' '), erros })

  try {
    const [resultado] = await pool.query(
      'INSERT INTO doador (nome, email, telefone, ativo) VALUES (?, ?, ?, ?)',
      [dados.nome, dados.email, dados.telefone, dados.ativo],
    )
    res.status(201).json({ id_doador: resultado.insertId, ...dados })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Já existe um doador com este e-mail.' })
    }
    throw err
  }
})

router.put('/:id', async (req, res) => {
  const id = idDaRota(req)
  if (!id) return res.status(400).json({ erro: 'ID inválido.' })

  const { erros, dados } = validarDoador(req.body)
  if (erros.length) return res.status(400).json({ erro: erros.join(' '), erros })

  try {
    const [resultado] = await pool.query(
      'UPDATE doador SET nome = ?, email = ?, telefone = ?, ativo = ? WHERE id_doador = ?',
      [dados.nome, dados.email, dados.telefone, dados.ativo, id],
    )
    if (resultado.affectedRows === 0) return res.status(404).json({ erro: 'Doador não encontrado.' })
    res.json({ id_doador: id, ...dados })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Já existe um doador com este e-mail.' })
    }
    throw err
  }
})

router.delete('/:id', async (req, res) => {
  const id = idDaRota(req)
  if (!id) return res.status(400).json({ erro: 'ID inválido.' })

  try {
    const [resultado] = await pool.query('DELETE FROM doador WHERE id_doador = ?', [id])
    if (resultado.affectedRows === 0) return res.status(404).json({ erro: 'Doador não encontrado.' })
    res.status(204).end()
  } catch (err) {
    // A FK de doacao impede apagar quem já doou: o histórico precisa ficar.
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        erro: 'Este doador tem doações registradas e não pode ser excluído. Desative-o em vez disso.',
      })
    }
    throw err
  }
})

export default router
