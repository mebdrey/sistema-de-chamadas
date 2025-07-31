import { create, readAll, read, readQuery } from '../config/database.js';

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
        return await create('chamados', dados)
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

// ver usuarios - adm
const listarUsuarios = async (dados) => {
    try {
        return await readAll('usuarios', dados)
    } catch (err) {
        console.error('Erro ao listar usuarios!!!', err);
        throw err;
    }
};

// ver tecnicos - adm
const verTecnicos = async (dados) => {
    const consulta = 'SELECT * FROM usuarios WHERE funcao = tecnicos';
    // const values = [ id, nome, email, funcao, status_usuarios];
    // console.log('Valores para consulta:', values);
    try {
      return await readQuery(consulta, values);
    } catch (err) {
      throw err;
    }
};

// ver clientes - adm
const verClientes = async (dados) => {
    const consulta = 'SELECT * FROM usuarios WHERE funcao = cliente';
    try {
      return await readQuery(consulta);
    } catch (err) {
      throw err;
    }
};

export { criarChamado, criarPrioridade, criarRelatorio, listarUsuarios, verTecnicos, verClientes };