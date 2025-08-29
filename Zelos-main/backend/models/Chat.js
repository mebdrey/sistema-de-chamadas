import { readQuery, create } from "../config/database.js";

//chat usuário -> técnico e técnico -> usuario
export const escreverMensagem = async (dados) => {
    try {
        console.log('[MODEL escreverMensagem] dados a inserir:', dados);
        return await create('mensagens', {
            id_usuario: dados.id_usuario,
            id_tecnico: dados.id_tecnico,
            conteudo: dados.conteudo,
            id_chamado: dados.id_chamado
        });
    }
    catch (err) {
        console.error('Erro ao enviar mensagem! - models', err);
        throw err;
    }
}

export const lerMsg = async (idChamado) => {
    const consulta = `SELECT * FROM mensagens WHERE id_chamado = ${idChamado} order by data_envio asc`;
    try { return await readQuery(consulta); }
    catch (err) { console.error('Erro ao listar mensagens do chamado especificado!!', err) }
}

// Conta mensagens não-lidas PARA O USUÁRIO AUTENTICADO, mas apenas as mensagens ENVIADAS PELA OUTRA PONTA.
// Se role === "tecnico": conta mensagens enviadas por usuários (id_usuario IS NOT NULL) e pertencentes a chamados desse técnico.
// Se role === "usuario": conta mensagens enviadas por técnicos (id_tecnico IS NOT NULL) e pertencentes aos chamados desse usuário.
export const contarMensagensNaoLidas = async (userId, role, idChamado = null) => {
    try {
        let sql, params = [];

        if (role === "tecnico") {
            sql = `
          SELECT COUNT(*) AS qtd
          FROM mensagens m
          JOIN chamados c ON c.id = m.id_chamado
          WHERE m.lida = false
            AND m.id_usuario IS NOT NULL      -- foi enviada por usuário (ou seja: é para o técnico)
            AND m.id_tecnico IS NULL
            AND c.tecnico_id = ?
        `;
            params.push(userId);
        } else {
            sql = `
          SELECT COUNT(*) AS qtd
          FROM mensagens m
          JOIN chamados c ON c.id = m.id_chamado
          WHERE m.lida = false
            AND m.id_tecnico IS NOT NULL      -- foi enviada por técnico (ou seja: é para o usuário)
            AND m.id_usuario IS NULL
            AND c.usuario_id = ?
        `;
            params.push(userId);
        }

        if (idChamado) {
            sql += ` AND m.id_chamado = ?`;
            params.push(idChamado);
        }

        const rows = await readQuery(sql, params);
        return rows && rows[0] ? Number(rows[0].qtd) : 0;
    } catch (err) {
        console.error("Erro contarMensagensNaoLidas:", err);
        throw err;
    }
};

// Marca como lidas as mensagens NÃO-LIDAS destinadas a este usuário naquele chamado.
// IMPORTANTE: apenas marca mensagens que foram ENVIADAS PELA OUTRA PONTA.
export const marcarMensagensComoLidas = async (userId, role, idChamado) => {
    try {
        if (!idChamado) throw new Error("idChamado obrigatório");

        let sql, params = [];

        if (role === "tecnico") {
            // marca mensagens do usuário (destinadas ao técnico) naquele chamado, e que pertençam a um chamado desse técnico
            sql = `
          UPDATE mensagens m
          JOIN chamados c ON c.id = m.id_chamado
          SET m.lida = true
          WHERE m.id_chamado = ?
            AND m.id_usuario IS NOT NULL
            AND m.id_tecnico IS NULL
            AND m.lida = false
            AND c.tecnico_id = ?
        `;
            params = [idChamado, userId];
        } else {
            // marca mensagens do técnico (destinadas ao usuário) naquele chamado, e que pertençam a um chamado desse usuário
            sql = `
          UPDATE mensagens m
          JOIN chamados c ON c.id = m.id_chamado
          SET m.lida = true
          WHERE m.id_chamado = ?
            AND m.id_tecnico IS NOT NULL
            AND m.id_usuario IS NULL
            AND m.lida = false
            AND c.usuario_id = ?
        `;
            params = [idChamado, userId];
        }

        // readQuery usa connection.execute internamente e retorna o resultado do driver.
        // Não precisamos do resultado aqui, apenas assegurar que a query executou.
        await readQuery(sql, params);
        return true;
    } catch (err) {
        console.error("Erro marcarMensagensComoLidas:", err);
        throw err;
    }
};