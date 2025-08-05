
import { create, readAll, read, readQuery, update } from '../config/database.js';

//criar chamado usuário -- funcionando
const criarChamado = async (dados) => {
    try {
        return await create('chamados', dados)
    } catch (err) {
        console.error("Erro ao criar chamado!", err);
        throw err;
    }
};


//prioridade do chamado - técnico -- não esta funcionando, não esta recebendo as informaçoes do id(quando tento enviar o id pelo body ele junta no set)
const criarPrioridade = async (dados, id) => {
    try {
        return await update('chamados', dados, `id = 1`)
        // return await update('chamados',dados,`id = ${id}` ) --  seria o funcional com o id de login(eu acho)
    } catch (err) {
        console.error('erro ao inserir prioridade no chamado!', err);
        throw err;
    }
};

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
const listarUsuarios = async (dados) => {
    try {
        return await readAll('usuarios', dados)
    } catch (err) {
        console.error('Erro ao listar usuarios!!!', err);
    }
}
//Ver as informações----------------------------------------------------------------------

//ver chamados -- não ta funcionando, não pega o where do req.body
// const verChamados = async (where) => {
//     try {
//         return await readAll('chamados',where) 
//         //return await readAll('chamados', `id= ${id}`) -- teoricamente seria o funcional
//     } catch (err) {
//         console.error('Erro ao visualizar chamados!!!', err);
//         throw err;
//     }
// };

const listarChamados = async (usuarioId) => {
    try {
        return await readAll('chamados', `usuario_id= ${usuarioId}`)
    }
    catch (err) {
        console.error("Erro ao listar chamados!", err);
        throw err;
    }
}

// ver tecnicos - adm -- funcionando
const verTecnicos = async (dados) => {
    const consulta = 'SELECT * FROM usuarios WHERE funcao = "técnico" ';
    // const values = [ id, nome, email, funcao, status_usuarios];
    // console.log('Valores para consulta:', values);
    try {
        //   return await readQuery(consulta, values);
        return await readQuery(consulta);
    } catch (err) {
        throw err;
    }
};

// ver clientes - adm -- funcionando
const verClientes = async (dados) => {
    const consulta = 'SELECT * FROM usuarios WHERE funcao = "cliente" ';
    try {
        return await readQuery(consulta);
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
    }
}

//funções para o chat 

//chat usuário -> técnico
const criarUsuarioMensagem = async(dados) =>{
    try{
        return await create('mensagens_usuario_tecnico', {
            id_usuario: dados.id_usuario,
            id_destinatario: dados.id_destinatario,
            conteudo: dados.conteudo,
            id_chamado: dados.id_chamado
        });
    }
    catch (err){
        console.error('Erro ao enviar mensagem! - models' , err);
        throw err;
    }
}

export { criarUsuarioMensagem, criarChamado, criarPrioridade, criarRelatorio, listarChamados, verRelatorios, listarUsuarios, verClientes, verTecnicos };
