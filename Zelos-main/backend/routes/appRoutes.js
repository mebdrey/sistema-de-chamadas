import express from "express";

import { criarChamadoController, criarPrioridadeController, criarRelatorioController, listarChamadosController, verRelatoriosController, listarUsuariosPorSetorController, listarTiposServicoController, UsuarioEnviarMensagemController, TecnicoEnviarMensagemController, lerMensagensController, excluirUsuarioController, listarChamadosDisponiveisController, pegarChamadoController, listarTodosChamadosController, contarChamadosController, chamadosPendentesController, chamadosEmAndamentoController, chamadosConcluidoController, contarChamadosPorStatusController } from "../controllers/ChamadoController.js";
import { obterPerfilUsuarioController, editarPerfilController } from "../controllers/PerfilController.js";
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// rotas usadas em usuario -----------------------------------------------------------------------------------------------------------------------------------------------
router.post('/chamado', upload.single('imagem'), criarChamadoController); // criação de chamados
router.get('/meus-chamados', listarChamadosController); // ver chamados feito pelo usuario
router.get('/servicos', listarTiposServicoController); // listar tipos de serviço

// rotas usadas para o adm ------------------------------------------------------------------------------------------------------------------------------------------------
router.get('/usuarios-por-setor', listarUsuariosPorSetorController); // adm - ver usuarios
router.delete('/usuarios/:id', excluirUsuarioController); // adm- excluir usuarios
router.get('/todos-chamados', listarTodosChamadosController) // ver todos os chamados registrados
router.get('/contar-por-status', contarChamadosPorStatusController);

// rotas usadas para tecnicos e auxiliares ------------------------------------------------------------------------------------------------------------------------------------------------
router.get('/chamados-disponiveis', listarChamadosDisponiveisController); // lista chamados disponiveis para o tecnico/auxiliar logado
router.post('/pegar-chamado', pegarChamadoController); // tecnico/auxiliar pega um chamado

router.post('/relatorio', criarRelatorioController);

router.patch('/prioridade', criarPrioridadeController);

router.get('/verRelatorio', verRelatoriosController);


//relacionados a perfil
router.get('/perfil', obterPerfilUsuarioController);
router.patch('/editarPerfil', editarPerfilController);


//router.post('/chat', UsuarioEnviarMensagemController);


//para o chat de usuario para tecnico
router.post('/enviar-msg', UsuarioEnviarMensagemController);

//para o chat de técnico para usuario
router.post('/tecnico-enviar-msg', TecnicoEnviarMensagemController);

//tecnico receber essas mensagens enviadas para ele
//router.get('/chat', receberMensagensController);
router.get('/chat', lerMensagensController);


router.get('/contar-chamados', contarChamadosController); // qtnd de chamados
router.get('/pendentes', chamadosPendentesController); // qnt de chamamdos pendentes
router.get('/em-andamento', chamadosEmAndamentoController); // qnt de chamamdos em andamento
router.get('/concluido', chamadosConcluidoController); // qnt de chamamdos concluidos
export default router;
