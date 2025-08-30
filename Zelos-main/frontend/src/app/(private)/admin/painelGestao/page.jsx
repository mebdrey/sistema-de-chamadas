// app/admin/page.jsx
"use client";
import React, { useEffect, useState, useRef } from "react";

const API_BASE_URL = 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// fetch com timeout reutilizado
const fetchWithTimeout = async (url, options, timeout = 7000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      const error = new Error(errorBody.message || 'Erro na requisição');
      error.body = errorBody;
      throw error;
    }
    return response.json();
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export default function PainelGestao() {
  const [toasts, setToasts] = useState([]);
  const addToast = (t) => setToasts(s => [...s, { id: Date.now() + Math.random(), ...t }]);
  const removeToast = (id) => setToasts(s => s.filter(x => x.id !== id));

  const [usuarios, setUsuarios] = useState([]);
  const [setores, setSetores] = useState([]);
  const [prioridades, setPrioridades] = useState([]);

  const [loading, setLoading] = useState(false);

  // Create user modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [form, setForm] = useState({ nome: "", username: "", email: "", senha: "", funcao: "usuario" });
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const suggestionAbortRef = useRef(null);
  const [showSetorModal, setShowSetorModal] = useState(false);
  const [novoSetor, setNovoSetor] = useState({ titulo: "", descricao: "" });
  const [prioridadeForm, setPrioridadeForm] = useState({ nome: '', prazo_dias: 0 }); // Adicionado
  const [prazoForm, setPrazoForm] = useState({ chamadoId: '', prioridade_id: '' }); // Adicionado
  const [calculatedPrazo, setCalculatedPrazo] = useState(null); // Adicionado
  const [openDropdownId, setOpenDropdownId] = useState(null); // Estado para controlar dropdowns abertos

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [u, p, s] = await Promise.all([
        fetchWithTimeout(`${API_BASE_URL}/usuarios`, { method: 'GET', headers: getAuthHeaders() }, 10000).catch(e => { addToast({ title: 'Erro listar usuários', msg: e.message, type: 'error' }); return []; }),
        fetchWithTimeout(`${API_BASE_URL}/prioridades`, { method: 'GET', headers: getAuthHeaders() }, 10000).catch(e => { addToast({ title: 'Erro listar prioridades', msg: e.message, type: 'error' }); return []; }),
        fetchWithTimeout(`${API_BASE_URL}/pool`, { method: 'GET', headers: getAuthHeaders() }, 10000).catch(e => { addToast({ title: 'Erro listar setores', msg: e.message, type: 'error' }); return []; }),
      ]);
      setUsuarios(u || []);
      setPrioridades(p || []);
      setSetores(s || []);
    } catch (err) {
      addToast({ title: 'Erro geral', msg: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Suggest usernames as user types nome
  const suggestUsernames = async (nome) => {
    setUsernameSuggestions([]);
    if (!nome || nome.trim().length < 2) return;
    // debounce + abort
    if (suggestionAbortRef.current) suggestionAbortRef.current.abort();
    suggestionAbortRef.current = new AbortController();
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/usuarios/sugerir-username`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, // Adicionar auth headers
        body: JSON.stringify({ nome }),
        signal: suggestionAbortRef.current.signal
      }, 7000);
      setUsernameSuggestions(res.sugestoes || res.sugestões || []);
    } catch (err) {
      // silently ignore suggestion failures, but show small toast
      addToast({ title: 'Sugestões indisponíveis', msg: err.message, type: 'error' });
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    // client validation
    if (!form.nome || !form.email || !form.senha) {
      addToast({ title: 'Campos obrigatórios', msg: 'Preencha nome, email e senha', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form };
      const res = await fetchWithTimeout(`${API_BASE_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, // Adicionar auth headers
        body: JSON.stringify(payload)
      }, 10000);
      addToast({ title: 'Usuário criado', msg: `id: ${res.id}`, type: 'success' });
      setShowUserModal(false);
      setForm({ nome: "", username: "", email: "", senha: "", funcao: "usuario" });
      await loadAll();
    } catch (err) {
      // show server-provided message when present
      addToast({ title: 'Erro criar usuário', msg: err.message || (err.body && err.body.message) || 'Erro desconhecido', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCriarSetor = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/pool`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() }, // Adicionar auth headers
        body: JSON.stringify(novoSetor)
      });
      if (!res.ok) throw new Error("Erro ao criar setor");
      addToast({ title: "Sucesso", msg: "Setor criado", type: "success" });
      setShowSetorModal(false);
      setNovoSetor({ titulo: "", descricao: "" });
      await loadAll(); // recarrega lista
    } catch (err) {
      addToast({ title: "Erro criar setor", msg: err.message, type: "error" });
    }
  };

  const handleExcluirSetor = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este setor?")) return;
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/pool/${id}`, { method: "DELETE", headers: getAuthHeaders() }); // Adicionar auth headers
      if (!res.ok) throw new Error("Erro ao excluir setor");
      addToast({ title: "Sucesso", msg: "Setor excluído", type: "success" });
      await loadAll();
    } catch (err) {
      addToast({ title: "Erro excluir setor", msg: err.message, type: "error" });
    }
  };

  const [editSetor, setEditSetor] = useState(null);

  const handleAtualizarSetor = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/pool/${editSetor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() }, // Adicionar auth headers
        body: JSON.stringify({ titulo: editSetor.titulo, descricao: editSetor.descricao })
      });
      if (!res.ok) throw new Error("Erro ao atualizar setor");
      addToast({ title: "Sucesso", msg: "Setor atualizado", type: "success" });
      setEditSetor(null);
      await loadAll();
    } catch (err) {
      addToast({ title: "Erro atualizar setor", msg: err.message, type: "error" });
    }
  };

  const handlePrioridadeFormChange = (e) => {
    setPrioridadeForm({ ...prioridadeForm, [e.target.name]: e.target.value });
  };

  const handleCriarPrioridade = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/prioridades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, // Adicionar auth headers
        body: JSON.stringify(prioridadeForm)
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
        throw new Error(errorBody.message || 'Erro ao criar prioridade');
      }
      addToast({ title: 'Prioridade criada', msg: 'Nova prioridade adicionada', type: 'success' });
      setPrioridadeForm({ nome: '', prazo_dias: 0 });
      await loadAll();
    } catch (err) {
      addToast({ title: 'Erro criar prioridade', msg: err.message, type: 'error' });
    }
  };

  // Edit Prioridade
  const [editPrioridade, setEditPrioridade] = useState(null);

  const handleAtualizarPrioridade = async (e) => {
    e.preventDefault();
    if (!editPrioridade || !editPrioridade.id) return;

    try {
      const payload = { nome: editPrioridade.nome, prazo_dias: Number(editPrioridade.prazo_dias) };
      const res = await fetchWithTimeout(`${API_BASE_URL}/prioridades/${editPrioridade.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, // Adicionar auth headers
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
        throw new Error(errorBody.message || 'Erro ao atualizar prioridade');
      }
      addToast({ title: 'Prioridade atualizada', msg: 'Prioridade salva com sucesso', type: 'success' });
      setEditPrioridade(null);
      await loadAll();
    } catch (err) {
      addToast({ title: 'Erro atualizar prioridade', msg: err.message, type: 'error' });
    }
  };

  const handleExcluirPrioridade = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta prioridade?")) return;
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/prioridades/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() } // Adicionar auth headers
      });
      if (!res.ok) throw new Error("Erro ao excluir prioridade");
      addToast({ title: "Sucesso", msg: "Prioridade excluída", type: "success" });
      await loadAll();
    } catch (err) {
      addToast({ title: "Erro excluir prioridade", msg: err.message, type: "error" });
    }
  };

  const handleCalcularPrazo = async (e) => {
    e.preventDefault();
    if (!prazoForm.prioridade_id) { addToast({ title: 'Erro', msg: 'Selecione uma prioridade', type: 'error' }); return; }
    try {
      const prioridadeSelecionada = prioridades.find(p => String(p.id) === String(prazoForm.prioridade_id));
      if (!prioridadeSelecionada) { addToast({ title: 'Erro', msg: 'Prioridade não encontrada', type: 'error' }); return; }
      const res = await fetchWithTimeout(`${API_BASE_URL}/chamados/calcular-prazo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, // Adicionar auth headers
        body: JSON.stringify({ prioridade: prioridadeSelecionada.nome })
      });
      setCalculatedPrazo(res.data_limite || null);
      addToast({ title: 'Sucesso', msg: 'Data limite calculada', type: 'success' });
    } catch (err) {
      addToast({ title: 'Erro calcular prazo', msg: err.message, type: 'error' });
    }
  };

  const handleAtualizarPrazoChamado = async (e) => {
    e.preventDefault();
    if (!prazoForm.chamadoId) { addToast({ title: 'Erro', msg: 'Informe o ID do chamado', type: 'error' }); return; }
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/chamados/${prazoForm.chamadoId}/prazo`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders() } // Adicionar auth headers
      });
      if (!res.ok) throw new Error("Erro ao atualizar prazo");
      addToast({ title: 'Sucesso', msg: 'Prazo do chamado atualizado', type: 'success' });
    } catch (err) {
      addToast({ title: 'Erro atualizar prazo', msg: err.message, type: 'error' });
    }
  };

  function formatarLabel(str) {
    const texto = str.replace(/_/g, ' ').toLowerCase();

    const correcoes = { "auxiliar_limpeza": "Auxiliar de Limpeza", "apoio_tecnico": "Apoio Técnico", "tecnico": "Técnico", "manutencao": "Manutenção", "media": "Média" };

    if (correcoes[texto]) { return correcoes[texto]; }

    // capitaliza cada palavra caso não tenha uma correção personalizada
    return texto
      .split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  }
  return (
    <div className="p-4 w-full dark:bg-gray-800">
      {showSetorModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
          <form onSubmit={handleCriarSetor} className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Criar Novo Setor</h3>
            <input type="text" value={novoSetor.titulo} onChange={(e) => setNovoSetor({ ...novoSetor, titulo: e.target.value })} className="form-input mb-3" placeholder="Título do Setor" required />
            <textarea value={novoSetor.descricao} onChange={(e) => setNovoSetor({ ...novoSetor, descricao: e.target.value })} className="form-textarea mb-3" placeholder="Descrição do Setor"></textarea>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowSetorModal(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Criar</button>
            </div>
          </form>
        </div>
      )}
      <div className="p-4 mt-14">

        <main className="max-w-7xl mx-auto">
          <div className="flex flex-col">
            {/* Card: Usuários */}
            <section className="bg-white rounded-2xl shadow-sm p-6 dark:bg-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold dark:text-white">Criar novos usuários</h3>
              </div>
              <div className="mt-4 space-y-3">


                <form className="max-w-md mx-auto" onSubmit={handleCreateUser}> {/* Adicionar onSubmit */}
                  {/* Nome completo */}
                  <div className="relative z-0 w-full mb-5 group">
                    <input
                      type="text"
                      name="nome"
                      id="user_full_name"
                      className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      placeholder=" "
                      value={form.nome}
                      onChange={(e) => { setForm({ ...form, nome: e.target.value }); suggestUsernames(e.target.value); }}
                      required
                    />
                    <label htmlFor="user_full_name" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Nome completo</label>
                  </div>

                  {/* Username e sugestões */}
                  <div className="relative z-0 w-full mb-5 group">
                    <input
                      type="text"
                      name="username"
                      id="user_username"
                      className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      placeholder=" "
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      required
                    />
                    <label htmlFor="user_username" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Username</label>
                    {usernameSuggestions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {usernameSuggestions.map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, username: s }))}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded-full"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="relative z-0 w-full mb-5 group">
                    <input
                      type="email"
                      name="email"
                      id="user_email"
                      className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      placeholder=" "
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                    <label htmlFor="user_email" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Email</label>
                  </div>

                  {/* Senha */}
                  <div className="relative z-0 w-full mb-5 group">
                    <input
                      type="password"
                      name="senha"
                      id="user_password"
                      className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      placeholder=" "
                      value={form.senha}
                      onChange={(e) => setForm({ ...form, senha: e.target.value })}
                      required
                    />
                    <label htmlFor="user_password" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Senha</label>
                  </div>

                   <div className="grid md:grid-cols-2 md:gap-6">
                    <div className="relative z-0 w-full mb-5 group">
                      <input type="password" name="repeat_password" id="floating_repeat_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                      <label htmlFor="floating_repeat_password" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Confirmar senha</label>
                    </div>
                  </div>

                  {/* Função */}
                  <div className="relative z-0 w-full mb-5 group">
                    <input
                      type="text"
                      name="funcao"
                      id="user_function"
                      className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      placeholder="Ex: tecnico_externo, auxiliar_limpeza, admin"
                      value={form.funcao}
                      onChange={(e) => setForm({ ...form, funcao: e.target.value })}
                      required
                    />
                    <label htmlFor="user_function" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Função</label>
                  </div>

                  <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Criar Usuário</button>
                </form>


              </div>
            </section>

            {/* Card: Setores */}
            <section className="flex flex-col">
              <div className="-m-1.5 overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block align-middle">
                  <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden dark:bg-neutral-900 dark:border-neutral-700 dark:bg-gray-700">
                    <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200 dark:border-neutral-700">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200 dark:text-white">Setores / Pools</h2>
                        <p className="text-sm text-gray-600 dark:text-neutral-400 dark:text-gray-200">Crie, edite e exclua setores.</p>
                      </div>

                      <div>
                        <div className="inline-flex gap-x-2">

                          <button
                            type="button"
                            onClick={() => setShowSetorModal(true)} // Adicionar onClick para abrir modal
                            className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none ">Criar setor</button>
                        </div>
                      </div>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                      <thead className="bg-gray-50 dark:bg-neutral-800 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-start">
                            <a className="group inline-flex items-center gap-x-2 text-xs font-semibold uppercase text-gray-800 hover:text-gray-500 focus:outline-hidden focus:text-gray-500 dark:text-neutral-200 dark:hover:text-neutral-500 dark:focus:text-neutral-500 dark:text-white " href="#">Setor <svg className="shrink-0 size-3.5 text-gray-800 dark:text-neutral-200 dark:text-gray-200 " width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></svg>
                            </a>
                          </th>

                          <th scope="col" className="px-6 py-3 text-start">
                            <a className="group inline-flex items-center gap-x-2 text-xs font-semibold uppercase text-gray-800 hover:text-gray-500 focus:outline-hidden focus:text-gray-500 dark:text-neutral-200 dark:hover:text-neutral-500 dark:focus:text-neutral-500 dark:text-white" href="#">Descrição<svg className="shrink-0 size-3.5 text-gray-800 dark:text-neutral-200 dark:text-gray-200" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></svg>
                            </a>
                          </th>

                          <th scope="col" className="px-6 py-3 text-end"></th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                        {setores.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-neutral-400 dark:text-gray-200" >
                              Nenhum setor encontrado
                            </td>
                          </tr>
                        ) : (
                          setores.map((s) => (
                            <tr key={s.id} className="bg-white hover:bg-gray-50 dark:bg-neutral-900 dark:hover:bg-neutral-800" >
                              {/* Coluna: Setor */}
                              <td className="size-px whitespace-nowrap">
                                <a className="block relative z-10" href="#">
                                  <div className="px-6 py-2">
                                    <span className="inline-flex items-center gap-1.5 py-1 px-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 dark:bg-neutral-900 dark:text-neutral-200">
                                      {formatarLabel(s.titulo)}
                                    </span>
                                  </div>
                                </a>
                              </td>

                              {/* Coluna: Descrição */}
                              <td className="h-px w-72 min-w-72">
                                <a className="block relative z-10" href="#">
                                  <div className="px-6 py-2">
                                    <p className="text-sm text-gray-500 dark:text-neutral-500">
                                      {s.descricao || "—"}
                                    </p>
                                  </div>
                                </a>
                              </td>
                              {editSetor && (
                                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
                                  <form onSubmit={handleAtualizarSetor} className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                                    <h3 className="text-lg font-semibold mb-4">Editar setor</h3>
                                    <input type="text" value={editSetor.titulo} onChange={(e) => setEditSetor({ ...editSetor, titulo: e.target.value })} className="w-full border rounded-lg p-2 mb-3"/>
                                    <textarea value={editSetor.descricao} onChange={(e) => setEditSetor({ ...editSetor, descricao: e.target.value })} className="w-full border rounded-lg p-2 mb-3"/>
                                    <div className="flex justify-end gap-2">
                                      <button type="button" onClick={() => setEditSetor(null)} className="px-4 py-2 border rounded-lg">
                                        Cancelar
                                      </button>
                                      <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg">
                                        Atualizar
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              )}

                              {/* Coluna: Ações */}
                              <td className="size-px whitespace-nowrap">
                                <div className="px-6 py-2 relative">
                                  <button
                                    type="button"
                                    onClick={() => setOpenDropdownId(openDropdownId === s.id ? null : s.id)}
                                    className="py-1.5 px-2 inline-flex justify-center items-center gap-2 rounded-lg text-gray-700 align-middle disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:text-neutral-400 dark:hover:text-white dark:focus:ring-offset-gray-800"
                                    aria-haspopup="menu"
                                    aria-expanded={openDropdownId === s.id}
                                  >
                                    <svg className="shrink-0 size-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <circle cx="12" cy="12" r="1" />
                                      <circle cx="19" cy="12" r="1" />
                                      <circle cx="5" cy="12" r="1" />
                                    </svg>
                                  </button>

                                  {openDropdownId === s.id && (
                                    <div
                                      className="absolute right-0 mt-2 min-w-40 z-20 bg-white shadow-2xl rounded-lg p-2 divide-y divide-gray-200 dark:divide-neutral-700 dark:bg-neutral-800 dark:border dark:border-neutral-700"
                                      role="menu"
                                    >
                                      <div className="py-2 first:pt-0 last:pb-0">
                                        <span className="block py-2 px-3 text-xs font-medium uppercase text-gray-400 dark:text-neutral-600">Ações</span>
                                        <button onClick={() => { setEditSetor(s); setOpenDropdownId(null); }} className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 w-full text-left">Editar</button>

                                        <button onClick={() => { handleExcluirSetor(s.id); setOpenDropdownId(null); }} className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-red-600 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 dark:text-red-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700 dark:focus:text-neutral-300 w-full text-left">Excluir
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                    <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-t border-gray-200 dark:border-neutral-700">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-neutral-400 dark:text-gray-200"><span className="font-semibold text-gray-800 dark:text-neutral-200 dark:text-gray-200">{setores.length}</span> resultados</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Card: Prioridades */}
            <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto ">
              <div className="flex flex-col">
                <div className="-m-1.5 overflow-x-auto">
                  <div className="p-1.5 min-w-full inline-block align-middle">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden dark:bg-neutral-900 dark:border-neutral-700 dark:bg-gray-600">
                      <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200 dark:border-neutral-700">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200">Prioridades</h2>
                          <p className="text-sm text-gray-600 dark:text-neutral-400">Edite as prioridades.</p>
                        </div>

                        <div>
                          <div className="inline-flex gap-x-2">
                            <button
                              type="button"
                              onClick={() => setEditPrioridade({ id: null, nome: '', prazo_dias: 0 })} // Abre modal para nova prioridade ou edita existente
                              className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                            >
                              <svg className="shrink-0 size-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                              Nova Prioridade
                            </button>
                          </div>
                        </div>
                      </div>

                      <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                        <thead className="bg-gray-50 divide-y divide-gray-200 dark:bg-neutral-800 dark:divide-neutral-700 dark:bg-gray-500">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-start border-s border-gray-200 dark:border-neutral-700">
                              <span className="text-xs font-semibold uppercase text-gray-800 dark:text-neutral-200">Nome</span>
                            </th>

                            <th scope="col" className="px-6 py-3 text-start">
                              <span className="text-xs font-semibold uppercase text-gray-800 dark:text-neutral-200">Prazo (dias)</span>
                            </th>

                            <th scope="col" className="px-6 py-3 text-end"></th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                          {prioridades.length === 0 ? (
                            <tr>
                              <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-neutral-400">
                                Nenhuma prioridade encontrada.
                              </td>
                            </tr>
                          ) : (
                            prioridades.map((p) => (
                              <tr key={p.id} className="bg-white hover:bg-gray-50 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                                <td className="h-px w-auto whitespace-nowrap">
                                  <div className="px-6 py-2">
                                    <span className="text-sm text-gray-800 dark:text-neutral-200">{formatarLabel(p.nome)}</span>
                                  </div>
                                </td>
                                <td className="h-px w-auto whitespace-nowrap">
                                  <div className="px-6 py-2">
                                    <span className="text-sm text-gray-800 dark:text-neutral-200">{p.prazo_dias} dias</span>
                                  </div>
                                </td>
                                <td className="size-px whitespace-nowrap text-end">
                                  <div className="px-6 py-2">
                                    <div className="hs-dropdown [--placement:bottom-right] relative inline-block">
                                      <button
                                        type="button"
                                        onClick={() => setOpenDropdownId(openDropdownId === p.id ? null : p.id)}
                                        className="py-1.5 px-2 inline-flex justify-center items-center gap-2 rounded-lg text-gray-700 align-middle disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:text-neutral-400 dark:hover:text-white dark:focus:ring-offset-gray-800"
                                        aria-haspopup="menu"
                                        aria-expanded={openDropdownId === p.id}
                                      >
                                        <svg className="shrink-0 size-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                                        </svg>
                                      </button>
                                      {openDropdownId === p.id && (
                                        <div
                                          className="absolute right-0 mt-2 min-w-40 z-20 bg-white shadow-2xl rounded-lg p-2 divide-y divide-gray-200 dark:divide-neutral-700 dark:bg-neutral-800 dark:border dark:border-neutral-700"
                                          role="menu"
                                        >
                                          <div className="py-2 first:pt-0 last:pb-0">
                                            <span className="block py-2 px-3 text-xs font-medium uppercase text-gray-400 dark:text-neutral-600">Ações</span>
                                            <button onClick={() => { setEditPrioridade(p); setOpenDropdownId(null); }} className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 w-full text-left">Editar</button>
                                            <button onClick={() => { handleExcluirPrioridade(p.id); setOpenDropdownId(null); }} className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-red-600 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 dark:text-red-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700 dark:focus:text-neutral-300 w-full text-left">Excluir</button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>

                      {editPrioridade && (
                        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
                          <form onSubmit={handleAtualizarPrioridade} className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4">Editar Prioridade</h3>
                            <input type="text" value={editPrioridade.nome} onChange={(e) => setEditPrioridade({ ...editPrioridade, nome: e.target.value })} className="form-input mb-3" placeholder="Nome da Prioridade" />
                            <input type="number" value={editPrioridade.prazo_dias} onChange={(e) => setEditPrioridade({ ...editPrioridade, prazo_dias: Number(e.target.value) })} className="form-input mb-3" placeholder="Prazo em dias" />
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => setEditPrioridade(null)} className="px-4 py-2 border rounded-lg">Cancelar</button>
                              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Atualizar</button>
                            </div>
                          </form>
                        </div>
                      )}

                      <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-t border-gray-200 dark:border-neutral-700">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-neutral-400">
                            <span className="font-semibold text-gray-800 dark:text-neutral-200">{prioridades.length}</span> resultados
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}