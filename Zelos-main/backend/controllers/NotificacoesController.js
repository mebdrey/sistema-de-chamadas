import {criarNotificacao, obterNotificacoesPorUsuario, obterNotificacaoPorId, marcarComoLida, marcarTodasComoLidas, marcarVisualizadas, obterContagemNotificacoes} from '../models/Notificacoes.js'

// notificacoes ----------------------------------------------------------------------------------------
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