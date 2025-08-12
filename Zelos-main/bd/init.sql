-- drop database zelos;
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
/*
insert into usuarios (nome, senha, email, funcao) value
("Lorena" , "1234", "lorena@email.com", "usuário");
insert into usuarios (nome, senha, email, funcao) value
("Mari", "mari1234", "mari@tecnica.com", "técnica");
select * from usuarios;
*/
-- Criação da tabela `pool`/* Lista de tipos/categorias de serviço ofertados*/
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

    -- Criação da tabela `chamados`
    /*
    CREATE TABLE chamados (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT NOT NULL,
        tipo_id INT,
        tecnico_id INT,
        usuario_id INT,
        prioridade ENUM ('none','baixa', 'média', 'alta') DEFAULT 'none',
        status_chamado ENUM('pendente', 'em andamento', 'concluído') DEFAULT 'pendente',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tipo_id) REFERENCES pool(id),
        FOREIGN KEY (tecnico_id) REFERENCES usuarios(id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ); */

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
INSERT INTO chamados (assunto, descricao, tipo_id, tecnico_id, usuario_id, local_id, imagem, prioridade, status_chamado)
VALUES
('Troca de lâmpada', 'A lâmpada da sala 201 está queimada.', 1, NULL, 3, 2, 'lampada.jpg', 'baixa', 'pendente'),
('Computador não liga', 'PC da secretaria não inicializa, tela preta.', 2, NULL, 4, 1, 'pc_quebrado.png', 'alta', 'pendente'),
('Vazamento de água', 'Canos do banheiro do 1º andar estão vazando.', 3, NULL, 5, 3, 'vazamento.jpg', 'média', 'pendente'),
('Ar-condicionado não funciona', 'Sala de aula 305 sem ar-condicionado.', 1, NULL, 6, 4, 'ar_condicionado.jpg', 'alta', 'pendente'),
('Impressora travando', 'Impressora do laboratório não puxa papel.', 2, NULL, 7, 5, 'impressora.jpg', 'média', 'pendente'),
('Cadeira quebrada', 'Cadeira da recepção está instável.', 3, NULL, 8, 6, 'cadeira.jpg', 'baixa', 'pendente'),
('Problema na rede Wi-Fi', 'Sinal fraco na biblioteca.', 2, NULL, 9, 7, 'wifi.png', 'alta', 'pendente'),
('Porta emperrada', 'Porta do almoxarifado não abre direito.', 3, NULL, 10, 8, 'porta.jpg', 'baixa', 'pendente'),
('Queda de energia', 'Falta de energia em parte do prédio.', 1, NULL, 11, 9, 'energia.jpg', 'alta', 'pendente'),
('Janela quebrada', 'Janela do corredor do 2º andar está trincada.', 3, NULL, 12, 10, 'janela.jpg', 'média', 'pendente');
select *from chamados;

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

/*
insert chamados (assunto, descricao) value 
('teste1', 'primeiro teste de insert');
insert into chamados (assunto, descricao, tecnico_id, usuario_id, status_chamado) values 
("Erro de atualização", "Boa tarde, estou tentando atualizar meu navegador pois ele não está mais dando suporte a versão antiga. mas não está pegando, aparece 'erro ao atualizar' e não dá nenhuma explicação. O que fazer?",  2, 3, "pendente");
insert into chamados (assunto, descricao, tecnico_id, usuario_id, status_chamado) values 
("cmd abrindo toda hora", "Olá, o cmd do meu pc está aparecendo na tela toda hora, atrapalhando minhas atividades. Como resolver?", 4, 3, "pendente");
select * from chamados;
select * from chamados where usuario_id= 1 ;
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
    FOREIGN KEY (chamado_id) REFERENCES chamados(id),
    FOREIGN KEY (tecnico_id) REFERENCES usuarios(id)
);

-- Criação da tabela `pool_tecnico`/* Relaciona quais técnicos podem atuar em quais pools*/
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
DELETE FROM pool WHERE id=1;