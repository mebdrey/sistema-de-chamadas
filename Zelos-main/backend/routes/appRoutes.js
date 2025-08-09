import express from "express";

import { criarChamadoController, criarPrioridadeController, criarRelatorioController, listarChamadosController, verRelatoriosController, listarTecnicosController, listarAuxiliaresLimpezaController, listarClientesController, listarTiposServicoController, buscarBlocosController, buscarSalasPorBlocoController, UsuarioEnviarMensagemController, TecnicoEnviarMensagemController, lerMensagensController } from "../controllers/ChamadoController.js";
import { enviarLinkRedefinicao, redefinirSenha } from '../controllers/RedefinirSenhaController.js';
import { obterPerfilUsuarioController, editarPerfilController } from "../controllers/PerfilController.js";
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/chamado', upload.single('imagem'), criarChamadoController);
router.post('/relatorio', criarRelatorioController);

router.patch('/prioridade', criarPrioridadeController);

router.get('/verRelatorio', verRelatoriosController);
router.get('/meus-chamados', listarChamadosController);
router.get('/listar-auxiliaresLimpeza', listarAuxiliaresLimpezaController);
router.get('/listar-tecnicos', listarTecnicosController);
router.get('/listar-clientes', listarClientesController);

// rota p/ solicitar o link de redefinicao
router.post('/esqueci-senha', enviarLinkRedefinicao);
// rota p/ redefinir a senha (token + nova senha)
router.post('/redefinir-senha', redefinirSenha);

//relacionados a perfil
router.get('/perfil', obterPerfilUsuarioController);
router.patch('/editarPerfil', editarPerfilController);

//para o chat de usuario para tecnico
router.post('/chat', UsuarioEnviarMensagemController);

// listar tipos de serviço
router.get('/servicos', listarTiposServicoController);

router.post('/enviar-msg', UsuarioEnviarMensagemController);

//para o chat de técnico para usuario
router.post('/tecnico-enviar-msg', TecnicoEnviarMensagemController);

//tecnico receber essas mensagens enviadas para ele
//router.get('/chat', receberMensagensController);
router.get('/chat', lerMensagensController);

// listar blocos e salas
router.get('/blocos', buscarBlocosController);
router.get('/salas/:bloco', buscarSalasPorBlocoController);

export default router;