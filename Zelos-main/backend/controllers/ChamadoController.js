import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify/sync';

import { criarNotificacao, obterNotificacoesPorUsuario, obterNotificacaoPorId, marcarTodasComoLidas, marcarComoLida, contarChamadosPorPrioridade, buscarTiposServico, criarChamado, verTecnicos, verAuxiliaresLimpeza, verClientes, listarChamados, escreverMensagem, lerMsg, excluirUsuario, pegarChamado, verChamados, contarTodosChamados, contarChamadosPendentes, contarChamadosEmAndamento, contarChamadosConcluido, contarChamadosPorStatus, listarChamadosPorStatusEFunção, listarApontamentosPorChamado, criarApontamento, finalizarApontamento, buscarChamadoComNomeUsuario, obterChamadosPorMesAno, atribuirTecnico, editarChamado, criarUsuario, buscarUsuarioPorUsername, gerarSugestoesUsername, criarSetor, listarSetores, excluirSetor, atualizarSetor, criarPrioridade, listarPrioridades, getPrazoPorNome, calcularDataLimite, atualizarPrazoPorChamado, finalizarChamado, getApontamentosByChamado, getChamadoById, contarChamadosPorPool, getPrioridades, calcularDataLimiteUsuario, getApontamentoById, verificarReminders, marcarVisualizadas, obterContagemNotificacoes, existeSetorPorTitulo } from "../models/Chamado.js";

export async function listarNotificacoesController(req, res) {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) return res.status(401).json({ erro: "Não autenticado" });

    const notificacoes = await obterNotificacoesPorUsuario(usuarioId);
    res.json(notificacoes);
  } catch (err) {
    console.error("Erro ao listar notificações:", err);
    res.status(500).json({ erro: "Erro interno ao listar notificações" });
  }
}

export async function marcarNotificacaoLidaController(req, res) {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) return res.status(401).json({ erro: "Não autenticado" });

    const { id } = req.params;
    const notificacao = await obterNotificacaoPorId(id);
    if (!notificacao) return res.status(404).json({ erro: "Notificação não encontrada" });
    if (notificacao.usuario_id !== usuarioId) return res.status(403).json({ erro: "Sem permissão" });

    await marcarComoLida(id);
    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao marcar notificação como lida:", err);
    res.status(500).json({ erro: "Erro interno" });
  }
}

export async function marcarTodasComoLidasController(req, res) {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) return res.status(401).json({ erro: "Não autenticado" });

    await marcarTodasComoLidas(usuarioId);
    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao marcar todas notificações como lidas:", err);
    res.status(500).json({ erro: "Erro interno" });
  }
}

export async function marcarVisualizadasController(req, res) {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) return res.status(401).json({ erro: "Não autenticado" });

    await marcarVisualizadas(usuarioId);
    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao marcar notificações como visualizadas:", err);
    res.status(500).json({ erro: "Erro interno" });
  }
}

export async function contagemNotificacoesController(req, res) {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) return res.status(401).json({ erro: "Não autenticado" });

    const contagem = await obterContagemNotificacoes(usuarioId);
    res.json(contagem);
  } catch (err) {
    console.error("Erro ao obter contagem de notificações:", err);
    res.status(500).json({ erro: "Erro interno" });
  }
}

// busca nome do usuario com base no ID
export const buscarChamadoComNomeUsuarioController = async (req, res) => {
  const { id } = req.params;
  if (!id) { return res.status(400).json({ erro: "ID do chamado é obrigatório." }); }

  try {
    const chamado = await buscarChamadoComNomeUsuario(id);
    if (!chamado) { return res.status(404).json({ erro: "Chamado não encontrado." }) }
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
    console.log('[UsuarioEnviarMensagemController] req.user:', req.user, 'body:', req.body);
    const { conteudoMsg, idChamado } = req.body;
    await escreverMensagem({
      id_usuario: idUsuario, id_tecnico: null, //o id do tecnico seria  o técnico que respondeu o chamado
      conteudo: conteudoMsg, id_chamado: idChamado
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
    console.log('[TecnicoEnviarMensagemController] req.user:', req.user, 'body:', req.body);
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

export const enviarMensagemController = async (req, res) => {
  try {
    const user = req.user; // passport/session
    const { idChamado, conteudoMsg } = req.body;

    if (!user || !user.id) {
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }
    if (!idChamado || !conteudoMsg || !String(conteudoMsg).trim()) {
      return res.status(400).json({ erro: "idChamado e conteudoMsg são obrigatórios" });
    }

    // busca o chamado para validação de permissões
    const chamado = await getChamadoById(idChamado);
    if (!chamado) return res.status(404).json({ erro: "Chamado não encontrado" });

    const func = (user.funcao || user.role || "").toString().toLowerCase();

    // inicializa payload com ambos nulos e define a propriedade correta depois
    const payload = { id_chamado: idChamado, conteudo: conteudoMsg, id_tecnico: null, id_usuario: null };

    if (["tecnico", "apoio_tecnico", "manutencao"].includes(func)) {
      // técnico só pode enviar mensagens se for o técnico responsável do chamado (ou admin)
      if (!(Number(chamado.tecnico_id) === Number(user.id) || (user.funcao === "admin" || user.role === "admin"))) {
        return res.status(403).json({ erro: "Você não tem permissão para enviar mensagem neste chamado" });
      }
      payload.id_tecnico = user.id;
    } else {
      // usuário comum: só pode enviar se for o dono do chamado (ou admin)
      if (!(Number(chamado.usuario_id) === Number(user.id) || (user.funcao === "admin" || user.role === "admin"))) {
        return res.status(403).json({ erro: "Você não tem permissão para enviar mensagem neste chamado" });
      }
      payload.id_usuario = user.id;
    }

    console.log("[ChatController] payload a inserir:", payload, "req.user:", user);

    const insertRes = await escreverMensagem({
      id_usuario: payload.id_usuario,
      id_tecnico: payload.id_tecnico,
      conteudo: payload.conteudo,
      id_chamado: payload.id_chamado
    });

    return res.status(201).json({ mensagem: "Mensagem enviada com sucesso!", inserted: insertRes });
  } catch (err) {
    console.error("Erro enviarMensagemController:", err);
    return res.status(500).json({ erro: "Erro interno ao enviar mensagem" });
  }
};

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

// usado para usuarios comuns ----------------------------------------------------------------------------------------------------------------------------------------------------------
export const criarChamadoController = async (req, res) => {
  const { assunto, tipo_id, descricao, prioridade_id, patrimonio } = req.body;
  const usuario_id = req.user?.id;
  const imagem = req.file?.filename || null;

  try {
    const data_limite = await calcularDataLimiteUsuario(prioridade_id); //resolver a Promise corretamente

    const dadosChamado = { assunto, tipo_id: tipo_id || null, descricao, prioridade_id: prioridade_id || null, imagem: imagem || null, usuario_id: usuario_id || null, patrimonio: patrimonio || null, data_limite };

    // Garantir que nenhum valor undefined vá para o DB
    Object.keys(dadosChamado).forEach(key => { if (dadosChamado[key] === undefined) dadosChamado[key] = null; });

    const resultado = await criarChamado(dadosChamado);
    const chamadoId = resultado; // ajusta se sua função retornar objeto {insertId: ...}

    // --- Notificações: buscar chamado completo e técnicos uma vez ---
    try {
      const chamadoCompleto = await getChamadoById(chamadoId); // pega info do chamado (incluindo setor, usuario_id, etc.)
      const todosTecnicos = await verTecnicos(); // busca todos os técnicos (uma única chamada)

      // filtra por setor, se houver informação de setor no chamado
      let tecnicosFiltrados = todosTecnicos;
      if (chamadoCompleto && (chamadoCompleto.setor_id || chamadoCompleto.setor_nome)) {
        const setorId = chamadoCompleto.setor_id ?? null;
        const setorNome = chamadoCompleto.setor_nome ?? null;

        if (setorId) {
          tecnicosFiltrados = todosTecnicos.filter(t => Number(t.setor_id) === Number(setorId));
        } else if (setorNome) {
          tecnicosFiltrados = todosTecnicos.filter(t => String(t.setor_nome || '').toLowerCase() === String(setorNome).toLowerCase());
        }
      }

      // Se encontrou técnicos no setor, notifica cada um. Caso contrário, NÃO envia nada.
      if (Array.isArray(tecnicosFiltrados) && tecnicosFiltrados.length > 0) {
        // Use Promise.all para enviar as notificações em paralelo (mais rápido)
        await Promise.all(tecnicosFiltrados.map(t =>
          criarNotificacao({
            usuario_id: t.id,
            tipo: 'novo_chamado',
            titulo: 'Novo chamado disponível',
            descricao: `Novo chamado #${chamadoId}: ${dadosChamado.assunto || 'sem assunto'} em setor ${setorNome}`,
            chamado_id: chamadoId
          }).catch(err => {
            console.warn(`[criarChamadoController] falha ao notificar tecnico ${t.id}:`, err);
            // não throwar para não quebrar as outras notificações
          })
        ));
      } else {
        // comportamento solicitado: se não houver técnicos, NÃO envia notificação
        console.info(`[criarChamadoController] Nenhum técnico encontrado para o setor do chamado #${chamadoId}. Nenhuma notificação enviada.`);
      }
    } catch (errNotif) {
      // capturamos qualquer erro de notificação aqui para não prejudicar a criação do chamado
      console.warn('[criarChamadoController] erro ao processar notificações do chamado:', errNotif);
    }
    res.status(201).json({
      ...dadosChamado,
      id: resultado,
      status_chamado: "pendente",
      criado_em: new Date()
    });

  } catch (error) {
    console.error("Erro ao criar chamado:", error);
    res.status(500).json({ erro: "Erro interno ao criar chamado." });
  }
};

// Controller para listar prioridades
export const listarPrioridadesController = async (req, res) => {
  try {
    const prioridades = await getPrioridades();
    res.json(prioridades);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar prioridades." });
  }
};

export const listarChamadosController = async (req, res) => {
  try {
    const usuarioId = req.user?.id; // pegando do Passport
    if (!usuarioId) { return res.status(401).json({ message: 'Usuário não autenticado' }); }
    const chamados = await listarChamados(usuarioId);
    res.status(200).json({ mensagem: 'Chamados listados com sucesso!', chamados });
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

export const criarAvaliacao = async (req, res) => {
  try {
    const { usuario_id, atendimento_id, nota, comentario } = req.body;
    if (!usuario_id || !atendimento_id || !nota) {
      return res.status(400).json({ erro: "Campos obrigatórios não preenchidos" });
    }

    const resultado = await AvaliacaoModel.criarAvaliacao({ usuario_id, atendimento_id, nota, comentario });
    res.status(201).json({ sucesso: "Avaliação criada", id: resultado.insertId });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao criar avaliação" });
  }
};

export const listarAvaliacoes = async (req, res) => {
  try {
    const { atendimento_id } = req.params;
    const avaliacoes = await AvaliacaoModel.listarAvaliacoesPorAtendimento(atendimento_id);
    res.json(avaliacoes);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao listar avaliações" });
  }
};

export const obterMediaAvaliacao = async (req, res) => {
  try {
    const { atendimento_id } = req.params;
    const media = await AvaliacaoModel.mediaAvaliacoes(atendimento_id);
    res.json({ media });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao calcular média" });
  }
};

// usado para o adm -------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export const listarUsuariosPorSetorController = async (req, res) => {
  try {
    const tecnicos = await verTecnicos();
    const auxiliares = await verAuxiliaresLimpeza();
    res.status(200).json({ tecnicos, auxiliares });
  } catch (err) { res.status(500).json({ erro: err.message }); }
};

export const excluirUsuarioController = async (req, res) => {
  const usuarioId = parseInt(req.params.id, 10);

  if (isNaN(usuarioId)) { return res.status(400).json({ erro: 'ID do usuário inválido.' }); }

  try {
    const affectedRows = await excluirUsuario(usuarioId);

    if (affectedRows === 0) { return res.status(404).json({ erro: 'Usuário não encontrado.' }); }

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

export const atribuirTecnicoController = async (req, res) => {
  const { chamadoId, tecnicoId } = req.body;

  if (!chamadoId || !tecnicoId) { return res.status(400).json({ error: "chamadoId e tecnicoId são obrigatórios" }); }

  try {
    const affectedRows = await atribuirTecnico(chamadoId, tecnicoId);
    if (affectedRows === 0) { return res.status(404).json({ error: "Chamado não encontrado" }); }
    // Notificação para o técnico
    await criarNotificacao({
      usuario_id: tecnicoId,
      tipo: 'tecnico_atribuido',
      titulo: 'Novo chamado atribuído',
      descricao: `Você foi atribuído ao chamado #${chamadoId}`,
      chamado_id: chamadoId
    });
    res.status(200).json({ message: "Técnico/Auxiliar atribuído com sucesso" });
  } catch (err) {
    console.error("Erro no controller atribuirTecnicoController:", err);
    res.status(500).json({ error: "Erro ao atribuir técnico/auxiliar" });
  }
};

export const contarChamadosPorStatusController = async (req, res) => {
  const { modo } = req.query;

  if (!modo || (modo !== 'mensal' && modo !== 'anual')) { return res.status(400).json({ erro: 'Modo inválido. Use "mensal" ou "anual".' }); }

  try {
    const resultado = await contarChamadosPorStatus(modo);

    // Garante que sempre tenha todos os status, mesmo que contagem = 0
    const todosOsStatus = ['pendente', 'em andamento', 'concluido'];
    const respostaFinal = todosOsStatus.map((status) => {
      const encontrado = resultado.find((r) =>
        r.status_chamado.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() ===
        status.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      );
      // console.log('Resultado bruto do banco:', resultado);
      return { tipo: status, qtd: encontrado ? encontrado.qtd : 0, link: `/chamados?status=${status}`, };
    });

    res.json(respostaFinal);
  } catch (error) {
    console.error('Erro ao contar chamados por status:', error);
    res.status(500).json({ erro: 'Erro interno ao contar chamados por status.' });
  }
};


export const contarChamadosPorPrioridadeController = async (req, res) => {
  try {
    const resultadoFinal = await contarChamadosPorPrioridade();
    res.json(resultadoFinal);

  } catch (error) {
    console.error('Erro ao contar chamados por prioridade:', error);
    res.status(500).json({ erro: 'Erro ao contar chamados por prioridade.' });
  }
};


export const chamadosPorMesController = async (req, res) => {
  const { prioridade } = req.query;
  try {
    const dados = await obterChamadosPorMesAno(prioridade);
    res.status(200).json(dados);
  } catch (err) { res.status(500).json({ erro: 'Erro ao buscar dados dos chamados' }); }
}

// export const editarChamadoController = async (req, res) => {
//   try {
//     const chamadoId = req.params.id;
//     const dados = req.body;
//     const usuario = req.user; // vem do Passport

//     // Apenas admin pode editar qualquer chamado
//     if (usuario.funcao !== 'admin') { return res.status(403).json({ message: 'Apenas administradores podem editar chamados' }); }

//     const linhasAfetadas = await editarChamado(chamadoId, dados);

//     if (linhasAfetadas === 0) { return res.status(400).json({ message: 'Nenhuma alteração realizada' }); }

//     res.status(200).json({ message: 'Chamado atualizado com sucesso!' });
//   } catch (error) {
//     console.error('Erro ao editar chamado:', error);
//     res.status(500).json({ message: error.message });
//   }
// };
export const editarChamadoController = async (req, res) => {
  try {
    const chamadoId = req.params.id;
    const dados = req.body;
    const usuario = req.user; // vem do Passport

    // Apenas admin pode editar qualquer chamado
    if (usuario.funcao !== 'admin') { return res.status(403).json({ message: 'Apenas administradores podem editar chamados' }); }
// pega estado atual
const antes = await getChamadoById(chamadoId);
if (!antes) return res.status(404).json({ message: 'Chamado não encontrado' });
    const linhasAfetadas = await editarChamado(chamadoId, dados);

    if (linhasAfetadas === 0) { return res.status(400).json({ message: 'Nenhuma alteração realizada' }); }
     // --- prioridade alterada?
     if (dados.prioridade_id && Number(dados.prioridade_id) !== Number(antes.prioridade_id)) {
      // notificar dono
      await criarNotificacao({
        usuario_id: antes.usuario_id,
        tipo: 'prazo_alterado',
        titulo: 'Prioridade do chamado alterada',
        descricao: `A prioridade do seu chamado #${chamadoId} foi alterada.`,
        chamado_id: chamadoId
      });

      // notificar técnico atribuído (se houver)
      if (antes.tecnico_id) {
        await criarNotificacao({
          usuario_id: antes.tecnico_id,
          tipo: 'prazo_alterado',
          titulo: 'Prioridade alterada (chamado atribuído)',
          descricao: `A prioridade do chamado #${chamadoId} que você atende foi alterada.`,
          chamado_id: chamadoId
        });
      }
    }

    // 2) Status alterado -> notificar dono e técnico
    if (typeof dados.status_chamado !== 'undefined' && String(dados.status_chamado) !== String(antes.status_chamado)) {
      const novoStatus = dados.status_chamado;
      const titulo = `Status do chamado #${chamadoId} alterado para ${novoStatus}`;

      // dono
      await criarNotificacao({
        usuario_id: antes.usuario_id,
        tipo: 'status_atualizado',
        titulo,
        descricao: `O status do seu chamado #${chamadoId} mudou para "${novoStatus}".`,
        chamado_id: chamadoId
      }).catch(e => console.error('Erro notificação status -> dono:', e));

      // técnico
      if (antes.tecnico_id) {
        await criarNotificacao({
          usuario_id: antes.tecnico_id,
          tipo: 'status_atualizado',
          titulo,
          descricao: `O status do chamado #${chamadoId} (que você atende) mudou para "${novoStatus}".`,
          chamado_id: chamadoId
        }).catch(e => console.error('Erro notificação status -> tecnico:', e));
      }
    }

    // 3) Técnico alterado (atribuição/remover) -> notificar novo técnico e dono
    // Se o body contém tecnico_id e diferente do antes.tecnico_id
    if (typeof dados.tecnico_id !== 'undefined' && String(dados.tecnico_id) !== String(antes.tecnico_id)) {
      // notificar dono sobre mudança de técnico
      await criarNotificacao({
        usuario_id: antes.usuario_id,
        tipo: 'tecnico_atribuido',
        titulo: `Técnico alterado no chamado #${chamadoId}`,
        descricao: `O técnico responsável pelo seu chamado foi alterado.`,
        chamado_id: chamadoId
      }).catch(e => console.error('Erro notificação tecnico alterado -> dono:', e));

      // notificar técnico removido:
      if (antes.tecnico_id && !dados.tecnico_id) {
        await criarNotificacao({
          usuario_id: antes.tecnico_id,
          tipo: 'tecnico_removido',
          titulo: `Você foi removido do chamado #${chamadoId}`,
          descricao: `Você não é mais o técnico responsável pelo chamado #${chamadoId}.`,
          chamado_id: chamadoId
        }).catch(e => console.error('Erro notificação tecnico removido:', e));
      }
    }

    res.status(200).json({ message: 'Chamado atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao editar chamado:', error);
    res.status(500).json({ message: error.message });
  }
};

export const criarUsuarioController = async (req, res) => {
  try {
    const { nome, username, email, senha, funcao, ftPerfil } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'nome, email e senha são obrigatórios' });
    }
    // validar formato email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ message: 'email inválido' });

    const desiredUsername = username || (nome.split(/\s+/)[0] || nome).toLowerCase();
    const existing = await buscarUsuarioPorUsername(desiredUsername);
    if (existing) {
      const sugestoes = await gerarSugestoesUsername(nome);
      return res.status(409).json({ message: 'username já existe', sugestoes });
    }

    // checar email duplicado explicitamente
    const existingEmail = await read('usuarios', `email = ${JSON.stringify(email)}`);
    if (Array.isArray(existingEmail) ? existingEmail.length > 0 : !!existingEmail) {
      return res.status(409).json({ message: 'email já cadastrado' });
    }

    const userId = await criarUsuario({ nome, username: desiredUsername, email, senha, funcao: funcao || 'usuario', ftPerfil: ftPerfil || null });
    await criarNotificacao({
      usuario_id: userId,
      tipo: 'notificacao_geral',
      titulo: 'Bem-vindo ao Zelos',
      descricao: 'Seu usuário foi criado com sucesso. Bem-vindo(a)!',
      chamado_id: null
    });
    res.status(201).json({ id: userId, nome, username: desiredUsername, email, funcao: funcao || 'usuario' });
  } catch (err) {
    console.error('Erro criar usuário:', err);
    // retornar mensagem de erro mais rica para frontend (sem vazar stack)
    res.status(500).json({ message: 'Erro interno ao criar usuário', error: err.message || 'unknown' });
  }
};

// endpoint para sugerir usernames com base em nome (sem criar)
export const sugerirUsernameController = async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ message: 'nome obrigatório' });
    const sugestões = await gerarSugestoesUsername(nome);
    res.status(200).json({ sugestões });
  } catch (err) {
    console.error('Erro ao sugerir username:', err);
    res.status(500).json({ message: 'Erro interno' });
  }
};

//CRIAR SETOR
// Criar setor
export const criarSetorController = async (req, res) => {
  try {
    const { titulo, descricao } = req.body;
    const created_by = req.user?.id || null;

    if (!titulo || !String(titulo).trim()) {
      return res.status(400).json({ message: "titulo obrigatório" });
    }

    const tituloNorm = String(titulo).trim();

    const jaExiste = await existeSetorPorTitulo(tituloNorm);
    if (jaExiste) {
      return res.status(409).json({ message: "setor com esse título já existe" });
    }

    const id = await criarSetor({
      titulo: tituloNorm,
      descricao: descricao || null,
      created_by,
    });

    res.status(201).json({ id, titulo: tituloNorm, descricao });
  } catch (err) {
    console.error("Erro criar setor:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

// Listar setores
export const listarSetoresController = async (req, res) => {
  try {
    const setores = await listarSetores();
    res.status(200).json(setores);
  } catch (err) {
    console.error("Erro listar setores:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

// Atualizar setor
export const atualizarSetorController = async (req, res) => {
  try {
    const id = req.params.id;
    const dados = req.body;
    dados.updated_by = req.user?.id || null;

    const affected = await atualizarSetor(id, dados);
    if (affected === 0) return res.status(404).json({ message: "Setor não encontrado" });

    res.status(200).json({ message: "Setor atualizado" });
  } catch (err) {
    console.error("Erro atualizar setor:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

// Excluir setor
export const excluirSetorController = async (req, res) => {
  try {
    const id = req.params.id;
    const rows = await excluirSetor(id);
    if (rows === 0) return res.status(404).json({ message: "Setor não encontrado ou já excluído" });

    res.status(200).json({ message: "Setor excluído" });
  } catch (err) {
    console.error("Erro excluir setor:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};


export const criarPrioridadeController = async (req, res) => {
  try {
    const { nome, prazo_dias } = req.body;
    if (!nome || !String(nome).trim()) {
      return res.status(400).json({ message: 'nome obrigatório' });
    }

    // Normalize para comparação (trim + lowercase)
    const nomeNorm = String(nome).trim();

    // Verifica duplicidade de forma segura (parametrizado)
    const rows = await readQuery('SELECT id FROM prioridades WHERE nome = ? LIMIT 1', [nomeNorm]);
    const exists = Array.isArray(rows) ? rows.length > 0 : !!rows;
    if (exists) {
      return res.status(409).json({ message: 'prioridade com esse nome já existe' });
    }

    const created_by = req.user?.id || null;
    const id = await criarPrioridade({ nome: nomeNorm, prazo_dias: prazo_dias || 0, created_by });

    res.status(201).json({ id, nome: nomeNorm, prazo_dias: prazo_dias || 0 });
  } catch (err) {
    console.error('Erro criar prioridade:', err);
    res.status(500).json({ message: 'Erro interno' });
  }
};

// export const listarPrioridadesController = async (_req, res) => {
//   try {
//     const list = await listarPrioridades();
//     res.status(200).json(list);
//   } catch (err) {
//     console.error('Erro listar prioridades:', err);
//     res.status(500).json({ message: 'Erro interno' });
//   }
// };

//endpoint que recalcula e atualiza prazo de um chamado
export const atualizarPrazoController = async (req, res) => {
  try {
    const id = req.params.id;
    const affected = await atualizarPrazoPorChamado(id);
    if (affected === 0) return res.status(404).json({ message: 'Chamado não encontrado' });
    res.status(200).json({ message: 'Prazo atualizado com sucesso' });
  } catch (err) {
    console.error('Erro atualizar prazo:', err);
    res.status(500).json({ message: err.message || 'Erro interno' });
  }
};

//utilitário p calcular sem atualizar
export const calcularDataLimiteController = async (req, res) => {
  try {
    const { prioridade } = req.body;
    const dt = await calcularDataLimite(prioridade);
    res.status(200).json({ data_limite: dt ? dt.toISOString() : null });
  } catch (err) {
    console.error('Erro calcular data limite:', err);
    res.status(500).json({ message: 'Erro interno' });
  }
};
export async function contarChamadosPorPoolController(req, res) {
  try {
    const setorRaw = req.query.setor;
    const modo = (req.query.modo || 'anual').toLowerCase();

    if (!setorRaw || String(setorRaw).trim() === '') { return res.status(400).json({ erro: 'Parâmetro "setor" (pool.titulo) é obrigatório.' }); }
    const setor = String(setorRaw);

    const permitModo = ['anual', 'todos'];
    if (!permitModo.includes(modo)) { return res.status(400).json({ erro: 'modo inválido — use "anual" ou "todos"' }); }

    // chama model (que já garante que só traga usuarios ligados a tecnico_id e com funcao adequada)
    const dados = await contarChamadosPorPool({ setor, modo });

    const categorias = dados.map(d => d.funcionario_nome);
    const serieAndamento = dados.map(d => Number(d.em_andamento) || 0);
    const serieConcluido = dados.map(d => Number(d.concluido) || 0);
    const totalGeral = dados.reduce((acc, d) => acc + (Number(d.total) || 0), 0);

    return res.status(200).json({
      filtros: { setor, modo },
      categorias,
      series: [
        { name: 'Em andamento', data: serieAndamento },
        { name: 'Concluído', data: serieConcluido }
      ],
      tabela: dados,
      total: totalGeral
    });
  } catch (err) {
    console.error('Erro contarChamadosPorPoolController:', err);
    return res.status(500).json({ erro: 'Erro interno ao montar relatório por pool.' });
  }
}
// usado para TECNICOS E AUXILIARES ------------------------------------------------------------------------------------------------------------------------------------------------------------
export const listarChamadosDisponiveisController = async (req, res) => {
  try {
    const usuario_id = req.user?.id;
    const chamados = await listarChamadosDisponiveis(usuario_id);
    res.json(chamados);
  } catch (error) { res.status(500).json({ erro: 'Erro ao listar chamados disponíveis.' }); }
};

// export const pegarChamadoController = async (req, res) => {
//   const usuario_id = req.user?.id;
//   const { chamado_id } = req.body;
//   if (!chamado_id) { return res.status(400).json({ erro: 'ID do chamado é obrigatório.' });}
//   try {
//     await pegarChamado(chamado_id, usuario_id);
//     res.status(200).json({ mensagem: 'Chamado atribuído com sucesso.' });
//   } catch (error) {res.status(400).json({ erro: error.message });}
// };

export const pegarChamadoController = async (req, res) => {
  const usuario_id = req.user?.id;
  const { chamado_id } = req.body;

  if (!chamado_id) { return res.status(400).json({ erro: 'ID do chamado é obrigatório.' }); }

  try {
    const chamadoAtualizado = await pegarChamado(chamado_id, usuario_id);

    // devolve mensagem e chamado atualizado (contendo data_limite)
    res.status(200).json({ mensagem: 'Chamado atribuído com sucesso.', chamado: chamadoAtualizado });
  } catch (error) { res.status(400).json({ erro: error.message }); }
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

  if (!usuario_id || !statusParam) { return res.status(400).json({ erro: 'Parâmetros ausentes.' }); }

  try {
    // dispara reminders antes de listar
    await verificarReminders();
    const chamados = await listarChamadosPorStatusEFunção(usuario_id, statusParam);
    console.log("Chamados encontrados:", chamados);
    res.json(chamados);
  } catch (error) { res.status(500).json({ erro: 'Erro ao buscar chamados por status.' }); }
};

const usuarioPodeVerApontamentos = (user, chamado) => {
  if (!user) return false;
  if (user.role === 'admin') return true; // acesso irrestrito ao adm
  if (chamado.usuario_id === user.id) return true;   // dono do chamado
  if (chamado.tecnico_id === user.id) return true;   // técnico atribuído
  return false;
};

// export const listarApontamentosController = async (req, res) => {
//   try {
//     const chamado_id = req.params.chamado_id;
//     const apontamentos = await listarApontamentosPorChamado(chamado_id);
//     res.json(apontamentos);
//   } catch (error) {res.status(500).json({ erro: 'Erro ao listar apontamentos' });}
// };

export const listarApontamentosController = async (req, res) => {
  try {
    const chamado_id = req.params.chamado_id || req.body.chamado_id;
    if (!chamado_id) return res.status(400).json({ erro: 'chamado_id é obrigatório' });

    // pega o chamado para validar permissões
    const chamado = await getChamadoById(chamado_id);
    if (!chamado) return res.status(404).json({ erro: 'Chamado não encontrado' });

    // valida permissão: dono do chamado, técnico atribuído ou admin
    const user = req.user;
    if (!usuarioPodeVerApontamentos(user, chamado)) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    // pega apontamentos com join (nome do técnico)
    const apontamentos = await getApontamentosByChamado(chamado_id);
    return res.json(apontamentos);
  } catch (error) {
    console.error('Erro listarApontamentosController:', error);
    return res.status(500).json({ erro: 'Erro ao listar apontamentos' });
  }
};

// export const criarApontamentoController = async (req, res) => {
//   try {
//     const { chamado_id, descricao } = req.body;
//     const tecnico_id = req.user?.id;

//     if (!descricao || !chamado_id || !tecnico_id) {return res.status(400).json({ erro: 'Descrição, chamado_id e tecnico_id são obrigatórios' });}

//     const novo = await criarApontamento({ chamado_id, tecnico_id, descricao });

//     return res.status(201).json({ mensagem: 'Apontamento criado com sucesso', id: novo });
//   } catch (error) {
//     console.error("Erro no controller criarApontamento:", error);
//     return res.status(500).json({ erro: 'Erro interno ao criar apontamento' });
//   }
// };

export const criarApontamentoController = async (req, res) => {
  try {
    // técnico cria apontamento (já tinha lógica para técnicos)
    const { chamado_id, descricao } = req.body;
    const tecnico_id = req.user?.id;

    if (!descricao || !chamado_id || !tecnico_id) {
      return res.status(400).json({ erro: 'Descrição, chamado_id e tecnico_id são obrigatórios' });
    }

    // valida que req.user realmente é técnico atribuído OU tem permissão
    const chamado = await getChamadoById(chamado_id);
    if (!chamado) return res.status(404).json({ erro: 'Chamado não encontrado' });

    // apenas o técnico atribuído (ou admin) pode criar apontamento neste chamado
    if (!(chamado.tecnico_id === tecnico_id || req.user.role === 'admin')) {
      return res.status(403).json({ erro: 'Você não pode criar apontamentos neste chamado' });
    }

    // cria e pega o insertId
    const insertId = await criarApontamento({ chamado_id, descricao, tecnico_id });

    // busca o registro recém-criado completo (com nome do técnico)
    const novoApont = await getApontamentoById(insertId);
    // Notificação para o usuário dono do chamado
    await criarNotificacao({
      usuario_id: chamado.usuario_id,
      tipo: 'resposta_tecnico',
      titulo: 'Atualização no chamado',
      descricao: `O técnico adicionou um novo apontamento: "${descricao}".`,
      chamado_id
    });

    // retorna o apontamento completo ao cliente (front do usuário e do técnico)
    return res.status(201).json(novoApont);
  } catch (error) {
    console.error('Erro criarApontamentoController:', error);
    return res.status(500).json({ erro: 'Erro interno ao criar apontamento' });
  }
};

export const finalizarApontamentoController = async (req, res) => {
  try {
    const { apontamento_id } = req.body;
    await finalizarApontamento(apontamento_id);
    res.json({ mensagem: 'Apontamento encerrado com sucesso' });
  } catch (error) { res.status(500).json({ erro: 'Erro ao finalizar apontamento' }); }
};

export const finalizarChamadoController = async (req, res) => {
  try {
    const tecnico_id = req.user?.id;
    const { chamado_id } = req.body;

    if (!chamado_id) { return res.status(400).json({ erro: 'ID do chamado é obrigatório.' }); }

    const dadosRelatorio = await finalizarChamado(chamado_id, tecnico_id);

    // pega usuario_id corretamente do objeto retornado
    const usuarioId = dadosRelatorio?.chamado?.usuario_id ?? null;

    if (usuarioId !== null) {
      await criarNotificacao({
        usuario_id: usuarioId,
        tipo: 'status_atualizado',
        titulo: 'Chamado concluído',
        descricao: `Seu chamado #${chamado_id} foi concluído pelo técnico.`,
        chamado_id
      });
    } else {
      console.warn(`[finalizarChamadoController] não encontrou usuario_id para notificar (chamado ${chamado_id})`);
    }

    return res.status(200).json({ mensagem: 'Chamado finalizado com sucesso.', relatorio: dadosRelatorio });
  } catch (err) {
    console.error('Erro finalizarChamadoController:', err);
    const msg = err.message || 'Erro ao finalizar chamado';
    return res.status(400).json({ erro: msg });
  }
};
/* ---------- utilitários de formatação ---------- */
const formatDateTime = (input) => {
  if (!input) return '';
  const d = new Date(input);
  const date = d.toLocaleDateString('pt-BR');
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} – ${time}`;
};
const formatDurationBetween = (start, end) => {
  if (!start || !end) return '';
  const s = new Date(start);
  const e = new Date(end);
  let diff = Math.max(0, e - s);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);
  const minutes = Math.floor(diff / (1000 * 60));
  if (hours > 0) return `${hours}h${minutes}min`;
  return `${minutes}min`;
};
const safeText = (v) => (v === null || v === undefined) ? '' : String(v);
const primeiraLetraMaiuscula = (s) => { if (!s) return ''; return s.charAt(0).toUpperCase() + s.slice(1); };
const chamadaPrioridade = (p) => { if (!p) return ''; return p === 'alta' ? 'Alta' : p === 'media' ? 'Média' : p === 'baixa' ? 'Baixa' : p; };

function formatIdHash(chamado, opts = { zeros: 0 }) {
  // retorna "#50" ou com zero-pad se opts.zeros > 0 -> "#00050"
  const id = String(chamado.id);
  if (opts.zeros && Number(opts.zeros) > 0) { return `#${id.padStart(opts.zeros, '0')}`; }
  return `#${id}`;
}

export const gerarRelatorioChamadoController = async (req, res) => {
  try {
    const chamado_id = req.params.chamado_id;
    const formato = (req.query.format || 'pdf').toLowerCase();

    // Pega do model (sem queries aqui)
    const chamado = await getChamadoById(chamado_id);
    if (!chamado) return res.status(404).json({ erro: 'Chamado não encontrado' });

    // APENAS apontamentos no histórico
    const apontamentos = await getApontamentosByChamado(chamado_id);

    // Campos para relatório
    const idExterno = formatIdHash(chamado, { zeros: 0 }); // coloque zeros:4 para "#0050" etc.
    const rel = {
      id: chamado.id,
      idExterno,
      assunto: safeText(chamado.assunto),
      descricao_inicial: safeText(chamado.descricao),
      usuario_nome: safeText(chamado.nome_usuario),
      prioridade: chamadaPrioridade(chamado.prioridade),
      status: primeiraLetraMaiuscula(chamado.status_chamado),
      criado_em: chamado.criado_em,
      finalizado_em: chamado.finalizado_em,
      tecnico_responsavel: safeText(chamado.tecnico_nome),
      setor_nome: safeText(chamado.setor_nome), // nome do setor vindo do model
      anexos: chamado.imagem ? [chamado.imagem] : []
    };

    // ---------- CSV ----------
    if (formato === 'csv') {
      // monta linhas no formato [rotulo, valor]
      const rows = [];

      rows.push(['Relatório de Chamado']); // título (aparece na primeira coluna)
      rows.push(['ID do Chamado', rel.idExterno]); // ex: "#50"
      rows.push(['Status', rel.status]);
      rows.push(['Prioridade', rel.prioridade]);
      rows.push(['Data/Hora de Abertura', formatDateTime(rel.criado_em)]);
      rows.push(['Data/Hora de Conclusão', formatDateTime(rel.finalizado_em)]);
      rows.push([]); // linha em branco
      rows.push(['Solicitante', rel.usuario_nome]);
      rows.push(['Assunto', rel.assunto]);
      rows.push(['Descrição', rel.descricao_inicial]);
      rows.push(['Setor', rel.setor_nome]);
      rows.push(['Técnico Atribuido', rel.tecnico_responsavel]);
      rows.push(['Data/Hora da Atribuição', formatDateTime(chamado.atribuido_em || chamado.criado_em)]);
      rows.push([]); // linha em branco

      // Histórico de Atendimento — colocamos todos os apontamentos na célula da direita,
      // cada apontamento em nova linha dentro da célula.
      rows.push(['Histórico de Atendimento']);
      const apontLines = (apontamentos && apontamentos.length)
        ? apontamentos.map(a => `${formatDateTime(a.comeco)} — ${safeText(a.tecnico_nome || a.tecnico_id)}: ${safeText(a.descricao)}`)
        : [];
      if (apontLines.length) {
        // coloca todos os apontamentos numa única célula (com quebras de linha)
        rows.push(['Apontamentos', apontLines.join('\n')]);
      } else { rows.push(['Apontamentos', 'Descreva aqui o procedimento realizado.']); }

      rows.push([]); // linha em branco

      // Métricas
      rows.push(['Métricas']);
      rows.push(['Tempo total de atendimento', formatDurationBetween(rel.criado_em, rel.finalizado_em) || '-']);
      rows.push(['SLA', (typeof chamado.sla_cumprido !== 'undefined' ? (chamado.sla_cumprido ? 'Cumprido' : 'Não cumprido') : 'Não calculado')]);

      // monta CSV; stringify vai colocar as quebras de linha dentro de células e escapar corretamente
      const csv = stringify(rows, { delimiter: ';' });

      res.setHeader('Content-Disposition', `attachment; filename=relatorio_chamado_${rel.id}.csv`);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      // BOM para Excel/acentuação
      return res.send('\uFEFF' + csv);
    }

    // ---------- PDF ----------
    res.setHeader('Content-Disposition', `attachment; filename=relatorio_chamado_${rel.id}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    doc.pipe(res);

    // Título
    doc.fontSize(18).text('Relatório de Chamado', { align: 'center' });
    doc.moveDown(1);

    // Cabeçalho resumo
    doc.fontSize(11);
    doc.text(`ID do Chamado: ${rel.idExterno}`);
    doc.text(`Status: ${rel.status}`);
    doc.text(`Prioridade: ${rel.prioridade}`);
    doc.text(`Data/Hora de Abertura: ${formatDateTime(rel.criado_em)}`);
    doc.text(`Data/Hora de Conclusão: ${formatDateTime(rel.finalizado_em)}`);
    doc.moveDown(0.8);

    // Solicitante
    doc.fontSize(12).text('Solicitante', { underline: true });
    doc.moveDown(0.2);
    doc.fontSize(11).text(`Nome: ${rel.usuario_nome}`);
    doc.moveDown(0.6);

    // Descrição inicial
    doc.fontSize(12).text('Descrição Inicial', { underline: true });
    doc.moveDown(0.2);
    doc.fontSize(11).text(`Assunto: ${rel.assunto}`);
    doc.moveDown(0.1);
    doc.fontSize(11).text(`Descrição: ${rel.descricao_inicial}`);
    doc.moveDown(0.1);
    doc.fontSize(11).text(`Setor: ${rel.setor_nome}`);
    doc.moveDown(0.6);

    // Atribuição
    doc.fontSize(12).text('Atribuição', { underline: true });
    doc.moveDown(0.2);
    doc.fontSize(11).text(`Técnico Responsável: ${rel.tecnico_responsavel}`);
    doc.fontSize(11).text(`Data/Hora da Atribuição: ${formatDateTime(chamado.atribuido_em || chamado.criado_em)}`);
    doc.moveDown(0.6);

    // Histórico — **apenas apontamentos**
    doc.fontSize(12).text('Histórico de Atendimento', { underline: true });
    doc.moveDown(0.4);

    const startX = doc.x;
    const tableTop = doc.y;
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const col1W = 120;
    const col2W = 140;
    const col3W = pageWidth - col1W - col2W;

    // Definição das duas colunas: Apontamentos (esquerda) e Métricas (direita)
    const leftX = startX;
    const leftWidth = col1W + col2W; // largura total da coluna esquerda
    const rightX = startX + leftWidth; // início da coluna direita
    const rightWidth = col3W; // largura disponível para métricas

    // Títulos (negrito, sem underline) — mantêm a ordem original
    doc.font('Helvetica-Bold').fontSize(11).fillColor('black');
    doc.text('Apontamentos', leftX, doc.y, { width: leftWidth });
    doc.text('Métricas', rightX, doc.y, { width: rightWidth });
    doc.moveDown(0.3);

    // Inicializa cursores verticais para cada coluna (usa posição corrente)
    let cursorLeftY = doc.y;
    let cursorRightY = doc.y;

    // Conteúdo — APONTAMENTOS (coluna esquerda)
    if (apontamentos && apontamentos.length) {
      doc.font('Helvetica').fontSize(10).fillColor('black');
      let step = 1;
      for (const a of apontamentos) {
        const encerrado = a.fim ? formatDateTime(a.fim) : formatDateTime(a.comeco);
        const tecnico = safeText(a.tecnico_nome || a.tecnico_id || '');
        const desc = safeText(a.descricao || '');

        const line = `${step}. ${encerrado} — ${tecnico}: ${desc}`;

        // calcula altura que a string ocupará e escreve na coluna esquerda
        const h = doc.heightOfString(line, { width: leftWidth });
        doc.text(line, leftX, cursorLeftY, { width: leftWidth });
        cursorLeftY += h + 6; // espaçamento entre itens
        step++;
      }
    } else {
      // restaura o texto que você pediu quando não houver apontamentos
      doc.font('Helvetica').fontSize(10).fillColor('black');
      const noApontText = 'Nenhum apontamento foi encontrado.';
      const h = doc.heightOfString(noApontText, { width: leftWidth });
      doc.text(noApontText, leftX, cursorLeftY, { width: leftWidth });
      cursorLeftY += h + 6;
    }

    // Conteúdo — MÉTRICAS (coluna direita)
    doc.font('Helvetica').fontSize(11).fillColor('black');
    const tempoTotal = formatDurationBetween(rel.criado_em, rel.finalizado_em) || '-';
    const slaText = (typeof chamado.sla_cumprido !== 'undefined') ? (chamado.sla_cumprido ? 'Cumprido' : 'Não cumprido') : 'Não calculado';

    const metricsLines = [
      `Tempo total de atendimento: ${tempoTotal}`,
      `SLA: ${slaText}`
    ];

    for (const ml of metricsLines) {
      const h = doc.heightOfString(ml, { width: rightWidth });
      doc.text(ml, rightX, cursorRightY, { width: rightWidth });
      cursorRightY += h + 4;
    }

    // posiciona doc.y para a próxima seção usando o maior Y usado
    const nextY = Math.max(cursorLeftY, cursorRightY);
    doc.y = nextY + 8;
    doc.moveDown(0);

    // Anexos
    if (rel.anexos && rel.anexos.length) {
      doc.fontSize(12).text('Anexos', { underline: true });
      doc.moveDown(0.2);
      rel.anexos.forEach(a => { doc.fontSize(11).text(`${a}`); });
      doc.moveDown(0.4);
    }

    doc.end();
  } catch (err) {
    console.error('Erro gerarRelatorioChamadoController:', err);
    return res.status(500).json({ erro: 'Erro ao gerar relatório' });
  }
};
// msgUsuarioTecnico
export { lerMensagensController, UsuarioEnviarMensagemController, TecnicoEnviarMensagemController };