"use client"
import { useEffect, useState, useMemo } from "react";
import { initFlowbite } from 'flowbite'
import { useRouter } from 'next/navigation';
import OrdenarPor from '@/components/DropDown/DropDown.jsx'

export default function ChamadosCliente() {
    const [isMounted, setIsMounted] = useState(false); // espera o componente estar carregado no navegador p evitar erros de renderizacao
    const [chamados, setChamados] = useState([]) // p selecionar os chamados com base no status
    const [abaAtiva, setAbaAtiva] = useState('todos')
    const [tiposServico, setTiposServico] = useState([]); // guarda o tipo de serviço que o usuario seleciona 
    const [tipoSelecionadoId, setTipoSelecionadoId] = useState(''); // id do servico
    const router = useRouter();
    const [patrimonio, setPatrimonio] = useState('');
    const [prioridade, setPrioridade] = useState('');
    const [imagemPreview, setImagemPreview] = useState(null); // preview da imagem
    const [imagemArquivo, setImagemArquivo] = useState(null); // gaurda o arquivo da imagem
    const [assunto, setAssunto] = useState(''); // gaurda o assunto do chamado
    const [descricao, setDescricao] = useState(''); // gaurda a descricao do chamado
    const [busca, setBusca] = useState(""); // armazena o que for digitado no campo de busca
    const [ordenarPor, setOrdenarPor] = useState('mais_recente'); // ordenar por mais recente ou mais antigo, por padrao ele mostra os mais recentes primeiro
    const [openSpeedDial, setOpenSpeedDial] = useState(false)
    const [openModal, setOpenModal] = useState(false)

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        initFlowbite();
    }, []);

    const tiposPrioridade = [
        { id: 'alta', titulo: 'Alta' },
        { id: 'media', titulo: 'Média' },
        { id: 'baixa', titulo: 'Baixa' },
    ];
    // verifica se esta logado/autorizado
    useEffect(() => {
        fetch('http://localhost:8080/auth/check-auth', { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then(data => {
                console.log('Usuário autenticado:', data.user);
            })
            .catch(() => {
                router.push('/login');
            });
    }, []);

    // busca os chamados feitos pelo usuario
    useEffect(() => {
        fetch('http://localhost:8080/meus-chamados', { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error('Erro ao buscar chamados');
                return res.json();
            })
            .then(data => {
                console.log('Chamados recebidos:', data);
                setChamados(data.chamados || []);
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
    const statusAbas = ['todos', 'pendente', 'em andamento', 'concluido'];
    // funcao p normalizar id
    const normalizarId = (texto) =>
        typeof texto === 'string' ? texto.toLowerCase().replace(/\s+/g, '-') : '';

    // busca os tipos de servico
    useEffect(() => {
        fetch('http://localhost:8080/servicos', { credentials: 'include' })
            .then(res => res.json())
            .then(data => setTiposServico(data))
            .catch(err => console.error('Erro ao carregar tipos:', err));
    }, []);

    //criar chamado
    const criarChamado = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("assunto", assunto);
        formData.append("descricao", descricao);
        formData.append("tipo_id", tipoSelecionadoId);
        formData.append("imagem", imagemArquivo);
        formData.append("patrimonio", patrimonio);
        formData.append("prioridade", prioridade);
        const res = await fetch("http://localhost:8080/chamado", {
            method: "POST",
            body: formData,
            credentials: "include",
        });

        if (res.ok) {
            // limpar
            setImagemPreview(null);
            setImagemArquivo(null);
            const novoChamado = await res.json(); // retorna o chamado criado
            setChamados((prev) => [novoChamado, ...prev]); // insere no topo
            alert("Chamado criado com sucesso!");
        } else {
            alert("Erro ao criar chamado.");
        }
    };

    const subirImagem = (e) => {
        const file = e.target.files[0]; // pega o arquivo selecionado
        if (file) {
            setImagemArquivo(file); // guarda o arquivo real
            setImagemPreview(URL.createObjectURL(file)); // gera uma url temporaria para mostrar
        }
    };

    // formata os tipos de servico
    function formatarLabel(str) {
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

    const chamadosFiltrados = useMemo(() => {
        return [...chamados].sort((a, b) => {
            const dataA = new Date(a.criado_em);
            const dataB = new Date(b.criado_em);
            return ordenarPor === 'mais_antigo' ? dataA - dataB : dataB - dataA;
        });
    }, [chamados, ordenarPor]);
    return (
        <>
            {/* conteudo da pagina */}
            <div className="p-4 w-full">
                <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
                    <div className='flex flex-row w-full justify-between mb-15'>
                        {/* select */}
                        <OrdenarPor ordenarPor={ordenarPor} setOrdenarPor={setOrdenarPor} />

                        {/* barra de pesquisa */}
                        <form className="flex items-center" onSubmit={(e) => e.preventDefault()}>
                            <label htmlFor="simple-search" className="sr-only">Search</label>
                            <div className="relative w-80">
                                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2" />
                                    </svg>
                                </div>
                                <input type="text" id="simple-search" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#7F56D8] focus:border-[#7F56D8] block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Pesquisar chamado" value={busca} onChange={(e) => setBusca(e.target.value)} />
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
                                            <button onClick={() => setAbaAtiva(statusId)} className={`inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${abaAtiva === statusId ? "active border-[#7F56D8] text-[#7F56D8] dark:text-blue-400" : "border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-neutral-400 dark:hover:text-neutral-300"
                                                }`} type="button" >{primeiraLetraMaiuscula(status)}
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                            {/* modal - criar chamado*/}
                            <button data-modal-target="crud-modal" data-modal-toggle="crud-modal" className=" hidden md:flex flex-row items-center block text-white bg-[#7F56D8] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 h-fit text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button"><svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>Novo chamado</button>
                            <div id="crud-modal" tabIndex="-1" aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                                <div className="relative p-4 w-full max-w-md max-h-full">
                                    <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Novo chamado</h3>
                                            <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="crud-modal">
                                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                                </svg>
                                                <span className="sr-only">Close modal</span>
                                            </button>
                                        </div>
                                        <form className="p-4 md:p-5" onSubmit={criarChamado}>
                                            <div className="grid gap-4 mb-4 grid-cols-2">
                                                <div className="col-span-2">
                                                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Assunto</label>
                                                    <input type="text" name="name" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Digite o assunto" required="" value={assunto} onChange={(e) => setAssunto(e.target.value)} />
                                                </div>
                                                <div className="col-span-2">
                                                    <label htmlFor="servico" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tipo de serviço</label>
                                                    <select id="servico" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" value={tipoSelecionadoId} onChange={(e) => setTipoSelecionadoId(e.target.value)} required>
                                                        <option value="">Selecione tipo de serviço</option>
                                                        {tiposServico.map(tipo => (
                                                            <option key={tipo.id} value={tipo.id}>
                                                                {formatarLabel(tipo.titulo)}
                                                            </option>
                                                        ))}
                                                    </select></div>
                                                <div className="col-span-2">
                                                    <label htmlFor="prioridade" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tipo de prioridade</label>
                                                    <select id="prioridade" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" value={prioridade} onChange={(e) => setPrioridade(e.target.value)} required>
                                                        <option value="">Selecione tipo de prioridade</option>
                                                        {tiposPrioridade.map(tipo => (
                                                            <option key={tipo.id} value={tipo.id}>
                                                                {formatarLabel(tipo.titulo)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-span-2">
                                                    <label htmlFor="patrimonio" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Patrimônio</label>
                                                    <input type="text" name="patrimonio" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Digite o número de patrimônio" required="" value={patrimonio} onChange={(e) => setPatrimonio(e.target.value)} />
                                                </div>
                                                <div className="col-span-2">
                                                    <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Descrição</label>
                                                    <textarea id="description" rows="4" className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Escreva a descrição do chamado" value={descricao} onChange={(e) => setDescricao(e.target.value)}></textarea>
                                                </div>
                                                <div className="col-span-2">
                                                    <label htmlFor="file" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Enviar imagem</label>
                                                    <div className="flex items-center justify-center w-1/2 h-50">
                                                        <label htmlFor="dropzone-file" className="relative flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 overflow-hidden">
                                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                <svg className="me-1 -ms-1 w-8 h-8 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                                                            </div>
                                                            <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={subirImagem} />
                                                            {imagemPreview && (<img src={imagemPreview} alt="Pré-visualização" className="rounded-lg absolute inset-0 w-full h-full object-cover" />)}
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <button type="submit" className="text-white inline-flex items-center bg-[#7F56D8] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Criar chamado</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* visualizar chamados */}
                        <div id="default-tab-content">
                            {statusAbas.map((status) => {
                                const statusId = normalizarId(status);
                                // Primeiro filtra por status
                                let filtradosPorStatus = status === "todos" ? chamados : chamados.filter((c) => normalizarId(c.status_chamado) === statusId);
                                // Depois aplica filtro de busca
                                let chamadosFiltrados = filtradosPorStatus
                                    .filter((c) =>
                                        busca.trim() === ""
                                            ? true
                                            : c.assunto.toLowerCase().includes(busca.toLowerCase()) ||
                                            c.descricao.toLowerCase().includes(busca.toLowerCase()) ||
                                            String(c.id).includes(busca)
                                    )
                                    .sort((a, b) => {
                                        const dataA = new Date(a.criado_em);
                                        const dataB = new Date(b.criado_em);
                                        return ordenarPor === "mais_antigo" ? dataA - dataB : dataB - dataA;
                                    });

                                return (
                                    <div key={statusId} className={`${abaAtiva === statusId ? "block" : "hidden"} flex flex-col bg-white dark:bg-neutral-900 gap-6 `}>
                                        {chamadosFiltrados.length === 0 ? (
                                            <div className="p-4 md:p-5">
                                                <p className="text-gray-500 dark:text-neutral-400">Nenhum chamado encontrado. </p>
                                            </div>) : (
                                            chamadosFiltrados.map((chamado) => (

                                                <div key={chamado.id || `${chamado.assunto}-${Math.random()}`} className="border-b last:border-0 bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70">
                                                    <div className="px-4 pt-4 md:px-5 md:pt-5">
                                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Chamado #{chamado.id} - {primeiraLetraMaiuscula(chamado.status_chamado)}</h3>
                                                        <h6 className="text-base font-bold text-gray-800 dark:text-white">{chamado.assunto}</h6>
                                                        <p className="mt-2 text-gray-500 dark:text-neutral-400">{chamado.descricao}</p>
                                                    </div>
                                                    <div className="flex flex-row md:flex-col justify-between items-center bg-gray-100 border-t border-gray-200 rounded-b-xl py-3 px-4 mt-4 dark:bg-neutral-900 dark:border-neutral-700">
                                                        <p className="text-sm text-gray-500 dark:text-neutral-500">Criado em {new Date(chamado.criado_em).toLocaleString("pt-BR")}</p>
                                                        {/* <button className="inline-flex items-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-hidden focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-600 dark:focus:text-blue-600"
                                                            href="#" >Ver relatório
                                                            <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
                                                                <path d="m9 18 6-6-6-6"></path>
                                                            </svg>
                                                        </button> */}

                                                        {chamado.status_chamado === "em andamento" ? (
                                                            <button className="inline-flex items-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent text-[#7F56D8] decoration-2 hover:underline focus:underline focus:outline-hidden focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-600 dark:focus:text-blue-600">
                                                                Acompanhar apontamentos
                                                                <svg
                                                                    className="shrink-0 size-4"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="24"
                                                                    height="24"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                >
                                                                    <path d="m9 18 6-6-6-6"></path>
                                                                </svg>
                                                            </button>
                                                        ) : chamado.status_chamado === "concluido" ? (
                                                            <button className="inline-flex items-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-hidden focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-600 dark:focus:text-blue-600">
                                                                Ver relatório
                                                                <svg
                                                                    className="shrink-0 size-4"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="24"
                                                                    height="24"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                >
                                                                    <path d="m9 18 6-6-6-6"></path>
                                                                </svg>
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </div>)))}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* botão de criar chamado pra tablets e celular */}
                    {/* ---------- SPEED DIAL ---------- */}
                    <div data-dial-init className="fixed end-6 bottom-6 group md:hidden">
                        {/* menu do speed dial */}
                        <div
                            id="speed-dial-menu-bottom-right"
                            className={`flex flex-col items-center mb-4 space-y-2 transition-all duration-300 ${openSpeedDial ? "flex" : "hidden"
                                }`}
                        >
                            <button
                                type="button"
                                onClick={() => setOpenModal(true)} // <-- abre o modal
                                className="flex justify-center items-center w-[52px] h-[52px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 dark:border-gray-600 shadow-xs dark:hover:text-white dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 focus:outline-none dark:focus:ring-gray-400"
                            >
                                <svg
                                    className="w-5 h-5"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 18 18"
                                >
                                    <path d="M14.419 10.581a3.564 3.564 0 0 0-2.574 1.1l-4.756-2.49a3.54 3.54 0 0 0 .072-.71 3.55 3.55 0 0 0-.043-.428L11.67 6.1a3.56 3.56 0 1 0-.831-2.265c.006.143.02.286.043.428L6.33 6.218a3.573 3.573 0 1 0-.175 4.743l4.756 2.491a3.58 3.58 0 1 0 3.508-2.871Z" />
                                </svg>
                                <span className="sr-only">Abrir modal</span>
                            </button>
                        </div>

                        {/* botão principal */}
                        <button
                            type="button"
                            onClick={() => setOpenSpeedDial(!openSpeedDial)}
                            data-dial-toggle="speed-dial-menu-bottom-right"
                            aria-controls="speed-dial-menu-bottom-right"
                            aria-expanded={openSpeedDial}
                            className="flex items-center justify-center text-white bg-[#7F56D8] rounded-full w-14 h-14 dark:bg-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
                        >
                            <svg
                                className={`w-5 h-5 transform transition-transform duration-300 ${openSpeedDial ? "rotate-45" : ""
                                    }`}
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 18 18"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 1v16M1 9h16"
                                />
                            </svg>
                            <span className="sr-only">open SpeedDial actions menu</span>
                        </button>
                    </div>

                    {/* ---------- MODAL ---------- */}
                    {openModal && (
                        <div id="crud-modal" tabIndex="-1" aria-hidden={!openModal} className="fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50">
                            <div className="relative w-full h-full">
                                <div className="relative bg-white shadow-sm dark:bg-gray-700 h-full">
                                    {/* header */}
                                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Novo chamado
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setOpenModal(false)} // <-- fecha modal
                                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                        >
                                            <svg
                                                className="w-3 h-3"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 14 14"
                                            >
                                                <path
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                                />
                                            </svg>
                                            <span className="sr-only">Close modal</span>
                                        </button>
                                    </div>

                                    {/* corpo do modal */}
                                    <div className="relative w-full">

                                        <form className="p-4 md:p-5" onSubmit={criarChamado}>
                                            <div className="grid gap-4 mb-4 grid-cols-2">
                                                <div className="col-span-2">
                                                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Assunto</label>
                                                    <input type="text" name="name" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Digite o assunto" required="" value={assunto} onChange={(e) => setAssunto(e.target.value)} />
                                                </div>
                                                <div className="col-span-2">
                                                    <label htmlFor="servico" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tipo de serviço</label>
                                                    <select id="servico" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" value={tipoSelecionadoId} onChange={(e) => setTipoSelecionadoId(e.target.value)} required>
                                                        <option value="">Selecione tipo de serviço</option>
                                                        {tiposServico.map(tipo => (
                                                            <option key={tipo.id} value={tipo.id}>
                                                                {formatarLabel(tipo.titulo)}
                                                            </option>
                                                        ))}
                                                    </select></div>
                                                <div className="col-span-2">
                                                    <label htmlFor="prioridade" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tipo de prioridade</label>
                                                    <select id="prioridade" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" value={prioridade} onChange={(e) => setPrioridade(e.target.value)} required>
                                                        <option value="">Selecione tipo de prioridade</option>
                                                        {tiposPrioridade.map(tipo => (
                                                            <option key={tipo.id} value={tipo.id}>
                                                                {formatarLabel(tipo.titulo)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-span-2">
                                                    <label htmlFor="patrimonio" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Patrimônio</label>
                                                    <input type="text" name="patrimonio" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Digite o número de patrimônio" required="" value={patrimonio} onChange={(e) => setPatrimonio(e.target.value)} />
                                                </div>
                                                <div className="col-span-2">
                                                    <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Descrição</label>
                                                    <textarea id="description" rows="4" className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Escreva a descrição do chamado" value={descricao} onChange={(e) => setDescricao(e.target.value)}></textarea>
                                                </div>
                                                <div className="col-span-2">
                                                    <label htmlFor="file" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Enviar imagem</label>
                                                    <div className="flex items-center justify-center w-1/2 h-50">
                                                        <label htmlFor="dropzone-file" className="relative flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 overflow-hidden">
                                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                <svg className="me-1 -ms-1 w-8 h-8 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                                                            </div>
                                                            <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={subirImagem} />
                                                            {imagemPreview && (<img src={imagemPreview} alt="Pré-visualização" className="rounded-lg absolute inset-0 w-full h-full object-cover" />)}
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <button type="submit" className="text-white inline-flex items-center bg-[#7F56D8] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Criar chamado</button>
                                        </form>
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}