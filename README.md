# SS - Stay Safe

Sistema da ONG **SS - Stay Safe** (fictícia), desenvolvido no Projeto Integrador Extensionista II da UNIMAR.

A ONG arrecada equipamentos de proteção (luvas, botinas, capacetes, kits de primeiros socorros, extintores) e repassa a trabalhadores informais de baixa renda. O sistema registra quem doou, o que foi doado, em que quantidade e, para kits e extintores, a validade de cada lote.

- **Frontend:** HTML, CSS e JavaScript com [Vite+](https://viteplus.dev/)
- **API:** Node.js com Express, login com JWT
- **Banco:** MariaDB/MySQL (XAMPP)

## Pré-requisitos

- [Node.js](https://nodejs.org/) 22 ou superior
- [XAMPP](https://www.apachefriends.org/) (traz o MariaDB e o phpMyAdmin), ou outro MySQL 8 / MariaDB 10.4+
- Opcional: extensão **REST Client** do VS Code, para rodar o `api.http`

## Como rodar

1. **Clone e instale as dependências**

   ```bash
   git clone https://github.com/italorz/ss-stay-safe.git
   cd ss-stay-safe
   npm install
   ```

2. **Inicie o banco.** Abra o XAMPP Control Panel e clique em **Start** no **MySQL**.

3. **Crie o banco e carregue os dados de exemplo.** Rode primeiro o `schema.sql` e depois o `seed.sql`.

   Pelo terminal (Windows, XAMPP na pasta padrão), no **Prompt de Comando (cmd)**:

   ```bat
   C:\xampp\mysql\bin\mysql.exe -u root --default-character-set=utf8mb4 < database\schema.sql
   C:\xampp\mysql\bin\mysql.exe -u root --default-character-set=utf8mb4 < database\seed.sql
   ```

   No PowerShell, chame pelo cmd: `cmd /c "C:\xampp\mysql\bin\mysql.exe -u root --default-character-set=utf8mb4 < database\schema.sql"` (e o mesmo para o `seed.sql`). Não use `Get-Content ... | mysql`: o PowerShell 5 troca os acentos por `?`.

   Ou pelo phpMyAdmin (http://localhost/phpmyadmin, com o Apache ligado): aba **SQL**, cole o conteúdo de cada arquivo e clique em **Executar**.

   O `schema.sql` apaga e recria o banco `ss_stay_safe`; pode ser rodado de novo sempre que quiser voltar ao estado inicial.

4. **Crie o `.env`** a partir do exemplo e troque o `JWT_SECRET`:

   ```bash
   cp .env.example .env
   ```

   No PowerShell: `Copy-Item .env.example .env`. Para gerar um segredo:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Inicie a API** (porta 3001) em um terminal:

   ```bash
   npm run api
   ```

   Confira em http://localhost:3001/api/health: deve responder `"status": "ok"` e `"banco": "ok"`.

6. **Inicie o frontend** (porta 5173) em outro terminal:

   ```bash
   npm run dev
   ```

7. Abra http://localhost:5173 e entre com o usuário de demonstração.

## Usuário de demonstração

| E-mail | Senha |
| --- | --- |
| `coordenacao@staysafe.local` | `staysafe123` |

Para criar outro usuário, gere o hash da senha e insira no banco:

```bash
node server/gerar-hash.js minhaSenha
```

```sql
INSERT INTO usuario (nome, email, senha_hash) VALUES ('Nome', 'email@exemplo.com', '<hash gerado>');
```

## Variáveis de ambiente (`.env`)

| Variável | Exemplo | Para que serve |
| --- | --- | --- |
| `PORT` | `3001` | Porta da API (o Vite repassa `/api` para ela) |
| `DB_HOST` | `127.0.0.1` | Endereço do banco |
| `DB_PORT` | `3306` | Porta do banco |
| `DB_USER` | `root` | Usuário do banco |
| `DB_PASSWORD` | *(vazio)* | Senha do banco (vazia no XAMPP) |
| `DB_NAME` | `ss_stay_safe` | Nome do banco |
| `JWT_SECRET` | *(texto longo aleatório)* | Segredo que assina os tokens de login |
| `JWT_EXPIRES_IN` | `8h` | Tempo até o token expirar |

## Rotas da API

Todas começam com `/api`. Exceto `/health` e `/auth/login`, exigem o cabeçalho `Authorization: Bearer <token>`; sem ele a resposta é `401 {"erro": "Token ausente"}`.

| Método | Rota | O que faz |
| --- | --- | --- |
| GET | `/health` | Testa a API e o banco (`SELECT 1`) |
| POST | `/auth/login` | Recebe `email` e `senha`, devolve o `token` e o usuário |
| GET | `/doadores` | Lista doadores; aceita `?busca=` por nome ou e-mail |
| GET | `/doadores/:id` | Um doador |
| POST | `/doadores` | Cadastra (409 se o e-mail já existe) |
| PUT | `/doadores/:id` | Edita, inclusive ativo/inativo |
| DELETE | `/doadores/:id` | Exclui (409 se o doador já tem doações; nesse caso, desative) |
| GET | `/itens` | Catálogo de itens com a categoria |
| GET | `/doacoes` | Doações com a lista de itens de cada uma |
| POST | `/doacoes` | Registra a doação e os itens numa transação |

- `api.http`: todos os testes acima, inclusive os de erro (401, 409, 400 e rollback).
- `openapi.yaml`: documentação completa (pode ser aberta em https://editor.swagger.io).

## Estrutura

```
database/schema.sql        Tabelas, chaves e restrições
database/seed.sql          Usuário de demonstração e dados de exemplo
server/index.js            App Express: rotas públicas, middleware de token e tratador de erros
server/env.js              Carrega o .env
server/db.js               Pool de conexões mysql2
server/auth.js             POST /auth/login e middleware autenticar
server/validacao.js        Validação de doador, doação e login
server/routes/             doadores.js, itens.js, doacoes.js
server/gerar-hash.js       Gera hash bcrypt de uma senha
src/main.js                Mostra o login ou o sistema, conforme o token
src/api.js                 fetch centralizado, com o token
src/ui.js                  Funções de tela (createElement, datas)
src/pages/                 login.js, doadores.js, doacoes.js
src/style.css              CSS mobile-first (720px e 960px)
```

## Backup do banco

No Prompt de Comando (cmd):

```bat
C:\xampp\mysql\bin\mysqldump.exe -u root --default-character-set=utf8mb4 ss_stay_safe > backup-ss_stay_safe.sql
```

## Funcionalidades implementadas

- Autenticação de usuários com JWT.
- Login e logout.
- Cadastro, edição, exclusão e consulta de doadores.
- Busca de doadores por nome ou e-mail.
- Ativação e desativação de doadores.
- Catálogo de equipamentos por categoria.
- Registro de doações com múltiplos itens.
- Registro da quantidade e validade dos equipamentos.
- Consulta do histórico de doações.
- Registro do status das doações.
- Proteção das rotas da API.
- Validação e integridade dos dados.
- Interface responsiva.
- Documentação da API com OpenAPI.
- Roteiro de testes manuais da API.

## Melhorias futuras

- Edição de doações já registradas.
- Atualização do status de doações existentes.
- Alertas de vencimento de equipamentos.
- Dashboard com indicadores de doações.
- Controle de estoque de equipamentos.
- Cadastro de beneficiários.
- Controle da distribuição de equipamentos.
- Relatórios de impacto social da ONG.

Para restaurar:

```bat
C:\xampp\mysql\bin\mysql.exe -u root --default-character-set=utf8mb4 ss_stay_safe < backup-ss_stay_safe.sql
```
