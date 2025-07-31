import express from "express";
import { criarChamadoController, criarPrioridadeController, criarRelatorioController, verChamadosController, verRelatoriosController, listarUsuariosController, listarTecnicosController } from "../controllers/ChamadoController.js";

const router = express.Router();

router.post('/chamado', criarChamadoController);
router.post ('/prioridade', criarPrioridadeController);
router.post('/relatorio', criarRelatorioController);
router.get('/verRelatorio', verRelatoriosController);
router.get('/verChamados', verChamadosController);
router.get('/listarUsuarios', listarUsuariosController);
router.get('/listarTecnicos', listarTecnicosController);

export default router;