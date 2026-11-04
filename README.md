# SS - Stay Safe

Projeto da ONG **SS - Stay Safe**, desenvolvido no Projeto Integrador Extensionista II (UNIMAR).

Front-end criado com [Vite+](https://viteplus.dev/) (modelo Vanilla, JavaScript) e API em Node.js com Express.

## Pré-requisitos

- [Node.js](https://nodejs.org/) 22 ou superior
- [Vite+](https://viteplus.dev/) (comando `vp`) — opcional, o `npm` já roda o projeto

## Como rodar

1. Clone o repositório e entre na pasta:

   ```bash
   git clone https://github.com/italorz/ss-stay-safe.git
   cd ss-stay-safe
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie o arquivo `.env` a partir do exemplo:

   ```bash
   cp .env.example .env
   ```

   No Windows (PowerShell): `Copy-Item .env.example .env`

4. Em um terminal, inicie a API (porta 3001):

   ```bash
   npm run api
   ```

5. Em outro terminal, inicie o front-end (porta 5173):

   ```bash
   npm run dev
   ```

6. Abra http://localhost:5173 no navegador. A página deve mostrar **"Status da API: ok"** com a data e a hora.

## Estrutura

```
server/index.js   API Express com a rota GET /api/health
src/main.js       Página inicial que consulta a API
vite.config.ts    Configuração do Vite+ com proxy de /api para a porta 3001
.env.example      Modelo das variáveis de ambiente
```

## Rotas da API

| Método | Rota          | Resposta                                    |
| ------ | ------------- | ------------------------------------------- |
| GET    | `/api/health` | `{ "status": "ok", "timestamp": "..." }`    |
