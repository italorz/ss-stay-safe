-- SS - Stay Safe | PIE II - Atividade 2
-- Banco da ONG: registra quem doa equipamentos e kits de segurança,
-- o que foi doado e em que quantidade.
--
-- MER (5 entidades + usuario do sistema):
--   doador    1:N  doacao
--   categoria 1:N  item
--   doacao    N:N  item   -> resolvido pela tabela associativa doacao_item
--   usuario: coordenadores e voluntários que fazem login (Aula 4)
--
-- LGPD: guardamos só o necessário para contatar o doador (nome, e-mail,
-- telefone). O MER do PIE I tinha CPF; ele saiu porque a ONG não precisa
-- dele para receber ou agradecer uma doação. Endereço também não entra.
--
-- Estoque e prioridade do Item ficaram de fora: o total recebido sai de
-- doacao_item, não precisa ser guardado.

SET NAMES utf8mb4;

DROP DATABASE IF EXISTS ss_stay_safe;
CREATE DATABASE ss_stay_safe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ss_stay_safe;

-- Quem acessa o sistema (coordenadores e voluntários).
-- senha_hash guarda o hash bcrypt, que tem sempre 60 caracteres; a senha
-- em texto puro nunca é gravada.
CREATE TABLE usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nome       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  senha_hash CHAR(60) NOT NULL,
  criado_em  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Pessoas: quem doa para a ONG.
-- E-mail é opcional (há doadores que só deixam telefone), mas não pode repetir.
-- ativo: doador que parou de doar é desativado, não apagado, porque o
-- histórico de doações dele continua valendo para os relatórios.
CREATE TABLE doador (
  id_doador     INT AUTO_INCREMENT PRIMARY KEY,
  nome          VARCHAR(150) NOT NULL,
  email         VARCHAR(100) UNIQUE,
  telefone      VARCHAR(20),
  ativo         BOOLEAN NOT NULL DEFAULT TRUE,
  data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Catálogo: grupos de equipamento (ex.: EPI, primeiros socorros,
-- combate a incêndio, sinalização).
CREATE TABLE categoria (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nome         VARCHAR(60) NOT NULL UNIQUE
);

-- Catálogo: cada equipamento ou kit que a ONG aceita.
-- A unidade muda conforme o item (unidade, par, caixa, kit).
-- O mesmo nome não pode aparecer duas vezes na mesma categoria.
CREATE TABLE item (
  id_item      INT AUTO_INCREMENT PRIMARY KEY,
  id_categoria INT NOT NULL,
  nome         VARCHAR(150) NOT NULL,
  unidade      VARCHAR(20) NOT NULL DEFAULT 'unidade',
  UNIQUE (id_categoria, nome),
  FOREIGN KEY (id_categoria) REFERENCES categoria (id_categoria)
);

-- Registros: cada entrega feita por um doador.
-- Sem CASCADE para doador: apagar um doador não pode sumir com o
-- histórico de doações; o banco bloqueia a exclusão.
-- status: a doação é combinada (pendente), chega na ONG (entregue) ou
-- desiste-se dela (cancelada). data_entrega só existe depois do combinado.
CREATE TABLE doacao (
  id_doacao    INT AUTO_INCREMENT PRIMARY KEY,
  id_doador    INT NOT NULL,
  data_doacao  DATE NOT NULL,
  status       ENUM('pendente', 'entregue', 'cancelada') NOT NULL DEFAULT 'pendente',
  data_entrega DATE,
  observacao   VARCHAR(255),
  criado_em    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_entrega_apos_doacao CHECK (data_entrega IS NULL OR data_entrega >= data_doacao),
  FOREIGN KEY (id_doador) REFERENCES doador (id_doador)
);

-- Associativa (N:N): quais itens vieram em cada doação.
-- data_validade existe porque kit de primeiros socorros e extintor vencem;
-- fica NULL para itens que não têm validade (ex.: capacete, cone).
-- CASCADE só aqui: as linhas não fazem sentido sem a doação.
CREATE TABLE doacao_item (
  id_doacao     INT NOT NULL,
  id_item       INT NOT NULL,
  quantidade    INT NOT NULL CHECK (quantidade > 0),
  data_validade DATE,
  PRIMARY KEY (id_doacao, id_item),
  FOREIGN KEY (id_doacao) REFERENCES doacao (id_doacao) ON DELETE CASCADE,
  FOREIGN KEY (id_item) REFERENCES item (id_item)
);
