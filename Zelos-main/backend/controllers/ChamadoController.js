
import { criarChamado, criarPrioridade, criarRelatorio, listarUsuarios, verTecnicos, verClientes, listarChamados, verRelatorios } from "../models/Chamado.js";

// criar chamado -- funcionando
const criarChamadoController = async (req, res) => {
    try {
        await criarChamado(req.body);
        res.status(201).json({ mensagem: 'Chamado criado com sucesso!!!' })
    } catch (err) {
        res.status(500).json({ erro: err.message });
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

export { criarChamadoController, criarPrioridadeController, criarRelatorioController, listarUsuariosController, listarTecnicosController, listarClientesController, listarChamadosController, verRelatoriosController };