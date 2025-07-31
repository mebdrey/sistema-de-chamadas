import { criarChamado, criarPrioridade, criarRelatorio, verChamados,verRelatorios } from "../models/Chamado.js";


// criar chamado
const criarChamadoController = async(req,res)=>{
    try{
     await criarChamado(req.body);
     res.status(201).json({mensagem:'Chamado criado com sucesso!!!'})
    }
    catch(err){
        res.status(500).json({erro: err.message});
    }
};

//dar prioridade ao chamado
const criarPrioridadeController = async(req,res)=>{
    try{
        await criarPrioridade(req.body);
        res.status(201).json({mensagem:'prioridade inserida com sucesso!!!'})
    }catch(err){
        res.status(500).json({erro:err.message})
    }
};

//criar relatorio
const criarRelatorioController= async(req,res)=>{
    try{
        await criarRelatorio(req.body);
        res.status(201).json({mensagem:'relatório criado com sucesso!!!'})
    }catch(err){
        res.status(500).json({erro:err.message})
    }
};

//ver chamados
const verChamadosController = async(req,res)=>{
    try{
        const chamados = await verChamados(req.body);
        res.json(chamados);
    }catch(erro){
        console.error(erro);
        res.status(500).json({erro: "Erro ao buscar chamados!!!"})
    }
}

//ver relatorios/apontamentos
const verRelatoriosController = async(req,res)=>{
    try{
        const relatorios = await verRelatorios(req.body);
        res.json(relatorios);
    }catch(erro){
        console.error(erro);
        res.status(500).json({erro:'Erro ao buscar relatórios!!!'})
    }
}

export {criarChamadoController, criarPrioridadeController, criarRelatorioController, verChamadosController, verRelatoriosController};