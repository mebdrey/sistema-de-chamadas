import express from "express";
import { criarChamadoController, criarPrioridadeController, criarRelatorioController, verChamadosController, verRelatoriosController } from "../controllers/ChamadoController";

const router = express.Router();

router.post('/criarChamado', criarChamadoController);
router.post ('/chamados', criarPrioridadeController);
router.post('/relatorio', criarRelatorioController);
router.post('/verRelatorio', verRelatoriosController);
router.post('/verChamados', verChamadosController);

export default router;