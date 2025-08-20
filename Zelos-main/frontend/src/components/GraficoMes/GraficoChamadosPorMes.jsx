"use client"
import React, { useEffect, useState, useMemo, useRef } from "react";
import dynamic from 'next/dynamic';
import { ChevronDown } from 'lucide-react';
import { saveAs } from 'file-saver';
import '@/app/globals.css'

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
  colors: ['#7F56D8']
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
    color: '#7F56D8',
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
      [],
      ['Mês', 'Quantidade de Chamados'],
      ...categorias.map((mes, i) => [mes, dados[i]])
    ];

    const csvContent = linhas
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'relatorio-chamados.csv');
  };

  // pdf
const gerarRelatorio = async () => {
  // cria cópia segura dos dados
  const payloadSeries = [...series.map(s => ({ ...s, data: [...s.data] }))];
  const payloadOptions = JSON.parse(JSON.stringify(options)); // clone profundo

  const res = await fetch("http://localhost:8080/relatorio-grafico", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify({
      options: payloadOptions,
      series: payloadSeries,
      prioridade: prioridadeSelecionada
    }),
  });

  if (!res.ok) {
    console.error("Erro ao gerar relatório:", res.statusText);
    return;
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "grafico-chamados-por-mes.pdf";
  a.click();
};

  return (
    <>
      <div className="flex justify-between">
        <div>
          <p className="text-base poppins-regular text-gray-500">
            Quantidade de chamados neste ano
          </p>
        </div>
      </div>

      <div id="grafico-pdf" className="bg-white p-4 rounded-lg shadow">
  <ApexChart
    options={options}
    series={series}
    type="area"
    height={200}
  />
</div>


      <div className="grid grid-cols-1 border-t border-gray-200 pt-5">
        <div className="flex justify-between items-center">
          <div className="relative">
            <button onClick={() => setDropdownPrioridadeOpen(!dropdownPrioridadeOpen)} className="text-sm gap-2 poppins-medium text-gray-500 hover:text-gray-900 inline-flex items-center">
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
              ) : (
                <>
                  Selecionar prioridade
                  <ChevronDown className="w-4 h-4 ml-1.5" />
                </>
              )}
            </button>

            {dropdownPrioridadeOpen && (
              <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-sm w-44">
                <ul className="py-2 text-sm text-gray-700">
                  {['Alta', 'Média', 'Baixa'].map((label) => (
                    <li key={label}>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => {
                          setPrioridadeSelecionada(label);
                          setDropdownPrioridadeOpen(false);
                        }}
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

<div className="relative">
  <button className="uppercase text-sm poppins-semibold inline-flex gap-2 items-center rounded-lg text-[#7F56D8] hover:bg-[#E6DAFF] px-3 py-2" onClick={() => setDropdownRelatorioOpen(prev => !prev)}>Gerar relatório
    <svg className="w-3.5 h-3.5 text-[#7F56D8] me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
      <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2Zm-3 15H4.828a1 1 0 0 1 0-2h6.238a1 1 0 0 1 0 2Zm0-4H4.828a1 1 0 0 1 0-2h6.238a1 1 0 1 1 0 2Z" />
      <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
    </svg>
  </button>

  {/* Mostrar o dropdown só quando aberto */}
  {dropdownRelatorioOpen && (
    <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-sm w-40">
      <ul className="py-2 text-sm text-gray-700">
        <li>
          <button onClick={() => { gerarCSV(); setDropdownRelatorioOpen(false);}} className="w-full text-left px-4 py-2 hover:bg-gray-100" >Exportar CSV
          </button>
        </li>
        <li>
          <button  onClick={() => { gerarRelatorio(); setDropdownRelatorioOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">Exportar PDF
          </button>
        </li>
      </ul>
    </div>
  )}
</div>


        </div>
      </div>
    </>
  );
}
