// Carrega o .env antes de qualquer outro módulo ler process.env.
// Fica num arquivo próprio porque os imports rodam antes do código do index.js.
import dotenv from 'dotenv'

dotenv.config({ quiet: true })
