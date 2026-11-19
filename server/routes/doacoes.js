import { Router } from 'express'
import { pool } from '../db.js'
import { validarDoacao } from '../validacao.js'

const router = Router()

// Uma consulta só, com LEFT JOIN; as linhas repetidas de cada doação são
// agrupadas aqui em { ...doacao, itens: [...] }.
router.get('/', async (req, res) => {
  const [linhas] = await pool.query(
    `SELECT d.id_doacao, d.data_doacao, d.status, d.data_entrega, d.observacao,
            d.id_doador, dr.nome AS doador,
            di.id_item, i.nome AS item, i.unidade, di.quantidade, di.data_validade
       FROM doacao d
       JOIN doador dr ON dr.id_doador = d.id_doador
       LEFT JOIN doacao_item di ON di.id_doacao = d.id_doacao
       LEFT JOIN item i ON i.id_item = di.id_item
      ORDER BY d.data_doacao DESC, d.id_doacao DESC, i.nome`,
  )

  const porId = new Map()
  for (const l of linhas) {
    if (!porId.has(l.id_doacao)) {
      porId.set(l.id_doacao, {
        id_doacao: l.id_doacao,
        data_doacao: l.data_doacao,
        status: l.status,
        data_entrega: l.data_entrega,
        observacao: l.observacao,
        id_doador: l.id_doador,
        doador: l.doador,
        itens: [],
      })
    }
    if (l.id_item !== null) {
      porId.get(l.id_doacao).itens.push({
        id_item: l.id_item,
        item: l.item,
        unidade: l.unidade,
        quantidade: l.quantidade,
        data_validade: l.data_validade,
      })
    }
  }
  res.json([...porId.values()])
})

// A doação e os itens são gravados juntos: se um item falhar, nada fica salvo.
router.post('/', async (req, res) => {
  const { erros, dados } = validarDoacao(req.body)
  if (erros.length) return res.status(400).json({ erro: erros.join(' '), erros })

  const conexao = await pool.getConnection()
  try {
    await conexao.beginTransaction()

    const [resultado] = await conexao.query(
      `INSERT INTO doacao (id_doador, data_doacao, status, data_entrega, observacao)
       VALUES (?, ?, ?, ?, ?)`,
      [dados.id_doador, dados.data_doacao, dados.status, dados.data_entrega, dados.observacao],
    )
    const idDoacao = resultado.insertId

    for (const item of dados.itens) {
      await conexao.query(
        'INSERT INTO doacao_item (id_doacao, id_item, quantidade, data_validade) VALUES (?, ?, ?, ?)',
        [idDoacao, item.id_item, item.quantidade, item.data_validade],
      )
    }

    await conexao.commit()
    res.status(201).json({ id_doacao: idDoacao, ...dados })
  } catch (err) {
    await conexao.rollback()
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ erro: 'Doador ou item inexistente.' })
    }
    throw err
  } finally {
    conexao.release()
  }
})

export default router
