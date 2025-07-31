import { criarChamado, criarPrioridade, criarRelatorio,listarUsuarios, verTecnicos, verClientes } from "../models/Chamado.js";

const criarChamadoController = async(req,res)=>{
    try{
     await criarChamado(req.body);
     res.status(201).json({mensagem:'Chamado criado com sucesso!!!'})
    }
    catch(err){
        res.status(500).json({erro: err.message});
    }
};

const criarPrioridadeController = async(req,res)=>{
    try{
        await criarPrioridade(req.body);
        res.status(201).json({mensagem:'prioridade inserida com sucesso!!!'})
    }catch(err){
        res.status(500).json({erro:err.message})
    }
};

const criarRelatorioController= async(req,res)=>{
    try{
        await criarRelatorio(req.body);
        res.status(201).json({mensagem:'relatório criado com sucesso!!!'})
    }catch(err){
        res.status(500).json({erro:err.message})
    }
};

const listarUsuariosController = async(req,res) =>{
    try{
        await listarUsuarios(req.body);
        res.status(201).json({mensagem:'Usuários listados com sucesso!!!'})
       }
    catch(err){
        res.status(500).json({erro: err.message});
    }
};

const listarTecnicosController = async(req,res)=>{
    try{
        await verTecnicos(req.body);
        res.status(201).json({mensagem:'Técnicos listados com sucesso!!!'})
       }
    catch(err){
        res.status(500).json({erro: err.message});
    }
}

const listarClientesController = async(req,res)=>{
    try{
        await verClientes(req.body);
        res.status(201).json({mensagem:'Clientes listados com sucesso!!!'})
       }
    catch(err){
        res.status(500).json({erro: err.message});
    }
};

export {criarChamadoController, criarPrioridadeController, criarRelatorioController, listarUsuariosController, listarTecnicosController, listarClientesController};