create database sistemaDeChamadas;

#tabela usuários
create table usuarios(
id int auto_increment primary key,
nome text not null,
senha varchar(255) not null,
email varchar(100) unique not null,
funcao varchar(100) not null,
status_user Enum('ativo', 'inativo') DEFAULT 'ativo',
criado_em TIMESTAMP  DEFAULT current_timestamp,
atualizado_em TIMESTAMP DEFAULT current_timestamp on update current_timestamp
);

#tabela pool
create table pool(
id int auto_increment primary key ,
titulo ENUM('externo', 'manutencao', 'apoio_tecnico', 'limpeza') NOT NULL,
descricao text,
status_pool ENUM('ativo','inativo') default 'ativo',
criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by INT,
updated_by INT,
FOREIGN KEY (created_by) REFERENCES usuarios(id),
FOREIGN KEY (updated_by) REFERENCES usuarios(id)
);

#tabela chamados
create table chamados (
id int auto_increment primary key,
 titulo VARCHAR(255) NOT NULL,
descricao TEXT NOT NULL,
tipo_id INT,
tecnico_id INT,
usuario_id INT,
status_chamado ENUM('pendente', 'em andamento', 'concluído') DEFAULT 'pendente',
criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (tipo_id) REFERENCES pool(id),
FOREIGN KEY (tecnico_id) REFERENCES usuarios(id),
FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

#tabela relatorio
create table relatorio(
id INT AUTO_INCREMENT PRIMARY KEY,
chamado_id INT,
tecnico_id INT,
descricao TEXT,
comeco TIMESTAMP NOT NULL,
fim TIMESTAMP NOT NULL,
duracao INT AS (TIMESTAMPDIFF(hour, comeco, fim)) STORED, -- Calcula a duração em horas
criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (chamado_id) REFERENCES chamados(id),
FOREIGN KEY (tecnico_id) REFERENCES usuarios(id)
);

#tabela pool_tecnico
create table pool_tecnico(
id int auto_increment primary key,
id_pool int, 
id_tecnico int,
FOREIGN KEY (id_pool) REFERENCES pool(id),
FOREIGN KEY (id_tecnico) REFERENCES usuarios(id)
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_chamados_status ON chamados(status);
CREATE INDEX idx_relatorio_comeco_fim ON relatorio(comeco, fim);