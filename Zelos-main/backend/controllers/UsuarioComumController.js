import { criarChamado, listarChamados, calcularDataLimiteUsuario, buscarTiposServico, criarAvaliacao, existeAvaliacao } from '../models/UsuarioComum.js'

// usado para usuarios comuns ------------------------------------------------------------------------------------------------------------------------------------------------------
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

// Controller para criar avaliação
// export const criarAvaliacaoController = async (req, res) => {
//     try {
//         const { chamado_id, tecnico_id, nota, comentario } = req.body;
//         const usuario_id = req.user?.id || null;

//         // validações básicas
//         if (!nota || nota < 1 || nota > 5) {
//             return res.status(400).json({ message: "Nota deve ser entre 1 e 5" });
//         }

//         if (!tecnico_id || !chamado_id) {
//             return res.status(400).json({ message: "chamado_id e tecnico_id são obrigatórios" });
//         }

//         if (!usuario_id) {
//             return res.status(401).json({ message: "Usuário não autenticado" });
//         }

//         // verifica se já existe avaliação
//         const jaExiste = await existeAvaliacao(usuario_id, tecnico_id, chamado_id);
//         if (jaExiste) {
//             return res.status(409).json({ message: "Você já avaliou este chamado" });
//         }

//         // cria avaliação
//         const id = await criarAvaliacao({
//             usuario_id,
//             tecnico_id,
//             nota,
//             comentario: comentario || null,
//         });

//         res.status(201).json({ id, usuario_id, tecnico_id, nota, comentario });

//     } catch (err) {
//         console.error("Erro ao criar avaliação:", err);
//         res.status(500).json({ message: "Erro interno" });
//     }
// };

// Controller - criarAvaliacaoController
export const criarAvaliacaoController = async (req, res) => {
    try {
      const { chamado_id, tecnico_id, nota, comentario } = req.body;
      const usuario_id = req.user?.id || null;
  
      // validações básicas
      if (!nota || nota < 1 || nota > 5) {
        return res.status(400).json({ message: "Nota deve ser entre 1 e 5" });
      }
  
      if (!tecnico_id || !chamado_id) {
        return res.status(400).json({ message: "chamado_id e tecnico_id são obrigatórios" });
      }
  
      if (!usuario_id) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }
  
      // Opcional: validar que o chamado existe e pertence ao técnico (recomendado)
      // const chamado = await read('chamados', `id = ${Number(chamado_id)}`);
      // if (!chamado) return res.status(404).json({ message: 'Chamado não encontrado' });
      // if (Number(chamado.tecnico_id) !== Number(tecnico_id)) return res.status(400).json({ message: 'Técnico informado não corresponde ao chamado' });
  
      // verifica se já existe avaliação
      const jaExiste = await existeAvaliacao(usuario_id, tecnico_id, chamado_id);
      if (jaExiste) {
        return res.status(409).json({ message: "Você já avaliou este chamado" });
      }
  
      // cria avaliação — **inclui chamado_id**
      const id = await criarAvaliacao({
        usuario_id,
        chamado_id: Number(chamado_id),
        tecnico_id: Number(tecnico_id),
        nota: Number(nota),
        comentario: comentario || null,
      });
  
      res.status(201).json({ id, usuario_id, chamado_id, tecnico_id, nota, comentario });
  
    } catch (err) {
      console.error("Erro ao criar avaliação:", err);
      res.status(500).json({ message: "Erro interno" });
    }
  };

// Controller para verificar se já existe avaliação (GET)
export const existeAvaliacaoController = async (req, res) => {
    try {
        const { chamado_id, tecnico_id } = req.query;
        const usuario_id = req.user?.id;

        if (!usuario_id || !chamado_id || !tecnico_id) {
            return res.status(400).json({ message: "Parâmetros faltando" });
        }

        const jaExiste = await existeAvaliacao(usuario_id, Number(tecnico_id), Number(chamado_id));
        res.json({ existe: jaExiste });
    } catch (err) {
        console.error("Erro ao verificar avaliação:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
