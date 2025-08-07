-- drop database zelo;
    create database zelos;
    use zelos;
     -- Criação da tabela `usuarios`
    CREATE TABLE usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        senha VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        funcao VARCHAR(100) NOT NULL,
        status_usuarios ENUM('ativo', 'inativo') DEFAULT 'ativo',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

insert usuarios (nome, senha, email, funcao) value
("teste3", "teste3", "juliadeoliveiraec@gmail.com", "técnico"),
("Elias Coca Velloso", "eliasabc", "eliascocavp@gmail.com", "técnico");

insert into usuarios (nome, senha, email, funcao) value
("Lorena" , "1234", "lorena@email.com", "usuário");

insert into usuarios (nome, senha, email, funcao) value
("Mari", "mari1234", "mari@tecnica.com", "técnica");

select * from usuarios;
    -- Criação da tabela `pool`
    
-- a Pool é a tabela dos diversos serviços oferecidos pelos técnicos
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
    );

insert chamados (titulo, descricao) value 
('teste1', 'primeiro teste de insert');

insert into chamados (titulo, descricao, tecnico_id, usuario_id, status_chamado) values 
("Erro de atualização", "Boa tarde, estou tentando atualizar meu navegador pois ele não está mais dando suporte a versão antiga. mas não está pegando, aparece 'erro ao atualizar' e não dá nenhuma explicação. O que fazer?",  2, 3, "pendente");

insert into chamados (titulo, descricao, tecnico_id, usuario_id, status_chamado) values 
("cmd abrindo toda hora", "Olá, o cmd do meu pc está aparecendo na tela toda hora, atrapalhando minhas atividades. Como resolver?", 4, 3, "pendente");

select * from chamados;

select * from chamados where usuario_id= 1 ;

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
select * from apontamentos; 

    -- Criação da tabela `pool_tecnico`
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

select *from mensagens order by data_envio asc;


    -- Índices adicionais para otimização
    CREATE INDEX idx_usuarios_email ON usuarios(email);
    CREATE INDEX idx_chamados_status ON chamados(status_chamado);
    CREATE INDEX idx_apontamentos_comeco_fim ON apontamentos(comeco, fim);
