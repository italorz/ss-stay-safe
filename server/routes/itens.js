import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

// Catálogo usado no formulário de doação, já com o nome da categoria.
router.get('/', async (req, res) => {
  const [linhas] = await pool.query(
    `SELECT i.id_item, i.nome, i.unidade, c.id_categoria, c.nome AS categoria
       FROM item i
       JOIN categoria c ON c.id_categoria = i.id_categoria
      ORDER BY c.nome, i.nome`,
  )
  res.json(linhas)
})

export default router
