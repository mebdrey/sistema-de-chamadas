
import { create, readAll, read, readQuery, update, deleteRecord } from '../config/database.js';

//prioridade do chamado - técnico -- não esta funcionando, não esta recebendo as informaçoes do id(quando tento enviar o id pelo body ele junta no set)
const criarPrioridade = async (dados, id) => {
    try {
        return await update('chamados', dados, `id = 1`)
        // return await update('chamados',dados,`id = ${id}` ) --  seria o funcional com o id de login(eu acho)
    } catch (err) {
        console.error('erro ao inserir prioridade no chamado!', err);
        throw err;
    }};

//criar relatório - técnico -- funcionando
const criarRelatorio = async (dados) => {
    try {
        return await create('apontamentos', dados)
    } catch (err) {
        console.error('Erro ao criar relatório!!!', err);
        throw err;
    }
};

export async function criarNotificacao({ usuario_id, tipo, titulo, descricao, chamado_id = null }) {
    const query = `
        INSERT INTO notificacoes (usuario_id, tipo, titulo, descricao, chamado_id)
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [usuario_id, tipo, titulo, descricao, chamado_id];
    try {
        await readQuery(query, values);
    } catch (err) {
        console.error('Erro ao criar notificação:', err);
        throw err;
    }
}

export const buscarChamadoComNomeUsuario = async (chamadoId) => {
  const sql = `
    SELECT c.*, u.nome AS nome_usuario
    FROM chamados c
    JOIN usuarios u ON c.usuario_id = u.id
    WHERE c.id = ?
  `;
  try {
    const result = await readQuery(sql, [chamadoId]);
    return result[0];
  } catch (err) {
    throw err;
  }
};

//ver relatórios do técnico
const verRelatorios = async (table, where) => {
    try {
        return await readAll('apontamentos', 'usuario_id = ?')
    } catch (err) {
        console.error('Erro ao listar relatórios!!!', err);
        throw err;
    }}

//funções para o chat -------------------------------------------------------------------------------------

//chat usuário -> técnico e técnico -> usuario
const escreverMensagem = async (dados) => {
    try {
        return await create('mensagens', {
            id_usuario: dados.id_usuario,
            id_tecnico: dados.id_tecnico,
            conteudo: dados.conteudo,
            id_chamado: dados.id_chamado
        });}
    catch (err) {
        console.error('Erro ao enviar mensagem! - models', err);
        throw err;
    }}

const lerMsg = async (idChamado) => {
    const consulta = `SELECT * FROM mensagens WHERE id_chamado = ${idChamado}
     order by data_envio asc`;
    try {
        return await readQuery(consulta);
    }
    catch (err) {
        console.error('Erro ao listar mensagens do chamado especificado!!', err)
    }}

// funções utilizadas para usuarios comuns --------------------------------------------------------------------------------------------------------------------------------------------
//criar chamado usuário -- funcionando
export const criarChamado = async (dados) => {
    try {
        const resultado = await create('chamados', dados); 
        return resultado;
    } catch (err) {
        console.error("Erro ao criar chamado!", err);
        throw err;
    }};

export const listarChamados = async (usuarioId) => {
    try {
        return await readAll('chamados', `usuario_id = ${usuarioId}`);
    } catch (err) {
        console.error("Erro ao listar chamados!", err);
        throw err;
    }};

// busca servicos
export const buscarTiposServico = async () => {
    const tipos = await readAll('pool');
    return tipos.filter(tipo => tipo.status_pool === 'ativo');
};

// funções utilizadas para ADMINs --------------------------------------------------------------------------------------------------------------------------------------------
export const excluirUsuario = async (usuarioId) => {
    try {
        // certificacao de que o id é numérico
        if (!Number.isInteger(usuarioId)) {
            throw new Error('ID do usuário inválido');
        }
        const where = `id = ${usuarioId}`;
        const affectedRows = await deleteRecord('usuarios', where);
        return affectedRows;
    } catch (err) {
        console.error('Erro ao excluir usuário:', err);
        throw err;
    }
};

// Técnicos (externo, apoio técnico, manutenção)
export const verTecnicos = async () => {
    const consulta = ` SELECT * FROM usuarios WHERE funcao = "tecnico" OR funcao = "apoio tecnico" OR funcao = "manutencao" `;
    try {
        return await readQuery(consulta);
    } catch (err) {
        throw err;
    }
};

// Auxiliares de limpeza
export const verAuxiliaresLimpeza = async () => {
    const consulta = 'SELECT * FROM usuarios WHERE funcao = "auxiliar de limpeza"';
    try {
        return await readQuery(consulta);
    } catch (err) {
        throw err;
    }
};

// Usuários comuns (clientes)
export const verClientes = async () => {
    const consulta = 'SELECT * FROM usuarios WHERE funcao = "usuario"';
    try {
        return await readQuery(consulta);
    } catch (err) {
        throw err;
    }
};

export const verChamados = async () =>{
    try{
        return await readAll('chamados')
    } catch (error) {
        console.error('Erro ao listar chamados:', error);
        throw error;
    }
}

export const contarChamadosPorStatus = async (modo) => {
  let sql = `
    SELECT status_chamado, COUNT(*) AS qtd
    FROM chamados
    WHERE YEAR(criado_em) = YEAR(NOW())
  `;

  if (modo === 'mensal') {
    sql += ` AND MONTH(criado_em) = MONTH(NOW())`;
  }

  sql += ` GROUP BY status_chamado`;

  try {
    return await readQuery(sql);
  } catch (err) {
    throw err;
  }
};

// funções utilizadas para TECNICOS E AUXILIARES DE LIMPEZA ------------------------------------------------------------------------------------------------------------------------------------
export const listarChamadosDisponiveis = async (usuario_id) => {
    const sql = ` SELECT c.* FROM chamados c INNER JOIN usuario_servico us ON us.servico_id = c.tipo_id WHERE us.usuario_id = ? AND c.status_chamado = 'pendente' AND c.tecnico_id IS NULL `;
    try {
        return await readQuery(sql, [usuario_id]);
    } catch (err) {
        throw err;
    }
};

export const contarTodosChamados = async() =>{
    const sql = `select count(*) from chamados ;`;
    try{
        return await readQuery(sql);
    }
    catch (err){
        throw err;
    }
};

export const contarChamadosPendentes = async()=>{
    const sql = `select count(*) from chamados where status_chamado = 'pendente'`;
    try{
        return await readQuery(sql);
    }
    catch(err){
        throw err;
    }
};

export const contarChamadosEmAndamento = async()=>{
    const sql = `select count(*) from chamados where status_chamado = 'em andamento'`;
    try{
        return await readQuery(sql);
    }
    catch(err){
        throw err;
    }
};

export const contarChamadosConcluido = async()=>{
    const sql = `select count(*) from chamados where status_chamado = 'concluido'`;
    try{
        return await readQuery(sql);
    }
    catch(err){
        throw err;
    }
};

export const pegarChamado = async (chamado_id, usuario_id) => {
  // Verifica se o chamado existe e ainda não foi atribuído
  const consulta = `
    SELECT c.*
    FROM chamados c
    INNER JOIN usuario_servico us ON us.servico_id = c.tipo_id
    WHERE c.id = ? 
      AND us.usuario_id = ?
      AND c.status_chamado = 'pendente'
      AND c.tecnico_id IS NULL
    LIMIT 1;
  `;

  const resultados = await readQuery(consulta, [chamado_id, usuario_id]);
  const chamado = resultados[0];

  if (!chamado) {
    throw new Error('Chamado não encontrado, já atribuído ou não pertence à sua função.');
  }

  // Tenta atualizar o chamado para o técnico logado
  const sqlUpdate = `
    UPDATE chamados 
    SET tecnico_id = ?, status_chamado = 'em andamento' 
    WHERE id = ? AND tecnico_id IS NULL
  `;

  const result = await readQuery(sqlUpdate, [usuario_id, chamado_id]);

  if (result.affectedRows === 0) {
    throw new Error('Chamado já foi atribuído a outro usuário.');
  }

  return result.affectedRows;
};


export const listarChamadosPorStatusEFunção = async (usuario_id, status) => {
  let condicaoStatus = '';
  const params = [usuario_id];

  if (status === 'pendente') {
    condicaoStatus = `AND c.status_chamado = 'pendente' AND c.tecnico_id IS NULL`;
  } else if (status === 'em andamento') {
    condicaoStatus = `AND c.status_chamado = 'em andamento' AND c.tecnico_id = ?`;
    params.push(usuario_id);
  } else if (status === 'concluido') {
    condicaoStatus = `AND c.status_chamado = 'concluido' AND c.tecnico_id = ?`;
    params.push(usuario_id);
  }

  const sql = `
    SELECT c.*, u.nome AS nome_usuario
    FROM chamados c
    INNER JOIN usuario_servico us ON us.servico_id = c.tipo_id
    INNER JOIN usuarios u ON u.id = c.usuario_id
    WHERE us.usuario_id = ? ${condicaoStatus}
    ORDER BY c.criado_em DESC
  `;

  try {
    return await readQuery(sql, params);
  } catch (err) {
    throw err;
  }
};

// buscar todos os apontamentos de um chamado
export const listarApontamentosPorChamado = async (chamado_id) => {
  const sql = `SELECT * FROM apontamentos WHERE chamado_id = ? ORDER BY comeco ASC`;
  return await readQuery(sql, [chamado_id]);
};

// criar um novo apontamento
export const criarApontamento = async ({ chamado_id, tecnico_id, descricao }) => {
  const data = {
    chamado_id,
    tecnico_id,
    descricao,
    comeco: new Date().toISOString().slice(0, 19).replace('T', ' ')
  };

  return await create('apontamentos', data);
};

// finalizar um apontamento
export const finalizarApontamento = async (apontamento_id) => {
  const data = {
    fim: new Date().toISOString().slice(0, 19).replace('T', ' ')
  };

  return await update('apontamentos', data, `id = ${apontamento_id} AND fim IS NULL`);
};
 
//técnico ler as mensagens enviadas para ele - usar esse quando a autenticação estiver funcionando
// const receberMensagensDoUsuario = async (usuarioId) => {
//     try {
//         return await readAll('mensagens_usuario_tecnico', `id_destinatario = ${usuarioId}`)
//     }
//     catch (err) {
//         console.error('Erro ao receber mensagens do usuário: ', err);
//         throw err;
//     };
// }

//ver mensagens (chat identificado pelo id do chamado)
// const lerMensagens = async (idChamado) => {
//     try {
//         return await readAll('mensagens', `id_chamado = ${idChamado}`)
//     }
//     catch (err) {
//         console.error('Erro ao ler mensagens do chamado especificado :', err);
//         throw err;
//     };
// }

//contar  a quantidade total de chamados ativos

//criarUsuarioMensagem
export { lerMsg, escreverMensagem, criarPrioridade, criarRelatorio, verRelatorios };