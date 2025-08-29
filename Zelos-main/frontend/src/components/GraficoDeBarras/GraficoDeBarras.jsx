"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function ChamadosPorPrioridade() {
  // Estado inicial para as opções e séries do gráfico
  const [chartOptions, setChartOptions] = useState({
    chart: { type: "bar", toolbar: { show: false }, background: 'transparent' },
    plotOptions: { bar: { horizontal: false, borderRadius: 6, columnWidth: '40%' } },
    colors: ["#a78bfa"],
    dataLabels: { enabled: false },
    xaxis: {
      categories: [],
      labels: { style: { colors: '#6b7280' } } // cinza claro
    },
    yaxis: {
      title: '',
      labels: { style: { colors: '#6b7280' } }
    },
    legend: {
      show: true, // agora exibe
      labels: {
        colors: ['#6b7280'] // cor padrão (modo claro)
      }
    },
    theme: { mode: 'light' }
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
          xaxis: { ...prevOptions.xaxis, categories: prioridades }
        }));
      } catch (error) { console.error("Erro ao buscar dados para o gráfico:", error); }
    };
    fetchData();
  }, []);



  useEffect(() => {
    //verifica o tema atual e atualiza o gráfico
    const updateChartTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      const newMode = isDarkMode ? 'dark' : 'light';
      const textColor = isDarkMode ? '#FFFFFF' : '#6b7280'; // Branco/cinza 

      setChartOptions(prevOptions => ({
        ...prevOptions,
        theme: { mode: newMode },
        xaxis: {
          ...prevOptions.xaxis,
          labels: { style: { colors: textColor } }
        },
        yaxis: {
          ...prevOptions.yaxis,
          labels: { style: { colors: textColor } }
        },
        legend: {
          ...prevOptions.legend,
           labels: { colors: [textColor, textColor, textColor] } // <- legendas dinâmicas
        }
      }));
    };

    // Chama a função uma vez quando o componente é montado
    updateChartTheme();

    // Cria um "observador" que fica monitorando mudanças na classe do <html>
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => { if (mutation.attributeName === 'class') { updateChartTheme(); } });
    });

    observer.observe(document.documentElement, { attributes: true });

    // Limpa o observador quando o componente for "desmontado" para evitar vazamento de memória
    return () => observer.disconnect();
  }, []); // O array vazio [] garante que este efeito rode apenas uma vez (na montagem)


  return (
    <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
      <h3 className="text-lg poppins-medium text-gray-600 mb-4  dark:text-white">Chamados por Prioridade</h3>
      <Chart options={chartOptions} series={chartSeries} type="bar" height={500} />
    </div>
  );
}