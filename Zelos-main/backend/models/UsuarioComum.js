import { create, readAll, read, readQuery, update, deleteRecord } from '../config/database.js';

// funções utilizadas para usuarios comuns --------------------------------------------------------------------------------------------------------------------------------------------
//criar chamado usuário -- funcionando
export const criarChamado = async (dados) => {
    try {
        const resultado = await create("chamados", dados);
        return resultado;
    } catch (err) {
        console.error("Erro ao criar chamado!", err);
        throw err;
    }
};

// export const listarChamados = async (usuarioId) => {
//     try { return await readAll('chamados', `usuario_id = ${usuarioId}`); }
//     catch (err) {
//         console.error("Erro ao listar chamados!", err);
//         throw err;
//     }
// };

export const listarChamados = async (usuarioId) => {
    try {
      const sql = `
        SELECT
          c.*,
          u.id        AS tecnico_id,
          u.nome      AS tecnico_nome,
          u.ftPerfil  AS tecnico_foto
        FROM chamados c
        LEFT JOIN usuarios u ON c.tecnico_id = u.id
        WHERE c.usuario_id = ?
        ORDER BY c.criado_em DESC
      `;
      const rows = await readQuery(sql, [usuarioId]);
      return rows || [];
    } catch (err) {
      console.error("Erro ao listar chamados com técnico (usuarios):", err.sqlMessage || err.message, err.sql || '');
      throw err;
    }
  };

export const calcularDataLimiteUsuario = async (prioridade_id) => {
    try {
        if (!prioridade_id) return null; // caso não tenha prioridade

        // buscar a prioridade pelo id (read retorna só uma linha, não array)
        const prioridade = await read("prioridades", `id = ${prioridade_id}`);

        if (!prioridade) { return null; } // prioridade não encontrada


        // calcular data limite com base em horas_limite
        const agora = new Date();
        const data_limite = new Date(agora.getTime() + prioridade.horas_limite * 60 * 60 * 1000);

        return data_limite;

    } catch (error) {
        console.error("Erro ao calcular data limite:", error);
        return null;
    }
};

// busca servicos
export const buscarTiposServico = async () => {
    const tipos = await readAll('pool');
    return tipos.filter(tipo => tipo.status_pool === 'ativo');
};


// Cria uma avaliação
// export const criarAvaliacao = async (dados) => {
//     try {
//         // dados: { usuario_id, tecnico_id, nota, comentario }
//         const id = await create("avaliacoes", dados);
//         return id;
//     } catch (err) {
//         console.error("Erro ao criar avaliação!", err);
//         throw err;
//     }
// };
export const criarAvaliacao = async (dados) => {
    try {
      // dados esperados: { usuario_id, chamado_id, tecnico_id, nota, comentario }
      const id = await create("avaliacoes", dados);
      return id;
    } catch (err) {
      console.error("Erro ao criar avaliação! Payload:", dados, err.sqlMessage || err.message);
      throw err;
    }
  };
  

// Verifica se já existe avaliação para um chamado específico
// export const existeAvaliacao = async (usuario_id, tecnico_id, chamado_id) => {
//     try {
//         const sql = `
//         SELECT a.*
//         FROM avaliacoes a
//         JOIN chamados c ON c.tecnico_id = a.tecnico_id
//         WHERE a.usuario_id = ? AND a.tecnico_id = ? AND c.id = ? 
//         LIMIT 1
//       `;
//         const rows = await readQuery(sql, [usuario_id, tecnico_id, chamado_id]);
//         return Array.isArray(rows) && rows.length > 0;
//     } catch (err) {
//         console.error("Erro ao verificar avaliação:", err);
//         throw err;
//     }
// };
// Verifica se já existe avaliação para um chamado específico
export const existeAvaliacao = async (usuario_id, tecnico_id, chamado_id) => {
    try {
      const sql = `
        SELECT 1
        FROM avaliacoes
        WHERE usuario_id = ? AND tecnico_id = ? AND chamado_id = ?
        LIMIT 1
      `;
      const rows = await readQuery(sql, [usuario_id, tecnico_id, chamado_id]);
      return Array.isArray(rows) && rows.length > 0;
    } catch (err) {
      console.error("Erro ao verificar avaliação:", err.sqlMessage || err.message, err.sql || '');
      throw err;
    }
  };
  