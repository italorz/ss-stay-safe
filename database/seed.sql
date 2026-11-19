-- SS - Stay Safe | dados de exemplo
-- Rode depois do schema.sql. Como o schema recria o banco do zero,
-- a sequência schema.sql + seed.sql pode ser repetida quantas vezes quiser.
-- Todos os nomes e contatos abaixo são fictícios.

SET NAMES utf8mb4;
USE ss_stay_safe;

-- Usuário de demonstração
-- E-mail: coordenacao@staysafe.local | Senha: staysafe123
-- Hash gerado com: node server/gerar-hash.js staysafe123 (bcrypt, custo 10)
INSERT INTO usuario (nome, email, senha_hash) VALUES
  ('Coordenação Stay Safe', 'coordenacao@staysafe.local',
   '$2b$10$rrjnU4UarfAaHdk/DjJF1u7yGnLhYrs5SiBhd6w.t43MGnCt4.dRS');

INSERT INTO categoria (nome) VALUES
  ('EPI'),                  -- 1
  ('Primeiros socorros'),   -- 2
  ('Combate a incêndio'),   -- 3
  ('Sinalização');          -- 4

INSERT INTO item (id_categoria, nome, unidade) VALUES
  (1, 'Luva de raspa',             'par'),      -- 1
  (1, 'Botina de segurança',       'par'),      -- 2
  (1, 'Capacete de segurança',     'unidade'),  -- 3
  (1, 'Óculos de proteção',        'unidade'),  -- 4
  (1, 'Máscara PFF2',              'caixa'),    -- 5
  (2, 'Kit de primeiros socorros', 'kit'),      -- 6
  (2, 'Soro fisiológico 250 ml',   'unidade'),  -- 7
  (3, 'Extintor PQS 4 kg',         'unidade'),  -- 8
  (4, 'Cone de sinalização',       'unidade'),  -- 9
  (4, 'Colete refletivo',          'unidade');  -- 10

INSERT INTO doador (nome, email, telefone, ativo) VALUES
  ('Ana Paula Ribeiro',         'ana.ribeiro@example.com',   '(14) 99812-3301', TRUE),   -- 1
  ('Materiais de Construção Vale Verde', 'compras@example.com', '(14) 3433-1200', TRUE), -- 2
  ('Marcos Tanaka',             NULL,                        '(14) 99654-0087', TRUE),   -- 3
  ('Farmácia Popular do Centro','contato@example.org',       NULL,              TRUE),   -- 4
  ('Rita de Cássia Moura',      'rita.moura@example.com',    NULL,              FALSE);  -- 5 (parou de doar)

-- Doações de setembro a novembro de 2026, com os três status possíveis.
INSERT INTO doacao (id_doador, data_doacao, status, data_entrega, observacao) VALUES
  (2, '2026-09-08', 'entregue',  '2026-09-10', 'Sobra de obra; retirada no depósito'),       -- 1
  (4, '2026-09-22', 'entregue',  '2026-09-22', NULL),                                        -- 2
  (1, '2026-10-05', 'entregue',  '2026-10-07', NULL),                                        -- 3
  (5, '2026-10-14', 'cancelada', NULL,         'Doadora mudou de cidade antes da retirada'), -- 4
  (3, '2026-11-03', 'entregue',  '2026-11-04', 'Extintor recarregado em outubro'),           -- 5
  (2, '2026-11-12', 'pendente',  NULL,         'Combinar retirada com o encarregado'),       -- 6
  (1, '2026-11-17', 'pendente',  NULL,         NULL);                                        -- 7

-- data_validade só nos itens que vencem (kits, soro, extintor).
-- Os lotes das doações 2 e 5 vencem em dezembro de 2026, para aparecerem
-- na consulta de itens a vencer.
INSERT INTO doacao_item (id_doacao, id_item, quantidade, data_validade) VALUES
  (1, 1,  20, NULL),
  (1, 3,   6, NULL),
  (1, 9,   4, NULL),
  (2, 6,  10, '2026-12-15'),
  (2, 7,  24, '2027-08-30'),
  (3, 2,   3, NULL),
  (3, 10,  5, NULL),
  (4, 5,   2, NULL),
  (5, 8,   1, '2026-12-31'),
  (5, 4,   8, NULL),
  (6, 1,  30, NULL),
  (6, 2,  10, NULL),
  (7, 6,   5, '2028-03-01');
