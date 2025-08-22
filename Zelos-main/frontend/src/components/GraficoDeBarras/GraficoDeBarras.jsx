"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function ChamadosPorPrioridade() {
  // Estado inicial para as opções e séries do gráfico
  const [chartOptions, setChartOptions] = useState({
    chart: { type: "bar", toolbar: { show: false }},
    plotOptions: { bar: { horizontal: false, borderRadius: 6, columnWidth: '40%' }},
    colors: ["#a78bfa"],
    dataLabels: { enabled: false },
    xaxis: {categories: []}, // Será preenchido pela API
    yaxis: { title: '' },
    legend: { show: false }
  });

  const [chartSeries, setChartSeries] = useState([{ name: "Chamados", data: [] }]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8080/chamadosPorPrioridade', { credentials: 'include' });
        if (!response.ok) throw new Error('Falha ao buscar dados');
        
        const dataApi = await response.json();

        const prioridades = dataApi.map(item => item.tipo); 
        const seriesData = dataApi.map(item => item.qtd);  

        // Atualiza as séries (barras do gráfico)
        setChartSeries([{ name: "Chamados", data: seriesData }]);
        
        // Atualiza as opções, especificamente os rótulos do eixo X
        setChartOptions(prevOptions => ({
          ...prevOptions,
          xaxis: { ...prevOptions.xaxis, categories: prioridades  }
        }));

      } catch (error) { console.error("Erro ao buscar dados para o gráfico:", error);}
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg poppins-medium text-gray-600 mb-4">Chamados por Prioridade</h3>
      <Chart options={chartOptions} series={chartSeries} type="bar" height={500} />
    </div>
  );
}