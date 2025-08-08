

import { buscarTiposServico, criarChamado, criarPrioridade, criarRelatorio, listarUsuarios, verTecnicos, verClientes, listarChamados, verRelatorios, listarSalasPorBloco, listarBlocos,  escreverMensagem, lerMsg , garantirUsuarioExiste } from "../models/Chamado.js";
//criarUsuarioMensagem

// criar chamado -- funcionando
// const criarChamadoController = async (req, res) => {
//     try {
//         await criarChamado(req.body);
//         res.status(201).json({ mensagem: 'Chamado criado com sucesso!!!' })
//     } catch (err) {
//         res.status(500).json({ erro: err.message });
//     }
// };

// export const criarChamadoController = async (req, res) => {
//     const { assunto, tipoServiço, bloco, sala, descricao, imagem } = req.body;
//     const username = req.user?.username; // req.user guarda o usuário logado

//     if (!assunto || !tipoServiço || !bloco || !sala || !descricao || !imagem) {
//         return res.status(400).json({ erro: 'Preencha todos os campos.' });
//     }

//     try {
//         await criarChamado({ assunto, tipoServiço, bloco, sala, descricao, imagem, criado_por: username });
//         res.status(201).json({ mensagem: 'Chamado criado com sucesso.' });
//     } catch (error) {
//         console.error('Erro ao criar chamado:', error);
//         res.status(500).json({ erro: 'Erro interno ao criar chamado.' });
//     }
// };

export const criarChamadoController = async (req, res) => {
    const { assunto, tipo_id, bloco, sala, descricao } = req.body;
    const username = req.user?.username;

    if (!assunto || !tipo_id || !bloco || !sala || !descricao) {
        return res.status(400).json({ erro: 'Preencha todos os campos.' });
    }

    const imagem = req.file?.filename || null;

    try {
        // Garante que o usuário existe e pega seu id
        const usuario_id = await garantirUsuarioExiste(username);

        // Buscar local_id com base em bloco + sala
        const localEncontrado = await read('localChamado', { bloco, sala });
        if (!localEncontrado.length) {
            return res.status(400).json({ erro: 'Local (bloco/sala) inválido.' });
        }
        const local_id = localEncontrado[0].id;

        await criarChamado({
            assunto,
            tipo_id,
            descricao,
            imagem,
            local_id,
            usuario_id
        });

        res.status(201).json({ mensagem: 'Chamado criado com sucesso.' });

    } catch (error) {
        console.error('Erro ao criar chamado:', error);
        res.status(500).json({ erro: 'Erro interno ao criar chamado.' });
    }
};

//dar prioridade ao chamado -- não ta funcionando
const criarPrioridadeController = async (req, res) => {
    try {
        await criarPrioridade(req.body);
        res.status(201).json({ mensagem: 'prioridade inserida com sucesso!!!' })
    } catch (err) {
        res.status(500).json({ erro: err.message })
    }
};

//criar relatorio -- funcionando
const criarRelatorioController = async (req, res) => {
    try {
        await criarRelatorio(req.body);
        res.status(201).json({ mensagem: 'relatório criado com sucesso!!!' })
    } catch (err) {
        res.status(500).json({ erro: err.message })
    }
};

//listar todos os usuários -- funcionando
const listarUsuariosController = async (req, res) => {
    try {
        // await listarUsuarios(req.body); 
        const usuarios = await listarUsuarios(req.body);
        res.status(200).json({ mensagem: 'Usuários listados com sucesso!!!', usuarios })
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

// listar todos os tecnicos -- funcionando
const listarTecnicosController = async (req, res) => {
    try {
        // await verTecnicos(req.body);
        // const tecnicos = await verTecnicos(req.body);
        const tecnicos = await verTecnicos();
        res.status(200).json({ mensagem: 'Técnicos listados com sucesso!!!', tecnicos })
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

// listar todos os clientes -- funcionando
const listarClientesController = async (req, res) => {
    try {
        const clientes = await verClientes(req.body);
        res.status(200).json({ mensagem: 'Clientes listados com sucesso!!!', clientes })
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

const listarChamadosController = async (req, res) => {
    try {
        const usuarioId = req.usuarioId; // vindo do token JWT
        const chamados = await listarChamados(usuarioId);
        res.status(200).json({ mensagem: 'Chamados listados com sucesso!!!', chamados })
    }
    catch (error) {
        console.error('Erro ao listar chamados:', error);
        res.status(500).json({ message: 'Erro ao listar chamados' });
    }
}

//ver relatorios/apontamentos
const verRelatoriosController = async (req, res) => {
    try {
        const relatorios = await verRelatorios(req.body);
        res.json(relatorios);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao buscar relatórios!!!' })
    }
}

//técnico ler as mensagens dos usuários (enviadas para ele
// const receberMensagensController = async (req, res) => {
//     try {
//         //const usuarioId = req.usuarioId; //vindo do token JWT
//         const usuarioId = 2; //só até a autenticação estar funcionando
//         const mensagens = await receberMensagensDoUsuario(usuarioId);
//         res.status(200).json({ mensagem: 'Mensagens listadas com sucesso!', mensagens });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ erro: 'Erro ao listar mensagens !', err });
//     }
// }


//ler as mensagens (especificadas pelo id do chamado) por ordem de envio
const lerMensagensController = async (req, res) =>{
    try{

        const {idChamado}  = req.body;
        const mensagens = await lerMsg(idChamado);
        res.status(200).json({mensagem: 'Mensagens listadas com sucesso!', mensagens})
    }
    catch(err){
        console.error(err);
        res.status(500).json({erro: 'Erro ao ler mensagens :( ', err});
    };
};

//funções de chat

//msg usuario para técnico - ta funcionando mas é preciso resolver a autenticação (usar o user logado), automatizar o id do chamado e o id do destinatário, para que puxe os valores do técnico e do chamado relacionado ao técnico.
const UsuarioEnviarMensagemController = async (req, res) => {
    try {
        //coisas da autenticacao idUsuario
        // const idUsuario = req.idUsuario; // vindo do token JWT
        const { idUsuario, idTecnico, conteudoMsg, idChamado } = req.body;
        await escreverMensagem({
            id_usuario: idUsuario,
            id_tecnico: idTecnico, //o id do tecnico seria  o técnico que respondeu o chamado
            conteudo: conteudoMsg,
            id_chamado: idChamado
        })
        res.status(201).json({ mensagem: 'Mensagem enviada com sucesso!' });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao usuário enviar mensagem!!' });
    }
};

// listar tipos de serviço
export const listarTiposServicoController = async (req, res) => {
    try {
      const tiposAtivos = await buscarTiposServico();
      res.json(tiposAtivos);
    } catch (error) {
      console.error('Erro ao listar tipos de serviço:', error);
      res.status(500).json({ erro: 'Erro interno ao listar tipos.' });
    }
  };

// listar blocos
export const buscarBlocosController = async (req, res) => {
    try {
        const blocos = await listarBlocos();
        res.status(200).json(blocos);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar blocos.' });
    }
};

export const buscarSalasPorBlocoController = async (req, res) => {
    const { bloco } = req.params;

    if (!bloco) {
        return res.status(400).json({ erro: 'Bloco não informado.' });
    }

    try {
        const salas = await listarSalasPorBloco(bloco);
        res.status(200).json(salas);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar salas.' });
    }
};

const TecnicoEnviarMensagemController = async (req, res) => {
    try {
        //coisas da autenticacao idTecnico
        //const idTecnico = req.idTecnico
        const { idUsuario, idTecnico, conteudoMsg, idChamado } = req.body;
        await escreverMensagem({
            id_tecnico: idTecnico, //o id do tecnico seria  o técnico que respondeu o chamado
            id_usuario: idUsuario,
            conteudo: conteudoMsg,
            id_chamado: idChamado
        })
        res.status(201).json({ mensagem: 'Mensagem enviada com sucesso!' });
    } catch(error){
        console.error(error);
        res.status(500).json({mensagem: 'Erro ao técnico enviar mensagem!!'});
    }
}
// msgUsuarioTecnico
export { lerMensagensController,  UsuarioEnviarMensagemController, TecnicoEnviarMensagemController, criarPrioridadeController, criarRelatorioController, listarUsuariosController, listarTecnicosController, listarClientesController, listarChamadosController, verRelatoriosController };

