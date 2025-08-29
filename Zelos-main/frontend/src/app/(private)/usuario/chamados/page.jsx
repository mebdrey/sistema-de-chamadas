"use client"
import { useEffect, useState, useMemo, useRef } from "react";
import { initFlowbite } from 'flowbite'
import { useRouter } from 'next/navigation';
import OrdenarPor from '@/components/DropDown/DropDown.jsx'
import ToastMsg from "@/components/Toasts/Toasts";
import ChatWidget from '@/components/ChatWidget/ChatWidget'

export default function ChamadosCliente() {
    const [isMounted, setIsMounted] = useState(false); // espera o componente estar carregado no navegador p evitar erros de renderizacao
    const [chamados, setChamados] = useState([]) // p selecionar os chamados com base no status
    const [abaAtiva, setAbaAtiva] = useState('todos')
    const [tiposServico, setTiposServico] = useState([]); // guarda o tipo de serviço que o usuario seleciona 
    const [tipoSelecionadoId, setTipoSelecionadoId] = useState(''); // id do servico
    const [prioridadeSelecionadaId, setPrioridadeSelecionadaId] = useState(''); // id do servico
    const router = useRouter();
    const [patrimonio, setPatrimonio] = useState('');
    // const [prioridade, setPrioridade] = useState('');
    const [imagemPreview, setImagemPreview] = useState(null); // preview da imagem
    const [imagemArquivo, setImagemArquivo] = useState(null); // gaurda o arquivo da imagem
    const [assunto, setAssunto] = useState(''); // gaurda o assunto do chamado
    const [descricao, setDescricao] = useState(''); // gaurda a descricao do chamado
    const [busca, setBusca] = useState(""); // armazena o que htmlFor digitado no campo de busca
    const [ordenarPor, setOrdenarPor] = useState('mais_recente'); // ordenar por mais recente ou mais antigo, por padrao ele mostra os mais recentes primeiro
    const [openSpeedDial, setOpenSpeedDial] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [erroCampos, setErroCampos] = useState(false);
    const [camposInvalidos, setCamposInvalidos] = useState({});
    const [tiposPrioridade, setTiposPrioridade] = useState([]);
    const [openAbas, setOpenAbas] = useState(false);
    const dropdownRef = useRef(null);
    const { UI: ToastsUI, showToast } = ToastMsg(); // pega UI e função showToast
    const [openApontamentos, setOpenApontamentos] = useState(false);
    const [chamadoSelecionado, setChamadoSelecionado] = useState(null);
    const [apontamentos, setApontamentos] = useState([]);
    const [rating, setRating] = useState(0); // valor atual do rating
    const [hover, setHover] = useState(0);   // valor do hover para efeito visual
    const [openAvaliacao, setOpenAvaliacao] = useState(false);
    const [comentario, setComentario] = useState("");
    const [jaAvaliado, setJaAvaliado] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        initFlowbite();
    }, []);

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
                showToast("danger", "Erro ao carregar chamados.");
                setChamados([]);
            });
    }, []);

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

        // Verifica campos obrigatórios
        const invalidos = {};
        if (!assunto) invalidos.assunto = true;
        if (!descricao) invalidos.descricao = true;
        if (!tipoSelecionadoId) invalidos.tipo = true;
        if (!patrimonio) invalidos.patrimonio = true;
        if (!prioridadeSelecionadaId) invalidos.prioridade = true;

        if (Object.keys(invalidos).length > 0) {
            setErroCampos(true);
            setCamposInvalidos(invalidos);
            return;
        }

        setErroCampos(false);
        setCamposInvalidos({});

        const formData = new FormData();
        formData.append("assunto", assunto);
        formData.append("descricao", descricao);
        formData.append("tipo_id", tipoSelecionadoId);
        formData.append("prioridade_id", prioridadeSelecionadaId);
        formData.append("patrimonio", patrimonio);
        formData.append("imagem", imagemArquivo);

        const res = await fetch("http://localhost:8080/chamado", {
            method: "POST",
            body: formData,
            credentials: "include",
        });

        if (res.ok) {
            setAssunto("");
            setTipoSelecionadoId("");
            setDescricao("");
            setPrioridadeSelecionadaId("");
            setPatrimonio("");
            setImagemPreview(null);
            setImagemArquivo(null);
            const novoChamado = await res.json();
            setChamados((prev) => [novoChamado, ...prev]);

            showToast("success", "Chamado criado com sucesso!");

        } else {
            showToast("danger", "Erro ao criar chamado.");
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

    const chamadosFiltrados = useMemo(() => {
        return [...chamados].sort((a, b) => {
            const dataA = new Date(a.criado_em);
            const dataB = new Date(b.criado_em);
            return ordenarPor === 'mais_antigo' ? dataA - dataB : dataB - dataA;
        });
    }, [chamados, ordenarPor]);

    // Fecha o dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenAbas(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const carregarApontamentos = async (chamadoId) => {
        try {
            const res = await fetch(`http://localhost:8080/apontamentos/${chamadoId}`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error("Erro ao buscar apontamentos");
            const data = await res.json();
            setApontamentos(data);
        } catch (err) {
            console.error("Erro ao carregar apontamentos:", err);
            showToast("danger", "Erro ao carregar apontamentos.");
        }
    };

    // Verifica se existe avaliação (usa ids passados)
    const verificarAvaliacao = async (chamadoId, tecnicoId) => {
        try {
            const res = await fetch(`http://localhost:8080/avaliacao-existe?chamado_id=${encodeURIComponent(chamadoId)}&tecnico_id=${encodeURIComponent(tecnicoId)}`, {
                credentials: 'include',
            });
            if (!res.ok) {
                // Se backend retornar 4xx/5xx, tratamos como "não avaliado" por segurança (mas logamos)
                console.error('Erro na verificação de avaliação:', await res.text());
                return false;
            }
            const data = await res.json();
            return !!data.existe;
        } catch (err) {
            console.error('Erro ao verificar avaliação:', err);
            return false;
        }
    };

    // Abre os apontamentos e, se o usuário não tiver avaliado, abre o modal de avaliação
    const abrirModalAvaliacao = async (chamado) => {
        if (!chamado) return;

        // garante que o chamado selecionado seja definido
        setChamadoSelecionado(chamado);

        // carrega apontamentos (mantive sua função existente)
        await carregarApontamentos(chamado.id);

        // Verifica se já existe avaliação para este usuário/tecnico/chamado
        const tecnicoId = chamado.tecnico_id ?? chamado.responsavel_tecnico_id ?? null; // tenta propriedades comuns
        if (!tecnicoId) {
            console.warn('Chamado não tem tecnico_id definido:', chamado);
            // apenas abre apontamentos se não soubermos o tecnico
            setOpenApontamentos(true);
            return;
        }

        const existe = await verificarAvaliacao(chamado.id, tecnicoId);
        setJaAvaliado(existe);

        // abre a janela de apontamentos sempre; avaliacão apenas se ainda não existe
        setOpenApontamentos(true);

        if (!existe) {
            // abre modal de avaliação (após carregar apontamentos)
            setOpenAvaliacao(true);
        } else {
            // NÃO abre o modal de avaliação
            setOpenAvaliacao(false);
        }
    };

    // Envia a avaliação para o backend (POST)
    const enviarAvaliacao = async () => {
        if (jaAvaliado) {
            alert("Você já avaliou este chamado!");
            return;
        }

        if (!rating || rating < 1) {
            alert("Escolha uma nota antes de enviar!");
            return;
        }

        // precisa ter chamadoSelecionado (com id e tecnico_id)
        if (!chamadoSelecionado) {
            alert("Nenhum chamado selecionado para avaliação.");
            return;
        }

        const payload = {
            chamado_id: chamadoSelecionado.id,
            tecnico_id: chamadoSelecionado.tecnico_id,
            nota: rating,
            comentario,
        };

        try {
            const res = await fetch("http://localhost:8080/criar-avaliacao", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                // trata 409 (já avaliado) e outros erros
                if (res.status === 409) {
                    alert(data.message || "Você já avaliou este chamado.");
                    setJaAvaliado(true);
                    setOpenAvaliacao(false);
                    return;
                }
                alert(data.message || "Erro ao enviar avaliação!");
                return;
            }

            // sucesso
            alert("Avaliação enviada com sucesso!");
            setOpenAvaliacao(false);
            setRating(0);
            setComentario("");
            setJaAvaliado(true);

            // (opcional) atualizar localmente lista de avaliações ou chamados
            // — por enquanto apenas mantém flag jaAvaliado
        } catch (err) {
            console.error("Erro ao enviar avaliação:", err);
            alert("Erro ao enviar avaliação!");
        }
    };


    return (
        <>
            {ToastsUI}
            {/* conteudo da pagina */}
            <div className="p-4 h-screen w-full">
                <div className="px-4 pt-4 pb-14 mt-14">
                    <div className='flex flex-row w-full justify-between mb-15'>
                        {/* select */}
                        <OrdenarPor ordenarPor={ordenarPor} setOrdenarPor={setOrdenarPor} />

                        {/* barra de pesquisa */}
                        <form className="flex items-center" onSubmit={(e) => e.preventDefault()}>
                            <label htmlFor="simple-search" className="sr-only">Search</label>
                            <div className="relative w-50 sm:w-80">
                                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2" />
                                    </svg>
                                </div>
                                <input type="text" id="simple-search" className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#7F56D8] focus:border-[#7F56D8] block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Pesquisar chamado" value={busca} onChange={(e) => setBusca(e.target.value)} />
                            </div>
                        </form>
                    </div>
                    <section>
                        <div className="flex flex-row items-center justify-between mb-4 md:border-b md:border-gray-200 dark:border-gray-700">
                            {/* Tabs tradicionais: visível em desktop */}
                            <ul className="hidden md:flex flex-wrap -mb-px text-sm poppins-medium text-center">
                                {statusAbas.map((status) => {
                                    const statusId = normalizarId(status);
                                    return (
                                        <li className="me-2" role="presentation" key={status}>
                                            <button onClick={() => setAbaAtiva(statusId)} className={`inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${abaAtiva === statusId
                                                ? "active border-[#7F56D8] text-[#7F56D8] dark:text-blue-400"
                                                : "border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-neutral-400 dark:hover:text-neutral-300"
                                                }`} type="button">
                                                {primeiraLetraMaiuscula(status)}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>

                            {/* Select responsivo: visível em tablet/móvel */}
                            <div className="md:hidden relative" ref={dropdownRef}>
                                {/* Botão do dropdown */}
                                <button onClick={() => setOpenAbas(!openAbas)} className="text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-[#F8FAFB] focus:text-[#7F56D8] font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 w-full justify-between" type="button">
                                    {primeiraLetraMaiuscula(statusAbas.find(s => normalizarId(s) === abaAtiva))}
                                    <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"
                                    ><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                    </svg>
                                </button>

                                {/* Menu do dropdown */}
                                {openAbas && (
                                    <div className="z-10 absolute mt-1 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-36 min-w-max dark:bg-gray-700">
                                        <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                                            {statusAbas.map((status) => {
                                                const statusId = normalizarId(status);
                                                return (
                                                    <li key={status} >
                                                        <button onClick={() => { setAbaAtiva(statusId); setOpenAbas(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">{primeiraLetraMaiuscula(status)}</button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            {/* modal - criar chamado*/}
                            <button data-modal-target="crud-modal" data-modal-toggle="crud-modal" className=" hidden md:flex flex-row items-center block text-white bg-[#7F56D8] focus:ring-4 focus:outline-none focus:ring-blue-300 poppins-medium rounded-lg text-sm px-5 py-2.5 h-fit text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button"><svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>Novo chamado</button>

                            <div id="crud-modal" tabIndex="-1" aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                                <div className="fixed inset-0 bg-black/50 dark:bg-black/60"></div>
                                <div className="relative p-4 w-full max-w-md max-h-full">
                                    <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                                            <h3 className="inline-flex items-center gap-2 text-base poppins-semibold text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
                                                    <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25v2.5h2.5a.75.75 0 0 1 0 1.5h-2.5v2.5a.75.75 0 0 1-1.5 0v-2.5h-2.5a.75.75 0 0 1 0-1.5h2.5v-2.5a.75.75 0 0 1 1.5 0Z" clipRule="evenodd" />
                                                </svg>Novo chamado</h3>
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
                                                    <label htmlFor="name" className="block mb-2 text-sm poppins-medium text-gray-900 dark:text-white">Assunto<span className="text-red-500">*</span></label>
                                                    <input type="text" name="name" id="name" className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline-none focus:ring-1 focus:border-[#7F56D8] block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 ${camposInvalidos.assunto
                                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:border-[#7F56D8] focus:ring-[#7F56D8]"
                                                        }`} placeholder="Digite o assunto" required="" value={assunto} onChange={(e) => { setAssunto(e.target.value); setCamposInvalidos({ ...camposInvalidos, assunto: false }); }} />
                                                </div>
                                                <div className="col-span-2">
                                                    <label htmlFor="servico" className="block mb-2 text-sm poppins-medium text-gray-900 dark:text-white">Tipo de serviço<span className="text-red-500">*</span></label>
                                                    <select id="servico" className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline-none focus:ring-1 focus:border-[#7F56D8] block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 ${camposInvalidos.tipo
                                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:border-[#7F56D8] focus:ring-[#7F56D8]"
                                                        }`} value={tipoSelecionadoId} onChange={(e) => { setTipoSelecionadoId(e.target.value); setCamposInvalidos({ ...camposInvalidos, tipo: false }); }} required>
                                                        <option value="">Selecione tipo de serviço</option>
                                                        {tiposServico.map(tipo => (
                                                            <option key={tipo.id} value={tipo.id}>
                                                                {formatarLabel(tipo.titulo)}
                                                            </option>
                                                        ))}
                                                    </select></div>
                                                <div className="col-span-2">
                                                    <label htmlFor="prioridade" className="block mb-2 text-sm poppins-medium text-gray-900 dark:text-white">Prioridade<span className="text-red-500">*</span></label>
                                                    <select id="prioridade" className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline-none focus:ring-1 focus:border-[#7F56D8] block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 ${camposInvalidos.prioridade ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-[#7F56D8] focus:ring-[#7F56D8]"
                                                        }`} value={prioridadeSelecionadaId} onChange={(e) => { setPrioridadeSelecionadaId(e.target.value); setCamposInvalidos({ ...camposInvalidos, prioridade: false }); }} required>
                                                        <option value="">Selecione prioridade</option>
                                                        {tiposPrioridade.map(tipo => (
                                                            <option key={tipo.id} value={tipo.id}>
                                                                {formatarLabel(tipo.nome)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-span-2">
                                                    <label htmlFor="patrimonio" className="block mb-2 text-sm poppins-medium text-gray-900 dark:text-white">Patrimônio<span className="text-red-500">*</span></label>
                                                    <input type="text" name="patrimonio" className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline-none focus:ring-1 focus:border-[#7F56D8] block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 ${camposInvalidos.patrimonio
                                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:border-[#7F56D8] focus:ring-[#7F56D8]"
                                                        }`} placeholder="Digite o número de patrimônio" required="" value={patrimonio} onChange={(e) => { setPatrimonio(e.target.value.replace(/\D/g, "")); setCamposInvalidos({ ...camposInvalidos, patrimonio: false }); }} maxLength={7} pattern="\d{7}" />
                                                </div>
                                                <div className="col-span-2">
                                                    <label htmlFor="description" className="block mb-2 text-sm poppins-medium text-gray-900 dark:text-white">Descrição<span className="text-red-500">*</span></label>
                                                    <textarea id="description" rows="4" className={`block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:border-[#7F56D8] dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${camposInvalidos.descricao
                                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:border-[#7F56D8] focus:ring-[#7F56D8]"
                                                        }`} placeholder="Escreva a descrição do chamado" value={descricao} onChange={(e) => { setDescricao(e.target.value); setCamposInvalidos({ ...camposInvalidos, descricao: false }); }}></textarea>
                                                </div>
                                                <div className="col-span-2">
                                                    <label htmlFor="file" className="block mb-2 text-sm poppins-medium text-gray-900 dark:text-white">Enviar imagem</label>
                                                    <div className="flex items-center justify-center w-1/2 h-50">
                                                        <label htmlFor="dropzone-file" className="relative flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 overflow-hidden">
                                                            {!imagemPreview && (
                                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                    <svg className="me-1 -ms-1 w-8 h-8 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                                                            clipRule="evenodd"
                                                                        ></path>
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={subirImagem} />
                                                            {imagemPreview && (
                                                                <img
                                                                    src={imagemPreview}
                                                                    alt="Pré-visualização"
                                                                    className="rounded-lg absolute inset-0 w-full h-full object-cover"
                                                                />
                                                            )}
                                                        </label>
                                                    </div>
                                                </div>

                                            </div>
                                            {erroCampos && (
                                                <p className="text-red-500 mb-2">Preencha todos os campos obrigatórios</p>
                                            )}
                                            <button type="submit" className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-[#7F56D8] focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Criar chamado</button>
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
                                    <div key={statusId} className={`${abaAtiva === statusId ? "block" : "hidden"} flex flex-col rounded-xl dark:bg-neutral-900 gap-6 `}>
                                        {chamadosFiltrados.length === 0 ? (
                                            <div className="p-4 md:p-5 bg-white rounded-xl">
                                                <p className="text-gray-500 dark:text-neutral-400">Nenhum chamado encontrado. </p>
                                            </div>) : (
                                            chamadosFiltrados.map((chamado) => (

                                                <div key={chamado.id || `${chamado.assunto}-${Math.random()}`} className="border-b bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70">
                                                    <div className="flex flex-row">
                                                        <div className="px-4 pt-4 md:px-5 md:pt-5">
                                                            <h3 className="wrap-break-word break-normal whitespace-normal text-lg poppins-bold text-gray-800 dark:text-white">Chamado #{chamado.id} - {primeiraLetraMaiuscula(chamado.status_chamado)}</h3>
                                                            <h6 className="wrap-break-word break-normal whitespace-normal text-base poppins-bold text-gray-800 dark:text-white break-all">{chamado.assunto}</h6>
                                                            <p className="wrap-break-word break-normal whitespace-normal mt-2 text-gray-500 dark:text-neutral-400 break-all">{chamado.descricao}</p>

                                                        </div>
                                                        <div className="px-4 pt-4 md:px-5 md:pt-5">
                                                            <img src={`http://localhost:8080/uploads/${chamado.imagem}`} className="mt-6 w-60 h-60 object-cover rounded-lg" alt="Imagem do chamado" />
                                                        </div>
                                                    </div>


                                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-100 border-t border-gray-200 rounded-b-xl py-3 px-4 mt-4 dark:bg-neutral-900 dark:border-neutral-700">
                                                        <p className="text-sm text-gray-500 dark:text-neutral-500">Criado em {new Date(chamado.criado_em).toLocaleString("pt-BR")}</p>

                                                        {chamado.status_chamado === "em andamento" ? (
                                                            <button onClick={() => { setChamadoSelecionado(chamado); carregarApontamentos(chamado.id); setOpenApontamentos(true); }} className="inline-flex items-center gap-x-1 text-sm poppins-semibold rounded-lg border border-transparent text-[#7F56D8] decoration-2 hover:underline focus:underline focus:outline-hidden disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-600 dark:focus:text-blue-600">Acompanhar apontamentos
                                                                <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
                                                            </button>
                                                        ) : chamado.status_chamado === "concluido" ? (
                                                            <button onClick={() => { setChamadoSelecionado(chamado); carregarApontamentos(chamado.id); setOpenApontamentos(true); abrirModalAvaliacao(chamado); }} className="inline-flex items-center gap-x-1 text-sm poppins-semibold rounded-lg border border-transparent text-[#7F56D8] decoration-2 hover:underline focus:underline focus:outline-hidden disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-600 dark:focus:text-blue-600">Ver apontamentos
                                                                <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
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
                        <div id="speed-dial-menu-bottom-right" className={`flex flex-col items-center mb-4 space-y-2 transition-all duration-300 ${openSpeedDial ? "flex" : "hidden"}`}>
                            <button type="button" onClick={() => setOpenModal(true)} // <-- abre o modal
                                className="flex justify-center items-center w-[52px] h-[52px] text-gray-500 hover:text-[#7F56D8] bg-white rounded-full border border-gray-200 shadow-xs focus:ring-4 focus:ring-gray-300 focus:outline-none">
                                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                                    <path d="M16.9573 27.3064C17.342 27.3973 17.3772 27.9086 17.0025 28.0354L14.7901 28.7743C9.23099 30.5932 6.30442 29.0727 4.49807 23.4312L2.70572 17.8181C0.913372 12.1766 2.39766 9.19247 7.95674 7.37354L8.69048 7.12695C9.2546 6.93736 9.8036 7.51154 9.64341 8.09228C9.56401 8.38014 9.48763 8.68056 9.41302 8.99352L8.04076 14.9477C6.50046 21.6407 8.7549 25.3354 15.3502 26.927L16.9573 27.3064Z" />
                                    <path d="M23.2477 3.50833L20.9093 2.95413C16.2323 1.83151 13.4458 2.75518 11.8075 6.19408C11.3874 7.06092 11.0513 8.11248 10.7713 9.32036L9.39902 15.2745C8.02675 21.2144 9.83311 24.1417 15.6722 25.5486L18.0247 26.117C18.8369 26.3159 19.593 26.4438 20.2931 26.5007C24.662 26.927 26.9864 24.8523 28.1627 19.7223L29.5349 13.7824C30.9072 7.84248 29.1149 4.90094 23.2477 3.50833ZM20.6152 17.8892C20.4892 18.3723 20.0691 18.685 19.593 18.685C19.509 18.685 19.425 18.6708 19.327 18.6566L15.2522 17.605C14.692 17.4629 14.356 16.8803 14.496 16.3118C14.636 15.7434 15.2102 15.4024 15.7703 15.5445L19.8451 16.5961C20.4192 16.7382 20.7552 17.3208 20.6152 17.8892ZM24.718 13.0861C24.592 13.5693 24.1719 13.8819 23.6958 13.8819C23.6118 13.8819 23.5278 13.8677 23.4297 13.8535L16.6384 12.1056C16.0783 11.9635 15.7423 11.3809 15.8823 10.8124C16.0223 10.244 16.5964 9.90298 17.1565 10.0451L23.9478 11.793C24.522 11.9209 24.858 12.5035 24.718 13.0861Z" />
                                </svg>
                                <span className="sr-only">Novo chamado</span>
                            </button>
                        </div>

                        {/* botão principal */}
                        <button type="button" onClick={() => setOpenSpeedDial(!openSpeedDial)} data-dial-toggle="speed-dial-menu-bottom-right" aria-controls="speed-dial-menu-bottom-right" aria-expanded={openSpeedDial} className="flex items-center justify-center text-white bg-[#7F56D8] rounded-full w-14 h-14">
                            <svg className={`w-5 h-5 transform transition-transform duration-300 ${openSpeedDial ? "rotate-45" : ""}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16" />
                            </svg>
                            <span className="sr-only">Abrir</span>
                        </button>
                    </div>

                    {/* ---------- MODAL ---------- */}
                    {openModal && (
                        <div id="crud-modal" tabIndex="-1" aria-hidden={!openModal} className="fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50">
                            <div className="relative w-full max-w-3xl h-full">
                                <div className="relative bg-white shadow-sm dark:bg-gray-700 h-full flex flex-col rounded-lg">

                                    {/* header */}
                                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                                        <h3 className="inline-flex items-center gap-2 text-base poppins-semibold text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
                                                <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25v2.5h2.5a.75.75 0 0 1 0 1.5h-2.5v2.5a.75.75 0 0 1-1.5 0v-2.5h-2.5a.75.75 0 0 1 0-1.5h2.5v-2.5a.75.75 0 0 1 1.5 0Z" clipRule="evenodd" />
                                            </svg>Novo chamado</h3>
                                        <button type="button" onClick={() => setOpenModal(false)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                                            <span className="sr-only">Close modal</span>
                                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* corpo com scroll */}
                                    <div className="flex-1 overflow-y-auto p-4 md:p-5">
                                        <form onSubmit={criarChamado} className="space-y-4">
                                            {/* <form className="p-4 md:p-5" onSubmit={criarChamado}> */}
                                            <div className="grid gap-4 mb-4 grid-cols-2">
                                                <div className="col-span-2">
                                                    <label htmlFor="name" className="block mb-2 text-sm poppins-medium text-gray-900 dark:text-white">Assunto<span className="text-red-500">*</span></label>
                                                    <input type="text" name="name" id="name" className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline-none focus:ring-1 focus:border-[#7F56D8] block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 ${camposInvalidos.assunto
                                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:border-[#7F56D8] focus:ring-[#7F56D8]"
                                                        }`} placeholder="Digite o assunto" required="" value={assunto} onChange={(e) => { setAssunto(e.target.value); setCamposInvalidos({ ...camposInvalidos, assunto: false }); }} />
                                                </div>
                                                <div className="col-span-2">
                                                    <label htmlFor="servico" className="block mb-2 text-sm poppins-medium text-gray-900 dark:text-white">Tipo de serviço<span className="text-red-500">*</span></label>
                                                    <select id="servico" className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline-none focus:ring-1 focus:border-[#7F56D8] block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 ${camposInvalidos.tipo
                                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:border-[#7F56D8] focus:ring-[#7F56D8]"
                                                        }`} value={tipoSelecionadoId} onChange={(e) => { setTipoSelecionadoId(e.target.value); setCamposInvalidos({ ...camposInvalidos, tipo: false }); }} required>
                                                        <option value="">Selecione tipo de serviço</option>
                                                        {tiposServico.map(tipo => (
                                                            <option key={tipo.id} value={tipo.id}>
                                                                {formatarLabel(tipo.titulo)}
                                                            </option>
                                                        ))}
                                                    </select></div>
                                                <div className="col-span-2">
                                                    <label htmlFor="prioridade" className="block mb-2 text-sm poppins-medium text-gray-900 dark:text-white">Prioridade<span className="text-red-500">*</span></label>
                                                    <select id="prioridade" className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline-none focus:ring-1 focus:border-[#7F56D8] block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 ${camposInvalidos.prioridade ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-[#7F56D8] focus:ring-[#7F56D8]"
                                                        }`} value={prioridadeSelecionadaId} onChange={(e) => { setPrioridadeSelecionadaId(e.target.value); setCamposInvalidos({ ...camposInvalidos, prioridade: false }); }} required>
                                                        <option value="">Selecione prioridade</option>
                                                        {tiposPrioridade.map(tipo => (
                                                            <option key={tipo.id} value={tipo.id}>
                                                                {formatarLabel(tipo.nome)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-span-2">
                                                    <label htmlFor="patrimonio" className="block mb-2 text-sm poppins-medium text-gray-900 dark:text-white">Patrimônio<span className="text-red-500">*</span></label>
                                                    <input type="text" name="patrimonio" className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline-none focus:ring-1 focus:border-[#7F56D8] block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 ${camposInvalidos.patrimonio
                                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:border-[#7F56D8] focus:ring-[#7F56D8]"
                                                        }`} placeholder="Digite o número de patrimônio" required="" value={patrimonio} onChange={(e) => { setPatrimonio(e.target.value.replace(/\D/g, "")); setCamposInvalidos({ ...camposInvalidos, patrimonio: false }); }} maxLength={7} pattern="\d{7}" />
                                                </div>
                                                <div className="col-span-2">
                                                    <label htmlFor="description" className="block mb-2 text-sm poppins-medium text-gray-900 dark:text-white">Descrição<span className="text-red-500">*</span></label>
                                                    <textarea id="description" rows="4" className={`block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:border-[#7F56D8] dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${camposInvalidos.descricao
                                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:border-[#7F56D8] focus:ring-[#7F56D8]"
                                                        }`} placeholder="Escreva a descrição do chamado" value={descricao} onChange={(e) => { setDescricao(e.target.value); setCamposInvalidos({ ...camposInvalidos, descricao: false }); }}></textarea>
                                                </div>
                                                <div className="col-span-2">
                                                    <label htmlFor="file" className="block mb-2 text-sm poppins-medium text-gray-900 dark:text-white">Enviar imagem</label>
                                                    <div className="flex items-center justify-center w-1/2 h-50">
                                                        <label htmlFor="dropzone-file" className="relative flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 overflow-hidden">
                                                            {!imagemPreview && (
                                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                    <svg className="me-1 -ms-1 w-8 h-8 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path>
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={subirImagem} />
                                                            {imagemPreview && (
                                                                <img src={imagemPreview} alt="Pré-visualização" className="rounded-lg absolute inset-0 w-full h-full object-cover" />
                                                            )}
                                                        </label>
                                                    </div>
                                                </div>

                                            </div>
                                            {erroCampos && (
                                                <p className="text-red-500 mb-2">Preencha todos os campos obrigatórios</p>
                                            )}
                                            {/* footer */}
                                            <div className="flex justify-end items-center gap-x-2 py-3 px-4 border-t border-gray-200 dark:border-neutral-700">
                                                <button type="submit" className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-[#7F56D8] focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Criar chamado</button>
                                            </div>
                                        </form>
                                        {/* </form> */}
                                    </div>




                                </div>
                            </div>
                        </div>
                    )}

                    {openApontamentos && (
                        <div className="fixed inset-0 z-50 flex justify-center items-center w-full h-full">
                            <div className="relative w-full w-full h-full">
                                <div className="relative bg-[#F8FAFB] shadow-sm dark:bg-gray-700 h-full flex flex-col rounded-lg">

                                    {/* header */}
                                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                                        <h3 className="inline-flex items-center gap-2 text-base poppins-semibold text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pass-fill" viewBox="0 0 16 16">
                                                <path d="M10 0a2 2 0 1 1-4 0H3.5A1.5 1.5 0 0 0 2 1.5v13A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 12.5 0zM4.5 5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1m0 2h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1 0-1" />
                                            </svg>
                                            Apontamentos do chamado #{chamadoSelecionado?.id}
                                        </h3>
                                        <button type="button" onClick={() => setOpenApontamentos(false)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                                            <span className="sr-only">Fechar</span>
                                            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* corpo */}
                                    <div className="flex-1 overflow-y-auto p-6">
                                        <ol className="relative bg-white rounded-lg border-s border-gray-300 mb-10">
                                            {apontamentos.map((a) => (
                                                <li key={a.id} className="mb-10 py-4 ms-4">
                                                    <div className={`absolute w-3 h-3 rounded-full mt-1.5 -start-1.5 ${a.fim ? "bg-green-500" : "bg-yellow-500"}`}></div>
                                                    <time className="mb-1 text-sm text-gray-500">
                                                        {new Date(a.comeco).toLocaleString("pt-BR")}
                                                    </time>
                                                    <h3 className="text-lg poppins-semibold">
                                                        {a.fim ? "Apontamento finalizado" : "Apontamento em andamento"}
                                                    </h3>
                                                    <p className="text-gray-700">{a.descricao}</p>
                                                    {a.fim && (
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Encerrado em {new Date(a.fim).toLocaleString("pt-BR")}
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-gray-500 mt-1 italic">
                                                        Técnico: {a.tecnico_nome}
                                                    </p>
                                                </li>
                                            ))}
                                        </ol>
                                        {apontamentos.length === 0 && (
                                            <p className="text-gray-500">Nenhum apontamento encontrado.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <ChatWidget className='!fixed right-0 bottom-0' chamadoSelecionado={chamadoSelecionado}></ChatWidget>
                        </div>
                    )}

                    {openAvaliacao && (

                        <div className="fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black/30">
                            <div className="relative p-4 w-full max-w-md max-h-full">
                                <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Avalie o atendimento</h3>
                                        <button type="button" onClick={() => setOpenAvaliacao(false)} className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                                            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                            </svg>
                                            <span className="sr-only">Fechar</span>
                                        </button>
                                    </div>
                                    <div className="p-4 md:p-5">
                                        <div className="space-y-4" >
                                            <div className="flex items-center justify-center mb-2">
                                                <a href="#">
                                                    <img className="w-35 h-35 rounded-full" src="/docs/images/people/profile-picture-1.jpg" alt="" />
                                                </a>
                                            </div>
                                            <p className="text-base text-center font-semibold leading-none text-gray-900 dark:text-white">Leos</p>
                                            <div className="flex justify-center items-center mb-5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <svg key={star} className={`w-6 h-6 ms-2 cursor-pointer ${(hover || rating) >= star ? 'text-yellow-300' : 'text-gray-300 dark:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20"
                                                        onClick={() => setRating(star)}  // clica para definir rating
                                                        onMouseEnter={() => setHover(star)}// hover
                                                        onMouseLeave={() => setHover(0)}>
                                                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                                                    </svg>
                                                ))}
                                            </div>

                                            <div className="col-span-2">
                                                <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Detalhes da avaliação</label>
                                                <textarea id="description" value={comentario} onChange={(e) => setComentario(e.target.value)} rows="4" className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:border-[#7F56D8] dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Descreva de forma detalhada os motivos de sua avaliação"></textarea>
                                            </div>
                                            <div className="flex justify-end mt-4">
                                                <button
                                                    onClick={enviarAvaliacao}
                                                    className="px-4 py-2 bg-[#7F56D8] text-white rounded-lg hover:bg-[#5a39a6]"
                                                >
                                                    Enviar Avaliação
                                                </button>
                                            </div>

                                        </div>
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