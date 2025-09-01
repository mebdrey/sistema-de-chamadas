// "use client";
// import React, { useState, useEffect } from "react";
// import dynamic from "next/dynamic";

// const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// export default function KpiSla() {
//   const [chartOptions, setChartOptions] = useState({
//     chart: { type: "radialBar", background: "transparent" },
//     plotOptions: {
//       radialBar: {
//         hollow: { size: "70%" },
//         dataLabels: {
//           name: { show: true, fontSize: "16px", color: "#6b7280" }, // cinza no claro
//           value: { fontSize: "22px", color: "#7f56d8" },
//         },
//       },
//     },
//     labels: ["SLA cumprido"],
//     colors: ["#7f56d8"],
//     theme: { mode: "light" }, 
//   });

//   useEffect(() => {
//     const updateChartTheme = () => {
//       const isDarkMode = document.documentElement.classList.contains("dark");
//       const newMode = isDarkMode ? "dark" : "light";
//       const labelColor = isDarkMode ? "#FFFFFF" : "#6b7280"; // branco /cinza
//       const valueColor = isDarkMode ? "#FFFFFF" : "#7f56d8"; // cor do valor (%)

//       setChartOptions((prevOptions) => ({
//         ...prevOptions,
//         chart: {
//         ...prevOptions.chart,
//         foreColor: valueColor, // <-- garante que o texto do valor use a cor certa
//       },
//         theme: { mode: newMode },
//         plotOptions: {
//           ...prevOptions.plotOptions,
//           radialBar: {
//             ...prevOptions.plotOptions.radialBar,
//             dataLabels: {
//               ...prevOptions.plotOptions.radialBar.dataLabels,
//               name: {
//                 ...prevOptions.plotOptions.radialBar.dataLabels.name,
//                 color: labelColor,
//               },
//               value: {
//                 ...prevOptions.plotOptions.radialBar.dataLabels.value,
//                 color: valueColor, // <-- agora muda dinamicamente
//               },
//             },
//           },
//         },
//       }));
//     };

//     updateChartTheme();

//     const observer = new MutationObserver(() => updateChartTheme());
//     observer.observe(document.documentElement, {
//       attributes: true,
//       attributeFilter: ["class"],
//     });

//     return () => observer.disconnect();
//   }, []);

//   const series = [76]; // % de SLA cumprido

//   return (
//     <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
//       <h3 className="text-lg poppins-medium text-gray-600 mb-4 dark:text-white">
//         SLA Cumprido
//       </h3>
//       <Chart options={chartOptions} series={series} type="radialBar" height={340} />
//     </div>
//   );
// }
"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function KpiSla() {
  const [series, setSeries] = useState([0, 0]);
  const [chartOptions, setChartOptions] = useState({
    chart: { type: "donut", background: "transparent" },
    labels: ["Dentro do SLA", "Fora do SLA"],
    colors: ["#22c55e", "#ef4444"], // verde e vermelho
    legend: { position: "bottom" },
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        return `${val.toFixed(1)}%`;
      },
    },    
    tooltip: {
      y: {
        formatter: (val) => `${val} chamados`,
      },
    },
  });

  useEffect(() => {
    async function fetchSla() {
      try {
        const res = await fetch("http://localhost:8080/indicadores/sla", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
  
        // garante que os valores existem
        const dentro = data?.dentro ?? 0;
        const fora = data?.fora ?? 0;
  
        setSeries([dentro, fora]); 
      } catch (err) {
        console.error("Erro ao carregar SLA:", err);
        setSeries([0, 0]); // fallback seguro
      }
    }
    fetchSla();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
      <h3 className="text-lg poppins-medium text-gray-600 mb-4 dark:text-white">
        Cumprimento de SLA
      </h3>
      <Chart
        options={chartOptions}
        series={series}
        type="donut"
        height={340}
      />
    </div>
  );
}
