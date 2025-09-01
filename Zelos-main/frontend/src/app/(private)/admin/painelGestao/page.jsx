// app/admin/page.jsx
"use client";
import React, { useEffect, useState, useRef } from "react";
import ToastMsg from "@/components/Toasts/Toasts";

const API_BASE_URL = 'http://localhost:8080';

// fetch com timeout reutilizado
const fetchWithTimeout = async (url, options, timeout = 7000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    // quando não ok, tentar extrair body e jogar erro
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

// util: Title Case
const toTitleCase = (s = '') =>s
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

// debounce util
const debounce = (fn, wait = 300) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
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
  const [form, setForm] = useState({ nome: "", username: "", email: "", senha: "", repeat_password: "", funcao: "", ftPerfil: null });
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const suggestionAbortRef = useRef(null);


  // keyboard nav + input ref for suggestions dropdown
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const usernameInputRef = useRef(null);
  useEffect(() => { setHighlightIndex(-1); }, [usernameSuggestions]);

  // username realtime states
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameExists, setUsernameExists] = useState(false);
  const lastUsernameRef = useRef('');

  const [showSetorModal, setShowSetorModal] = useState(false);
  const [novoSetor, setNovoSetor] = useState({ titulo: "", descricao: "" });
  const [isCreatingSetorRow, setIsCreatingSetorRow] = useState(false); //linha de criação
  const [prioridadeForm, setPrioridadeForm] = useState({ nome: '', horas_limite: 0 });
  const [prazoForm, setPrazoForm] = useState({ chamadoId: '', prioridade_id: '' }); // Adicionado
  const [calculatedPrazo, setCalculatedPrazo] = useState(null); // Adicionado
  const [openDropdownId, setOpenDropdownId] = useState(null); // Estado para controlar dropdowns abertos
  const [openSetorDropdownId, setOpenSetorDropdownId] = useState(null); // Estado para controlar dropdowns abertos

  // function suggestions for funcao
  const [funcaoSuggestions, setFuncaoSuggestions] = useState([]);
  const [funcaoValid, setFuncaoValid] = useState(true);

  // email validation and focus tracking
  const [emailValid, setEmailValid] = useState(true);
  const [emailFocused, setEmailFocused] = useState(false);

  // funcao focus tracking
  const [funcaoFocused, setFuncaoFocused] = useState(false);

  // passwords match
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const { UI: ToastsUI, showToast } = ToastMsg(); // pega UI e função showToast


  useEffect(() => {
    loadAll();}, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [u, p, s] = await Promise.all([
        fetchWithTimeout(`${API_BASE_URL}/usuarios`, { method: 'GET', credentials: 'include' }, 10000).catch(e => { addToast({ title: 'Erro listar usuários', msg: e.message, type: 'error' }); return []; }),
        fetchWithTimeout(`${API_BASE_URL}/prioridades`, { method: 'GET', credentials: 'include' }, 10000).catch(e => { addToast({ title: 'Erro listar prioridades', msg: e.message, type: 'error' }); return []; }),
        fetchWithTimeout(`${API_BASE_URL}/pool`, { method: 'GET', credentials: 'include' }, 10000).catch(e => { addToast({ title: 'Erro listar setores', msg: e.message, type: 'error' }); return []; }),
      ]);
      setUsuarios(u || []);
      setPrioridades(p || []);
      setSetores(s || []);
    } catch (err) {addToast({ title: 'Erro geral', msg: err.message, type: 'error' });}
    finally {setLoading(false);}
  };

  // ---------- Nome: manter livre enquanto digita; transformar em Title Case apenas no submit ----------
  const handleNomeChange = (e) => {
    const raw = e.target.value;
    // não formatar aqui — apenas armazenar o que o usuário digita
    setForm(prev => ({ ...prev, nome: raw }));
  };

  // ---------- Username: verificar existência e sugerir SOMENTE quando digita neste campo ----------

  // fallback simples local para gerar sugestões quando o backend não retornar
  const generateLocalSuggestions = (base, existingUsers = [], max = 6) => {
    const clean = String(base || 'user')
      .replace(/[^a-z0-9]/gi, '')
      .toLowerCase()
      .slice(0, 18) || 'user';

    const cand = [];
    // variações numéricas simples
    for (let i = 1; cand.length < max && i < 1000; i++) {
      const s = `${clean}${100 + i}`; // ex: juliaalves101
      if (!existingUsers.some(u => String(u.username || '').toLowerCase() === s)) cand.push(s);
    }
    // formas adicionais se necessário
    if (cand.length < max) cand.push(`${clean}_`, `${clean}.official`, `${clean}_01`);
    return Array.from(new Set(cand)).slice(0, max);
  };

  const checkUsername = async (usernameArg) => {
    const u = String(usernameArg || '').trim().toLowerCase();
    lastUsernameRef.current = u;

    console.log('[checkUsername] chamado com:', { username: u });

    if (!u || u.length < 2) {
      console.log('[checkUsername] username curto ou vazio — limpando estados');
      setUsernameExists(false);
      setUsernameSuggestions([]);
      setUsernameChecking(false);
      return;
    }
    setUsernameChecking(true);

    try {
      // 1) checagem local imediata (usa lista já carregada)
      const localExists = Array.isArray(usuarios) && usuarios.some(x => String(x.username || '').toLowerCase() === u);
      console.log('[checkUsername] localExists:', localExists);
      setUsernameExists(localExists);

      // 2) confirmar no servidor (fonte da verdade)
      let serverExists = localExists;
      try {
        console.log('[checkUsername] requisitando /usuarios/check?username=', u);
        const resp = await fetchWithTimeout(`${API_BASE_URL}/usuarios/check?username=${encodeURIComponent(u)}`,{ method: 'GET', credentials: 'include' }, 7000);

        console.log('[checkUsername] resposta /usuarios/check (body):', resp);
        serverExists = !!resp.exists;
        setUsernameExists(serverExists);
        console.log('[checkUsername] serverExists:', serverExists);
      }
      catch (err) {console.warn('[checkUsername] erro ao verificar no servidor:', err && err.message ? err.message : err);}

      // Se servidor confirmar que username EXISTE, buscamos sugestões 
      const shouldFetchSuggestions = true;
      if (serverExists && shouldFetchSuggestions) {
        // usa o usernameArg como base para sugestão (corrige caso form.nome esteja vazio)
        const baseForSuggestion = String(usernameArg || form.nome || form.username || '').trim();
        console.log('[checkUsername] vai buscar sugestões (server disse que existe). nome usado para sugestao:', baseForSuggestion);

        // cancel previous suggestion fetch
        if (suggestionAbortRef.current) suggestionAbortRef.current.abort();
        suggestionAbortRef.current = new AbortController();

        try {
          const suggestionsResp = await fetchWithTimeout(`${API_BASE_URL}/usuarios/sugerir-username`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ username: u })
          }, 7000);

          console.log('[checkUsername] resposta /usuarios/sugerir-username:', suggestionsResp);

          // normaliza o campo de sugestões que no backend vem como { sugestões: [...] }
          const raw = suggestionsResp.sugestoes || suggestionsResp.sugestões || suggestionsResp.suggestions || [];

          const arr = Array.isArray(raw) ? raw : [];

          // normaliza para lowercase e filtra:
          const normalized = arr
            .map(x => String(x || '').trim())
            .filter(x => x.length > 0)
            // remove exatos iguais ao digitado
            .filter(x => x.toLowerCase() !== u)
            // remove qualquer username que já exista localmente
            .filter(x => !(Array.isArray(usuarios) && usuarios.some(usr => String(usr.username || '').toLowerCase() === x.toLowerCase())));

          // remove duplicatas mantendo ordem
          const unique = Array.from(new Set(normalized));

          // se backend não sugeriu nada, gera fallback local simples
          const finalSuggestions = unique.length ? unique : generateLocalSuggestions(u, usuarios || []);

          console.log('[checkUsername] sugestões finalizadas:', finalSuggestions);
          setUsernameSuggestions(finalSuggestions);
        } catch (err) {
          if (err && err.name === 'AbortError') {
            console.log('[checkUsername] sugestão abortada (novo pedido) — mantendo sugestões atuais');
            // NÃO limpamos as sugestões aqui para evitar "piscar" quando uma requisição é abortada por outra.
            return;
          } else {
            console.warn('[checkUsername] erro ao buscar sugestões:', err && err.message ? err.message : err);
            // em caso de erro real, tentamos fallback local
            const fallback = generateLocalSuggestions(u, usuarios || []);
            setUsernameSuggestions(fallback);
          }
        }
      } else {
        // se servidor falou que NÃO existe, limpamos sugestões
        console.log('[checkUsername] não vai buscar sugestões (serverExists or shouldFetchSuggestions false)', { serverExists, shouldFetchSuggestions });
        setUsernameSuggestions([]);
      }

    } catch (err) {
      console.error('[checkUsername] erro inesperado:', err);
      setUsernameExists(false);
      setUsernameSuggestions([]);
    } finally {
      // só tira o loading se ainda for o username atual (evita race)
      if (lastUsernameRef.current === String(usernameArg || '').trim().toLowerCase()) {setUsernameChecking(false);}
    }
  };

  const debouncedCheckUsername = useRef(debounce(checkUsername, 350)).current;
  const handleUsernameChange = (e) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, username: val }));
    debouncedCheckUsername(val);
  };

  // pick a suggestion and restore focus
  const pickSuggestion = (s) => {
    // atualiza o campo imediatamente com a sugestão escolhida
    setForm(prev => ({ ...prev, username: s }));
    setUsernameSuggestions([]);
    setHighlightIndex(-1);
    // Consideramos a sugestão como disponível por padrão enquanto verificamos
    setUsernameExists(false);
    usernameInputRef.current?.focus();
    // Verifica imediatamente no servidor (não debounced) para confirmar disponibilidade
    // e atualizar estados (usernameChecking / usernameExists) corretamente.
    try {checkUsername(s);}
    catch (e) {console.warn('[pickSuggestion] erro ao verificar sugestão:', e);}
  };

  // keyboard navigation for suggestions (arrow keys + enter + escape)
  const handleUsernameKeyDown = (e) => {
    if (!usernameSuggestions || usernameSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(i => Math.min(i + 1, usernameSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (highlightIndex >= 0 && highlightIndex < usernameSuggestions.length) {
        e.preventDefault();
        pickSuggestion(usernameSuggestions[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setUsernameSuggestions([]);
      setHighlightIndex(-1);
    }
  };


  // ---------- Email validation (mostrar mensagem apenas enquanto estiver digitando) ----------
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, email: val }));
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(String(val).trim()));
  };

  // ---------- Função: sugestões baseadas em setores (pool) ----------
  const handleFuncaoChange = (e) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, funcao: val }));
    const input = String(val || '').toLowerCase();
    if (!input) {
      setFuncaoSuggestions([]);
      setFuncaoValid(true);
      return;
    }
    // mapeamento simples baseado em títulos de pool
    const mapTituloToFunc = {
      'externo': 'tecnico_externo',
      'manutencao': 'tecnico_manutencao',
      'apoio_tecnico': 'apoio_tecnico',
      'limpeza': 'auxiliar_limpeza'
    };
    const matches = setores
      .map(s => s.titulo)
      .filter(Boolean)
      .map(t => ({ titulo: t, func: mapTituloToFunc[t] || t }))
      .filter(x => x.titulo.toLowerCase().includes(input) || (x.func && x.func.toLowerCase().includes(input)))
      .slice(0, 6);
    setFuncaoSuggestions(matches);

    // valida se corresponde exatamente a alguma função permitida
    const allowedFuncs = ['admin', 'usuario', 'tecnico_externo', 'tecnico_manutencao', 'apoio_tecnico', 'auxiliar_limpeza'];
    const normalized = input;
    setFuncaoValid(allowedFuncs.includes(normalized) || matches.some(m => m.func.toLowerCase() === normalized || m.titulo.toLowerCase() === normalized));
  };

  const pickFuncSuggestion = (func) => {
    setForm(prev => ({ ...prev, funcao: func }));
    setFuncaoSuggestions([]);
    setFuncaoValid(true);
  };

  // ---------- Senhas: só validar igualdade quando usuário digita no campo de confirmar ----------
  const handleSenhaChange = (e) => {
    const v = e.target.value;
    setForm(prev => ({ ...prev, senha: v }));
  };
  const handleRepeatPwdChange = (e) => {
    const v = e.target.value;
    setForm(prev => ({ ...prev, repeat_password: v }));
    setPasswordsMatch(form.senha === v);
  };

  // --------- criar usuário (submit) ---------
  const handleCreateUser = async (e) => {
    e.preventDefault();

    // client validation
    if (!form.nome || !form.email || !form.senha) {
      addToast({ title: 'Campos obrigatórios', msg: 'Preencha nome, email e senha', type: 'error' });
      return;
    }
    if (!emailValid) {
      addToast({ title: 'Email inválido', msg: 'Informe um email válido', type: 'error' });
      return;
    }
    if (!passwordsMatch) {
      addToast({ title: 'Senhas não coincidem', msg: 'As duas senhas devem ser iguais', type: 'error' });
      return;
    }
    const allowedFuncs = ['admin', 'tecnico', 'auxiliar_limpeza'];

    // exige seleção explícita (não permite criar com função vazia ou 'usuario')
    if (!form.funcao || !allowedFuncs.includes(form.funcao)) {
      addToast({ title: 'Função inválida', msg: 'Escolha uma função: Admin, Técnico ou Auxiliar', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const finalFuncao = form.funcao;
      const payload = { ...form, nome: toTitleCase(form.nome), funcao: finalFuncao };

      const res = await fetchWithTimeout(`${API_BASE_URL}/usuarios`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload)
      }, 10000);

      showToast("success", 'Usuário criado');
      setShowUserModal(false);
      setForm({ nome: "", username: "", email: "", senha: "", repeat_password: "", funcao: "usuario", ftPerfil: null });
      setUsernameSuggestions([]);
      await loadAll();
    } catch (err) {
      // se backend retornar 409 com sugestões, o helper fetchWithTimeout já jogou erro; tentar extrair
      const message = (err && (err.body && err.body.message)) || err.message || 'Erro desconhecido';
      showToast("danger", 'Erro criar usuário');
      // se backend forneceu sugestões no body, atualiza
      if (err && err.body && Array.isArray(err.body.sugestoes)) setUsernameSuggestions(err.body.sugestoes);
    }
    finally {setLoading(false); }
  };

  // ---------- Outras funções existentes (setores, prioridades, etc) são mantidas e apenas adaptadas se necessário ----------

  const handleCriarSetorInline = async (e) => {
    // não é submit de form, mas previne se for usado como onSubmit
    if (e && e.preventDefault) e.preventDefault();

    const tituloTrim = String(novoSetor.titulo || "").trim();
    if (!tituloTrim) {
      addToast({ title: "Título obrigatório", msg: "Informe o título do setor", type: "error" });
      return;
    }

    try {
      // preparar payload (garantir chave correta)
      const payload = { titulo: tituloTrim, descricao: (novoSetor.descricao || null) };

      // envia
      const res = await fetchWithTimeout(`${API_BASE_URL}/pool`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(payload)
      }, 10000);

      // res deve conter { id, titulo, descricao } conforme seu back
      addToast({ title: "Sucesso", msg: "Setor criado", type: "success" });

      // atualizar array local de setores para não precisar recarregar
      // (coloca no topo; você pode usar loadAll() se preferir)
      setSetores(prev => [{ id: res.id, titulo: res.titulo || payload.titulo, descricao: res.descricao || payload.descricao }, ...prev]);

      // limpar e fechar linha de criação
      setNovoSetor({ titulo: "", descricao: "" });
      setIsCreatingSetorRow(false);
    } catch (err) {
      // extrai mensagem do fetchWithTimeout (err.body.message) quando possível
      const message = (err && err.body && err.body.message) || err.message || "Erro ao criar setor";
      addToast({ title: "Erro criar setor", msg: message, type: "error" });
    }
  };

  const handleExcluirSetor = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este setor?")) return;
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/pool/${id}`, { method: "DELETE", credentials: 'include', });
      showToast("success", "Setor excluído");
      await loadAll();
    }
    catch (err) { showToast("danger", "Erro excluir setor");}
  };

  const [editSetor, setEditSetor] = useState(null);

  const handleAtualizarSetor = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/pool/${editSetor.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", }, credentials: 'include', body: JSON.stringify({ titulo: editSetor.titulo, descricao: editSetor.descricao })
      });
      showToast("success", "Setor atualizado");
      setEditSetor(null);
      await loadAll();
    }
    catch (err) {showToast("danger", "Erro atualizar setor");}
  };

  const handlePrioridadeFormChange = (e) => {setPrioridadeForm({ ...prioridadeForm, [e.target.name]: e.target.value });};

  const handleCriarPrioridade = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/prioridades`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', }, credentials: 'include', body: JSON.stringify(prioridadeForm)
      });
      showToast("success", 'Nova prioridade adicionada');
      setPrioridadeForm({ nome: '', prazo_dias: 0 });
      await loadAll();
    }
    catch (err) {showToast("danger", 'Erro criar prioridade');}
  };

  // Edit Prioridade
  const [editPrioridade, setEditPrioridade] = useState(null);

  const handleAtualizarPrioridade = async (e) => {
    e.preventDefault();
    if (!editPrioridade || !editPrioridade.id) return;

    try {
      const payload = { nome: editPrioridade.nome, prazo_dias: Number(editPrioridade.prazo_dias) };
      const res = await fetchWithTimeout(`${API_BASE_URL}/prioridades/${editPrioridade.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', }, credentials: 'include', body: JSON.stringify(payload)
      });
      addToast({ title: 'Prioridade atualizada', msg: 'Prioridade salva com sucesso', type: 'success' });
      setEditPrioridade(null);
      await loadAll();
    }
    catch (err) {addToast({ title: 'Erro atualizar prioridade', msg: err.message, type: 'error' });}
  };

  const handleExcluirPrioridade = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta prioridade?")) return;
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/prioridades/${id}`, { method: "DELETE", credentials: 'include',});
      addToast({ title: "Sucesso", msg: "Prioridade excluída", type: "success" });
      await loadAll();
    }
    catch (err) { addToast({ title: "Erro excluir prioridade", msg: err.message, type: "error" });}
  };

  const handleCalcularPrazo = async (e) => {
    e.preventDefault();
    if (!prazoForm.prioridade_id) { addToast({ title: 'Erro', msg: 'Selecione uma prioridade', type: 'error' }); return; }
    try {
      const prioridadeSelecionada = prioridades.find(p => String(p.id) === String(prazoForm.prioridade_id));
      if (!prioridadeSelecionada) { addToast({ title: 'Erro', msg: 'Prioridade não encontrada', type: 'error' }); return; }
      const res = await fetchWithTimeout(`${API_BASE_URL}/chamados/calcular-prazo`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', }, credentials: 'include', body: JSON.stringify({ prioridade: prioridadeSelecionada.nome })
      });
      setCalculatedPrazo(res.data_limite || null);
      addToast({ title: 'Sucesso', msg: 'Data limite calculada', type: 'success' });
    }
    catch (err) {addToast({ title: 'Erro calcular prazo', msg: err.message, type: 'error' });}
  };

  const handleAtualizarPrazoChamado = async (e) => {
    e.preventDefault();
    if (!prazoForm.chamadoId) { addToast({ title: 'Erro', msg: 'Informe o ID do chamado', type: 'error' }); return; }
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/chamados/${prazoForm.chamadoId}/prazo`, {
         method: 'PATCH', headers: { credentials: 'include', }
      });
      if (!res.ok) throw new Error("Erro ao atualizar prazo");
      addToast({ title: 'Sucesso', msg: 'Prazo do chamado atualizado', type: 'success' });
    }
    catch (err) {addToast({ title: 'Erro atualizar prazo', msg: err.message, type: 'error' }); }
  };

  function formatarLabel(str) {
    const texto = str.replace(/_/g, ' ').toLowerCase();

    const correcoes = { "auxiliar_limpeza": "Auxiliar de Limpeza", "apoio_tecnico": "Apoio Técnico", "tecnico": "Técnico", "manutencao": "Manutenção", "media": "Média" };

    if (correcoes[texto]) { return correcoes[texto]; }

    // capitaliza cada palavra caso não tenha uma correção personalizada
    return texto
      .split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  }



  function formatDate(d) {
    if (!d) return "—";
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" });
  }

  function Avatar({ src, alt, size = 8 }) {
    return (<img src={src} alt={alt} className={`inline-block rounded-full object-cover`} style={{ width: `${size}px`, height: `${size}px`}}/> );
  }

  return (
    <>
      {ToastsUI}
      <div className="p-4 w-full dark:bg-gray-900">
        <div className="p-4 mt-14">
          <div className="flex max-w-full dark:bg-gray-900 ">
            {/* ASIDE FIXO */}
            <aside className="fixed top-23 left-[80px] w-64 bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-4 dark:bg-gray-800 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-3 dark:text-white">Índice</h2>
              <nav className="flex flex-col gap-3 text-[#7F56D8] dark:text-purple-500">
                <a href="#criar-usuario" className="hover:underline"> Criar Usuário</a>
                <a href="#setores" className="hover:underline"> Setores</a>
                <a href="#prioridade" className="hover:underline">Prioridade</a>
              </nav>
            </aside>
            <main className="flex-1 ml-[18rem] space-y-20">
              {/* Card: Usuários */}
              <section id="criar-usuario" className="scroll-mt-14 bg-white w-full rounded-2xl shadow-sm p-6 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold dark:text-white">Criar novos usuários</h3>
                  </div>
                <div className="mt-4 space-y-3">
                  <form className="w-full" onSubmit={handleCreateUser}> {/* Adicionar onSubmit */}
                    {/* Nome completo */}
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="relative z-0 mb-5 group w-full md:w-60">
                        <input type="text" name="nome" id="user_full_name" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-purple-500 focus:outline-none focus:ring-0 focus:border-[#7F56D8] peer" placeholder=" " value={form.nome} onChange={handleNomeChange} required />
                        <label htmlFor="user_full_name" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-[#7F56D8] peer-focus:dark:text-purple-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Nome completo</label>
                      </div>

                      {/* Username e sugestões */}
                      <div className="relative z-0 mb-5 group w-full md:w-80">
                        <input type="text" name="username" id="user_username" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-purple-500 focus:outline-none focus:ring-0 focus:border-[#7F56D8] peer" placeholder=" " ref={usernameInputRef} value={form.username} onChange={handleUsernameChange} onKeyDown={handleUsernameKeyDown} autoComplete="off" required />
                        <label htmlFor="user_username" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-[#7F56D8] peer-focus:dark:text-purple-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Username</label>

                        {/* Mensagem de estado username */}
                        <div className="mt-2">
                          {usernameChecking && <span className="text-xs text-gray-500">Verificando...</span>}
                          {!usernameChecking && usernameExists && <div className="text-xs text-red-500">Esse username já existe</div>}
                          {!usernameChecking && !usernameExists && form.username && <div className="text-xs text-green-600">Disponível</div>}
                        </div>

                        {usernameSuggestions.length > 0 && (
                          <div role="listbox" aria-label="Sugestões de username" className="mt-2 flex flex-wrap gap-2">
                            {usernameSuggestions.map((s, idx) => {
                              const highlighted = idx === highlightIndex;
                              return (
                                <button key={s} type="button" role="option" aria-selected={highlighted} onMouseDown={(ev) => { ev.preventDefault(); }} onClick={() => pickSuggestion(s)} onMouseEnter={() => setHighlightIndex(idx)} className={`text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded-full`}>
                                  {s}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Email */}
                      <div className="relative z-0 mb-5 group w-full md:w-60">
                        <input type="email" name="email" id="user_email" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-purple-500 focus:outline-none focus:ring-0 focus:border-[#7F56D8] peer" placeholder=" " value={form.email} onChange={handleEmailChange} onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)} required/>
                        <label htmlFor="user_email" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-[#7F56D8] peer-focus:dark:text-purple-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Email</label>
                        {emailFocused && !emailValid && <div className="text-xs text-red-500 mt-1">Email inválido</div>}
                      </div>
                      {/* Função */}
                      <div className="relative z-0 mb-5 group w-full md:w-60">
                        <input type="text" name="funcao" id="user_function" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-purple-500 focus:outline-none focus:ring-0 focus:border-[#7F56D8] peer" placeholder="" value={form.funcao} onChange={handleFuncaoChange} autoComplete="off" onFocus={() => setFuncaoFocused(true)} onBlur={() => setFuncaoFocused(false)} required/>
                        <label htmlFor="user_function" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-[#7F56D8] peer-focus:dark:text-purple-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Função</label>
                        {/* sugestões de função
                        {funcaoSuggestions.length > 0 && (
                          <div className="mt-2 flex flex-col gap-1">
                            {funcaoSuggestions.map(s => (
                              <button key={s.func} type="button" onClick={() => pickFuncSuggestion(s.func)} className="text-xs text-left bg-gray-50 hover:bg-gray-100 py-1 px-2 rounded">{s.func} — {s.titulo}</button>
                            ))}
                          </div>
                        )} */}
                        {funcaoFocused && !funcaoValid && <div className="text-xs text-red-500 mt-1">Escolha uma função existente</div>}
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Senha */}
                      <div className="relative z-0 mb-5 group w-full md:w-60">
                        <input type="password" name="senha" id="user_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-purple-500 focus:outline-none focus:ring-0 focus:border-[#7F56D8] peer" placeholder=" " value={form.senha} onChange={handleSenhaChange} required/>
                        <label htmlFor="user_password" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-[#7F56D8] peer-focus:dark:text-purple-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Senha</label>
                      </div>
                      <div className="relative z-0 mb-5 group w-full md:w-60">
                        <input type="password" name="repeat_password" id="floating_repeat_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-purple-500 focus:outline-none focus:ring-0 focus:border-purple-500 peer" placeholder=" " value={form.repeat_password} onChange={handleRepeatPwdChange} required />
                        <label htmlFor="floating_repeat_password" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-[#7F56D8] peer-focus:dark:text-purple-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Confirmar senha</label>
                        {form.repeat_password.length > 0 && !passwordsMatch && <div className="text-xs text-red-500 mt-1">As duas senhas devem ser iguais</div>}
                      </div>
                    </div>
                    <button type="submit" className="text-white bg-[#7F56D8] hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-purple-500 dark:hover:bg-purple-500 dark:focus:ring-purple-500"><svg className="shrink-0 size-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>Criar Usuário</button>
                  </form>
                </div>
              </section>

              {/* Card: Setores */}
              <section id="setores" className="flex flex-col">
                <div className="-m-1.5 overflow-x-auto">
                  <div className="p-1.5 min-w-full inline-block align-middle">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden dark:border-gray-700 dark:bg-gray-800">
                      <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 dark:text-white">Setores / Pools</h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-200">Crie, edite e exclua setores.</p>
                        </div>
                        <div>
                          <div className="inline-flex gap-x-2">
                            <button type="button" onClick={() => { setIsCreatingSetorRow(true); setNovoSetor({ titulo: "", descricao: "" }); }} className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none "><svg className="shrink-0 size-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>Criar setor</button>
                          </div>
                        </div>
                      </div>
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 ">
                        <thead className="bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-start">
                              <p className="group inline-flex items-center gap-x-2 text-xs font-semibold uppercase text-gray-800 hover:text-gray-500 focus:outline-hidden focus:text-gray-500 dark:hover:text-gray-300 dark:focus:text-gray-300 dark:text-white " >Setor <svg className="shrink-0 size-3.5 text-gray-800 dark:text-gray-200 dark:text-gray-200 " width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></svg></p>
                            </th>
                            <th scope="col" className="px-6 py-3 text-start">
                              <p className="group inline-flex items-center gap-x-2 text-xs font-semibold uppercase text-gray-800 hover:text-gray-500 focus:outline-hidden focus:text-gray-500 dark:hover:text-gray-300 dark:focus:text-gray-300 dark:text-white">Descrição<svg className="shrink-0 size-3.5 text-gray-800 dark:text-gray-200 dark:text-gray-200" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></svg></p>
                            </th>
                            <th scope="col" className="px-6 py-3 text-end"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {setores.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400 dark:text-gray-200" >
                                Nenhum setor encontrado
                              </td>
                            </tr>
                          ) : (
                            setores.map((s) => (
                              <tr key={s.id} className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800" >
                                {/* Coluna: Setor */}
                                <td className="size-px whitespace-nowrap">
                                  <a className="block relative z-10" href="#">
                                    <div className="px-6 py-2">
                                      <span className="inline-flex items-center gap-1.5 py-1 px-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                        {formatarLabel(s.titulo)}
                                      </span>
                                    </div>
                                  </a>
                                </td>
                                {/* Coluna: Descrição */}
                                <td className="align-top w-72 max-w-[18rem]">
                                  <div className="block relative z-10">
                                    <div className="px-6 py-2">
                                      <p className="text-sm text-gray-500 dark:text-gray-300 whitespace-normal break-words">
                                        {s.descricao || "—"}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                {editSetor && (
                                  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
                                    <form onSubmit={handleAtualizarSetor} className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                                      <h3 className="text-lg font-semibold mb-4">Editar setor</h3>
                                      <input type="text" value={editSetor.titulo} onChange={(e) => setEditSetor({ ...editSetor, titulo: e.target.value })} className="w-full border rounded-lg p-2 mb-3" />
                                      <textarea value={editSetor.descricao} onChange={(e) => setEditSetor({ ...editSetor, descricao: e.target.value })} className="w-full border rounded-lg p-2 mb-3" />
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
                                    <button type="button" onClick={() => setOpenDropdownId(openDropdownId === s.id ? null : s.id)} className="py-1.5 px-2 inline-flex justify-center items-center gap-2 rounded-lg text-gray-700 align-middle disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:text-gray-400 dark:hover:text-white dark:focus:ring-offset-gray-800" aria-haspopup="menu" aria-expanded={openDropdownId === s.id}>
                                      <svg className="shrink-0 size-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="1"/>
                                        <circle cx="19" cy="12" r="1"/>
                                        <circle cx="5" cy="12" r="1"/>
                                      </svg>
                                    </button>
                                    {openDropdownId === s.id && (
                                      <div className="absolute right-0 mt-2 min-w-40 z-20 bg-white shadow-2xl rounded-lg p-2 divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-800 dark:border dark:border-gray-700" role="menu">
                                        <div className="py-2 first:pt-0 last:pb-0">
                                          <span className="block py-2 px-3 text-xs font-medium uppercase text-gray-400 dark:text-gray-600">Ações</span>
                                          <button onClick={() => { setEditSetor(s); setOpenDropdownId(null); }} className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200 w-full text-left">Editar</button>
                                          <button onClick={() => { handleExcluirSetor(s.id); setOpenDropdownId(null); }} className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-red-600 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 dark:text-red-500 dark:hover:bg-gray-700 dark:focus:bg-gray-700 dark:focus:text-gray-300 w-full text-left">Excluir
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                          {/* Linha de criação inline */}
                          {isCreatingSetorRow && (
                            <tr className="bg-white dark:bg-gray-900">
                              {/* Coluna: Título (input) */}
                              <td className="align-top w-72 max-w-[18rem]">
                                <div className="block relative z-10">
                                  <div className="px-6 py-2">
                                    <input type="text" placeholder="Título do setor" value={novoSetor.titulo} onChange={(e) => setNovoSetor(prev => ({ ...prev, titulo: e.target.value }))} className="inline-flex items-center gap-1.5 py-1 px-2 rounded-lg text-sm border-gray-200 dark:border-gray-700 font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7F56D8] focus:border-[#7F56D8]" required/>
                                  </div>
                                </div>
                              </td>
                              {/* Coluna: Descrição (textarea) */}
                              <td className="px-6 py-2">
                                <textarea placeholder="Descrição do setor" value={novoSetor.descricao} onChange={(e) => setNovoSetor(prev => ({ ...prev, descricao: e.target.value }))} className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 whitespace-normal break-words focus:outline-none focus:ring-2 focus:ring-[#7F56D8] focus:border-[#7F56D8] transition" rows={2} />
                              </td>

                              {/* Coluna: Ações (Salvar / Cancelar) */}
                              <td className="px-6 py-2 text-end">
                                <div className="inline-flex gap-2">
                                  <button type="button" onClick={() => {
                                    // cancelar criação: limpa estado
                                    setIsCreatingSetorRow(false); setNovoSetor({ titulo: "", descricao: "" }); }} className="inline-flex items-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-600 focus:ring-4 focus:ring-[#F8FAFB] dark:focus:ring-gray-800 focus:text-[#7F56D8] dark:focus:text-white poppins-medium rounded-lg text-sm px-3 py-1.5">
                                    Cancelar
                                  </button>
                                  <button type="button" onClick={async (e) => {
                                    // chama o handler de salvar (evita usar <form> aqui)
                                    await handleCriarSetorInline(e);
                                  }} className="px-3 py-1 bg-blue-600 text-white rounded-md">
                                    Salvar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-200"><span className="font-semibold text-gray-800 dark:text-gray-200 dark:text-gray-200">{setores.length}</span> resultados</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              {/* Card: Prioridades */}
              <div id="prioridade" className="scroll-mt-14 w-full">
                <div className="flex flex-col">
                  <div className="-m-1.5 overflow-x-auto">
                    <div className="p-1.5 min-w-full inline-block align-middle">
                      <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                        <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200 dark:border-gray-700">
                          <div>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Prioridades</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Edite as prioridades.</p>
                          </div>
                          <div>
                            <div className="inline-flex gap-x-2">
                              <button type="button" onClick={() => setEditPrioridade({ id: null, nome: '', prazo_dias: 0 })} className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                                <svg className="shrink-0 size-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                Nova Prioridade
                              </button>
                            </div>
                          </div>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 divide-y divide-gray-200 dark:bg-gray-700 dark:divide-gray-700 ">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-start border-s border-gray-200 dark:border-gray-700">
                                <span className="text-xs font-semibold uppercase text-gray-800 dark:text-gray-200">Nome</span>
                              </th>
                              <th scope="col" className="px-6 py-3 text-start">
                                <span className="text-xs font-semibold uppercase text-gray-800 dark:text-gray-200">Prazo (horas)</span>
                              </th>
                              <th scope="col" className="px-6 py-3 text-end"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {prioridades.length === 0 ? (
                              <tr>
                                <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                  Nenhuma prioridade encontrada.
                                </td>
                              </tr>
                            ) : (
                              prioridades.map((p) => (
                                <tr key={p.id} className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800">
                                  <td className="h-px w-auto whitespace-nowrap">
                                    <div className="px-6 py-2">
                                      <span className="text-sm text-gray-800 dark:text-gray-200">{formatarLabel(p.nome)}</span>
                                    </div>
                                  </td>
                                  <td className="h-px w-auto whitespace-nowrap">
                                    <div className="px-6 py-2">
                                      <span className="text-sm text-gray-800 dark:text-gray-200">{p.horas_limite} horas</span>
                                    </div>
                                  </td>
                                  <td className="size-px whitespace-nowrap text-end">
                                    <div className="px-6 py-2">
                                      <div className="hs-dropdown [--placement:bottom-right] relative inline-block">
                                        <button type="button" onClick={() => setOpenDropdownId(openDropdownId === p.id ? null : p.id)} className="py-1.5 px-2 inline-flex justify-center items-center gap-2 rounded-lg text-gray-700 align-middle disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:text-gray-400 dark:hover:text-white dark:focus:ring-offset-gray-800" aria-haspopup="menu" aria-expanded={openDropdownId === p.id}>
                                          <svg className="shrink-0 size-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                                          </svg>
                                        </button>
                                        {openDropdownId === p.id && (
                                          <div className="absolute right-0 mt-2 min-w-40 z-20 bg-white shadow-2xl rounded-lg p-2 divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-800 dark:border dark:border-gray-700" role="menu">
                                            <div className="py-2 first:pt-0 last:pb-0">
                                              <span className="block py-2 px-3 text-xs font-medium uppercase text-gray-400 dark:text-gray-600">Ações</span>
                                              <button onClick={() => { setEditPrioridade(p); setOpenDropdownId(null); }} className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 w-full text-left">Editar</button>
                                              <button onClick={() => { handleExcluirPrioridade(p.id); setOpenDropdownId(null); }} className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-red-600 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 dark:text-red-500 dark:hover:bg-gray-700 dark:hover:text-gray-300 dark:focus:bg-gray-700 dark:focus:text-gray-300 w-full text-left">Excluir</button>
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
                              <input type="number" value={editPrioridade.horas_limite} onChange={(e) => setEditPrioridade({ ...editPrioridade, horas_limite: Number(e.target.value) })} className="form-input mb-3" placeholder="Prazo em horas" />
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setEditPrioridade(null)} className="px-4 py-2 border rounded-lg">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Atualizar</button>
                              </div>
                            </form>
                          </div>
                        )}

                        <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-t border-gray-200 dark:border-gray-700">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-semibold text-gray-800 dark:text-gray-200">{prioridades.length}</span> resultados
                            </p>
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
      </div>
    </>
  );
}