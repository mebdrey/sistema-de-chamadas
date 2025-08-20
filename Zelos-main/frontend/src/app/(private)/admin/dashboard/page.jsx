"use client"
import { useEffect, useState, useRef } from "react";
import './dashboard.css';
import GraficoPorStatus from "@/components/GraficoPorStatus/GraficoPorStatus";
// import GraficoDeLinhas from '../../../../components/GraficoLinhas/GraficoDeLinhas.jsx'
// import GraficoChamadosPorMes from '../../../../components/GraficoMes/GraficoChamadosPorMes.jsx';
// import ChamadosPorPrioridade from "../../../../GraficoDeBarras/GraficoDeBarras.jsx";
// import KpiSla from "../../../../components/Kpi/kpi.jsx";
// import Indicadores from  "../../../../components/Indicadores/Indicadores.jsx";
import ChamadosPorPrioridade from "@/components/GraficoDeBarras/GraficoDeBarras";
import KpiSla from "@/components/Kpi/kpi";
import Indicadores from "@/components/Indicadores/Indicadores";
import GraficoChamadosPorMes from "@/components/GraficoMes/GraficoChamadosPorMes";

export default function Setores() {
    const [setoresSelecionados, setSetoresSelecionados] = useState({ auxiliares: true, tecnicos: true, }); // Estado que guarda quais setores estão selecionados no dropdown, inicialmente todos true para mostrar todos ao entrar na página
    const [setores, setSetores] = useState({}); // Dados completos dos usuários por setor vindo da API
    const [dropdownAberto, setDropdownAberto] = useState(false); // Estado para controlar dropdown aberto/fechado
    const [dropdownAbertoId, setDropdownAbertoId] = useState(null); // controla o estado de dropdown aberto/fechado (dropdown p cada usuario)
    const [busca, setBusca] = useState(""); // armazena o que for digitado no campo de busca

    const qndtChamados = [
        { tipo: 'em aberto', qtd: 55 },
        { tipo: 'em andamento', qtd: 55 },
        { tipo: 'encerrados', qtd: 55 }];


    return (
        <div className="p-4 w-full">
            <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
                { /*CARDS DA QUANTIDADE DE CHAMADOS*/}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    {qndtChamados.map((nChamados, index) => (
                        <div key={index} className="flex items-center justify-center h-fit rounded-sm">
                            <div  className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                                <div className="flex flex-row gap-3">
                                    <svg className="w-7 h-7 text-gray-500 dark:text-gray-400 mb-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M18 5h-.7c.229-.467.349-.98.351-1.5a3.5 3.5 0 0 0-3.5-3.5c-1.717 0-3.215 1.2-4.331 2.481C8.4.842 6.949 0 5.5 0A3.5 3.5 0 0 0 2 3.5c.003.52.123 1.033.351 1.5H2a2 2 0 0 0-2 2v3a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a2 2 0 0 0-2-2ZM8.058 5H5.5a1.5 1.5 0 0 1 0-3c.9 0 2 .754 3.092 2.122-.219.337-.392.635-.534.878Zm6.1 0h-3.742c.933-1.368 2.371-3 3.739-3a1.5 1.5 0 0 1 0 3h.003ZM11 13H9v7h2v-7Zm-4 0H2v5a2 2 0 0 0 2 2h3v-7Zm6 0v7h3a2 2 0 0 0 2-2v-5h-5Z" />
                                    </svg>
                                    <h5 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">{nChamados.qtd}</h5>
                                </div>
                                <p className="mb-3 font-normal text-gray-500 dark:text-gray-400">Chamados {nChamados.tipo}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-1 mb-4">
                    <div className="col-span-2 flex items-center justify-center h-fit mb-4 rounded-sm">
                        <div className="w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
                            <GraficoChamadosPorMes />
                        </div>
                    </div>
                    <div className="col-span-1 flex items-center justify-center h-fit mb-4 rounded-sm">
                        <div className="w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
                            <GraficoPorStatus />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <ChamadosPorPrioridade />
                    <KpiSla />
                </div>

                {/* <Indicadores /> */}
              
            </div>
        </div >
    );
}
