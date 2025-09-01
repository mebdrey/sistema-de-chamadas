import {listarChamadosDisponiveis, contarTodosChamados, contarChamadosPendentes, contarChamadosEmAndamento, contarChamadosConcluido, getApontamentoById, pegarChamado, listarChamadosPorStatusEFunção, verificarReminders, criarApontamento, finalizarApontamento, finalizarChamado, getApontamentosByChamado} from '../models/Tecnicos.js'
import { criarNotificacao } from '../models/Notificacoes.js';
import {getChamadoById} from '../models/Chamado.js'

// usado para TECNICOS E AUXILIARES ------------------------------------------------------------------------------------------------------------------------------------------------------------
export const listarChamadosDisponiveisController = async (req, res) => {
    try {
        const usuario_id = req.user?.id;
        const chamados = await listarChamadosDisponiveis(usuario_id);
        res.json(chamados);
    } catch (error) { res.status(500).json({ erro: 'Erro ao listar chamados disponíveis.' }); }
};

export const pegarChamadoController = async (req, res) => {
    const usuario_id = req.user?.id;
    const { chamado_id } = req.body;

    if (!chamado_id) { return res.status(400).json({ erro: 'ID do chamado é obrigatório.' }); }

    try {const chamadoAtualizado = await pegarChamado(chamado_id, usuario_id);

        // devolve mensagem e chamado atualizado (contendo data_limite)
        res.status(200).json({ mensagem: 'Chamado atribuído com sucesso.', chamado: chamadoAtualizado });
    } catch (error) { res.status(400).json({ erro: error.message }); }
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
        if (!usuarioPodeVerApontamentos(user, chamado)) {return res.status(403).json({ erro: 'Acesso negado' }); }

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
        if (!(chamado.tecnico_id===tecnico_id || req.user.role==='admin')) {
            return res.status(403).json({ erro:'Você não pode criar apontamentos neste chamado' });
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
        } else { console.warn(`[finalizarChamadoController] não encontrou usuario_id para notificar (chamado ${chamado_id})`);}

        return res.status(200).json({ mensagem: 'Chamado finalizado com sucesso.', relatorio: dadosRelatorio });
    } catch (err) {
        console.error('Erro finalizarChamadoController:', err);
        const msg = err.message || 'Erro ao finalizar chamado';
        return res.status(400).json({ erro: msg });
    }
};
/* ---------- utilitários de formatação ---------- */
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

        // Campos para relatório
        const idExterno = formatIdHash(chamado, { zeros: 0 }); // coloque zeros:4 para "#0050" etc.
        const rel = {
            id: chamado.id,
            idExterno,
            assunto: safeText(chamado.assunto),
            descricao_inicial: safeText(chamado.descricao),
            usuario_nome: safeText(chamado.nome_usuario),
            prioridade: chamadaPrioridade(chamado.prioridade),
            status: primeiraLetraMaiuscula(chamado.status_chamado),
            criado_em: chamado.criado_em,
            finalizado_em: chamado.finalizado_em,
            tecnico_responsavel: safeText(chamado.tecnico_nome),
            setor_nome: safeText(chamado.setor_nome), // nome do setor vindo do model
            anexos: chamado.imagem ? [chamado.imagem] : []
        };

        // ---------- CSV ----------
        if (formato === 'csv') {
            // monta linhas no formato [rotulo, valor]
            const rows = [];

            rows.push(['Relatório de Chamado']); // título (aparece na primeira coluna)
            rows.push(['ID do Chamado', rel.idExterno]); // ex: "#50"
            rows.push(['Status', rel.status]);
            rows.push(['Prioridade', rel.prioridade]);
            rows.push(['Data/Hora de Abertura', formatDateTime(rel.criado_em)]);
            rows.push(['Data/Hora de Conclusão', formatDateTime(rel.finalizado_em)]);
            rows.push([]); // linha em branco
            rows.push(['Solicitante', rel.usuario_nome]);
            rows.push(['Assunto', rel.assunto]);
            rows.push(['Descrição', rel.descricao_inicial]);
            rows.push(['Setor', rel.setor_nome]);
            rows.push(['Técnico Atribuido', rel.tecnico_responsavel]);
            rows.push(['Data/Hora da Atribuição', formatDateTime(chamado.atribuido_em || chamado.criado_em)]);
            rows.push([]); // linha em branco

            // Histórico de Atendimento — colocamos todos os apontamentos na célula da direita,
            // cada apontamento em nova linha dentro da célula.
            rows.push(['Histórico de Atendimento']);
            const apontLines = (apontamentos && apontamentos.length)
                ? apontamentos.map(a => `${formatDateTime(a.comeco)} — ${safeText(a.tecnico_nome || a.tecnico_id)}: ${safeText(a.descricao)}`)
                : [];
            if (apontLines.length) {rows.push(['Apontamentos', apontLines.join('\n')]);}// coloca todos os apontamentos numa única célula (com quebras de linha)
            else { rows.push(['Apontamentos', 'Descreva aqui o procedimento realizado.']); }

            rows.push([]); // linha em branco

            // Métricas
            rows.push(['Métricas']);
            rows.push(['Tempo total de atendimento', formatDurationBetween(rel.criado_em, rel.finalizado_em) || '-']);
            rows.push(['SLA', (typeof chamado.sla_cumprido !== 'undefined' ? (chamado.sla_cumprido ? 'Cumprido' : 'Não cumprido') : 'Não calculado')]);

            // monta CSV; stringify vai colocar as quebras de linha dentro de células e escapar corretamente
            const csv = stringify(rows, { delimiter: ';' });

            res.setHeader('Content-Disposition', `attachment; filename=relatorio_chamado_${rel.id}.csv`);
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            return res.send('\uFEFF' + csv); // BOM para Excel/acentuação
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
        doc.moveDown(0.8);

        // Solicitante
        doc.fontSize(12).text('Solicitante', { underline: true });
        doc.moveDown(0.2);
        doc.fontSize(11).text(`Nome: ${rel.usuario_nome}`);
        doc.moveDown(0.6);

        // Descrição inicial
        doc.fontSize(12).text('Descrição Inicial', { underline: true });
        doc.moveDown(0.2);
        doc.fontSize(11).text(`Assunto: ${rel.assunto}`);
        doc.moveDown(0.1);
        doc.fontSize(11).text(`Descrição: ${rel.descricao_inicial}`);
        doc.moveDown(0.1);
        doc.fontSize(11).text(`Setor: ${rel.setor_nome}`);
        doc.moveDown(0.6);

        // Atribuição
        doc.fontSize(12).text('Atribuição', { underline: true });
        doc.moveDown(0.2);
        doc.fontSize(11).text(`Técnico Responsável: ${rel.tecnico_responsavel}`);
        doc.fontSize(11).text(`Data/Hora da Atribuição: ${formatDateTime(chamado.atribuido_em || chamado.criado_em)}`);
        doc.moveDown(0.6);

        // Histórico — **apenas apontamentos**
        doc.fontSize(12).text('Histórico de Atendimento', { underline: true });
        doc.moveDown(0.4);

        const startX = doc.x;
        const tableTop = doc.y;
        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const col1W = 120;
        const col2W = 140;
        const col3W = pageWidth - col1W - col2W;

        // Definição das duas colunas: Apontamentos (esquerda) e Métricas (direita)
        const leftX = startX;
        const leftWidth = col1W + col2W; // largura total da coluna esquerda
        const rightX = startX + leftWidth; // início da coluna direita
        const rightWidth = col3W; // largura disponível para métricas

        // Títulos (negrito, sem underline) — mantêm a ordem original
        doc.font('Helvetica-Bold').fontSize(11).fillColor('black');
        doc.text('Apontamentos', leftX, doc.y, { width: leftWidth });
        doc.text('Métricas', rightX, doc.y, { width: rightWidth });
        doc.moveDown(0.3);

        // Inicializa cursores verticais para cada coluna (usa posição corrente)
        let cursorLeftY = doc.y;
        let cursorRightY = doc.y;

        // Conteúdo — APONTAMENTOS (coluna esquerda)
        if (apontamentos && apontamentos.length) {
            doc.font('Helvetica').fontSize(10).fillColor('black');
            let step = 1;
            for (const a of apontamentos) {
                const encerrado = a.fim ? formatDateTime(a.fim) : formatDateTime(a.comeco);
                const tecnico = safeText(a.tecnico_nome || a.tecnico_id || '');
                const desc = safeText(a.descricao || '');

                const line = `${step}. ${encerrado} — ${tecnico}: ${desc}`;

                // calcula altura que a string ocupará e escreve na coluna esquerda
                const h = doc.heightOfString(line, { width: leftWidth });
                doc.text(line, leftX, cursorLeftY, { width: leftWidth });
                cursorLeftY += h + 6; // espaçamento entre itens
                step++;
            }
        } else {
            // restaura o texto que você pediu quando não houver apontamentos
            doc.font('Helvetica').fontSize(10).fillColor('black');
            const noApontText = 'Nenhum apontamento foi encontrado.';
            const h = doc.heightOfString(noApontText, { width: leftWidth });
            doc.text(noApontText, leftX, cursorLeftY, { width: leftWidth });
            cursorLeftY += h + 6;
        }

        // Conteúdo — MÉTRICAS (coluna direita)
        doc.font('Helvetica').fontSize(11).fillColor('black');
        const tempoTotal = formatDurationBetween(rel.criado_em, rel.finalizado_em) || '-';
        const slaText = (typeof chamado.sla_cumprido !== 'undefined') ? (chamado.sla_cumprido ? 'Cumprido' : 'Não cumprido') : 'Não calculado';

        const metricsLines = [`Tempo total de atendimento: ${tempoTotal}`,`SLA: ${slaText}`];

        for (const ml of metricsLines) {
            const h = doc.heightOfString(ml, { width: rightWidth });
            doc.text(ml, rightX, cursorRightY, { width: rightWidth });
            cursorRightY += h + 4;
        }

        // posiciona doc.y para a próxima seção usando o maior Y usado
        const nextY = Math.max(cursorLeftY, cursorRightY);
        doc.y = nextY + 8;
        doc.moveDown(0);

        // Anexos
        if (rel.anexos && rel.anexos.length) {
            doc.fontSize(12).text('Anexos', { underline: true });
            doc.moveDown(0.2);
            rel.anexos.forEach(a => { doc.fontSize(11).text(`${a}`); });
            doc.moveDown(0.4);
        }

        doc.end();
    } catch (err) {
        console.error('Erro gerarRelatorioChamadoController:', err);
        return res.status(500).json({ erro: 'Erro ao gerar relatório' });
    }
};