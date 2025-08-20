"use client"
import { useEffect, useState, useRef } from "react";
import './dashboard.css';
import GraficoPorStatus from "@/components/GraficoPorStatus/GraficoPorStatus";
import ChamadosPorPrioridade from "@/components/GraficoDeBarras/GraficoDeBarras";
import KpiSla from "@/components/Kpi/kpi";
import Indicadores from "@/components/Indicadores/Indicadores";
import GraficoChamadosPorAno from "@/components/GraficoMes/GraficoChamadosPorMes";
import AnimatedNumber from '@/components/AnimatedValue/AnimatedValue'

export default function admDashboard() {
 const [modo, setModo] = useState('mensal'); // 'mensal' ou 'anual'
  const [qndtChamados, setQndtChamados] = useState([]);
    const [dropdownChamadosStatusOpen, setDropdownChamadosStatusOpen] = useState(false);
  

  // Função para buscar dados do backend
  const fetchChamados = async () => {
    try {
      const res = await fetch(`http://localhost:8080/contar-por-status?modo=${modo}`,  { credentials: 'include' });
      const data = await res.json();
      setQndtChamados(data);
    } catch (error) {
      console.error('Erro ao buscar dados dos chamados:', error);
    }
  };

  useEffect(() => {
    fetchChamados();
  }, [modo]);

  // Função para alternar entre mensal/anual
  const handleToggle = () => {
    setModo((prev) => (prev === 'mensal' ? 'anual' : 'mensal'));
  };

  //
const exportarCsvChamadosPorStatus = () => {
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  const modoTexto = modo === 'mensal' ? 'Mensal' : 'Anual';

  // Função para capitalizar a primeira letra
  const capitalizar = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Cabeçalho informativo
  const cabecalhoInfo = [
    `Relatório de Chamados por Status`,
    `Gerado em: ${dataAtual}`,
    `Modo: ${modoTexto}`,
    ''
  ];

  // Cabeçalho da tabela
  const cabecalhoTabela = ['Tipo de Chamado', 'Quantidade'];

  // Linhas da tabela com nomes capitalizados
  const linhasTabela = qndtChamados.map(item => [
    capitalizar(item.tipo.normalize('NFD').replace(/[\u0300-\u036f]/g, '')), // remove acentos se tiver problemas
    item.qtd
  ]);

  const separador = ';';

  // Junta tudo
  const conteudoCsv = [
    ...cabecalhoInfo,
    cabecalhoTabela.join(separador),
    ...linhasTabela.map(linha => linha.join(separador))
  ].join('\n');

  // Para resolver problema de acentuação → adiciona BOM no início
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + conteudoCsv], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `relatorio_chamados_status_${modoTexto.toLowerCase()}.csv`;
  link.click();
};

    return (
        <div className="p-4 w-full">
            <div className="p-4  rounded-lg mt-14">
                { /*CARDS DA QUANTIDADE DE CHAMADOS*/}
             {/* TOGGLE */}
      <div className="mb-4 flex justify-center items-center gap-x-3">
        <label htmlFor="toggle-count-switch" className="text-sm text-gray-800 ">Mensal</label>
        <label htmlFor="toggle-count-switch" className="relative inline-block w-11 h-6 cursor-pointer">
          <input
            type="checkbox"
            id="toggle-count-switch"
            className="peer sr-only"
            checked={modo === 'anual'}
            onChange={handleToggle}
          />
          <span className="absolute inset-0 bg-gray-200 rounded-full transition-colors duration-200 ease-in-out peer-checked:bg-[#7F56D8] "></span>
          <span className="absolute top-1/2 start-0.5 -translate-y-1/2 size-5 bg-white rounded-full shadow-xs transition-transform duration-200 ease-in-out peer-checked:translate-x-full "></span>
        </label>
        <label htmlFor="toggle-count-switch" className="text-sm text-gray-800">Anual</label>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-3 lg:items-center border gap-4 mb-4 border-gray-100 rounded-xl ">
        {qndtChamados.map((nChamados, index) => (
          <div key={index} className="flex items-center justify-center h-fit rounded-sm">
            <div className="w-full p-6 bg-white">
              <p className="mb-3 poppins-regular text-gray-500 ">
                Chamados {nChamados.tipo}
              </p>
              <div className="flex flex-row gap-3">
                <svg className="w-7 h-7 text-gray-500  mb-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 5h-.7c.229-.467.349-.98.351-1.5a3.5 3.5 0 0 0-3.5-3.5c-1.717 0-3.215 1.2-4.331 2.481C8.4.842 6.949 0 5.5 0A3.5 3.5 0 0 0 2 3.5c.003.52.123 1.033.351 1.5H2a2 2 0 0 0-2 2v3a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a2 2 0 0 0-2-2ZM8.058 5H5.5a1.5 1.5 0 0 1 0-3c.9 0 2 .754 3.092 2.122-.219.337-.392.635-.534.878Zm6.1 0h-3.742c.933-1.368 2.371-3 3.739-3a1.5 1.5 0 0 1 0 3h.003ZM11 13H9v7h2v-7Zm-4 0H2v5a2 2 0 0 0 2 2h3v-7Zm6 0v7h3a2 2 0 0 0 2-2v-5h-5Z" />
                </svg>
                
               <h5 className="mb-2 text-2xl poppins-semibold tracking-tight text-gray-900 ">
                  <AnimatedNumber value={nChamados.qtd} duration={300} />
                </h5>
              </div>
 
              
              
            </div>
          </div>
        ))}
        <div className="relative">
  <button className="uppercase text-sm poppins-semibold inline-flex gap-2 items-center rounded-lg text-[#7F56D8] hover:bg-[#E6DAFF] px-3 py-2" onClick={() => setDropdownRelatorioOpen(prev => !prev)}>Gerar relatório
    <svg className="w-3.5 h-3.5 text-[#7F56D8] me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
      <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2Zm-3 15H4.828a1 1 0 0 1 0-2h6.238a1 1 0 0 1 0 2Zm0-4H4.828a1 1 0 0 1 0-2h6.238a1 1 0 1 1 0 2Z" />
      <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
    </svg>
  </button>

  {/* Mostrar o dropdown só quando aberto */}
  {dropdownChamadosStatusOpen && (
    <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-sm w-40">
      <ul className="py-2 text-sm text-gray-700">
        <li>
          <button onClick={() => { gerarCSV(); setDropdownChamadosStatusOpen(false);}} className="w-full text-left px-4 py-2 hover:bg-gray-100" >Exportar CSV
          </button>
        </li>
        <li>
          <button  onClick={() => { gerarRelatorio(); setDropdownChamadosStatusOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">Exportar PDF
          </button>
        </li>
      </ul>
    </div>
  )}
</div>
      </div>

                {/* <div className="grid grid-cols-3 gap-1 mb-4">
                    <div className="col-span-2 flex items-center justify-center h-fit mb-4 rounded-sm">
                        <div className="w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
                            <GraficoChamadosPorAno />
                        </div>
                    </div>
                    <div className="col-span-1 flex items-center justify-center h-fit mb-4 rounded-sm">
                        <div className="w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
                            <GraficoPorStatus />
                        </div>
                    </div>
                </div> */}
                <div className="flex items-center justify-center h-fit mt-6 mb-4 rounded-sm">
              <div className="w-full bg-white rounded-lg shadow-sm p-4 md:p-6">
                 <GraficoChamadosPorAno />
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
