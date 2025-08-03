import express from "express";
import { criarChamadoController, criarPrioridadeController, criarRelatorioController, listarChamadosController, verRelatoriosController, listarUsuariosController, listarTecnicosController, listarClientesController } from "../controllers/ChamadoController.js";
import { enviarLinkRedefinicao, redefinirSenha } from '../controllers/RedefinirSenhaController.js';

const router = express.Router();

router.post('/chamado', criarChamadoController);
router.post('/relatorio', criarRelatorioController);

router.patch('/prioridade', criarPrioridadeController);

router.get('/verRelatorio', verRelatoriosController);
router.get('/verChamados', listarChamadosController);
router.get('/listarUsuarios', listarUsuariosController);
router.get('/listarTecnicos', listarTecnicosController);
router.get('/listarClientes', listarClientesController);

// rota p/ solicitar o link de redefinicao
router.post('/esqueci-senha', enviarLinkRedefinicao);
// rota p/ redefinir a senha (token + nova senha)
router.post('/redefinir-senha', redefinirSenha);

export default router;