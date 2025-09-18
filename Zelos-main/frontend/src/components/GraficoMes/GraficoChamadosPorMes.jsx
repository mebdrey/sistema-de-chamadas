"use client"
import React, { useEffect, useState, useMemo, useRef } from "react";
import dynamic from 'next/dynamic';
import { ChevronDown } from 'lucide-react';
import { saveAs } from 'file-saver';
import '@/app/globals.css'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";



const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function GraficoChamadosPorAno() {
  const [dropdownPrioridadeOpen, setDropdownPrioridadeOpen] = useState(false);
  const [dropdownRelatorioOpen, setDropdownRelatorioOpen] = useState(false);
  const [prioridadeSelecionada, setPrioridadeSelecionada] = useState(null);
  const [dados, setDados] = useState(Array(12).fill(0));
  const chartRef = useRef(null);

  const categorias = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  useEffect(() => {
    async function fetchDados() {
      try {
        const query = prioridadeSelecionada ? `?prioridade=${prioridadeSelecionada.toLowerCase()}` : '';
        const res = await fetch(`http://localhost:8080/chamados-por-mes${query}`, { credentials: 'include' });
        const json = await res.json();

        console.log("Resposta da API:", json);

        const chamadosPorMes = Array(12).fill(0);
        const dados = Array.isArray(json) ? json : json.dados; // ajuste aqui

        dados.forEach(item => {
          chamadosPorMes[item.mes - 1] = item.total;
        });

        setDados(chamadosPorMes);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      }
    }

    fetchDados();
  }, [prioridadeSelecionada]);


  const options = {
    chart: {
      id: "grafico-chamados",
      height: '100%',
      type: 'area',
      fontFamily: 'Poppins, sans-serif',
      dropShadow: { enabled: false },
      toolbar: { show: false },
    },
    tooltip: {
      enabled: true,
      x: { show: false },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.55,
        opacityTo: 0,
        stops: [0, 100],
      },
    },
    stroke: {
      curve: 'smooth',
      width: 6,
      colors: ['#8b5cf6']
    },
    dataLabels: { enabled: false },
    grid: {
      show: false,
      strokeDashArray: 4,
      padding: { left: 2, right: 2, top: 0 },
    },
    xaxis: {
      categories: categorias,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { show: false },
  };

  const series = useMemo(() => {
    return dados && dados.length > 0 ? [{
      name: 'Chamados',
      data: [...dados],
      color: '#8b5cf6',
    }] : [];
  }, [dados]);

  // gera csv
  const gerarCSV = () => {
    const prioridade = prioridadeSelecionada || 'Todas';
    const dataAtual = new Date().toLocaleString('pt-BR');

    const linhas = [
      ['Relatório de Chamados por Mês'],
      ['Prioridade:', prioridade],
      ['Gerado em:', dataAtual],
      [], // linha em branco
      ['Mês', 'Quantidade de Chamados'],
      ...categorias.map((mes, i) => [mes, dados[i]])
    ];

    // usa ponto e vírgula para ficar igual ao Excel
    const csvContent = linhas
      .map(row => row.join(';'))
      .join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'relatorio-chamados.csv');
  };

  // pdf
  const gerarPDF = async () => {
    const prioridade = prioridadeSelecionada || "Todas";
    const dataAtual = new Date().toLocaleString("pt-BR");
    const totalChamados = dados.reduce((acc, qtd) => acc + qtd, 0);

    const doc = new jsPDF();

    // --- TÍTULO ---
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Relatório de Chamados por Mês", 105, 40, { align: "center" });

    // --- SUBTÍTULO ---
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`Prioridade: ${prioridade}`, 105, 48, { align: "center" });
    doc.text(`Gerado em: ${dataAtual}`, 105, 54, { align: "center" });

    // --- INFO EXTRA ---
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text(`Total de Chamados: ${totalChamados}`, 14, 65);

    // --- TABELA ---
    const linhas = categorias.map((mes, i) => [mes, dados[i]]);
    autoTable(doc, {
      startY: 75,
      head: [["Mês", "Quantidade de Chamados"]],
      body: linhas,
      styles: {
        fontSize: 11,
        cellPadding: 5,
        halign: "center",
        valign: "middle",
      },
      headStyles: {
        fillColor: [127, 86, 216],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 240, 255], },
      bodyStyles: { textColor: [50, 50, 50], },
    });

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
    doc.save("relatorio-chamados-por-mes.pdf");
  };

  return (
    <>
      {/* <div className="flex justify-between">
        <div><p className="text-2xl font-bold text-gray-900 dark:text-white"> Quantidade de chamados neste ano</p>
        </div>
        </div> */}
        <div className="h-full flex flex-col justify-between">
        <div className="flex items-start">
          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center me-3">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-500 dark:text-gray-400">
  <path fillRule="evenodd" d="M5.478 5.559A1.5 1.5 0 0 1 6.912 4.5H9A.75.75 0 0 0 9 3H6.912a3 3 0 0 0-2.868 2.118l-2.411 7.838a3 3 0 0 0-.133.882V18a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-4.162c0-.299-.045-.596-.133-.882l-2.412-7.838A3 3 0 0 0 17.088 3H15a.75.75 0 0 0 0 1.5h2.088a1.5 1.5 0 0 1 1.434 1.059l2.213 7.191H17.89a3 3 0 0 0-2.684 1.658l-.256.513a1.5 1.5 0 0 1-1.342.829h-3.218a1.5 1.5 0 0 1-1.342-.83l-.256-.512a3 3 0 0 0-2.684-1.658H3.265l2.213-7.191Z" clipRule="evenodd" />
  <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v6.44l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 1.06-1.06l1.72 1.72V3a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
</svg>

          </div>
          <div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Quantidade de chamados neste ano</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">Número de solicitações registradas durante o ano corrente.</p>
      </div>
      </div>

      <div>
      <div id="grafico-pdf" className="bg-white p-4 rounded-lg dark:bg-gray-800">
        <ApexChart options={options} series={series} type="area"  height="100%" />
      </div>
      <div className="grid grid-cols-1 border-t border-gray-200 pt-5">
        <div className="flex justify-between items-center">
          <div className="relative">
            <button onClick={() => setDropdownPrioridadeOpen(!dropdownPrioridadeOpen)} className="text-sm gap-2 poppins-medium text-gray-500 hover:text-gray-900 inline-flex items-center dark:text-gray-400 dark:hover:text-white">
              {prioridadeSelecionada ? (
                <span className="inline-flex items-center gap-1">
                  Prioridade {prioridadeSelecionada}
                  <svg className="w-3 h-3 text-gray-400 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation(); // evita que o botão principal abra o dropdown
                      setPrioridadeSelecionada(null);
                    }} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                  </svg>
                </span>
              ) : (<> Selecionar prioridade <ChevronDown className="w-4 h-4 ml-1.5 hover:cursor-pointer" /></>)}
            </button>
            {dropdownPrioridadeOpen && (
              <div className="absolute z-10 mt-2 bg-white border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm w-44 dark:bg-gray-800">
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-400">
                  {['Alta', 'Média', 'Baixa'].map((label) => (
                    <li key={label}>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => { setPrioridadeSelecionada(label); setDropdownPrioridadeOpen(false); }}>
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="relative">
            <button className="uppercase text-sm poppins-semibold inline-flex gap-2 items-center rounded-lg text-violet-500 hover:bg-[#E6DAFF] px-3 py-2 hover:cursor-pointer dark:hover:bg-gray-700" onClick={() => setDropdownRelatorioOpen(prev => !prev)}>Gerar relatório
              <svg className="w-3.5 h-3.5 text-violet-500 me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
                <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2Zm-3 15H4.828a1 1 0 0 1 0-2h6.238a1 1 0 0 1 0 2Zm0-4H4.828a1 1 0 0 1 0-2h6.238a1 1 0 1 1 0 2Z" />
                <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
              </svg>
            </button>

            {/* Mostrar o dropdown só quando aberto */}
            {dropdownRelatorioOpen && (
              <div className="absolute z-10 mt-2 bg-white border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm w-40 dark:bg-gray-800">
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-400">
                  <li>
                    <button onClick={() => { gerarCSV(); setDropdownRelatorioOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 hover:cursor-pointer dark:hover:bg-gray-700" >Exportar CSV
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { gerarPDF(); setDropdownRelatorioOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 hover:cursor-pointer dark:hover:bg-gray-700">Exportar PDF
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
      </div>
    </>
  );
}
