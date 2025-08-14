"use client"
import { useEffect, useState } from "react";
import { initFlowbite } from 'flowbite'
import { useRouter } from 'next/navigation';


export default function ChamadosAdmin() {
  const [isOpen, setIsOpen] = useState(false); // p drawer abrir e fechar
  const [selecionarPeriodo, setSelecionarPeriodo] = useState('mes') // "mes" = esse mês // select de periodo 
  const [isMounted, setIsMounted] = useState(false); // espera o componente estar carregado no navegador p evitar erros de renderizacao
  const [chamados, setChamados] = useState([]) // p selecionar os chamados com base no status
  const [abaAtiva, setAbaAtiva] = useState('todos')
  const [tiposServico, setTiposServico] = useState([]); // guarda o tipo de serviço que o usuario seleciona 
  // const [tipoSelecionadoId, setTipoSelecionadoId] = useState(''); // id do servico
  // const router = useRouter();
  // const [blocos, setBlocos] = useState([]); // guarda a sala e bloco selecionada 
  // const [salas, setSalas] = useState([]);
  // const [salaSelecionada, setSalaSelecionada] = useState('');
  // const [blocoSelecionado, setBlocoSelecionado] = useState('');
  // const [imagemPreview, setImagemPreview] = useState(null); // preview da imagem
  // const [imagemArquivo, setImagemArquivo] = useState(null); // gaurda o arquivo da imagem
  // const [assunto, setAssunto] = useState(''); // gaurda o assunto do chamado
  // const [descricao, setDescricao] = useState(''); // gaurda a descricao do chamado
  const [busca, setBusca] = useState(""); // armazena o que for digitado no campo de busca

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
  useEffect(() => {
    fetch('http://localhost:8080/todos-chamados', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao buscar chamados');
        return res.json();
      })
      .then(data => {
        console.log('Chamados recebidos:', data);
        setChamados(Array.isArray(data) ? data : data.chamados || []);
      })
      .catch(err => {
        console.error('Erro ao carregar chamados:', err);
        setChamados([]);
      });
  }, []);


  function primeiraLetraMaiuscula(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // STATUS DOS CHAMAFOS
  const statusAbas = ['todos', 'pendente', 'em andamento', 'concluído'];
  // funcao p normalizar id
  const normalizarId = (texto) => texto.toLowerCase().replace(/\s+/g, '-')

  // array com periodos
  const periodos = [
    { label: 'Essa semana', value: 'semana' },
    { label: 'Esse mês', value: 'mes' },
    { label: 'Esse ano', value: 'ano' }
  ];

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
      .then(data => setTiposServico(data))
      .catch(err => console.error('Erro ao carregar tipos:', err));
  }, []);

  return (
    <>
      {/* <SideBar userType="usuario" /> */}
      {/* conteudo da pagina */}
      <div className="p-4 w-full">
        <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">

          <div className='flex flex-row w-full justify-between mb-15'>
            <div className="w-fit flex flex-row ">

              {/* select */}
              <button id="dropdownFiltroBtn" data-dropdown-toggle="dropdownFiltro" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-8 py-2.5 h-fit text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">Filtros <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
              </svg>
              </button>
              <div id="dropdownFiltro" className="z-10 hidden w-48 bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600">
                {isMounted &&
                  periodos.map((periodo, index) => (
                    <div key={index} className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                      <input id={`periodo-radio-${index}`} type="radio" value={periodo.value} name="periodo" checked={selecionarPeriodo === periodo.value} onChange={() => setSelecionarPeriodo(periodo.value)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                      <label htmlFor={`periodo-radio-${index}`} className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">
                        {periodo.label}
                      </label>
                    </div>
                  ))}
              </div>
              <div className="mx-4 border-x border-gray-200"></div>
              <button id="dropdownSetorBtn" data-dropdown-toggle="dropdownSetor" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg  text-sm px-8 py-2.5 h-fit text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">Setor <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
              </svg>
              </button>
              <div id="dropdownSetor" className="z-10 hidden w-48 bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600">
                {isMounted &&
                  periodos.map((setor, index) => (
                    <div key={index} className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                      <input id={`setor-radio-${index}`} type="radio" value={setor.value} name="setor" checked={selecionarPeriodo === setor.value} onChange={() => setSelecionarPeriodo(setor.value)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                      <label htmlFor={`setor-radio-${index}`} className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">
                        {setor.label}
                      </label>
                    </div>
                  ))}
              </div>

              <div className="mx-4 border-x border-gray-200"></div>

              <button id="dropdownPrioridadeBtn" data-dropdown-toggle="dropdownPrioridade" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-8 py-2.5 h-fit text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">Prioridade <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
              </svg>
              </button>
              <div id="dropdownPrioridade" className="z-10 hidden w-48 bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600">
                {isMounted &&
                  prioridades.map((prioridade, index) => (
                    <div key={index} className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                      <input id={`prioridade-radio-${index}`} type="radio" value={prioridade.value} name="prioridade" checked={selecionarPeriodo === prioridade.value} onChange={() => setSelecionarPeriodo(prioridade.value)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                      <label htmlFor={`prioridade-radio-${index}`} className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">
                        {prioridade.label}
                      </label>
                    </div>
                  ))}
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
                <input
                  type="text"
                  id="simple-search"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Pesquisar chamado"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </form>
          </div>
          <section>
            <div className="flex flex-row items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700">
              <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" id="default-tab" data-tabs-toggle="#default-tab-content" role="tablist">

                {/* Tabs */}
                {statusAbas.map((status) => {
                  const statusId = normalizarId(status)
                  return (
                    <li className="me-2" role="presentation" key={status}>
                      <button id={`${statusId}-tab`} onClick={() => setAbaAtiva(statusId)} className={`inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${abaAtiva === statusId ? "active border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-neutral-400 dark:hover:text-neutral-300"
                        }`}
                        data-tabs-target={`#${statusId}`} type="button" role="tab" aria-controls={statusId} aria-selected={abaAtiva === statusId} >
                        {primeiraLetraMaiuscula(status)}
                      </button>
                    </li>
                  )
                })}
              </ul>

            </div>
            <div id="default-tab-content">
              {statusAbas.map((status) => {
                const statusId = normalizarId(status);

                // Primeiro filtra por status
                let filtradosPorStatus = status === "todos" ? chamados : chamados.filter((c) => normalizarId(c.status_chamado) === statusId);

                // Depois aplica filtro de busca
                let chamadosFiltrados = filtradosPorStatus.filter((c) =>
                  busca.trim() === ""
                    ? true
                    : c.assunto.toLowerCase().includes(busca.toLowerCase()) ||
                    c.descricao.toLowerCase().includes(busca.toLowerCase()) ||
                    String(c.id).includes(busca)
                );

                return (
                  <div key={status} className="hidden flex flex-wrap justify-start bg-white ark:bg-neutral-900 gap-5" id={statusId} role="tabpanel" aria-labelledby={`${statusId}-tab`} >
                    {chamadosFiltrados.length === 0 ? (
                      <div className="p-4 md:p-5">
                        <p className="text-gray-500 dark:text-neutral-400"> Nenhum chamado encontrado.
                        </p>
                      </div>
                    ) : (
                      chamadosFiltrados.map((chamado) => (
                        <div key={chamado.id} onClick={() => setIsOpen(true)} className=" p-4 md:p-5 max-w-xs flex flex-col bg-white border border-gray-200 border-t-4 border-t-blue-600 shadow-2xs rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:border-t-blue-500 dark:shadow-neutral-700/70 cursor-pointer w-1/3">
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
                          {/* Drawer */}
                          <div id="drawer-right-example" className={`fixed top-0 right-0 z-99 h-screen p-4 overflow-y-auto transition-transform border-l border-gray-200 dark:border-neutral-700 bg-white w-80 dark:bg-gray-800 ${isOpen ? "translate-x-0" : "translate-x-full"}`} tabIndex="-1" aria-labelledby="drawer-right-label" >
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
                              <p className="mb-6 text-sm font-bold text-gray-800 dark:text-gray-400">Usuário</p>
                            </div>
                            <div>
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Assunto</p>
                              <p className="mb-6 text-sm font-bold text-gray-800 dark:text-gray-400">{chamado.assunto}</p>
                            </div>
                            <div>
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Descrição</p>
                              <p className="mb-6 text-sm font-bold text-gray-800 dark:text-gray-400">{chamado.descricao}</p>
                            </div>
                            <div>
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Imagem</p>
                              <p className="mb-6 text-sm font-bold text-gray-800 dark:text-gray-400">{chamado.imagem}</p>
                            </div>
                            <div>
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Técnico/Auxiliar</p>
                              <div className="mb-6 text-sm font-bold text-gray-800 dark:text-gray-400">
                                {!chamado.tecnico_id ? (
                                  <>
                                    <div>Nenhum técnico/auxiliar atribuído.</div>

                                    <button id="dropdownUsersButton" data-dropdown-toggle="dropdownUsers" data-dropdown-placement="bottom" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button" > Adicionar funcionário<svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6" ><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                    </svg>
                                    </button>
                                    
<div id="hs-predefined-markup-wrapper-for-copy" class="space-y-3"></div>

<p class="mt-3 text-end">
  <button type="button" data-hs-copy-markup='{
      "targetSelector": "#hs-predefined-markup-content-for-copy > *",
      "wrapperSelector": "#hs-predefined-markup-wrapper-for-copy",
      "limit": 3
    }' class="py-1.5 px-2 inline-flex items-center gap-x-1 text-xs font-medium rounded-full border border-dashed border-gray-200 bg-white text-gray-800 hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
    <svg class="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 12h14"></path>
      <path d="M12 5v14"></path>
    </svg>
    Add Name
  </button>
</p>


<div id="hs-predefined-markup-content-for-copy" class="hidden">
  <input type="text" class="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" placeholder="Enter Name"/>
</div>

                                    <div id="dropdownUsers" className="z-10 hidden bg-white rounded-lg shadow-sm w-60 dark:bg-gray-700" >
                                      <ul className="h-48 py-2 overflow-y-auto text-gray-700 dark:text-gray-200" aria-labelledby="dropdownUsersButton" >
                                        <li>
                                          <a href="#" className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" >
                                            <img className="w-6 h-6 me-2 rounded-full" src="/docs/images/people/profile-picture-1.jpg" alt="Jese image" />Jese Leos
                                          </a>
                                        </li>
                                        <li>
                                          <a href="#" className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" >
                                            <img className="w-6 h-6 me-2 rounded-full" src="/docs/images/people/profile-picture-2.jpg" alt="Robert image" />
                                            Robert Gough
                                          </a>
                                        </li>
                                        <li>
                                          <a href="#" className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" >
                                            <img
                                              className="w-6 h-6 me-2 rounded-full"
                                              src="/docs/images/people/profile-picture-3.jpg"
                                              alt="Bonnie image"
                                            />
                                            Bonnie Green
                                          </a>
                                        </li>
                                        <li>
                                          <a
                                            href="#"
                                            className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                          >
                                            <img
                                              className="w-6 h-6 me-2 rounded-full"
                                              src="/docs/images/people/profile-picture-4.jpg"
                                              alt="Leslie image"
                                            />
                                            Leslie Livingston
                                          </a>
                                        </li>
                                        <li>
                                          <a
                                            href="#"
                                            className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                          >
                                            <img
                                              className="w-6 h-6 me-2 rounded-full"
                                              src="/docs/images/people/profile-picture-5.jpg"
                                              alt="Michael image"
                                            />
                                            Michael Gough
                                          </a>
                                        </li>
                                        <li>
                                          <a
                                            href="#"
                                            className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                          >
                                            <img
                                              className="w-6 h-6 me-2 rounded-full"
                                              src="/docs/images/people/profile-picture-2.jpg"
                                              alt="Joseph image"
                                            />
                                            Joseph Mcfall
                                          </a>
                                        </li>
                                        <li>
                                          <a
                                            href="#"
                                            className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                          >
                                            <img
                                              className="w-6 h-6 me-2 rounded-full"
                                              src="/docs/images/people/profile-picture-3.jpg"
                                              alt="Roberta image"
                                            />
                                            Roberta Casas
                                          </a>
                                        </li>
                                        <li>
                                          <a
                                            href="#"
                                            className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                          >
                                            <img
                                              className="w-6 h-6 me-2 rounded-full"
                                              src="/docs/images/people/profile-picture-1.jpg"
                                              alt="Neil image"
                                            />
                                            Neil Sims
                                          </a>
                                        </li>
                                      </ul>
                                      <a
                                        href="#"
                                        className="flex items-center p-3 text-sm font-medium text-blue-600 border-t border-gray-200 rounded-b-lg bg-gray-50 dark:border-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-blue-500 hover:underline"
                                      >
                                        <svg
                                          className="w-4 h-4 me-2"
                                          aria-hidden="true"
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="currentColor"
                                          viewBox="0 0 20 18"
                                        >
                                          <path d="M6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Zm11-3h-2V5a1 1 0 0 0-2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 0 0 2 0V9h2a1 1 0 1 0 0-2Z" />
                                        </svg>
                                        Add new user
                                      </a>
                                    </div>
                                  </>
                                ) : (
                                  <p>{chamado.tecnico_nome}</p>
                                )}
                              </div>

                            </div>
                            <div>
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Usuário</p>
                              <p className="mb-6 text-sm font-bold text-gray-800 dark:text-gray-400">Usuário</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <a href="#" className="px-4 py-2 text-sm font-medium text-center text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Learn more</a>
                              <a href="#" className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                                Get access
                                <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                                </svg>
                              </a>
                            </div>
                          </div>

                        </div>

                      ))
                    )}
                  </div>
                );
              })}
            </div>
            <div class="flex flex-col items-center mt-15 mb-8">
            <span class="text-sm text-gray-700 dark:text-gray-400 mb-3">
  Mostrando <span class="font-semibold text-gray-900 dark:text-white">1</span> a <span class="font-semibold text-gray-900 dark:text-white">10</span> de <span class="font-semibold text-gray-900 dark:text-white">100</span> registros
</span>

              <div className="flex">
                <a href="#" class="flex items-center justify-center px-3 h-8 me-3 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                  <svg class="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5H1m0 0 4 4M1 5l4-4" />
                  </svg>
                  Anterior
                </a>
                <a href="#" class="flex items-center justify-center px-3 h-8 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                  Próximo
                  <svg class="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                  </svg>
                </a>
              </div>

            </div>
          </section>
        </div >
      </div >


    </>
  )
}