"use client"
import { useEffect, useState, useRef } from "react";
import './dashboard.css';
import ChamadosPorPrioridade from "@/components/GraficoDeBarras/GraficoDeBarras";
import KpiSla from "@/components/Kpi/kpi";
import GraficoChamadosPorAno from "@/components/GraficoMes/GraficoChamadosPorMes";
import AnimatedNumber from '@/components/AnimatedValue/AnimatedValue';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import GraficoFuncionarios from '@/components/GraficoFuncionarios/GraficoFuncionarios';


export default function admDashboard() {
  const [modo, setModo] = useState('mensal'); // 'mensal' ou 'anual'
  const [qndtChamados, setQndtChamados] = useState([]);
  const [dropdownChamadosStatusOpen, setDropdownChamadosStatusOpen] = useState(false);
  const [setorForm, setSetorForm] = useState({ titulo: '', descricao: '' });
  const [setores, setSetores] = useState([]);
  const API = { pool: '/pool' };

  // Função para buscar dados do backend
  const fetchChamados = async () => {
    try {
      const res = await fetch(`http://localhost:8080/contar-por-status?modo=${modo}`, { credentials: 'include' });
      const data = await res.json();
      setQndtChamados(data);
    } catch (error) { console.error('Erro ao buscar dados dos chamados:', error); }
  };

  useEffect(() => { fetchChamados(); }, [modo]);

  // Função para alternar entre mensal/anual
  const handleToggle = () => { setModo((prev) => (prev === 'mensal' ? 'anual' : 'mensal')); };

  // ---------------- chamado por status (pendente, am andamento, concluido) -------------------
  // CSV
  const exportarCsvChamadosPorStatus = () => {
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    const modoTexto = modo === "mensal" ? "Mensal" : "Anual";

    // Função para capitalizar a primeira letra
    const capitalizar = (str) => {
      if (!str) return "";
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const cabecalhoInfo = [`Relatório de Chamados por Status`, `Gerado em: ${dataAtual}`, `Modo: ${modoTexto}`, ""];// Cabeçalho informativo
    const cabecalhoTabela = ["Tipo de Chamado", "Quantidade"];// Cabeçalho da tabela
    const linhasTabela = qndtChamados.map((item) => [capitalizar(item.tipo.normalize("NFD").replace(/[\u0300-\u036f]/g, "")), item.qtd]);// Linhas da tabela com nomes capitalizados
    const separador = ";";
    const conteudoCsv = [...cabecalhoInfo, cabecalhoTabela.join(separador), ...linhasTabela.map((linha) => linha.join(separador))].join("\n");// Junta tudo (cabeçalho + tabela)

    // Para resolver problema de acentuação → adiciona BOM no início
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + conteudoCsv], { type: "text/csv;charset=utf-8;" });

    // Cria link temporário e força download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio_chamados_status_${modoTexto.toLowerCase()}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }; // Libera memória

  // PDF
  const gerarRelatorioChamadoPorStatus = async () => {
    const dataHoraAtual = new Date().toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const modoTexto = modo === "mensal" ? "Mensal" : "Anual";
    const totalChamados = qndtChamados.reduce((acc, item) => acc + item.qtd, 0);
    const statusMaisFrequente = qndtChamados.reduce((prev, curr) => curr.qtd > prev.qtd ? curr : prev);// Pega o status mais recorrente
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    // doc.text("Relatório de Chamados", pageWidth / 2, y + h + 10, { align: "center" });

    // --- TÍTULO ---
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("Relatório de Chamados", 105, 20, { align: "center" });

    // --- SUBTÍTULO ---
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(`Quantidade de chamados ${modoTexto}`, 105, 28, { align: "center" });

    // --- INFORMAÇÕES ---
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text(`Gerado em: ${dataHoraAtual}`, 14, 45);
    doc.text(`Total de Chamados: ${totalChamados}`, 14, 59);

    // --- TABELA ---
    autoTable(doc, {
      startY: 70,
      head: [["Tipo de Chamado", "Quantidade"]],
      body: qndtChamados.map(item => [item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1).toLowerCase(), item.qtd]),
      styles: { fontSize: 11, cellPadding: 5, halign: "center", valign: "middle" },
      headStyles: { fillColor: [127, 86, 216], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 240, 255] }, // Roxinho claro
      bodyStyles: { textColor: [50, 50, 50] }
    });

    // --- RESUMO AUTOMÁTICO ---
    const finalY = doc.lastAutoTable.finalY || 80; // pega o fim da tabela
    const marginTop = 20; // Espaçamento extra entre tabela e título do resumo
    const margin = 14;
    const maxWidth = pageWidth - margin * 2;

    doc.setFontSize(15);
    doc.setTextColor(40, 40, 40);
    doc.setFont(undefined, "bold");
    doc.text("Análise Geral:", 14, finalY + marginTop);
    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.setTextColor(0, 0, 0);

    doc.text(`Neste período foram registrados ${totalChamados} chamados. O status mais recorrente foi "${statusMaisFrequente.tipo}" com ${statusMaisFrequente.qtd} ocorrências, representando aproximadamente ${Math.round((statusMaisFrequente.qtd / totalChamados) * 100)}% do total. 
Esse resultado demonstra uma tendência relevante no comportamento dos chamados, permitindo identificar pontos de atenção e possíveis gargalos no atendimento. Além disso, a distribuição observada pode auxiliar na definição de prioridades e no planejamento de recursos da equipe responsável.`,
      margin, finalY + marginTop + 10, { maxWidth, align: 'justify' });

    // --- RODAPÉ ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`Página ${i} de ${pageCount}`, 200, 290, { align: "right" });
      doc.text("Relatório gerado automaticamente pelo sistema", 14, 290);
    }
    // --- SALVAR ---
    doc.save(`relatorio_chamados_status_${modoTexto.toLowerCase()}.pdf`);
  };

  return (
    <div className="p-4 w-full dark:bg-gray-900 pb-10">
      <div className="p-4 mt-14">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:items-center gap-4 mb-4 ">
          {qndtChamados.map((nChamados, index) => (
            <div key={index} className="flex items-center justify-center h-fit ">
              <div className="w-full p-6 border border-gray-100 rounded-xl bg-white dark:bg-gray-800 dark:border dark:border-gray-700">
                <p className="mb-3 poppins-regular text-gray-500 ">Chamados {nChamados.tipo}</p>
                <div className="flex flex-row items-center gap-3">
                  <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.29235 1V4.0625M7.29235 11.9375V15M14.4977 1H5.49325C2.04452 1 1.08104 1.805 1 4.9375C2.73787 4.9375 4.14257 6.31125 4.14257 8C4.14257 9.68875 2.73787 11.0538 1 11.0625C1.08104 14.195 2.04452 15 5.49325 15H14.4977C18.0995 15 19 14.125 19 10.625V5.375C19 1.875 18.0995 1 14.4977 1Z" stroke="#6A7282" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12.7729 5.55297L13.3412 6.6988C13.3962 6.8088 13.5062 6.8913 13.6254 6.90964L14.8904 7.09297C15.202 7.1388 15.3304 7.5238 15.1012 7.7438L14.1845 8.63297C14.0929 8.71547 14.0562 8.8438 14.0745 8.97214L14.2945 10.228C14.3495 10.5396 14.0195 10.778 13.7445 10.6313L12.617 10.0355C12.5613 10.0083 12.5002 9.99422 12.4383 9.99422C12.3763 9.99422 12.3152 10.0083 12.2595 10.0355L11.132 10.6313C10.8479 10.778 10.527 10.5396 10.582 10.228L10.802 8.97214C10.8122 8.91092 10.8076 8.84815 10.7884 8.78912C10.7693 8.73009 10.7362 8.67653 10.692 8.63297L9.78452 7.7438C9.73346 7.69418 9.69732 7.63126 9.68017 7.56216C9.66302 7.49306 9.66556 7.42054 9.68751 7.35281C9.70945 7.28508 9.74991 7.22484 9.80432 7.17892C9.85872 7.133 9.9249 7.10322 9.99536 7.09297L11.2604 6.90964C11.3887 6.8913 11.4895 6.81797 11.5445 6.6988L12.1037 5.55297C12.232 5.2688 12.6354 5.2688 12.7729 5.55297Z" stroke="#6A7282" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h5 className="text-2xl poppins-semibold tracking-tight text-gray-900 dark:text-gray-400"><AnimatedNumber value={nChamados.qtd} duration={300} /></h5>
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-content mt-5 mb-4 gap-4 flex-wrap">
            {/* Botão com dropdown */}
            <div className="relative">
              <button className="uppercase text-sm poppins-semibold inline-flex gap-2 items-center rounded-lg text-[#7F56D8] hover:bg-[#E6DAFF] dark:hover:bg-gray-700 px-3 py-2 hover:cursor-pointer" onClick={() => setDropdownChamadosStatusOpen(prev => !prev)}>Gerar relatório <svg className="w-3.5 h-3.5 text-[#7F56D8] me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20"><path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2Zm-3 15H4.828a1 1 0 0 1 0-2h6.238a1 1 0 0 1 0 2Zm0-4H4.828a1 1 0 0 1 0-2h6.238a1 1 0 1 1 0 2Z" /><path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" /></svg>
              </button>
              {dropdownChamadosStatusOpen && (
                <div className="absolute z-10 mt-2 bg-white border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm w-40 dark:bg-gray-800">
                  <ul className="py-2 text-sm text-gray-700 dark:text-gray-400">
                    <li><button onClick={() => { exportarCsvChamadosPorStatus(); setDropdownChamadosStatusOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 hover:cursor-pointer dark:hover:bg-gray-700">Exportar CSV</button></li>
                    <li><button onClick={() => { gerarRelatorioChamadoPorStatus(); setDropdownChamadosStatusOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 hover:cursor-pointer dark:hover:bg-gray-700">Exportar PDF</button></li>
                  </ul>
                </div>
              )}
            </div>
            {/* Toggle */}
            <div className="flex items-left gap-x-3">
              <label htmlFor="toggle-count-switch" className="text-sm text-gray-800 dark:text-white">Mensal</label>
              <label htmlFor="toggle-count-switch" className="relative inline-block w-11 h-6 cursor-pointer">
                <input type="checkbox" id="toggle-count-switch" className="peer sr-only" checked={modo === 'anual'} onChange={handleToggle} />
                <span className="absolute inset-0 bg-gray-200 rounded-full transition-colors duration-200 ease-in-out peer-checked:bg-[#7F56D8] dark:bg-gray-800"></span>
                <span className="absolute top-1/2 start-0.5 -translate-y-1/2 size-5 bg-white rounded-full shadow-xs transition-transform duration-200 ease-in-out peer-checked:translate-x-full"></span>
              </label>
              <label htmlFor="toggle-count-switch" className="text-sm text-gray-800 dark:text-white">Anual</label>
            </div>
          </div>
        </div>
      </div>
      { /*CARDS DA QUANTIDADE DE CHAMADOS p mes*/}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-start">
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 dark:bg-gray-800 dark:border dark:border-gray-600"><GraficoChamadosPorAno /></div>
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 dark:bg-gray-800 dark:border dark:border-gray-600"><KpiSla /></div>
      </div> */}
{/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 md:items-stretch items-start">
  <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 dark:bg-gray-800 dark:border dark:border-gray-600 flex flex-col">

    <div className="flex-1">
      <GraficoChamadosPorAno />
    </div>
  </div>

  <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 dark:bg-gray-800 dark:border dark:border-gray-600 flex flex-col">
    <div className="flex-1">
      <KpiSla />
    </div>
  </div>
</div> */}


      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 md:items-center items-start">
        <div className="col-span-1 bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 g-700 dark:bg-gray-800 dark:border dark:border-gray-600">
          <ChamadosPorPrioridade />
        </div>
        <div className="col-span-1 flex items-center justify-start mb-4 rounded-sm dark:bg-gray-800 dark:border dark:border-gray-600">
          <GraficoFuncionarios />
        </div>
      </div> */}
      

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 md:items-stretch items-start">
  <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 dark:bg-gray-800 dark:border dark:border-gray-600 flex flex-col md:min-h-[360px]">
    <div className="flex-1">
      <GraficoChamadosPorAno />
    </div>
  </div>

  <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 dark:bg-gray-800 dark:border dark:border-gray-600 flex flex-col md:min-h-[360px]">
    <div className="flex-1">
      <KpiSla />
    </div>
  </div>
</div>

{/* próximo bloco */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 md:items-stretch items-start">
  <div className="col-span-1 bg-white rounded-lg shadow-sm p-4 md:p-6 dark:bg-gray-800 dark:border dark:border-gray-600 flex flex-col md:min-h-[360px]">
    <div className="flex-1">
      <ChamadosPorPrioridade />
    </div>
  </div>

  <div className="col-span-1 bg-white rounded-lg shadow-sm p-4 md:p-6 dark:bg-gray-800 dark:border dark:border-gray-600 flex flex-col md:min-h-[360px]">
    <div className="flex-1">
      <GraficoFuncionarios />
    </div>
  </div>
</div>

    </div>
  );
}
