import { criarChamado, criarPrioridade } from "../models/Chamado.js";

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

export {criarChamadoController, criarPrioridadeController};