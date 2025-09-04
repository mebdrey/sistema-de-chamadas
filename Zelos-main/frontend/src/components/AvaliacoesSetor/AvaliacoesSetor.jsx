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
  const [dropdownRelatorioOpen, setDropdownRelatorioOpen] = useState(false);

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
        height: 320,
        toolbar: { show: false },
        background: 'transparent',
      },
      theme: {
        mode: isDark ? 'dark' : 'light'
      },
      // title: {
      //   text: 'Média de avaliações por setor',
      //   align: 'left',
      //   style: {
      //     fontSize: '0.875rem', color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: 400                       
      //   }
      // },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 6,
           barHeight: '35%', 
          columnWidth: '60%',
        },
      },
      dataLabels: {
        enabled: false,
      },
      colors: [
        function ({ value }) {
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
  borderColor: isDark ? '#334155' : '#E5E7EB', // cor mais suave
  strokeDashArray: 3,                           // tracejado mais sutil
  padding: { left: 8, right: 8, top: -10 },
  row: { colors: ['transparent', 'transparent'] }, // sem bandas de cor
  xaxis: { lines: { show: true } },
  yaxis: { lines: { show: true } }
},

    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriasFormatadas, isDark, tabela]); // corPorMedia usa isDark internamente


function _formatarDataAgora() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function _capitalizarPalavras(str) {
  if (!str && str !== '') return '';
  return String(str).replace(/_/g, ' ')
    .split(' ')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(' ');
}

/** gerarCSV: cria CSV com colunas: Setor, Média, Quantidade (se houver) */
const gerarCSV = () => {
  const dados = Array.isArray(tabela) && tabela.length ? tabela : null;

  // fallback: use series/categorias if tabela vazia
  const rows = [];
  if (dados) {
    // tenta mapear campos comuns: setor/titulo, media_nota/valor, qtd/qtd
    for (const r of dados) {
      const setorRaw = r.setor ?? r.titulo ?? r.nome ?? '';
      const setor = _capitalizarPalavras(setorRaw);
      const media = Number(r.media_nota ?? r.valor ?? r.media ?? 0);
      const qtd = Number(r.qtd ?? r.quantidade ?? r.total ?? 0);
      rows.push({ Setor: setor, Média: isNaN(media) ? '' : media.toFixed(2), Quantidade: isNaN(qtd) ? '' : qtd });
    }
  } else if (Array.isArray(series?.[0]?.data) && series[0].data.length && categoriasFormatadas.length) {
    series[0].data.forEach((val, i) => {
      rows.push({ Setor: categoriasFormatadas[i] ?? (`Setor ${i+1}`), Média: Number(val).toFixed(2), Quantidade: '' });
    });
  }

  if (!rows.length) {
    return alert('Sem dados para exportar.');
  }

  const headers = Object.keys(rows[0]);
  const separator = ';'; // bom para Excel PT-BR
  const bom = '\uFEFF';
  const titulo = `Relatório - Avaliações por setor`;
  const dataGeracao = `Gerado em: ${new Date().toLocaleString('pt-BR')}`;

  const lines = [
    titulo,
    dataGeracao,
    headers.join(separator),
    ...rows.map(r => headers.map(h => {
      const v = r[h] ?? '';
      // escape " e ; por segurança
      return String(v).includes(separator) || String(v).includes('"') ? `"${String(v).replace(/"/g, '""')}"` : v;
    }).join(separator))
  ];

  const csv = bom + lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const nome = `relatorio_avaliacoes_por_setor_${_formatarDataAgora()}.csv`;
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', nome);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const gerarPDF = async () => {
  const dados = Array.isArray(tabela) && tabela.length ? tabela : null;
  const rows = [];

  if (dados) {
    for (const r of dados) {
      const setorRaw = r.setor ?? r.titulo ?? r.nome ?? '';
      const setor = _capitalizarPalavras(setorRaw);
      const media = Number(r.media_nota ?? r.valor ?? r.media ?? 0);
      const qtd = Number(r.qtd ?? r.quantidade ?? r.total ?? 0);
      rows.push([setor, isNaN(media) ? '' : Number(media).toFixed(2), isNaN(qtd) ? '' : qtd]);
    }
  } else if (Array.isArray(series?.[0]?.data) && series[0].data.length && categoriasFormatadas.length) {
    series[0].data.forEach((val, i) => {
      rows.push([categoriasFormatadas[i] ?? (`Setor ${i+1}`), Number(val).toFixed(2), '']);
    });
  }

  if (!rows.length) {
    return alert('Sem dados para gerar PDF.');
  }

  try {
    // Importa dinamicamente só no client
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default || (await import('jspdf-autotable'));

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Título
    doc.setFontSize(16);
    doc.setTextColor(isDark ? 230 : 20, isDark ? 238 : 20, isDark ? 248 : 20); // tenta adequar; jsPDF aceita 0-255
    doc.text('Relatório — Avaliações por setor', 40, 48);

    // info geração
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 40, 64);

    // total avaliações (se tabela tiver qtd)
    const totalAvaliacoes = tabela && tabela.length ? tabela.reduce((s, r) => s + (Number(r.qtd ?? r.quantidade ?? r.total ?? 0) || 0), 0) : null;
    if (totalAvaliacoes !== null) {
      doc.text(`Total avaliações: ${totalAvaliacoes}`, pageWidth - 40, 64, { align: 'right' });
    }

    // tabela com autotable
    autoTable(doc, {
      startY: 80,
      head: [['#', 'Setor', 'Média', 'Quantidade']],
      body: rows.map((r, idx) => [idx + 1, r[0], r[1], r[2]]),
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: isDark ? [40, 40, 40] : [127, 86, 216], textColor: isDark ? [255,255,255] : [255,255,255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: isDark ? [30,30,30] : [245,245,250] },
      theme: 'striped',
      margin: { left: 40, right: 40 },
      // se a tabela for muito longa o autoTable paginará automaticamente
    });

    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(9);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setTextColor(120);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - 40, doc.internal.pageSize.getHeight() - 30, { align: 'right' });
      doc.text('Gerado automaticamente pelo sistema', 40, doc.internal.pageSize.getHeight() - 30);
    }

    const filename = `relatorio_avaliacoes_por_setor_${_formatarDataAgora()}.pdf`;
    doc.save(filename);
  } catch (err) {
    console.error('Erro ao gerar PDF', err);
    alert('Erro ao gerar PDF. Verifique se a dependência jspdf e jspdf-autotable estão instaladas.');
  }
};


  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6">
      <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-2">
        <dl>
          <dt className="text-2xl font-bold text-gray-900 dark:text-white">Avaliações por setor</dt>
          <dt className="text-sm text-gray-500 dark:text-gray-400">Média de avaliações por setor</dt>
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
              <span>
                {tabela && tabela.length > 0 ? (
                  <>Total avaliações: {tabela.reduce((s, r) => s + (Number(r.qtd ?? r.quantidade ?? 0) || 0), 0)}</>
                ) : '—'}
              </span>

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
          </div>
        </div>
      ) : (
        <div className="py-6 text-sm text-gray-500">Nenhuma avaliação encontrada.</div>
      )}
    </div>
  );
}
