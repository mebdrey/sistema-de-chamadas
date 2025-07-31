import {create} from '../config/database.js';

//criar chamado usuário
const criarChamado = async (dados)=>{
    try{
        return await create('chamados', dados)
    }catch(err){
        console.error("Erro ao criar chamado!", err);
        throw err;
    }
};


//prioridade do chamado - técnico

const criarPrioridade = async(dados)=>{
    try{
        return await create('chamados', dados)
    }catch(err){
        console.error('erro ao inserir prioridade no chamado!', err);
        throw err;
    }
};

//criar relatório - técnico

const criarRelatorio = async(dados)=>{
    try{
        return await create('apontamentos', dados)
    }catch(err){
console.error('Erro ao criar relatório!!!', err);
throw err;
    }
};

export {criarChamado, criarPrioridade, criarRelatorio};