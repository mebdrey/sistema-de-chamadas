import express from "express";
import { criarChamadoController, criarPrioridadeController, criarRelatorioController, listarChamadosController, verRelatoriosController, listarUsuariosController, listarTecnicosController, listarClientesController } from "../controllers/ChamadoController.js";

const router = express.Router();

router.post('/chamado', criarChamadoController);
router.post('/relatorio', criarRelatorioController);

router.patch ('/prioridade', criarPrioridadeController);

router.get('/verRelatorio', verRelatoriosController);
router.get('/verChamados', listarChamadosController);
router.get('/listarUsuarios', listarUsuariosController);
router.get('/listarTecnicos', listarTecnicosController);
router.get('/listarClientes', listarClientesController);

export default router;