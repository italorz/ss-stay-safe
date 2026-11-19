// Gera o hash bcrypt de uma senha para colar no seed.sql ou num INSERT.
// Uso: node server/gerar-hash.js minhaSenha
import bcrypt from 'bcryptjs'

const senha = process.argv[2]

if (!senha) {
  console.error('Uso: node server/gerar-hash.js <senha>')
  process.exit(1)
}

const hash = bcrypt.hashSync(senha, 10)
console.log(hash)
console.log(`(${hash.length} caracteres, bcrypt custo 10)`)
