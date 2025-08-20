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
("Julia Alves de Oliveira", "Senai@123", 'juliaalves', "julia@gmail.com", "admin"), /* administrador*/
("Maria de Brito Del Rey", "Senai@123", "mariabrito", "maria@gmail.com", "admin"), /* administrador*/
("Lorena Oshiro do Carmo", "Senai@123", "lorenaoshiro", "lorena@gmail.com", "admin"), /* administrador*/
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

/* fts de perfil */
UPDATE usuarios SET ftPerfil = 'uploads/fernandaaalves.jpg' WHERE username = 'fernandaaalves';
UPDATE usuarios SET ftPerfil = 'uploads/henriquealves.jpg' WHERE username = 'henriquealves';
UPDATE usuarios SET ftPerfil = 'uploads/eliascoca.jpg' WHERE username = 'eliascoca';
UPDATE usuarios SET ftPerfil = 'uploads/mariaoliveira.jpg' WHERE username = 'mariaoliveira';
UPDATE usuarios SET ftPerfil = 'uploads/anacosta.jpg' WHERE username = 'anacosta';
UPDATE usuarios SET ftPerfil = 'uploads/lucianapereira.jpg' WHERE username = 'lucianapereira';
UPDATE usuarios SET ftPerfil = 'uploads/carlosmendes.jpg' WHERE username = 'carlosmendes';

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
  prioridade ENUM ('none','baixa', 'media', 'alta') DEFAULT 'none',
  status_chamado ENUM('pendente', 'em andamento', 'concluido') DEFAULT 'pendente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finalizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tipo_id) REFERENCES pool(id) ON DELETE CASCADE,
  FOREIGN KEY (tecnico_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

INSERT INTO chamados (assunto, descricao, tipo_id, tecnico_id, usuario_id, imagem, prioridade, status_chamado, criado_em, finalizado_em) VALUES
('Limpeza de banheiros', 'Higienização completa dos banheiros do térreo.', 4, NULL, 1, NULL, 'media', 'pendente', '2025-08-01 09:00:00', NULL),
('Limpeza do refeitório', 'Solicita-se limpeza pós-almoço.', 4, 11, 1, NULL, 'media', 'concluido', '2025-08-03 11:00:00', '2025-08-03 12:00:00'),
('Desinfecção de estações', 'Limpeza com álcool nas estações de trabalho do 2º andar.', 4, NULL, 1, NULL, 'baixa', 'pendente', '2025-08-04 08:30:00', NULL),
('Limpeza após reunião', 'Sala de reunião 3 precisa de limpeza após uso.', 4, 13, 1, NULL, 'baixa', 'concluido', '2025-08-05 14:00:00', '2025-08-05 15:00:00'),
('Limpeza de carpetes', 'Carpetes da recepção precisam de aspiração.', 4, 9, 1, NULL, 'media', 'em andamento', '2025-08-06 15:45:00', NULL),
('Limpeza da copa', 'Solicita-se limpeza da copa no fim do expediente.', 4, NULL, 1, NULL, 'baixa', 'pendente', '2025-08-07 17:00:00', NULL),
('Limpeza da área externa', 'Área próxima ao estacionamento precisa de varrição.', 4, 11, 1, NULL, 'media', 'em andamento', '2025-08-08 13:20:00', NULL),
('Reposição de materiais', 'Faltando papel toalha nos banheiros femininos.', 4, 12, 1, NULL, 'alta', 'concluido', '2025-08-09 09:10:00', '2025-08-09 09:25:00'),
('Problema na impressora', 'Impressora não está imprimindo.', 3, NULL, 2, NULL, 'media', 'pendente', '2025-08-10 08:00:00', NULL),
('Computador lento', 'PC demora muito para iniciar.', 3, NULL, 3, NULL, 'baixa', 'pendente', '2025-08-10 08:30:00', NULL),
('Sem acesso à internet', 'Conexão caiu repentinamente.', 3, NULL, 4, NULL, 'alta', 'pendente', '2025-08-10 09:00:00', NULL),
('Monitor apagado', 'Tela do monitor não acende.', 2, NULL, 5, NULL, 'baixa', 'pendente', '2025-08-10 09:30:00', NULL),
('Limpeza dos vidros da recepção', 'Vidros da entrada precisam ser limpos.', 4, NULL, 1, NULL, 'media', 'pendente', '2025-08-10 10:00:00', NULL),
('Limpeza das janelas da TI', 'Janelas da sala de TI estão com muita poeira.', 4, 10, 1, NULL, 'baixa', 'em andamento', '2025-08-02 10:00:00', NULL),
('Teclado com teclas falhando', 'Algumas teclas não funcionam.', 2, NULL, 6, NULL, 'none', 'pendente', '2025-08-11 08:00:00', NULL),
('Erro no sistema', 'Sistema trava ao abrir módulo de vendas.', 3, NULL, 7, NULL, 'alta', 'pendente', '2025-08-11 08:30:00', NULL),
('Telefone sem linha', 'Telefone fixo não recebe chamadas.', 3, NULL, 8, NULL, 'media', 'pendente', '2025-08-11 09:00:00', NULL),
('Queda de energia', 'Sala ficou sem luz após curto-circuito.', 2, NULL, 9, NULL, 'alta', 'pendente', '2025-08-11 09:30:00', NULL),
('Atendimento externo para manutenção de impressora', 'Técnico deverá se deslocar até a unidade do cliente para manutenção da impressora.', 1, 4, 1, NULL, 'alta', 'em andamento', '2025-08-11 11:00:00', NULL),
('Câmera de segurança inoperante', 'Câmera não transmite imagem.', 2, NULL, 10, NULL, 'media', 'pendente', '2025-08-12 08:00:00', NULL),
('Problema no projetor', 'Imagem do projetor está desfocada.', 2, NULL, 2, NULL, 'baixa', 'pendente', '2025-08-12 08:30:00', NULL),
('Troca de HD', 'HD com setores defeituosos, troca em andamento.', 2, 1, 3, NULL, 'alta', 'em andamento', '2025-08-12 09:00:00', NULL),
('Manutenção externa de roteador', 'Técnico deverá visitar cliente para manutenção do roteador.', 1, 5, 1, NULL, 'alta', 'em andamento', '2025-08-12 09:30:00', NULL),
('Instalação de software', 'Instalando novo sistema de gestão.', 3, 2, 4, NULL, 'media', 'em andamento', '2025-08-12 09:30:00', NULL),
('Troca de equipamento no cliente', 'Substituição de hardware defeituoso no local do cliente.', 1, 6, 1, NULL, 'media', 'pendente', '2025-08-12 10:00:00', NULL),
('Atualização remota de software', 'Atualização do sistema via acesso remoto.', 1, NULL, 1, NULL, 'baixa', 'pendente', '2025-08-13 11:00:00', NULL),
('Ajuste na rede', 'Reconfigurando roteadores e switches.', 3, 3, 5, NULL, 'alta', 'em andamento', '2025-08-13 08:00:00', NULL),
('Limpeza interna do PC', 'Retirando poeira e trocando pasta térmica.', 4, 4, 6, NULL, 'baixa', 'em andamento', '2025-08-13 08:30:00', NULL),
('Atualização de drivers', 'Atualizando drivers de vídeo e áudio.', 3, 5, 7, NULL, 'media', 'em andamento', '2025-08-13 09:00:00', NULL),
('Substituição de cabo', 'Trocando cabo HDMI defeituoso.', 2, 6, 8, NULL, 'baixa', 'em andamento', '2025-08-13 09:30:00', NULL),
('Correção de bug', 'Ajustando falha no sistema interno.', 3, 7, 9, NULL, 'alta', 'em andamento', '2025-08-14 08:00:00', NULL),
('Backup de dados', 'Realizando cópia de segurança.', 3, 8, 10, NULL, 'media', 'em andamento', '2025-08-14 08:30:00', NULL),
('Reparo de sistema de segurança', 'Correção de falhas no sistema de segurança instalado externamente.', 1, 7, 1, NULL, 'alta', 'em andamento', '2025-08-14 14:20:00', NULL),
('Troca de memória RAM', 'Instalando pentes novos de RAM.', 2, 1, 2, NULL, 'alta', 'em andamento', '2025-08-14 09:00:00', NULL),
('Testes de rede', 'Executando testes de estabilidade.', 3, 2, 3, NULL, 'baixa', 'em andamento', '2025-08-14 09:30:00', NULL),
('Inspeção preventiva em equipamento', 'Visita para inspeção preventiva e manutenção.', 1, 8, 1, NULL, 'media', 'concluido', '2025-08-15 08:00:00', '2025-08-15 10:00:00'),
('Troca de mouse', 'Mouse defeituoso substituído.', 2, 3, 4, NULL, 'baixa', 'concluido', '2025-08-15 08:00:00', '2025-08-15 08:10:00'),
('Formatação de PC', 'Computador formatado com sucesso.', 3, 4, 5, NULL, 'media', 'concluido', '2025-08-15 08:30:00', '2025-08-15 09:30:00'),
('Troca de monitor', 'Novo monitor instalado.', 2, 5, 6, NULL, 'alta', 'concluido', '2025-08-15 09:00:00', '2025-08-15 09:30:00'),
('Reparo de teclado', 'Teclado com teclas substituídas.', 2, 6, 7, NULL, 'media', 'concluido', '2025-08-15 09:30:00', '2025-08-15 10:00:00'),
('Configuração de rede externa', 'Configuração de rede no cliente.', 1, NULL, 1, NULL, 'baixa', 'pendente', '2025-08-15 09:45:00', NULL),
('Instalação de impressora', 'Nova impressora configurada.', 3, 7, 8, NULL, 'baixa', 'concluido', '2025-08-16 08:00:00', '2025-08-16 08:45:00'),
('Configuração de rede', 'Rede ajustada e funcionando.', 3, 8, 9, NULL, 'alta', 'concluido', '2025-08-16 08:30:00', '2025-08-16 09:15:00'),
('Reparo de projetor', 'Imagem ajustada e projetor funcional.', 2, 1, 10, NULL, 'media', 'concluido', '2025-08-16 09:00:00', '2025-08-16 09:45:00'),
('Limpeza de gabinete', 'Limpeza interna concluída.', 4, 2, 2, NULL, 'baixa', 'concluido', '2025-08-16 09:30:00', '2025-08-16 10:15:00'),
('Suporte técnico externo', 'Atendimento remoto e presencial para suporte técnico.', 1, 4, 1, NULL, 'media', 'em andamento', '2025-08-16 10:30:00', NULL),
('Atualização de sistema', 'Sistema atualizado para última versão.', 3, 3, 3, NULL, 'alta', 'concluido', '2025-08-17 08:00:00', '2025-08-17 09:30:00'),
('Troca de fonte de PC', 'Fonte de alimentação substituída.', 2, 4, 4, NULL, 'media', 'concluido', '2025-08-17 08:30:00', '2025-08-17 09:00:00'),
('Reparo de equipamento de comunicação', 'Correção de falha em equipamento de comunicação.', 1, 5, 1, NULL, 'alta', 'concluido', '2025-08-17 13:00:00', '2025-08-17 14:30:00'),
('Manutenção corretiva em servidor externo', 'Correção urgente no servidor do cliente.', 1, NULL, 1, NULL, 'alta', 'pendente', '2025-08-17 15:00:00', NULL),
('Limpeza de vidros externos', 'Limpeza completa dos vidros da fachada.', 4, 11, 1, NULL, 'media', 'concluido', '2025-03-10 09:00:00', '2025-03-10 12:00:00'),
('Aspiração de carpetes', 'Limpeza do setor administrativo.', 4, 9, 1, NULL, 'baixa', 'concluido', '2025-04-15 10:00:00', '2025-04-15 12:00:00'),
('Limpeza de garagem', 'Remoção de resíduos da garagem subterrânea.', 4, 12, 1, NULL, 'media', 'concluido', '2025-05-20 13:00:00', '2025-05-20 15:00:00'),
('Higienização de elevadores', 'Limpeza dos elevadores principais.', 4, 13, 1, NULL, 'alta', 'concluido', '2025-06-05 08:45:00', '2025-06-05 10:00:00'),
('Limpeza de salas de reunião', 'Revisão nas salas do 1º andar.', 4, 10, 1, NULL, 'media', 'concluido', '2025-06-18 14:30:00', '2025-06-18 16:00:00'),
('Limpeza das janelas internas', 'Limpeza geral das janelas dos corredores.', 4, 11, 1, NULL, 'baixa', 'concluido', '2025-05-11 16:00:00', '2025-05-11 18:00:00'),
('Limpeza do depósito', 'Organização e limpeza do almoxarifado.', 4, 13, 1, NULL, 'media', 'concluido', '2025-04-03 09:15:00', '2025-04-03 11:30:00'),
('Desinfecção de refeitório', 'Limpeza pesada com produtos bactericidas.', 4, 12, 1, NULL, 'alta', 'concluido', '2025-03-22 10:30:00', '2025-03-22 12:00:00'),
('Higienização de cadeiras', 'Limpeza das cadeiras do auditório.', 4, 9, 1, NULL, 'baixa', 'concluido', '2025-07-01 12:00:00', '2025-07-01 14:00:00'),
('Faxina geral do prédio', 'Faxina nos andares 1 a 3.', 4, 10, 1, NULL, 'alta', 'concluido', '2025-07-25 17:00:00', '2025-07-25 20:00:00');


/*  after insert -> serve para definir a data_limite logo no momento da criação, com base na prioridade informada.
after update -> util caso a prioridade seja mudada depois da criação.
DELIMITER $$

-- Quando INSERE um chamado
CREATE TRIGGER trg_chamados_sla_insert
AFTER INSERT ON chamados
FOR EACH ROW
BEGIN
    UPDATE chamados
    SET data_limite = CASE NEW.prioridade
        WHEN 'baixa'   THEN DATE_ADD(NEW.criado_em, INTERVAL 72 HOUR)
        WHEN 'media'   THEN DATE_ADD(NEW.criado_em, INTERVAL 24 HOUR)
        WHEN 'alta'    THEN DATE_ADD(NEW.criado_em, INTERVAL 8 HOUR)
        WHEN 'urgente' THEN DATE_ADD(NEW.criado_em, INTERVAL 4 HOUR)
        ELSE NULL
    END
    WHERE id = NEW.id;
END$$

-- Quando ATUALIZA a prioridade
CREATE TRIGGER trg_chamados_sla_update
AFTER UPDATE ON chamados
FOR EACH ROW
BEGIN
    -- recalcula só se a prioridade mudou
    IF NEW.prioridade <> OLD.prioridade THEN
        UPDATE chamados
        SET data_limite = CASE NEW.prioridade
            WHEN 'baixa'   THEN DATE_ADD(NEW.criado_em, INTERVAL 72 HOUR)
            WHEN 'media'   THEN DATE_ADD(NEW.criado_em, INTERVAL 24 HOUR)
            WHEN 'alta'    THEN DATE_ADD(NEW.criado_em, INTERVAL 8 HOUR)
            WHEN 'urgente' THEN DATE_ADD(NEW.criado_em, INTERVAL 4 HOUR)
            ELSE NULL
        END
        WHERE id = NEW.id;
    END IF;
END$$

DELIMITER ;
*/

-- Criação da tabela `apontamentos`
CREATE TABLE apontamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chamado_id INT,
    tecnico_id INT,
    descricao TEXT,
    comeco TIMESTAMP NOT NULL,
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

-- Índices adicionais para otimização
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_chamados_status ON chamados(status_chamado);
CREATE INDEX idx_apontamentos_comeco_fim ON apontamentos(comeco, fim);

select *from usuarios;
select *from chamados;
select *from usuario_servico;

SELECT c.*, u.nome AS nome_usuario
FROM chamados c
INNER JOIN usuario_servico us ON us.servico_id = c.tipo_id
INNER JOIN usuarios u ON u.id = c.usuario_id
WHERE us.usuario_id = 4 AND c.status_chamado = 'em andamento' AND c.tecnico_id = 4
ORDER BY c.criado_em DESC;

