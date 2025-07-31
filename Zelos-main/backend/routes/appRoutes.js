import express from "express";
import { criarChamadoController, criarPrioridadeController, criarRelatorioController } from "../controllers/ChamadoController";

const router = express.Router();

router.post('/criarChamado', criarChamadoController);
router.post ('/chamados', criarPrioridadeController);
router.post('/relatorio', criarRelatorioController);

export default router;