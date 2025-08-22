"use client"
import React, { useEffect, useState } from 'react';

// Esta página reúne UIs para: criar usuário, sugerir username, criar/excluir setores (pool),
// adicionar prioridades e recalcular prazos por prioridade — tudo em um único arquivo.
// Requisitos: TailwindCSS + Flowbite + Preline instalados e configurados no seu projeto Next.js.

export default function ChamadosAdminToolsPage() {
  const [loading, setLoading] = useState(false);

  // Usuários
  const [novoUsuario, setNovoUsuario] = useState({ nome: '', username: '', email: '', senha: '', funcao: 'user' });
  const [usernameSugestoes, setUsernameSugestoes] = useState([]);

  // Setores (pool)
  const [setorForm, setSetorForm] = useState({ titulo: '', descricao: '' });
  const [setores, setSetores] = useState([]);

  // Prioridades
  const [prioridadeForm, setPrioridadeForm] = useState({ nome: '', prazo_dias: 0 });
  const [prioridades, setPrioridades] = useState([]);

  // Recalcular prazo para chamado
  const [prazoForm, setPrazoForm] = useState({ chamadoId: '', prioridade_id: '' });
  const [calculatedPrazo, setCalculatedPrazo] = useState(null);

  // mensagens / feedback
  const [msg, setMsg] = useState(null);

  const API = { criarUsuario: '/usuarios',sugerirUsername: '/usuarios/sugerir-username', pool: '/pool', prioridades: '/prioridades', recalcularPrazo: (id) => `/chamados/${id}/prazo`, calcularPrazo: '/chamados/calcular-prazo'};

  useEffect(() => { fetchSetores(); fetchPrioridades();}, []);

  async function fetchSetores() {
    try {
      const res = await fetch(API.pool, { credentials: 'include' });
      if (!res.ok) throw new Error('Falha ao buscar setores');
      const data = await res.json();
      setSetores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Não foi possível carregar setores' });
    }
  }

  async function fetchPrioridades() {
    try {
      const res = await fetch(API.prioridades, { credentials: 'include' });
      if (!res.ok) throw new Error('Falha ao buscar prioridades');
      const data = await res.json();
      setPrioridades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Não foi possível carregar prioridades' });
    }
  }

  // --- USUÁRIO ---
  const handleNovoUsuarioChange = (e) => setNovoUsuario({ ...novoUsuario, [e.target.name]: e.target.value });

  async function handleSugerirUsername() {
    try {
      if (!novoUsuario.nome) { setMsg({ type: 'error', text: 'Digite o nome para gerar sugestões' }); return; }
      setLoading(true);
      const res = await fetch(API.sugerirUsername, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nome: novoUsuario.nome })
      });
      const data = await res.json();
      setUsernameSugestoes(data.sugestões || data.sugestoes || []);
      setMsg({ type: 'success', text: 'Sugestões geradas' });
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Erro ao gerar sugestões' });
    } finally { setLoading(false); }
  }

  async function handleCriarUsuario(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(API.criarUsuario, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(novoUsuario)
      });
      if (res.status === 409) {
        const json = await res.json();
        setMsg({ type: 'error', text: json.message || 'Username já existe' });
        if (json.sugestões) setUsernameSugestoes(json.sugestões);
        return;
      }
      if (!res.ok) throw new Error('Erro criação');
      const created = await res.json();
      setMsg({ type: 'success', text: `Usuário criado: ${created.username || created.id}` });
      // limpa
      setNovoUsuario({ nome: '', username: '', email: '', senha: '', funcao: 'user' });
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Erro ao criar usuário' });
    } finally { setLoading(false); }
  }

  // --- SETORES ---
  const handleSetorChange = (e) => setSetorForm({ ...setorForm, [e.target.name]: e.target.value });
  async function handleCriarSetor(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(API.pool, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(setorForm)
      });
      if (!res.ok) throw new Error('Erro criar setor');
      const novo = await res.json();
      setMsg({ type: 'success', text: `Setor criado: ${novo.titulo || novo.id}` });
      setSetorForm({ titulo: '', descricao: '' });
      await fetchSetores();
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Erro ao criar setor' });
    } finally { setLoading(false); }
  }

  async function handleExcluirSetor(id) {
    if (!confirm('Confirma exclusão do setor?')) return;
    try {
      setLoading(true);
      const res = await fetch(`${API.pool}/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Erro excluir');
      setMsg({ type: 'success', text: 'Setor excluído' });
      await fetchSetores();
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Erro ao excluir setor' });
    } finally { setLoading(false); }
  }

  // --- PRIORIDADES ---
  const handlePrioridadeChange = (e) => setPrioridadeForm({ ...prioridadeForm, [e.target.name]: e.target.value });
  async function handleCriarPrioridade(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(API.prioridades, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(prioridadeForm)
      });
      if (!res.ok) throw new Error('Erro criar prioridade');
      const novo = await res.json();
      setMsg({ type: 'success', text: `Prioridade criada: ${novo.nome || novo.id}` });
      setPrioridadeForm({ nome: '', prazo_dias: 0 });
      await fetchPrioridades();
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Erro ao criar prioridade' });
    } finally { setLoading(false); }
  }

  // --- PRAZO ---
  const handlePrazoFormChange = (e) => setPrazoForm({ ...prazoForm, [e.target.name]: e.target.value });

  async function handleCalcularPrazo() {
    try {
      if (!prazoForm.prioridade_id) { setMsg({ type: 'error', text: 'Selecione prioridade' }); return; }
      setLoading(true);
      // envia nome ou id dependendo do endpoint; aqui usamos calcularPrazo que recebe { prioridade }
      const prioridadeSelecionada = prioridades.find(p => String(p.id) === String(prazoForm.prioridade_id));
      const nome = prioridadeSelecionada?.nome;
      if (!nome) { setMsg({ type: 'error', text: 'Prioridade inválida' }); return; }
      const res = await fetch(API.calcularPrazo, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ prioridade: nome })
      });
      if (!res.ok) throw new Error('Erro calcular prazo');
      const json = await res.json();
      setCalculatedPrazo(json.data_limite || null);
      setMsg({ type: 'success', text: 'Prazo calculado' });
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Erro ao calcular prazo' });
    } finally { setLoading(false); }
  }

  async function handleAtualizarPrazoChamado() {
    try {
      if (!prazoForm.chamadoId) { setMsg({ type: 'error', text: 'Informe o ID do chamado' }); return; }
      setLoading(true);
      const res = await fetch(API.recalcularPrazo(prazoForm.chamadoId), { method: 'PATCH', credentials: 'include' });
      if (!res.ok) throw new Error('Erro ao atualizar prazo');
      setMsg({ type: 'success', text: 'Prazo do chamado atualizado' });
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Erro ao atualizar prazo do chamado' });
    } finally { setLoading(false); }
  }

  // --- helpers UI ---
  const focusPurple = 'focus:border-[#7F56D8] focus:ring-2 focus:ring-[#7F56D8]';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl poppins-semibold mb-4">Painel de ferramentas - Chamados (Admin)</h1>

      {msg && (
        <div className={`p-3 mb-6 rounded-md ${msg.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Criar usuário */}
        <div className="card p-4 border rounded-lg shadow-sm">
          <h2 className="text-lg poppins-medium mb-3">Criar novo usuário</h2>
          <form onSubmit={handleCriarUsuario}>
            <label className="block text-sm mb-1">Nome</label>
            <input name="nome" value={novoUsuario.nome} onChange={handleNovoUsuarioChange} className={`block w-full p-2 mb-3 border rounded ${focusPurple}`} />

            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <label className="block text-sm mb-1">Username</label>
                <input name="username" value={novoUsuario.username} onChange={handleNovoUsuarioChange} className={`block w-full p-2 border rounded ${focusPurple}`} />
              </div>
              <button type="button" onClick={handleSugerirUsername} className="px-4 py-2 bg-violet-600 text-white rounded">Gerar</button>
            </div>

            {usernameSugestoes.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-1">Sugestões:</p>
                <div className="flex gap-2 flex-wrap">
                  {usernameSugestoes.map(s => (
                    <button key={s} type="button" onClick={() => setNovoUsuario(prev => ({ ...prev, username: s }))} className="px-3 py-1 border rounded text-sm hover:bg-gray-100">{s}</button>
                  ))}
                </div>
              </div>
            )}

            <label className="block text-sm mb-1">Email</label>
            <input name="email" value={novoUsuario.email} onChange={handleNovoUsuarioChange} className={`block w-full p-2 mb-3 border rounded ${focusPurple}`} />

            <label className="block text-sm mb-1">Senha</label>
            <input name="senha" type="password" value={novoUsuario.senha} onChange={handleNovoUsuarioChange} className={`block w-full p-2 mb-3 border rounded ${focusPurple}`} />

            <label className="block text-sm mb-1">Função</label>
            <select name="funcao" value={novoUsuario.funcao} onChange={handleNovoUsuarioChange} className={`block w-full p-2 mb-3 border rounded ${focusPurple}`}>
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
              <option value="tecnico">Técnico</option>
            </select>

            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Criar usuário</button>
              <button type="button" onClick={() => { setNovoUsuario({ nome: '', username: '', email: '', senha: '', funcao: 'user' }); setUsernameSugestoes([]); }} className="px-4 py-2 border rounded">Limpar</button>
            </div>
          </form>
        </div>

        {/* Criar setor */}
        <div className="card p-4 border rounded-lg shadow-sm">
          <h2 className="text-lg poppins-medium mb-3">Gerenciar setores (pool)</h2>
          <form onSubmit={handleCriarSetor}>
            <label className="block text-sm mb-1">Título</label>
            <input name="titulo" value={setorForm.titulo} onChange={handleSetorChange} className={`block w-full p-2 mb-3 border rounded ${focusPurple}`} />
            <label className="block text-sm mb-1">Descrição</label>
            <textarea name="descricao" value={setorForm.descricao} onChange={handleSetorChange} className={`block w-full p-2 mb-3 border rounded ${focusPurple}`} />
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-emerald-600 text-white rounded" type="submit">Criar setor</button>
              <button type="button" onClick={() => setSetorForm({ titulo: '', descricao: '' })} className="px-4 py-2 border rounded">Limpar</button>
            </div>
          </form>

          <hr className="my-3" />
          <h3 className="text-sm mb-2">Setores existentes</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {setores.length === 0 ? <p className="text-sm text-gray-500">Nenhum setor</p> : setores.map(s => (
              <div key={s.id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="text-sm font-medium">{s.titulo}</div>
                  <div className="text-xs text-gray-500">{s.descricao}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigator.clipboard.writeText(s.titulo)} className="px-2 py-1 text-xs border rounded">Copiar</button>
                  <button onClick={() => handleExcluirSetor(s.id)} className="px-2 py-1 text-xs bg-red-600 text-white rounded">Excluir</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prioridades */}
        <div className="card p-4 border rounded-lg shadow-sm">
          <h2 className="text-lg poppins-medium mb-3">Prioridades</h2>
          <form onSubmit={handleCriarPrioridade} className="mb-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm mb-1">Nome</label>
                <input name="nome" value={prioridadeForm.nome} onChange={handlePrioridadeChange} className={`block w-full p-2 border rounded ${focusPurple}`} placeholder="ex: alta, media, baixa" />
              </div>
              <div>
                <label className="block text-sm mb-1">Prazo (dias)</label>
                <input name="prazo_dias" type="number" value={prioridadeForm.prazo_dias} onChange={handlePrioridadeChange} className={`block w-full p-2 border rounded ${focusPurple}`} />
              </div>
            </div>
            <div className="mt-3">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded">Adicionar prioridade</button>
            </div>
          </form>

          <h3 className="text-sm mb-2">Listagem</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {prioridades.length === 0 ? <p className="text-sm text-gray-500">Nenhuma prioridade</p> : prioridades.map(p => (
              <div key={p.id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="text-sm font-medium">{p.nome}</div>
                  <div className="text-xs text-gray-500">Prazo: {p.prazo_dias} dias</div>
                </div>
                <div className="text-xs text-gray-500">ID: {p.id}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Prazos e cálculos */}
        <div className="card p-4 border rounded-lg shadow-sm">
          <h2 className="text-lg poppins-medium mb-3">Calcular / Atualizar prazo</h2>

          <label className="block text-sm mb-1">Prioridade (para calcular)</label>
          <select name="prioridade_id" value={prazoForm.prioridade_id} onChange={handlePrazoFormChange} className={`block w-full p-2 mb-3 border rounded ${focusPurple}`}>
            <option value="">Selecione prioridade</option>
            {prioridades.map(p => <option key={p.id} value={p.id}>{p.nome} — {p.prazo_dias}d</option>)}
          </select>
          <div className="flex gap-2 mb-3">
            <button onClick={handleCalcularPrazo} className="px-4 py-2 bg-violet-600 text-white rounded">Calcular data limite</button>
            <div className="flex-1">
              {calculatedPrazo ? <div className="text-sm text-gray-700">Data limite calculada: <span className="font-medium">{new Date(calculatedPrazo).toLocaleString()}</span></div> : <div className="text-sm text-gray-500">Nenhum cálculo</div>}
            </div>
          </div>

          <hr className="my-3" />
          <label className="block text-sm mb-1">Atualizar prazo de um chamado (só recalcula com base na prioridade atual)</label>
          <input name="chamadoId" value={prazoForm.chamadoId} onChange={handlePrazoFormChange} placeholder="ID do chamado" className={`block w-full p-2 mb-3 border rounded ${focusPurple}`} />
          <div className="flex gap-2">
            <button onClick={handleAtualizarPrazoChamado} className="px-4 py-2 bg-emerald-600 text-white rounded">Atualizar prazo</button>
            <button onClick={() => setPrazoForm({ chamadoId: '', prioridade_id: '' })} className="px-4 py-2 border rounded">Limpar</button>
          </div>
        </div>
      </div>
      <footer className="mt-8 text-sm text-gray-500">
        <div>Observações: os endpoints esperados pelo backend (ex.: <code className="bg-gray-100 px-1 rounded">POST /usuarios</code>, <code className="bg-gray-100 px-1 rounded">POST /usuarios/sugerir-username</code>, <code className="bg-gray-100 px-1 rounded">/pool</code>, <code className="bg-gray-100 px-1 rounded">/prioridades</code>, <code className="bg-gray-100 px-1 rounded">PATCH /chamados/:id/prazo</code>) devem existir conforme combinamos.</div>
      </footer>
    </div>
  );
}
