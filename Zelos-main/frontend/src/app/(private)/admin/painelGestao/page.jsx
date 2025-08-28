// app/admin/page.jsx
"use client";
import React, { useEffect, useState, useRef } from "react";

export default function PainelGestao() {
  const [toasts, setToasts] = useState([]);
  const addToast = (t) => setToasts(s => [...s, { id: Date.now()+Math.random(), ...t }]);
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

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [u, p, s] = await Promise.all([
        fetchWithTimeout('/api/usuarios', { method: 'GET' }, 10000).catch(e => { addToast({title:'Erro listar usuários', msg:e.message, type:'error'}); return []; }),
        fetchWithTimeout('/api/prioridades', { method: 'GET' }, 10000).catch(e => { addToast({title:'Erro listar prioridades', msg:e.message, type:'error'}); return []; }),
        fetchWithTimeout('/api/pool', { method: 'GET' }, 10000).catch(e => { addToast({title:'Erro listar setores', msg:e.message, type:'error'}); return []; }),
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
      const res = await fetchWithTimeout('/api/usuarios/sugerir', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
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
      const res = await fetchWithTimeout('/api/usuarios', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
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
    const res = await fetch("http://localhost:8080/pool", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    const res = await fetch(`http://localhost:8080/pool/${id}`, { method: "DELETE" });
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
    const res = await fetch(`http://localhost:8080/pool/${editSetor.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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


  return (
    <div className="p-4 w-full">
      <div className="p-4 mt-14">
    
      <main className="max-w-7xl mx-auto">
        <div className="flex flex-col">
          {/* Card: Usuários */}
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Criar novos usuários</h3>
            </div>
            <div className="mt-4 space-y-3">
             

<form class="max-w-md mx-auto">
  <div class="relative z-0 w-full mb-5 group">
      <input type="email" name="floating_email" id="floating_email" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
      <label for="floating_email" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Username</label>
  </div>
  <div class="grid md:grid-cols-2 md:gap-6">
  <div class="relative z-0 w-full mb-5 group">
      <input type="password" name="floating_password" id="floating_password" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
      <label for="floating_password" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Senha</label>
  </div>
  <div class="relative z-0 w-full mb-5 group">
      <input type="password" name="repeat_password" id="floating_repeat_password" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
      <label for="floating_repeat_password" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Confirmar senha</label>
  </div>
  </div>
  <div class="grid md:grid-cols-2 md:gap-6">
    <div class="relative z-0 w-full mb-5 group">
        <input type="text" name="floating_first_name" id="floating_first_name" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
        <label for="floating_first_name" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Nome completo</label>
    </div>
   <div class="relative z-0 w-full mb-5 group">
      <input type="email" name="floating_email" id="floating_email" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
      <label for="floating_email" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Email</label>
  </div>
  </div>
    <div class="relative z-0 w-full mb-5 group">
        <input type="text" name="floating_company" id="floating_company" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
        <label for="floating_company" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Função</label>
    </div>
  <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
</form>

             
            </div>
          </section>

          {/* Card: Setores */}
          {/* <section className="flex flex-col">
    <div class="-m-1.5 overflow-x-auto">
      <div class="p-1.5 min-w-full inline-block align-middle">
        <div class="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden dark:bg-neutral-900 dark:border-neutral-700">
          <div class="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200 dark:border-neutral-700">
            <div>
              <h2 class="text-xl font-semibold text-gray-800 dark:text-neutral-200">Setores / Pools</h2>
              <p class="text-sm text-gray-600 dark:text-neutral-400">Crie, edite e exclua setores.</p>
            </div>

            <div>
              <div class="inline-flex gap-x-2">

                <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">Criar setor</button>
              </div>
            </div>
          </div>
          <table class="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
            <thead class="bg-gray-50 dark:bg-neutral-800">
              <tr>
                <th scope="col" class="px-6 py-3 text-start">
                  <a class="group inline-flex items-center gap-x-2 text-xs font-semibold uppercase text-gray-800 hover:text-gray-500 focus:outline-hidden focus:text-gray-500 dark:text-neutral-200 dark:hover:text-neutral-500 dark:focus:text-neutral-500" href="#">Setor <svg class="shrink-0 size-3.5 text-gray-800 dark:text-neutral-200" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                  </a>
                </th>

                <th scope="col" class="px-6 py-3 text-start">
                  <a class="group inline-flex items-center gap-x-2 text-xs font-semibold uppercase text-gray-800 hover:text-gray-500 focus:outline-hidden focus:text-gray-500 dark:text-neutral-200 dark:hover:text-neutral-500 dark:focus:text-neutral-500" href="#">Descrição<svg class="shrink-0 size-3.5 text-gray-800 dark:text-neutral-200" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                  </a>
                </th>

                <th scope="col" class="px-6 py-3 text-end"></th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-200 dark:divide-neutral-700">
              <tr class="bg-white hover:bg-gray-50 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                <td class="size-px whitespace-nowrap">
                  <a class="block relative z-10" href="#">
                    <div class="px-6 py-2">
                      <span class="inline-flex items-center gap-1.5 py-1 px-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 dark:bg-neutral-900 dark:text-neutral-200">
                        Marketing team
                      </span>
                    </div>
                  </a>
                </td>
                <td class="h-px w-72 min-w-72">
                  <a class="block relative z-10" href="#">
                    <div class="px-6 py-2">
                      <p class="text-sm text-gray-500 dark:text-neutral-500">Our group promotes and sells products and services by leveraging online marketing tactics</p>
                    </div>
                  </a>
                </td>
                
                <td class="size-px whitespace-nowrap">
                  <div class="px-6 py-2">
                    <div class="hs-dropdown [--placement:bottom-right] relative inline-block">
                      <button id="hs-table-dropdown-1" type="button" class="hs-dropdown-toggle py-1.5 px-2 inline-flex justify-center items-center gap-2 rounded-lg text-gray-700 align-middle disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:text-neutral-400 dark:hover:text-white dark:focus:ring-offset-gray-800" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown">
                        <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                      </button>
                      <div class="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden divide-y divide-gray-200 min-w-40 z-20 bg-white shadow-2xl rounded-lg p-2 mt-2 dark:divide-neutral-700 dark:bg-neutral-800 dark:border dark:border-neutral-700" role="menu" aria-orientation="vertical" aria-labelledby="hs-table-dropdown-1">
                        <div class="py-2 first:pt-0 last:pb-0">
                          <span class="block py-2 px-3 text-xs font-medium uppercase text-gray-400 dark:text-neutral-600">
                            Actions
                          </span>
                          <a class="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700 dark:focus:text-neutral-300" href="#">
                            Rename team
                          </a>
                          <a class="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700 dark:focus:text-neutral-300" href="#">
                            Add to favorites
                          </a>
                          <a class="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700 dark:focus:text-neutral-300" href="#">
                            Archive team
                          </a>
                        </div>
                        <div class="py-2 first:pt-0 last:pb-0">
                          <a class="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-red-600 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 dark:text-red-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-300" href="#">
                            Delete
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>

            </tbody>
          </table>
          <div class="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-t border-gray-200 dark:border-neutral-700">
            <div>
              <p class="text-sm text-gray-600 dark:text-neutral-400"><span class="font-semibold text-gray-800 dark:text-neutral-200">6</span> resultados</p>
            </div>

          </div>
        </div>
      </div>
    </div>
          </section> */}
         <section className="flex flex-col">
    <div class="-m-1.5 overflow-x-auto">
      <div class="p-1.5 min-w-full inline-block align-middle">
        <div class="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden dark:bg-neutral-900 dark:border-neutral-700">
          <div class="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200 dark:border-neutral-700">
            <div>
              <h2 class="text-xl font-semibold text-gray-800 dark:text-neutral-200">Setores / Pools</h2>
              <p class="text-sm text-gray-600 dark:text-neutral-400">Crie, edite e exclua setores.</p>
            </div>

            <div>
              <div class="inline-flex gap-x-2">

                <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">Criar setor</button>
              </div>
            </div>
          </div>
          <table class="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
            <thead class="bg-gray-50 dark:bg-neutral-800">
              <tr>
                <th scope="col" class="px-6 py-3 text-start">
                  <a class="group inline-flex items-center gap-x-2 text-xs font-semibold uppercase text-gray-800 hover:text-gray-500 focus:outline-hidden focus:text-gray-500 dark:text-neutral-200 dark:hover:text-neutral-500 dark:focus:text-neutral-500" href="#">Setor <svg class="shrink-0 size-3.5 text-gray-800 dark:text-neutral-200" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                  </a>
                </th>

                <th scope="col" class="px-6 py-3 text-start">
                  <a class="group inline-flex items-center gap-x-2 text-xs font-semibold uppercase text-gray-800 hover:text-gray-500 focus:outline-hidden focus:text-gray-500 dark:text-neutral-200 dark:hover:text-neutral-500 dark:focus:text-neutral-500" href="#">Descrição<svg class="shrink-0 size-3.5 text-gray-800 dark:text-neutral-200" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                  </a>
                </th>

                <th scope="col" class="px-6 py-3 text-end"></th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-200 dark:divide-neutral-700">
  {setores.length === 0 ? (
    <tr>
      <td
        colSpan="4"
        className="px-6 py-4 text-center text-sm text-gray-500 dark:text-neutral-400"
      >
        Nenhum setor encontrado
      </td>
    </tr>
  ) : (
    setores.map((s) => (
      <tr
        key={s.id}
        className="bg-white hover:bg-gray-50 dark:bg-neutral-900 dark:hover:bg-neutral-800"
      >
        {/* Coluna: Setor */}
        <td className="size-px whitespace-nowrap">
          <a className="block relative z-10" href="#">
            <div className="px-6 py-2">
              <span className="inline-flex items-center gap-1.5 py-1 px-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 dark:bg-neutral-900 dark:text-neutral-200">
                {s.titulo}
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
      <input
        type="text"
        value={editSetor.titulo}
        onChange={(e) => setEditSetor({ ...editSetor, titulo: e.target.value })}
        className="w-full border rounded-lg p-2 mb-3"
      />
      <textarea
        value={editSetor.descricao}
        onChange={(e) => setEditSetor({ ...editSetor, descricao: e.target.value })}
        className="w-full border rounded-lg p-2 mb-3"
      />
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
          <div className="px-6 py-2">
            <div className="hs-dropdown [--placement:bottom-right] relative inline-block">
              <button
                type="button"
                className="hs-dropdown-toggle py-1.5 px-2 inline-flex justify-center items-center gap-2 rounded-lg text-gray-700 align-middle disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:text-neutral-400 dark:hover:text-white dark:focus:ring-offset-gray-800"
                aria-haspopup="menu"
                aria-expanded="false"
              >
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
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </button>

              <div
                className="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden divide-y divide-gray-200 min-w-40 z-20 bg-white shadow-2xl rounded-lg p-2 mt-2 dark:divide-neutral-700 dark:bg-neutral-800 dark:border dark:border-neutral-700"
                role="menu"
              >
                <div className="py-2 first:pt-0 last:pb-0">
                  <span className="block py-2 px-3 text-xs font-medium uppercase text-gray-400 dark:text-neutral-600">
                    Ações
                  </span>
                  <button
  onClick={() => setEditSetor(s)}
  className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 w-full text-left"
>
  Editar
</button>

                  <button
                    onClick={() => handleExcluirSetor(s.id)}
                    className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-red-600 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 dark:text-red-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700 dark:focus:text-neutral-300 w-full text-left"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    ))
  )}
</tbody>
   </table>
          <div class="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-t border-gray-200 dark:border-neutral-700">
            <div>
              <p class="text-sm text-gray-600 dark:text-neutral-400"><span class="font-semibold text-gray-800 dark:text-neutral-200">6</span> resultados</p>
            </div>

          </div>
        </div>
      </div>
    </div>
          </section>

          {/* Card: Prioridades */}
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Prioridades</h3>
              <span className="text-xs text-gray-500">{prioridades.length}</span>
            </div>
            <div className="mt-4 space-y-2">
              {prioridades.map(p => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="text-sm">{p.nome}</div>
                  <div className="text-xs text-gray-500">{p.horas_limite}h</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        
      </main>

      {/* Modal: Criar usuário */}
      {showUserModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
          <form onSubmit={handleCreateUser} className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Criar usuário</h3>
              <button type="button" onClick={() => setShowUserModal(false)} className="text-gray-400">✕</button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600">Nome *</label>
                <input value={form.nome} onChange={e => { setForm(s => ({...s, nome: e.target.value})); suggestUsernames(e.target.value); }} className="mt-1 block w-full border rounded-lg p-2 bg-gray-50" />
              </div>
              <div>
                <label className="text-xs text-gray-600">Email *</label>
                <input value={form.email} onChange={e => setForm(s => ({...s, email: e.target.value}))} className="mt-1 block w-full border rounded-lg p-2 bg-gray-50" />
              </div>

              <div>
                <label className="text-xs text-gray-600">Username (opcional)</label>
                <input value={form.username} onChange={e => setForm(s => ({...s, username: e.target.value}))} className="mt-1 block w-full border rounded-lg p-2 bg-gray-50" />
                <div className="mt-2 flex gap-2">
                  {usernameSuggestions.map(s => <button key={s} type="button" onClick={() => setForm(f=>({...f, username: s}))} className="text-xs px-2 py-1 rounded bg-gray-100">{s}</button>)}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Senha *</label>
                <input type="password" value={form.senha} onChange={e => setForm(s => ({...s, senha: e.target.value}))} className="mt-1 block w-full border rounded-lg p-2 bg-gray-50" />
              </div>

              <div>
                <label className="text-xs text-gray-600">Função</label>
                <select value={form.funcao} onChange={e => setForm(s => ({...s, funcao: e.target.value}))} className="mt-1 block w-full border rounded-lg p-2 bg-gray-50 text-sm">
                  <option value="usuario">Usuário</option>
                  <option value="tecnico">Técnico</option>
                  <option value="auxiliar_limpeza">Auxiliar limpeza</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2 rounded-lg border">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 text-white">Criar</button>
            </div>
          </form>
        </div>
      )}

    </div>
    </div>
  );
}
