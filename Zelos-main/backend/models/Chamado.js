
import puppeteer from 'puppeteer';
import { jsPDF } from 'jspdf';
import bcrypt from 'bcryptjs';
import { create, readAll, read, readQuery, update, deleteRecord } from '../config/database.js';

export async function criarNotificacao({ usuario_id, tipo, titulo, descricao, chamado_id = null }) {
  const query = ` INSERT INTO notificacoes (usuario_id, tipo, titulo, descricao, chamado_id) VALUES (?, ?, ?, ?, ?) `;
  const values = [usuario_id, tipo, titulo, descricao, chamado_id];
  try { await readQuery(query, values); }
  catch (err) {
    console.error('Erro ao criar notificação:', err);
    throw err;
  }
}

// busca o nome do usuario pelo seu id
export const buscarChamadoComNomeUsuario = async (chamadoId) => {
  const sql = `SELECT c.*, u.nome AS nome_usuario FROM chamados c
    JOIN usuarios u ON c.usuario_id = u.id
    WHERE c.id = ?`;
  try {
    const result = await readQuery(sql, [chamadoId]);
    return result[0];
  } catch (err) { throw err; }
};

//funções para o chat -------------------------------------------------------------------------------------

//chat usuário -> técnico e técnico -> usuario
const escreverMensagem = async (dados) => {
  try {
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

const lerMsg = async (idChamado) => {
  const consulta = `SELECT * FROM mensagens WHERE id_chamado = ${idChamado} order by data_envio asc`;
  try { return await readQuery(consulta); }
  catch (err) { console.error('Erro ao listar mensagens do chamado especificado!!', err) }
}

// funções utilizadas para usuarios comuns --------------------------------------------------------------------------------------------------------------------------------------------
//criar chamado usuário -- funcionando
export const criarChamado = async (dados) => {
  try {
    const resultado = await create('chamados', dados);
    return resultado;
  } catch (err) {
    console.error("Erro ao criar chamado!", err);
    throw err;
  }
};

export const listarChamados = async (usuarioId) => {
  try { return await readAll('chamados', `usuario_id = ${usuarioId}`); }
  catch (err) {
    console.error("Erro ao listar chamados!", err);
    throw err;
  }
};

// busca servicos
export const buscarTiposServico = async () => {
  const tipos = await readAll('pool');
  return tipos.filter(tipo => tipo.status_pool === 'ativo');
};

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

// Usuários comuns (clientes)
export const verClientes = async () => {
  const consulta = 'SELECT * FROM usuarios WHERE funcao = "usuario"';
  try { return await readQuery(consulta); }
  catch (err) { throw err; }
};

// export const verChamados = async () => {
//   try {return await readAll('chamados')}
// catch (error) {
//     console.error('Erro ao listar chamados:', error);
//     throw error;
//   }
// }

export const verChamados = async () => {
  const consulta = `SELECT
      c.*,
      usuario.nome AS usuario_nome,
      tecnico.nome AS tecnico_nome,
      p.titulo AS tipo_titulo
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
  // SQL para selecionar a coluna 'prioridade' e contar o número de ocorrências de cada uma.
  // O WHERE filtra para contar apenas as prioridades relevantes, ignorando 'none'.
  const sql = ` SELECT prioridade, COUNT(*) AS qtd 
    FROM chamados WHERE  prioridade IN ('alta', 'média', 'baixa', 'none')
    GROUP BY  prioridade `;

  try {return await readQuery(sql);  // Executa a consulta usando a sua função helper 'readQuery'
  } catch (err) {
    // Em caso de erro, lança a exceção para ser tratada pelo controller
    console.error('Erro no model ao contar chamados por prioridade:', err);
    throw err;
  }
};

// Buscar chamado específico
export const buscarChamado = async (id) => { return await read('chamados', `id = ${id}`); };

// Atualizar chamado (parcialmente)
export const editarChamado = async (id, data) => {
  // Busca o chamado no banco
  const chamado = await buscarChamado(id);
  if (!chamado) { throw new Error('Chamado não encontrado'); }

  // Só pode editar se for pendente ou em andamento
  if (!['pendente', 'em andamento'].includes(chamado.status_chamado)) { throw new Error('Chamado não pode ser editado. Apenas chamados pendentes ou em andamento podem ser alterados.'); }

  // Campos permitidos para atualização
  const camposPermitidos = ['prioridade', 'tecnico_id', 'tipo_id', 'descricao', 'assunto', 'status_chamado'];

  // Filtra só os campos permitidos que vieram no body
  const dadosAtualizar = {};
  for (const campo of camposPermitidos) { if (data[campo] !== undefined) { dadosAtualizar[campo] = data[campo]; } }

  if (Object.keys(dadosAtualizar).length === 0) { throw new Error('Nenhum campo válido informado para atualização'); }

  const linhasAfetadas = await update('chamados', dadosAtualizar, `id = ${id}`);
  return linhasAfetadas;
};
export const criarUsuario = async (dados) => {
  try {
    // hash da senha antes de criar )
    const copy = { ...dados };
    if (copy.senha) {
      const salt = await bcrypt.genSalt(10);
      copy.senha = await bcrypt.hash(copy.senha, salt);
    }
    const id = await create('usuarios', copy);
    return id;
  } catch (err) {
    console.error('Erro ao criar usuário!', err);
    throw err;
  }
};

export const buscarUsuarioPorUsername = async (username) => {
  return await read('usuarios', `username = ${JSON.stringify(username)}`);
};

// retorna array de usernames semelhantes (prefix)
export const buscarUsernamesSemelhantes = async (base) => {
  const sql = `SELECT username FROM usuarios WHERE username LIKE ? LIMIT 50`;
  const rows = await readQuery(sql, [`${base}%`]);
  return rows.map(r => r.username);
};

// gera sugestões a partir de um nome (ex: João Silva -> joaosilva, joaosilva1, joaosilva2), verifica no banco e retorna um array de opções (max 5)
export const gerarSugestoesUsername = async (nome) => {
  if (!nome) return [];
  const normalize = (s) => s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
  const parts = nome.split(/\s+/).filter(Boolean);
  let base = normalize(parts.join(''));
  if (!base) base = `user${Date.now().toString().slice(-4)}`;

  const existentes = await buscarUsernamesSemelhantes(base);
  const setExist = new Set(existentes);

  const suggestions = [];
  if (!setExist.has(base)) suggestions.push(base);
  let i = 1;
  while (suggestions.length < 5) {
    const cand = `${base}${i}`;
    if (!setExist.has(cand)) suggestions.push(cand);
    i++;
    if (i > 2000) break;
  }
  return suggestions;
};

export const criarSetor = async (dados) => {
  try {
    // dados: { titulo, descricao, created_by }
    const id = await create('pool', dados);
    return id;
  } catch (err) {
    console.error('Erro ao criar setor!', err);
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

// adiciona uma prioridade 
export const criarPrioridade = async (dados) => {
  try {
    // dados: { nome, prazo_dias, created_by }
    const id = await create('prioridades', dados);
    return id;
  } catch (err) {
    console.error('Erro ao criar prioridade', err);
    throw err;
  }
};

export const listarPrioridades = async () => {
  try { return await readAll('prioridades'); }
  catch (err) {
    console.error('Erro listar prioridades', err);
    throw err;
  }
};

export const getPrazoPorNome = async (nome) => {
  try {
    const row = await read('prioridades', `nome = ${JSON.stringify(nome)}`);
    return row ? Number(row.prazo_dias) : null;
  } catch (err) {
    console.error('Erro getPrazoPorNome', err);
    throw err;
  }
};

// calcula data limite com base em prioridade
export const calcularDataLimite = async (prioridade) => {
  if (!prioridade) return null;

  // tenta consultar tabela prioridades
  try {
    const prazo = await getPrazoPorNome(prioridade);
    if (prazo !== null && prazo !== undefined) {
      if (Number(prazo) <= 0) return null;
      const dt = new Date();
      dt.setDate(dt.getDate() + Number(prazo));
      return dt;
    }
  } catch (err) { console.warn('Não foi possível consultar tabela prioridades, usando fallback', err); }// ignora e usa fallback

  // fallback
  const mapa = {
    'alta': 1,
    'media': 3,
    'baixa': 7,
    'none': 0
  };
  const dias = mapa[prioridade] ?? 0;
  if (!dias) return null;
  const dt = new Date();
  dt.setDate(dt.getDate() + dias);
  return dt;
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


export async function obterChamadosPorMesAno(prioridade = null) {
  let sql = `SELECT 
            MONTH(criado_em) as mes, 
            COUNT(*) as total 
        FROM chamados
        WHERE YEAR(criado_em) = YEAR(CURDATE())`;

  if (prioridade) {
    sql += ` AND prioridade = ?`;
    return await readQuery(sql + ` GROUP BY MONTH(criado_em)`, [prioridade]);
  }

  sql += ` GROUP BY MONTH(criado_em)`;
  return await readQuery(sql);
}

export async function contarChamadosPorPool({
  setor, modo = 'anual'
} = {}) {
  if (!setor) return [];
  const params = [];

  // Query: join direto com chamados (c) e pool (p) garantindo que só venham
  // linhas onde c.tecnico_id está preenchido e correspondem à pool pedida.
  // Também filtramos usuarios por funcao para garantir que sejam técnicos/auxiliares.
  let sql = `SELECT
      u.id   AS funcionario_id,
      u.nome AS funcionario_nome,
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
// funções utilizadas para TECNICOS E AUXILIARES DE LIMPEZA ------------------------------------------------------------------------------------------------------------------------------------
export const listarChamadosDisponiveis = async (usuario_id) => {
  const sql = ` SELECT c.* FROM chamados c INNER JOIN usuario_servico us ON us.servico_id = c.tipo_id WHERE us.usuario_id = ? AND c.status_chamado = 'pendente' AND c.tecnico_id IS NULL `;
  try { return await readQuery(sql, [usuario_id]); }
  catch (err) { throw err; }
};

export const contarTodosChamados = async () => {
  const sql = `select count(*) from chamados ;`;
  try { return await readQuery(sql); }
  catch (err) { throw err; }
};

export const contarChamadosPendentes = async () => {
  const sql = `select count(*) from chamados where status_chamado = 'pendente'`;
  try { return await readQuery(sql); }
  catch (err) { throw err; }
};

export const contarChamadosEmAndamento = async () => {
  const sql = `select count(*) from chamados where status_chamado = 'em andamento'`;
  try { return await readQuery(sql); }
  catch (err) { throw err; }
};

export const contarChamadosConcluido = async () => {
  const sql = `select count(*) from chamados where status_chamado = 'concluido'`;
  try { return await readQuery(sql); }
  catch (err) { throw err; }
};

// export const pegarChamado = async (chamado_id, usuario_id) => {
//   // Verifica se o chamado existe e ainda não foi atribuído
//   const consulta = `SELECT c.*
//     FROM chamados c
//     INNER JOIN usuario_servico us ON us.servico_id = c.tipo_id
//     WHERE c.id = ? 
//       AND us.usuario_id = ?
//       AND c.status_chamado = 'pendente'
//       AND c.tecnico_id IS NULL
//     LIMIT 1;`;

//   const resultados = await readQuery(consulta, [chamado_id, usuario_id]);
//   const chamado = resultados[0];

//   if (!chamado) {throw new Error('Chamado não encontrado, já atribuído ou não pertence à sua função.');}

//   // Tenta atualizar o chamado para o técnico logado
//   const sqlUpdate = `UPDATE chamados 
//     SET tecnico_id = ?, status_chamado = 'em andamento' 
//     WHERE id = ? AND tecnico_id IS NULL `;
//   const result = await readQuery(sqlUpdate, [usuario_id, chamado_id]);
//   if (result.affectedRows === 0) {throw new Error('Chamado já foi atribuído a outro usuário.');}
//   return result.affectedRows;
// };

// --- modelo: pegarChamado (substituir a função existente) ---
export const pegarChamado = async (chamado_id, usuario_id) => {
  // busca chamado pendente e que pertence à função do usuário (mesma lógica anterior)
  const consulta = `SELECT c.*
    FROM chamados c
    INNER JOIN usuario_servico us ON us.servico_id = c.tipo_id
    WHERE c.id = ? 
      AND us.usuario_id = ?
      AND c.status_chamado = 'pendente'
      AND c.tecnico_id IS NULL
    LIMIT 1;`;
  const resultados = await readQuery(consulta, [chamado_id, usuario_id]);
  const chamado = resultados[0];

  if (!chamado) { throw new Error('Chamado não encontrado, já atribuído ou não pertence à sua função.'); }

  // --- calcula prazo com base na prioridade ---
  const prazoHorasPorPrioridade = {
    'alta': 2,
    'media': 4,
    'baixa': 8,
    'none': 24
  };
  const prioridade = (chamado.prioridade || 'none').toLowerCase();
  const horasPrazo = prazoHorasPorPrioridade[prioridade] ?? 24;

  // cria data_limite (considerando o padrão UTC-3 usado no projeto)
  const agora = new Date();
  agora.setHours(agora.getHours() - 3); // manter padrão do resto do projeto
  const dataLimiteDate = new Date(agora.getTime());
  dataLimiteDate.setHours(dataLimiteDate.getHours() + horasPrazo);

  const data_limite = dataLimiteDate.toISOString().slice(0, 19).replace('T', ' ');

  // tenta atualizar o chamado: atribui tecnico, muda status e grava data_limite
  const sqlUpdate = `UPDATE chamados 
    SET tecnico_id = ?, status_chamado = 'em andamento', data_limite = ?
    WHERE id = ? AND tecnico_id IS NULL`;
  const result = await readQuery(sqlUpdate, [usuario_id, data_limite, chamado_id]);

  if (result.affectedRows === 0) { throw new Error('Chamado já foi atribuído a outro usuário.'); }

  // busca o chamado atualizado (inclui nome do usuário, setor, técnico)
  const sqlChamadoAtualizado = `SELECT c.*, u.nome AS nome_usuario, t.nome AS tecnico_nome, p.titulo AS setor_titulo
    FROM chamados c
    LEFT JOIN usuarios u ON u.id = c.usuario_id
    LEFT JOIN usuarios t ON t.id = c.tecnico_id
    LEFT JOIN pool p ON p.id = c.tipo_id
    WHERE c.id = ? LIMIT 1 `;
  const rows = await readQuery(sqlChamadoAtualizado, [chamado_id]);
  return rows[0];
};


export const listarChamadosPorStatusEFunção = async (usuario_id, status) => {
  let condicaoStatus = '';
  const params = [usuario_id];

  if (status === 'pendente') { condicaoStatus = `AND c.status_chamado = 'pendente' AND c.tecnico_id IS NULL`; }
  else if (status === 'em andamento') {
    condicaoStatus = `AND c.status_chamado = 'em andamento' AND c.tecnico_id = ?`;
    params.push(usuario_id);
  } else if (status === 'concluido') {
    condicaoStatus = `AND c.status_chamado = 'concluido' AND c.tecnico_id = ?`;
    params.push(usuario_id);
  }

  const sql = `SELECT c.*, u.nome AS nome_usuario
    FROM chamados c
    INNER JOIN usuario_servico us ON us.servico_id = c.tipo_id
    INNER JOIN usuarios u ON u.id = c.usuario_id
    WHERE us.usuario_id = ? ${condicaoStatus}
    ORDER BY c.criado_em DESC`;

  try { return await readQuery(sql, params); }
  catch (err) { throw err; }
};

// buscar todos os apontamentos de um chamado
export const listarApontamentosPorChamado = async (chamado_id) => {
  const sql = `SELECT * FROM apontamentos WHERE chamado_id = ? ORDER BY comeco ASC`;
  return await readQuery(sql, [chamado_id]);
};

export const criarApontamento = async ({ chamado_id, descricao, tecnico_id }) => {
  const agora = new Date();
  agora.setHours(agora.getHours() - 3); // Ajusta para UTC-3
  const comeco = agora.toISOString().slice(0, 19).replace('T', ' ');

  return await create('apontamentos', { chamado_id, tecnico_id, descricao, comeco });
};

export const finalizarApontamento = async (apontamento_id) => {
  const agora = new Date();
  agora.setHours(agora.getHours() - 3);

  const fim = agora.toISOString().slice(0, 19).replace('T', ' ');

  //   console.log("Encerrando apontamento:", apontamento_id, "fim:", fim);
  const result = await update('apontamentos', { fim }, `id = ${apontamento_id} AND fim IS NULL`);

  //   console.log("Update result:", result);
  return result;
};

// encerra um chamado: só permite se status = 'em andamento' e tecnico_id = tecnico_id passado
export const finalizarChamado = async (chamado_id, tecnico_id) => {
  // pega o chamado
  const sqlSelect = `SELECT * FROM chamados WHERE id = ? LIMIT 1`;
  const rows = await readQuery(sqlSelect, [chamado_id]);
  const chamado = rows[0];

  if (!chamado) { throw new Error('Chamado não encontrado.'); }

  if (chamado.status_chamado !== 'em andamento') { throw new Error('Só é possível finalizar chamados que estejam em andamento.'); }

  if (chamado.tecnico_id !== tecnico_id) { throw new Error('Você não tem permissão para finalizar este chamado.'); }

  // encerra apontamentos abertos
  const sqlCloseApont = `UPDATE apontamentos
    SET fim = ?
    WHERE chamado_id = ? AND fim IS NULL`;
  const agora = new Date();
  agora.setHours(agora.getHours() - 3); // conforme padrão UTC-3 
  const fim = agora.toISOString().slice(0, 19).replace('T', ' ');
  await readQuery(sqlCloseApont, [fim, chamado_id]);

  // atualiza o chamado para concluído
  const sqlUpdateChamado = `UPDATE chamados SET status_chamado = 'concluido', finalizado_em = ? WHERE id = ? AND tecnico_id = ? AND status_chamado = 'em andamento'`;
  const result = await readQuery(sqlUpdateChamado, [fim, chamado_id, tecnico_id]);

  if (result.affectedRows === 0) { throw new Error('Não foi possível finalizar o chamado (condição não satisfeita).'); }

  // retorna dados para relatório: chamado + apontamentos (inclui apontamentos agora com fim)
  const sqlApont = `SELECT * FROM apontamentos WHERE chamado_id = ? ORDER BY comeco ASC`;
  const apontamentos = await readQuery(sqlApont, [chamado_id]);

  const sqlChamadoAtualizado = `SELECT c.*, u.nome AS nome_usuario FROM chamados c LEFT JOIN usuarios u ON u.id = c.usuario_id WHERE c.id = ? LIMIT 1`;
  const chamadoRows = await readQuery(sqlChamadoAtualizado, [chamado_id]);

  return { chamado: chamadoRows[0], apontamentos };
};

// ----------------------------------- PARA RELATÓRIOS
export const getChamadoById = async (chamado_id) => {
  const sql = `SELECT c.*,
           u.nome AS nome_usuario,
           t.nome AS tecnico_nome,
           p.titulo AS setor_nome
    FROM chamados c
    LEFT JOIN usuarios u ON u.id = c.usuario_id
    LEFT JOIN usuarios t ON t.id = c.tecnico_id
    LEFT JOIN pool p ON p.id = c.tipo_id  -- POOL = tabela de setores/servicos
    WHERE c.id = ?
    LIMIT 1`;
  const rows = await readQuery(sql, [chamado_id]);
  return rows && rows[0] ? rows[0] : null;
};

export const getApontamentosByChamado = async (chamado_id) => {
  // retorna apenas os apontamentos do chamado, ordenados por inicio
  const sql = `SELECT a.*, u.nome AS tecnico_nome
    FROM apontamentos a
    LEFT JOIN usuarios u ON u.id = a.tecnico_id
    WHERE a.chamado_id = ?
    ORDER BY a.comeco ASC `;
  const rows = await readQuery(sql, [chamado_id]);
  return Array.isArray(rows) ? rows : [];
};

export { lerMsg, escreverMensagem };