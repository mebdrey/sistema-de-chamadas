// "use client";
// import React, { useState, useEffect } from 'react';
// import dynamic from 'next/dynamic';

// const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// export default function ChamadosPorPrioridade() {
//   // Estado inicial para as opções e séries do gráfico
//   const [chartOptions, setChartOptions] = useState({
//     chart: { type: "bar", toolbar: { show: false }, background: 'transparent' },
//     plotOptions: { bar: { horizontal: false, borderRadius: 6, columnWidth: '40%' } },
//     colors: ["#8b5cf6"],
//     dataLabels: { enabled: false },
//     xaxis: {
//       categories: [],
//       labels: { style: { colors: '#6b7280' } } // cinza claro
//     },
//     yaxis: {
//       title: '',
//       labels: { style: { colors: '#6b7280' } }
//     },
//     legend: {
//       show: true, // agora exibe
//       labels: {
//         colors: ['#6b7280'] // cor padrão (modo claro)
//       }
//     },
//     theme: { mode: 'light' }
//   });

//   const [chartSeries, setChartSeries] = useState([{ name: "Chamados", data: [] }]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch('http://localhost:8080/chamadosPorPrioridade', { credentials: 'include' });
//         if (!response.ok) throw new Error('Falha ao buscar dados');

//         const dataApi = await response.json();

//         const prioridades = dataApi.map(item => item.tipo);
//         const seriesData = dataApi.map(item => item.qtd);

//         // Atualiza as séries (barras do gráfico)
//         setChartSeries([{ name: "Chamados", data: seriesData }]);

//         // Atualiza as opções, especificamente os rótulos do eixo X
//         setChartOptions(prevOptions => ({
//           ...prevOptions,
//           xaxis: { ...prevOptions.xaxis, categories: prioridades }
//         }));
//       } catch (error) { console.error("Erro ao buscar dados para o gráfico:", error); }
//     };
//     fetchData();
//   }, []);



//   useEffect(() => {
//     //verifica o tema atual e atualiza o gráfico
//     const updateChartTheme = () => {
//       const isDarkMode = document.documentElement.classList.contains('dark');
//       const newMode = isDarkMode ? 'dark' : 'light';
//       const textColor = isDarkMode ? '#FFFFFF' : '#6b7280'; // Branco/cinza 

//       setChartOptions(prevOptions => ({
//         ...prevOptions,
//         theme: { mode: newMode },
//         xaxis: {
//           ...prevOptions.xaxis,
//           labels: { style: { colors: textColor } }
//         },
//         yaxis: {
//           ...prevOptions.yaxis,
//           labels: { style: { colors: textColor } }
//         },
//         legend: {
//           ...prevOptions.legend,
//            labels: { colors: [textColor, textColor, textColor] } // <- legendas dinâmicas
//         }
//       }));
//     };

//     // Chama a função uma vez quando o componente é montado
//     updateChartTheme();

//     // Cria um "observador" que fica monitorando mudanças na classe do <html>
//     const observer = new MutationObserver((mutations) => {
//       mutations.forEach(mutation => { if (mutation.attributeName === 'class') { updateChartTheme(); } });
//     });

//     observer.observe(document.documentElement, { attributes: true });

//     // Limpa o observador quando o componente for "desmontado" para evitar vazamento de memória
//     return () => observer.disconnect();
//   }, []); // O array vazio [] garante que este efeito rode apenas uma vez (na montagem)


//   return (
//     <div className="bg-white p-4 rounded-lg shadow h-full dark:bg-gray-800">
//       <h3 className="text-lg poppins-medium text-gray-600 mb-4  dark:text-white">Chamados por Prioridade</h3>
//       <div className="flex-1 w-full h-full">
//       <Chart options={chartOptions} series={chartSeries} type="bar"  height="100%" width="100%" />
//       </div>
//     </div>
//   );
// }

"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function ChamadosPorPrioridade() {
  // opções iniciais
  const [chartOptions, setChartOptions] = useState({
    chart: { type: "bar", toolbar: { show: false }, background: 'transparent' },
    plotOptions: { bar: { horizontal: false, borderRadius: 6, columnWidth: '40%' } },
    colors: ["#8b5cf6"],
    dataLabels: { enabled: false },
    xaxis: { categories: [], labels: { style: { colors: '#6b7280' } } },
    yaxis: { title: '', labels: { style: { colors: '#6b7280' } } },
    legend: { show: true, labels: { colors: ['#6b7280'] } },
    theme: { mode: 'light' }
  });

  const [chartSeries, setChartSeries] = useState([{ name: "Chamados", data: [] }]);

  // fetch dados
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8080/chamadosPorPrioridade', { credentials: 'include' });
        if (!response.ok) throw new Error('Falha ao buscar dados');
        const dataApi = await response.json();
        if (cancelled) return;
        const prioridades = dataApi.map(item => item.tipo);
        const seriesData = dataApi.map(item => item.qtd);
        setChartSeries([{ name: "Chamados", data: seriesData }]);
        setChartOptions(prev => ({ ...prev, xaxis: { ...prev.xaxis, categories: prioridades } }));
      } catch (error) {
        console.error("Erro ao buscar dados para o gráfico:", error);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  // força resize quando as séries mudam (ajuda Apex a recalcular)
  useEffect(() => {
    if (!chartSeries || !chartSeries[0] || chartSeries[0].data.length === 0) return;
    const t = setTimeout(() => {
      // dispara resize global que o Apex escuta e recalcula
      window.dispatchEvent(new Event('resize'));
    }, 120); // pequeno delay para permitir que o layout seja aplicado
    return () => clearTimeout(t);
  }, [chartSeries]);

  // tema dinâmico (mantive sua lógica)
  useEffect(() => {
    const updateChartTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      const newMode = isDarkMode ? 'dark' : 'light';
      const textColor = isDarkMode ? '#FFFFFF' : '#6b7280';
      setChartOptions(prev => ({
        ...prev,
        theme: { mode: newMode },
        xaxis: { ...prev.xaxis, labels: { style: { colors: textColor } } },
        yaxis: { ...prev.yaxis, labels: { style: { colors: textColor } } },
        legend: { ...prev.legend, labels: { colors: [textColor] } }
      }));
    };
    updateChartTheme();
    const observer = new MutationObserver(muts => {
      muts.forEach(m => { if (m.attributeName === 'class') updateChartTheme(); });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return (
    // IMPORTANT: root now is flex column + h-full so internal flex-1 works
    <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800 h-full flex flex-col">
      <h3 className="text-lg poppins-medium text-gray-600 mb-4 dark:text-white">
        Chamados por Prioridade
      </h3>

      {/* wrapper que ocupa o restante do card; min-h garante que não fique tiny */}
      <div className="flex-1 w-full h-full min-h-[260px]">
        <Chart
          options={chartOptions}
          series={chartSeries}
          type="bar"
          height="100%"
          width="100%"
        />
      </div>
    </div>
  );
}
