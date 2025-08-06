"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// ApexCharts precisa ser importado dinamicamente para evitar problemas com SSR
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function GraficoDeLinhas() {
  const [options, setOptions] = useState({});
  const [series, setSeries] = useState([]);

  useEffect(() => {
    // dados do gráfico 
    setOptions({
      chart: {
        type: "bar",
        height: 300,
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          columnWidth: "16px",
          barHeight: "1%",
          borderRadius: 0
        }
      },
      legend: { show: false },
      dataLabels: { enabled: false },
      stroke: {
        show: true,
        width: 1.6,
        colors: ["transparent"]
      },
      xaxis: {
        categories: [
          "Externo", "Manutenção", "Apoio Técnico", "Limpeza"
        ],
        labels: {
          style: {
            colors: "#9ca3af",
            fontSize: "13px",
            fontFamily: "Inter, ui-sans-serif",
            fontWeight: 400
          },
          offsetX: -2,
          formatter: (value) => value >= 1000 ? `${value / 1000}k` : value
        }
      },
      yaxis: {
        labels: {
          align: "left",
          style: {
            colors: "#9ca3af",
            fontSize: "13px",
            fontFamily: "Inter, ui-sans-serif",
            fontWeight: 400
          },
          offsetX: -10,
          formatter: (title) =>
            typeof title === "string" ? title.slice(0, 3) : title
        }
      },
      tooltip: {
        y: {
          formatter: (value) => `$${value >= 1000 ? `${value / 1000}k` : value}`
        }
      },
      colors: ["#2563eb"],
      grid: {
        borderColor: "#e5e7eb"
      }
      
    });

    setSeries([
      {
        name: "Sales",
        data: [
          23000, 44000, 55000, 57000
        ]
      }
    ]);
  }, []);

  return (
    <div id="hs-horizontal-bar-chart" className="w-full">
      <Chart options={options} series={series} type="bar" height={300} />
    </div>
  );
}
