
import { create, readAll, read, readQuery, update, deleteRecord } from '../config/database.js';

// // cria usuario na tabela
// export const garantirUsuarioExiste = async (username) => {
//     const usuarios = await read('usuarios', { nome: username });
//     if (usuarios.length > 0) {
//         return usuarios[0].id; // retorna o id existente}
//     // Se não existir, cria
//     const novoUsuario = await create('usuarios', { nome: username });
//     return novoUsuario.insertId;};
// Buscar local_id com base no bloco e sala
// export const buscarLocalId = async (bloco, sala) => {
//   const consulta = `SELECT * FROM localChamado WHERE bloco = ? AND sala = ?`;
//   const localEncontrado = await readQuery(consulta, [bloco, sala]);
//   if (!localEncontrado[0].length) {
//     return null;
//   }return localEncontrado[0][0].id;};

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

// ver usuarios - adm -- funcionando
// const listarUsuarios = async (dados) => {
//     try {
//         return await readAll('usuarios', dados)
//     } catch (err) {
//         console.error('Erro ao listar usuarios!!!', err);
//     }}

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
        return await create('chamados', dados);
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

// Buscar local_id com base no bloco e sala
export const buscarLocalId = async (bloco, sala) => {
    const consulta = `SELECT * FROM localChamado WHERE bloco = ? AND sala = ?`;
    const localEncontrado = await readQuery(consulta, [bloco, sala]);
    console.log("Resultado da query:", localEncontrado);
    if (!localEncontrado || localEncontrado.length === 0) {
        console.warn("Nenhum local encontrado para os parâmetros fornecidos.");
        return null;
    }
    return localEncontrado[0].id;
};

// busca blocos (sem repetição)
export const listarBlocos = async () => {
    try {
        const consulta = 'SELECT DISTINCT bloco FROM localChamado ORDER BY bloco ASC';
        return await readQuery(consulta);
    } catch (err) {
        console.error("Erro ao buscar blocos:", err);
        throw err;
    }
};

// busca salas por bloco
export const listarSalasPorBloco = async (bloco) => {
    try {
        const consulta = 'SELECT sala FROM localChamado WHERE bloco = ? ORDER BY sala ASC';
        return await readQuery(consulta, [bloco]);
    } catch (err) {
        console.error("Erro ao buscar salas por bloco:", err);
        throw err;
    }
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

// funções utilizadas para TECNICOS E AUXILIARES DE LIMPEZA ------------------------------------------------------------------------------------------------------------------------------------
export const listarChamadosDisponiveis = async (usuario_id) => {
    const sql = ` SELECT c.* FROM chamados c INNER JOIN usuario_servico us ON us.servico_id = c.tipo_id WHERE us.usuario_id = ? AND c.status_chamado = 'pendente' AND c.tecnico_id IS NULL `;
    try {
        return await readQuery(sql, [usuario_id]);
    } catch (err) {
        throw err;
    }
};

export const pegarChamado = async (chamado_id, usuario_id) => {
    // verifica se o chamado existe
    const chamado = await read('chamados', `id = ${chamado_id}`);
    if (!chamado) throw new Error('Chamado não encontrado');

    // atualiza o chamado somente se técnico_id for NULL
    if (chamado.tecnico_id) throw new Error('Chamado já atribuído');

    try {
        // update condicional: so altera se tecnico_id for NULL
        const sql = ` UPDATE chamados  SET tecnico_id = ?, status_chamado = 'em andamento' WHERE id = ? AND tecnico_id IS NULL `;
        const result = await readQuery(sql, [usuario_id, chamado_id]);

        if (result.affectedRows === 0) {
            throw new Error('Chamado já foi atribuído a outro usuário.');
        }
        return result.affectedRows;
    } catch (err) {
        throw err;
    }
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

//criarUsuarioMensagem
export { lerMsg, escreverMensagem, criarPrioridade, criarRelatorio, verRelatorios };