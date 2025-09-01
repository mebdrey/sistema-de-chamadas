import { buscarChamadoComNomeUsuario, listarPrioridades } from "../models/Chamado.js";

// busca nome do usuario com base no ID
export const buscarChamadoComNomeUsuarioController = async (req, res) => {
  const { id } = req.params;
  if (!id) { return res.status(400).json({ erro: "ID do chamado é obrigatório." }); }

  try {
    const chamado = await buscarChamadoComNomeUsuario(id);
    if (!chamado) { return res.status(404).json({ erro: "Chamado não encontrado." }) }
    res.json(chamado);
  } catch (error) {
    console.error("Erro ao buscar chamado com nome do usuário:", error);
    res.status(500).json({ erro: "Erro ao buscar chamado." });
  }
};

// Controller para listar prioridades
export const listarPrioridadesController = async (req, res) => {
    try {
        const prioridades = await listarPrioridades();
        res.json(prioridades);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar prioridades." });
    }
};