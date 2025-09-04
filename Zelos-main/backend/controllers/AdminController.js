

import { excluirUsuario, verTecnicos, verAuxiliaresLimpeza, verChamados, atribuirTecnico, contarChamadosPorStatus, contarChamadosPorPrioridade, editarChamado, criarUsuario, buscarUsuarioPorUsername, gerarSugestoesUsername, criarSetor, existeSetorPorTitulo, listarSetores, excluirSetor, atualizarSetor, criarPrioridade, atualizarPrazoPorChamado, obterChamadosPorMesAno, contarChamadosPorPool, buscarUsuarioPorEmail, listarPrioridades, buscarPrioridadePorNome, atualizarPrioridade, excluirPrioridade, verAdmins, calcularSlaCumprido, obterAvaliacoesPorSetor, listarFuncoes, listarPoolsPorFuncao, adicionarFuncoesAoPool, toCanonicalFuncName } from '../models/Admin.js'
import { criarNotificacao } from '../models/Notificacoes.js';
import { getChamadoById } from '../models/Chamado.js'
import { readAll, readQuery, update, deleteRecord } from '../config/database.js'; // Importar deleteRecord

// usado para o adm -------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export const listarUsuariosPorSetorController = async (req, res) => {
    try {
        const tecnicos = await verTecnicos();
        const auxiliares = await verAuxiliaresLimpeza();
        const admins = await verAdmins();
        res.status(200).json({ tecnicos, auxiliares, admins });
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

export const listarUsuariosController = async (req, res) => {
    try {
        // Seleciona explicitamente colunas válidas (evita SQL gerado incorretamente)
        const rows = await readQuery('SELECT id, nome, username, email, funcao, ftPerfil, criado_em FROM usuarios ORDER BY id DESC', []);
        // Normalizar/renomear campos se necessário para frontend
        const out = Array.isArray(rows) ? rows.map(r => ({
            id: r.id,
            nome: r.nome,
            username: r.username,
            email: r.email,
            funcao: r.funcao,
            ftPerfil: r.ftPerfil,
            criado_em: r.criado_em
        })) : [];
        res.status(200).json(out);
    } catch (err) {
        console.error('Erro listar usuários:', err);
        res.status(500).json({ message: 'Erro interno ao listar usuários' });
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

// validador simples de email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// normalização leve (mantém apenas a-z0-9, sem acentos)
const normalizeIdentifier = (s) => String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

export const criarUsuarioController = async (req, res) => {
    try {
        const { nome, username, email, senha, funcao, ftPerfil } = req.body;

        // validações básicas
        if (!nome || !email || !senha) {
            return res.status(400).json({ message: 'nome, email e senha são obrigatórios' });
        }
        if (!emailRegex.test(String(email).trim())) {
            return res.status(400).json({ message: 'email inválido' });
        }

        // define desiredUsername (prefere campo username; senão, primeiro nome)
        const desiredRaw = (username && String(username).trim().length) ? username : (String(nome).split(/\s+/)[0] || nome);
        const desiredUsername = normalizeIdentifier(desiredRaw);

        // 1) checa username duplicado
        const existingUser = await buscarUsuarioPorUsername(desiredUsername);
        if (existingUser) {
            // gera sugestões com base no username desejado 
            const sugestoes = await gerarSugestoesUsername(desiredUsername);
            return res.status(409).json({ message: 'username já existe', sugestoes });
        }

        // 2) checa email duplicado
        const existingEmail = await buscarUsuarioPorEmail(email);
        if (existingEmail) {
            return res.status(409).json({
                message: 'Erros de validação', fieldErrors: { email: 'Email já cadastrado' }
            });
        }

        // 3) valida função e prepara payload
        const finalFuncao = funcao

        const payload = {
            nome,
            username: desiredUsername,
            email,
            senha,
            funcao: finalFuncao,
            ftPerfil: ftPerfil || null
        };

        // 4) cria usuário 
        const userId = await criarUsuario(payload);

        // 5) criar notificação 
        await criarNotificacao({
            usuario_id: userId,
            tipo: 'notificacao_geral',
            titulo: 'Bem-vindo ao Zelos',
            descricao: 'Seu usuário foi criado com sucesso. Bem-vindo(a)!',
            chamado_id: null
        });

        // 6) responder 201
        return res.status(201).json({ id: userId, nome, username: desiredUsername, email, funcao: finalFuncao });
    } catch (err) {
        console.error('Erro criar usuário:', err);
        return res.status(500).json({ message: 'Erro interno ao criar usuário', error: err && err.message ? err.message : 'unknown' });
    }
};

export const verificarUsernameController = async (req, res) => {
    try {
        const username = req.query.username || req.body?.username || req.params?.username;
        if (!username) {
            return res.status(400).json({ message: 'username é obrigatório' });
        }
        const found = await buscarUsuarioPorUsername(username);
        res.status(200).json({ exists: !!found });
    } catch (err) {
        console.error('Erro verificar username:', err);
        res.status(500).json({ message: 'Erro interno' });
    }
};


// endpoint para sugerir usernames com base em username (sem criar)
export const sugerirUsernameController = async (req, res) => {
    try {
        const input = req.body?.username || req.query?.username || req.body?.nome || '';

        if (!input) return res.status(400).json({ message: 'username é obrigatório' });

        const sugestoes = await gerarSugestoesUsername(input);
        return res.status(200).json({ sugestoes });
    } catch (err) {
        console.error('Erro ao sugerir username:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
};

// SETOR -------------------------------------------------------------------------------------------------
// Criar setor
// export const criarSetorController = async (req, res) => {
//     try {
//         const { titulo, descricao } = req.body;
//         const created_by = req.user?.id || null;

//         if (!titulo || !titulo.trim()) {
//             return res.status(400).json({ message: "Título é obrigatório" });
//         }

//         const tituloNorm = titulo.trim();
//         const jaExiste = await existeSetorPorTitulo(tituloNorm);
//         if (jaExiste) {
//             return res.status(409).json({ message: "Já existe um setor com esse título" });
//         }

//         const id = await criarSetor({ titulo: tituloNorm, descricao, created_by });
//         return res.status(201).json({ id, titulo: tituloNorm, descricao });
//     } catch (err) {
//         console.error("Erro ao criar setor:", err);
//         res.status(500).json({ message: "Erro interno" });
//     }
// };
export const criarSetorController = async (req, res) => {
    try {
        const { titulo, descricao, funcoes } = req.body;
        const created_by = req.user?.id || null;
        if (!titulo || !titulo.trim()) return res.status(400).json({ message: 'Título é obrigatório' });

        const tituloNorm = titulo.trim();
        if (await existeSetorPorTitulo(tituloNorm)) return res.status(409).json({ message: 'Já existe um setor com esse título' });

        // normalizar funcoes (se existirem)
        let funcoesNorm = [];
        if (Array.isArray(funcoes)) {
            funcoesNorm = funcoes
                .map(f => toCanonicalFuncName(String(f || '')))
                .filter(f => f && f.length > 0);
            // evitar duplicatas
            funcoesNorm = Array.from(new Set(funcoesNorm));
        }

        // criar setor
        const id = await criarSetor({ titulo: tituloNorm, descricao, created_by });

        // adicionar mapeamentos (cria novas funções em funcao_pool se necessário)
        if (funcoesNorm.length) {
            await adicionarFuncoesAoPool(id, funcoesNorm);
        }

        return res.status(201).json({ id, titulo: tituloNorm, descricao, funcoes: funcoesNorm });
    } catch (err) {
        console.error('Erro ao criar setor:', err);
        res.status(500).json({ message: 'Erro interno' });
    }
};

// Listar setores
export const listarSetoresController = async (req, res) => {
    try {
        const setores = await listarSetores();
        return res.status(200).json(setores);
    } catch (err) {
        console.error("Erro ao listar setores:", err);
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
        if (affected === 0) {
            return res.status(404).json({ message: "Setor não encontrado" });
        }

        return res.status(200).json({ message: "Setor atualizado" });
    } catch (err) {
        console.error("Erro ao atualizar setor:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};

// Excluir setor
export const excluirSetorController = async (req, res) => {
    try {
        const id = req.params.id;
        const affected = await excluirSetor(id);

        if (affected === 0) {
            return res.status(404).json({ message: "Setor não encontrado ou já excluído" });
        }

        return res.status(200).json({ message: "Setor excluído" });
    } catch (err) {
        console.error("Erro ao excluir setor:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};

// prioridades --------------------------------------------------------------------
// Criar
export const criarPrioridadeController = async (req, res) => {
    try {
        const { nome, prazo_dias, horas_limite } = req.body;
        if (!nome || !String(nome).trim()) {
            return res.status(400).json({ message: "nome obrigatório" });
        }

        const nomeNorm = String(nome).trim();
        const exists = await buscarPrioridadePorNome(nomeNorm);
        if (Array.isArray(exists) ? exists.length > 0 : !!exists) {
            return res.status(409).json({ message: "prioridade já existe" });
        }

        const horas =
            horas_limite !== undefined
                ? Number(horas_limite)
                : prazo_dias !== undefined
                    ? Number(prazo_dias) * 24
                    : 0;

        const id = await criarPrioridade({ nome: nomeNorm, horas_limite: horas });

        res.status(201).json({ id, nome: nomeNorm, horas_limite: horas });
    } catch (err) {
        console.error("Erro criar prioridade:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};

// Atualizar
export const atualizarPrioridadeController = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, prazo_dias, horas_limite } = req.body;

        const dadosAtualizar = {};

        if (nome) dadosAtualizar.nome = String(nome).trim();

        // somente atualiza se for número finito
        if (horas_limite !== undefined && Number.isFinite(Number(horas_limite))) {
            dadosAtualizar.horas_limite = Number(horas_limite);
        } else if (prazo_dias !== undefined && Number.isFinite(Number(prazo_dias))) {
            dadosAtualizar.horas_limite = Number(prazo_dias) * 24;
        }

        // se não há campos válidos para atualizar, responde 400/404
        if (Object.keys(dadosAtualizar).length === 0) {
            return res.status(400).json({ message: "Nada válido para atualizar." });
        }

        const affectedRows = await atualizarPrioridade(id, dadosAtualizar);

        if (affectedRows === 0) {
            return res.status(404).json({ message: "Prioridade não encontrada ou nada para atualizar." });
        }

        res.status(200).json({ message: "Prioridade atualizada com sucesso." });
    } catch (err) {
        console.error("Erro atualizar prioridade:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};


// Excluir
export const excluirPrioridadeController = async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await excluirPrioridade(id);

        if (affectedRows === 0) {
            return res.status(404).json({ message: "Prioridade não encontrada." });
        }

        res.status(200).json({ message: "Prioridade excluída com sucesso." });
    } catch (err) {
        console.error("Erro excluir prioridade:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};

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


// export const slaCumpridoController = async (req, res) => {
//     try {
//       const dados = await calcularSlaCumprido();
//       res.status(200).json(dados);
//     } catch (err) {
//       console.error("Erro controller SLA:", err);
//       res.status(500).json({ erro: "Erro interno ao calcular SLA" });
//     }
//   };

export const slaCumpridoController = async (req, res) => {
    try {
        const dados = await calcularSlaCumprido();
        res.status(200).json(dados);
    } catch (err) {
        console.error("Erro controller SLA:", err);
        res.status(500).json({ erro: "Erro interno ao calcular SLA" });
    }
};

export const listarFuncoesController = async (req, res) => {
    try {
        const funcoes = await listarFuncoes();
        res.status(200).json(funcoes);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

export const listarPoolsPorFuncaoController = async (req, res) => {
    try {
        const { funcao } = req.params;
        if (!funcao) return res.status(400).json({ erro: 'função requerida' });
        const pools = await listarPoolsPorFuncao(funcao);
        res.json(pools);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

export async function avaliacoesPorSetorController(req, res) {
    try {
        const ano = req.query.ano ? Number(req.query.ano) : null;
        const dados = await obterAvaliacoesPorSetor({ ano });

        // categorias = nomes dos setores
        const categorias = dados.map(d => d.setor);

        // série única: média de notas por setor
        const series = [
            { name: 'Média de notas', data: dados.map(d => Number(d.media_nota)) }
        ];

        // opcional: enviar também tabela completa (setor, qtd, media_nota)
        return res.status(200).json({
            filtros: { ano: ano || 'todos' },
            categorias,
            series,
            tabela: dados
        });
    } catch (err) {
        console.error('Erro controller avaliacoesPorSetorController:', err);
        return res.status(500).json({ erro: 'Erro interno ao montar relatório de avaliações por setor.' });
    }
}
