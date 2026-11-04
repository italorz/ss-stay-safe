import './style.css'

document.querySelector('#app').innerHTML = `
<section id="center">
  <div>
    <h1>SS - Stay Safe</h1>
    <p id="api-status">Consultando a API...</p>
  </div>
</section>
`

const statusEl = document.querySelector('#api-status')

fetch('/api/health')
  .then((res) => res.json())
  .then((data) => {
    const dataHora = new Date(data.timestamp).toLocaleString('pt-BR')
    statusEl.textContent = `Status da API: ${data.status} (${dataHora})`
  })
  .catch(() => {
    statusEl.textContent = 'Status da API: indisponível'
  })
