"use client"
import { useEffect, useState, useMemo } from "react";
import { initFlowbite } from 'flowbite'
import { useRouter } from 'next/navigation';
import OrdenarPor from '@/components/DropDown/DropDown.jsx'
import { useContext } from 'react';
import { UserContext } from '@/components/ProtectedRoute/ProtectedRoute.jsx';

import ChatWidget from "@/components/ChatWidget/ChatWidget.jsx";

export default function ChamadosTecnico({ downloadMode = 'open' // 'open' ou 'download'
}) {
  const [isOpen, setIsOpen] = useState(false); // p drawer abrir e fechar
  const [isMounted, setIsMounted] = useState(false); // espera o componente estar carregado no navegador p evitar erros de renderizacao
  const [chamados, setChamados] = useState([]) // p selecionar os chamados com base no status
  const [abaAtiva, setAbaAtiva] = useState('pendente')
  const [tiposServico, setTiposServico] = useState([]); // mostra os tipos de servicos/setores
  const [setoresSelecionados, setSetoresSelecionados] = useState([]); // guarda o tipo de servico selecionado
  const [busca, setBusca] = useState(""); // armazena o que htmlFor digitado no campo de busca
  const [dropdownSetorAberto, setDropdownSetorAberto] = useState(false);
  const [dropdownPrioridadeAberto, setDropdownPrioridadeAberto] = useState(false);
  const [prioridadesSelecionadas, setPrioridadesSelecionadas] = useState([]); // 
  const [tiposPrioridade, setTiposPrioridade] = useState([]);
  const [ordenarPor, setOrdenarPor] = useState('mais_recente'); // ordenar por mais recente ou mais antigo, por padrao ele mostra os mais recentes primeiro
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null);
  const [expandido, setExpandido] = useState(false); // 
  const [apontamentos, setApontamentos] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [apontamentoAtivo, setApontamentoAtivo] = useState(null);
  const [toasts, setToasts] = useState([]); // { id, type: 'success'|'danger'|'warning', message }
  const { user, userId } = useContext(UserContext); // 
  const [mostrarModalConfirmacao, setMostrarModalConfirmacao] = useState(false);

  // effectiveCurrentUserId: string ou undefined
  const effectiveCurrentUserId = String(user?.id ?? userId ?? "");

  // alias para showToast 
  const showToastLocal = (type, message, timeout = 5000) => showToast(type, message, timeout);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter(t => t.id !== id));
  };

  const showToast = (type, message, timeout = 5000) => {
    const id = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const newToast = { id, type, message };
    setToasts((prev) => [newToast, ...prev]); // newest em cima (pode inverter)
    if (timeout > 0) { setTimeout(() => removeToast(id), timeout); }
  };

  useEffect(() => {
    setIsMounted(true);
    initFlowbite(); // inicializa dropdowns, modais, etc.
  }, []);

  useEffect(() => { atualizarChamados(); }, [abaAtiva]);


  // ----------------------------------------- APONTAMENTOS -----------------------------------------------------
  // Buscar apontamentos 
  useEffect(() => {
    const buscarApontamentos = async () => {
      if (!chamadoSelecionado?.id) return;

      try {
        const response = await fetch(`http://localhost:8080/apontamentos/${chamadoSelecionado.id}`, { credentials: 'include' });
        const data = await response.json();
        const lista = Array.isArray(data) ? data : data.apontamentos || [];
        setApontamentos(lista);
        setApontamentoAtivo(lista.find((a) => !a.fim));
      } catch (error) { console.error('Erro ao buscar apontamentos:', error); }
    };

    buscarApontamentos();
  }, [chamadoSelecionado]);

  // cria apontamento
  const iniciarApontamento = async () => {
    if (!descricao.trim() || !chamadoSelecionado?.id) return;

    try {
      const response = await fetch('http://localhost:8080/criar-apontamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          chamado_id: chamadoSelecionado.id,
          descricao
        })
      });

      const resultado = await response.json();
      console.log('Resposta do servidor:', resultado);
      if (!response.ok) throw new Error('Erro ao criar apontamento');

      // Atualiza a lista após criar
      const res = await fetch(`http://localhost:8080/apontamentos/${chamadoSelecionado.id}`, { credentials: 'include' });
      const data = await res.json();
      const lista = Array.isArray(data) ? data : data.apontamentos || [];
      setApontamentos(lista);
      setApontamentoAtivo(lista.find((a) => !a.fim));
      setDescricao('');
    } catch (error) { console.error('Erro ao criar apontamento:', error); }
  };
  // finalizar apontamento
  const finalizarApontamento = async (id) => {
    try {
      const response = await fetch('http://localhost:8080/finalizar-apontamento', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ apontamento_id: id })
      });

      if (!response.ok) throw new Error('Erro ao finalizar apontamento');

      // Atualiza a lista após finalizar
      const res = await fetch(`http://localhost:8080/apontamentos/${chamadoSelecionado.id}`, { credentials: 'include' });
      const data = await res.json();
      const lista = Array.isArray(data) ? data : data.apontamentos || [];
      setApontamentos(lista);
      setApontamentoAtivo(null);
    } catch (error) { console.error('Erro ao finalizar apontamento:', error); }
  };

  // ------------------------------------------------------------- CHAT ----------------------------------------------------------------
  const enviarMsg = async (tipo = 'tecnico') => {
    if (!conteudo.trim()) return; // evita enviar mensagem sem nada
    try {
      const endpoint =
        tipo === 'tecnico'
          ? 'http://localhost:8080/tecnico-enviar-msg'
          : 'http://localhost:8080/enviar-msg';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          idChamado: chamadoSelecionado.id,
          conteudoMsg: conteudo,
        }),
      });

      if (!response.ok) throw new Error('Erro ao enviar mensagem');

      // Atualiza mensagens
      const res = await fetch(`http://localhost:8080/chat?idChamado=${chamadoSelecionado.id}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Erro ao atualizar mensagens');
      const data = await res.json();
      setMensagens(data.mensagens);
      setConteudo('');
    } catch (error) { console.error('Erro ao enviar mensagem: ', error); }
  };


  // const [mensagens, setMensagens] = useState([]);
  const [mensagens, setMensagens] = useState(null); // null = ainda não carregou

  const [conteudo, setConteudo] = useState('');
  const [loadingMensagens, setLoadingMensagens] = useState(false);

  useEffect(() => {
    const fetchMensagens = async () => {
      if (!chamadoSelecionado?.id) return;

      setLoadingMensagens(true);
      try {
        const response = await fetch(`http://localhost:8080/chat?idChamado=${chamadoSelecionado.id}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Erro ao buscar mensagens');

        const data = await response.json();
        if (JSON.stringify(data.mensagens) !== JSON.stringify(mensagens)) { setMensagens(data.mensagens); }
      }
      catch (err) { console.error("Erro ao buscar mensagens do chamado", err); }
      finally { setLoadingMensagens(false); } // só marca como carregado no fim

    };
    fetchMensagens();

    const interval = setInterval(fetchMensagens, 5000); // atualiza a cada 5s
    return () => clearInterval(interval);
  }, [chamadoSelecionado]);


  const atualizarChamados = async () => {
    try {
      const fetchChamados = async (status) => {
        const res = await fetch(`http://localhost:8080/chamados-funcionario?status=${status}`, {
          credentials: 'include',
        });

        if (!res.ok) {
          console.error(`Erro ao buscar chamados com status "${status}":`, res.status);
          return []; // Retorna array vazio se der erro
        }

        const data = await res.json();
        return Array.isArray(data) ? data : [];
      };

      if (abaAtiva === 'todos') {
        const [pendente, andamento, concluido] = await Promise.all([
          fetchChamados('pendente'),
          fetchChamados('em-andamento'),
          fetchChamados('concluido'),
        ]);
        setChamados([...pendente, ...andamento, ...concluido]);
      } else {
        const data = await fetchChamados(abaAtiva.replace('-', ' '));
        setChamados(data);
      }
    } catch (err) {
      console.error('Erro ao carregar chamados:', err);
      setChamados([]);
    }
  };


  function primeiraLetraMaiuscula(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // STATUS DOS CHAMAFOS
  const statusAbas = ['pendente', 'em andamento', 'concluido', 'todos'];
  // funcao p normalizar id
  const normalizarId = (texto) =>
    typeof texto === 'string' ? texto.toLowerCase().replace(/\s+/g, '-') : '';


  useEffect(() => {
    fetch("http://localhost:8080/prioridades", { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao buscar prioridades");
        return res.json();
      })
      .then(data => setTiposPrioridade(data))
      .catch(err => {
        console.error("Erro ao carregar prioridades:", err);
        setTiposPrioridade([]);
      });
  }, []);

  // busca os tipos de servico
  useEffect(() => {
    fetch('http://localhost:8080/servicos', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const ativos = data.filter(servico => servico.status_pool === 'ativo');
        setTiposServico(ativos);
      })
      .catch(err => console.error('Erro ao carregar tipos de serviço:', err));
  }, []);

  const chamadosFiltrados = useMemo(() => {
    return [...chamados].sort((a, b) => {
      const dataA = new Date(a.criado_em);
      const dataB = new Date(b.criado_em);
      return ordenarPor === 'mais_antigo' ? dataA - dataB : dataB - dataA;
    });
  }, [chamados, ordenarPor]);

  // objeto de mapeamento de tipo_id para titulo
  const mapaTipoIdParaTitulo = useMemo(() => {
    const mapa = {};
    tiposServico.forEach((t) => {
      mapa[t.id] = t.titulo;
    });
    return mapa;
  }, [tiposServico]);

  const pegarChamado = async (chamadoId) => {
    try {
      const response = await fetch('http://localhost:8080/pegar-chamado', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chamado_id: chamadoId }),
      });

      const data = await response.json();

      if (!response.ok) { throw new Error(data.erro || 'Erro ao pegar chamado'); }

      // data.chamado contém o chamado atualizado com data_limite
      const atualizado = data.chamado || data;
      // atualiza a seleção para abrir drawer com prazo
      setChamadoSelecionado(atualizado);
      showToast('success', data.mensagem || 'Chamado pego com sucesso');

      // atualiza listas (mantém comportamento atual)
      await atualizarChamados();
    } catch (err) { showToast('danger', err.message || 'Erro desconhecido'); }
  };

  // FECHAR O DRAWER COM ESC 
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ------------------ ações: finalizar e baixar relatorio ------------------
  const [finalizando, setFinalizando] = useState(false);
  const [baixando, setBaixando] = useState(false);

  const finalizarChamado = async () => {
    if (!chamadoSelecionado?.id) {
      showToastLocal('danger', 'Nenhum chamado selecionado.');
      return;
    }
    if (chamadoSelecionado.status_chamado !== 'em andamento') {
      showToastLocal('warning', 'Somente chamados em andamento podem ser finalizados.');
      return;
    }
    if (String(chamadoSelecionado.tecnico_id) !== String(effectiveCurrentUserId)) {
      showToastLocal('danger', 'Você não tem permissão para finalizar este chamado.');
      return;
    }

    try {
      setFinalizando(true);
      const resp = await fetch('http://localhost:8080/finalizar-chamado', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ chamado_id: chamadoSelecionado.id })
      });
      const body = await resp.json();
      if (!resp.ok) throw new Error(body.erro || 'Erro ao finalizar chamado.');

      showToastLocal('success', body.mensagem || 'Chamado finalizado com sucesso.');

      // atualiza UI local para refletir conclusão imediata
      setChamadoSelecionado(prev => ({ ...prev, status_chamado: 'concluido', finalizado_em: (new Date()).toISOString() }));

      // e atualiza lista (recarrega back)
      await atualizarChamados();
    } catch (err) {
      console.error('finalizarChamado:', err);
      showToastLocal('danger', err.message || 'Erro ao finalizar chamado.');
    }
    finally { setFinalizando(false); }
  };

  const baixarRelatorioPdf = async (format = 'pdf') => {
    if (!chamadoSelecionado?.id) {
      showToastLocal('danger', 'Nenhum chamado selecionado.');
      return;
    }
    if (chamadoSelecionado.status_chamado !== 'concluido') {
      showToastLocal('warning', 'Relatório disponível apenas para chamados concluídos.');
      return;
    }
    if (String(chamadoSelecionado.tecnico_id) !== String(effectiveCurrentUserId)) {
      showToastLocal('danger', 'Você não tem permissão para gerar este relatório.');
      return;
    }

    const url = `http://localhost:8080/relatorio-chamado/${chamadoSelecionado.id}?format=${encodeURIComponent(format)}`;
    try {
      setBaixando(true);
      if (downloadMode === 'open') {
        window.open(url, '_blank');
        showToastLocal('success', 'Relatório aberto em nova aba.');
      } else {
        const resp = await fetch(url, { method: 'GET', credentials: 'include' });
        if (!resp.ok) {
          let errText = 'Erro ao baixar relatório';
          try { const json = await resp.json(); errText = json.erro || errText; } catch (e) { }
          throw new Error(errText);
        }
        const blob = await resp.blob();
        const cd = resp.headers.get('content-disposition') || '';
        let filename = `relatorio_chamado_${chamadoSelecionado.id}.${format === 'csv' ? 'csv' : 'pdf'}`;
        const match = /filename="?(.+?)"?($|;)/i.exec(cd);
        if (match && match[1]) filename = match[1];
        const link = document.createElement('a');
        const href = URL.createObjectURL(blob);
        link.href = href;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(href);
        showToastLocal('success', 'Download iniciado.');
      }
    } catch (err) {
      console.error('baixarRelatorioPdf:', err);
      showToastLocal('danger', err.message || 'Erro ao gerar/baixar relatório.');
    }
    finally { setBaixando(false); }
  };

  // visibilidade dos botões
  // visibilidade dos botões
  const podeFinalizar = !!(
    chamadoSelecionado &&
    normalizarId(chamadoSelecionado.status_chamado) === "em-andamento" &&
    effectiveCurrentUserId &&
    String(chamadoSelecionado.tecnico_id) === effectiveCurrentUserId
  );

  const podeGerarRelatorio = !!(
    chamadoSelecionado &&
    normalizarId(chamadoSelecionado.status_chamado) === "concluido" &&
    effectiveCurrentUserId &&
    String(chamadoSelecionado.tecnico_id) === effectiveCurrentUserId
  );

  //debug
  useEffect(() => {
    console.log('DEBUG status_chamado:', chamadoSelecionado?.status_chamado);
    console.log('DEBUG tecnico_id:', chamadoSelecionado?.tecnico_id);
    console.log('DEBUG effectiveCurrentUserId:', effectiveCurrentUserId);
  }, [chamadoSelecionado, effectiveCurrentUserId]);

  // formata os tipos de servico
  function formatarLabel(str) {
    if (!str) return ""
    const correcoes = {
      media: "Média",
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

  // calcula tempo restante / data limite
  const [tempoRestante, setTempoRestante] = useState("");

  useEffect(() => {
    if (!chamadoSelecionado?.data_limite) return;

    const atualizarTempo = () => {
      const agora = new Date();
      const limite = new Date(chamadoSelecionado.data_limite);
      const diferenca = limite - agora;

      if (diferenca <= 0) {
        setTempoRestante("Prazo expirado");
        return;
      }

      const horas = Math.floor(diferenca / (1000 * 60 * 60));
      const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

      setTempoRestante(
        `${horas.toString().padStart(2, "0")}:${minutos
          .toString()
          .padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`
      );
    };

    atualizarTempo();
    const intervalo = setInterval(atualizarTempo, 1000);

    return () => clearInterval(intervalo);
  }, [chamadoSelecionado]);
  return ( //PÁGINA
    <>
      {/* conteudo da pagina */}
      <div className="p-4 h-screen w-full ">
        <div className="p-4 mt-14">
          <div className='flex flex-row w-full justify-between mb-15'>
            <div className="w-fit flex flex-row ">

              {/* select */}
              <OrdenarPor  ordenarPor={ordenarPor} setOrdenarPor={setOrdenarPor} />

              <div className="mx-4 border-x border-gray-200"></div>
              {/* Dropdown de Prioridade */}
              <div className="relative inline-block">
                <button onClick={() => setDropdownPrioridadeAberto(!dropdownPrioridadeAberto)} className="text-white bg-violet-700 hover:bg-violet-800 focus:ring-4 focus:outline-none focus:ring-violet-300 poppins-medium rounded-lg text-sm px-8 py-2.5 text-center inline-flex items-center dark:bg-violet-600 dark:hover:bg-violet-700 dark:focus:ring-violet-800" type="button" id="dropdownPrioridadeButton">
                  Prioridade
                  <svg className="w-2.5 h-2.5 ms-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                  </svg>
                </button>

                {dropdownPrioridadeAberto && (
                  <div id="dropdownPrioridade" className="absolute z-10 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-48 dark:bg-gray-700 dark:divide-gray-600">
                    <ul className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownPrioridadeButton">
                      {tiposPrioridade.map((prioridade) => (
                        <li key={prioridade.id}>
                          <div className="flex p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                            <div className="flex items-center h-5">
                              {/* <input id={`prioridade-checkbox-${prioridade.id}`} type="checkbox" name="prioridade" value={prioridade.nome} checked={prioridadesSelecionadas.includes(prioridade.nome)} onChange={(e) => {
                                const checked = e.target.checked;
                                const valor = prioridade.nome;
                                if (checked) {
                                  setPrioridadesSelecionadas((prev) => [...prev, valor]);
                                } else {
                                  setPrioridadesSelecionadas((prev) => prev.filter((p) => p !== valor));
                                }
                              }}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" /> */}
                              <input
                              className="has-checked: text-violet-500 focus: outline-none focus:ring-0"
                                id={`prioridade-checkbox-${prioridade.id}`}
                                type="checkbox"
                                name="prioridade"
                                value={prioridade.id}
                                checked={prioridadesSelecionadas.includes(prioridade.id)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const valor = prioridade.id; // ✅ usar ID, não nome
                                  if (checked) {
                                    setPrioridadesSelecionadas((prev) => [...prev, valor]);
                                  } else {
                                    setPrioridadesSelecionadas((prev) => prev.filter((p) => p !== valor));
                                  }
                                }}
                              />
                            </div>
                            <div className="ms-2 text-sm">
                              <label htmlFor={`prioridade-checkbox-${prioridade.id}`} className="poppins-medium text-gray-900 dark:text-gray-300">{formatarLabel(prioridade.nome)}</label>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

            </div>
            {/* Barra de pesquisa */}
            <form className="flex items-center" onSubmit={(e) => e.preventDefault()} // evita recarregar a página
            >
              <label htmlFor="simple-search" className="sr-only">Search</label>
              <div className="relative w-80">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2" />
                  </svg>
                </div>
                <input type="text" id="simple-search" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white  " placeholder="Pesquisar chamado" value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
            </form>
          </div>
          <section>
            <div className="flex flex-row items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700">
              <ul className="flex flex-wrap -mb-px text-sm poppins-medium text-center">
                {/* Tabs */}
                {statusAbas.map((status) => {
                  const statusId = normalizarId(status)
                  return (
                    <li className="me-2" role="presentation" key={status}>
                      <button onClick={() => setAbaAtiva(statusId)} className={`inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${abaAtiva === statusId ? "active border-violet-500 text-violet-600 dark:text-violet-400" : "border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-neutral-400 dark:hover:text-neutral-300"
                        }`} type="button" >{primeiraLetraMaiuscula(status)}
                      </button>
                    </li>
                  )
                })}
              </ul>

            </div>
            <div id="default-tab-content">
              {statusAbas.map((status) => {
                const statusId = normalizarId(status);
                console.log("Aba ativa:", abaAtiva);

                // Primeiro filtra por status
                let filtradosPorStatus = status === "pendente" ? chamados : chamados.filter((c) => normalizarId(c.status_chamado) === statusId);

                // // Depois aplica filtro de busca
                const statusIdAtivo = abaAtiva;

                // Filtrando apenas com base na aba ativa
                let chamadosFiltrados = chamados
                  .filter((c) => {
                    const correspondeStatus =
                      statusIdAtivo === "todos" || normalizarId(c.status_chamado) === statusIdAtivo;

                    const correspondeBusca =
                      busca.trim() === "" ||
                      c.assunto.toLowerCase().includes(busca.toLowerCase()) ||
                      c.descricao.toLowerCase().includes(busca.toLowerCase()) ||
                      String(c.id).includes(busca);

                    const correspondeSetor =
                      setoresSelecionados.length === 0 ||
                      setoresSelecionados.includes(mapaTipoIdParaTitulo[c.tipo_id]);

                    const correspondePrioridade =
                      prioridadesSelecionadas.length === 0 ||
                      prioridadesSelecionadas.includes(c.prioridade_id);

                    return correspondeStatus && correspondeBusca && correspondeSetor && correspondePrioridade;
                  })
                  .sort((a, b) => {
                    const dataA = new Date(a.criado_em);
                    const dataB = new Date(b.criado_em);
                    return ordenarPor === "mais_antigo" ? dataA - dataB : dataB - dataA;
                  });


                return (
                  <div key={status} className={`${abaAtiva === statusId ? "grid" : "hidden"} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5`} >
                    {chamadosFiltrados.length === 0 ? (
                      <div className="p-4 md:p-5">
                        <p className="text-gray-500 dark:text-neutral-400">Nenhum chamado encontrado.</p>
                      </div>
                    ) : (
                      chamadosFiltrados.map((chamado) => ( //CARD DOS CHAMADOS
                        <div key={chamado.id} onClick={() => { setChamadoSelecionado(chamado); setIsOpen(true); }} className="justify-between p-4 md:p-5 flex flex-col bg-white border border-gray-200 border-t-4 border-t-blue-600 shadow-2xs rounded-xl  dark:bg-gray-800 dark:border-gray-700 dark:border-t-blue-500 dark:shadow-neutral-700/70 cursor-pointer">
                          <div className="flex items-center flex-wrap gap-4 justify-between pt-2 pb-4 mb-4 border-b border-gray-200 dark:border-neutral-700">
                            <h3 className="wrap-break-word break-normal whitespace-normal text-base poppins-bold text-gray-800 dark:text-white">{primeiraLetraMaiuscula(chamado.assunto)}</h3>
                            <button type="button" className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 poppins-medium rounded-full text-sm px-5 py-1 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">{primeiraLetraMaiuscula(chamado.status_chamado)}</button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-neutral-500">Usuário</p>
                              <p className="text-sm poppins-bold text-gray-800 dark:text-white">{chamado.nome_usuario || "Nome não informado"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-neutral-500">Criado em</p>
                              <p className="text-sm poppins-bold text-gray-800 dark:text-white">{" "} {new Date(chamado.criado_em).toLocaleDateString("pt-BR", {
                                month: "short", // abreviação do mês
                                day: "numeric", // dia
                                year: "numeric", // ano
                              })}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-neutral-500">Prioridade</p>
                              <p className="text-sm poppins-bold text-gray-800 dark:text-white">{formatarLabel(tiposPrioridade.find(p => p.id === chamado.prioridade_id)?.nome || "Sem prioridade")}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-neutral-500">Chamado ID</p>
                              <p className="text-sm poppins-bold text-gray-800 dark:text-white">#{chamado.id}</p>
                            </div>
                          </div>
                          {/* botão para pegar chamado, só se aba htmlFor pendente */}
                          {chamado.status_chamado === 'pendente' && (
                            <button onClick={(e) => {
                              e.stopPropagation(); // evitar que abra o modal
                              pegarChamado(chamado.id);
                            }} className="mt-4 bg-violet-500 hover:bg-violet-600 text-white text-sm px-4 py-2 rounded-lg" >
                              Pegar chamado
                            </button>
                          )}
                        </div>

                      ))
                    )}
                  </div>
                );
              })}
            </div>

            {/* Drawer */}
            {isOpen && chamadoSelecionado && (
              (chamadoSelecionado.status_chamado === 'pendente') ? (
                <div id="drawer-right-example" className={`fixed top-0 right-0 z-99 h-screen p-4 overflow-y-auto transition-transform border-l border-gray-200 dark:border-neutral-700 bg-white w-80 dark:bg-gray-800 ${isOpen ? "translate-x-0" : "translate-x-full"}`} tabIndex="-1" aria-labelledby="drawer-right-label" >
                  <h5 id="drawer-right-label" className="inline-flex items-center mb-4 text-base poppins-semibold text-gray-500 dark:text-gray-400">
                    <svg className="w-4 h-4 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>Detalhes do chamado</h5>
                  <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white" >
                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                    </svg>
                    <span className="sr-only">Close menu</span>
                  </button>
                  <div>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Usuário</p>
                    <p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-400 break-word">{chamadoSelecionado?.nome_usuario || 'Nome não encontrado'}</p>
                  </div>
                  <div>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Assunto</p>
                    <p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-400 break-all">{chamadoSelecionado?.assunto}</p>
                  </div>
                  <div>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Descrição</p>
                    <p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-400 break-all">{chamadoSelecionado?.descricao}</p>
                  </div>
                  <div>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Tipo de serviço</p>
                    <p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-400">{formatarLabel(tiposServico.find(p => p.id === chamadoSelecionado.tipo_id)?.titulo || "Serviço não informado")}</p>
                  </div>
                  <div>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Imagem</p>
                    {chamadoSelecionado?.imagem ? (<img src={`http://localhost:8080/uploads/${chamadoSelecionado.imagem}`} alt="Imagem do chamado" className="mb-6 rounded-lg w-full max-w-md" />) : (<p className="mb-6 text-sm poppins-medium text-gray-600 dark:text-gray-400">Nenhuma imagem foi enviada para este chamado.</p>)}
                  </div>

                  <div>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Prioridade</p>
                    <p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-400">{formatarLabel(tiposPrioridade.find(p => p.id === chamadoSelecionado.prioridade_id)?.nome || "Sem prioridade")}</p>
                  </div>
                  <div>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Chamado ID</p>
                    <p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-400">#{chamadoSelecionado?.id}</p>
                  </div>

                  <div className="">
                    <button onClick={async (e) => { e.stopPropagation(); await pegarChamado(chamadoSelecionado.id); setIsOpen(false); }} className="inline-flex items-center px-4 py-2 text-sm poppins-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Pegar chamado<svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                    </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div id="drawer-right-example" className={`fixed top-0 right-0 z-99 h-screen overflow-y-auto transition-transform border-l border-gray-200 dark:border-neutral-700 bg-[#F8FAFB] w-full dark:bg-gray-800 ${isOpen ? "translate-x-0" : "translate-x-full"}`} tabIndex="-1" aria-labelledby="drawer-right-label" >
                  <ChatWidget className='!fixed right-0 bottom-0' chamadoSelecionado={chamadoSelecionado}></ChatWidget>
                  <div className="w-full p-4 bg-white dark:bg-gray-900">
                    <h5 id="drawer-right-label" className="inline-flex items-center text-base poppins-semibold text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                      </svg>Detalhes do chamado
                    </h5>
                    <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white" >
                      <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                      </svg>
                      <span className="sr-only">Close menu</span>
                    </button>
                  </div>

                  <div className="w-full h-full justify-between flex flex-col">
                    {/*informaç~eos do chamado */}
                    <div className="w-full p-10">
                      <div className="relative">
                        {/* Conteúdo */}
                        <div className={` grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-10 transition-all duration-300 overflow-hidden ${expandido ? "max-h-full" : "max-h-48 md:max-h-full"} `}>
                          <div>
                            <p className="mb-2 text-base text-gray-500 dark:text-gray-400">Usuário</p>
                            <p className="mb-6 text-lg poppins-bold text-gray-800 dark:text-gray-400">
                              {chamadoSelecionado?.nome_usuario || "Nome não encontrado"}
                            </p>
                          </div>
                          <div>
                            <p className="mb-2 text-base text-gray-500 dark:text-gray-400">Assunto</p>
                            <p className="mb-6 text-lg poppins-bold text-gray-800 dark:text-gray-400 break-all">{chamadoSelecionado?.assunto}</p>
                          </div>
                          <div>
                            <p className="mb-2 text-base text-gray-500 dark:text-gray-400">Tipo de serviço</p>
                            <p className="mb-6 text-lg poppins-bold text-gray-800 dark:text-gray-400">{formatarLabel(tiposServico.find(p => p.id === chamadoSelecionado.tipo_id)?.titulo || "Serviço não informado")}</p>
                          </div>
                          <div>
                            <p className="mb-2 text-base text-gray-500 dark:text-gray-400">Patrimônio</p>
                            <p className="mb-6 text-lg poppins-bold text-gray-800 dark:text-gray-400">{chamadoSelecionado?.patrimonio}</p>
                          </div>
                          <div>
                            <p className="mb-2 text-base text-gray-500 dark:text-gray-400">Prioridade</p>
                            <p className="mb-6 text-lg poppins-bold text-gray-800 dark:text-gray-400">{formatarLabel(tiposPrioridade.find(p => p.id === chamadoSelecionado.prioridade_id)?.nome || "Sem prioridade")}</p>
                          </div>
                          <div>
                            <p className="mb-2 text-base text-gray-500 dark:text-gray-400">Criado em</p>
                            <p className="mb-6 text-lg poppins-bold text-gray-800 dark:text-gray-400">
                              {new Date(chamadoSelecionado?.criado_em)
                                .toLocaleDateString("pt-BR")
                                .replace(/(\d{4})$/, (ano) => ano.slice(-2))}
                            </p>
                          </div>
                          <div>
                            <p className="mb-2 text-base text-gray-500 dark:text-gray-400">Prazo (data limite)</p>
                            <p className="mb-6 text-lg poppins-bold text-gray-800 dark:text-gray-400">{tempoRestante}</p>
                          </div>
                          <div>
                            <p className="mb-2 text-base text-gray-500 dark:text-gray-400">Chamado ID</p>
                            <p className="mb-6 text-lg poppins-bold text-gray-800 dark:text-gray-400">#{chamadoSelecionado?.id}</p>
                          </div>
                        </div>

                        {/* Fade + botão só em telas pequenas */}
                        {!expandido && (
                          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-gray-50 dark:from-gray-900 lg:hidden flex items-end justify-center">
                            <button className="mb-2 flex items-center gap-2 px-4 py-1 bg-white dark:bg-gray-800 border rounded-full shadow-md" onClick={() => setExpandido(true)}>
                              <span className="text-sm text-gray-600 dark:text-gray-300">Ver mais</span>
                              <span className="w-4 h-4">▼</span>
                            </button>
                          </div>
                        )}

                        {expandido && (
                          <div className="md:hidden flex justify-center">
                            <button className="flex items-center gap-2 px-4 py-1 bg-white dark:bg-gray-800 border rounded-full shadow-md" onClick={() => setExpandido(false)}>
                              <span className="text-sm text-gray-600 dark:text-gray-300">Ver menos</span>
                              <span className="w-4 h-4">▲</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>


                    <div className="w-full p-10 h-full">
                      <div className="w-full">
                        <h1 className="text-2xl poppins-bold mb-6 dark:text-white">Apontamentos do chamado #{chamadoSelecionado?.id}</h1>

                        <ol className="relative bg-white dark:bg-gray-900 rounded-lg border-s border-gray-300 dark:border-gray-600 mb-10">
                          {apontamentos.map((a) => (
                            <li key={a.id} className="mb-10 py-4 ms-4 dark:bg-gray-900">
                              <div className={`absolute w-3 h-3 rounded-full mt-1.5 -start-1.5 ${a.fim ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                              <time className="mb-1 text-sm text-gray-500">
                                {new Date(a.comeco).toLocaleString('pt-BR')}
                              </time>
                              <h3 className="text-lg poppins-semibold dark:text-white">
                                {a.fim ? 'Apontamento finalizado' : 'Apontamento em andamento'}
                              </h3>
                              <p className="text-gray-700 dark:text-white">{a.descricao}</p>
                              {a.fim && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Encerrado em {new Date(a.fim).toLocaleString('pt-BR')}
                                </p>
                              )}
                            </li>
                          ))}
                        </ol>

                        {!apontamentoAtivo && (
                          <div className="mb-6">
                            <label htmlFor="descricao" className="block mb-2 text-sm poppins-medium text-gray-900 dark:text-gray-200">
                              Nova atividade realizada
                            </label>
                            <textarea
                              id="descricao"
                              rows="4"
                              value={descricao}
                              onChange={(e) => setDescricao(e.target.value)}
                              className="w-full p-2.5 text-sm text-gray-900 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                              placeholder="Descreva o que foi feito..."
                            />
                            <button onClick={iniciarApontamento} className="mt-4 flex flex-row gap-2 items-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pass-fill" viewBox="0 0 16 16">
                              <path d="M10 0a2 2 0 1 1-4 0H3.5A1.5 1.5 0 0 0 2 1.5v13A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 12.5 0zM4.5 5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1m0 2h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1 0-1" />
                            </svg>Adicionar apontamento</button>
                          </div>
                        )}

                        {apontamentoAtivo && (
                          <div className="mt-6">
                            <p className="text-sm text-gray-700 mb-2"> Apontamento em andamento desde:{' '}
                              {new Date(apontamentoAtivo.comeco).toLocaleString('pt-BR')}
                            </p>
                            <button
                              onClick={() => finalizarApontamento(apontamentoAtivo.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >Fechar apontamento</button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mb-6">
                        {podeFinalizar && (
                          <button onClick={() => setMostrarModalConfirmacao(true)} disabled={finalizando} className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-violet-600 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-violet-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" >{finalizando ? "Finalizando..." : "Finalizar Chamado"}</button>
                        )}

                        {podeGerarRelatorio && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                baixarRelatorioPdf("pdf");
                              }}
                              disabled={baixando}
                              className="inline-flex items-center px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                            >
                              {baixando ? "Gerando PDF..." : "Gerar / Baixar PDF"}
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                baixarRelatorioPdf("csv");
                              }}
                              disabled={baixando}
                              className="inline-flex items-center px-3 py-2 text-sm text-white bg-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-60"
                            >
                              {baixando ? "Gerando CSV..." : "Baixar CSV"}
                            </button>
                          </>
                        )}

                      </div>
                    </div>

                  </div>

                  {/* === Modal de confirmação Finalizar Chamado === */}
                  {mostrarModalConfirmacao && (
                    <div className="fixed inset-0 z-[999] h-screen flex items-center justify-center bg-black/30">
                      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        <div className="text-center">
                          <svg
                            className="mx-auto mb-4 text-gray-400 w-12 h-12"
                            fill="none"
                            viewBox="0 0 20 20"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                          </svg>
                          <h3 className="mb-5 text-lg poppins-regular text-gray-500">
                            Tem certeza que deseja finalizar este chamado?
                          </h3>

                          <button
                            onClick={async () => {
                              setMostrarModalConfirmacao(false);
                              await finalizarChamado();
                            }}
                            disabled={finalizando}
                            className="text-white bg-[#7F56D8] focus:ring-4 focus:outline-none focus:ring-[#7F56D8] poppins-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center disabled:opacity-60"
                          >
                            {finalizando ? "Finalizando..." : "Sim, finalizar"}
                          </button>

                          <button
                            onClick={() => setMostrarModalConfirmacao(false)}
                            className="py-2.5 px-5 ms-3 text-sm poppins-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-[#7F56D8] focus:z-10 focus:ring-4 focus:ring-gray-100"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            )}



          </section>
        </div >
      </div >

      {/* TOASTS: canto inferior direito */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-[60]">
        {toasts.map(({ id, type, message }) => (
          <div key={id} className={`flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800 border ${type === 'success' ? 'border-green-100' : type === 'danger' ? 'border-red-100' : 'border-orange-100'}`} role="alert">
            <div className={`inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg ${type === 'success' ? 'text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200' : type === 'danger' ? 'text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200' : 'text-orange-500 bg-orange-100 dark:bg-orange-700 dark:text-orange-200'}`} >
              {type === 'success' && (
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                </svg>
              )}
              {type === 'danger' && (
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
                </svg>
              )}
              {type === 'warning' && (
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z" />
                </svg>
              )}
            </div>

            <div className="ms-3 text-sm font-normal max-w-xs break-words">{message}</div>

            <button type="button" onClick={() => removeToast(id)} className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Close">
              <span className="sr-only">Close</span>
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
              </svg>
            </button>
          </div>
        ))}
      </div>

    </>
  )
}