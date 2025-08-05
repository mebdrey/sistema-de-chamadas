import { read, update } from '../config/database.js';

// buscar dados do perfil --funcionando, só não consegui testar com o id da sessão
const obterDadosDoUsuario = async (tipo, id) => {
  try{
  const where = `id = 1`;
//   const where = `id = ${id}`;
  const usuario = await read('usuarios', where);

  return usuario;
  }catch(err){
    console.error('Erro ao atualizar informações do perfil!!!', err);
    throw err;
  }};

// editar perfil --- funcionando, só não consegui testar com o id da sessão
const editarPerfil = async ( id, dadosAtualizados) => {
  try {
    // const where = `id = ${id}`;
    const where = `id = 1`
    return await update('usuarios', dadosAtualizados, where);
  } catch (err) {
    console.error('Erro ao atualizar informações do perfil!!!', err);
    throw err;
  }
};

export { obterDadosDoUsuario, editarPerfil };