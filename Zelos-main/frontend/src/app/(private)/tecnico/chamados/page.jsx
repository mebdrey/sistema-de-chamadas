"use client"
import { useEffect, useState, useMemo } from "react";
import { initFlowbite } from 'flowbite'
import { useRouter } from 'next/navigation';
import OrdenarPor from '@/components/DropDown/DropDown.jsx'

export default function ChamadosTecnico() {
  const [isOpen, setIsOpen] = useState(false); // p drawer abrir e fechar
  const [isMounted, setIsMounted] = useState(false); // espera o componente estar carregado no navegador p evitar erros de renderizacao
  const [chamados, setChamados] = useState([]) // p selecionar os chamados com base no status
  const [abaAtiva, setAbaAtiva] = useState('pendente')
  const [tiposServico, setTiposServico] = useState([]); // mostra os tipos de servicos/setores
  const [setoresSelecionados, setSetoresSelecionados] = useState([]); // guarda o tipo de servico selecionado
  const [busca, setBusca] = useState(""); // armazena o que for digitado no campo de busca
  const [dropdownSetorAberto, setDropdownSetorAberto] = useState(false);
  const [dropdownPrioridadeAberto, setDropdownPrioridadeAberto] = useState(false);
  const [prioridadesSelecionadas, setPrioridadesSelecionadas] = useState([]); // 
  const [ordenarPor, setOrdenarPor] = useState('mais_recente'); // ordenar por mais recente ou mais antigo, por padrao ele mostra os mais recentes primeiro
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null);

  const [apontamentos, setApontamentos] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [apontamentoAtivo, setApontamentoAtivo] = useState(null);

  // Buscar apontamentos 
 useEffect(() => {
  const buscarApontamentos = async () => {
    if (!chamadoSelecionado?.id) return;

    try {
      const response = await fetch(`http://localhost:8080/apontamentos/${chamadoSelecionado.id}`);
      const data = await response.json();

      setApontamentos(data);
      setApontamentoAtivo(data.find((a) => !a.fim));
    } catch (error) {
      console.error('Erro ao buscar apontamentos:', error);
    }
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

    if (!response.ok) throw new Error('Erro ao criar apontamento');

    // Atualiza a lista após criar
    const res = await fetch(`http://localhost:8080/apontamentos/${chamadoSelecionado.id}`);
    const data = await res.json();
    setApontamentos(data);
    setApontamentoAtivo(data.find((a) => !a.fim));
    setDescricao('');
  } catch (error) {
    console.error('Erro ao criar apontamento:', error);
  }
};

// finalizar apontamento
const finalizarApontamento = async (id) => {
  try {
    const response = await fetch('http://localhost:8080/finalizar-apontamento', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apontamento_id: id })
    });

    if (!response.ok) throw new Error('Erro ao finalizar apontamento');

    // Atualiza a lista após finalizar
    const res = await fetch(`http://localhost:8080/apontamentos/${chamadoSelecionado.id}`);
    const data = await res.json();
    setApontamentos(data);
    setApontamentoAtivo(null);
  } catch (error) {
    console.error('Erro ao finalizar apontamento:', error);
  }
};


  useEffect(() => {
    setIsMounted(true);
    initFlowbite(); // inicializa dropdowns, modais, etc.
  }, []);

  // useEffect(() => {
  //     setIsMounted(true);
  // }, []);

  // // verifica se esta logado/autorizado
  // useEffect(() => {
  //     fetch('http://localhost:8080/auth/check-auth', { credentials: 'include' })
  //         .then(res => {
  //             if (!res.ok) throw new Error();
  //             return res.json();
  //         })
  //         .then(data => {
  //             console.log('Usuário autenticado:', data.user);
  //         })
  //         .catch(() => {
  //             router.push('/login');
  //         });
  // }, []);

  // busca os chamados feitos pelo usuario
  // useEffect(() => {
  //   fetch('http://localhost:8080/todos-chamados', { credentials: 'include' })
  //     .then(res => {
  //       if (!res.ok) throw new Error('Erro ao buscar chamados');
  //       return res.json();
  //     })
  //     .then(data => {
  //       console.log('Chamados recebidos:', data);
  //       setChamados(Array.isArray(data) ? data : data.chamados || []);
  //     })
  //     .catch(err => {
  //       console.error('Erro ao carregar chamados:', err);
  //       setChamados([]);
  //     });
  // }, []);

  const atualizarChamados = async () => {
    try {
      if (abaAtiva === 'todos') {
        const [pendente, andamento, concluido] = await Promise.all([
          fetch('http://localhost:8080/chamados-funcionario?status=pendente', { credentials: 'include' }).then(res => res.json()),
          fetch('http://localhost:8080/chamados-funcionario?status=em andamento', { credentials: 'include' }).then(res => res.json()),
          fetch('http://localhost:8080/chamados-funcionario?status=concluido', { credentials: 'include' }).then(res => res.json()),
        ]);
        setChamados([...pendente, ...andamento, ...concluido]);
      } else {
        const response = await fetch(
          `http://localhost:8080/chamados-funcionario?status=${abaAtiva.replace('-', ' ')}`,
          { credentials: 'include' }
        );
        const data = await response.json();
        setChamados(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Erro ao carregar chamados:', err);
      setChamados([]);
    }
  };

  useEffect(() => {
    atualizarChamados();
  }, [abaAtiva]);


  function primeiraLetraMaiuscula(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // STATUS DOS CHAMAFOS
  const statusAbas = ['pendente', 'em andamento', 'concluído', 'todos'];
  // funcao p normalizar id
  const normalizarId = (texto) =>
    typeof texto === 'string' ? texto.toLowerCase().replace(/\s+/g, '-') : '';

  // array com prioridade
  const prioridades = [
    { label: 'Alta', value: 'alta' },
    { label: 'Média', value: 'media' },
    { label: 'Baixa', value: 'baixa' }
  ];

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chamado_id: chamadoId }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.erro || 'Erro ao pegar chamado');

      alert(data.mensagem);
      atualizarChamados(); // recarrega a aba
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      {/* conteudo da pagina */}
      <div className="p-4 w-full">
        <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">

          <div className='flex flex-row w-full justify-between mb-15'>
            <div className="w-fit flex flex-row ">

              {/* select */}

              <OrdenarPor ordenarPor={ordenarPor} setOrdenarPor={setOrdenarPor} />

              <div className="mx-4 border-x border-gray-200"></div>


              {/* Dropdown de Prioridade */}
              <div className="relative inline-block">
                <button onClick={() => setDropdownPrioridadeAberto(!dropdownPrioridadeAberto)} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-8 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button" id="dropdownPrioridadeButton">
                  Prioridade
                  <svg className="w-2.5 h-2.5 ms-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                  </svg>
                </button>

                {dropdownPrioridadeAberto && (
                  <div id="dropdownPrioridade" className="absolute z-10 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-48 dark:bg-gray-700 dark:divide-gray-600">
                    <ul className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownPrioridadeButton">
                      {prioridades.map((prioridade, index) => (
                        <li key={index}>
                          <div className="flex p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                            <div className="flex items-center h-5">
                              <input id={`prioridade-checkbox-${index}`} type="checkbox" name="prioridade" value={prioridade.value} checked={prioridadesSelecionadas.includes(prioridade.value)}
                                onChange={(e) => {
                                  const checked = e.target.checked; const valor = prioridade.value;
                                  if (checked) {
                                    setPrioridadesSelecionadas((prev) => [...prev, valor]);
                                  } else {
                                    setPrioridadesSelecionadas((prev) =>
                                      prev.filter((p) => p !== valor)
                                    );
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                            </div>
                            <div className="ms-2 text-sm">
                              <label htmlFor={`prioridade-checkbox-${index}`} className="font-medium text-gray-900 dark:text-gray-300">
                                {prioridade.label}
                              </label>
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
                <input type="text" id="simple-search" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Pesquisar chamado" value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
            </form>
          </div>
          <section>
            <div className="flex flex-row items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700">
              <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                {/* Tabs */}
                {statusAbas.map((status) => {
                  const statusId = normalizarId(status)
                  return (
                    <li className="me-2" role="presentation" key={status}>
                      <button onClick={() => setAbaAtiva(statusId)} className={`inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${abaAtiva === statusId ? "active border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-neutral-400 dark:hover:text-neutral-300"
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
                      prioridadesSelecionadas.includes(c.prioridade);

                    return correspondeStatus && correspondeBusca && correspondeSetor && correspondePrioridade;
                  })
                  .sort((a, b) => {
                    const dataA = new Date(a.criado_em);
                    const dataB = new Date(b.criado_em);
                    return ordenarPor === "mais_antigo" ? dataA - dataB : dataB - dataA;
                  });


                return (
                  <div key={status} className={`${abaAtiva === statusId ? "block" : "hidden"} grid lg:grid-cols-5 bg-white dark:bg-neutral-900 gap-5`} >
                    {chamadosFiltrados.length === 0 ? (
                      <div className="p-4 md:p-5">
                        <p className="text-gray-500 dark:text-neutral-400"> Nenhum chamado encontrado.
                        </p>
                      </div>
                    ) : (
                      chamadosFiltrados.map((chamado) => (
                        <div key={chamado.id} onClick={() => { setChamadoSelecionado(chamado); setIsOpen(true); }} className=" p-4 md:p-5 flex flex-col bg-white border border-gray-200 border-t-4 border-t-blue-600 shadow-2xs rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:border-t-blue-500 dark:shadow-neutral-700/70 cursor-pointer">
                          <div className="flex items-center gap-4 justify-between pt-2 pb-4 mb-4 border-b border-gray-200 dark:border-neutral-700">
                            <h3 className="text-base font-bold text-gray-800 dark:text-white">{primeiraLetraMaiuscula(chamado.assunto)}</h3>
                            <button type="button" className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-1 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">{primeiraLetraMaiuscula(chamado.status_chamado)}</button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-neutral-500">Usuário</p>
                              <p className="text-sm font-bold text-gray-800 dark:text-white">Nome usuario</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-neutral-500">Criado em</p>
                              <p className="text-sm font-bold text-gray-800 dark:text-white">{" "} {new Date(chamado.criado_em).toLocaleDateString("pt-BR", {
                                month: "short", // abreviação do mês
                                day: "numeric", // dia
                                year: "numeric", // ano
                              })}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-neutral-500">Prioridade</p>
                              <p className="text-sm font-bold text-gray-800 dark:text-white">{chamado.prioridade}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-neutral-500">Chamado ID</p>
                              <p className="text-sm font-bold text-gray-800 dark:text-white">#{chamado.id}</p>
                            </div>
                          </div>
                          {/* botão para pegar chamado, só se aba for pendente */}
                          {chamado.status_chamado === 'pendente' && (
                            <button onClick={(e) => {
                              e.stopPropagation(); // evitar que abra o modal
                              pegarChamado(chamado.id);
                            }} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg" >
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
            <div className="flex flex-col items-center mt-15 mb-8">
              <span className="text-sm text-gray-700 dark:text-gray-400 mb-3">
                Mostrando <span className="font-semibold text-gray-900 dark:text-white">1</span> a <span className="font-semibold text-gray-900 dark:text-white">10</span> de <span className="font-semibold text-gray-900 dark:text-white">100</span> registros
              </span>

              <div className="flex">
                <a href="#" className="flex items-center justify-center px-3 h-8 me-3 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                  <svg className="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0 4 4M1 5l4-4" />
                  </svg>
                  Anterior
                </a>
                <a href="#" className="flex items-center justify-center px-3 h-8 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                  Próximo
                  <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                  </svg>
                </a>
              </div>

            </div>

            {/* Drawer */}
            {/* <div id="drawer-right-example" className={`fixed top-0 right-0 z-99 h-screen p-4 overflow-y-auto transition-transform border-l border-gray-200 dark:border-neutral-700 bg-white w-80 dark:bg-gray-800 ${isOpen ? "translate-x-0" : "translate-x-full"}`}  tabIndex="-1" aria-labelledby="drawer-right-label" >
              <h5 id="drawer-right-label" className="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400">
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
                <p className="mb-6 text-sm font-bold text-gray-800 dark:text-gray-400">{chamadoSelecionado?.nome_usuario || 'Nome não encontrado'}</p>
              </div>
              <div>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Assunto</p>
                <p className="mb-6 text-sm font-bold text-gray-800 dark:text-gray-400">{chamadoSelecionado?.assunto}</p>
              </div>
              <div>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Descrição</p>
                <p className="mb-6 text-sm font-bold text-gray-800 dark:text-gray-400">{chamadoSelecionado?.descricao}</p>
              </div>
              <div>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Imagem</p>
                {chamadoSelecionado?.imagem ? ( <img src={chamadoSelecionado.imagem} alt="Imagem do chamado" className="mb-6 rounded-lg w-full max-w-md" /> ) : ( <p className="mb-6 text-sm font-medium text-gray-600 dark:text-gray-400">Nenhuma imagem foi enviada para este chamado.</p>)}
              </div>
             
              <div>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Prioridade</p>
                <p className="mb-6 text-sm font-bold text-gray-800 dark:text-gray-400">{chamadoSelecionado?.prioridade}</p>
              </div>
              <div>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Chamado ID</p>
                <p className="mb-6 text-sm font-bold text-gray-800 dark:text-gray-400">#{chamadoSelecionado?.id}</p>
              </div>

              <div className="">
                <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Pegar chamado<svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                  </svg>
                </button>
              </div>
            </div> */}
            <div id="drawer-right-example" className={`fixed top-0 right-0 z-99 h-screen overflow-y-auto transition-transform border-l border-gray-200 dark:border-neutral-700 bg-[#F8FAFB] w-full dark:bg-gray-800 ${isOpen ? "translate-x-0" : "translate-x-full"}`} tabIndex="-1" aria-labelledby="drawer-right-label" >
              <div className="w-full p-4 bg-white">
                <h5 id="drawer-right-label" className="inline-flex items-center text-base font-semibold text-gray-500 dark:text-gray-400">
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

              <div className="w-full h-full justify-between flex flex-row">
                {/*informaç~eos do chamado */}
                <div className="w-2/3 p-10">
                  <div className="grid grid-cols-2 mb-10">
                    <div>
                      <p className="mb-2 text-base text-gray-500 dark:text-gray-400">Usuário</p>
                      <p className="mb-6 text-lg font-bold text-gray-800 dark:text-gray-400">{chamadoSelecionado?.nome_usuario || 'Nome não encontrado'}</p>
                    </div>
                    <div>
                      <p className="mb-2 text-base text-gray-500 dark:text-gray-400">Assunto</p>
                      <p className="mb-6 text-lg font-bold text-gray-800 dark:text-gray-400">{chamadoSelecionado?.assunto}</p>
                    </div>

                    <div>
                      <p className="mb-2 text-base text-gray-500 dark:text-gray-400">Prioridade</p>
                      <p className="mb-6 text-lg font-bold text-gray-800 dark:text-gray-400">{chamadoSelecionado?.prioridade}</p>
                    </div>
                    <div>
                      <p className="mb-2 text-base text-gray-500 dark:text-gray-400">Chamado ID</p>
                      <p className="mb-6 text-lg font-bold text-gray-800 dark:text-gray-400">#{chamadoSelecionado?.id}</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-2.5">
                    <img class="w-8 h-8 rounded-full" src="/docs/images/people/profile-picture-3.jpg" alt="Jese image" />
                    <div class="flex flex-col gap-1 w-2/3 ">
                      <div class="flex items-center space-x-2 rtl:space-x-reverse">
                        <span class="text-sm font-semibold text-gray-900 dark:text-white">Bonnie Green</span>
                        <span class="text-sm font-normal text-gray-500 dark:text-gray-400">{chamadoSelecionado?.criado_em}</span>
                      </div>
                      <div class="flex flex-col leading-1.5 p-4 border-gray-200 bg-white rounded-e-xl rounded-es-xl dark:bg-gray-700">
                        <p class="text-sm font-normal text-gray-900 dark:text-white">{chamadoSelecionado?.descricao}</p>
                        <div>
                          {chamadoSelecionado?.imagem ? (<img src={chamadoSelecionado.imagem} alt="Imagem do chamado" className="mt-6 rounded-lg w-full max-w-md" />) : (<p className="mt-6 text-sm font-medium text-gray-600 dark:text-gray-400">Nenhuma imagem foi enviada para este chamado.</p>)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-start gap-2.5 justify-end">
                    <img class="w-8 h-8 rounded-full order-2" src="/docs/images/people/profile-picture-3.jpg" alt="Jese image" />
                    <div class="flex flex-col gap-1 w-2/3 items-end text-right">
                      <div class="flex items-center space-x-2 rtl:space-x-reverse flex-row">
                        <span class="text-sm font-semibold text-gray-900 dark:text-white">Bonnie Green</span>
                        <span class="text-sm font-normal text-gray-500 dark:text-gray-400">{chamadoSelecionado?.criado_em}</span>
                      </div>
                      <div class="flex flex-col leading-1.5 p-4 border-gray-200 bg-[#E6DAFF] rounded-s-xl rounded-ss-xl dark:bg-gray-700">
                        <p class="text-sm font-normal text-gray-900 dark:text-white">Resposta do tecnico</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* apontamentos */}
                <div className="w-1/3 bg-white p-10 h-full">
                  <div className="w-full px-4 py-8">
                    <h1 className="text-2xl font-bold mb-6">Apontamentos do chamado #{chamadoSelecionado?.id}</h1>

                    {/* Timeline */}
                    <ol className="relative border-s border-gray-300 mb-10">
                      {apontamentos.map((a) => (
                        <li key={a.id} className="mb-10 ms-4">
                          <div className={`absolute w-3 h-3 rounded-full mt-1.5 -start-1.5 ${a.fim ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <time className="mb-1 text-sm text-gray-500">
                            {new Date(a.comeco).toLocaleString('pt-BR')}
                          </time>
                          <h3 className="text-lg font-semibold">
                            {a.fim ? 'Apontamento finalizado' : 'Apontamento em andamento'}
                          </h3>
                          <p className="text-gray-700">{a.descricao}</p>
                          {a.fim && (
                            <p className="text-sm text-gray-500 mt-1">
                              Encerrado em {new Date(a.fim).toLocaleString('pt-BR')}
                            </p>
                          )}
                        </li>
                      ))}
                    </ol>

                    {/* Formulário */}
                    {!apontamentoAtivo && (
                      <div className="mb-6">
                        <label htmlFor="descricao" className="block mb-2 text-sm font-medium text-gray-900">
                          Nova atividade realizada
                        </label>
                        <textarea
                          id="descricao"
                          rows="4"
                          value={descricao}
                          onChange={(e) => setDescricao(e.target.value)}
                          className="w-full p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Descreva o que foi feito..."
                        />
                        <button onClick={iniciarApontamento} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition" >Adicionar apontamento</button>
                      </div>
                    )}

                    {/* Botão para encerrar apontamento */}
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
                </div>
              </div>

            </div>
          </section>
        </div >
      </div >


    </>
  )
}