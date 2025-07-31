import { create, read, readAll, update } from '../config/database.js';

//criar chamado usuário
const criarChamado = async (dados) => {
    try {
        return await create('chamados', dados)
    } catch (err) {
        console.error("Erro ao criar chamado!", err);
        throw err;
    }
};


//prioridade do chamado - técnico

const criarPrioridade = async (dados) => {
    try {
        return await update('chamados', 'prioridade = ?', 'id = ?')
    } catch (err) {
        console.error('erro ao inserir prioridade no chamado!', err);
        throw err;
    }
};

//criar relatório - técnico

const criarRelatorio = async (dados) => {
    try {
        return await create('apontamentos', dados)
    } catch (err) {
        console.error('Erro ao criar relatório!!!', err);
        throw err;
    }
};


//Ver as informações----------------------------------------------------------------------

//ver chamados 
const verChamados = async (table, where) => {
    try {
        return await readAll('chamados', 'tecnico_id = ?', 'usuario_id = ?' )
    } catch (err) {
        console.error('Erro ao visualizar chamados!!!', err);
        throw err;
    }
};

//ver relatórios do técnico
const verRelatorios = async(table, where) =>{
    try{return await readAll('apontamentos', 'tecnico_id = ?')
    }catch(err){
        console.error('Erro ao listar relatórios!!!', err);
        throw err;
    }
}
export { criarChamado, criarPrioridade, criarRelatorio, verChamados, verRelatorios };