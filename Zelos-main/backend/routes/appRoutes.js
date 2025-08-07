import express from "express";
import { criarChamadoController, criarPrioridadeController, criarRelatorioController, listarChamadosController, verRelatoriosController, listarUsuariosController, listarTecnicosController, listarClientesController, msgUsuarioTecnico, listarTiposServicoController, buscarBlocosController, buscarSalasPorBlocoController } from "../controllers/ChamadoController.js";
import { enviarLinkRedefinicao, redefinirSenha } from '../controllers/RedefinirSenhaController.js';
import { obterPerfilUsuarioController, editarPerfilController } from "../controllers/PerfilController.js";

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

//relacionados a perfil
router.get('/perfil', obterPerfilUsuarioController);
router.patch('/editarPerfil', editarPerfilController);

//para o chat de usuario para tecnico
router.post('/chat', msgUsuarioTecnico);

// listar tipos de serviço
router.get('/servicos', listarTiposServicoController);

// listar blocos e salas
router.get('/blocos', buscarBlocosController);
router.get('/salas/:bloco', buscarSalasPorBlocoController);

export default router;