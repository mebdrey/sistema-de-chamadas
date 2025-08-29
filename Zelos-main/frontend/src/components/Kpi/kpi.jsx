"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function KpiSla() {
  const [chartOptions, setChartOptions] = useState({
    chart: { type: "radialBar", background: "transparent" },
    plotOptions: {
      radialBar: {
        hollow: { size: "70%" },
        dataLabels: {
          name: { show: true, fontSize: "16px", color: "#6b7280" }, // cinza no claro
          value: { fontSize: "22px", color: "#7f56d8" },
        },
      },
    },
    labels: ["SLA cumprido"],
    colors: ["#7f56d8"],
    theme: { mode: "light" }, 
  });

  useEffect(() => {
    const updateChartTheme = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      const newMode = isDarkMode ? "dark" : "light";
      const labelColor = isDarkMode ? "#FFFFFF" : "#6b7280"; // branco /cinza
      const valueColor = isDarkMode ? "#FFFFFF" : "#7f56d8"; // cor do valor (%)

      setChartOptions((prevOptions) => ({
        ...prevOptions,
        chart: {
        ...prevOptions.chart,
        foreColor: valueColor, // <-- garante que o texto do valor use a cor certa
      },
        theme: { mode: newMode },
        plotOptions: {
          ...prevOptions.plotOptions,
          radialBar: {
            ...prevOptions.plotOptions.radialBar,
            dataLabels: {
              ...prevOptions.plotOptions.radialBar.dataLabels,
              name: {
                ...prevOptions.plotOptions.radialBar.dataLabels.name,
                color: labelColor,
              },
              value: {
                ...prevOptions.plotOptions.radialBar.dataLabels.value,
                color: valueColor, // <-- agora muda dinamicamente
              },
            },
          },
        },
      }));
    };

    updateChartTheme();

    const observer = new MutationObserver(() => updateChartTheme());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const series = [76]; // % de SLA cumprido

  return (
    <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
      <h3 className="text-lg poppins-medium text-gray-600 mb-4 dark:text-white">
        SLA Cumprido
      </h3>
      <Chart options={chartOptions} series={series} type="radialBar" height={340} />
    </div>
  );
}