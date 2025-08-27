DROP DATABASE IF EXISTS zelos;
create database zelos;
use zelos;

-- Criação da tabela `usuarios`
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE, -- Identificador do LDAP
    email VARCHAR(255) NOT NULL UNIQUE,
    funcao VARCHAR(100) NOT NULL,
    ftPerfil varchar(255),
    status_usuarios ENUM('ativo', 'inativo') DEFAULT 'ativo',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Criação da tabela `pool`
-- a Pool é a tabela dos diversos serviços oferecidos pelos técnicos
/* Lista de tipos/categorias de serviço ofertados*/
CREATE TABLE pool (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo ENUM('externo', 'manutencao', 'apoio_tecnico', 'limpeza') NOT NULL,
    descricao TEXT,
    status_pool ENUM('ativo', 'inativo') DEFAULT 'ativo',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,
	FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE CASCADE
);
insert into pool (titulo, descricao) values
('externo', 'Serviços realizados fora da empresa'),
('manutencao', 'Manutenção preventiva e corretiva' ),
('apoio_tecnico', 'Suporte e atendimento técnico' ),
('limpeza', 'Serviços de limpeza' );

CREATE TABLE usuario_servico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    servico_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (servico_id) REFERENCES pool(id) ON DELETE CASCADE
);

-- trigger
DELIMITER $$

CREATE TRIGGER after_usuario_insert
AFTER INSERT ON usuarios
FOR EACH ROW
BEGIN
    DECLARE servicoId INT;

    -- Técnico: externo, apoio técnico, manutenção
    IF NEW.funcao = 'tecnico' THEN
        INSERT INTO usuario_servico (usuario_id, servico_id)
        SELECT NEW.id, id FROM pool
        WHERE titulo IN ('externo', 'apoio_tecnico', 'manutencao');
    -- Auxiliar de limpeza: apenas limpeza
    ELSEIF NEW.funcao = 'auxiliar_limpeza' THEN
        INSERT INTO usuario_servico (usuario_id, servico_id)
        SELECT NEW.id, id FROM pool
        WHERE titulo = 'limpeza';
    -- Admin: todos os serviços
    ELSEIF NEW.funcao = 'admin' THEN
        INSERT INTO usuario_servico (usuario_id, servico_id)
        SELECT NEW.id, id FROM pool;
    -- Usuário comum: pode apenas solicitar (todos os serviços)
    ELSEIF NEW.funcao = 'usuario' THEN
        INSERT INTO usuario_servico (usuario_id, servico_id)
        SELECT NEW.id, id FROM pool;
    END IF;
END$$

DELIMITER ;

insert usuarios (nome, senha, username, email, funcao) values
("Julia Alves de Oliveira", "Senai@123", 'juliaalves', "juliaalvesdeo447@gmail.com", "admin"), /* administrador*/
("Maria de Brito Del Rey", "Senai@123", "mariabrito", "mebdelrey@gmail.com", "admin"), /* administrador*/
("Lorena Oshiro do Carmo", "Senai@123", "lorenaoshiro", "lorenaoshiro2007@gmail.com", "admin"), /* administrador*/
("Elias Coca Velloso", "Senai@123", "eliascoca", "elias@gmail.com", "tecnico"), /* externo */ 
("Eduardo de Oliveira", "Senai@123", "eduardooliveira", "eduardo@gmail.com", "tecnico"), /* externo */
("Henrique Lima", "Senai@123", "henriquealves", "henrique@gmail.com", "tecnico"), /* externo */
("Luciana Pereira", "Senai@123", "lucianapereira", "luciana.pereira@gmail.com", "tecnico"), /* externo */
("Ana Costa", "Senai@123", "anacosta", "ana.costa@gmail.com", "tecnico"), /* externo */
("Maria Oliveira", "Senai@123", "mariaoliveira", "maria.oliveira@gmail.com", "auxiliar_limpeza"), /* limpeza */
("Joana Santos", "Senai@123", "joanasantos", "joana.santos@gmail.com", "auxiliar_limpeza"), /* limpeza */
("Carlos Mendes", "Senai@123", "carlosmendes", "carlos.mendes@gmail.com", "auxiliar_limpeza"), /* limpeza */
("Paulo Silva", "Senai@123", "paulosilva", "paulo.silva@gmail.com", "auxiliar_limpeza"), /* limpeza */
("Fernanda Alves", "Senai@123", "fernandaaalves", "fernanda.alves@gmail.com", "auxiliar_limpeza") /* limpeza */;
INSERT INTO usuarios (nome, senha, username, email, funcao)
VALUES ('Usuário Teste', '123456', 'usuario1', 'usuario1@teste.com', 'usuario');

/* fts de perfil */
UPDATE usuarios SET ftPerfil = 'uploads/fernandaaalves.jpg' WHERE username = 'fernandaaalves';
UPDATE usuarios SET ftPerfil = 'uploads/henriquealves.jpg' WHERE username = 'henriquealves';
UPDATE usuarios SET ftPerfil = 'uploads/eliascoca.jpg' WHERE username = 'eliascoca';
UPDATE usuarios SET ftPerfil = 'uploads/mariaoliveira.jpg' WHERE username = 'mariaoliveira';
UPDATE usuarios SET ftPerfil = 'uploads/anacosta.jpg' WHERE username = 'anacosta';
UPDATE usuarios SET ftPerfil = 'uploads/lucianapereira.jpg' WHERE username = 'lucianapereira';
UPDATE usuarios SET ftPerfil = 'uploads/carlosmendes.jpg' WHERE username = 'carlosmendes';

CREATE TABLE prioridades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE,
  horas_limite INT NOT NULL,
  descricao VARCHAR(255) DEFAULT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- valores iniciais (ajustáveis pelo admin depois)
INSERT INTO prioridades (nome, horas_limite, descricao) VALUES
('baixa', 72, 'Prazo de 72 horas para resolução'),
('media', 24, 'Prazo de 24 horas para resolução'),
('alta', 8,  'Prazo de 8 horas para resolução');

CREATE TABLE chamados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assunto VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  tipo_id INT,
  tecnico_id INT,
  usuario_id INT,
  data_limite DATETIME NULL,
  patrimonio int,
  imagem VARCHAR(255),
  prioridade_id int,
  status_chamado ENUM('pendente', 'em andamento', 'concluido') DEFAULT 'pendente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finalizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tipo_id) REFERENCES pool(id) ON DELETE CASCADE,
  FOREIGN KEY (prioridade_id) REFERENCES prioridades(id) ON DELETE CASCADE,
  FOREIGN KEY (tecnico_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

INSERT INTO chamados (patrimonio, assunto, descricao, tipo_id, tecnico_id, usuario_id, imagem, prioridade_id, status_chamado, criado_em, finalizado_em) VALUES
(1000001, 'Limpeza de banheiros', 'Higienização completa dos banheiros do térreo.', 4, NULL, 1, NULL, '2', 'pendente', '2025-08-01 09:00:00', NULL),
(1000002, 'Limpeza do refeitório', 'Solicita-se limpeza pós-almoço.', 4, 11, 1, NULL, '2', 'concluido', '2025-08-03 11:00:00', '2025-08-03 12:00:00'),
(1000003, 'Desinfecção de estações', 'Limpeza com álcool nas estações de trabalho do 2º andar.', 4, NULL, 1, NULL, '1', 'pendente', '2025-08-04 08:30:00', NULL),
(1000004, 'Limpeza após reunião', 'Sala de reunião 3 precisa de limpeza após uso.', 4, 13, 1, NULL, '1', 'concluido', '2025-08-05 14:00:00', '2025-08-05 15:00:00'),
(1000005, 'Limpeza de carpetes', 'Carpetes da recepção precisam de aspiração.', 4, 9, 1, NULL, '2', 'em andamento', '2025-08-06 15:45:00', NULL),
(1000006, 'Limpeza da copa', 'Solicita-se limpeza da copa no fim do expediente.', 4, NULL, 1, NULL, '1', 'pendente', '2025-08-07 17:00:00', NULL),
(1000007, 'Limpeza da área externa', 'Área próxima ao estacionamento precisa de varrição.', 4, 11, 1, NULL, '2', 'em andamento', '2025-08-08 13:20:00', NULL),
(1000008, 'Reposição de materiais', 'Faltando papel toalha nos banheiros femininos.', 4, 12, 1, NULL, '3', 'concluido', '2025-08-09 09:10:00', '2025-08-09 09:25:00'),
(1000009, 'Problema na impressora', 'Impressora não está imprimindo.', 3, NULL, 2, 'uploads/impressoraNaoFunciona.webp', '3', 'pendente', '2025-08-10 08:00:00', NULL),
(1000010, 'Computador lento', 'PC demora muito para iniciar.', 3, NULL, 3, 'uploads/pcDemora.jpg', '1', 'pendente', '2025-08-10 08:30:00', NULL),
(1000011, 'Sem acesso à internet', 'Conexão caiu repentinamente.', 3, NULL, 4, 'uploads/semInternet.jpg', '3', 'pendente', '2025-08-10 09:00:00', NULL),
(1000012, 'Monitor apagado', 'Tela do monitor não acende.', 2, NULL, 5, 'uploads/monitorNaoAcende.webp', '1', 'pendente', '2025-08-10 09:30:00', NULL),
(1000013, 'Limpeza dos vidros da recepção', 'Vidros da entrada precisam ser limpos.', 4, NULL, 1, NULL, '2', 'pendente', '2025-08-10 10:00:00', NULL),
(1000014, 'Limpeza das janelas da TI', 'Janelas da sala de TI estão com muita poeira.', 4, 10, 1, 'uploads/limpezaJanelas.webp', '1', 'em andamento', '2025-08-02 10:00:00', NULL),
(1000015, 'Teclado com teclas falhando', 'Algumas teclas não funcionam.', 2, NULL, 6, NULL, '2', 'pendente', '2025-08-11 08:00:00', NULL),
(1000016, 'Erro no sistema', 'Sistema trava ao abrir módulo do curso.', 3, NULL, 7, NULL, '3', 'pendente', '2025-08-11 08:30:00', NULL),
(1000017, 'Telefone sem linha', 'Telefone fixo não recebe chamadas.', 3, NULL, 8, NULL, '2', 'pendente', '2025-08-11 09:00:00', NULL),
(1000018, 'Queda de energia', 'Sala ficou sem luz após curto-circuito.', 2, NULL, 9, NULL, '3', 'pendente', '2025-08-11 09:30:00', NULL),
(1000019, 'Atendimento externo para manutenção de impressora', 'Técnico deverá se deslocar até a unidade do cliente para manutenção da impressora.', 1, 4, 1, NULL, '3', 'em andamento', '2025-08-11 11:00:00', NULL),
(1000020, 'Câmera de segurança inoperante', 'Câmera não transmite imagem.', 2, NULL, 10, NULL, '2', 'pendente', '2025-08-12 08:00:00', NULL),
(1000021, 'Problema no projetor', 'Imagem do projetor está desfocada.', 2, NULL, 2, NULL, '1', 'pendente', '2025-08-12 08:30:00', NULL),
(1000022, 'Troca de HD', 'HD com setores defeituosos, troca em andamento.', 2, 4, 3, NULL, '3', 'em andamento', '2025-08-12 09:00:00', NULL),
(1000023, 'Manutenção externa de roteador', 'Técnico deverá visitar cliente para manutenção do roteador.', 1, 5, 1, NULL, '3', 'em andamento', '2025-08-12 09:30:00', NULL),
(1000024, 'Instalação de software', 'Instalando novo sistema de gestão.', 3, 5, 4, NULL, '2', 'em andamento', '2025-08-12 09:30:00', NULL),
(1000025, 'Troca de equipamento no cliente', 'Substituição de hardware defeituoso no local do cliente.', 1, 6, 1, NULL, '2', 'pendente', '2025-08-12 10:00:00', NULL),
(1000026, 'Atualização remota de software', 'Atualização do sistema via acesso remoto.', 1, NULL, 1, NULL, '1', 'pendente', '2025-08-13 11:00:00', NULL),
(1000027, 'Ajuste na rede', 'Reconfigurando roteadores e switches.', 3, 6, 5, NULL, '3', 'em andamento', '2025-08-13 08:00:00', NULL),
(1000028, 'Limpeza interna do PC', 'Retirando poeira e trocando pasta térmica.', 4, 9, 6, NULL, '1', 'em andamento', '2025-08-13 08:30:00', NULL),
(1000029, 'Atualização de drivers', 'Atualizando drivers de vídeo e áudio.', 3, 5, 7, NULL, '2', 'em andamento', '2025-08-13 09:00:00', NULL),
(1000030, 'Substituição de cabo', 'Trocando cabo HDMI defeituoso.', 2, 6, 8, NULL, '1', 'em andamento', '2025-08-13 09:30:00', NULL),
(1000031, 'Correção de bug', 'Ajustando falha no sistema interno.', 3, 7, 9, NULL, '3', 'em andamento', '2025-08-14 08:00:00', NULL),
(1000032, 'Backup de dados', 'Realizando cópia de segurança.', 3, 8, 10, NULL, '2', 'em andamento', '2025-08-14 08:30:00', NULL),
(1000033, 'Reparo de sistema de segurança', 'Correção de falhas no sistema de segurança instalado externamente.', 1, 7, 1, NULL, '3', 'em andamento', '2025-08-14 14:20:00', NULL),
(1000034, 'Troca de memória RAM', 'Instalando pentes novos de RAM.', 2, 7, 2, NULL, '3', 'em andamento', '2025-08-14 09:00:00', NULL),
(1000035, 'Testes de rede', 'Executando testes de estabilidade.', 3, 8, 3, NULL, '1', 'em andamento', '2025-08-14 09:30:00', NULL),
(1000036, 'Inspeção preventiva em equipamento', 'Visita para inspeção preventiva e manutenção.', 1, 8, 1, NULL, '2', 'concluido', '2025-08-15 08:00:00', '2025-08-15 10:00:00'),
(1000037, 'Troca de mouse', 'Mouse defeituoso substituído.', 2, 4, 4, NULL, '1', 'concluido', '2025-08-15 08:00:00', '2025-08-15 08:10:00'),
(1000038, 'Formatação de PC', 'Computador formatado com sucesso.', 3, 4, 5, NULL, '2', 'concluido', '2025-08-15 08:30:00', '2025-08-15 09:30:00'),
(1000039, 'Troca de monitor', 'Novo monitor instalado.', 2, 5, 6, NULL, '3', 'concluido', '2025-08-15 09:00:00', '2025-08-15 09:30:00'),
(1000040, 'Reparo de teclado', 'Teclado com teclas substituídas.', 2, 6, 7, NULL, '2', 'concluido', '2025-08-15 09:30:00', '2025-08-15 10:00:00'),
(1000041, 'Configuração de rede externa', 'Configuração de rede no cliente.', 1, NULL, 1, NULL, '1', 'pendente', '2025-08-15 09:45:00', NULL),
(1000042, 'Instalação de impressora', 'Nova impressora configurada.', 3, 7, 8, NULL, '1', 'concluido', '2025-08-16 08:00:00', '2025-08-16 08:45:00'),
(1000043, 'Configuração de rede', 'Rede ajustada e funcionando.', 3, 8, 9, NULL, '3', 'concluido', '2025-08-16 08:30:00', '2025-08-16 09:15:00'),
(1000044, 'Reparo de projetor', 'Imagem ajustada e projetor funcional.', 2, 5, 10, NULL, '2', 'concluido', '2025-08-16 09:00:00', '2025-08-16 09:45:00'),
(1000045, 'Limpeza de gabinete', 'Limpeza interna concluída.', 4, 10, 2, NULL, '1', 'concluido', '2025-08-16 09:30:00', '2025-08-16 10:15:00'),
(1000046, 'Suporte técnico externo', 'Atendimento remoto e presencial para suporte técnico.', 1, 4, 1, NULL, '2', 'em andamento', '2025-08-16 10:30:00', NULL),
(1000047, 'Atualização de sistema', 'Sistema atualizado para última versão.', 3, 6, 3, NULL, '3', 'concluido', '2025-08-17 08:00:00', '2025-08-17 09:30:00'),
(1000048, 'Troca de fonte de PC', 'Fonte de alimentação substituída.', 2, 4, 4, NULL, '2', 'concluido', '2025-08-17 08:30:00', '2025-08-17 09:00:00'),
(1000049, 'Reparo de equipamento de comunicação', 'Correção de falha em equipamento de comunicação.', 1, 5, 1, NULL, '3', 'concluido', '2025-08-17 13:00:00', '2025-08-17 14:30:00'),
(1000050, 'Manutenção corretiva em servidor externo', 'Correção urgente no servidor do cliente.', 1, NULL, 1, NULL, '3', 'pendente', '2025-08-17 15:00:00', NULL),
(1000051, 'Limpeza de vidros externos', 'Limpeza completa dos vidros da fachada.', 4, 11, 1, NULL, '2', 'concluido', '2025-03-10 09:00:00', '2025-03-10 12:00:00'),
(1000052, 'Aspiração de carpetes', 'Limpeza do setor administrativo.', 4, 9, 1, NULL, '1', 'concluido', '2025-04-15 10:00:00', '2025-04-15 12:00:00'),
(1000053, 'Limpeza de garagem', 'Remoção de resíduos da garagem subterrânea.', 4, 12, 1, NULL, '2', 'concluido', '2025-05-20 13:00:00', '2025-05-20 15:00:00'),
(1000054, 'Higienização de elevadores', 'Limpeza dos elevadores principais.', 4, 13, 1, NULL, '3', 'concluido', '2025-06-05 08:45:00', '2025-06-05 10:00:00'),
(1000055, 'Limpeza de salas de reunião', 'Revisão nas salas do 1º andar.', 4, 10, 1, NULL, '2', 'concluido', '2025-06-18 14:30:00', '2025-06-18 16:00:00'),
(1000056, 'Limpeza das janelas internas', 'Limpeza geral das janelas dos corredores.', 4, 11, 1, 'uploads/limpezaJanelas.webp', '1', 'concluido', '2025-05-11 16:00:00', '2025-05-11 18:00:00'),
(1000057, 'Limpeza do depósito', 'Organização e limpeza do almoxarifado.', 4, 13, 1, NULL, '2', 'concluido', '2025-04-03 09:15:00', '2025-04-03 11:30:00'),
(1000058, 'Desinfecção de refeitório', 'Limpeza pesada com produtos bactericidas.', 4, 12, 1, NULL, '3', 'concluido', '2025-03-22 10:30:00', '2025-03-22 12:00:00'),
(1000059, 'Higienização de cadeiras', 'Limpeza das cadeiras do auditório.', 4, 9, 1, NULL, '1', 'concluido', '2025-07-01 12:00:00', '2025-07-01 14:00:00'),
(1000060, 'Faxina geral do prédio', 'Faxina nos andares 1 a 3.', 4, 10, 1, NULL, '3', 'concluido', '2025-07-25 17:00:00', '2025-07-25 20:00:00');

-- Criação da tabela `apontamentos`
CREATE TABLE apontamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chamado_id INT,
    tecnico_id INT,
    descricao TEXT,
    comeco TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fim TIMESTAMP NULL,
    duracao INT AS (TIMESTAMPDIFF(SECOND, comeco, fim)) STORED, -- Calcula a duração em segundos
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chamado_id) REFERENCES chamados(id) ON DELETE CASCADE,
    FOREIGN KEY (tecnico_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

create table mensagens (
	id int auto_increment primary key,
	id_usuario int,
	id_tecnico int,
	conteudo text,
	id_chamado int, -- isso vai ser o identificador do chat
	data_envio datetime default current_timestamp,
	lida boolean default false,
	FOREIGN KEY (id_tecnico) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_chamado) REFERENCES chamados(id) ON DELETE CASCADE
);

create table relatorios(
    id int auto_increment primary key,
    id_usuario int,
    id_tecnico int,
    id_chamado int,
    relatorio text,
    data_envio datetime default current_timestamp,
    FOREIGN KEY (id_tecnico) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_chamado) REFERENCES chamados(id) ON DELETE CASCADE
);

CREATE TABLE notificacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo ENUM('status_atualizado', 'tecnico_atribuido', 'resposta_tecnico', 'prazo_alterado', 'notificacao_geral', 'novo_chamado_atribuido', 'resposta_usuario', 'urgencia_chamado',
  'chamado_editado_usuario', 'chamado_atrasado', 'tecnico_removido', 'avaliacao_negativa') NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  chamado_id INT DEFAULT NULL,
  lida BOOLEAN DEFAULT FALSE,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (chamado_id) REFERENCES chamados(id)
);

CREATE TABLE redefinir_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  usado BOOLEAN DEFAULT FALSE
);

CREATE TABLE avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL, -- quem avaliou
    tecnico_id INT NOT NULL,  -- técnico avaliado
    nota INT NOT NULL CHECK (nota BETWEEN 1 AND 5), -- nota de 1 a 5
    comentario TEXT, -- comentário opcional
    data_avaliacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (tecnico_id) REFERENCES usuarios(id) ON DELETE CASCADE
);


-- Índices adicionais para otimização
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_chamados_status ON chamados(status_chamado);
CREATE INDEX idx_apontamentos_comeco_fim ON apontamentos(comeco, fim);

select *from chamados;
select *from apontamentos;