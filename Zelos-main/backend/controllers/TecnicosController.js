import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify/sync';
import { listarChamadosDisponiveis, contarTodosChamados, contarChamadosPendentes, contarChamadosEmAndamento, contarChamadosConcluido, getApontamentoById, pegarChamado, listarChamadosPorStatusEFunção, verificarReminders, criarApontamento, finalizarApontamento, finalizarChamado, getApontamentosByChamado } from '../models/Tecnicos.js'
import { criarNotificacao } from '../models/Notificacoes.js';
import { getChamadoById } from '../models/Tecnicos.js'

// usado para TECNICOS E AUXILIARES ------------------------------------------------------------------------------------------------------------------------------------------------------------
export const listarChamadosDisponiveisController = async (req, res) => {
    try {
        const usuario_id = req.user?.id;
        const chamados = await listarChamadosDisponiveis(usuario_id);
        res.json(chamados);
    } catch (error) { res.status(500).json({ erro: 'Erro ao listar chamados disponíveis.' }); }
};

// export const pegarChamadoController = async (req, res) => {
//     const usuario_id = req.user?.id;
//     const { chamado_id } = req.body;

//     if (!chamado_id) { return res.status(400).json({ erro: 'ID do chamado é obrigatório.' }); }

//     try {
//         const chamadoAtualizado = await pegarChamado(chamado_id, usuario_id);

//         // devolve mensagem e chamado atualizado (contendo data_limite)
//         res.status(200).json({ mensagem: 'Chamado atribuído com sucesso.', chamado: chamadoAtualizado });
//     } catch (error) { res.status(400).json({ erro: error.message }); }
// };

export const pegarChamadoController = async (req, res) => {
    const usuario_id = req.user?.id;
    const { chamado_id } = req.body;

    if (!chamado_id) {
        return res.status(400).json({ erro: 'ID do chamado é obrigatório.' });
    }

    try {
        // se sua lógica exige "pegar" antes de devolver (atribuir tecnico), mantenha essa chamada:
        if (typeof pegarChamado === 'function') {
            await pegarChamado(chamado_id, usuario_id); // executa ação que seu app já fazia
        }

        // depois busca o chamado já atualizado usando getChamadoById (que garante data_limite)
        const chamadoAtualizado = await getChamadoById(chamado_id);
        if (!chamadoAtualizado) return res.status(404).json({ erro: 'Chamado não encontrado.' });

        return res.status(200).json({
            mensagem: 'Chamado atribuído com sucesso.',
            chamado: chamadoAtualizado
        });
    } catch (error) {
        console.error('pegarChamadoController erro:', error && error.stack ? error.stack : error);
        return res.status(400).json({ erro: error.message || 'Erro ao buscar chamado.' });
    }
};

export const contarChamadosController = async (req, res) => {
    try {
        const total = await contarTodosChamados();
        res.json(total);
    } catch (error) {
        console.error('Erro ao contar chamados!! ', error);
        res.status(500).json({ erro: 'erro ao contar chamados' });
    }
};

export const chamadosPendentesController = async (req, res) => {
    try {
        const total = await contarChamadosPendentes();
        res.json(total);
    } catch (error) {
        console.error('erro ao contar chamados pendentes: ', error);
        res.status(500).json({ erro: 'erro ao contar chamados pendentes!' });
    }
};

export const chamadosEmAndamentoController = async (req, res) => {
    try {
        const total = await contarChamadosEmAndamento();
        res.json(total);
    } catch (error) {
        console.error('erro ao contar chamados em andamento: ', error);
        res.status(500).json({ erro: 'erro ao contar chamados em andamento!' });
    }
};

export const chamadosConcluidoController = async (req, res) => {
    try {
        const total = await contarChamadosConcluido();
        res.json(total);
    } catch (error) {
        console.error('erro ao contar chamados concluídos: ', error);
        res.status(500).json({ erro: 'erro ao contar chamados concluídos!' });
    }
};

export const listarChamadosFuncionarioController = async (req, res) => {
    const usuario_id = req.user?.id;
    const statusParam = req.query.status?.replace('-', ' '); // transforma "em-andamento" em "em andamento"
    console.log("Status recebido:", statusParam);

    if (!usuario_id || !statusParam) { return res.status(400).json({ erro: 'Parâmetros ausentes.' }); }

    try {
        // dispara reminders antes de listar
        await verificarReminders();
        const chamados = await listarChamadosPorStatusEFunção(usuario_id, statusParam);
        console.log("Chamados encontrados:", chamados);
        res.json(chamados);
    } catch (error) { res.status(500).json({ erro: 'Erro ao buscar chamados por status.' }); }
};

const usuarioPodeVerApontamentos = (user, chamado) => {
    if (!user) return false;
    if (user.role === 'admin') return true; // acesso irrestrito ao adm
    if (chamado.usuario_id === user.id) return true;   // dono do chamado
    if (chamado.tecnico_id === user.id) return true;   // técnico atribuído
    return false;
};

export const listarApontamentosController = async (req, res) => {
    try {
        const chamado_id = req.params.chamado_id || req.body.chamado_id;
        if (!chamado_id) return res.status(400).json({ erro: 'chamado_id é obrigatório' });

        // pega o chamado para validar permissões
        const chamado = await getChamadoById(chamado_id);
        if (!chamado) return res.status(404).json({ erro: 'Chamado não encontrado' });

        // valida permissão: dono do chamado, técnico atribuído ou admin
        const user = req.user;
        if (!usuarioPodeVerApontamentos(user, chamado)) { return res.status(403).json({ erro: 'Acesso negado' }); }

        // pega apontamentos com join (nome do técnico)
        const apontamentos = await getApontamentosByChamado(chamado_id);
        return res.json(apontamentos);
    } catch (error) {
        console.error('Erro listarApontamentosController:', error);
        return res.status(500).json({ erro: 'Erro ao listar apontamentos' });
    }
};

export const criarApontamentoController = async (req, res) => {
    try {
        // técnico cria apontamento (já tinha lógica para técnicos)
        const { chamado_id, descricao } = req.body;
        const tecnico_id = req.user?.id;

        if (!descricao || !chamado_id || !tecnico_id) {
            return res.status(400).json({ erro: 'Descrição, chamado_id e tecnico_id são obrigatórios' });
        }

        // valida que req.user realmente é técnico atribuído OU tem permissão
        const chamado = await getChamadoById(chamado_id);
        if (!chamado) return res.status(404).json({ erro: 'Chamado não encontrado' });

        // apenas o técnico atribuído (ou admin) pode criar apontamento neste chamado
        if (!(chamado.tecnico_id === tecnico_id || req.user.role === 'admin')) {
            return res.status(403).json({ erro: 'Você não pode criar apontamentos neste chamado' });
        }

        // cria e pega o insertId
        const insertId = await criarApontamento({ chamado_id, descricao, tecnico_id });

        // busca o registro recém-criado completo (com nome do técnico)
        const novoApont = await getApontamentoById(insertId);
        // Notificação para o usuário dono do chamado
        await criarNotificacao({
            usuario_id: chamado.usuario_id,
            tipo: 'resposta_tecnico',
            titulo: 'Atualização no chamado',
            descricao: `O técnico adicionou um novo apontamento: "${descricao}".`,
            chamado_id
        });

        // retorna o apontamento completo ao cliente (front do usuário e do técnico)
        return res.status(201).json(novoApont);
    } catch (error) {
        console.error('Erro criarApontamentoController:', error);
        return res.status(500).json({ erro: 'Erro interno ao criar apontamento' });
    }
};

export const finalizarApontamentoController = async (req, res) => {
    try {
        const { apontamento_id } = req.body;
        await finalizarApontamento(apontamento_id);
        res.json({ mensagem: 'Apontamento encerrado com sucesso' });
    } catch (error) { res.status(500).json({ erro: 'Erro ao finalizar apontamento' }); }
};

export const finalizarChamadoController = async (req, res) => {
    try {
        const tecnico_id = req.user?.id;
        const { chamado_id } = req.body;

        if (!chamado_id) { return res.status(400).json({ erro: 'ID do chamado é obrigatório.' }); }

        const dadosRelatorio = await finalizarChamado(chamado_id, tecnico_id);

        // pega usuario_id corretamente do objeto retornado
        const usuarioId = dadosRelatorio?.chamado?.usuario_id ?? null;

        if (usuarioId !== null) {
            await criarNotificacao({
                usuario_id: usuarioId,
                tipo: 'status_atualizado',
                titulo: 'Chamado concluído',
                descricao: `Seu chamado #${chamado_id} foi concluído pelo técnico.`,
                chamado_id
            });
        } else { console.warn(`[finalizarChamadoController] não encontrou usuario_id para notificar (chamado ${chamado_id})`); }

        return res.status(200).json({ mensagem: 'Chamado finalizado com sucesso.', relatorio: dadosRelatorio });
    } catch (err) {
        console.error('Erro finalizarChamadoController:', err);
        const msg = err.message || 'Erro ao finalizar chamado';
        return res.status(400).json({ erro: msg });
    }
};
/* ---------- utilitários de formatação ---------- */
// Retorna target em MINUTOS, priorizando valores vindos do chamado/prioridade
const getSlaTargetMinutes = (chamado) => {
    // se campo explícito em minutos/hours estiver presente, usa
    if (chamado.sla_minutos && Number(chamado.sla_minutos) > 0) return Number(chamado.sla_minutos);
    if (chamado.prioridade_horas_limite && Number(chamado.prioridade_horas_limite) > 0) return Number(chamado.prioridade_horas_limite) * 60;

    // fallback por nome da prioridade (caso não tenha prioridade_horas_limite)
    const pr = String(chamado.prioridade_nome || chamado.prioridade || '').toLowerCase();
    if (pr === 'alta') return 8 * 60;
    if (pr === 'media' || pr === 'média') return 24 * 60;
    if (pr === 'baixa') return 72 * 60;
    return 24 * 60; // default 24h
};

// Calcula minutos úteis entre duas datas (considera workdays e janela de trabalho)
// startISO, endISO podem ser strings ISO ou Date; opções: workdays (0=domingo..6=sábado), startHour, endHour
const workingMinutesBetween = (startISO, endISO, { workdays = [1, 2, 3, 4, 5], startHour = 8, endHour = 18 } = {}) => {
    if (!startISO || !endISO) return 0;
    const start = new Date(startISO);
    const end = new Date(endISO);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    if (end <= start) return 0;

    // função para pegar início do dia
    const startOfDay = (d) => {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        return x;
    };

    let totalMinutes = 0;

    // iterar dia a dia
    let cursor = startOfDay(start);

    while (cursor <= end) {
        const day = cursor.getDay(); // 0..6
        // se dia não é dia útil, pula
        if (workdays.includes(day)) {
            // janela de trabalho desse dia
            const workStart = new Date(cursor);
            workStart.setHours(startHour, 0, 0, 0);
            const workEnd = new Date(cursor);
            workEnd.setHours(endHour, 0, 0, 0);

            // segmento efetivo neste dia = interseção [workStart, workEnd] ∩ [start, end]
            const segStart = start > workStart ? start : workStart;
            const segEnd = end < workEnd ? end : workEnd;

            if (segEnd > segStart) {
                totalMinutes += Math.round((segEnd - segStart) / 60000);
            }
        }

        // avança para o próximo dia 00:00
        cursor.setDate(cursor.getDate() + 1);
        cursor.setHours(0, 0, 0, 0);
        // prevenir loop infinito (safety)
        if (totalMinutes > 100000000) break;
    }

    return totalMinutes;
};

// util para formatar minutos em "XhYmin" (como seu formatDurationBetween)
const formatMinutesToHuman = (minutes) => {
    if (minutes === null || minutes === undefined) return '';
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    if (h > 0) return `${h}h${m}min`;
    return `${m}min`;
};

const formatDateTime = (input) => {
    if (!input) return '';
    const d = new Date(input);
    const date = d.toLocaleDateString('pt-BR');
    const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${date} – ${time}`;
};
const formatDurationBetween = (start, end) => {
    if (!start || !end) return '';
    const s = new Date(start);
    const e = new Date(end);
    let diff = Math.max(0, e - s);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diff / (1000 * 60));
    if (hours > 0) return `${hours}h${minutes}min`;
    return `${minutes}min`;
};
const safeText = (v) => (v === null || v === undefined) ? '' : String(v);
const primeiraLetraMaiuscula = (s) => { if (!s) return ''; return s.charAt(0).toUpperCase() + s.slice(1); };
const chamadaPrioridade = (p) => { if (!p) return ''; return p === 'alta' ? 'Alta' : p === 'media' ? 'Média' : p === 'baixa' ? 'Baixa' : p; };

function formatIdHash(chamado, opts = { zeros: 0 }) {
    // retorna "#50" ou com zero-pad se opts.zeros > 0 -> "#00050"
    const id = String(chamado.id);
    if (opts.zeros && Number(opts.zeros) > 0) { return `#${id.padStart(opts.zeros, '0')}`; }
    return `#${id}`;
}

export const gerarRelatorioChamadoController = async (req, res) => {
    try {
        const chamado_id = req.params.chamado_id;
        const formato = (req.query.format || 'pdf').toLowerCase();

        // Pega do model (sem queries aqui)
        const chamado = await getChamadoById(chamado_id);
        if (!chamado) return res.status(404).json({ erro: 'Chamado não encontrado' });

        // APENAS apontamentos no histórico
        const apontamentos = await getApontamentosByChamado(chamado_id);

        // Campos básicos para relatório (cria rel primeiro)
        const idExterno = formatIdHash(chamado, { zeros: 0 }); // coloque zeros:4 para "#0050" etc.
        const rel = {
            id: chamado.id,
            idExterno,
            assunto: safeText(chamado.assunto),
            descricao_inicial: safeText(chamado.descricao),
            usuario_nome: safeText(chamado.nome_usuario),
            prioridade: chamadaPrioridade(chamado.prioridade_nome || chamado.prioridade),
            status: primeiraLetraMaiuscula(chamado.status_chamado || chamado.status),
            criado_em: chamado.criado_em,
            finalizado_em: chamado.finalizado_em,
            tecnico_responsavel: safeText(chamado.tecnico_nome),
            setor_nome: safeText(chamado.setor_nome), // nome do setor vindo do model
            anexos: chamado.imagem ? [chamado.imagem] : []
        };

        // ---------- CÁLCULO DO SLA ----------
        // target em minutos (usa prioridade_horas_limite se exist)
        const targetMinutes = getSlaTargetMinutes(chamado);

        // fim para cálculo: se finalizado_em vazio, calcula até agora
        const endForCalc = chamado.finalizado_em ? chamado.finalizado_em : new Date().toISOString();

        // minutos úteis entre criado_em e fim (seg–sex 08:00-18:00 por padrão)
        const elapsedMinutes = workingMinutesBetween(chamado.criado_em, endForCalc, {
            workdays: [1, 2, 3, 4, 5],
            startHour: 8,
            endHour: 18
        });

        const slaCumprido = (elapsedMinutes <= targetMinutes);
        const remainingMinutes = Math.max(0, targetMinutes - elapsedMinutes);

        // injeta no objeto rel e no objeto chamado (para reuso)
        rel.sla_target_minutes = targetMinutes;
        rel.sla_target_human = formatMinutesToHuman(targetMinutes);
        rel.sla_elapsed_minutes = elapsedMinutes;
        rel.sla_elapsed_human = formatMinutesToHuman(elapsedMinutes);
        rel.sla_cumprido = slaCumprido;
        rel.sla_remaining_minutes = remainingMinutes;
        rel.sla_remaining_human = formatMinutesToHuman(remainingMinutes);

        chamado.sla_cumprido = slaCumprido;
        chamado.sla_elapsed_minutes = elapsedMinutes;
        chamado.sla_target_minutes = targetMinutes;
        // ---------- fim SLA ----------

        // ---------- CSV ----------
        if (formato === 'csv') {
            const rows = [];

            rows.push(['Relatório de Chamado']);
            rows.push(['ID do Chamado', rel.idExterno]);
            rows.push(['Status', rel.status]);
            rows.push(['Prioridade', rel.prioridade]);
            rows.push(['Data/Hora de Abertura', formatDateTime(rel.criado_em)]);
            rows.push(['Data/Hora de Conclusão', formatDateTime(rel.finalizado_em)]);
            rows.push([]);
            rows.push(['Solicitante', rel.usuario_nome]);
            rows.push(['Assunto', rel.assunto]);
            rows.push(['Descrição', rel.descricao_inicial]);
            rows.push(['Setor', rel.setor_nome]);
            rows.push(['Técnico Atribuido', rel.tecnico_responsavel]);
            rows.push(['Data/Hora da Atribuição', formatDateTime(chamado.atribuido_em || chamado.criado_em)]);
            rows.push([]);

            rows.push(['Histórico de Atendimento']);
            const apontLines = (apontamentos && apontamentos.length)
                ? apontamentos.map((a, i) => `${i + 1}. ${formatDateTime(a.comeco)} — ${safeText(a.tecnico_nome || a.tecnico_id)}: ${safeText(a.descricao)}`)
                : [];
            if (apontLines.length) rows.push(['Apontamentos', apontLines.join('\n')]);
            else rows.push(['Apontamentos', 'Nenhum apontamento encontrado.']);

            rows.push([]);

            // Métricas com SLA
            rows.push(['Métricas']);
            rows.push(['Tempo total de atendimento (úteis)', rel.sla_elapsed_human || '-']);
            rows.push(['SLA (meta)', rel.sla_target_human || '-']);
            rows.push(['Resultado do SLA', (typeof rel.sla_cumprido !== 'undefined') ? (rel.sla_cumprido ? 'Cumprido' : 'Não cumprido') : 'Não calculado']);
            if (!rel.sla_cumprido) {
                rows.push(['Atraso (úteis)', formatMinutesToHuman(Math.max(0, rel.sla_elapsed_minutes - rel.sla_target_minutes))]);
            } else {
                rows.push(['Tempo restante (úteis)', rel.sla_remaining_human]);
            }

            // monta CSV; stringify (sync) deve estar importado no topo do arquivo
            const csv = stringify(rows, { delimiter: ';' });

            res.setHeader('Content-Disposition', `attachment; filename=relatorio_chamado_${rel.id}.csv`);
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            return res.send('\uFEFF' + csv);
        }

        // ---------- PDF ----------
        res.setHeader('Content-Disposition', `attachment; filename=relatorio_chamado_${rel.id}.pdf`);
        res.setHeader('Content-Type', 'application/pdf');

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        doc.pipe(res);

        // Título
        doc.fontSize(18).text('Relatório de Chamado', { align: 'center' });
        doc.moveDown(1);

        // Cabeçalho resumo
        doc.fontSize(11);
        doc.text(`ID do Chamado: ${rel.idExterno}`);
        doc.text(`Status: ${rel.status}`);
        doc.text(`Prioridade: ${rel.prioridade}`);
        doc.text(`Data/Hora de Abertura: ${formatDateTime(rel.criado_em)}`);
        doc.text(`Data/Hora de Conclusão: ${formatDateTime(rel.finalizado_em)}`);
        // doc.moveDown(0.8);
 doc.moveDown(1); // espaço antes dos anexos
        // Solicitante
        doc.fontSize(12).text('Solicitante', { underline: true });
        doc.moveDown(0.2);
        doc.fontSize(11).text(`Nome: ${rel.usuario_nome}`);
        // doc.moveDown(0.6);

         doc.moveDown(1); // espaço antes dos anexos
        // Descrição inicial
        doc.fontSize(12).text('Descrição Inicial', { underline: true });
        doc.moveDown(0.2);
        doc.fontSize(11).text(`Assunto: ${rel.assunto}`);
        doc.moveDown(0.1);
        doc.fontSize(11).text(`Descrição: ${rel.descricao_inicial}`);
        doc.moveDown(0.1);
        doc.fontSize(11).text(`Setor: ${rel.setor_nome}`);
        // doc.moveDown(0.6);

         doc.moveDown(1); // espaço antes dos anexos
        // Atribuição
        doc.fontSize(12).text('Atribuição', { underline: true });
        doc.moveDown(0.2);
        doc.fontSize(11).text(`Técnico Responsável: ${rel.tecnico_responsavel}`);
        doc.fontSize(11).text(`Data/Hora da Atribuição: ${formatDateTime(chamado.atribuido_em || chamado.criado_em)}`);
        // doc.moveDown(0.6);
        doc.moveDown(1); // espaço antes dos anexos
        // Histórico — apenas apontamentos
        doc.fontSize(12).text('Histórico de Atendimento', { underline: true });
        doc.moveDown(0.4);

        // const startX = doc.x;
        // const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        // const col1W = 120;
        // const col2W = 140;
        // const col3W = pageWidth - col1W - col2W;
        // const leftX = startX;
        // const leftWidth = col1W + col2W;
        // const rightX = startX + leftWidth;
        // const rightWidth = col3W;

        // doc.font('Helvetica-Bold').fontSize(11).fillColor('black');
        // doc.text('Apontamentos', leftX, doc.y, { width: leftWidth });
        // doc.text('Métricas', rightX, doc.y, { width: rightWidth });
        // doc.moveDown(0.3);

        // let cursorLeftY = doc.y;
        // let cursorRightY = doc.y;

        // if (apontamentos && apontamentos.length) {
        //   doc.font('Helvetica').fontSize(10).fillColor('black');
        //   let step = 1;
        //   for (const a of apontamentos) {
        //     const encerrado = a.fim ? formatDateTime(a.fim) : formatDateTime(a.comeco);
        //     const tecnico = safeText(a.tecnico_nome || a.tecnico_id || '');
        //     const desc = safeText(a.descricao || '');
        //     const line = `${step}. ${encerrado} — ${tecnico}: ${desc}`;
        //     const h = doc.heightOfString(line, { width: leftWidth });
        //     doc.text(line, leftX, cursorLeftY, { width: leftWidth });
        //     cursorLeftY += h + 6;
        //     step++;
        //   }
        // } else {
        //   doc.font('Helvetica').fontSize(10).fillColor('black');
        //   const noApontText = 'Nenhum apontamento foi encontrado.';
        //   const h = doc.heightOfString(noApontText, { width: leftWidth });
        //   doc.text(noApontText, leftX, cursorLeftY, { width: leftWidth });
        //   cursorLeftY += h + 6;
        // }

        // // Métricas (usa os campos SLA calculados)
        // doc.font('Helvetica').fontSize(11).fillColor('black');
        // const tempoTotal = rel.sla_elapsed_human || formatDurationBetween(rel.criado_em, rel.finalizado_em) || '-';
        // const slaText = (typeof rel.sla_cumprido !== 'undefined') ? (rel.sla_cumprido ? 'Cumprido' : 'Não cumprido') : 'Não calculado';

        // const metricsLines = [
        //   `Tempo total de atendimento (úteis): ${tempoTotal}`,
        //   `SLA (meta): ${rel.sla_target_human || '-'}`,
        //   `SLA: ${slaText}`
        // ];
        // if (!rel.sla_cumprido) metricsLines.push(`Atraso (úteis): ${formatMinutesToHuman(Math.max(0, rel.sla_elapsed_minutes - rel.sla_target_minutes))}`);
        // else metricsLines.push(`Tempo restante (úteis): ${rel.sla_remaining_human || '-'}`);

        // for (const ml of metricsLines) {
        //   const h = doc.heightOfString(ml, { width: rightWidth });
        //   doc.text(ml, rightX, cursorRightY, { width: rightWidth });
        //   cursorRightY += h + 4;
        // }

        // const nextY = Math.max(cursorLeftY, cursorRightY);
        // doc.y = nextY + 8;
        // doc.moveDown(0);
        // largura total da página
        const startX = doc.x;
        // const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        // const colLeftWidth = 300; // largura da coluna de apontamentos
        // const colRightWidth = pageWidth - colLeftWidth;
        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const colWidth = pageWidth / 2; // metade da página para cada coluna

        // títulos na mesma linha
        doc.font('Helvetica-Bold').fontSize(11).fillColor('black');
        doc.text('Apontamentos', startX, doc.y, { width: colWidth, continued: true });
        doc.text('Métricas', startX + colWidth, doc.y, { width: colWidth });
        doc.moveDown(0.3);

        let cursorLeftY = doc.y;
        let cursorRightY = doc.y;

        // conteúdo apontamentos
        if (apontamentos && apontamentos.length) {
            doc.font('Helvetica').fontSize(10);
            let step = 1;
            for (const a of apontamentos) {
                const encerrado = a.fim ? formatDateTime(a.fim) : formatDateTime(a.comeco);
                const tecnico = safeText(a.tecnico_nome || a.tecnico_id || '');
                const desc = safeText(a.descricao || '');
                const line = `${step}. ${encerrado} — ${tecnico}: ${desc}`;
                const h = doc.heightOfString(line, { width: colWidth });
                doc.text(line, startX, cursorLeftY, { width: colWidth });
                cursorLeftY += h + 6;
                step++;
            }
        } else {
            const noApontText = 'Nenhum apontamento foi encontrado.';
            const h = doc.heightOfString(noApontText, { width: colWidth });
            doc.text(noApontText, startX, cursorLeftY, { width: colWidth });
            cursorLeftY += h + 6;
        }

        // conteúdo métricas
        doc.font('Helvetica').fontSize(11);
        const tempoTotal = rel.sla_elapsed_human || formatDurationBetween(rel.criado_em, rel.finalizado_em) || '-';
        const slaText = (typeof rel.sla_cumprido !== 'undefined') ? (rel.sla_cumprido ? 'Cumprido' : 'Não cumprido') : 'Não calculado';

        const metricsLines = [
            `Tempo total de atendimento (úteis): ${tempoTotal}`,
            `SLA (meta): ${rel.sla_target_human || '-'}`,
            `SLA: ${slaText}`
        ];
        if (!rel.sla_cumprido) metricsLines.push(`Atraso (úteis): ${formatMinutesToHuman(Math.max(0, rel.sla_elapsed_minutes - rel.sla_target_minutes))}`);
        else metricsLines.push(`Tempo restante (úteis): ${rel.sla_remaining_human || '-'}`);

        for (const ml of metricsLines) {
            const h = doc.heightOfString(ml, { width: colWidth });
            doc.text(ml, startX + colWidth, cursorRightY, { width: colWidth });
            cursorRightY += h + 4;
        }

        // mover cursor para a linha seguinte
        doc.y = Math.max(cursorLeftY, cursorRightY) + 8;

        // Anexos
        // if (rel.anexos && rel.anexos.length) {
        //   doc.fontSize(12).text('Anexos', { underline: true });
        //   doc.moveDown(0.2);
        //   rel.anexos.forEach(a => { doc.fontSize(11).text(`${a}`); });
        //   doc.moveDown(0.4);
        // }
        // Anexos à esquerda, sem tabela
        if (rel.anexos && rel.anexos.length) {
            // força começar na margem esquerda
            const leftMargin = doc.page.margins.left;

            doc.moveDown(1); // espaço antes dos anexos
            doc.fontSize(12).text('Anexos', leftMargin, doc.y, { underline: true, align: 'left' });
            doc.moveDown(0.2);

            doc.fontSize(11).fillColor('black');
            rel.anexos.forEach(a => {
                doc.text(`${a}`, leftMargin, doc.y, { align: 'left' });
            });

            doc.moveDown(0.4);
        }
        doc.end();
    } catch (err) {
        console.error('Erro gerarRelatorioChamadoController:', err && err.stack ? err.stack : err);
        return res.status(500).json({ erro: 'Erro ao gerar relatório', detalhe: err && err.message ? err.message : undefined });
    }
};
