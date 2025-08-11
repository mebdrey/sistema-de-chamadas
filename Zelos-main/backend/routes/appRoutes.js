import express from "express";

import { criarChamadoController, criarPrioridadeController, criarRelatorioController, listarChamadosController, verRelatoriosController, listarUsuariosPorSetorController, listarTiposServicoController, buscarBlocosController, buscarSalasPorBlocoController, UsuarioEnviarMensagemController, TecnicoEnviarMensagemController, lerMensagensController, excluirUsuarioController, listarChamadosDisponiveisController, pegarChamadoController } from "../controllers/ChamadoController.js";
import { enviarLinkRedefinicao, redefinirSenha } from '../controllers/RedefinirSenhaController.js';
import { obterPerfilUsuarioController, editarPerfilController } from "../controllers/PerfilController.js";
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// rotas usadas em usuario -----------------------------------------------------------------------------------------------------------------------------------------------
router.post('/chamado', upload.single('imagem'), criarChamadoController); // criação de chamados
router.get('/meus-chamados', listarChamadosController); // ver chamados feito pelo usuario
router.get('/blocos', buscarBlocosController); // listar blocos
router.get('/salas/:bloco', buscarSalasPorBlocoController); // listar salas
router.get('/servicos', listarTiposServicoController); // listar tipos de serviço

// rotas usadas para o adm ------------------------------------------------------------------------------------------------------------------------------------------------
router.get('/usuarios-por-setor', listarUsuariosPorSetorController); // adm - ver usuarios
router.delete('/usuarios/:id', excluirUsuarioController); // adm- excluir usuarios

// rotas usadas para tecnicos e auxiliares ------------------------------------------------------------------------------------------------------------------------------------------------
router.get('/chamados-disponiveis', listarChamadosDisponiveisController); // lista chamados disponiveis para o tecnico/auxiliar logado
router.post('/pegar-chamado', pegarChamadoController); // tecnico/auxiliar pega um chamado

router.post('/relatorio', criarRelatorioController);

router.patch('/prioridade', criarPrioridadeController);

router.get('/verRelatorio', verRelatoriosController);


// rota p/ solicitar o link de redefinicao
router.post('/esqueci-senha', enviarLinkRedefinicao);
// rota p/ redefinir a senha (token + nova senha)
router.post('/redefinir-senha', redefinirSenha);

//relacionados a perfil
router.get('/perfil', obterPerfilUsuarioController);
router.patch('/editarPerfil', editarPerfilController);

//para o chat de usuario para tecnico
router.post('/chat', UsuarioEnviarMensagemController);



router.post('/enviar-msg', UsuarioEnviarMensagemController);

//para o chat de técnico para usuario
router.post('/tecnico-enviar-msg', TecnicoEnviarMensagemController);

//tecnico receber essas mensagens enviadas para ele
//router.get('/chat', receberMensagensController);
router.get('/chat', lerMensagensController);

export default router;