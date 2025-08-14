

import { buscarTiposServico, criarChamado, criarPrioridade, criarRelatorio, verTecnicos, verAuxiliaresLimpeza, verClientes, listarChamados, verRelatorios, listarSalasPorBloco, listarBlocos,  escreverMensagem, lerMsg, buscarLocalId, excluirUsuario, pegarChamado, verChamados, contarTodosChamados, contarChamadosPendentes, contarChamadosEmAndamento, contarChamadosConcluido } from "../models/Chamado.js";


//dar prioridade ao chamado -- não ta funcionando
const criarPrioridadeController = async (req, res) => {
    try {
        await criarPrioridade(req.body);
        res.status(201).json({ mensagem: 'prioridade inserida com sucesso!!!' })
    } catch (err) {
        res.status(500).json({ erro: err.message })
    }
};

//criar relatorio -- funcionando
const criarRelatorioController = async (req, res) => {
    try {
        await criarRelatorio(req.body);
        res.status(201).json({ mensagem: 'relatório criado com sucesso!!!' })
    } catch (err) {
        res.status(500).json({ erro: err.message })
    }
};

//ver relatorios/apontamentos
const verRelatoriosController = async (req, res) => {
    try {
        const relatorios = await verRelatorios(req.body);
        res.json(relatorios);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao buscar relatórios!!!' })
    }
}

//técnico ler as mensagens dos usuários (enviadas para ele
// const receberMensagensController = async (req, res) => {
//     try {
//         //const usuarioId = req.usuarioId; //vindo do token JWT
//         const usuarioId = 2; //só até a autenticação estar funcionando
//         const mensagens = await receberMensagensDoUsuario(usuarioId);
//         res.status(200).json({ mensagem: 'Mensagens listadas com sucesso!', mensagens });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ erro: 'Erro ao listar mensagens !', err });
//     }
// }


//ler as mensagens (especificadas pelo id do chamado) por ordem de envio
const lerMensagensController = async (req, res) =>{
    try{

        const {idChamado}  = req.body;
        const mensagens = await lerMsg(idChamado);
        res.status(200).json({mensagem: 'Mensagens listadas com sucesso!', mensagens})
    }
    catch(err){
        console.error(err);
        res.status(500).json({erro: 'Erro ao ler mensagens :( ', err});
    };
};

//funções de chat

//msg usuario para técnico - ta funcionando mas é preciso resolver a autenticação (usar o user logado), automatizar o id do chamado e o id do destinatário, para que puxe os valores do técnico e do chamado relacionado ao técnico.
const UsuarioEnviarMensagemController = async (req, res) => {
    try {
        //coisas da autenticacao idUsuario
        // const idUsuario = req.idUsuario; // vindo do token JWT
        const { idUsuario, idTecnico, conteudoMsg, idChamado } = req.body;
        await escreverMensagem({
            id_usuario: idUsuario,
            id_tecnico: idTecnico, //o id do tecnico seria  o técnico que respondeu o chamado
            conteudo: conteudoMsg,
            id_chamado: idChamado
        })
        res.status(201).json({ mensagem: 'Mensagem enviada com sucesso!' });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao usuário enviar mensagem!!' });
    }
};

const TecnicoEnviarMensagemController = async (req, res) => {
    try {
        //coisas da autenticacao idTecnico
        //const idTecnico = req.idTecnico
        const { idUsuario, idTecnico, conteudoMsg, idChamado } = req.body;
        await escreverMensagem({
            id_tecnico: idTecnico, //o id do tecnico seria  o técnico que respondeu o chamado
            id_usuario: idUsuario,
            conteudo: conteudoMsg,
            id_chamado: idChamado
        })
        res.status(201).json({ mensagem: 'Mensagem enviada com sucesso!' });
    } catch(error){
        console.error(error);
        res.status(500).json({mensagem: 'Erro ao técnico enviar mensagem!!'});
    }
}

// usado para usuarios comuns ----------------------------------------------------------------------------------------------------------------------------------------------------------------
export const criarChamadoController = async (req, res) => {
  // const { assunto, tipo_id, bloco, sala, descricao, prioridade, patrimonio } = req.body;
  const { assunto, tipo_id, descricao, prioridade, patrimonio } = req.body;
  const usuario_id = req.user?.id;
  // Verifica individualmente quais estão vazios
  // const camposVazios = [];
  // if (!assunto) camposVazios.push("assunto");
  // if (!tipo_id) camposVazios.push("tipo_id");
  // if (!bloco) camposVazios.push("bloco");
  // if (!sala) camposVazios.push("sala");
  // if (!descricao) camposVazios.push("descricao");
  // if (camposVazios.length > 0) {
  //   console.warn("Campos obrigatórios vazios:", camposVazios);
  //   return res.status(400).json({
  //     erro: `Preencha todos os campos obrigatórios: ${camposVazios.join(", ")}`
  //   });}

  const imagem = req.file?.filename || null;
  try {
    // const local_id = await buscarLocalId(bloco, sala);

    // if (!local_id) {
    //   return res.status(400).json({ erro: 'Local (bloco/sala) inválido.' });
    // }
    const dadosChamado = {
    assunto,
    tipo_id: tipo_id || null,
    descricao,
    prioridade: prioridade || 'none',
    imagem: imagem || null,
    // bloco:bloco || null,
    // sala: sala || null,
    usuario_id: usuario_id || null,
    patrimonio: patrimonio || null
  };
  Object.keys(dadosChamado).forEach((key) => {
    if (dadosChamado[key] === undefined) {
      dadosChamado[key] = null;
    }
  });
    await criarChamado(dadosChamado);
    // await criarChamado({ assunto, tipo_id, descricao, prioridade: prioridade || 'none', imagem, local_id, usuario_id, patrimonio});
    res.status(201).json({ mensagem: 'Chamado criado com sucesso.' });

  } catch (error) {
    console.error('Erro ao criar chamado:', error);
    res.status(500).json({ erro: 'Erro interno ao criar chamado.' });
  }};

export const listarChamadosController = async (req, res) => {
    try {
        const usuarioId = req.user?.id; // pegando do Passport
        if (!usuarioId) {
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }
        const chamados = await listarChamados(usuarioId);
        res.status(200).json({
            mensagem: 'Chamados listados com sucesso!',
            chamados
        });
    } catch (error) {
        console.error('Erro ao listar chamados:', error);
        res.status(500).json({ message: 'Erro ao listar chamados' });
    }};

// listar tipos de serviço
export const listarTiposServicoController = async (req, res) => {
    try {
      const tiposAtivos = await buscarTiposServico();
      res.json(tiposAtivos);
    } catch (error) {
      console.error('Erro ao listar tipos de serviço:', error);
      res.status(500).json({ erro: 'Erro interno ao listar tipos.' });
    } };

// listar blocos
export const buscarBlocosController = async (req, res) => {
    try {
        const blocos = await listarBlocos();
        res.status(200).json(blocos);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar blocos.' });
    }};

export const buscarSalasPorBlocoController = async (req, res) => {
    const { bloco } = req.params;

    if (!bloco) {
        return res.status(400).json({ erro: 'Bloco não informado.' });
    }
    try {
        const salas = await listarSalasPorBloco(bloco);
        res.status(200).json(salas);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar salas.' });
    }};

// usado para o adm -------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export const listarUsuariosPorSetorController = async (req, res) => {
  try {
    const tecnicos = await verTecnicos();
    const auxiliares = await verAuxiliaresLimpeza();
    const clientes = await verClientes();

    res.status(200).json({
      tecnicos,
      auxiliares,
      clientes
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }};

export const excluirUsuarioController = async (req, res) => {
  const usuarioId = parseInt(req.params.id, 10);

  if (isNaN(usuarioId)) {
    return res.status(400).json({ erro: 'ID do usuário inválido.' });
  }

  try {
    const affectedRows = await excluirUsuario(usuarioId);

    if (affectedRows === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Usuário excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return res.status(500).json({ erro: 'Erro interno ao excluir usuário.' });
  }};

export const listarTodosChamadosController = async(req,res)=>{
  try {
    const chamados = await verChamados();
    res.status(200).json(chamados);
} catch (err) {
    console.error('Erro ao listar chamados: ', err);
    res.status(500).json({ mensagem: 'Erro ao listar chamados' });
}
}

// usado para TECNICOS E AUXILIARES ------------------------------------------------------------------------------------------------------------------------------------------------------------
export const listarChamadosDisponiveisController = async (req, res) => {
  try {
    const usuario_id = req.user?.id;
    const chamados = await listarChamadosDisponiveis(usuario_id);
    res.json(chamados);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar chamados disponíveis.' });
  }};

export const pegarChamadoController = async (req, res) => {
  const usuario_id = req.user?.id;
  const { chamado_id } = req.body;

  if (!chamado_id) {
    return res.status(400).json({ erro: 'ID do chamado é obrigatório.' });
  }

  try {
    await pegarChamado(chamado_id, usuario_id);
    res.status(200).json({ mensagem: 'Chamado atribuído com sucesso.' });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }};

  export const contarChamadosController = async (req, res) =>{
    try{
    const total = await contarTodosChamados();
    res.json(total);
  } catch(error){
    console.error('Erro ao contar chamados!! ', error);
    res.status(500).json({erro: 'erro ao contar chamados'});
  }
  };

  export const chamadosPendentesController = async(req,res) =>{
    try{
      const total = await contarChamadosPendentes();
      res.json(total);
    } catch(error){
      console.error('erro ao contar chamados pendentes: ', error);
      res.status(500).json({erro: 'erro ao contar chamados pendentes!'});
    }
  };

  export const chamadosEmAndamentoController = async(req,res) =>{
    try{
      const total = await contarChamadosEmAndamento();
      res.json(total);
    } catch(error){
      console.error('erro ao contar chamados em andamento: ', error);
      res.status(500).json({erro: 'erro ao contar chamados em andamento!'});
    }
  };

  export const chamadosConcluidoController = async(req,res) =>{
    try{
      const total = await contarChamadosConcluido();
      res.json(total);
    } catch(error){
      console.error('erro ao contar chamados concluídos: ', error);
      res.status(500).json({erro: 'erro ao contar chamados concluídos!'});
    }
  };

// msgUsuarioTecnico
export { lerMensagensController, UsuarioEnviarMensagemController, TecnicoEnviarMensagemController, criarPrioridadeController, criarRelatorioController, verRelatoriosController };

