import { create, readAll, read, readQuery, update, deleteRecord } from '../config/database.js';

// funções utilizadas para ADMINs --------------------------------------------------------------------------------------------------------------------------------------------
export const excluirUsuario = async (usuarioId) => {
  try {
    // certificacao de que o id é numérico
    if (!Number.isInteger(usuarioId)) { throw new Error('ID do usuário inválido'); }
    const where = `id = ${usuarioId}`;
    const affectedRows = await deleteRecord('usuarios', where);
    return affectedRows;
  } catch (err) {
    console.error('Erro ao excluir usuário:', err);
    throw err;
  }
};

// Técnicos (externo, apoio técnico, manutenção)
export const verTecnicos = async () => {
  const consulta = ` SELECT * FROM usuarios WHERE funcao = "tecnico" OR funcao = "apoio_tecnico" OR funcao = "manutencao" `;
  try { return await readQuery(consulta); }
  catch (err) { throw err; }
};

// Auxiliares de limpeza
export const verAuxiliaresLimpeza = async () => {
  const consulta = 'SELECT * FROM usuarios WHERE funcao = "auxiliar_limpeza"';
  try { return await readQuery(consulta); }
  catch (err) { throw err; }
};

//admins
export const verAdmins = async () => {
  const consulta = 'SELECT *from usuarios where funcao = "admin"';
  try {
    return await readQuery(consulta);
  } catch (err) {
    throw err;
  }
}

export const verChamados = async () => {
  const consulta = `SELECT
      c.*,
      usuario.nome AS usuario_nome, tecnico.nome AS tecnico_nome, p.titulo AS tipo_titulo
    FROM chamados c
    LEFT JOIN usuarios usuario ON c.usuario_id = usuario.id
    LEFT JOIN usuarios tecnico ON c.tecnico_id = tecnico.id
    LEFT JOIN pool p ON c.tipo_id = p.id
    ORDER BY c.criado_em DESC `;

  try {
    const resultados = await readQuery(consulta);
    return Array.isArray(resultados) ? resultados : [];
  } catch (error) {
    console.error("Erro ao listar chamados (verChamados):", error);
    throw error;
  }
};

// Atualizar técnico/auxiliar em um chamado
export const atribuirTecnico = async (chamadoId, tecnicoId) => {
  try {
    const affectedRows = await update(
      "chamados",
      { tecnico_id: tecnicoId },
      `id = ${chamadoId}`
    );

    return affectedRows;
  } catch (err) {
    console.error("Erro no model atribuirTecnico:", err);
    throw err;
  }
};

export const contarChamadosPorStatus = async (modo) => {
  let sql = `SELECT status_chamado, COUNT(*) AS qtd
    FROM chamados
    WHERE YEAR(criado_em) = YEAR(NOW())`;

  if (modo === 'mensal') { sql += ` AND MONTH(criado_em) = MONTH(NOW())`; }

  sql += ` GROUP BY status_chamado`;

  try { return await readQuery(sql); }
  catch (err) { throw err; }
};

//contar chamados por prioridade
export const contarChamadosPorPrioridade = async () => {
  const sql = `SELECT p.nome AS tipo, COUNT(c.id) AS qtd
    FROM prioridades p
    LEFT JOIN chamados c ON p.id = c.prioridade_id
    GROUP BY p.id, p.nome
    ORDER BY
      CASE
        WHEN p.nome = 'alta' THEN 1
        WHEN p.nome = 'media' THEN 2
        WHEN p.nome = 'baixa' THEN 3
        ELSE 4
      END;`;

  try {
    const result = await readQuery(sql);
    return result.map(item => ({ ...item, tipo: item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1) }));
  } catch (err) {
    console.error('Erro ao contar chamados', err);
    throw err;
  }
};

// Buscar chamado específico
export const buscarChamado = async (id) => { return await read('chamados', `id = ${id}`); };

// Atualizar chamado (parcialmente)
export const editarChamado = async (id, data) => {

  const chamado = await buscarChamado(id); // Busca o chamado no banco
  if (!chamado) { throw new Error('Chamado não encontrado'); }

  // Só pode editar se for pendente ou em andamento
  if (!['pendente', 'em andamento'].includes(chamado.status_chamado)) { throw new Error('Chamado não pode ser editado. Apenas chamados pendentes ou em andamento podem ser alterados.'); }

  const camposPermitidos = ['prioridade_id', 'tecnico_id', 'tipo_id', 'descricao', 'assunto', 'status_chamado'];// Campos permitidos para atualização

  const dadosAtualizar = {};// Filtra só os campos permitidos que vieram no body
  for (const campo of camposPermitidos) { if (data[campo] !== undefined) { dadosAtualizar[campo] = data[campo]; } }

  if (Object.keys(dadosAtualizar).length === 0) { throw new Error('Nenhum campo válido informado para atualização'); }

  const linhasAfetadas = await update('chamados', dadosAtualizar, `id = ${id}`);
  return linhasAfetadas;
};

export const criarUsuario = async (dados) => {
  try {
    const copy = { ...dados };
    const id = await create('usuarios', copy);
    return id;
  } catch (err) {
    console.error('Erro ao criar usuário!', err);
    throw err;
  }
};

export const buscarUsuarioPorUsername = async (username) => {
  if (!username) return null;
  const uname = String(username).trim().toLowerCase();
  const rows = await readQuery('SELECT * FROM usuarios WHERE username = ? LIMIT 1', [uname]);
  return Array.isArray(rows) ? (rows[0] || null) : (rows || null);
};

// retorna array de usernames semelhantes (prefix)
export const buscarUsernamesSemelhantes = async (base) => {
  const sql = `SELECT username FROM usuarios WHERE username LIKE ? LIMIT 50`;
  const rows = await readQuery(sql, [`${base}%`]);
  return rows.map(r => r.username);
};

export const buscarUsuarioPorEmail = async (email) => {
  if (!email) return null;
  const e = String(email).trim().toLowerCase();
  const rows = await readQuery('SELECT * FROM usuarios WHERE email = ? LIMIT 1', [e]);
  return Array.isArray(rows) ? (rows[0] || null) : (rows || null);
};

const MAX_SUGESTOES = 5;
const MAX_CANDIDATOS = 10000; // trava de segurança

export const gerarSugestoesUsername = async (input) => {
  try {
    // aceita tanto string quanto objetos (por exemplo { username: 'valor' })
    const rawInput = (typeof input === 'string')
      ? input
      : (input && (input.username || input.nome || input.value)) || '';

    // normalização: remove acentos, caracteres não alfanuméricos e baixa para lowercase
    const normalize = (s) => String(s || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

    const baseRaw = normalize(rawInput);
    if (!baseRaw) return [];

    const base = baseRaw.slice(0, 30); // limitar tamanho base

    // Busca usernames semelhantes via função do model (não acessar DB aqui diretamente)
    // Espera-se que buscarUsernamesSemelhantes(base) retorne algo como ['juliaalves', 'juliaalves1', ...]
    const existentesRaw = Array.isArray(await buscarUsernamesSemelhantes(base))
      ? await buscarUsernamesSemelhantes(base)
      : [];

    // Normaliza os valores retornados (podem ser strings ou objetos)
    const existentes = (existentesRaw || []).map(item => {
      if (!item) return '';
      if (typeof item === 'string') return normalize(item);
      // se for objeto, tentar extrair propriedade username (ou fallback para toString)
      if (typeof item === 'object') {
        return normalize(item.username || item.username_raw || item.value || String(item));
      }
      return normalize(String(item));
    }).filter(Boolean);

    const setExist = new Set(existentes);

    // Monta sugestões iniciais sem colisões
    const sugestoes = [];
    if (!setExist.has(base)) sugestoes.push(base);

    // Gera alternativas simples e previsíveis (base + número)
    let i = 1;
    while (sugestoes.length < MAX_SUGESTOES && i <= MAX_CANDIDATOS) {
      const cand = `${base}${i}`;
      if (!setExist.has(cand) && !sugestoes.includes(cand)) sugestoes.push(cand);
      i++;
    }

    // Caso ainda não tenha atingido o máximo, adiciona variações com underscore/prefixos
    if (sugestoes.length < MAX_SUGESTOES) {
      const extras = [
        `${base}_01`,
        `${base}_user`,
        `${base}.official`,
        `${base}_team`
      ];
      for (const e of extras) {
        if (sugestoes.length >= MAX_SUGESTOES) break;
        if (!setExist.has(e) && !sugestoes.includes(e)) sugestoes.push(e);
      }
    }

    return sugestoes.slice(0, MAX_SUGESTOES);
  } catch (err) {
    console.error('gerarSugestoesUsername falhou:', err);
    return [];
  }
};


//SETORES
export const criarSetor = async (dados) => {
  try {
    const id = await create('pool', dados);
    return id;
  } catch (err) {
    console.error("Erro ao criar setor!", err);
    throw err;
  }
};

// insere múltiplas linhas em funcao_pool
export const adicionarFuncoesAoPool = async (poolId, funcoes = []) => {
  if (!funcoes.length) return 0;
  try {
    // construir placeholders
    const placeholders = funcoes.map(() => '(?, ?)').join(', ');
    const params = funcoes.flatMap(f => [f, poolId]);
    // use INSERT IGNORE para MySQL
    const sql = `INSERT IGNORE INTO funcao_pool (funcao, pool_id) VALUES ${placeholders}`;
    return await readQuery(sql, params);
  } catch (err) {
    console.error('Erro adicionarFuncoesAoPool:', err);
    throw err;
  }
};

export function toCanonicalFuncName(label) {
  if (!label) return '';
  // remover espaços nas pontas e forçar minúsculas
  let s = String(label).trim().toLowerCase();
  // remover acentos
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // substituir qualquer caractere não alfanumérico por underscore
  s = s.replace(/[^a-z0-9]+/g, '_');
  // colapsar underscores múltiplos e trim underscores
  s = s.replace(/_+/g, '_').replace(/^_+|_+$/g, '');
  return s;
}


//wrapper que cria o setor e já adiciona funcoes 
export const criarSetorComFuncoes = async (dados, funcoes = []) => {
  try {
    const id = await criarSetor(dados);
    if (funcoes && funcoes.length) {
      await adicionarFuncoesAoPool(id, funcoes);
    }
    return id;
  } catch (err) {
    console.error('Erro criarSetorComFuncoes:', err);
    throw err;
  }
};



export const existeSetorPorTitulo = async (titulo) => {
  try {
    const rows = await readQuery(
      "SELECT id FROM pool WHERE titulo = ? LIMIT 1",
      [titulo]
    );
    return Array.isArray(rows) && rows.length > 0;
  } catch (err) {
    console.error("Erro ao verificar setor por título!", err);
    throw err;
  }
};

export const listarSetores = async (where = null) => {
  try { return await readAll('pool', where); }
  catch (err) {
    console.error('Erro ao listar setores', err);
    throw err;
  }
};

export const excluirSetor = async (id) => {
  try {
    const rows = await deleteRecord('pool', `id = ${id}`);
    return rows;
  } catch (err) {
    console.error('Erro ao excluir setor', err);
    throw err;
  }
};

export const atualizarSetor = async (id, dados) => {
  try {
    const affected = await update('pool', dados, `id = ${id}`);
    return affected;
  } catch (err) {
    console.error('Erro ao atualizar setor', err);
    throw err;
  }
};

// // adiciona uma prioridade 
// export const criarPrioridade = async (dados) => {
//   try {
//     // dados: { nome, horas_limite, created_by }
//     const id = await create('prioridades', dados);
//     return id;
//   } catch (err) {
//     console.error('Erro ao criar prioridade', err);
//     throw err;
//   }
// };

// export const excluirPrioridade = async (id) => {
//   if (!id) throw new Error("ID inválido");
//   const affectedRows = await deleteRecord("prioridades", "id = ?", [id]);
//   return affectedRows;
// };

// export const getPrazoPorNome = async (nome) => {
//   try {
//     const row = await read('prioridades', `nome = ${JSON.stringify(nome)}`);
//     return row ? Number(row.horas_limite ?? row.prazo_dias ?? 0) : null;
//   } catch (err) {
//     console.error('Erro getPrazoPorNome', err);
//     throw err;
//   }
// };

// Criar prioridade
export async function criarPrioridade({ nome, horas_limite }) {
  try {
    return await create("prioridades", { nome, horas_limite });
  } catch (err) {
    console.error("Erro no model ao criar prioridade:", err);
    throw err; // repassa para o controller
  }
}

// Listar todas
export async function listarPrioridades() {
  try {
    return await readAll("prioridades");
  } catch (err) {
    console.error("Erro no model ao listar prioridades:", err);
    throw err;
  }
}

// Buscar por nome
export async function buscarPrioridadePorNome(nome) {
  try {
    return await readQuery("SELECT * FROM prioridades WHERE nome = ? LIMIT 1", [nome]);
  } catch (err) {
    console.error("Erro no model ao buscar prioridade por nome:", err);
    throw err;
  }
}

// Atualizar
export async function atualizarPrioridade(id, dados) {
  try {
    return await update("prioridades", dados, `id = ${id}`);
  } catch (err) {
    console.error("Erro no model ao atualizar prioridade:", err);
    throw err;
  }
}

// Excluir
export async function excluirPrioridade(id) {
  try {
    return await deleteRecord("prioridades", `id = ${id}`);
  } catch (err) {
    console.error("Erro no model ao excluir prioridade:", err);
    throw err;
  }
}

// calcula data limite com base em prioridade
export const calcularDataLimite = async (prioridade) => {
  try {
    const [row] = await read('prioridades', '*', 'nome = ?', [prioridade]);
    if (row && row.horas_limite) { return new Date(Date.now() + row.horas_limite * 60 * 60 * 1000); }
    return null;
  } catch (err) {
    console.error("Erro ao buscar prioridade:", err);
    return null;
  }
};

// Atualiza o data_limite de um chamado conforme sua prioridade atual.
export const atualizarPrazoPorChamado = async (chamadoId) => {
  const chamado = await read('chamados', `id = ${chamadoId}`);
  if (!chamado) throw new Error('Chamado não encontrado');

  const novaData = await calcularDataLimite(chamado.prioridade);
  const payload = { data_limite: novaData ? novaData.toISOString().slice(0, 19).replace('T', ' ') : null };
  const affected = await update('chamados', payload, `id = ${chamadoId}`);
  return affected;
};


export async function obterChamadosPorMesAno(prioridadeNome = null) {
  let sql = `SELECT MONTH(c.criado_em) as mes, COUNT(*) as total
    FROM chamados c
    JOIN prioridades p ON p.id = c.prioridade_id
    WHERE YEAR(c.criado_em) = YEAR(CURDATE())`;

  if (prioridadeNome) {
    sql += ` AND LOWER(p.nome) = LOWER(?)`;
    return await readQuery(sql + ` GROUP BY MONTH(c.criado_em)`, [prioridadeNome]);
  }

  sql += ` GROUP BY MONTH(c.criado_em)`;
  return await readQuery(sql);
}

export async function contarChamadosPorPool({
  setor, modo = 'anual' } = {}) {
  if (!setor) return [];
  const params = [];

  // Query: join direto com chamados (c) e pool (p) garantindo que só venham
  // linhas onde c.tecnico_id está preenchido e correspondem à pool pedida.
  // Também filtramos usuarios por funcao para garantir que sejam técnicos/auxiliares.
  let sql = `SELECT u.id   AS funcionario_id, u.nome AS funcionario_nome,
      SUM(CASE WHEN c.status_chamado = 'em andamento' THEN 1 ELSE 0 END) AS em_andamento,
      SUM(CASE WHEN c.status_chamado = 'concluido' THEN 1 ELSE 0 END)    AS concluido,
      COUNT(*) AS total
    FROM chamados c
      JOIN pool p     ON p.id = c.tipo_id
      JOIN usuarios u ON u.id = c.tecnico_id
    WHERE c.tecnico_id IS NOT NULL
      AND p.titulo = ?
      AND u.funcao IN ('tecnico', 'auxiliar_limpeza') `;
  params.push(setor);

  if (modo === 'anual') { sql += ` AND YEAR(c.criado_em) = YEAR(CURDATE()) `; }

  sql += `GROUP BY u.id, u.nome ORDER BY total DESC, u.nome ASC`;

  const rows = await readQuery(sql, params);
  return Array.isArray(rows) ? rows : [];
}


// export async function calcularSlaCumprido() {
//   try {
//     const sql = `
//       SELECT 
//         COUNT(*) AS total,
//         SUM(CASE 
//               WHEN status_chamado = 'concluido' 
//                AND finalizado_em <= data_limite 
//               THEN 1 ELSE 0 END) AS dentro_sla
//       FROM chamados;
//     `;
//     const [row] = await readQuery(sql);
//     const total = row?.total || 0;
//     const dentro = row?.dentro_sla || 0;
//     const percentual = total > 0 ? Math.round((dentro / total) * 100) : 0;

//     return { total, dentro, percentual };
//   } catch (err) {
//     console.error("Erro no model calcularSlaCumprido:", err);
//     throw err;
//   }
// }

export async function calcularSlaCumprido() {
  try {
    const sql = `
      SELECT
        COUNT(*) AS totalConcluidos,
        SUM(CASE
              WHEN c.finalizado_em <= COALESCE(c.data_limite,
                  DATE_ADD(c.criado_em, INTERVAL COALESCE(p.horas_limite, 72) HOUR))
              THEN 1 ELSE 0 END) AS dentro_sla,
        SUM(CASE
              WHEN c.finalizado_em > COALESCE(c.data_limite,
                  DATE_ADD(c.criado_em, INTERVAL COALESCE(p.horas_limite, 72) HOUR))
              THEN 1 ELSE 0 END) AS fora_sla
      FROM chamados c
      LEFT JOIN prioridades p ON c.prioridade_id = p.id
      WHERE c.status_chamado = 'concluido' AND c.finalizado_em IS NOT NULL;
    `;

    const [row] = await readQuery(sql);

    const total = Number(row?.totalConcluidos || 0);
    const dentro = Number(row?.dentro_sla || 0);
    const fora = Number(row?.fora_sla || 0);

    const percDentro = total > 0 ? Math.round((dentro / total) * 100) : 0;
    const percFora = total > 0 ? Math.round((fora / total) * 100) : 0;

    return {
      totalConcluidos: total,
      dentro,
      fora,
      percDentro,
      percFora
    };
  } catch (err) {
    console.error("Erro no model calcularSlaCumprido:", err);
    throw err;
  }
}

export const listarFuncoes = async () => {
  const rows = await readQuery('SELECT DISTINCT funcao FROM funcao_pool ORDER BY funcao');
  return rows.map(r => r.funcao);
};

export const funcaoExiste = async (funcao) => {
  if (!funcao) return false;
  const rows = await readQuery('SELECT 1 FROM funcao_pool WHERE funcao = ? LIMIT 1', [funcao]);
  return Array.isArray(rows) && rows.length > 0;
};

export const listarPoolsPorFuncao = async (funcao) => {
  return await readQuery(`
    SELECT p.* FROM pool p
    JOIN funcao_pool fp ON p.id = fp.pool_id
    WHERE fp.funcao = ?`, [funcao]);
};

export async function obterAvaliacoesPorSetor({ ano = null } = {}) {
  try {
    let sql = `
      SELECT
        p.titulo AS setor,
        COUNT(a.id) AS qtd,
        ROUND(AVG(a.nota), 2) AS media_nota
      FROM avaliacoes a
      JOIN chamados c ON a.chamado_id = c.id
      JOIN pool p     ON c.tipo_id = p.id
      WHERE 1 = 1
    `;
    const params = [];
    if (ano && Number.isInteger(Number(ano))) {
      sql += ` AND YEAR(a.data_avaliacao) = ?`;
      params.push(Number(ano));
    }
    sql += ` GROUP BY p.id, p.titulo
             ORDER BY media_nota DESC, p.titulo ASC`;
    const rows = await readQuery(sql, params);
    return Array.isArray(rows) ? rows : [];
  } catch (err) {
    console.error('Erro model obterAvaliacoesPorSetor:', err);
    throw err;
  }
}
