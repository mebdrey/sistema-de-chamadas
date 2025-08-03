import { create, read, update, deleteRecord } from '../config/database.js';

const salvarToken = async (email, token) => {
  const tokenData = {
    email,
    token,
    criacao: new Date().toISOString(),
  };
  return await create('redefinir_tokens', tokenData);
};

const buscarToken = async (token) => {
  const results = await read('redefinir_tokens', `token = '${token}'`);
  return results.length > 0 ? results[0] : null;
};

const excluirToken = async (token) => {
  await deleteRecord('redefinir_tokens', `token = '${token}'`);
};

export { salvarToken, buscarToken, excluirToken };
