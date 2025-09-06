"use client";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";



const ApexCharts = dynamic(() => import("apexcharts"), { ssr: false });

export default function LeadsCard({
  setorInicial = "apoio_tecnico", // pool.titulo padrão 
  modo = "anual" // fixo em anual 
}) {
  const [setor, setSetor] = useState(setorInicial); // setorInicial = "apoio_tecnico"
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [tiposServico, setTiposServico] = useState([]); // guarda o tipo de serviço que o usuario seleciona 
  const [dropdownRelatorioOpen, setDropdownRelatorioOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const getBaseUrl = () => {
    const env = process.env.NEXT_PUBLIC_API_URL;
    if (env && env.startsWith("http")) return env;
    return "http://localhost:8080";
  };

  // busca dados cada vez que setor ou modo mudarem
  useEffect(() => {
    let canceled = false;
    async function fetchDados() {
      setLoading(true);
      setErro(null);
      try {
        const base = getBaseUrl();
        const url = new URL("/relatorios/chamados-por-pool", base);
        url.searchParams.set("setor", setor);
        url.searchParams.set("modo", modo || "anual");

        const res = await fetch(url.toString(), { cache: "no-store", credentials: "include" });
        if (!res.ok) {
          const txt = await res.text().catch(() => null);
          throw new Error(`API retornou ${res.status} ${txt || ""}`);
        }
        const json = await res.json();
        if (!canceled) { setApiData(normalizeApiResponse(json)); }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        if (!canceled) setErro("Falha ao carregar dados do servidor.");
        if (!canceled) setApiData({ categorias: [], series: [{ name: "Em andamento", data: [] }, { name: "Concluído", data: [] }], tabela: [], total: 0 });
      } finally { if (!canceled) setLoading(false); }
    }
    if (setor) fetchDados();
    return () => { canceled = true; };
  }, [setor, modo]);

  function normalizeApiResponse(json) {
    if (!json) return { categorias: [], series: [{ name: "Em andamento", data: [] }, { name: "Concluído", data: [] }], tabela: [], total: 0 };
    // assume categorias + series retornados pelo controller
    return {
      categorias: json.categorias || [],
      series: json.series || [{ name: "Em andamento", data: [] }, { name: "Concluído", data: [] }],
      tabela: json.tabela || [],
      total: json.total ?? 0,
      filtros: json.filtros || {}
    };
  }

  // monta/atualiza gráfico
  useEffect(() => {
    const el = chartRef.current;
    if (!apiData || !el) return;

    const options = {
      colors: ["#C8AFFF", "#8b5cf6"],
      series: apiData.series || [],
      chart: { type: "bar", height: 340, fontFamily: "Inter, sans-serif", toolbar: { show: false } },
      plotOptions: { bar: { horizontal: false, columnWidth: "40%", borderRadiusApplication: "end", borderRadius: 8 }, },
      xaxis: { categories: apiData.categorias || [], labels: { rotate: -15 } },
      dataLabels: { enabled: false },
      legend: { show: true },
      tooltip: { shared: true, intersect: false },
      yaxis: { show: true },
    };

    // destroy previous
    chartInstanceRef.current?.destroy();
    import("apexcharts").then(({ default: ApexCharts }) => {
      chartInstanceRef.current = new ApexCharts(el, options);
      chartInstanceRef.current.render();
    });

    return () => chartInstanceRef.current?.destroy();
  }, [apiData]);

  // CSV/PDF helpers
  // Função para capitalizar a primeira letra de cada palavra
  function capitalizarPalavras(str) {
    return str
      .replace(/_/g, " ") // substitui underscores por espaço
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  function gerarCSV() {
    const tabela = apiData?.tabela || [];
    if (!Array.isArray(tabela) || tabela.length === 0) {
      showToast("warning", "Sem dados para exportar.");
      return;
    }

    // formata o nome do setor corretamente
    const setorFormatado = capitalizarPalavras(setor);

    // seleciona apenas os campos necessários
    const rows = tabela.map(r => ({
      Nome: r.funcionario_nome ?? "",
      "QTD de chamados em andamento": r.em_andamento ?? 0,
      "QTD de chamados finalizados": r.concluido ?? 0,
      Total: r.total ?? (Number(r.em_andamento || 0) + Number(r.concluido || 0))
    }));

    const headers = Object.keys(rows[0]);
    const separator = ";";

    // título e data de geração
    const titulo = `Relatório anual do Setor ${setorFormatado}`;
    const dataGeracao = `Gerado em: ${new Date().toLocaleString("pt-BR")}`;

    // adiciona BOM para Excel reconhecer UTF-8
    const bom = "\uFEFF";

    // monta o CSV
    const lines = [
      titulo,
      dataGeracao,
      headers.join(separator),
      ...rows.map(r => headers.map(h => r[h]).join(separator))
    ];

    const csv = bom + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", `relatorio_${setorFormatado}_${modo}.csv`);
    document.body.appendChild(a);
    a.click();
    a.remove()
    URL.revokeObjectURL(url)
  }

  function gerarPDF() {
    const tabela = apiData?.tabela || [];
    if (!Array.isArray(tabela) || tabela.length === 0) {
      showToast("warning", "Sem dados para gerar PDF.");
      return;
    }

    // Função para formatar o setor
    function formatarSetor(str) {
      if (!str) return "";
      const correcoes = { manutencao: "Manutenção", apoio_tecnico: "Apoio Técnico" };
      const palavras = str.replace(/_/g, " ").split(" ");
      return palavras
        .map(p => correcoes[p.toLowerCase()] || p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join(" ");
    }

    const setorFormatado = formatarSetor(setor);
    const dataHoraAtual = new Date().toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });

    const totalChamados = tabela.reduce((acc, r) => acc + (r.total || (Number(r.em_andamento || 0) + Number(r.concluido || 0))), 0);

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- TÍTULO ---
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(`Relatório anual do Setor ${setorFormatado}`, pageWidth / 2, 20, { align: "center" });

    // --- INFORMAÇÕES ---
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(`Gerado em: ${dataHoraAtual}`, 14, 30);
    doc.text(`Total de Chamados: ${totalChamados}`, 14, 38);

    // --- TABELA ---
    autoTable(doc, {
      startY: 50,
      head: [["#", "Funcionário", "Em andamento", "Concluído", "Total"]],
      body: tabela.map((r, i) => [
        i + 1,
        r.funcionario_nome || "",
        r.em_andamento || 0,
        r.concluido || 0,
        r.total || (Number(r.em_andamento || 0) + Number(r.concluido || 0))
      ]),
      styles: { fontSize: 11, cellPadding: 5, halign: "center", valign: "middle" },
      headStyles: { fillColor: [127, 86, 216], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 240, 255] },
      bodyStyles: { textColor: [50, 50, 50] }
    });

    // --- RODAPÉ ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, 290, { align: "right" });
      doc.text("Relatório gerado automaticamente pelo sistema", 14, 290);
    }

    // --- SALVAR PDF ---
    doc.save(`relatorio_setor_${setorFormatado.replace(/ /g, "_")}_${modo}.pdf`)
  }

  // formata os tipos de servico
  function formatarLabel(str) {
    if (!str) return ""
    const correcoes = {
      manutencao: "Manutenção",
      apoio_tecnico: "Apoio Técnico"
    };

    const palavras = str.replace(/_/g, " ").split(" ")

    return palavras
      .map(palavra => {
        const semAcento = palavra.toLowerCase();
        return correcoes[semAcento] || (palavra.charAt(0).toUpperCase() + palavra.slice(1));
      })
      .join(" ")
  }

  // busca os tipos de servico
  useEffect(() => {
    fetch('http://localhost:8080/servicos', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setTiposServico(data))
      .catch(err => console.error('Erro ao carregar tipos:', err))
  }, []);

  return (
    <div className=" w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
      <div className="flex justify-between items-start pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start">
          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center me-3">
            <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 19">
              <path d="M14.5 0A3.987 3.987 0 0 0 11 2.1a4.977 4.977 0 0 1 3.9 5.858A3.989 3.989 0 0 0 14.5 0ZM9 13h2a4 4 0 0 1 4 4v2H5v-2a4 4 0 0 1 4-4Z" />
              <path d="M5 19h10v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2ZM5 7a5.008 5.008 0 0 1 4-4.9 3.988 3.988 0 1 0-3.9 5.859A4.974 4.974 0 0 1 5 7Zm5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm5-1h-.424a5.016 5.016 0 0 1-1.942 2.232A6.007 6.007 0 0 1 17 17h2a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5ZM5.424 9H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h2a6.007 6.007 0 0 1 4.366-5.768A5.016 5.016 0 0 1 5.424 9Z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Relatório anual por setor</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Escolha a pool para ver os funcionários e seus chamados</p>
            <div className="mt-3 flex items-center gap-3">
              <label className="text-sm text-gray-600 dark:text-gray-400">Pool:</label>
              <select value={setor} onChange={(e) => setSetor(e.target.value)} className="flex flex-row gap-4 justify-between text-sm px-2 py-1 border rounded-md focus:border-[#7F56D8] focus:ring-2 focus:ring-[#7F56D8] hover:cursor-pointer">
                {tiposServico.map(tipo => (
                  <option key={tipo.id} value={tipo.titulo} >
                    {formatarLabel(tipo.titulo)}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-500 dark:text-gray-400">Total chamados: <strong className="ms-1">{apiData?.total ?? "—"}</strong></span>
            </div>
          </div>
        </div>
      </div>
      <div>
        {loading && <div className="text-sm text-gray-500 mb-2">Carregando dados...</div>}
        {erro && <div className="text-sm text-red-500 mb-2">{erro}</div>}
        {!loading && apiData && apiData.categorias && apiData.categorias.length === 0 && (
          <div className="text-sm text-gray-500 mb-2 dark:text-gray-200">Nenhum funcionário com chamados nessa pool (no ano selecionado).</div>
        )}
        <div id="column-chart" ref={chartRef} height="100%" />
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
  );
}
