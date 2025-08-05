import { obterDadosDoUsuario, editarPerfil} from '../models/Perfil.js';
import session from "express-session";

// obter dados do perfil do usuario -- funcionando, só não consegui testar com o id da sessão
const obterPerfilUsuarioController = async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            req.session.save(err => {
                if (err) reject(err);
                else resolve();
            }); });
        // const {id } = req.session.usuario;
        const id  =1;
        console.log("obterPerfilUsuario: ", req.session);
        const dados = await obterDadosDoUsuario(id);
        if (!dados) {
            return res.status(404).json({ erro: 'Usuário não encontrado.' });
        }
          // Adiciona a resposta de sucesso
          return res.status(200).json(dados);
    } catch (erro) {
        console.error('Erro ao obter dados do perfil:', erro);
        res.status(500).json({ erro: 'Erro ao obter dados do perfil.' });
    }};

    //editar email de perfil -- funcionando, só não consegui testar com o id da sessão
const editarPerfilController = async (req, res) => {
  try {
    // const id = req.session.usuario.id;
    const id = 1;
    const { email } = req.body;
    const atualizacoes = {};
    if (email !== undefined && email !== "") atualizacoes.email = email;

    if (Object.keys(atualizacoes).length === 0) {
      return res.status(400).json({ mensagem: 'Nenhum dado para atualizar.' });
    }
    await editarPerfil(id, atualizacoes);
    res.status(200).json({ mensagem: 'Perfil atualizado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: 'Erro ao atualizar perfil' });
  }};

export { obterPerfilUsuarioController, editarPerfilController};