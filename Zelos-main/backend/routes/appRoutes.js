import express from "express";

import { criarChamadoController, listarChamadosController, listarUsuariosPorSetorController, listarTiposServicoController, UsuarioEnviarMensagemController, TecnicoEnviarMensagemController, lerMensagensController, excluirUsuarioController, listarChamadosDisponiveisController, pegarChamadoController, listarTodosChamadosController, contarChamadosController, chamadosPendentesController, chamadosEmAndamentoController, chamadosConcluidoController, contarChamadosPorStatusController, listarChamadosFuncionarioController, listarApontamentosController, criarApontamentoController, finalizarApontamentoController, buscarChamadoComNomeUsuarioController, relatorioStatusController, relatorioTipoController, relatorioTecnicosController } from "../controllers/ChamadoController.js";
import { obterPerfilUsuarioController, editarPerfilController } from "../controllers/PerfilController.js";
import { upload } from '../middlewares/uploadMiddleware.js';
import { garantirAutenticado } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get("/chamado/:id", garantirAutenticado, buscarChamadoComNomeUsuarioController);

// rotas usadas em usuario -----------------------------------------------------------------------------------------------------------------------------------------------
router.post('/chamado', upload.single('imagem'), garantirAutenticado, criarChamadoController); // criação de chamados
router.get('/meus-chamados', garantirAutenticado, listarChamadosController); // ver chamados feito pelo usuario
router.get('/servicos', listarTiposServicoController); // listar tipos de serviço

// rotas usadas para o adm ------------------------------------------------------------------------------------------------------------------------------------------------
router.get('/usuarios-por-setor', garantirAutenticado, listarUsuariosPorSetorController); // adm - ver usuarios
router.delete('/usuarios/:id', garantirAutenticado, excluirUsuarioController); // adm- excluir usuarios
router.get('/todos-chamados', garantirAutenticado, listarTodosChamadosController) // ver todos os chamados registrados
router.get('/contar-por-status', garantirAutenticado, contarChamadosPorStatusController);
router.get('/relatorios/chamados-por-status', garantirAutenticado, relatorioStatusController);
router.get('/relatorios/chamados-por-tipo', garantirAutenticado, relatorioTipoController);
router.get('/relatorios/atividades-tecnicos', garantirAutenticado, relatorioTecnicosController);

// rotas usadas para tecnicos e auxiliares ------------------------------------------------------------------------------------------------------------------------------------------------
// router.get('/chamados-disponiveis', listarChamadosDisponiveisController); 
router.post('/pegar-chamado', garantirAutenticado, pegarChamadoController); // tecnico/auxiliar pega um chamado
router.get('/chamados-funcionario', garantirAutenticado, listarChamadosFuncionarioController); // lista chamados disponiveis para o tecnico/auxiliar logado
router.get('/apontamentos/:chamado_id', garantirAutenticado, listarApontamentosController); // lista os apontamentos feitos para determinado chamamdo 
router.post('/criar-apontamento', garantirAutenticado, criarApontamentoController); // tecnico cria apontamentos
router.patch('/finalizar-apontamento', garantirAutenticado, finalizarApontamentoController); // tecnico finaliza apontamentos


//relacionados a perfil
router.get('/perfil', garantirAutenticado, obterPerfilUsuarioController);
router.patch('/editarPerfil', garantirAutenticado, editarPerfilController);


//router.post('/chat', UsuarioEnviarMensagemController);


//para o chat de usuario para tecnico
router.post('/enviar-msg', garantirAutenticado, UsuarioEnviarMensagemController);
//para o chat de técnico para usuario
router.post('/tecnico-enviar-msg', garantirAutenticado, TecnicoEnviarMensagemController);
router.get('/chat', garantirAutenticado, lerMensagensController);


router.get('/contar-chamados', garantirAutenticado, contarChamadosController); // qtnd de chamados
router.get('/pendentes', garantirAutenticado, chamadosPendentesController); // qnt de chamamdos pendentes
router.get('/em-andamento', garantirAutenticado, chamadosEmAndamentoController); // qnt de chamamdos em andamento
router.get('/concluido', garantirAutenticado, chamadosConcluidoController); // qnt de chamamdos concluidos

export default router;
