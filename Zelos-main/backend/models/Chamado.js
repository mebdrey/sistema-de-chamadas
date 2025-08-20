
import puppeteer from 'puppeteer';
import { jsPDF } from 'jspdf';
import { create, readAll, read, readQuery, update, deleteRecord } from '../config/database.js';

export async function criarNotificacao({ usuario_id, tipo, titulo, descricao, chamado_id = null }) {
  const query = `
        INSERT INTO notificacoes (usuario_id, tipo, titulo, descricao, chamado_id)
        VALUES (?, ?, ?, ?, ?)
    `;
  const values = [usuario_id, tipo, titulo, descricao, chamado_id];
  try {
    await readQuery(query, values);
  } catch (err) {
    console.error('Erro ao criar notificação:', err);
    throw err;
  }
}

// busca o nome do usuario pelo seu id
export const buscarChamadoComNomeUsuario = async (chamadoId) => {
  const sql = `
    SELECT c.*, u.nome AS nome_usuario
    FROM chamados c
    JOIN usuarios u ON c.usuario_id = u.id
    WHERE c.id = ?
  `;
  try {
    const result = await readQuery(sql, [chamadoId]);
    return result[0];
  } catch (err) {
    throw err;
  }
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
  const consulta = `SELECT * FROM mensagens WHERE id_chamado = ${idChamado}
     order by data_envio asc`;
  try {
    return await readQuery(consulta);
  }
  catch (err) {
    console.error('Erro ao listar mensagens do chamado especificado!!', err)
  }
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
  try {
    return await readAll('chamados', `usuario_id = ${usuarioId}`);
  } catch (err) {
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
    if (!Number.isInteger(usuarioId)) {
      throw new Error('ID do usuário inválido');
    }
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
  const consulta = ` SELECT * FROM usuarios WHERE funcao = "tecnico" OR funcao = "apoio tecnico" OR funcao = "manutencao" `;
  try {
    return await readQuery(consulta);
  } catch (err) {
    throw err;
  }
};

// Auxiliares de limpeza
export const verAuxiliaresLimpeza = async () => {
  const consulta = 'SELECT * FROM usuarios WHERE funcao = "auxiliar de limpeza"';
  try {
    return await readQuery(consulta);
  } catch (err) {
    throw err;
  }
};

// Usuários comuns (clientes)
export const verClientes = async () => {
  const consulta = 'SELECT * FROM usuarios WHERE funcao = "usuario"';
  try {
    return await readQuery(consulta);
  } catch (err) {
    throw err;
  }
};

export const verChamados = async () => {
  try {
    return await readAll('chamados')
  } catch (error) {
    console.error('Erro ao listar chamados:', error);
    throw error;
  }
}

export const contarChamadosPorStatus = async (modo) => {
  let sql = `
    SELECT status_chamado, COUNT(*) AS qtd
    FROM chamados
    WHERE YEAR(criado_em) = YEAR(NOW())
  `;

  if (modo === 'mensal') {
    sql += ` AND MONTH(criado_em) = MONTH(NOW())`;
  }

  sql += ` GROUP BY status_chamado`;

  try {
    return await readQuery(sql);
  } catch (err) {
    throw err;
  }
};

// relatorio 1 - chamados p mes
export const gerarRelatorioChamados = async ({ options, series, prioridade }) => {
  try {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    const html = `
      <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          h1 { font-size: 20px; margin-bottom: 10px; }
          p { font-size: 12px; margin: 4px 0; }
        </style>
      </head>
      <body>
        <h1>Relatório de Chamados por Mês</h1>
        <p>Data de geração: ${new Date().toLocaleString('pt-BR')}</p>
        <p>Prioridade selecionada: ${prioridade || 'Todas'}</p>
        <div id="chart" style="width: 800px; height: 400px;"></div>
        <script>
          const options = ${JSON.stringify({ ...options, series })};
          const chart = new ApexCharts(document.querySelector("#chart"), options);
          chart.render();
        </script>
      </body>
      </html>
    `;

    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    // Espera até o gráfico estar presente no DOM
    await page.waitForSelector('#chart svg', { timeout: 10000 });

    // Captura screenshot do gráfico
    const chartElement = await page.$('#chart');
    const chartImage = await chartElement.screenshot({ type: 'png' });

    await browser.close();

    // Gera PDF
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Relatório de Chamados por Mês', 10, 20);
    doc.setFontSize(10);
    doc.text(`Data de geração: ${new Date().toLocaleString('pt-BR')}`, 10, 28);
    doc.text(`Prioridade selecionada: ${prioridade || 'Todas'}`, 10, 34);
    doc.addImage(chartImage, 'PNG', 10, 40, 190, 100);

    return Buffer.from(doc.output('arraybuffer'));
  } catch (err) {
    console.error('Erro ao gerar relatorio de chamados:', err);
    throw err;
  }
};


// relatorio 2 - chamados p tipo
export const obterChamadosPorTipo = async (filtros) => {
  const { inicio, fim, status_chamado, tecnico_id } = filtros;

  const condicoes = [];
  const params = [];

  if (inicio && fim) {
    condicoes.push("c.criado_em BETWEEN ? AND ?");
    params.push(inicio, fim);
  }
  if (status_chamado) {
    condicoes.push("c.status_chamado = ?");
    params.push(status_chamado);
  }
  if (tecnico_id) {
    condicoes.push("c.tecnico_id = ?");
    params.push(tecnico_id);
  }

  const where = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";

  const sql = `
    SELECT p.titulo AS tipo_chamado, COUNT(*) AS total
    FROM chamados c
    JOIN pool p ON c.tipo_id = p.id
    ${where}
    GROUP BY p.titulo
  `;
  return await readQuery(sql, params);
};

// relatorio 3 - atividades dos tecnicos
export const obterAtividadesTecnicos = async (filtros) => {
  const { inicio, fim, status_chamado, tipo_id } = filtros;

  const condicoes = ["c.tecnico_id IS NOT NULL"];
  const params = [];

  if (inicio && fim) {
    condicoes.push("c.criado_em BETWEEN ? AND ?");
    params.push(inicio, fim);
  }
  if (status_chamado) {
    condicoes.push("c.status_chamado = ?");
    params.push(status_chamado);
  }
  if (tipo_id) {
    condicoes.push("c.tipo_id = ?");
    params.push(tipo_id);
  }

  const where = `WHERE ${condicoes.join(" AND ")}`;

  const sql = `
    SELECT u.nome AS tecnico,
           COUNT(*) AS total_chamados,
           ROUND(AVG(TIMESTAMPDIFF(HOUR, c.criado_em, c.atualizado_em)), 1) AS tempo_medio_resolucao_horas,
           MAX(c.status_chamado) AS status_mais_recente
    FROM chamados c
    JOIN usuarios u ON c.tecnico_id = u.id
    ${where}
    GROUP BY u.id
  `;
  return await readQuery(sql, params);
};

export async function obterChamadosPorMesAno(prioridade = null) {
  let sql = `
        SELECT 
            MONTH(criado_em) as mes, 
            COUNT(*) as total 
        FROM chamados
        WHERE YEAR(criado_em) = YEAR(CURDATE())
    `;

  if (prioridade) {
    sql += ` AND prioridade = ?`;
    return await readQuery(sql + ` GROUP BY MONTH(criado_em)`, [prioridade]);
  }

  sql += ` GROUP BY MONTH(criado_em)`;
  return await readQuery(sql);
}

// funções utilizadas para TECNICOS E AUXILIARES DE LIMPEZA ------------------------------------------------------------------------------------------------------------------------------------
export const listarChamadosDisponiveis = async (usuario_id) => {
  const sql = ` SELECT c.* FROM chamados c INNER JOIN usuario_servico us ON us.servico_id = c.tipo_id WHERE us.usuario_id = ? AND c.status_chamado = 'pendente' AND c.tecnico_id IS NULL `;
  try {
    return await readQuery(sql, [usuario_id]);
  } catch (err) {
    throw err;
  }
};

export const contarTodosChamados = async () => {
  const sql = `select count(*) from chamados ;`;
  try {
    return await readQuery(sql);
  }
  catch (err) {
    throw err;
  }
};

export const contarChamadosPendentes = async () => {
  const sql = `select count(*) from chamados where status_chamado = 'pendente'`;
  try {
    return await readQuery(sql);
  }
  catch (err) {
    throw err;
  }
};

export const contarChamadosEmAndamento = async () => {
  const sql = `select count(*) from chamados where status_chamado = 'em andamento'`;
  try {
    return await readQuery(sql);
  }
  catch (err) {
    throw err;
  }
};

export const contarChamadosConcluido = async () => {
  const sql = `select count(*) from chamados where status_chamado = 'concluido'`;
  try {
    return await readQuery(sql);
  }
  catch (err) {
    throw err;
  }
};

export const pegarChamado = async (chamado_id, usuario_id) => {
  // Verifica se o chamado existe e ainda não foi atribuído
  const consulta = `
    SELECT c.*
    FROM chamados c
    INNER JOIN usuario_servico us ON us.servico_id = c.tipo_id
    WHERE c.id = ? 
      AND us.usuario_id = ?
      AND c.status_chamado = 'pendente'
      AND c.tecnico_id IS NULL
    LIMIT 1;
  `;

  const resultados = await readQuery(consulta, [chamado_id, usuario_id]);
  const chamado = resultados[0];

  if (!chamado) {
    throw new Error('Chamado não encontrado, já atribuído ou não pertence à sua função.');
  }

  // Tenta atualizar o chamado para o técnico logado
  const sqlUpdate = `
    UPDATE chamados 
    SET tecnico_id = ?, status_chamado = 'em andamento' 
    WHERE id = ? AND tecnico_id IS NULL
  `;

  const result = await readQuery(sqlUpdate, [usuario_id, chamado_id]);

  if (result.affectedRows === 0) {
    throw new Error('Chamado já foi atribuído a outro usuário.');
  }

  return result.affectedRows;
};


export const listarChamadosPorStatusEFunção = async (usuario_id, status) => {
  let condicaoStatus = '';
  const params = [usuario_id];

  if (status === 'pendente') {
    condicaoStatus = `AND c.status_chamado = 'pendente' AND c.tecnico_id IS NULL`;
  } else if (status === 'em andamento') {
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
    ORDER BY c.criado_em DESC
  `;

  try {
    return await readQuery(sql, params);
  } catch (err) {
    throw err;
  }
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

  return await create('apontamentos', {
    chamado_id,
    tecnico_id,
    descricao,
    comeco
  });
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



export { lerMsg, escreverMensagem };