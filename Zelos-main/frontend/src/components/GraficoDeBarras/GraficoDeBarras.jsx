// import Chart from "react-apexcharts";

// export default function ChamadosPorPrioridade() {
//   const options = {
//     chart: { type: "bar" },
//     plotOptions: {
//       bar: {
//         horizontal: false,
//         borderRadius: 6,
//         columnWidth: '40%'
//       }
//     },
//     colors: ["#a78bfa", "#60a5fa", "#34d399"], // Roxo, Azul, Verde
//     xaxis: {
//       categories: ["Alta", "Média", "Baixa", "none"]
//     },
//     legend: { show: false }
//   };

//   const series = [
//     {
//       name: "Chamados",
//       data: [40, 70, 25, 35] // qtd de chamados por prioridade
//     }
//   ];

//   return <Chart options={options} series={series} type="bar" height={500}  />;
// }

"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// É uma boa prática carregar bibliotecas de gráficos dinamicamente
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function ChamadosPorPrioridade() {
  // 2. Estado para guardar os dados que virão da API.
  // Começa com valores vazios para não dar erro.
  const [chartData, setChartData] = useState({
    series: [{ name: "Chamados", data: [] }],
    categories: []
  });

  // 3. Hook para buscar os dados da API quando o componente carregar.
  useEffect(() => {
    const fetchData = async () => {
      try {
        // A URL da sua rota no backend
        const response = await fetch('http://localhost:8080/chamadosPorPrioridade', {
          credentials: 'include' // Importante para enviar o cookie de autenticação
        });

        if (!response.ok) { throw new Error('Falha na resposta da API'); }

        const dataFromApi = await response.json();
        // dataFromApi terá o formato: [{ tipo: 'alta', qtd: 40 }, { tipo: 'média', qtd: 70 }, ...]

        // Prepara os dados para o formato do gráfico
        const categories = dataFromApi.map(item => item.tipo); // Ex: ['Alta', 'Média', 'Baixa']
        const seriesData = dataFromApi.map(item => item.qtd);   // Ex: [40, 70, 25]

        // Atualiza o estado com os dados recebidos
        setChartData({
          series: [{ name: "Chamados", data: seriesData }],
          categories: categories
        });

      } catch (error) {
        console.error("Erro ao buscar dados para o gráfico:", error);
      }
    };

    fetchData();
  }, []); // O array vazio [] faz com que este código rode apenas uma vez

  // Opções de configuração do gráfico. As categorias serão injetadas dinamicamente.
  const options = {
    chart: {
      type: "bar",
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 6,
        columnWidth: '40%'
      }
    },
    colors: ["#a78bfa", "#60a5fa", "#34d399"], // Roxo, Azul, Verde
    dataLabels: { enabled: false,},
    xaxis: { categories: chartData.categories, }, // As categorias virão do nosso estado (chartData.categories)
    yaxis: { title: ''},
    legend: { show: false }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg poppins-medium text-gray-600 mb-4">Chamados por Prioridade</h3>
        <Chart options={options} series={chartData.series} type="bar" height={500} />
    </div>
  );
}