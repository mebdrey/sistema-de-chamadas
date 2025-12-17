## Zelos – Sistema de Chamados

Sistema completo de **gestão de chamados** desenvolvido para a **Escola SENAI Armando de Arruda Pereira**, permitindo registrar, acompanhar e analisar solicitações de manutenção, apoio técnico, limpeza e outros serviços ligados a bens identificados por **número de patrimônio**.

O projeto está organizado no diretório `Zelos-main`, que contém **frontend (Next.js)**, **backend (Node.js/Express)** e **banco de dados (MySQL)**.

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Principais Funcionalidades](#principais-funcionalidades)
3. [Arquitetura do Projeto](#arquitetura-do-projeto)
4. [Tecnologias Utilizadas](#tecnologias-utilizadas)
5. [Requisitos](#requisitos)
6. [Configuração e Execução](#configuração-e-execução)
7. [Banco de Dados](#banco-de-dados)
8. [Autenticação e Integração com AD](#autenticação-e-integração-com-ad)
9. [Estrutura de Diretórios](#estrutura-de-diretórios)
10. [Scripts Disponíveis](#scripts-disponíveis)
11. [Próximos Passos e Melhorias](#próximos-passos-e-melhorias)

---

## Visão Geral

O **Zelos** é um sistema de chamados projetado para:

- Centralizar as solicitações de serviços (TI, manutenção, limpeza, apoio técnico etc.);
- Acompanhar o fluxo de atendimento por **status**, **prioridade** e **tipo de serviço**;
- Registrar **apontamentos de técnicos**, **mensagens entre usuário e técnico** e **avaliações de atendimento**;
- Gerar base de dados rica para **relatórios e indicadores** de desempenho.

---

## Principais Funcionalidades

- **Cadastro e abertura de chamados**
  - Abertura de chamados por usuários, vinculados a número de patrimônio e tipo de serviço (pool de serviços).
  - Definição de prioridade (baixa, média, alta) com prazos de atendimento.

- **Gestão de chamados por perfis**
  - Perfis como `admin`, `tecnico`, `auxiliar_limpeza` e `usuario` com permissões específicas.
  - Atribuição de técnicos a chamados e controle de status (`pendente`, `em andamento`, `concluido`).

- **Apontamentos e tempo de atendimento**
  - Registro de apontamentos com início, fim e **cálculo automático de duração**.
  - Histórico de ações realizadas em cada chamado.

- **Comunicação integrada**
  - Chat de mensagens entre usuário e técnico vinculado ao chamado.
  - Notificações de eventos importantes (status atualizado, técnico atribuído, chamado atrasado etc.).

- **Avaliação de atendimento**
  - Usuários avaliam chamados com **nota de 1 a 5** e comentários sobre o atendimento.

- **Relatórios e análise**
  - Estrutura de banco preparada para relatórios de desempenho de técnicos, SLAs, volume de chamados por período, tipos de serviço, etc.

---

## Arquitetura do Projeto

- **Frontend** (`Zelos-main/frontend`)
  - Aplicação em **Next.js (App Router)** com React, TailwindCSS, Flowbite e componentes de UI modernos.
  - Interface separada por perfis: `usuario`, `admin`, `tecnico`.

- **Backend** (`Zelos-main/backend`)
  - API em **Node.js/Express**, com rotas agrupadas em:
    - `authRotas.js` – autenticação (inclui integração com AD via LDAP);
    - `appRoutes.js` – rotas de negócio (chamados, chat, notificações, perfis etc.).
  - Camadas bem definidas:
    - `controllers/` – regras de negócio (Admin, Chamados, Chat, Notificações, Técnicos, Perfil, Redefinição de senha, Usuário Comum);
    - `models/` – acesso ao banco via funções genéricas (`create`, `read`, `update`, `deleteRecord`, `readQuery`);
    - `middlewares/` – autenticação, upload de arquivos, etc.;
    - `config/` – configuração de banco (`database.js`), JWT e LDAP.

- **Banco de Dados** (`Zelos-main/bd`)
  - Banco **MySQL**, com script de inicialização `init.sql` e `Dockerfile` para subir um container MySQL já com estrutura e dados de exemplo.

---

## Tecnologias Utilizadas

- **Frontend**
  - Next.js 15
  - React 19
  - Tailwind CSS 4
  - Flowbite / Flowbite-React
  - ApexCharts / React-ApexCharts
  - i18next / react-i18next
  - Axios

- **Backend**
  - Node.js (ES Modules)
  - Express 5
  - MySQL2 (pool de conexões)
  - Passport + passport-ldapauth + passport-local
  - JsonWebToken (JWT)
  - BcryptJS (hash de senha)
  - Multer (upload)
  - Nodemailer (envio de e-mails)
  - CSV/PDF (csv-stringify, jsPDF, pdfkit, puppeteer) para exportações e relatórios

- **Banco de Dados**
  - MySQL 8 (com Docker)

---

## Requisitos

- **Node.js** versão 18+
- **npm** ou **yarn**
- **MySQL 8** instalado localmente
- Acesso à rede corporativa/AD (para uso do login integrado, quando aplicável)

---

## Configuração e Execução

Todas as instruções abaixo assumem que você está na pasta raiz deste repositório (`sistema-de-chamadas`).

### 1. Clonar o repositório

```bash
git clone https://github.com/mebdrey/sistema-de-chamadas.git
cd sistema-de-chamadas/Zelos-main
```

### 2. Banco de Dados

1. Certifique-se de que o **MySQL 8** está instalado e em execução na sua máquina.
2. No seu cliente MySQL (Workbench, linha de comando etc.), execute o script `Zelos-main/bd/init.sql`, que irá:
   - criar o banco `zelos`;
   - criar todas as tabelas necessárias;
   - inserir dados fictícios para testes.
3. Ajuste as credenciais de acesso no arquivo `backend/config/database.js` (host, usuário, senha, database) para refletir a sua instalação local.

### 3. Configurar variáveis de ambiente

Na pasta `Zelos-main/backend`, crie um arquivo `.env` (ou configure variáveis no ambiente do servidor) com, no mínimo:

- **`PORT`** – porta da API (padrão: `8080` se não definido);
- **`FRONTEND_URL`** – URL do frontend (ex.: `http://localhost:3000`);
- **`SESSION_SECRET`** – segredo para sessão do `express-session`;
- Demais variáveis específicas de LDAP/AD, e-mail, etc., conforme sua infraestrutura.

> Observação: o backend está preparado para uso de AD/LDAP via `config/ldap.js`. Certifique-se de configurar corretamente servidor, base DN, credenciais de serviço e filtros de pesquisa.

### 4. Instalar dependências

Na pasta `Zelos-main`:

```bash
cd frontend
npm install
cd ../backend
npm install
```

### 5. Executar o backend

Na pasta `Zelos-main/backend`:

```bash
npm run dev   # desenvolvimento com nodemon
# ou
npm start     # execução simples em produção
```

A API iniciará, por padrão, na porta definida em `PORT` (ex.: `http://localhost:8080`).  
Endpoint de saúde: `GET /health`.

### 6. Executar o frontend

Na pasta `Zelos-main/frontend`:

```bash
npm run dev
```

A aplicação ficará acessível em `http://localhost:3000` (salvo se você alterar a porta).

---

## Banco de Dados

O script `bd/init.sql` cria e popula as principais tabelas do sistema, entre elas:

- **`usuarios`** – usuários da aplicação, com função (`admin`, `tecnico`, `auxiliar_limpeza`, `usuario`) e foto de perfil.
- **`pool`** – catálogo de tipos de serviços (manutenção, apoio técnico, limpeza, externo etc.).
- **`funcao_pool` / `usuario_servico`** – mapeamento entre funções de usuário e serviços disponíveis.
- **`prioridades`** – níveis de prioridade e prazos associados.
- **`chamados`** – chamados com assunto, descrição, tipo, técnico, usuário, prioridade, status, datas e indicadores de atraso.
- **`apontamentos`** – registros de tempo e descrição de trabalho realizado pelos técnicos.
- **`mensagens`** – chat entre usuário e técnico vinculado a chamado.
- **`relatorios`** – textos de relatórios finais por chamado.
- **`notificacoes`** – notificações disparadas para usuários.
- **`redefinir_tokens`** – suporte a fluxo de redefinição de senha.
- **`avaliacoes`** – avaliações de atendimento, com nota de 1 a 5 e comentário.

Além disso, já são inseridos **dados fictícios** para testes (usuários, chamados, avaliações, etc.), permitindo validar a aplicação sem necessidade de carga manual inicial.

---

## Autenticação e Integração com AD

- A autenticação principal é feita via endpoint `POST /auth/login` (backend), recebendo JSON:

```json
{
  "username": "",
  "password": ""
}
```

- O backend utiliza **LDAP** para autenticação contra o **Active Directory**, através da configuração em `config/ldap.js` e do uso de `passport-ldapauth`.
- De acordo com a configuração original, o endpoint de autenticação foi projetado para funcionar **dentro da rede local** (cabeada ou Wi-Fi específico da unidade).  
- Existe integração com **JWT** e **sessão** (`express-session`) para gerenciamento de autenticação ao longo da navegação.

---

## Estrutura de Diretórios

Estrutura simplificada relevante para este projeto:

```text
sistema-de-chamadas/
  README.md                 # Este arquivo
  Zelos-main/
    README.md               # README específico do Zelos
    backend/
      app.js
      config/
      controllers/
      middlewares/
      models/
      routes/
      uploads/              # Imagens de exemplo
    bd/
      Dockerfile
      init.sql
    frontend/
      app/                  # Páginas Next.js (usuário, admin, técnico)
      components/
      public/
      ...                   # Demais arquivos padrão Next.js
```

---

## Scripts Disponíveis

- **Frontend (`Zelos-main/frontend`)**
  - `npm run dev` – inicia servidor de desenvolvimento Next.js.
  - `npm run build` – gera build de produção.
  - `npm start` – inicia o servidor Next.js em modo produção.
  - `npm run lint` – executa o linter.

- **Backend (`Zelos-main/backend`)**
  - `npm start` – sobe a API usando `node app.js`.
  - `npm run dev` – sobe a API em modo desenvolvimento com `nodemon`.
