import express from "express";

import { buscarChamadoComNomeUsuarioController, listarPrioridadesController} from "../controllers/ChamadoController.js";

// middlewares -----------------------------------------------------------------------------------------
import { upload } from '../middlewares/uploadMiddleware.js'; // uploads de fotos
import { garantirAutenticado } from '../middlewares/authMiddleware.js';

// controllers --------------------------------------------------------------------
import { listarNotificacoesController, marcarNotificacaoLidaController, marcarTodasComoLidasController, marcarVisualizadasController, contagemNotificacoesController } from '../controllers/NotificacoesController.js' // notificacao
import { lerMensagensController, enviarMensagemController, contarNaoLidasController, marcarLidasController } from '../controllers/ChatController.js' // chat
import {criarChamadoController, listarChamadosController, listarTiposServicoController, criarAvaliacaoController, existeAvaliacaoController} from '../controllers/UsuarioComumController.js' // controllers de usuarios comuns
import { obterPerfilUsuarioController, editarPerfilController, removerFotoController, atualizarFotoPerfilController } from "../controllers/PerfilController.js"; // perfil
import { enviarLinkRedefinicao, redefinirSenha, verifyCode } from '../controllers/RedefinirSenhaController.js'; // controller de redefinir a senha
import { pegarChamadoController, contarChamadosController, chamadosPendentesController, chamadosEmAndamentoController, chamadosConcluidoController, listarChamadosFuncionarioController, listarApontamentosController, criarApontamentoController, finalizarApontamentoController, finalizarChamadoController, gerarRelatorioChamadoController} from '../controllers/TecnicosController.js' // controllers de tecnicos/auxiliares
import {listarUsuariosPorSetorController, excluirUsuarioController, listarTodosChamadosController, atribuirTecnicoController, contarChamadosPorStatusController, contarChamadosPorPrioridadeController, chamadosPorMesController, editarChamadoController, criarUsuarioController, sugerirUsernameController, criarSetorController, listarSetoresController, atualizarSetorController, excluirSetorController, criarPrioridadeController, atualizarPrazoController, calcularDataLimiteController, contarChamadosPorPoolController, listarUsuariosController, atualizarPrioridadeController, excluirPrioridadeController, verificarUsernameController, slaCumpridoController, avaliacoesPorSetorController} from '../controllers/AdminController.js'

const router = express.Router();

router.get("/chamado/:id", garantirAutenticado, buscarChamadoComNomeUsuarioController);




// rotas usadas em usuario -----------------------------------------------------------------------------------------------------------------------------------------------
router.post('/chamado', upload.single('imagem'), garantirAutenticado, criarChamadoController); // criação de chamados
router.get('/meus-chamados', garantirAutenticado, listarChamadosController); // ver chamados feito pelo usuario
router.get('/servicos', listarTiposServicoController); // listar tipos de serviço
router.get('/prioridades', listarPrioridadesController); // lista prioridades
router.post("/criar-avaliacao", garantirAutenticado, criarAvaliacaoController); // criar avaliação
router.get("/avaliacao-existe", garantirAutenticado, existeAvaliacaoController); // checar se já existe avaliação




// rotas usadas para o adm ------------------------------------------------------------------------------------------------------------------------------------------------
router.get('/usuarios-por-setor', garantirAutenticado, listarUsuariosPorSetorController); // adm - ver usuarios
router.delete('/usuarios/:id', garantirAutenticado, excluirUsuarioController); // adm- excluir usuarios
router.get('/todos-chamados', garantirAutenticado, listarTodosChamadosController) // ver todos os chamados registrados
router.get('/contar-por-status', garantirAutenticado, contarChamadosPorStatusController);
router.get('/chamados-por-mes', garantirAutenticado, chamadosPorMesController);
router.get('/chamadosPorPrioridade', garantirAutenticado, contarChamadosPorPrioridadeController);
router.put("/atribuir-tecnico", garantirAutenticado, atribuirTecnicoController);
router.patch('/chamado/:id', garantirAutenticado, editarChamadoController);
router.post('/usuarios', criarUsuarioController); // criar usuario
router.post('/usuarios/sugerir-username', sugerirUsernameController); // sugere username a partir do que foi digitado
router.post("/pool", garantirAutenticado, criarSetorController); // Criar setor
router.get("/pool", listarSetoresController); // Listar setores
router.put("/pool/:id", garantirAutenticado, atualizarSetorController); // Atualizar setor
router.delete("/pool/:id", garantirAutenticado, excluirSetorController); // Excluir setor
router.post('/prioridades', garantirAutenticado, criarPrioridadeController); // cria prioridade
router.get('/prioridades', garantirAutenticado, listarPrioridadesController); // lista prioridades
router.get('/usuarios/check', garantirAutenticado, verificarUsernameController);
// chamados - prazo
router.patch('/chamados/:id/prazo', garantirAutenticado, atualizarPrazoController);
router.post('/chamados/calcular-prazo', calcularDataLimiteController);
router.get("/relatorios/chamados-por-pool", garantirAutenticado, contarChamadosPorPoolController);
router.get('/usuarios', garantirAutenticado, listarUsuariosController); // Listar usuários
router.put('/prioridades/:id', garantirAutenticado, atualizarPrioridadeController); // Atualizar prioridade
router.delete('/prioridades/:id', garantirAutenticado, excluirPrioridadeController); // Excluir prioridade
router.get("/indicadores/sla",garantirAutenticado,  slaCumpridoController);
router.get('/avaliacoes-por-setor', avaliacoesPorSetorController);



// rotas usadas para tecnicos e auxiliares ------------------------------------------------------------------------------------------------------------
router.post('/pegar-chamado', garantirAutenticado, pegarChamadoController); // tecnico/auxiliar pega um chamado
router.get('/chamados-funcionario', garantirAutenticado, listarChamadosFuncionarioController); // lista chamados disponiveis para o tecnico/auxiliar logado
router.get('/apontamentos/:chamado_id', garantirAutenticado, listarApontamentosController); // lista os apontamentos feitos para determinado chamamdo 
router.post('/criar-apontamento', garantirAutenticado, criarApontamentoController); // tecnico cria apontamentos
router.patch('/finalizar-apontamento', garantirAutenticado, finalizarApontamentoController); // tecnico finaliza apontamentos
router.patch('/finalizar-chamado', garantirAutenticado, finalizarChamadoController);
router.get('/relatorio-chamado/:chamado_id', garantirAutenticado, gerarRelatorioChamadoController);




//relacionados a perfil
router.get('/perfil', garantirAutenticado, obterPerfilUsuarioController);
router.patch('/editarPerfil', garantirAutenticado, editarPerfilController);
router.post('/editarFoto', garantirAutenticado, upload.single('foto'), atualizarFotoPerfilController);
router.post('/removerFoto', garantirAutenticado, removerFotoController);



// chat -----------------------------------------------------------------------------------------------------------------
router.get('/chat', garantirAutenticado, lerMensagensController);
router.post("/mensagem", garantirAutenticado, enviarMensagemController);
router.get("/mensagens/nao-lidas", garantirAutenticado, contarNaoLidasController); // conta mensagens não-lidas
router.post("/mensagens/marcar-lidas", garantirAutenticado, marcarLidasController); // marca como lidas

router.get('/contar-chamados', garantirAutenticado, contarChamadosController); // qtnd de chamados
router.get('/pendentes', garantirAutenticado, chamadosPendentesController); // qnt de chamamdos pendentes
router.get('/em-andamento', garantirAutenticado, chamadosEmAndamentoController); // qnt de chamamdos em andamento
router.get('/concluido', garantirAutenticado, chamadosConcluidoController); // qnt de chamamdos concluidos

router.post('/esqueci-senha', enviarLinkRedefinicao); // rota p/ solicitar o link de redefinicao
router.post('/verify-code', verifyCode);
router.post('/redefinir-senha', redefinirSenha); // rota p/ redefinir a senha (token + nova senha)


// notificacoes ------------------------------------------------------------------------------------------------
router.get("/notificacoes", garantirAutenticado, listarNotificacoesController);
router.post("/:id/lida", garantirAutenticado, marcarNotificacaoLidaController);
router.post("/marcar-todas", garantirAutenticado, marcarTodasComoLidasController);
router.post('/notificacoes/visualizadas', garantirAutenticado, marcarVisualizadasController);
router.get('/notificacoes/contagem', garantirAutenticado, contagemNotificacoesController);

export default router;
