import { lerMsg, lerChamadoComNomes, escreverMensagem, contarMensagensNaoLidas, marcarMensagensComoLidas } from "../models/Chat.js";
import { getChamadoById } from "../models/Chamado.js";

export const enviarMensagemController = async (req, res) => {
    try {
        const user = req.user; // passport/session
        const { idChamado, conteudoMsg } = req.body;

        if (!user || !user.id) {
            return res.status(401).json({ erro: "Usuário não autenticado" });
        }
        if (!idChamado || !conteudoMsg || !String(conteudoMsg).trim()) {
            return res.status(400).json({ erro: "idChamado e conteudoMsg são obrigatórios" });
        }

        // busca o chamado para validação de permissões
        const chamado = await getChamadoById(idChamado);
        if (!chamado) return res.status(404).json({ erro: "Chamado não encontrado" });

        const func = (user.funcao || user.role || "").toString().toLowerCase();

        // inicializa payload com ambos nulos e define a propriedade correta depois
        const payload = { id_chamado: idChamado, conteudo: conteudoMsg, id_tecnico: null, id_usuario: null };

        if (["tecnico", "apoio_tecnico", "manutencao", "externo", "auxiliar_limpeza"].includes(func)) {
            // técnico só pode enviar mensagens se for o técnico responsável do chamado (ou admin)
            if (!(Number(chamado.tecnico_id) === Number(user.id) || (user.funcao === "admin" || user.role === "admin"))) {
                return res.status(403).json({ erro: "Você não tem permissão para enviar mensagem neste chamado" });
            }
            payload.id_tecnico = user.id;
        } else {
            // usuário comum: só pode enviar se for o dono do chamado (ou admin)
            if (!(Number(chamado.usuario_id) === Number(user.id) || (user.funcao === "admin" || user.role === "admin"))) {
                return res.status(403).json({ erro: "Você não tem permissão para enviar mensagem neste chamado" });
            }
            payload.id_usuario = user.id;
        }

        console.log("[ChatController] payload a inserir:", payload, "req.user:", user);

        const insertRes = await escreverMensagem({
            id_usuario: payload.id_usuario,
            id_tecnico: payload.id_tecnico,
            conteudo: payload.conteudo,
            id_chamado: payload.id_chamado
        });

        return res.status(201).json({ mensagem: "Mensagem enviada com sucesso!", inserted: insertRes });
    } catch (err) {
        console.error("Erro enviarMensagemController:", err);
        return res.status(500).json({ erro: "Erro interno ao enviar mensagem" });
    }
};

//ler as mensagens (especificadas pelo id do chamado) por ordem de envio
// export const lerMensagensController = async (req, res) => {
//     try {
//         const { idChamado } = req.query;
//         const mensagens = await lerMsg(idChamado);
//         res.status(200).json({ mensagem: 'Mensagens listadas com sucesso!', mensagens })
//     }
//     catch (err) {
//         console.error(err);
//         res.status(500).json({ erro: 'Erro ao ler mensagens :( ', err });
//     };
// };
export const lerMensagensController = async (req, res) => {
  try {
    const rawId = req.query.idChamado ?? req.query.id ?? null;
    const idChamado = rawId ? Number(rawId) : null;
    if (!idChamado) return res.status(400).json({ erro: 'idChamado inválido ou ausente' });

    // mensagens (cada mensagem pode ter nomes dos autores, quando existir)
    const mensagens = await lerMsg(idChamado);

    // chamado com nomes do autor/tecnico (fonte da verdade para o interlocutor)
    const chamado = await lerChamadoComNomes(idChamado);

    // retornar ambos: mensagens + dados do chamado
    return res.status(200).json({
      mensagem: 'Mensagens listadas com sucesso!',
      mensagens: Array.isArray(mensagens) ? mensagens : [],
      chamado: chamado || null
    });
  } catch (err) {
    console.error('Erro lerMensagensController:', err);
    return res.status(500).json({ erro: 'Erro ao ler mensagens', details: String(err) });
  }
};

export const contarNaoLidasController = async (req, res) => {
    try {
        const user = req.user;
        if (!user || !user.id) return res.status(401).json({ erro: "Usuário não autenticado" });

        const { idChamado } = req.query;
        const role = (user.funcao || user.role || "").toString().toLowerCase().includes("tecnico") ? "tecnico" : "usuario";

        const qtd = await contarMensagensNaoLidas(Number(user.id), role, idChamado ? Number(idChamado) : null);
        return res.json({ naoLidas: qtd });
    } catch (err) {
        console.error("Erro contarNaoLidasController:", err);
        res.status(500).json({ erro: "Erro interno" });
    }
};

export const marcarLidasController = async (req, res) => {
    try {
        const user = req.user;
        if (!user || !user.id) return res.status(401).json({ erro: "Usuário não autenticado" });

        const { idChamado } = req.body;
        if (!idChamado) return res.status(400).json({ erro: "idChamado obrigatório" });

        const role = (user.funcao || user.role || "").toString().toLowerCase().includes("tecnico") ? "tecnico" : "usuario";

        await marcarMensagensComoLidas(Number(user.id), role, Number(idChamado));
        return res.json({ ok: true });
    } catch (err) {
        console.error("Erro marcarLidasController:", err);
        res.status(500).json({ erro: "Erro interno" });
    }
};