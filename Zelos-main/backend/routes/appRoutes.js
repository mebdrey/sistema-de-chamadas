import express from "express";
import { criarChamadoController, criarPrioridadeController, criarRelatorioController, listarUsuariosController } from "../controllers/ChamadoController.js";

const router = express.Router();

router.post('/criarChamado', criarChamadoController);
router.post ('/chamados', criarPrioridadeController);
router.post('/relatorio', criarRelatorioController);
router.get('/usuarios', listarUsuariosController);

export default router;