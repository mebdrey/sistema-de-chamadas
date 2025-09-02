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
const toTitleCase = (s = '') =>
  s
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
  const [mostrarModalConfirmacaoSetor, setMostrarModalConfirmacaoSetor] = useState(false);
  const [mostrarModalConfirmacaoPrioridade, setMostrarModalConfirmacaoPrioridade] = useState(false);

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

  // states para validação
  const [errors, setErrors] = useState({
    nome: null,
    username: null,
    email: null,
    funcao: null,
    senha: null,
    repeat_password: null
  });
  const [touched, setTouched] = useState({
    nome: false,
    username: false,
    email: false,
    funcao: false,
    senha: false,
    repeat_password: false
  });

  // para criação de setor inline
  const [novoSetorErrors, setNovoSetorErrors] = useState({
    titulo: false,
    descricao: false,
    showMessage: false
  });

  // para criação de prioridade inline
  const [novaPrioridadeErrors, setNovaPrioridadeErrors] = useState({
    nome: false,
    horas_limite: false,
    showMessage: false
  });

  const handleNovoSetorChange = (field, value) => {
    setNovoSetor(prev => ({ ...prev, [field]: value }));
    setNovoSetorErrors(prev => ({ ...prev, [field]: false, showMessage: false }));
  };

  const handleNovaPrioridadeChange = (field, value) => {
    setNovaPrioridade(prev => ({ ...prev, [field]: value }));
    setNovaPrioridadeErrors(prev => ({ ...prev, [field]: false, showMessage: false }));
  };

  useEffect(() => {
    loadAll();
  }, []);

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
    } catch (err) {
      addToast({ title: 'Erro geral', msg: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // validação / erro (adicionar junto dos outros useState)

  const [submitAttempted, setSubmitAttempted] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const allowedFuncs = ['admin', 'tecnico', 'auxiliar_limpeza']; // ajuste conforme seu app

  const validateField = (name, value) => {
    switch (name) {
      case 'nome':
        if (!String(value || '').trim()) return 'Nome é obrigatório';
        return null;
      case 'username':
        if (!String(value || '').trim()) return 'Username é obrigatório';
        if ((value || '').length < 5) return 'Username muito curto';
        if (usernameExists) return 'Username já existe';
        return null;
      case 'email':
        if (!String(value || '').trim()) return 'Email é obrigatório';
        if (!emailRegex.test(String(value || '').trim())) return 'Email inválido';
        return null;
      case 'funcao':
        if (!String(value || '').trim()) return 'Função é obrigatória';
        return null;
      case 'senha':
        if (!String(value || '').trim()) return 'Senha é obrigatória';
        if ((value || '').length < 6) return 'Senha deve ter ao menos 6 caracteres';
        return null;
      case 'repeat_password':
        if (!String(value || '').trim()) return 'Confirme a senha';
        if (value !== form.senha) return 'Senhas não coincidem';
        return null;
      default:
        return null;
    }
  };

  const validateAll = () => ({
    nome: validateField('nome', form.nome),
    username: validateField('username', form.username),
    email: validateField('email', form.email),
    funcao: validateField('funcao', form.funcao),
    senha: validateField('senha', form.senha),
    repeat_password: validateField('repeat_password', form.repeat_password)
  });


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
        const resp = await fetchWithTimeout(`${API_BASE_URL}/usuarios/check?username=${encodeURIComponent(u)}`, {
          method: 'GET',
          credentials: 'include'
        }, 7000);

        console.log('[checkUsername] resposta /usuarios/check (body):', resp);
        serverExists = !!resp.exists;
        setUsernameExists(serverExists);
        console.log('[checkUsername] serverExists:', serverExists);
      } catch (err) {
        console.warn('[checkUsername] erro ao verificar no servidor:', err && err.message ? err.message : err);
      }

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
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username: u })
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
      if (lastUsernameRef.current === String(usernameArg || '').trim().toLowerCase()) {
        setUsernameChecking(false);
      }
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
    try {
      checkUsername(s);
    } catch (e) {
      console.warn('[pickSuggestion] erro ao verificar sugestão:', e);
    }
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

    setFuncaoValid(true);
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
    setSubmitAttempted(true);

    const nextErrors = validateAll();
    setErrors(nextErrors);

    const firstErrorField = Object.keys(nextErrors).find(k => nextErrors[k]);
    if (firstErrorField) {
      addToast({ title: 'Erro de validação', msg: 'Corrija os campos em destaque', type: 'error' });

      const fieldIdMap = {
        nome: 'user_full_name',
        username: 'user_username',
        email: 'user_email',
        funcao: 'user_function',
        senha: 'user_password',
        repeat_password: 'floating_repeat_password'
      };
      const el = document.getElementById(fieldIdMap[firstErrorField]);
      if (el) el.focus();
      return; // bloqueia envio
    }

    // se chegou aqui, enviar normalmente
    setLoading(true);
    try {
      const finalFuncao = form.funcao;
      const payload = { ...form, nome: toTitleCase(form.nome), funcao: finalFuncao };

      const res = await fetchWithTimeout(`${API_BASE_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      }, 10000);

      showToast("success", 'Usuário criado com successo');
      setShowUserModal(false);
      setForm({ nome: "", username: "", email: "", senha: "", repeat_password: "", funcao: "", ftPerfil: null });
      setUsernameSuggestions([]);
      // reset validation
      setErrors({ nome: null, username: null, email: null, funcao: null, senha: null, repeat_password: null });
      setSubmitAttempted(false);
      await loadAll();
    }
    // catch (err) {
    //   const message = (err && (err.body && err.body.message)) || err.message || 'Erro desconhecido';
    //   showToast("danger", 'Erro criar usuário');
    //   if (err && err.body && Array.isArray(err.body.sugestoes)) setUsernameSuggestions(err.body.sugestoes);
    // } 
    catch (err) {
      // mensagem de fallback
      const message = (err && err.body && err.body.message) || err.message || 'Erro desconhecido';
      showToast("danger", 'Erro criar usuário');

      // 1) se o backend devolveu fieldErrors (objeto com chaves por campo)
      if (err && err.body && err.body.fieldErrors && typeof err.body.fieldErrors === 'object') {
        // merge com erros existentes
        setErrors(prev => ({ ...prev, ...err.body.fieldErrors }));
        // garante que os erros sejam mostrados (flag para exibir)
        setSubmitAttempted(true);
        // opcional: foca no primeiro campo retornado
        const firstField = Object.keys(err.body.fieldErrors)[0];
        const fieldIdMap = {
          nome: 'user_full_name',
          username: 'user_username',
          email: 'user_email',
          funcao: 'user_function',
          senha: 'user_password',
          repeat_password: 'floating_repeat_password'
        };
        if (firstField && fieldIdMap[firstField]) {
          const el = document.getElementById(fieldIdMap[firstField]);
          if (el) el.focus();
        }
        return;
      }

      // 2) se o backend retornou 'field' simples (ex: { message, field: 'email' })
      if (err && err.body && err.body.field) {
        const field = err.body.field;
        setErrors(prev => ({ ...prev, [field]: err.body.message || message }));
        setSubmitAttempted(true);
        const fieldIdMap = {
          nome: 'user_full_name',
          username: 'user_username',
          email: 'user_email',
          funcao: 'user_function',
          senha: 'user_password',
          repeat_password: 'floating_repeat_password'
        };
        if (fieldIdMap[field]) {
          const el = document.getElementById(fieldIdMap[field]);
          if (el) el.focus();
        }
        return;
      }

      // 3) fallback: se o backend só retornou sugestões (por username) ou outro formato
      if (err && err.body && Array.isArray(err.body.sugestoes)) {
        setUsernameSuggestions(err.body.sugestoes);
      }

      // você já mostrou um toast; pode opcionalmente setar um erro genérico
      // setErrors(prev => ({ ...prev, geral: message }));
    }

    finally {
      setLoading(false);
    }
  };


  // ---------- Outras funções existentes (setores, prioridades, etc) são mantidas e apenas adaptadas se necessário ----------
  const handleCriarSetorInline = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const tituloTrim = String(novoSetor.titulo || "").trim();
    const descricaoTrim = String(novoSetor.descricao || "").trim();

    const errors = {
      titulo: !tituloTrim,
      descricao: !descricaoTrim,
      showMessage: false
    };

    if (errors.titulo || errors.descricao) {
      errors.showMessage = true;
      setNovoSetorErrors(errors);
      return;
    }

    // reset errors antes de enviar
    setNovoSetorErrors({ titulo: false, descricao: false, showMessage: false });

    try {
      const payload = { titulo: tituloTrim, descricao: descricaoTrim };
      const res = await fetchWithTimeout(`${API_BASE_URL}/pool`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      }, 10000);

      addToast({ title: "Sucesso", msg: "Setor criado", type: "success" });

      setSetores(prev => [{ id: res.id || Date.now(), titulo: res.titulo || payload.titulo, descricao: res.descricao || payload.descricao }, ...prev]);

      setNovoSetor({ titulo: "", descricao: "" });
      setIsCreatingSetorRow(false);
    } catch (err) {
      console.error('[handleCriarSetorInline] erro:', err);
      showToast("danger", "Erro ao criar setor");
    }
  };

  // States
  const [setorParaExcluir, setSetorParaExcluir] = useState(null);

  // Chamar a exclusão real (sem confirm)
  const excluirSetor = async (id) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/pool/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      showToast("success", "Setor excluído com successo");
      await loadAll();
    } catch (err) {
      showToast("danger", "Erro excluir setor");
    }
  };

  // Quando clicar em "Excluir" no dropdown -> abre modal
  const confirmarExclusaoSetor = (id) => {
    setSetorParaExcluir(id);
    setMostrarModalConfirmacaoSetor(true);
  };

  const [editSetor, setEditSetor] = useState(null);

  const handleAtualizarSetor = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/pool/${editSetor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", },
        credentials: 'include',
        body: JSON.stringify({ titulo: editSetor.titulo, descricao: editSetor.descricao })
      });
      showToast("success", "Setor atualizado com successo");
      setEditSetor(null);
      await loadAll();
    } catch (err) {
      showToast("danger", "Erro atualizar setor");
    }
  };

  const handlePrioridadeFormChange = (e) => {
    setPrioridadeForm({ ...prioridadeForm, [e.target.name]: e.target.value });
  };

  const handleCriarPrioridadeInline = async () => {
    const nomeTrim = String(novaPrioridade.nome || '').trim();
    const horas = novaPrioridade.horas_limite;

    const errors = {
      nome: !nomeTrim,
      horas_limite: (horas === '' || horas === null || isNaN(Number(horas)) || Number(horas) <= 0),
      showMessage: false
    };

    if (errors.nome || errors.horas_limite) {
      errors.showMessage = true;
      setNovaPrioridadeErrors(errors);
      return;
    }

    // reset errors antes de enviar
    setNovaPrioridadeErrors({ nome: false, horas_limite: false, showMessage: false });

    try {
      const payload = { nome: nomeTrim, horas_limite: Number(horas) };
      const res = await fetchWithTimeout(`${API_BASE_URL}/prioridades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      }, 10000);

      showToast("success", "Prioridade adicionada com sucesso");
      setIsCreatingPrioridadeRow(false);
      setNovaPrioridade({ nome: "", horas_limite: 0 });

      // recarrega a lista para garantir consistência
      await loadAll();
    } catch (err) {
      console.error('[handleCriarPrioridadeInline] erro:', err);
      showToast("danger", "Erro ao criar prioridade");
    }
  };

  // Edit Prioridade
  const [editPrioridade, setEditPrioridade] = useState(null);
  const [isCreatingPrioridadeRow, setIsCreatingPrioridadeRow] = useState(false);
  const [novaPrioridade, setNovaPrioridade] = useState({ nome: "", horas_limite: 0 });

  const handleAtualizarPrioridade = async (e) => {
    e.preventDefault();
    if (!editPrioridade || !editPrioridade.id) return;

    try {
      // enviar horas_limite diretamente (em horas), não prazo_dias
      const payload = {
        nome: editPrioridade.nome,
        horas_limite: Number(editPrioridade.horas_limite) // garante number
      };

      const res = await fetchWithTimeout(`${API_BASE_URL}/prioridades/${editPrioridade.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      showToast("success", 'Prioridade atualizada com sucesso');
      setEditPrioridade(null);
      await loadAll();
    } catch (err) {
      showToast("danger", 'Erro atualizar prioridade');
    }
  };


  const [prioridadeParaExcluir, setPrioridadeParaExcluir] = useState(null);
  const handleExcluirPrioridade = async (id) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/prioridades/${id}`, {
        method: "DELETE",
        credentials: 'include',
      });
      showToast("success", "Prioridade excluída com successo");
      await loadAll();
    } catch (err) {
      showToast("danger", "Erro excluir prioridade");
    }
  };

  // Quando clicar em "Excluir" no dropdown -> abre modal
  const confirmarExclusaoPrioridade = (id) => {
    setPrioridadeParaExcluir(id);
    setMostrarModalConfirmacaoPrioridade(true);
  };

  function formatarLabel(str) {
    const texto = str.replace(/_/g, ' ').toLowerCase();

    const correcoes = { "auxiliar_limpeza": "Auxiliar de Limpeza", "apoio_tecnico": "Apoio Técnico", "tecnico": "Técnico", "manutencao": "Manutenção", "media": "Média" };

    if (correcoes[texto]) { return correcoes[texto]; }

    // capitaliza cada palavra caso não tenha uma correção personalizada
    return texto
      .split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  }
  // estados
  const [openPrioridadeDropdownId, setOpenPrioridadeDropdownId] = useState(null);

  // fecha dropdown ao clicar fora ou apertar ESC
  useEffect(() => {
    const onDocClick = () => setOpenPrioridadeDropdownId(null);
    const onKey = (ev) => { if (ev.key === 'Escape') setOpenPrioridadeDropdownId(null); };

    if (openPrioridadeDropdownId !== null) {
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onKey);
    }
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [openPrioridadeDropdownId]);


  return (
    <>
      {ToastsUI}
      <div className="p-4 w-full dark:bg-gray-900">
        <div className="p-4 mt-14">

          <div className="flex max-w-full dark:bg-gray-900 ">
            {/* ASIDE FIXO */}
            <aside className="hidden md:block fixed top-23 left-[80px] w-64 bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-4 dark:bg-gray-800 dark:border-gray-700">
              <h2 className="text-lg poppins-semibold mb-3 dark:text-white">Índice</h2>
              <nav className="flex flex-col gap-3 text-violet-500 dark:text-purple-500">
                <a href="#criar-usuario" className="hover:underline">Criar Usuário</a>
                <a href="#setores" className="hover:underline">Setores</a>
                <a href="#prioridade" className="hover:underline">Prioridade</a>
              </nav>
            </aside>

            <main className="flex-1 md:ml-[18rem] space-y-20">
              {/* Card: Usuários */}
              <section id="criar-usuario" className="scroll-mt-14 bg-white w-full rounded-2xl shadow-sm p-6 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg poppins-semibold dark:text-white">Criar novos usuários</h3>
                </div>
                <div className="mt-4 space-y-3">


                  <form className="w-full" onSubmit={handleCreateUser}>
                    {/* Linha 1: Nome + Username */}
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Nome completo */}
                      <div className="relative z-0 mb-5 group w-full md:w-60">
                        <input type="text" name="nome" id="user_full_name" className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 appearance-none ${submitAttempted && errors.nome ? 'border-red-500' : 'border-gray-300'} dark:text-gray-100 dark:border-gray-600 dark:focus:border-purple-500 focus:outline-none focus:ring-0 ${submitAttempted && errors.nome ? 'focus:border-red-500' : 'focus:border-violet-500'} peer`} placeholder=" " value={form.nome} onChange={(e) => { handleNomeChange(e); if (errors.nome) setErrors(prev => ({ ...prev, nome: null })); }} required />
                        <label htmlFor="user_full_name" className={`peer-focus:poppins-medium absolute text-sm ${submitAttempted && errors.nome ? 'text-red-500' : 'text-gray-500'} ${submitAttempted && errors.nome ? '' : 'dark:text-gray-400'} duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto ${submitAttempted && errors.nome ? 'peer-focus:text-red-500' : 'peer-focus:text-violet-500 peer-focus:dark:text-purple-500'} peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}>  <span className="leading-none">Nome completo</span>
                          <span className="ml-1 self-start leading-none text-red-500">*</span>
                        </label>
                        {submitAttempted && errors.nome && <div className="text-xs text-red-500 mt-1">{errors.nome}</div>}
                      </div>

                      {/* Username */}
                      <div className="relative z-0 mb-5 group w-full md:w-80">
                        <input type="text" name="username" id="user_username" ref={usernameInputRef} className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 appearance-none ${submitAttempted && errors.username ? 'border-red-500' : 'border-gray-300'} dark:text-white dark:border-gray-600 dark:focus:border-purple-500 focus:outline-none focus:ring-0 ${submitAttempted && errors.username ? 'focus:border-red-500' : 'focus:border-violet-500'} peer`} placeholder=" " value={form.username} onChange={(e) => { handleUsernameChange(e); if (errors.username) setErrors(prev => ({ ...prev, username: null })); }} onKeyDown={handleUsernameKeyDown} autoComplete="off" required />
                        <label htmlFor="user_username" className={`peer-focus:poppins-medium absolute text-sm ${submitAttempted && errors.username ? 'text-red-500' : 'text-gray-500'} ${submitAttempted && errors.username ? '' : 'dark:text-gray-400'} duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto ${submitAttempted && errors.username ? 'peer-focus:text-red-500' : 'peer-focus:text-violet-500 peer-focus:dark:text-violet-500'} peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}>  <span className="leading-none">Username</span>
                          <span className="ml-1 self-start leading-none text-red-500">*</span>
                        </label>
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
                                <button key={s} type="button" role="option" aria-selected={highlighted} onMouseDown={(ev) => ev.preventDefault()} onClick={() => pickSuggestion(s)} onMouseEnter={() => setHighlightIndex(idx)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded-full">{s}</button>
                              );
                            })}
                          </div>
                        )}

                        {submitAttempted && errors.username && <div className="text-xs text-red-500 mt-1">{errors.username}</div>}
                      </div>
                    </div>

                    {/* Linha 2: Email + Função */}
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Email */}
                      <div className="relative z-0 mb-5 group w-full md:w-60">
                        <input type="email" name="email" id="user_email" className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 appearance-none ${submitAttempted && errors.email ? 'border-red-500' : 'border-gray-300'} dark:text-gray-100 dark:border-gray-600 dark:focus:border-purple-500 focus:outline-none focus:ring-0 ${submitAttempted && errors.email ? 'focus:border-red-500' : 'focus:border-violet-500'} peer`} placeholder=" " value={form.email} onChange={(e) => {
                          handleEmailChange(e);
                          if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                        }} onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)} required />
                        <label
                          htmlFor="user_email"
                          className={`peer-focus:poppins-medium absolute text-sm ${submitAttempted && errors.email ? 'text-red-500' : 'text-gray-500'} ${submitAttempted && errors.email ? '' : 'dark:text-gray-400'} duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto ${submitAttempted && errors.email ? 'peer-focus:text-red-500' : 'peer-focus:text-violet-500 peer-focus:dark:text-violet-500'} peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}
                        ><span className="leading-none">Email</span>
                          <span className="ml-1 self-start leading-none text-red-500">*</span>
                        </label>
                        {submitAttempted && errors.email && <div className="text-xs text-red-500 mt-1">{errors.email}</div>}
                        {emailFocused && !emailValid && <div className="text-xs text-red-500 mt-1">Email inválido</div>}
                      </div>

                      {/* Função */}
                      <div className="relative z-0 mb-5 group w-full md:w-60">
                        <input
                          type="text"
                          name="funcao"
                          id="user_function"
                          className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 appearance-none
          ${submitAttempted && errors.funcao ? 'border-red-500' : 'border-gray-300'}
          dark:text-white dark:border-gray-600 dark:focus:border-purple-500 focus:outline-none focus:ring-0 ${submitAttempted && errors.funcao ? 'focus:border-red-500' : 'focus:border-[#7F56D8]'} peer`}
                          placeholder=" "
                          value={form.funcao}
                          onChange={(e) => {
                            handleFuncaoChange(e);
                            if (errors.funcao) setErrors(prev => ({ ...prev, funcao: null }));
                          }}
                          onFocus={() => setFuncaoFocused(true)}
                          onBlur={() => setFuncaoFocused(false)}
                          required
                        />
                        <label
                          htmlFor="user_function"
                          className={`peer-focus:poppins-medium absolute text-sm ${submitAttempted && errors.funcao ? 'text-red-500' : 'text-gray-500'} ${submitAttempted && errors.funcao ? '' : 'dark:text-gray-400'} duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto ${submitAttempted && errors.funcao ? 'peer-focus:text-red-500' : 'peer-focus:text-[#7F56D8] peer-focus:dark:text-purple-500'} peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}
                        ><span className="leading-none">Função</span>
                          <span className="ml-1 self-start leading-none text-red-500">*</span>
                        </label>
                        {submitAttempted && errors.funcao && <div className="text-xs text-red-500 mt-1">{errors.funcao}</div>}
                      </div>
                    </div>

                    {/* Linha 3: Senha + Confirmar senha */}
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Senha */}
                      <div className="relative z-0 mb-5 group w-full md:w-60">
                        <input
                          type="password"
                          name="senha"
                          id="user_password"
                          className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 appearance-none ${submitAttempted && errors.senha ? 'border-red-500' : 'border-gray-300'} dark:text-white dark:border-gray-600 dark:focus:border-purple-500 focus:outline-none focus:ring-0 ${submitAttempted && errors.senha ? 'focus:border-red-500' : 'focus:border-[#7F56D8]'} peer`} placeholder=" " value={form.senha} onChange={(e) => {
                            handleSenhaChange(e);
                            if (errors.senha) setErrors(prev => ({ ...prev, senha: null }));
                          }} required />
                        <label
                          htmlFor="user_password"
                          className={`peer-focus:poppins-medium absolute text-sm ${submitAttempted && errors.senha ? 'text-red-500' : 'text-gray-500'} ${submitAttempted && errors.senha ? '' : 'dark:text-gray-400'} duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto ${submitAttempted && errors.senha ? 'peer-focus:text-red-500' : 'peer-focus:text-[#7F56D8] peer-focus:dark:text-purple-500'} peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}><span className="leading-none">Senha</span>
                          <span className="ml-1 self-start leading-none text-red-500">*</span>
                        </label>
                        {submitAttempted && errors.senha && <div className="text-xs text-red-500 mt-1">{errors.senha}</div>}
                      </div>

                      {/* Confirmar senha */}
                      <div className="relative z-0 mb-5 group w-full md:w-60">
                        <input
                          type="password"
                          name="repeat_password"
                          id="floating_repeat_password"
                          className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 appearance-none
          ${submitAttempted && errors.repeat_password ? 'border-red-500' : 'border-gray-300'}
          dark:text-white dark:border-gray-600 dark:focus:border-purple-500 focus:outline-none focus:ring-0 ${submitAttempted && errors.repeat_password ? 'focus:border-red-500' : 'focus:border-purple-500'} peer`} placeholder=" " value={form.repeat_password}
                          onChange={(e) => {
                            handleRepeatPwdChange(e);
                            if (errors.repeat_password) setErrors(prev => ({ ...prev, repeat_password: null }));
                          }} required />
                        <label htmlFor="floating_repeat_password" className={`peer-focus:poppins-medium absolute text-sm ${submitAttempted && errors.repeat_password ? 'text-red-500' : 'text-gray-500'} ${submitAttempted && errors.repeat_password ? '' : 'dark:text-gray-400'} duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto ${submitAttempted && errors.repeat_password ? 'peer-focus:text-red-500' : 'peer-focus:text-[#7F56D8] peer-focus:dark:text-purple-500'} peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}
                        ><span className="leading-none">Confirmar senha</span>
                          <span className="ml-1 self-start leading-none text-red-500">*</span>
                        </label>
                        {submitAttempted && errors.repeat_password && <div className="text-xs text-red-500 mt-1">{errors.repeat_password}</div>}
                        {form.repeat_password.length > 0 && !passwordsMatch && <div className="text-xs text-red-500 mt-1">As duas senhas devem ser iguais</div>}
                      </div>
                    </div>

                    {/* Botão Criar */}
                    <button type="submit" className="flex flex-row gap-2 items-center text-white bg-violet-500 hover:bg-violet-600 focus:ring-4 focus:outline-none focus:ring-blue-300 poppins-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-purple-500 dark:hover:bg-purple-500 dark:focus:ring-purple-500"><svg className="shrink-0 size-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                      Criar Usuário
                    </button>
                  </form>

                </div>
              </section>


              {/* Card: Setores */}
              <section id="setores" className="flex flex-col">
                <div className="-m-1.5 overflow-x-auto">
                  <div className="p-1.5 min-w-full inline-block align-middle">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-visible dark:border-gray-700 dark:bg-gray-800">
                      <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                        <div>
                          <h2 className="text-xl poppins-semibold text-gray-800 dark:text-gray-200 dark:text-white">Setores / Pools</h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-200">Crie, edite e exclua setores.</p>
                        </div>

                        <div>
                          <div className="inline-flex gap-x-2">
                            <button type="button" onClick={() => { setIsCreatingSetorRow(true); setNovoSetor({ titulo: "", descricao: "" }); }} className="py-2 px-3 inline-flex items-center gap-x-2 text-sm poppins-medium rounded-lg border border-transparent bg-violet-500 hover:bg-violet-600 text-white focus:outline-hidden focus:bg-violet-600 disabled:opacity-50 disabled:pointer-events-none "><svg className="shrink-0 size-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>Criar setor</button>
                          </div>
                        </div>
                      </div>
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 ">
                        <thead className="bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-start">
                              <p className="group inline-flex items-center gap-x-2 text-xs poppins-semibold uppercase text-gray-800 hover:text-gray-500 focus:outline-hidden focus:text-gray-500 dark:hover:text-gray-300 dark:focus:text-gray-300 dark:text-white ">Setor<svg className="shrink-0 size-3.5 text-gray-800 dark:text-gray-200 dark:text-gray-200 " width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></svg>
                              </p>
                            </th>

                            <th scope="col" className="px-6 py-3 text-start">
                              <p className="group inline-flex items-center gap-x-2 text-xs poppins-semibold uppercase text-gray-800 hover:text-gray-500 focus:outline-hidden focus:text-gray-500 dark:hover:text-gray-300 dark:focus:text-gray-300 dark:text-white">Descrição<svg className="shrink-0 size-3.5 text-gray-800 dark:text-gray-200 dark:text-gray-200" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></svg>
                              </p>
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
                              <tr key={s.id} className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800">
                                {/* Coluna: Setor */}
                                <td className="align-top w-72 max-w-[18rem]">
                                  <div className="px-6 py-2">
                                    {editSetor?.id === s.id ? (
                                      <input type="text" value={editSetor.titulo} onChange={(e) => setEditSetor({ ...editSetor, titulo: e.target.value })} className="w-full px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7F56D8]" required />
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 py-1 px-2 rounded-lg text-sm poppins-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">{formatarLabel(s.titulo)}</span>
                                    )}
                                  </div>
                                </td>

                                {/* Coluna: Descrição */}
                                <td className="px-6 py-2 align-top">
                                  {editSetor?.id === s.id ? (
                                    <textarea value={editSetor.descricao} onChange={(e) => setEditSetor({ ...editSetor, descricao: e.target.value })} className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7F56D8]" rows={2} />
                                  ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-300 whitespace-normal break-words">{s.descricao || "—"}</p>
                                  )}
                                </td>

                                {/* Coluna: Ações */}
                                <td className="px-6 py-2 text-end">
                                  {editSetor?.id === s.id ? (
                                    <div className="inline-flex gap-2">
                                      <button type="button" onClick={() => setEditSetor(null)} className="inline-flex items-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-sm  px-3 py-1.5">Cancelar</button>
                                      <button type="button" onClick={handleAtualizarSetor} className="px-3 py-1 bg-violet-500 hover:bg-violet-600 text-white rounded-md">Salvar</button>
                                    </div>
                                  ) : (
                                    <div className="relative">
                                      <button type="button" onClick={() => setOpenSetorDropdownId(openSetorDropdownId === s.id ? null : s.id)} className="py-1.5 px-2 inline-flex  justify-center items-center gap-2 rounded-lg text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-hidden focus:ring-2 focus:ring-violet-500 transition-all text-sm">
                                        <svg className="shrink-0 size-4" width="24" height="24" viewBox="0 0 24 24"
                                          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <circle cx="12" cy="12" r="1" />
                                          <circle cx="19" cy="12" r="1" />
                                          <circle cx="5" cy="12" r="1" />
                                        </svg>
                                      </button>

                                      {openSetorDropdownId === s.id && (
                                        <div className="absolute right-0 mt-2 min-w-40 z-20 bg-white shadow-2xl rounded-lg p-2 divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-800 dark:border dark:border-gray-700" role="menu">
                                          <div className="py-2 first:pt-0 last:pb-0">
                                            <span className="block py-2 px-3 text-xs text-left poppins-medium uppercase text-gray-400 dark:text-gray-600">Ações</span>
                                            <button onClick={() => { setEditSetor(s); setOpenSetorDropdownId(null); }} className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200 w-full text-left">Editar</button>
                                            <button onClick={() => { confirmarExclusaoSetor(s.id); setOpenSetorDropdownId(null); }} className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-red-600 hover:bg-gray-100 dark:text-red-500 dark:hover:bg-gray-700 dark:focus:bg-gray-700 dark:focus:text-gray-300 w-full text-left">Excluir</button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
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
                                    <input type="text" placeholder="Título do setor" value={novoSetor.titulo} onChange={(e) => handleNovoSetorChange('titulo', e.target.value)}
                                      className={`inline-flex items-center gap-1.5 py-1 px-2 rounded-lg text-sm ${novoSetorErrors.titulo ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#7F56D8] focus:border-[#7F56D8]'} poppins-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 focus:outline-none `}
                                      required />
                                    {novoSetorErrors.titulo && <div className="text-xs text-red-500 mt-1">Preencha este campo</div>}
                                  </div>
                                </div>
                              </td>

                              {/* Coluna: Descrição (textarea) */}
                              <td className="px-6 py-2">
                                <textarea placeholder="Descrição do setor"
                                  value={novoSetor.descricao} onChange={(e) => handleNovoSetorChange('descricao', e.target.value)} className={`inline-flex items-center gap-1.5 py-1 px-2 rounded-lg text-sm ${novoSetorErrors.descricao ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#7F56D8] focus:border-[#7F56D8]'} poppins-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 focus:outline-none `} rows={2} />
                                {novoSetorErrors.descricao && <div className="text-xs text-red-500 mt-1">Preencha este campo</div>}
                              </td>

                              {/* Coluna: Ações (Salvar / Cancelar) */}
                              <td className="px-6 py-2 text-end">
                                <div className="inline-flex gap-2">
                                  <button type="button" onClick={() => {
                                    // cancelar criação: limpa estado
                                    setIsCreatingSetorRow(false);
                                    setNovoSetor({ titulo: "", descricao: "" });
                                  }} className="inline-flex items-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-600 focus:ring-4 focus:ring-[#F8FAFB] dark:focus:ring-gray-800 focus:text-[#7F56D8] dark:focus:text-white poppins-medium rounded-lg text-sm px-3 py-1.5">
                                    Cancelar
                                  </button>

                                  <button type="button" onClick={async (e) => {
                                    // chama o handler de salvar (evita usar <form> aqui)
                                    await handleCriarSetorInline(e);
                                  }} className="px-3 py-1 bg-violet-500 hover:bg-violet-600 text-white rounded-md">
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
                          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-200"><span className="poppins-semibold text-gray-800 dark:text-gray-200 dark:text-gray-200">{setores.length}</span> resultados</p>
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
                      <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-visible dark:bg-gray-800 dark:border-gray-700">
                        <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200 dark:border-gray-700">
                          <div>
                            <h2 className="text-xl poppins-semibold text-gray-800 dark:text-gray-200">Prioridades</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Edite as prioridades.</p>
                          </div>

                          <div>
                            <div className="inline-flex gap-x-2">
                              <button type="button" onClick={() => { setIsCreatingPrioridadeRow(true); setNovaPrioridade({ nome: "", horas_limite: 0 }); }} className="py-2 px-3 inline-flex items-center gap-x-2 text-sm poppins-medium rounded-lg border border-transparent bg-violet-500 hover:bg-violet-600 text-white"><svg className="shrink-0 size-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>Criar prioridade</button>
                            </div>
                          </div>
                        </div>

                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 divide-y divide-gray-200 dark:bg-gray-700 dark:divide-gray-700 ">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-start border-s border-gray-200 dark:border-gray-700">
                                <span className="text-xs poppins-semibold uppercase text-gray-800 dark:text-gray-200">Nome</span>
                              </th>

                              <th scope="col" className="px-6 py-3 text-start">
                                <span className="text-xs poppins-semibold uppercase text-gray-800 dark:text-gray-200">Prazo (horas)</span>
                              </th>

                              <th scope="col" className="px-6 py-3 text-end"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {prioridades.length === 0 && !isCreatingPrioridadeRow ? (
                              <tr>
                                <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Nenhuma prioridade encontrada.</td>
                              </tr>
                            ) : (
                              prioridades.map((p) => (
                                <tr key={p.id} className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800">

                                  {/* Coluna: Nome */}
                                  <td className="px-6 py-2">
                                    {editPrioridade?.id === p.id ? (
                                      <>
                                        <input type="text" value={editPrioridade.nome} onChange={(e) => handleNovaPrioridadeChange('nome', e.target.value)} className={`dark:bg-gray-900 w-full p-2 border rounded-lg text-sm ${novaPrioridadeErrors.nome ? 'border-red-500 ring-1 ring-red-500' : 'focus:outline-none focus:ring-2 focus:ring-violet-500'}`} required />
                                        {novaPrioridadeErrors.horas_limite && (
                                          <div className="text-xs text-red-500 mt-1">Preencha este campo</div>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-sm text-gray-800 dark:text-gray-200">{formatarLabel(p.nome)}</span>
                                    )}
                                  </td>

                                  {/* Coluna: Prazo */}
                                  <td className="px-6 py-2">
                                    {editPrioridade?.id === p.id ? (
                                      <>
                                        <input type="number" value={editPrioridade.horas_limite} onChange={(e) => handleNovaPrioridadeChange('horas_limite', e.target.value)} className={`dark:bg-gray-900 w-full p-2 border rounded-lg text-sm ${novaPrioridadeErrors.horas_limite ? 'border-red-500 ring-1 ring-red-500' : 'focus:outline-none focus:ring-2 focus:ring-violet-500'}`} required />
                                        {novaPrioridadeErrors.horas_limite && (
                                          <div className="text-xs text-red-500 mt-1">Preencha este campo</div>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-sm text-gray-800 dark:text-gray-200">{p.horas_limite} horas</span>
                                    )}
                                  </td>

                                  {/* Coluna: Ações */}
                                  <td className="px-6 py-2 text-end">
                                    {editPrioridade?.id === p.id ? (
                                      <div className="inline-flex gap-2">
                                        <button type="button" onClick={() => setEditPrioridade(null)} className="px-3 py-1 border rounded-lg text-gray-500">Cancelar</button>
                                        <button type="button" onClick={handleAtualizarPrioridade} className="px-3 py-1 bg-violet-500 hover:bg-violet-600 text-white rounded-md">Salvar</button>
                                      </div>
                                    ) : (
                                      <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}   // evita fechar ao clicar dentro
                                      >
                                        <button type="button" onClick={() => setOpenPrioridadeDropdownId(openPrioridadeDropdownId === p.id ? null : p.id)} className="py-1.5 px-2 inline-flex justify-center items-center gap-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" aria-haspopup="menu" aria-expanded={openPrioridadeDropdownId === p.id} ><svg className="shrink-0 size-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg></button>

                                        {openPrioridadeDropdownId === p.id && (
                                          <div className="absolute right-0 top-8 z-20 min-w-40 bg-white dark:bg-gray-800 dark:border dark:border-gray-700 shadow-2xl rounded-lg p-2 divide-y divide-gray-200 dark:divide-gray-700" role="menu" onClick={(e) => e.stopPropagation()}  // não propagar para não fechar
                                          >
                                            <div className="py-2 first:pt-0 last:pb-0">
                                              <span className="block py-2 px-3 text-xs poppins-medium uppercase text-gray-400 dark:text-gray-600">Ações</span>
                                              <button onClick={() => { setEditPrioridade({ ...p, horas_limite: Number(p.horas_limite) }); setOpenPrioridadeDropdownId(null); }} className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 dark:text-gray-200 w-full text-left">Editar</button>
                                              <button onClick={() => { confirmarExclusaoPrioridade(p.id); setOpenPrioridadeDropdownId(null); }} className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-red-600 hover:bg-gray-100 dark:text-red-500 dark:hover:bg-gray-700 w-full text-left">Excluir</button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}

                            {/* Linha de criação inline */}
                            {isCreatingPrioridadeRow && (
                              <tr className="bg-white dark:bg-gray-900">
                                <td className="px-6 py-2">
                                  <input type="text" placeholder="Nome da prioridade" value={novaPrioridade.nome} onChange={(e) => setNovaPrioridade(prev => ({ ...prev, nome: e.target.value }))} className={`inline-flex items-center gap-1.5 py-1 px-2 rounded-lg text-sm ${novaPrioridadeErrors.nome ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#7F56D8] focus:border-[#7F56D8]'} poppins-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 focus:outline-none `} required />
                                  {novaPrioridadeErrors.nome && <div className="text-xs text-red-500 mt-1">Preencha este campo</div>}
                                </td>
                                <td className="px-6 py-2">
                                  <input type="number" placeholder="Prazo em horas" value={novaPrioridade.horas_limite} onChange={(e) => setNovaPrioridade(prev => ({ ...prev, horas_limite: Number(e.target.value) }))} className={`inline-flex items-center gap-1.5 py-1 px-2 rounded-lg text-sm ${novaPrioridadeErrors.horas_limite ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#7F56D8] focus:border-[#7F56D8]'} poppins-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 focus:outline-none `} required />
                                  {novaPrioridadeErrors.horas_limite && <div className="text-xs text-red-500 mt-1">Preencha este campo</div>}

                                </td>
                                <td className="px-6 py-2 text-end">
                                  <div className="inline-flex gap-2">
                                    <button type="button" onClick={() => { setIsCreatingPrioridadeRow(false); setNovaPrioridade({ nome: "", horas_limite: 0 }); }} className="px-3 py-1 border rounded-lg text-sm text-gray-500">Cancelar</button>
                                    <button type="button" onClick={async () => { await handleCriarPrioridadeInline(); }} className="px-3 py-1 bg-violet-500 hover:bg-violet-600 text-white rounded-md">Salvar</button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>

                        </table>
                        <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-t border-gray-200 dark:border-gray-700">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="poppins-semibold text-gray-800 dark:text-gray-200">{prioridades.length}</span> resultados
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
            {/* tem tz q deseja excluir o setor? */}
            {mostrarModalConfirmacaoSetor && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <div className="text-center">
                    <svg className="mx-auto mb-4 text-gray-400 w-12 h-12" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    <h3 className="mb-5 text-lg poppins-regular text-gray-500">Tem certeza que deseja excluir este setor?</h3>
                    <button onClick={() => { if (setorParaExcluir) excluirSetor(setorParaExcluir); setMostrarModalConfirmacaoSetor(false); setSetorParaExcluir(null); }} className="text-white bg-[#7F56D8] focus:ring-4 focus:outline-none focus:ring-[#7F56D8] poppins-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">Sim, excluir</button>
                    <button onClick={() => { setMostrarModalConfirmacaoSetor(false); setSetorParaExcluir(null); }} className="py-2.5 px-5 ms-3 text-sm poppins-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-[#7F56D8] focus:z-10 focus:ring-4 focus:ring-gray-100">Cancelar</button>
                  </div>
                </div>
              </div>
            )}

            {/* tem tz q deseja excluir a prioridade? */}
            {mostrarModalConfirmacaoPrioridade && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <div className="text-center">
                    <svg className="mx-auto mb-4 text-gray-400 w-12 h-12" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    <h3 className="mb-5 text-lg poppins-regular text-gray-500">Tem certeza que deseja excluir esta prioridade?</h3>
                    <button onClick={() => { if (prioridadeParaExcluir) handleExcluirPrioridade(prioridadeParaExcluir); setMostrarModalConfirmacaoPrioridade(false); setPrioridadeParaExcluir(null); }} className="text-white bg-[#7F56D8] focus:ring-4 focus:outline-none focus:ring-[#7F56D8] poppins-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">Sim, excluir</button>
                    <button onClick={() => { setMostrarModalConfirmacaoPrioridade(false); setPrioridadeParaExcluir(null); }} className="py-2.5 px-5 ms-3 text-sm poppins-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-[#7F56D8] focus:z-10 focus:ring-4 focus:ring-gray-100">Cancelar</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}