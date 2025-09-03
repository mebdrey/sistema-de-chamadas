// 'use client';

// import React, { useEffect, useState } from 'react';
// import dynamic from 'next/dynamic';

// // importa react-apexcharts apenas no client (evita SSR)
// const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// export default function AvaliacoesPorSetorChart({ apiUrl = 'http://localhost:8080/avaliacoes-por-setor' }) {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [categorias, setCategorias] = useState([]);
//   const [series, setSeries] = useState([{ name: 'Média de notas', data: [] }]);
//   const [tabela, setTabela] = useState([]); // opcional: {setor, qtd, media_nota}

//   useEffect(() => {
//     let mounted = true;
//     async function fetchData() {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await fetch(apiUrl);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const json = await res.json();

//         // esperado: { categorias: [...], series: [...], tabela: [...] }
//         if (json.categorias && json.series) {
//           if (!mounted) return;
//           setCategorias(json.categorias);
//           setSeries(json.series);
//           setTabela(json.tabela || []);
//         } else if (Array.isArray(json) && json.length) {
//           // fallback: array de objetos { setor, media_nota, qtd }
//           const cats = json.map((r) => r.setor || r.titulo || '—');
//           const data = json.map((r) => Number(r.media_nota ?? r.valor ?? 0));
//           if (!mounted) return;
//           setCategorias(cats);
//           setSeries([{ name: 'Média de notas', data }]);
//           setTabela(json);
//         } else {
//           console.warn('Resposta inesperada de /avaliacoes-por-setor:', json);
//           setCategorias([]);
//           setSeries([{ name: 'Média de notas', data: [] }]);
//           setTabela([]);
//         }
//       } catch (err) {
//         console.error(err);
//         if (!mounted) return;
//         setError(err.message || 'Erro ao buscar dados');
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     }

//     fetchData();
//     return () => { mounted = false; };
//   }, [apiUrl]);

//   // função util para mapear cor por valor (média)
//   const corPorMedia = (val) => {
//     const media = Number(val);
//     if (isNaN(media)) return '#9CA3AF'; // cinza (fallback)
//     if (media >= 4.0) return '#16A34A'; // verde (tailwind green-600)
//     if (media >= 3.0) return '#F59E0B'; // amarelo/âmbar (tailwind amber-500)
//     return '#EF4444'; // vermelho (tailwind red-500)
//   };

//   const options = {
//     chart: {
//       type: 'bar',
//       height: 420,
//       toolbar: { show: false },
//     },
//     title: {
//       text: 'Avaliações por setor',
//       align: 'left',
//       style: { fontSize: '14px' },
//     },
//     plotOptions: {
//       bar: {
//         horizontal: true,
//         borderRadius: 6,
//         columnWidth: '60%',
//         // colors por barra também pode ser aplicado aqui via ranges, mas usamos colors fn abaixo
//       },
//     },
//     dataLabels: {
//       enabled: false,
//     },
//     // colors pode ser uma função — retornamos a cor para cada data point
//     colors: [
//       function({ value, seriesIndex, dataPointIndex, w }) {
//         // value costuma ser o valor da barra (média)
//         // mas dependendo do formato pode vir como string, então garantimos Number()
//         return corPorMedia(value);
//       }
//     ],
//     xaxis: {
//       categories: categorias,
//       labels: {
//         style: { fontSize: '12px' },
//         formatter: function (val) { return val; }
//       },
//       axisTicks: { show: false },
//       axisBorder: { show: false }
//     },
//     yaxis: {
//       labels: { style: { fontSize: '12px' } }
//     },
//     legend: { show: false },
//     tooltip: {
//       y: {
//         formatter: function (val, { dataPointIndex }) {
//           const qtd = tabela?.[dataPointIndex]?.qtd ?? tabela?.[dataPointIndex]?.quantidade ?? null;
//           const media = Number(val).toFixed(2);
//           return qtd ? `Média: ${media} — ${qtd} avaliações` : `Média: ${media}`;
//         }
//       }
//     },
//     grid: {
//       strokeDashArray: 4,
//       padding: { left: 8, right: 8, top: -10 },
//     },
//   };

//   function formatarLabel(str) {
//     const texto = str.replace(/_/g, ' ').toLowerCase();

//     const correcoes = { "auxiliar limpeza": "Auxiliar de Limpeza", "apoio tecnico": "Apoio Técnico", "tecnico": "Técnico", "manutencao": "Manutenção" };

//     if (correcoes[texto]) { return correcoes[texto]; }

//     // capitaliza cada palavra caso não tenha uma correção personalizada
//     return texto
//       .split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
//   }

//   return (
//     <div className="w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
//       <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-2">
//         <dl>
//           <dt className="text-base font-normal text-gray-500 dark:text-gray-400 pb-1">Avaliações por setor</dt>
//           <dd className="leading-none text-3xl font-bold text-gray-900 dark:text-white">Média</dd>
//         </dl>
//       </div>

//       {loading ? (
//         <div className="py-12 flex items-center justify-center">
//           <svg className="animate-spin h-6 w-6 text-violet-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"></path>
//           </svg>
//         </div>
//       ) : error ? (
//         <div className="py-6 text-sm text-red-600">Erro: {error}</div>
//       ) : (series?.[0]?.data?.length > 0) ? (
//         <div>
//           <div id="bar-chart" className="mb-2">
//             <Chart options={options} series={series} type="bar" height={420} />
//           </div>
//           <div className="pt-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
//             <div className="flex justify-between">
//               <span>{categorias.length} setores</span>
//               <span>
//                 {tabela && tabela.length > 0 ? (
//                   <>Total avaliações: {tabela.reduce((s, r) => s + (Number(r.qtd ?? r.quantidade ?? 0) || 0), 0)}</>
//                 ) : '—'}
//               </span>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className="py-6 text-sm text-gray-500">Nenhuma avaliação encontrada.</div>
//       )}
//     </div>
//   );
// }

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

// importa react-apexcharts apenas no client (evita SSR)
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function AvaliacoesPorSetorChart({ apiUrl = 'http://localhost:8080/avaliacoes-por-setor' }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categorias, setCategorias] = useState([]); // ex: ['auxiliar_limpeza','manutencao']
  const [series, setSeries] = useState([{ name: 'Média de notas', data: [] }]);
  const [tabela, setTabela] = useState([]); // opcional: {setor, qtd, media_nota}
  const [isDark, setIsDark] = useState(false);

  // detectar modo escuro (Tailwind class 'dark' ou prefers-color-scheme)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const detect = () => {
      const byClass = document.documentElement && document.documentElement.classList.contains && document.documentElement.classList.contains('dark');
      const byMedia = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(Boolean(byClass || byMedia));
    };

    detect();

    // escuta mudanças do prefers-color-scheme
    let mql;
    try {
      mql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
      if (mql && mql.addEventListener) {
        mql.addEventListener('change', detect);
      } else if (mql && mql.addListener) {
        mql.addListener(detect);
      }
    } catch (e) {
      // ignore
    }

    // opcional: observa mudanças na classe 'dark' (se você alterna adicionando/ removendo a classe no <html>)
    const obs = new MutationObserver(detect);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      if (mql && mql.removeEventListener) mql.removeEventListener('change', detect);
      if (mql && mql.removeListener) mql.removeListener(detect);
      obs.disconnect();
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (json.categorias && json.series) {
          if (!mounted) return;
          setCategorias(json.categorias);
          setSeries(json.series);
          setTabela(json.tabela || []);
        } else if (Array.isArray(json) && json.length) {
          // fallback: array de objetos { setor, media_nota, qtd }
          const cats = json.map((r) => r.setor || r.titulo || '—');
          const data = json.map((r) => Number(r.media_nota ?? r.valor ?? 0));
          if (!mounted) return;
          setCategorias(cats);
          setSeries([{ name: 'Média de notas', data }]);
          setTabela(json);
        } else {
          console.warn('Resposta inesperada de /avaliacoes-por-setor:', json);
          setCategorias([]);
          setSeries([{ name: 'Média de notas', data: [] }]);
          setTabela([]);
        }
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError(err.message || 'Erro ao buscar dados');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();
    return () => { mounted = false; };
  }, [apiUrl]);

  // função de formatação de label (a sua)
  function formatarLabel(str) {
    if (!str && str !== '') return '';
    const texto = String(str).replace(/_/g, ' ').toLowerCase();

    const correcoes = {
      "auxiliar limpeza": "Auxiliar de Limpeza",
      "apoio tecnico": "Apoio Técnico",
      "tecnico": "Técnico",
      "manutencao": "Manutenção"
    };

    if (correcoes[texto]) { return correcoes[texto]; }

    return texto
      .split(' ')
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
  }

  const categoriasFormatadas = useMemo(() => categorias.map(formatarLabel), [categorias]);

  // função util para mapear cor por valor (média) com variantes para light/dark
  const corPorMedia = (val) => {
    const media = Number(val);
    if (isNaN(media)) return isDark ? '#9CA3AF' : '#6B7280'; // fallback (cinza)
    if (isDark) {
      if (media >= 4.0) return '#34D399'; // green-400
      if (media >= 3.0) return '#FBBF24'; // amber-400
      return '#F87171'; // red-400
    } else {
      if (media >= 4.0) return '#16A34A'; // green-600
      if (media >= 3.0) return '#F59E0B'; // amber-500
      return '#EF4444'; // red-500
    }
  };

  // memoizar options pra não recriar a cada render desnecessário
  const options = useMemo(() => {
    return {
      chart: {
        type: 'bar',
        height: 420,
        toolbar: { show: false },
      },
      theme: {
        mode: isDark ? 'dark' : 'light'
      },
      title: {
        text: 'Avaliações por setor',
        align: 'left',
        style: { fontSize: '14px', color: isDark ? '#E6EEF8' : '#0F172A' }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 6,
          columnWidth: '60%',
        },
      },
      dataLabels: {
        enabled: false,
      },
      colors: [
        function({ value }) {
          return corPorMedia(value);
        }
      ],
      xaxis: {
        categories: categoriasFormatadas,
        labels: {
          style: { fontSize: '12px', colors: isDark ? '#9CA3AF' : '#475569' },
          formatter: function (val) { return val; }
        },
        axisTicks: { show: false },
        axisBorder: { show: false }
      },
      yaxis: {
        labels: { style: { fontSize: '12px', color: isDark ? '#9CA3AF' : '#475569' } }
      },
      legend: { show: false },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        y: {
          formatter: function (val, { dataPointIndex }) {
            const rawLabel = categorias[dataPointIndex] ?? categoriasFormatadas[dataPointIndex] ?? '';
            const labelFormatado = formatarLabel(rawLabel);
            const qtd = tabela?.[dataPointIndex]?.qtd ?? tabela?.[dataPointIndex]?.quantidade ?? null;
            const media = Number(val).toFixed(2);
            return qtd ? `${labelFormatado} — Média: ${media} — ${qtd} avaliações` : `${labelFormatado} — Média: ${media}`;
          }
        }
      },
      grid: {
        strokeDashArray: 4,
        padding: { left: 8, right: 8, top: -10 },
      },
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriasFormatadas, isDark, tabela]); // corPorMedia usa isDark internamente

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6">
      <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-2">
        <dl>
          <dt className="text-base font-normal text-gray-500 dark:text-gray-400 pb-1">Avaliações por setor</dt>
          <dd className="leading-none text-3xl font-bold text-gray-900 dark:text-white">Média</dd>
        </dl>
      </div>

      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <svg className="animate-spin h-6 w-6 text-violet-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"></path>
          </svg>
        </div>
      ) : error ? (
        <div className="py-6 text-sm text-red-600">Erro: {error}</div>
      ) : (series?.[0]?.data?.length > 0) ? (
        <div>
          <div id="bar-chart" className="mb-2">
            <Chart options={options} series={series} type="bar" height={420} />
          </div>
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex justify-between">
              <span>{categorias.length} setores</span>
              <span>
                {tabela && tabela.length > 0 ? (
                  <>Total avaliações: {tabela.reduce((s, r) => s + (Number(r.qtd ?? r.quantidade ?? 0) || 0), 0)}</>
                ) : '—'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-6 text-sm text-gray-500">Nenhuma avaliação encontrada.</div>
      )}
    </div>
  );
}
