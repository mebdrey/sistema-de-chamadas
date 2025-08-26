// "use client";
// import { useEffect, useState, useRef } from "react";
// import dynamic from "next/dynamic";
// const ApexCharts = dynamic(() => import("apexcharts"), { ssr: false });


// export default function LeadsCard({ setor = "apoio_tecnico", perfilInicial = "tecnicos", modo = "mensal" }) {
//   const [open, setOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const [dropdownRelatorioOpen, setDropdownRelatorioOpen] = useState(false);
//   const [perfil, setPerfil] = useState(perfilInicial);
//   const [apiData, setApiData] = useState(null);
//   const chartInstanceRef = useRef(null);

//   // Fecha dropdown se clicar fora
//   useEffect(() => {
//     function handleClickOutside(e) {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Carrega dados da API toda vez que perfil/setor/modo mudarem
//   useEffect(() => {
//     async function fetchDados() {
//       try {
//         const url = new URL("http://localhost:8080/relatorios/chamados-por-funcionario");
//         url.searchParams.set("perfil", perfil); // 'tecnicos' | 'auxiliares'
//         url.searchParams.set("setor", setor);   // 'externo' | 'manutencao' | 'apoio_tecnico' | 'limpeza'
//         url.searchParams.set("modo",  modo);    // 'mensal' | 'anual' | 'todos'

//         const res = await fetch(url.toString(), { cache: "no-store" });
//         const json = await res.json();
//         setApiData(json);
//       } catch (err) {
//         console.error("Erro ao buscar dados do gráfico:", err);
//         setApiData({ categorias: [], series: [{ name: "Em andamento", data: [] }, { name: "Concluído", data: [] }], total: 0 });
//       }
//     }
//     fetchDados();
//   }, [perfil, setor, modo]);

//   // Monta/atualiza gráfico
//   useEffect(() => {
//     const el = document.getElementById("column-chart");
//     if (!apiData || !el) return;

//     const options = {
//       colors: ["#1A56DB", "#FDBA8C"],
//       series: apiData.series || [],
//       chart: { type: "bar", height: 320, fontFamily: "Inter, sans-serif", toolbar: { show: false } },
//       plotOptions: { bar: { horizontal: false, columnWidth: "70%", borderRadiusApplication: "end", borderRadius: 8 } },
//       dataLabels: { enabled: false },
//       legend: { show: true },
//       xaxis: {
//         categories: apiData.categorias || [],
//         labels: { show: true, style: { fontFamily: "Inter, sans-serif", cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400" } },
//         axisBorder: { show: false }, axisTicks: { show: false },
//       },
//       yaxis: { show: true },
//       tooltip: { shared: true, intersect: false, style: { fontFamily: "Inter, sans-serif" } },
//       states: { hover: { filter: { type: "darken", value: 1 } } },
//       stroke: { show: true, width: 0, colors: ["transparent"] },
//       grid: { show: false, strokeDashArray: 4, padding: { left: 2, right: 2, top: -14 } },
//       fill: { opacity: 1 },
//     };

//     // Destroy anterior (evita duplicar)
//     chartInstanceRef.current?.destroy();
//     import("apexcharts").then(({ default: ApexCharts }) => {
//       chartInstanceRef.current = new ApexCharts(el, options);
//       chartInstanceRef.current.render();
//     });

//     return () => chartInstanceRef.current?.destroy();
//   }, [apiData]);

//   // Fecha dropdown se clicar fora
//   useEffect(() => {
//     function handleClickOutside(e) {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Monta gráfico
//   // useEffect(() => {
//   //   if (typeof window !== "undefined" && document.getElementById("column-chart")) {
//   //     let chart; // variável para manter instância

//   //     import("apexcharts").then(({ default: ApexCharts }) => {
//   //       const options = {
//   //         colors: ["#1A56DB", "#FDBA8C"],
//   //         series: [{ name: "Em andamento", color: "#1A56DB", data: [ { x: "funcionario 1", y: 231 }, { x: "Tue", y: 122 },{ x: "Wed", y: 63 }, { x: "Thu", y: 421 }, { x: "Fri", y: 122 },{ x: "Sat", y: 323 }, { x: "Sun", y: 111 }, ],},
//   //           {
//   //             name: "Concluido",
//   //             color: "#FDBA8C",
//   //             data: [ { x: "Mon", y: 232 }, { x: "Tue", y: 113 }, { x: "Wed", y: 341 }, { x: "Thu", y: 224 },{ x: "Fri", y: 522 }, { x: "Sat", y: 411 },{ x: "Sun", y: 243 } ],
//   //           },
//   //         ],
//   //         chart: { type: "bar", height: "320px", fontFamily: "Inter, sans-serif",toolbar: { show: false },},
//   //         plotOptions: { bar: { horizontal: false, columnWidth: "70%", borderRadiusApplication: "end", borderRadius: 8,},},
//   //         tooltip: { shared: true, intersect: false, style: { fontFamily: "Inter, sans-serif" }, },
//   //         states: { hover: { filter: { type: "darken", value: 1 } } },
//   //         stroke: { show: true, width: 0, colors: ["transparent"] },
//   //         grid: { show: false, strokeDashArray: 4, padding: { left: 2, right: 2, top: -14 }, },
//   //         dataLabels: { enabled: false },
//   //         legend: { show: false },
//   //         xaxis: { floating: false, labels: {show: true, style: {fontFamily: "Inter, sans-serif", cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400" },}, axisBorder: { show: false }, axisTicks: { show: false },},
//   //         yaxis: { show: false },
//   //         fill: { opacity: 1 },
//   //       };

//   //       chart = new ApexCharts(document.getElementById("column-chart"), options);
//   //       chart.render();
//   //     });

//       // Cleanup correto → evita duplicação
//   //     return () => { if (chart) { chart.destroy(); } };
//   //   }
//   // }, []);

//   return (
//     <div className="max-w-sm w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
//       <div className="flex justify-between pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
//         <div className="flex items-center">
//           <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center me-3">
//             <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 19">
//               <path d="M14.5 0A3.987 3.987 0 0 0 11 2.1a4.977 4.977 0 0 1 3.9 5.858A3.989 3.989 0 0 0 14.5 0ZM9 13h2a4 4 0 0 1 4 4v2H5v-2a4 4 0 0 1 4-4Z"/>
//               <path d="M5 19h10v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2ZM5 7a5.008 5.008 0 0 1 4-4.9 3.988 3.988 0 1 0-3.9 5.859A4.974 4.974 0 0 1 5 7Zm5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm5-1h-.424a5.016 5.016 0 0 1-1.942 2.232A6.007 6.007 0 0 1 17 17h2a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5ZM5.424 9H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h2a6.007 6.007 0 0 1 4.366-5.768A5.016 5.016 0 0 1 5.424 9Z"/>
//             </svg>
//           </div>
//           <div>
//             <h5 className="leading-none text-2xl font-bold text-gray-900 dark:text-white pb-1">Nome da pool</h5>
//             <p className="text-sm font-normal text-gray-500 dark:text-gray-400">Descrição da pool</p>
//           </div>
//         </div>
//       </div>
//       <div className="grid grid-cols-1">
//         <dl className="flex items-center">
//           <dt className="text-gray-500 dark:text-gray-400 text-sm font-normal me-1">Total de chamados:</dt>
//           <dd className="text-gray-900 text-sm dark:text-white font-semibold">Qtd total de chamados do setor</dd>
//         </dl>
//       </div>
//       {/* container do gráfico */}
//       <div id="column-chart"></div>
//       {/* dropdown */}
//       <div className="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between" ref={dropdownRef}>
//         <div className="flex justify-between items-center pt-5">
//           <button onClick={() => setOpen((prev) => !prev)} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 text-center inline-flex items-center dark:hover:text-white" type="button"><svg className="w-2.5 m-2.5 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
//               <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
//             </svg>
//           </button>
//          {open && (
//   <div className="absolute bottom-full mb-2 z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700">
//     <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
//       <li> <button onClick={() => { setPerfil("tecnicos"); setOpen(false); }} className="w-full text-left block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Técnicos</button></li>
//       <li><button onClick={() => { setPerfil("auxiliares"); setOpen(false); }} className="w-full text-left block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Auxiliares</button></li>
//     </ul>
//   </div>
// )}
//           <div className="relative">
//   <button className="uppercase text-sm poppins-semibold inline-flex gap-2 items-center rounded-lg text-[#7F56D8] hover:bg-[#E6DAFF] px-3 py-2" onClick={() => setDropdownRelatorioOpen(prev => !prev)}>Gerar relatório
//     <svg className="w-3.5 h-3.5 text-[#7F56D8] me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
//       <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2Zm-3 15H4.828a1 1 0 0 1 0-2h6.238a1 1 0 0 1 0 2Zm0-4H4.828a1 1 0 0 1 0-2h6.238a1 1 0 1 1 0 2Z" />
//       <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
//     </svg>
//   </button>

//   {/* Mostrar o dropdown só quando aberto */}
//   {dropdownRelatorioOpen && (
//     <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-sm w-40">
//       <ul className="py-2 text-sm text-gray-700">
//         <li> <button onClick={() => { gerarCSV(); setDropdownRelatorioOpen(false);}} className="w-full text-left px-4 py-2 hover:bg-gray-100" >Exportar CSV </button></li>
//         <li> <button  onClick={() => { gerarPDF(); setDropdownRelatorioOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">Exportar PDF </button> </li>
//       </ul>
//     </div>
//   )}
// </div>
//         </div>
//       </div>
//     </div>
//   );}
"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

const ApexCharts = dynamic(() => import("apexcharts"), { ssr: false });

export default function LeadsCard({
  setorInicial = "apoio_tecnico", // pool.titulo padrão 
  modo = "anual" // fixo em anual 
}) {
  const [setor, setSetor] = useState(setorInicial);
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [tiposServico, setTiposServico] = useState([]); // guarda o tipo de serviço que o usuario seleciona 

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
        if (!canceled) {
          setApiData(normalizeApiResponse(json));
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        if (!canceled) setErro("Falha ao carregar dados do servidor.");
        if (!canceled) setApiData({ categorias: [], series: [{ name: "Em andamento", data: [] }, { name: "Concluído", data: [] }], tabela: [], total: 0 });
      } finally {
        if (!canceled) setLoading(false);
      }
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
      colors: ["#cfb5e8", "#9254d1"],
      series: apiData.series || [],
      chart: { type: "bar", height: 340, fontFamily: "Inter, sans-serif", toolbar: { show: false } },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "40%",
          borderRadiusApplication: "end",
          borderRadius: 8,
        },
      },
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
  function gerarCSV() {
    const tabela = apiData?.tabela || [];
    if (!Array.isArray(tabela) || tabela.length === 0) {
      alert("Sem dados para exportar.");
      return;
    }
    const rows = tabela.map(r => ({
      funcionario_id: r.funcionario_id ?? "",
      funcionario_nome: r.funcionario_nome ?? "",
      em_andamento: r.em_andamento ?? 0,
      concluido: r.concluido ?? 0,
      total: r.total ?? (Number(r.em_andamento || 0) + Number(r.concluido || 0))
    }));
    const headers = Object.keys(rows[0]);
    const lines = [headers.join(",")].concat(rows.map(r => headers.map(h => JSON.stringify(String(r[h] ?? ""))).join(",")));
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", `relatorio_pool_${setor}_${modo}.csv`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function gerarPDF() {
    const tabela = apiData?.tabela || [];
    if (!Array.isArray(tabela) || tabela.length === 0) {
      alert("Sem dados para gerar PDF.");
      return;
    }
    const html = `
      <html><head><title>Relatório - ${setor}</title>
      <style>body{font-family:Inter,Arial;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f3f4f6}</style>
      </head><body>
      <h2>Relatório de Chamados - Pool: ${setor}</h2>
      <div>Modo: ${modo}</div>
      <table><thead><tr><th>#</th><th>Funcionário</th><th>Em andamento</th><th>Concluído</th><th>Total</th></tr></thead><tbody>
      ${tabela.map((r, i) => `<tr><td>${i + 1}</td><td>${escapeHtml(r.funcionario_nome || "")}</td><td>${r.em_andamento || 0}</td><td>${r.concluido || 0}</td><td>${r.total || (Number(r.em_andamento || 0) + Number(r.concluido || 0))}</td></tr>`).join("")}
      </tbody></table></body></html>`;
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) { alert("Bloqueador de pop-ups impediu a geração do PDF."); return; }
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 600);
  }

  function escapeHtml(s) {
    if (!s) return "";
    return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }

   // formata os tipos de servico
function formatarLabel(str) {
  if (!str) return ""
    const correcoes = {
      manutencao: "Manutenção",
      apoio_tecnico: "Apoio Técnico"
    };

  const palavras = str.replace(/_/g, " ").split(" ");

  return palavras
  .map(palavra => {
    const semAcento = palavra.toLowerCase();
    return correcoes[semAcento] || (palavra.charAt(0).toUpperCase() + palavra.slice(1));
  })
  .join(" ");
}

  // busca os tipos de servico
  useEffect(() => {
    fetch('http://localhost:8080/servicos', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setTiposServico(data))
      .catch(err => console.error('Erro ao carregar tipos:', err));
  }, []);

  return (
    <div className=" w-2000 bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
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
              <label className="text-sm text-gray-600">Pool:</label>
              <select value={setor} onChange={(e) => setSetor(e.target.value)} className="text-sm px-2 py-1 border rounded-md">
                {tiposServico.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {formatarLabel(tipo.titulo)}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-500">Total chamados: <strong className="ms-1">{apiData?.total ?? "—"}</strong></span>
            </div>
          </div>
        </div>
      </div>
      <div>
        {loading && <div className="text-sm text-gray-500 mb-2">Carregando dados...</div>}
        {erro && <div className="text-sm text-red-500 mb-2">{erro}</div>}
        {!loading && apiData && apiData.categorias && apiData.categorias.length === 0 && (
          <div className="text-sm text-gray-500 mb-2">Nenhum funcionário com chamados nessa pool (no ano selecionado).</div>
        )}
        <div id="column-chart" ref={chartRef} />
      </div>

      <div className="flex justify-between items-center ">
        <div>
          <button onClick={gerarCSV} className="text-sm px-3 py-2 rounded-md bg-[#7F56D8] text-white">Exportar CSV</button>
          <button onClick={gerarPDF} className="ms-2 text-sm px-3 py-2 rounded-md border">Exportar PDF</button>
        </div>
      </div>
    </div>
  );
}
