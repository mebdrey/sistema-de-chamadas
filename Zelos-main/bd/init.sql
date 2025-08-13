/*-- drop database zelos;
create database zelos;
use zelos;

-- Criação da tabela `usuarios`
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    numServico numeric not null unique,
    email VARCHAR(255) NOT NULL UNIQUE,
    funcao VARCHAR(100) NOT NULL,
    status_usuarios ENUM('ativo', 'inativo') DEFAULT 'ativo',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
select * from chamados;
insert usuarios (nome, senha, numServico, email, funcao) value
("Julia Alves de Oliveira", "Senai@123", '90452786', "julia@gmail.com", "admin"),
("Maria de Brito Del Rey", "Senai@123", "84766243", "maria@gmail.com", "admin"),
("Lorena Oshiro do Carmo", "Senai@123", "87036285", "lorena@gmail.com", "admin"),
("Elias Coca Velloso", "Senai@123", "29572557", "elias@gmail.com", "tecnico");

-- Criação da tabela `pool` Lista de tipos/categorias de serviço ofertados
CREATE TABLE pool (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo ENUM('externo', 'manutencao', 'apoio_tecnico', 'limpeza') NOT NULL,
    descricao TEXT,
    status_pool ENUM('ativo', 'inativo') DEFAULT 'ativo',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,
    FOREIGN KEY (created_by) REFERENCES usuarios(id),
    FOREIGN KEY (updated_by) REFERENCES usuarios(id)
);

create table localChamado(
id int auto_increment primary key, 
	bloco ENUM ('bloco_a', 'bloco_b', 'bloco_c', 'bloco_d'),
    sala varchar(10),
    equipamento varchar(100) not null
);

CREATE TABLE chamados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assunto VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    tipo_id INT,
    tecnico_id INT,
    usuario_id INT,
    patrimonio int,
    imagem VARCHAR(255),
    prioridade ENUM ('none','baixa', 'média', 'alta') DEFAULT 'none',
    status_chamado ENUM('pendente', 'em andamento', 'concluído') DEFAULT 'pendente',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tipo_id) REFERENCES pool(id),
    FOREIGN KEY (patrimonio) REFERENCES localChamado(id),
    FOREIGN KEY (tecnico_id) REFERENCES usuarios(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- registros de localChamado com equipamento registrado
INSERT INTO localChamado (bloco, sala, equipamento) VALUES
-- bloco D
('bloco_d', 'd0-1001', 'Teclado'),('bloco_d', 'd0-1002', 'Computador'),('bloco_d', 'd0-1003', 'Monitor'),
('bloco_d', 'd0-1004', 'Switch'),('bloco_d', 'd0-1005', 'Mouse'), ('bloco_d', 'd0-1006', 'Projetor'),
('bloco_d', 'd0-1007', 'Torno'),('bloco_d', 'd0-1008', 'Impressora'),('bloco_d', 'd0-1009', 'Scanner'),
('bloco_d', 'd0-1010', 'Estabilizador'),('bloco_d', 'd0-1011', 'Nobreak'),('bloco_d', 'd0-1012', 'Teclado'),
-- bloco C
('bloco_c', 'c0-1001', 'Computador'),('bloco_c', 'c0-1002', 'Monitor'),('bloco_c', 'c0-1003', 'Switch'),
('bloco_c', 'c0-1004', 'Mouse'),('bloco_c', 'c0-1005', 'Projetor'),('bloco_c', 'c0-1006', 'Torno'),
('bloco_c', 'c0-1007', 'Impressora'),('bloco_c', 'c0-1008', 'Scanner'),('bloco_c', 'c0-1009', 'Estabilizador'),
('bloco_c', 'c0-1010', 'Nobreak'),('bloco_c', 'c0-1011', 'Teclado'),('bloco_c', 'c0-1012', 'Computador'),
-- bloco B
('bloco_b', 'b0-1001', 'Monitor'),('bloco_b', 'b0-1002', 'Switch'),('bloco_b', 'b0-1003', 'Mouse'),
('bloco_b', 'b0-1004', 'Projetor'),('bloco_b', 'b0-1005', 'Torno'),('bloco_b', 'b0-1006', 'Impressora'),
('bloco_b', 'b0-1007', 'Scanner'),('bloco_b', 'b0-1008', 'Estabilizador'),('bloco_b', 'b0-1009', 'Nobreak'),
('bloco_b', 'b0-1010', 'Mesa digitalizadora'),('bloco_b', 'b0-1011', 'Notebook'),('bloco_b', 'b0-1012', 'Tablet'),
-- bloco A
('bloco_a', 'a0-1001', 'Telefone IP'),('bloco_a', 'a0-1002', 'Central telefônica'),('bloco_a', 'a0-1003', 'Roteador'),
('bloco_a', 'a0-1004', 'Access Point'),('bloco_a', 'a0-1005', 'Servidor'),('bloco_a', 'a0-1006', 'Cabo de rede'),
('bloco_a', 'a0-1007', 'Cadeira ergonômica'),('bloco_a', 'a0-1008', 'Mesa de escritório'),('bloco_a', 'a0-1009', 'Armário metálico'),
('bloco_a', 'a0-1010', 'Etiqueta eletrônica'),('bloco_a', 'a0-1011', 'Controladora de acesso'),('bloco_a', 'a0-1012', 'Teclado');

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
    FOREIGN KEY (chamado_id) REFERENCES chamados(id),
    FOREIGN KEY (tecnico_id) REFERENCES usuarios(id)
);

-- Criação da tabela `pool_tecnico` Relaciona quais técnicos podem atuar em quais pools
CREATE TABLE pool_tecnico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_pool INT,
    id_tecnico INT,
    FOREIGN KEY (id_pool) REFERENCES pool(id),
    FOREIGN KEY (id_tecnico) REFERENCES usuarios(id)
);
CREATE TABLE redefinir_tokens (
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  criacao DATETIME NOT NULL
);
create table mensagens (
id int auto_increment primary key,
id_usuario int,
id_tecnico int,
conteudo text,
id_chamado int, -- isso vai ser o identificador do chat
data_envio datetime default current_timestamp,
lida boolean default false,
foreign key (id_tecnico) references usuarios(id),
foreign key (id_usuario) references usuarios(id),
foreign key (id_chamado) references chamados(id)
);

-- Índices adicionais para otimização
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_chamados_status ON chamados(status_chamado);
CREATE INDEX idx_apontamentos_comeco_fim ON apontamentos(comeco, fim);

insert into pool (titulo, descricao) values
('externo', 'Serviços realizados fora da empresa'),
('manutencao', 'Manutenção preventiva e corretiva' ),
('apoio_tecnico', 'Suporte e atendimento técnico' ),
('limpeza', 'Serviços de limpeza' );
*/

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
    ELSEIF NEW.funcao = 'auxiliar de limpeza' THEN
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

insert usuarios (nome, senha, username, email, funcao) value
("Julia Alves de Oliveira", "Senai@123", '90452786', "julia@gmail.com", "admin"), /* administrador*/
("Maria de Brito Del Rey", "Senai@123", "84766243", "maria@gmail.com", "admin"), /* administrador*/
("Lorena Oshiro do Carmo", "Senai@123", "87036285", "lorena@gmail.com", "admin"), /* administrador*/
("Elias Coca Velloso", "Senai@123", "29572557", "elias@gmail.com", "tecnico"), /* externo */ 
("Eduardo de Oliveira", "Senai@123", "67240311", "eduardo@gmail.com", "tecnico"), /* externo */
("Henrique Lima", "Senai@123", "56951065", "henrique@gmail.com", "tecnico"), /* externo */
("Luciana Pereira", "Senai@123", "82649175", "luciana.pereira@gmail.com", "tecnico"), /* externo */
("Ana Costa", "Senai@123", "91726483", "ana.costa@gmail.com", "tecnico"), /* externo */
("Maria Oliveira", "Senai@123", "63829147", "maria.oliveira@gmail.com", "auxiliar de limpeza"), /* limpeza */
("Joana Santos", "Senai@123", "75918263", "joana.santos@gmail.com", "auxiliar de limpeza"), /* limpeza */
("Carlos Mendes", "Senai@123", "48291347", "carlos.mendes@gmail.com", "auxiliar de limpeza"), /* limpeza */
("Paulo Silva", "Senai@123", "19583746", "paulo.silva@gmail.com", "auxiliar de limpeza"), /* limpeza */
("Fernanda Alves", "Senai@123", "28491736", "fernanda.alves@gmail.com", "auxiliar de limpeza") /* limpeza */;

create table localChamado(
id int auto_increment primary key, 
	bloco ENUM ('bloco_a', 'bloco_b', 'bloco_c', 'bloco_d'),
    sala varchar(10)
);
INSERT INTO localChamado (bloco, sala) VALUES
-- bloco D
('bloco_d', 'd0-1001'), ('bloco_d', 'd0-1002'), ('bloco_d', 'd0-1003'), ('bloco_d', 'd0-1004'), ('bloco_d', 'd0-1005'), ('bloco_d', 'd0-1006'), ('bloco_d', 'd0-1007'), ('bloco_d', 'd0-1008'), ('bloco_d', 'd0-1009'), ('bloco_d', 'd0-1010'), ('bloco_d', 'd0-1011'), ('bloco_d', 'd0-1012'),
-- bloco C
('bloco_c', 'c0-1001'), ('bloco_c', 'c0-1002'), ('bloco_c', 'c0-1003'), ('bloco_c', 'c0-1004'), ('bloco_c', 'c0-1005'), ('bloco_c', 'c0-1006'), ('bloco_c', 'c0-1007'), ('bloco_c', 'c0-1008'), ('bloco_c', 'c0-1009'), ('bloco_c', 'c0-1010'), ('bloco_c', 'c0-1011'), ('bloco_c', 'c0-1012'),
-- bloco B
('bloco_b', 'b0-1001'), ('bloco_b', 'b0-1002'), ('bloco_b', 'b0-1003'), ('bloco_b', 'b0-1004'), ('bloco_b', 'b0-1005'), ('bloco_b', 'b0-1006'), ('bloco_b', 'b0-1007'), ('bloco_b', 'b0-1008'), ('bloco_b', 'b0-1009'), ('bloco_b', 'b0-1010'), ('bloco_b', 'b0-1011'), ('bloco_b', 'b0-1012'),
-- bloco A
('bloco_a', 'a0-1001'), ('bloco_a', 'a0-1002'), ('bloco_a', 'a0-1003'), ('bloco_a', 'a0-1004'), ('bloco_a', 'a0-1005'), ('bloco_a', 'a0-1006'), ('bloco_a', 'a0-1007'), ('bloco_a', 'a0-1008'), ('bloco_a', 'a0-1009'), ('bloco_a', 'a0-1010'), ('bloco_a', 'a0-1011'), ('bloco_a', 'a0-1012');

CREATE TABLE chamados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assunto VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    tipo_id INT,
    tecnico_id INT,
    usuario_id INT,
    local_id int,
    imagem VARCHAR(255),
    prioridade ENUM ('none','baixa', 'média', 'alta') DEFAULT 'none',
    status_chamado ENUM('pendente', 'em andamento', 'concluído') DEFAULT 'pendente',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tipo_id) REFERENCES pool(id) ON DELETE CASCADE,
    FOREIGN KEY (local_id) REFERENCES localChamado(id) ON DELETE CASCADE,
    FOREIGN KEY (tecnico_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

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


-- Criação da tabela `pool_tecnico`
/* 	Relaciona quais técnicos podem atuar em quais pools - PROVAVELMTE ESSA TABELA NAO SERA USADA, ELA FOI SUBSTITUIDA POR "USUARIO_SERVICO"*/
CREATE TABLE pool_tecnico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_pool INT,
    id_tecnico INT,
    FOREIGN KEY (id_pool) REFERENCES pool(id) ON DELETE CASCADE,
    FOREIGN KEY (id_tecnico) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE redefinir_tokens (
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  criacao DATETIME NOT NULL
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

-- Índices adicionais para otimização
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_chamados_status ON chamados(status_chamado);
CREATE INDEX idx_apontamentos_comeco_fim ON apontamentos(comeco, fim);

select *from usuarios;
select *from usuario_servico;