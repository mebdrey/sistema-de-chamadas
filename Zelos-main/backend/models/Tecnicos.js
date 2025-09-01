import { create, readAll, read, readQuery, update, deleteRecord } from '../config/database.js';
import { criarNotificacao } from './Notificacoes.js';

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

export const getApontamentoById = async (id) => {
  const sql = `SELECT a.*, u.nome AS tecnico_nome
    FROM apontamentos a
    LEFT JOIN usuarios u ON a.tecnico_id = u.id
    WHERE a.id = ?
    LIMIT 1`;
  const rows = await readQuery(sql, [id]);
  return rows && rows[0] ? rows[0] : null;
};

export const pegarChamado = async (chamado_id, usuario_id) => {
  // busca chamado ainda não atribuído, com prioridade
  const consulta = `SELECT c.*, p.horas_limite, p.nome AS prioridade_nome
    FROM chamados c
    INNER JOIN usuario_servico us ON us.servico_id = c.tipo_id
    LEFT JOIN prioridades p ON p.id = c.prioridade_id
    WHERE c.id = ? 
      AND us.usuario_id = ?
      AND c.status_chamado = 'pendente'
      AND c.tecnico_id IS NULL
    LIMIT 1;`;

  const resultados = await readQuery(consulta, [chamado_id, usuario_id]);
  const chamado = resultados[0];

  if (!chamado) {
    throw new Error("Chamado não encontrado, já atribuído ou não pertence à sua função.");
  }

  // pega o prazo da prioridade (se não tiver, usa um default)
  const horasPrazo = chamado.horas_limite ?? 24;

  // cria data_limite considerando UTC-3 do teu sistema
  const agora = new Date();
  agora.setHours(agora.getHours() - 3); 
  const dataLimiteDate = new Date(agora.getTime());
  dataLimiteDate.setHours(dataLimiteDate.getHours() + horasPrazo);

  const data_limite = dataLimiteDate.toISOString().slice(0, 19).replace("T", " ");

  // atribui técnico, muda status e grava data_limite
  const sqlUpdate = `UPDATE chamados 
    SET tecnico_id = ?, status_chamado = 'em andamento', data_limite = ?
    WHERE id = ? AND tecnico_id IS NULL`;
  const result = await readQuery(sqlUpdate, [usuario_id, data_limite, chamado_id]);

  if (result.affectedRows === 0) {
    throw new Error("Chamado já foi atribuído a outro usuário.");
  }

  // busca o chamado atualizado com nomes
  const sqlChamadoAtualizado = `SELECT c.*, 
        u.nome AS nome_usuario, 
        t.nome AS tecnico_nome, 
        p.titulo AS setor_titulo,
        pr.nome AS prioridade_nome,
        pr.horas_limite
    FROM chamados c
    LEFT JOIN usuarios u ON u.id = c.usuario_id
    LEFT JOIN usuarios t ON t.id = c.tecnico_id
    LEFT JOIN pool p ON p.id = c.tipo_id
    LEFT JOIN prioridades pr ON pr.id = c.prioridade_id
    WHERE c.id = ? LIMIT 1`;
  const rows = await readQuery(sqlChamadoAtualizado, [chamado_id]);
  const chamadoAtualizado = rows[0];

  // --- cria notificação para o autor do chamado ---
  await criarNotificacao({
    usuario_id: chamadoAtualizado.usuario_id, // autor do chamado
    tipo: "tecnico_atribuido",
    titulo: "Chamado atribuído",
    descricao: `Seu chamado "${chamadoAtualizado.assunto}" foi atribuído ao técnico ${chamadoAtualizado.tecnico_nome}.`,
    chamado_id: chamadoAtualizado.id,
  });

  return chamadoAtualizado;
};

export const listarChamadosPorStatusEFunção = async (usuario_id, status) => {
  let condicaoStatus = '';
  const params = [usuario_id];

  if (status === 'pendente') { condicaoStatus = `AND c.status_chamado = 'pendente' AND c.tecnico_id IS NULL`;}
  else if (status === 'em andamento') {
    condicaoStatus = `AND c.status_chamado = 'em andamento' AND c.tecnico_id = ?`;
    params.push(usuario_id);
  } else if (status === 'concluido') {
    condicaoStatus = `AND c.status_chamado = 'concluido' AND c.tecnico_id = ?`;
    params.push(usuario_id);
  }

  const sql = `
    SELECT c.*, u.nome AS nome_usuario
    FROM chamados c
    INNER JOIN usuario_servico us ON us.servico_id = c.tipo_id
    INNER JOIN usuarios u ON u.id = c.usuario_id
    WHERE us.usuario_id = ? ${condicaoStatus}
    ORDER BY c.criado_em DESC`;

  try {return await readQuery(sql, params);}
  catch (err) {throw err;}
};

export async function verificarReminders() {
  // 1) Chamados com prazo em até 5h
  const proximos = await readQuery(`
    SELECT * FROM chamados
    WHERE data_limite IS NOT NULL
      AND status_chamado <> 'concluido'
      AND reminder_5h_sent = FALSE
      AND TIMESTAMPDIFF(HOUR, NOW(), data_limite) BETWEEN 0 AND 5
  `);

  for (const c of proximos) {
    await criarNotificacao({
      usuario_id: c.usuario_id,
      tipo: 'urgencia_chamado',
      titulo: `Prazo próximo para chamado #${c.id}`,
      descricao: `O prazo do chamado (${c.assunto}) vence em ${c.data_limite}.`,
      chamado_id: c.id
    });

    if (c.tecnico_id) {
      await criarNotificacao({
        usuario_id: c.tecnico_id,
        tipo: 'urgencia_chamado',
        titulo: `Prazo próximo para chamado #${c.id}`,
        descricao: `O prazo do chamado (${c.assunto}) vence em ${c.data_limite}.`,
        chamado_id: c.id
      });
    }

    await readQuery(`UPDATE chamados SET reminder_5h_sent = TRUE WHERE id = ?`, [c.id]);
  }

  // 2) Chamados atrasados
  const atrasados = await readQuery(`
    SELECT * FROM chamados
    WHERE data_limite IS NOT NULL
      AND status_chamado <> 'concluido'
      AND reminder_overdue_sent = FALSE
      AND data_limite < NOW()
  `);

  for (const c of atrasados) {
    await criarNotificacao({
      usuario_id: c.usuario_id,
      tipo: 'chamado_atrasado',
      titulo: `Chamado #${c.id} está atrasado`,
      descricao: `O prazo do chamado (${c.assunto}) expirou em ${c.data_limite}.`,
      chamado_id: c.id
    });

    if (c.tecnico_id) {
      await criarNotificacao({
        usuario_id: c.tecnico_id,
        tipo: 'chamado_atrasado',
        titulo: `Chamado #${c.id} está atrasado`,
        descricao: `O prazo do chamado (${c.assunto}) expirou em ${c.data_limite}.`,
        chamado_id: c.id
      });
    }

    await readQuery(`UPDATE chamados SET reminder_overdue_sent = TRUE WHERE id = ?`, [c.id]);
  }
}

export const criarApontamento = async ({ chamado_id, descricao, tecnico_id }) => {
  const agora = new Date();
  agora.setHours(agora.getHours() - 3); // Ajusta para UTC-3
  const comeco = agora.toISOString().slice(0, 19).replace('T', ' ');

  // return await create('apontamentos', { chamado_id, tecnico_id, descricao, comeco });
  const insertId = await create('apontamentos', { chamado_id, tecnico_id, descricao, comeco });
  return insertId;
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

  if (Number(chamado.tecnico_id) !== Number(tecnico_id)) {
  throw new Error('Você não tem permissão para finalizar este chamado.');
}

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
