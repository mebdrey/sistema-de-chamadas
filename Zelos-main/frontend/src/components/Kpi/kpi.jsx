"use client";
import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 


const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function KpiSla() {
  const [series, setSeries] = useState([0, 0]);
  const [slaData, setSlaData] = useState(null);
  const [loading, setLoading] = useState(false);
// dropdown de relatórios (mantém no mesmo arquivo)
const [dropdownRelatorioOpen, setDropdownRelatorioOpen] = useState(false);
const dropdownRef = useRef(null);

// Fecha o dropdown ao clicar fora
useEffect(() => {
  function handleClickOutside(e) {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownRelatorioOpen(false);
    }
  }
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

// Fecha com ESC
useEffect(() => {
  function handleEsc(e) {
    if (e.key === "Escape") setDropdownRelatorioOpen(false);
  }
  document.addEventListener("keydown", handleEsc);
  return () => document.removeEventListener("keydown", handleEsc);
}, []);


  const chartOptions = {
    chart: { type: "donut", background: "transparent" },
    labels: ["Dentro do SLA", "Fora do SLA"],
    colors: ["#7f56d8", "#ef4444"],
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
  };

  useEffect(() => {
    fetchSla();
  }, []);

  async function fetchSla() {
    setLoading(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${API}/indicadores/sla`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Resposta inválida do servidor");
      const data = await res.json();
      setSlaData(data || { totalConcluidos: 0, dentro: 0, fora: 0, percDentro: 0, percFora: 0 });
      setSeries([Number(data?.dentro ?? 0), Number(data?.fora ?? 0)]);
    } catch (err) {
      console.error("Erro ao carregar SLA:", err);
      setSlaData({ totalConcluidos: 0, dentro: 0, fora: 0, percDentro: 0, percFora: 0 });
      setSeries([0, 0]);
    } finally {
      setLoading(false);
    }
  }

  // CSV export
  const exportarCsvSla = async (modo = "anual") => {
    if (!slaData) await fetchSla();
    const nowStr = new Date().toLocaleString("pt-BR");
    const modoTexto = modo === "mensal" ? "Mensal" : "Anual";
    const headerInfo = [`Relatório de SLA`, `Gerado em: ${nowStr}`, `Modo: ${modoTexto}`, ""];
    const rows = [
      ["Métrica", "Valor"],
      ["Total de chamados concluídos", String(slaData?.totalConcluidos ?? 0)],
      ["Dentro do SLA (qtd)", String(slaData?.dentro ?? 0)],
      ["Fora do SLA (qtd)", String(slaData?.fora ?? 0)],
      ["Percentual dentro (%)", String(slaData?.percDentro ?? 0)],
      ["Percentual fora (%)", String(slaData?.percFora ?? 0)],
    ];
    if (slaData?.monthly && Array.isArray(slaData.monthly)) {
      rows.push([], ["Detalhamento por mês", "Chamados"]);
      slaData.monthly.forEach((m) => rows.push([m.month, String(m.total ?? 0)]));
    }
    const separador = ";";
    const conteudoCsv = [...headerInfo, rows.map((r) => r.join(separador)).join("\n")].join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + conteudoCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio_sla_${modoTexto.toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // PDF export 
  const gerarRelatorioSla = async (modo = "anual") => {
    if (!slaData) await fetchSla();
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const nowStr = new Date().toLocaleString("pt-BR");
    const modoTexto = modo === "mensal" ? "Mensal" : "Anual";

    doc.setFontSize(18);
    doc.text("Relatório de SLA", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(60);
    doc.text(`Período: ${modoTexto}`, 14, 30);
    doc.text(`Gerado em: ${nowStr}`, 14, 38);

    const tableBody = [
      ["Total concluídos", String(slaData?.totalConcluidos ?? 0)],
      ["Dentro do SLA (qtd)", String(slaData?.dentro ?? 0)],
      ["Fora do SLA (qtd)", String(slaData?.fora ?? 0)],
      ["% Dentro", `${String(slaData?.percDentro ?? 0)}%`],
      ["% Fora", `${String(slaData?.percFora ?? 0)}%`],
    ];

    autoTable(doc, {
      startY: 50,
      head: [["Métrica", "Valor"]],
      body: tableBody,
      styles: { fontSize: 11, cellPadding: 6 },
      headStyles: { fillColor: [127, 86, 216], textColor: [255, 255, 255], fontStyle: "bold" },
      margin: { left: 14, right: 14 },
    });

    
    let finalY = doc.lastAutoTable?.finalY || 80;

    if (slaData?.monthly && Array.isArray(slaData.monthly) && slaData.monthly.length > 0) {
      const monthRows = slaData.monthly.map((m) => [m.month, String(m.total ?? 0), String(m.dentro ?? 0), String(m.fora ?? 0)]);
      autoTable(doc, {
        startY: finalY + 10,
        head: [["Mês", "Total", "Dentro", "Fora"]],
        body: monthRows,
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [230, 230, 230], textColor: [40, 40, 40], fontStyle: "bold" },
        margin: { left: 14, right: 14 },
      });
      finalY = doc.lastAutoTable?.finalY || finalY + 10;
    }

    const total = Number(slaData?.totalConcluidos ?? 0);
    const dentro = Number(slaData?.dentro ?? 0);
    const fora = Number(slaData?.fora ?? 0);
    const percDentro = Number(slaData?.percDentro ?? 0);
    const percFora = Number(slaData?.percFora ?? 0);

    const analise =
      total === 0
        ? "Não há chamados concluídos nesse período para análise de SLA."
        : `Neste período houve ${total} chamados concluídos. Desses, ${dentro} (${percDentro}%) foram concluídos dentro do prazo e ${fora} (${percFora}%) ficaram fora do SLA. A maioria dos chamados ${percDentro >= 50 ? "cumpre" : "não cumpre"} o SLA — ${percDentro >= 50 ? "boa" : "atenção necessária"} oportunidade para melhoria. Recomenda-se investigar os chamados fora do SLA (prioridades, técnicos e temas) e adotar ações como: revisar alocação de técnicos, ajustar SLAs por prioridade, e criar alertas/monitoramento para os tipos/meses com maior índice de atraso.`;

    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.text("Análise Geral:", 14, finalY + 12);
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    doc.text(analise, 14, finalY + 22, { maxWidth: pageWidth - 28, align: "justify" });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: "right" });
      doc.text("Relatório gerado automaticamente pelo sistema", 14, doc.internal.pageSize.getHeight() - 10);
    }

    doc.save(`relatorio_sla_${modoTexto.toLowerCase()}.pdf`);
  };

  const gerarCSV = () => exportarCsvSla("anual");
  const gerarPDF = () => gerarRelatorioSla("anual");

  return (
    <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
      <h3 className="text-lg poppins-medium text-gray-600 mb-4 dark:text-white">
        Cumprimento de SLA anual
      </h3>
      
      <Chart
        options={chartOptions}
        series={series}
        type="donut"
         height="100%"
      />

      {/* botão */}
<div ref={dropdownRef} className="relative inline-block">
  <button
    onClick={() => setDropdownRelatorioOpen((s) => !s)}
    aria-haspopup="true"
    aria-expanded={dropdownRelatorioOpen} className="uppercase text-sm poppins-semibold inline-flex gap-2 items-center rounded-lg text-[#7F56D8] hover:bg-[#E6DAFF] dark:hover:bg-gray-700 px-3 py-2 hover:cursor-pointer"
  >Gerar relatório <svg className="w-3.5 h-3.5 text-[#7F56D8] me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20"><path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2Zm-3 15H4.828a1 1 0 0 1 0-2h6.238a1 1 0 0 1 0 2Zm0-4H4.828a1 1 0 0 1 0-2h6.238a1 1 0 1 1 0 2Z" /><path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" /></svg></button>

  <div ref={dropdownRef} className="relative inline-block">
  {dropdownRelatorioOpen && (
    <div className="absolute z-10 mt-2 bg-white border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm w-40 dark:bg-gray-800">
      <ul className="py-2 text-sm text-gray-700 dark:text-gray-400">
        <li>
          <button
            onClick={() => { gerarCSV(); setDropdownRelatorioOpen(false); }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 hover:cursor-pointer dark:hover:bg-gray-700"
          >
            Exportar CSV
          </button>
        </li>
        <li>
          <button
            onClick={() => { gerarPDF(); setDropdownRelatorioOpen(false); }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 hover:cursor-pointer dark:hover:bg-gray-700"
          >
            Exportar PDF
          </button>
        </li>
      </ul>
    </div>
  )}
</div>

</div>

    </div>
  );
}
