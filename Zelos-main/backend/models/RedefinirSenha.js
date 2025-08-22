import { create, read, deleteRecord } from '../config/database.js';

const salvarToken = async (email, token) => {
  const tokenData = {
    email,
    token,
    created_at: new Date().toISOString().slice(0, 19).replace('T', ' '), // formato MySQL DATETIME
    usado: 0
  };
  return await create('redefinir_tokens', tokenData);
};

const buscarToken = async (token) => {
  const results = await read('redefinir_tokens', `token = '${token}' AND usado = 0`);
  return results.length > 0 ? results[0] : null;
};

const marcarTokenComoUsado = async (token) => {
  await deleteRecord('redefinir_tokens', `token = '${token}'`); // simples: apaga quando usado
};

export { salvarToken, buscarToken, marcarTokenComoUsado };
