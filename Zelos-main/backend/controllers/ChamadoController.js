

import { criarNotificacao, buscarTiposServico, criarChamado, verTecnicos, verAuxiliaresLimpeza, verClientes, listarChamados, escreverMensagem, lerMsg, excluirUsuario, pegarChamado, verChamados, contarTodosChamados, contarChamadosPendentes, contarChamadosEmAndamento, contarChamadosConcluido, contarChamadosPorStatus, listarChamadosPorStatusEFunção, listarApontamentosPorChamado, criarApontamento, finalizarApontamento, buscarChamadoComNomeUsuario, obterChamadosPorStatus, obterChamadosPorTipo, obterAtividadesTecnicos } from "../models/Chamado.js";

// busca nome do usuario com base no ID
export const buscarChamadoComNomeUsuarioController = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ erro: "ID do chamado é obrigatório." });
  }

  try {
    const chamado = await buscarChamadoComNomeUsuario(id);
    if (!chamado) {
      return res.status(404).json({ erro: "Chamado não encontrado." });
    }
    res.json(chamado);
  } catch (error) {
    console.error("Erro ao buscar chamado com nome do usuário:", error);
    res.status(500).json({ erro: "Erro ao buscar chamado." });
  }
};

//funções de chat

//msg usuario para técnico - ta funcionando mas é preciso resolver a autenticação (usar o user logado), automatizar o id do chamado e o id do destinatário, para que puxe os valores do técnico e do chamado relacionado ao técnico.
const UsuarioEnviarMensagemController = async (req, res) => {
  try {
    //coisas da autenticacao idUsuario
    const idUsuario = req.user?.id;
    const {  conteudoMsg, idChamado } = req.body;
    await escreverMensagem({
      id_usuario: idUsuario,
      id_tecnico: null, //o id do tecnico seria  o técnico que respondeu o chamado
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
    const idTecnico = req.user?.id; //id do tecnico autenticado
    const { conteudoMsg, idChamado } = req.body;
    await escreverMensagem({
      id_tecnico: idTecnico, //o id do tecnico seria  o técnico que respondeu o chamado
      id_usuario: null, //não precisa ter 
      conteudo: conteudoMsg,
      id_chamado: idChamado
    })
    console.log(conteudoMsg)
    res.status(201).json({ mensagem: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao técnico enviar mensagem!!' });
  }
}

//ler as mensagens (especificadas pelo id do chamado) por ordem de envio
const lerMensagensController = async (req, res) => {
  try {
    const { idChamado } = req.query;
    const mensagens = await lerMsg(idChamado);
    res.status(200).json({ mensagem: 'Mensagens listadas com sucesso!', mensagens })
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao ler mensagens :( ', err });
  };
};

// usado para usuarios comuns ----------------------------------------------------------------------------------------------------------------------------------------------------------------

export function calcularDataLimite(prioridade) {
  const agora = new Date();
   
     switch (prioridade) {
       case "baixa":
         return new Date(agora.getTime() + 72 * 60 * 60 * 1000); // +72h
       case "média":
         return new Date(agora.getTime() + 24 * 60 * 60 * 1000); // +24h
       case "alta":
         return new Date(agora.getTime() + 8 * 60 * 60 * 1000);  // +8h
       case "urgente":
         return new Date(agora.getTime() + 4 * 60 * 60 * 1000);  // +4h
       default:
         return null;
     }
   }

export const criarChamadoController = async (req, res) => {
  const { assunto, tipo_id, descricao, prioridade, patrimonio } = req.body;
  const usuario_id = req.user?.id;

  const imagem = req.file?.filename || null;
  try {
    const data_limite = calcularDataLimite(prioridade);
    const dadosChamado = {
    assunto,
    tipo_id: tipo_id || null,
    descricao,
    prioridade: prioridade || 'none',
    imagem: imagem || null,
    usuario_id: usuario_id || null,
    patrimonio: patrimonio || null,
    data_limite
  };
  Object.keys(dadosChamado).forEach((key) => {
    if (dadosChamado[key] === undefined) {
      dadosChamado[key] = null;
    }
});  const resultado = await criarChamado(dadosChamado);
res.status(201).json({ ...dadosChamado, id: resultado, status_chamado: "pendente", criado_em: new Date() });  
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
  }
};

// listar tipos de serviço
export const listarTiposServicoController = async (req, res) => {
  try {
    const tiposAtivos = await buscarTiposServico();
    res.json(tiposAtivos);
  } catch (error) {
    console.error('Erro ao listar tipos de serviço:', error);
    res.status(500).json({ erro: 'Erro interno ao listar tipos.' });
  }
};

// usado para o adm -------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export const listarUsuariosPorSetorController = async (req, res) => {
  try {
    const tecnicos = await verTecnicos();
    const auxiliares = await verAuxiliaresLimpeza();

    res.status(200).json({
      tecnicos,
      auxiliares
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

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
  }
};

export const listarTodosChamadosController = async (req, res) => {
  try {
    const chamados = await verChamados();
    res.status(200).json(chamados);
  } catch (err) {
    console.error('Erro ao listar chamados: ', err);
    res.status(500).json({ mensagem: 'Erro ao listar chamados' });
  }
}

export const contarChamadosPorStatusController = async (req, res) => {
  const { modo } = req.query;

  if (!modo || (modo !== 'mensal' && modo !== 'anual')) {
    return res.status(400).json({ erro: 'Modo inválido. Use "mensal" ou "anual".' });
  }

  try {
    const resultado = await contarChamadosPorStatus(modo);

    // Garante que sempre tenha todos os status, mesmo que contagem = 0
    const todosOsStatus = ['pendente', 'em andamento', 'concluido'];
    const respostaFinal = todosOsStatus.map((status) => {
      const encontrado = resultado.find((r) => r.status_chamado === status);
      return {
        tipo: status,
        qtd: encontrado ? encontrado.qtd : 0,
        link: `/chamados?status=${status}`, 
      };
    });

    res.json(respostaFinal);
  } catch (error) {
    console.error('Erro ao contar chamados por status:', error);
    res.status(500).json({ erro: 'Erro interno ao contar chamados por status.' });
  }
};


const extrairFiltros = (query) => ({
  inicio: query.inicio || null,
  fim: query.fim || null,
  tipo_id: query.tipo_id || null,
  tecnico_id: query.tecnico_id || null,
  status_chamado: query.status_chamado || null,
});

export const relatorioStatusController = async (req, res) => {
  try {
    const filtros = extrairFiltros(req.query);
    const dados = await obterChamadosPorStatus(filtros);
    res.json(dados);
  } catch (error) {
    console.error('Erro ao gerar relatório de status:', error);
    res.status(500).json({ erro: 'Erro ao gerar relatório de status' });
  }
};

export const relatorioTipoController = async (req, res) => {
  try {
    const filtros = extrairFiltros(req.query);
    const dados = await obterChamadosPorTipo(filtros);
    res.json(dados);
  } catch (error) {
    console.error('Erro ao gerar relatório de tipo:', error);
    res.status(500).json({ erro: 'Erro ao gerar relatório de tipo' });
  }
};

export const relatorioTecnicosController = async (req, res) => {
  try {
    const filtros = extrairFiltros(req.query);
    const dados = await obterAtividadesTecnicos(filtros);
    res.json(dados);
  } catch (error) {
    console.error('Erro ao gerar relatório de técnicos:', error);
    res.status(500).json({ erro: 'Erro ao gerar relatório de técnicos' });
  }
};

// usado para TECNICOS E AUXILIARES ------------------------------------------------------------------------------------------------------------------------------------------------------------
export const listarChamadosDisponiveisController = async (req, res) => {
  try {
    const usuario_id = req.user?.id;
    const chamados = await listarChamadosDisponiveis(usuario_id);
    res.json(chamados);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar chamados disponíveis.' });
  }
};

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
  }
};
export const contarChamadosController = async (req, res) => {
  try {
    const total = await contarTodosChamados();
    res.json(total);
  } catch (error) {
    console.error('Erro ao contar chamados!! ', error);
    res.status(500).json({ erro: 'erro ao contar chamados' });
  }
};

export const chamadosPendentesController = async (req, res) => {
  try {
    const total = await contarChamadosPendentes();
    res.json(total);
  } catch (error) {
    console.error('erro ao contar chamados pendentes: ', error);
    res.status(500).json({ erro: 'erro ao contar chamados pendentes!' });
  }
};

export const chamadosEmAndamentoController = async (req, res) => {
  try {
    const total = await contarChamadosEmAndamento();
    res.json(total);
  } catch (error) {
    console.error('erro ao contar chamados em andamento: ', error);
    res.status(500).json({ erro: 'erro ao contar chamados em andamento!' });
  }
};

export const chamadosConcluidoController = async (req, res) => {
  try {
    const total = await contarChamadosConcluido();
    res.json(total);
  } catch (error) {
    console.error('erro ao contar chamados concluídos: ', error);
    res.status(500).json({ erro: 'erro ao contar chamados concluídos!' });
  }
};

export const listarChamadosFuncionarioController = async (req, res) => {
  const usuario_id = req.user?.id;
   const statusParam = req.query.status?.replace('-', ' '); // transforma "em-andamento" em "em andamento"
console.log("Status recebido:", statusParam);

  if (!usuario_id || !statusParam) {
    return res.status(400).json({ erro: 'Parâmetros ausentes.' });
  }

  try {
    const chamados = await listarChamadosPorStatusEFunção(usuario_id, statusParam);
    console.log("Chamados encontrados:", chamados);
    res.json(chamados);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar chamados por status.' });
  }
};

export const listarApontamentosController = async (req, res) => { 
  try {
    const chamado_id = req.params.chamado_id;
    const apontamentos = await listarApontamentosPorChamado(chamado_id);
    res.json(apontamentos);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar apontamentos' });
  }
};

export const criarApontamentoController = async (req, res) => {
  try {
    const { chamado_id, descricao } = req.body;
    const tecnico_id = req.user?.id;

    if (!descricao || !chamado_id || !tecnico_id) {
      return res.status(400).json({ erro: 'Descrição, chamado_id e tecnico_id são obrigatórios' });
    }

    const novo = await criarApontamento({ chamado_id, tecnico_id, descricao });

    return res.status(201).json({ mensagem: 'Apontamento criado com sucesso', id: novo });
  } catch (error) {
    console.error("Erro no controller criarApontamento:", error);
    return res.status(500).json({ erro: 'Erro interno ao criar apontamento' });
  }
};


export const finalizarApontamentoController = async (req, res) => {
  try {
    const { apontamento_id } = req.body;
    await finalizarApontamento(apontamento_id);
    res.json({ mensagem: 'Apontamento encerrado com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao finalizar apontamento' });
  }
};



// msgUsuarioTecnico
export { lerMensagensController, UsuarioEnviarMensagemController, TecnicoEnviarMensagemController };