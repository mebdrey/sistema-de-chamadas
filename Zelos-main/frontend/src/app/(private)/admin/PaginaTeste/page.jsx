"use client"
import { useEffect, useMemo, useState } from "react";
import ToastMsg from '@/components/Toasts/Toasts';

export default function Setores() {
    const [setores, setSetores] = useState({}); // object vindo da API: { setorA: [usuarios], setorB: [usuarios] }
    const [busca, setBusca] = useState("");
    const [dropdownAberto, setDropdownAberto] = useState(false);
    const [dropdownAbertoId, setDropdownAbertoId] = useState(null);
    const [mostrarModalConfirmacao, setMostrarModalConfirmacao] = useState(false);
    const [usuarioParaDeletar, setUsuarioParaDeletar] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set()); // selecionados na tabela
    const [selectAll, setSelectAll] = useState(false);
    const toast = ToastMsg();

    // Carrega dados
    useEffect(() => {
        fetch("http://localhost:8080/usuarios-por-setor", { credentials: 'include' })
            .then((res) => res.json())
            .then((data) => {
                // Espera um objeto { setorNome: [usuarios], ... }
                setSetores(data || {});
            })
            .catch((err) => {
                console.error(err);
                toast.showToast('danger', 'Erro ao carregar usuários');
            });
    }, []);

    // --- Helpers de formatação ---
    function primeiraLetraMaiuscula(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    function formatarLabel(str) {
        if (!str) return '';
        const texto = String(str).replace(/_/g, ' ').toLowerCase();
        const correcoes = { "auxiliar limpeza": "Auxiliar de Limpeza", "apoio tecnico": "Apoio Técnico", "tecnico": "Técnico", "admin": "Administrador" };
        if (correcoes[texto]) return correcoes[texto];
        return texto.split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }

    // --- Construir lista única de funções encontradas em todos os usuários (para as tabs) ---
    const funcoes = useMemo(() => {
        const set = new Set();
        Object.values(setores).forEach(arr => {
            if (!Array.isArray(arr)) return;
            arr.forEach(u => {
                if (u && u.funcao) set.add(u.funcao);
            });
        });
        // garantir ordem desejada: técnicos, auxiliares, administradores se existirem
        const preferencia = ['tecnico', 'auxiliar_limpeza', 'admin'];
        const ordenadas = [...set].sort((a, b) => {
            const ia = preferencia.indexOf(a);
            const ib = preferencia.indexOf(b);
            if (ia === -1 && ib === -1) return a.localeCompare(b);
            if (ia === -1) return 1;
            if (ib === -1) return -1;
            return ia - ib;
        });
        return ordenadas;
    }, [setores]);

    // Tab ativa (por função). Se nenhuma função, mostrar todas (tab "Todos")
    const [tabAtiva, setTabAtiva] = useState(normalizarId("Todos"));

    useEffect(() => {
        // ao carregar funcoes, define a primeira como tab padrão (se existir)
        if (funcoes.length > 0 && tabAtiva === "Todos") {
            // mantém "Todos" como padrão para que mostre tudo; se preferir pegar a primeira função, tire o if
        }
    }, [funcoes]);

    // --- Juntar todos os usuários (de todos setores) para filtrar por função e busca ---
    const todosUsuarios = useMemo(() => {
        return Object.values(setores).flat().filter(Boolean);
    }, [setores]);

    // usuários após filtro por tab (função) e busca
    // const usuariosFiltrados = useMemo(() => {
    //     const termo = (busca || "").toLowerCase().trim();
    //     return todosUsuarios
    //         .filter(u => {
    //             if (!u) return false;
    //             if (tabAtiva !== "Todos") {
    //                 // comparamos por u.funcao exata
    //                 if (String(u.funcao).toLowerCase() !== String(tabAtiva).toLowerCase()) return false;
    //             }
    //             if (!termo) return true;
    //             return (
    //                 (u.nome && u.nome.toLowerCase().includes(termo)) ||
    //                 (u.email && u.email.toLowerCase().includes(termo)) ||
    //                 (u.funcao && u.funcao.toLowerCase().includes(termo)) ||
    //                 (String(u.id) && String(u.id).includes(termo))
    //             );
    //         })
    //         .sort((a, b) => a.nome.localeCompare(b.nome));
    // }, [todosUsuarios, busca, tabAtiva]);
    const usuariosFiltrados = useMemo(() => {
        const termo = (busca || "").toLowerCase().trim();

        return todosUsuarios
            .filter(u => {
                if (!u) return false;

                // usa normalização para comparar a função com a aba ativa
                if (tabAtiva !== normalizarId("Todos")) {
                    if (normalizarId(u.funcao) !== tabAtiva) return false;
                }

                if (!termo) return true;

                return (
                    (u.nome && u.nome.toLowerCase().includes(termo)) ||
                    (u.email && u.email.toLowerCase().includes(termo)) ||
                    (u.funcao && u.funcao.toLowerCase().includes(termo)) ||
                    (String(u.id) && String(u.id).includes(termo))
                );
            })
            .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
    }, [todosUsuarios, busca, tabAtiva]);

    // selecionar / desselecionar
    function toggleSelect(id) {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            setSelectAll(false);
            return newSet;
        });
    }
    function toggleSelectAll() {
        if (!selectAll) {
            const ids = usuariosFiltrados.map(u => u.id);
            setSelectedIds(new Set(ids));
            setSelectAll(true);
        } else {
            setSelectedIds(new Set());
            setSelectAll(false);
        }
    }

    function deletarUsuario(id) {
        fetch(`http://localhost:8080/usuarios/${id}`, { method: "DELETE", credentials: 'include' })
            .then((res) => {
                if (!res.ok) throw new Error("Erro ao excluir usuário");
                return res.json();
            })
            .then((data) => {
                toast.showToast('success', data.mensagem || 'Usuário excluído');
                // remove localmente
                setSetores(prev => {
                    const novo = {};
                    for (const s in prev) {
                        novo[s] = prev[s].filter(u => u.id !== id);
                    }
                    return novo;
                });
                setSelectedIds(prev => {
                    const ns = new Set(prev);
                    ns.delete(id);
                    return ns;
                });
            })
            .catch((err) => {
                console.error(err);
                toast.showToast('danger', "Não foi possível excluir o usuário.");
            });
    }

    // Action: abrir menu de um usuário
    function abrirMenu(usuarioId) {
        setDropdownAbertoId(prev => (prev === usuarioId ? null : usuarioId));
    }

    function normalizarId(text) {
        if (!text) return "";
        return String(text)
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "_")       // espaços -> underscore
            .replace(/[^a-z0-9_-]/g, ""); // remove chars inválidos
    }
    const [ratingsMap, setRatingsMap] = useState({});
    useEffect(() => {
        async function fetchRatings() {
            try {
                const res = await fetch('http://localhost:8080/por-usuario', { credentials: 'include' });
                if (!res.ok) throw new Error('Erro ao buscar médias');
                const json = await res.json();
                // json.tabela => [ { tecnico_id, nome, email, qtd, media_nota, ... }, ... ]
                const map = {};
                (json.tabela || []).forEach(r => {
                    map[r.tecnico_id] = { media: r.media_nota !== null ? Number(r.media_nota) : null, qtd: Number(r.qtd || 0) };
                });
                setRatingsMap(map);
            } catch (err) {
                console.error(err);
                // opcional: toast.showToast('danger', 'Não foi possível carregar avaliações');
            }
        }
        fetchRatings();
    }, []);
    return (
        <>
            {toast.UI}
            <div className="p-4 w-full dark:bg-gray-900 pb-10">
                <div className="p-4 mt-14 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between flex-col md:flex-row gap-4 mb-4">
                        {/* Tabs por função */}
                        {/* <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={() => setTabAtiva("Todos")}
                                className={`px-4 py-2 rounded-md text-sm poppins-medium ${tabAtiva === "Todos" ? "bg-white border border-gray-200" : "bg-transparent text-gray-600 dark:text-gray-300"}`}>
                                Todos
                            </button>
                            {funcoes.map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setTabAtiva(f)}
                                    className={`px-4 py-2 rounded-md text-sm poppins-medium ${tabAtiva === f ? "bg-violet-700 text-white" : "bg-transparent text-gray-600 dark:text-gray-300"}`}>
                                    {formatarLabel(f)}
                                </button>
                            ))}
                        </div> */}
                        <div className="hidden md:block">
                            <div className="flex flex-row items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700">
                                <ul className="flex flex-wrap -mb-px text-sm poppins-medium text-center">
                                    {/* Tab "Todos" */}
                                    <li className="me-2" role="presentation" key="todos">
                                        <button
                                            onClick={() => setTabAtiva(normalizarId("Todos"))}
                                            className={`inline-block p-4 border-b-2 rounded-t-lg hover:text-violet-600 hover:border-violet-300 dark:hover:text-violet-600 dark:hover:border-violet-300 hover:cursor-pointer ${tabAtiva === normalizarId("Todos")
                                                ? "active border-[#7F56D8] text-[#7F56D8]"
                                                : "border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300"
                                                }`}
                                            type="button"
                                        >
                                            Todos
                                        </button>
                                    </li>

                                    {/* Tabs dinâmicas a partir de funcoes */}
                                    {funcoes.map((f) => {
                                        const funcId = normalizarId(f);
                                        return (
                                            <li className="me-2" role="presentation" key={f}>
                                                <button
                                                    onClick={() => setTabAtiva(funcId)}
                                                    className={`inline-block p-4 border-b-2 rounded-t-lg hover:text-violet-600 hover:border-violet-300 dark:hover:text-violet-600 dark:hover:border-violet-300 hover:cursor-pointer ${tabAtiva === funcId
                                                        ? "active border-[#7F56D8] text-[#7F56D8]"
                                                        : "border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300"
                                                        }`}
                                                    type="button"
                                                >
                                                    {formatarLabel(f)}
                                                </button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        </div>




                        <div className="flex items-center gap-3">
                            {/* Filtros dropdown */}
                            {/* <div className="relative inline-block text-left">
                                <button
                                    onClick={() => setDropdownAberto(!dropdownAberto)}
                                    className="cursor-pointer text-white bg-violet-700 hover:bg-violet-800 focus:ring-4 focus:outline-none focus:ring-violet-300 poppins-medium rounded-lg text-sm px-4 py-2 inline-flex items-center">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true" >
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" /></svg>
                                </button>
                                {dropdownAberto && (
                                    // <div className="z-10 absolute right-0 mt-2 bg-white dark:bg-gray-700 divide-y divide-gray-100 rounded-lg shadow-sm w-48">
                                    //     <ul className="p-3 text-sm text-gray-700 dark:text-gray-200">
                                    //         <li className="py-1"><a href="#" onClick={e => e.preventDefault()}>Exportar CSV</a></li>
                                    //         <li className="py-1"><a href="#" onClick={e => e.preventDefault()}>Importar</a></li>
                                    //         <li className="py-1"><a href="#" onClick={e => e.preventDefault()}>Ativar contas</a></li>
                                    //     </ul>
                                    // </div>
                                    <div className="absolute right-0 mt-2 min-w-40 z-20 bg-white shadow-2xl rounded-lg p-2 divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-800 dark:border dark:border-gray-700" role="menu">
                                    <div className="py-2 first:pt-0 last:pb-0">
                                      <span className="block py-2 px-3 text-xs text-left poppins-medium uppercase text-gray-400 dark:text-gray-600">Ações</span>
                                      <button onClick={e => e.preventDefault()} className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200 w-full text-left">Exportar CVS</button>
                                      <button onClick={e => e.preventDefault()} className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-red-600 hover:bg-gray-100 dark:text-red-500 dark:hover:bg-gray-700 dark:focus:bg-gray-700 dark:focus:text-gray-300 w-full text-left">Excluir</button>
                                    </div>
                                  </div>
                                )}
                            </div> */}

                            {/* Search */}
                            <form className="flex items-center" onSubmit={(e) => e.preventDefault()}>
                                <label htmlFor="simple-search" className="sr-only">Search</label>
                                <div className="relative w-80">
                                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2" /></svg>
                                    </div>
                                    <input type="text" id="simple-search" className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full ps-10 p-2.5 placeholder-gray-400" placeholder="Pesquisar por usuário" value={busca} onChange={(e) => setBusca(e.target.value)} />
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Table container */}
                    <div className="overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                        <table className="w-full min-w-[900px] text-sm text-left">
                            <thead className="dark:bg-gray-600 bg-gray-100 text-xs text-gray-900 uppercase">
                                <tr>
                                    {/* <th className="px-4 py-3 w-12">
                                        <div className="flex items-center">
                                            <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} className="w-4 h-4 text-violet-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-violet-500 dark:focus:ring-violet-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                        </div>
                                    </th> */}
                                    <th className="px-6 py-3">Nome</th>
                                    <th className="px-6 py-3">Função</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Avaliação</th>
                                    <th className="px-6 py-3 text-end">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuariosFiltrados.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Nenhum usuário encontrado.</td>
                                    </tr>
                                )}

                                {usuariosFiltrados.map(usuario => {
                                    const ativo = usuario.status_usuarios === "ativo";
                                    return (
                                        <tr key={usuario.id} className="bg-white border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700">
                                            {/* <td className="px-4 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(usuario.id)}
                                                    onChange={() => toggleSelect(usuario.id)}
                                                    className="w-4 h-4"
                                                /> 
                                             <div className="flex items-center">
                                                    <input checked={selectedIds.has(usuario.id)} id="checked-checkbox" onChange={() => toggleSelect(usuario.id)} type="checkbox" value="" className="w-4 h-4 text-violet-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-violet-500 dark:focus:ring-violet-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                                </div> 
                                            </td> */}

                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="relative w-8 h-8 overflow-hidden bg-gray-100 rounded-full ">
                                                        {usuario.ftPerfil ? (
                                                            <img className="w-10 h-10 rounded-full object-cover" src={`http://localhost:8080/uploads/${usuario.ftPerfil}`} alt={usuario.nome} />
                                                        ) : (<svg className="absolute w-10 h-10 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                                        )}
                                                    </div>
                                                    <div className="ms-3">
                                                        <div className="text-gray-800 dark:text-gray-100">{usuario.nome}</div>
                                                        <div className="text-gray-500 text-sm dark:text-gray-400">{usuario.email}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 dark:text-gray-100">{formatarLabel(usuario.funcao)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center dark:text-gray-100">
                                                    <div className={`h-2.5 w-2.5 rounded-full me-2  ${usuario.status_usuarios === "ativo" ? "bg-green-500 " : "bg-red-500"}`}></div>
                                                    {primeiraLetraMaiuscula(usuario.status_usuarios)}
                                                </div>
                                            </td>

                                            {/* <td className="px-6 py-4 dark:text-gray-100">{usuario.id}</td> */}
                                            <td className="px-6 py-4 dark:text-gray-100">
                                                {ratingsMap[usuario.id] ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="poppins-medium">{ratingsMap[usuario.id].media !== null ? ratingsMap[usuario.id].media.toFixed(2) : '—'}</span>
                                                        <span className="text-xs text-gray-500">({ratingsMap[usuario.id].qtd})</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">S/A</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-end relative">
                                                <button onClick={() => abrirMenu(usuario.id)} className="inline-flex items-center p-2 text-sm poppins-medium text-center text-gray-900 dark:text-gray-300 bg-white dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50 " aria-expanded={dropdownAbertoId === usuario.id}
                                                >
                                                    <svg className="w-5 h-5" viewBox="0 0 16 3" fill="currentColor"><path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" /></svg>
                                                </button>
                                                {/* Dropdown */}
                                                {dropdownAbertoId === usuario.id && (
                                                    <div className="z-10 absolute text-start right-0 mt-2 bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 rounded-lg shadow-sm w-44" role="menu" aria-orientation="vertical" aria-labelledby="dropdownMenuIconHorizontalButton" >
                                                        <div className="py-2">
                                                            <a onClick={() => { setUsuarioParaDeletar(usuario.id); setMostrarModalConfirmacao(true); }} className="block px-4 py-2 text-sm dark:text-gray-400 text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">Deletar usuário</a>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {/* tem tz q deseja excluir o usuario? */}
                    {mostrarModalConfirmacao && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md dark:bg-gray-700">
                                <div className="text-center">
                                    <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 " fill="none" viewBox="0 0 20 20"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                    <h3 className="mb-5 text-lg poppins-regular text-gray-500">Tem certeza que deseja excluir este usuário?</h3>
                                    <button onClick={() => { deletarUsuario(usuarioParaDeletar); setMostrarModalConfirmacao(false); }} className="text-white bg-[#7F56D8] focus:ring-4 focus:outline-none focus:ring-[#7F56D8] poppins-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                                        Sim, excluir
                                    </button>
                                    <button onClick={() => { setMostrarModalConfirmacao(false); setUsuarioParaDeletar(null); }} className="py-2.5 px-5 ms-3 text-sm poppins-medium text-gray-900 focus:outline-none bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600 rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-[#7F56D8] focus:z-10 focus:ring-4 focus:ring-gray-100" >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
