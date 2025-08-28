import { read, update, readQuery } from '../config/database.js';

// buscar dados do perfil --funcionando, só não consegui testar com o id da sessão
const obterDadosDoUsuario = async (id) => {
  try {
    // const where = `id = 1`;
    const where = `id = ${id}`;
    const usuario = await read('usuarios', where);

    return usuario;
  } catch (err) {
    console.error('Erro ao atualizar informações do perfil!!!', err);
    throw err;
  }
};

// editar perfil --- funcionando, só não consegui testar com o id da sessão
const editarPerfil = async (id, dadosAtualizados) => {
  try {
    const where = `id = ${id}`;
    // const where = `id = 1`
    return await update('usuarios', dadosAtualizados, where);
  } catch (err) {
    console.error('Erro ao atualizar informações do perfil!!!', err);
    throw err;
  }
};

//foto de perfil
const atualizarFotoPerfil = async (id, caminhoFoto) => {
  try {
    const sql = 'UPDATE usuarios SET ftPerfil = ? WHERE id = ?';
    const resultado = await readQuery(sql, [caminhoFoto, id]);
    return resultado;
  } catch (err){
console.error('Erro ao atualizar foto de perfil', err);
throw err
  }
  
};

const removerFotoPerfil = async (id) =>{
  try{
    const sql = 'UPDATE usuarios set ftPerfil = null where id = ?';
    const resultado = await readQuery(sql, [id] );
    return resultado
  }
  catch (err) {
    console.error('Erro ao remover foto de perfil', err);
    throw err
  }
};


export { obterDadosDoUsuario, editarPerfil, atualizarFotoPerfil, removerFotoPerfil };