import { create, readAll, read, readQuery, update, deleteRecord } from '../config/database.js';

export async function criarNotificacao({ usuario_id, tipo, titulo, descricao, chamado_id = null }) {
    const query = `INSERT INTO notificacoes (usuario_id, tipo, titulo, descricao, chamado_id) VALUES (?, ?, ?, ?, ?)`;
    const values = [usuario_id, tipo, titulo, descricao, chamado_id];
    try {
        const result = await readQuery(query, values);
        return result;
    } catch (err) {
        console.error("Erro ao criar notificação:", err);
        throw err;
    }
}

export async function obterNotificacoesPorUsuario(usuarioId) {
    const q = `SELECT * FROM notificacoes WHERE usuario_id = ? ORDER BY criado_em DESC`;
    return readQuery(q, [usuarioId]);
}

export async function obterNotificacaoPorId(id) {
    const q = `SELECT * FROM notificacoes WHERE id = ? LIMIT 1`;
    const rows = await readQuery(q, [id]);
    return Array.isArray(rows) ? rows[0] : rows;
}

export async function marcarComoLida(id) {
    const q = `UPDATE notificacoes SET lida = TRUE WHERE id = ?`;
    return readQuery(q, [id]);
}

export async function marcarTodasComoLidas(usuarioId) {
    const q = `UPDATE notificacoes SET lida = TRUE WHERE usuario_id = ?`;
    return readQuery(q, [usuarioId]);
}

// marca todas notificações como visualizadas (quando abrir o sino)
export async function marcarVisualizadas(usuarioId) {
    const q = `UPDATE notificacoes SET visualizada = TRUE WHERE usuario_id = ? AND visualizada = FALSE`;
    return readQuery(q, [usuarioId]);
}

// retorna contagem de notificações
export async function obterContagemNotificacoes(usuarioId) {
    const q = `
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN lida = FALSE THEN 1 ELSE 0 END) AS nao_lidas,
        SUM(CASE WHEN visualizada = FALSE THEN 1 ELSE 0 END) AS nao_visualizadas
      FROM notificacoes
      WHERE usuario_id = ?
    `;
    const rows = await readQuery(q, [usuarioId]);
    return Array.isArray(rows) && rows[0] ? rows[0] : { total: 0, nao_lidas: 0, nao_visualizadas: 0 };
}