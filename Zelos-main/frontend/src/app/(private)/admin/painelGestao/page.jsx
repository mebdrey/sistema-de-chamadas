// app/admin/page.jsx
"use client";
import React, { useEffect, useState, useRef } from "react";
import ToastMsg from "@/components/Toasts/Toasts";



const API_BASE_URL = 'http://localhost:8080';

// fetch com timeout reutilizado
// const fetchWithTimeout = async (url, options, timeout = 7000) => {
//   const controller = new AbortController();
//   const id = setTimeout(() => controller.abort(), timeout);
//   try {
//     const response = await fetch(url, { ...options, signal: controller.signal });
//     clearTimeout(id);
//     // quando não ok, tentar extrair body e jogar erro
//     if (!response.ok) {
//       const errorBody = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
//       const error = new Error(errorBody.message || 'Erro na requisição');
//       error.body = errorBody;
//       throw error;
//     }
//     return response.json();
//   } catch (error) {
//     clearTimeout(id);
//     throw error;
//   }
// };
// fetchWithTimeout atualizado: aceita options.signal externo
const fetchWithTimeout = async (url, options = {}, timeout = 7000) => {
  // se caller forneceu signal, use-o; senão crie um controller para timeout
  const externalSignal = options.signal;
  let controller;
  let timerId = null;

  if (externalSignal) {
    // não criamos controller; mas ainda sim usamos timeout para abortar via setTimeout
    controller = null;
    timerId = setTimeout(() => {
      // se caller forneceu signal, não podemos abortá-lo diretamente - então apenas reject
      // melhor abordagem: caller deve passar controller se quiser abort por timeout também.
    }, timeout);
  } else {
    controller = new AbortController();
    options.signal = controller.signal;
    timerId = setTimeout(() => controller.abort(), timeout);
  }

  try {
    const response = await fetch(url, options);
    if (timerId) clearTimeout(timerId);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      const error = new Error(errorBody.message || 'Erro na requisição');
      error.body = errorBody;
      throw error;
    }
    return await response.json();
  } catch (error) {
    if (timerId) clearTimeout(timerId);
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
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [showEye, setShowEye] = useState(false); // controla se o olho aparece
  const [password, setPassword] = useState("");

  const { UI: ToastsUI, showToast } = ToastMsg(); // pega UI e função showToast

  const [funcoes, setFuncoes] = useState([]);
  const [filteredFuncoes, setFilteredFuncoes] = useState([]);
  // mostra texto no input (legível)
  const [displayFuncao, setDisplayFuncao] = useState('');

  // --- States novos para o input de Função do formulário de usuário ---
  const [funcaoInput, setFuncaoInput] = useState(''); // controla o que o usuário digita no input do form

  // quando o usuário digita no input do form
  const onFuncaoInput = (e) => {
    const val = e.target.value || '';
    setFuncaoInput(val);

    // guarda o valor "canônico" no form para enviar (se desejar gravar imediatamente)
    setForm(prev => ({ ...prev, funcao: val }));

    // filtra as funções (case-insensitive) e limita a 50 itens
    const base = Array.isArray(funcoes) ? funcoes : [];
    const filtered = val.trim() === '' ? base.slice(0, 50) : base.filter(ff => ff.toLowerCase().includes(val.toLowerCase())).slice(0, 50);

    setFilteredFuncoes(filtered);
    setHighlightIndex(filtered.length ? 0 : -1);

    // limpa erro de validação se havia
    if (errors.funcao) setErrors(prev => ({ ...prev, funcao: null }));
  };

  // selecionar função a partir da lista de sugestões (usuário)
  const selectFuncaoUser = (valorCanonico) => {
    // gravar valor canônico para envio
    setForm(prev => ({ ...prev, funcao: valorCanonico }));
    // mostrar label amigável no input
    setFuncaoInput(formatarLabel(valorCanonico));
    // esconder sugestões e resetar highlight
    setFilteredFuncoes([]);
    setFuncaoFocused(false);
    setHighlightIndex(-1);
    if (errors.funcao) setErrors(prev => ({ ...prev, funcao: null }));
  };

  // navegação por teclado para o input do form (setas, enter, escape)
  const onFuncaoKeyDown = (e) => {
    if (!filteredFuncoes || filteredFuncoes.length === 0) {
      // se não houver sugestões, se quiser deixar Enter mandar submit, não previna
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(i => Math.min(i + 1, filteredFuncoes.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (highlightIndex >= 0 && highlightIndex < filteredFuncoes.length) {
        e.preventDefault();
        selectFuncaoUser(filteredFuncoes[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setFilteredFuncoes([]);
      setHighlightIndex(-1);
      setFuncaoFocused(false);
    }
  };

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
    // se estivermos editando uma prioridade (editPrioridade não nulo), atualiza ela
    if (editPrioridade && editPrioridade.id) {
      setEditPrioridade(prev => ({ ...prev, [field]: value }));
    } else {
      setNovaPrioridade(prev => ({ ...prev, [field]: value }));
    }

    // limpa o erro correspondente (mantém o mesmo objeto de erros)
    setNovaPrioridadeErrors(prev => ({ ...prev, [field]: false, showMessage: false }));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [u, p, s, f] = await Promise.all([
        fetchWithTimeout(`${API_BASE_URL}/usuarios`, { method: 'GET', credentials: 'include' }, 10000).catch(() => []),
        fetchWithTimeout(`${API_BASE_URL}/prioridades`, { method: 'GET', credentials: 'include' }, 10000).catch(() => []),
        fetchWithTimeout(`${API_BASE_URL}/pool`, { method: 'GET', credentials: 'include' }, 10000).catch(() => []),
        fetchWithTimeout(`${API_BASE_URL}/funcoes`, { method: 'GET', credentials: 'include' }, 10000).catch(() => []),
      ]);
      setUsuarios(u || []);
      setPrioridades(p || []);
      setSetores(s || []);
      setFuncoes(f || []);
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
        if (!funcoes || !funcoes.includes(value)) return 'Função inválida';
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

        // if (suggestionAbortRef.current) suggestionAbortRef.current.abort();
        // suggestionAbortRef.current = new AbortController();

        // try {
        //   const suggestionsResp = await fetchWithTimeout(`${API_BASE_URL}/usuarios/sugerir-username`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     credentials: 'include',
        //     body: JSON.stringify({ username: u })
        //   }, 7000);
        // cancelar requisições anteriores
        if (suggestionAbortRef.current) suggestionAbortRef.current.abort();
        suggestionAbortRef.current = new AbortController();
        try {
          const suggestionsResp = await fetchWithTimeout(`${API_BASE_URL}/usuarios/sugerir-username`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username: u }),
            signal: suggestionAbortRef.current.signal
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

  // quando o usuário digita no input
  // const onFuncaoInput = (e) => {
  //   const val = e.target.value || '';

  //   // só atualiza o texto visível
  //   setDisplayFuncao(val);

  //   setForm(prev => ({ ...prev, funcao: val }));

  //   // filtra funções (case-insensitive)
  //   const filtered = funcoes.filter(ff => ff.toLowerCase().includes(val.toLowerCase()));
  //   setFilteredFuncoes(filtered);
  //   setHighlightIndex(filtered.length ? 0 : -1);

  //   if (errors.funcao) setErrors(prev => ({ ...prev, funcao: null }));
  // };

  // // selecionar função da lista
  // const selectFuncao = (valorCanonico) => {
  //   // setamos valor canônico pra envio
  //   setForm(prev => ({ ...prev, funcao: valorCanonico }));
  //   // e mostramos a label bonitinha no input
  //   setDisplayFuncao(formatarLabel(valorCanonico));
  //   setFilteredFuncoes([]);
  //   setFuncaoFocused(false);
  //   setHighlightIndex(-1);
  //   if (errors.funcao) setErrors(prev => ({ ...prev, funcao: null }));
  // }

  // // navegação por teclado (ArrowUp/Down, Enter, Escape)
  // const onFuncaoKeyDown = (e) => {
  //   if (!filteredFuncoes.length) return;
  //   if (e.key === 'ArrowDown') {
  //     e.preventDefault();
  //     setHighlightIndex(idx => Math.min(idx + 1, filteredFuncoes.length - 1));
  //   } else if (e.key === 'ArrowUp') {
  //     e.preventDefault();
  //     setHighlightIndex(idx => Math.max(idx - 1, 0));
  //   } else if (e.key === 'Enter') {
  //     // se houver item destacado, seleciona; caso contrário, permite submit normal
  //     if (highlightIndex >= 0 && highlightIndex < filteredFuncoes.length) {
  //       e.preventDefault();
  //       selectFuncao(filteredFuncoes[highlightIndex]);
  //     }
  //   } else if (e.key === 'Escape') {
  //     setFilteredFuncoes([]);
  //     setHighlightIndex(-1);
  //     setFuncaoFocused(false);
  //   }
  // };

  // fechar sugestões ao clicar fora — opcional (melhora UX)
  useEffect(() => {
    const handler = (ev) => {
      if (!ev.target.closest) return;
      const inside = ev.target.closest('#funcao-input-wrapper');
      if (!inside) {
        setFilteredFuncoes([]);
        setFuncaoFocused(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);


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


  // adiciona função como tag, evitando duplicatas (case-insensitive)
  // const addFuncaoTag = (f) => {
  //   const v = String(f || "").trim();
  //   if (!v) return;
  //   if (setorFuncoes.some(x => x.toLowerCase() === v.toLowerCase())) return;
  //   setSetorFuncoes(prev => [...prev, v]);
  //   setSetorFuncoesInput("");
  //   setFilteredFuncoes([]);
  //   setHighlightIndex(-1);
  // };

  // // selecionar uma sugestão (clicando ou com Enter)
  // const selectFuncao = (f) => {
  //   addFuncaoTag(f);
  //   // mantém foco no input
  //   setTimeout(() => {
  //     const el = document.getElementById("setor-funcao-input");
  //     if (el) el.focus();
  //   }, 0);
  // };

  // quando digita no input — filtra sugestões
  // const onFuncaoInput = (e) => {
  //   const v = e.target.value;
  //   setSetorFuncoesInput(v);

  //   const q = String(v || "").trim().toLowerCase();
  //   // supondo que 'funcoes' exista no component (lista de todas as funções do pool)
  //   const base = Array.isArray(funcoes) ? funcoes : [];
  //   const matches = q === ""
  //     ? base.slice(0, 50) // limita número de sugestões
  //     : base.filter(f => f.toLowerCase().includes(q)).slice(0, 50);

  //   setFilteredFuncoes(matches);
  //   setHighlightIndex(matches.length ? 0 : -1);
  // };

  const [setorFilteredFuncoes, setSetorFilteredFuncoes] = useState([]);
  const [setorFuncaoFocused, setSetorFuncaoFocused] = useState(false);
  const [setorHighlightIndex, setSetorHighlightIndex] = useState(-1);

  // adiciona função como tag (evita duplicatas)
  // const addFuncaoTag = (f) => {
  //   const v = String(f || "").trim();
  //   if (!v) return;
  //   if (setorFuncoes.some(x => x.toLowerCase() === v.toLowerCase())) return;
  //   setSetorFuncoes(prev => [...prev, v]);
  //   setSetorFuncoesInput("");
  //   setSetorFilteredFuncoes([]);
  //   setSetorHighlightIndex(-1);
  // };
  const addFuncaoTag = (f) => {
    const v = String(f || "").trim();
    if (!v) return;
    if (setorFuncoes.some(x => x.toLowerCase() === v.toLowerCase())) return;
    setSetorFuncoes(prev => [...prev, v]);
    setSetorFilteredFuncoes([]);
    setSetorHighlightIndex(-1);
  };

  // selecionar sugestão
  // const selectFuncao = (f) => {
  //   addFuncaoTag(f);              // mantém sua lógica de tags
  //   setSetorFuncoesInput(f);      // mostra valor no input
  //   setSetorFilteredFuncoes([]);  // esconde lista de sugestões
  //   setSetorHighlightIndex(-1);   // reseta highlight

  //   setTimeout(() => {
  //     const el = document.getElementById("setor-funcao-input");
  //     if (el) el.focus();
  //   }, 0);
  // };
  const selectFuncao = (f) => {
    addFuncaoTag(f);
    setSetorFuncoesInput(f);     // mostra valor no input
    setSetorFilteredFuncoes([]); // esconde lista
    setSetorHighlightIndex(-1);

    setTimeout(() => {
      const el = document.getElementById("setor-funcao-input");
      if (el) el.focus();
    }, 0);
  };

  const onSetorFuncaoInput = (e) => {
    const v = e.target.value;
    setSetorFuncoesInput(v);

    const q = String(v || "").trim().toLowerCase();
    const base = Array.isArray(funcoes) ? funcoes : [];
    const matches = q === ""
      ? base.slice(0, 50)
      : base.filter(f => f.toLowerCase().includes(q)).slice(0, 50);

    setSetorFilteredFuncoes(matches);
    setSetorHighlightIndex(matches.length ? 0 : -1);
  };

  const onSetorFuncaoKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (setorFilteredFuncoes.length === 0) return;
      setSetorHighlightIndex(i => Math.min(setorFilteredFuncoes.length - 1, i + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (setorFilteredFuncoes.length === 0) return;
      setSetorHighlightIndex(i => Math.max(0, i - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (setorHighlightIndex >= 0 && setorHighlightIndex < setorFilteredFuncoes.length) {
        selectFuncao(setorFilteredFuncoes[setorHighlightIndex]);
      } else if (setorFuncoesInput.trim() !== "") {
        addFuncaoTag(setorFuncoesInput.trim());
        setSetorFuncoesInput(""); // limpa input só nesse caso
      }
      return;
    }
    if (e.key === "Escape") {
      setSetorFilteredFuncoes([]);
      setSetorHighlightIndex(-1);
      setSetorFuncaoFocused(false);
      return;
    }
    if (e.key === "Backspace" && setorFuncoesInput === "" && setorFuncoes.length > 0) {
      setSetorFuncoes(prev => prev.slice(0, -1));
    }
  };

  // navegação por teclado (ArrowUp/Down, Enter, Esc, Backspace para remover tag se input vazio)
  // const onFuncaoKeyDown = (e) => {
  //   if (e.key === "ArrowDown") {
  //     e.preventDefault();
  //     if (filteredFuncoes.length === 0) return;
  //     setHighlightIndex(i => Math.min(filteredFuncoes.length - 1, i + 1));
  //     return;
  //   }
  //   if (e.key === "ArrowUp") {
  //     e.preventDefault();
  //     if (filteredFuncoes.length === 0) return;
  //     setHighlightIndex(i => Math.max(0, i - 1));
  //     return;
  //   }
  //   if (e.key === "Enter") {
  //     // se há highlight, seleciona; senão adiciona texto livre
  //     e.preventDefault();
  //     if (highlightIndex >= 0 && highlightIndex < filteredFuncoes.length) {
  //       selectFuncao(filteredFuncoes[highlightIndex]);
  //     } else if (setorFuncoesInput.trim() !== "") {
  //       addFuncaoTag(setorFuncoesInput.trim());
  //     }
  //     return;
  //   }
  //   if (e.key === "Escape") {
  //     setFilteredFuncoes([]);
  //     setHighlightIndex(-1);
  //     setFuncaoFocused(false);
  //     return;
  //   }
  //   if (e.key === "Backspace" && setorFuncoesInput === "" && setorFuncoes.length > 0) {
  //     // remover última tag
  //     setSetorFuncoes(prev => prev.slice(0, -1));
  //   }
  // };

  const [submitAttemptedSetor, setSubmitAttemptedSetor] = useState(false);
  const [setorErrors, setSetorErrors] = useState({
    titulo: null,
    descricao: null,
    funcoes: null
  });


  const [setorModalData, setSetorModalData] = useState({ titulo: "", descricao: "" });
  const [setorFuncoesInput, setSetorFuncoesInput] = useState("");
  const [setorFuncoes, setSetorFuncoes] = useState([]);
  const [setorSubmitting, setSetorSubmitting] = useState(false);

  // limpa o erro de um campo quando o usuário começa a editar
  const clearSetorError = (field) => {
    setSetorErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleSetorModalChange = (e) => {
    const { name, value } = e.target;
    setSetorModalData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddFuncao = (ev) => {
    ev?.preventDefault?.();
    const v = String(setorFuncoesInput || "").trim();
    if (!v) return;
    // evita duplicatas (case-insensitive)
    if (setorFuncoes.some(f => f.toLowerCase() === v.toLowerCase())) {
      setSetorFuncoesInput("");
      return;
    }
    setSetorFuncoes(prev => [...prev, v]);
    setSetorFuncoesInput("");
  };

  const handleRemoveFuncao = (idx) => {
    setSetorFuncoes(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCriarSetorModal = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    setSubmitAttemptedSetor(true);

    // validação local
    const tituloTrim = String(setorModalData.titulo || "").trim();
    const descricaoTrim = String(setorModalData.descricao || "").trim();
    const funcoesArr = Array.isArray(setorFuncoes) ? setorFuncoes : [];

    const newErrors = { titulo: null, descricao: null, funcoes: null };
    if (!tituloTrim) newErrors.titulo = "Título é obrigatório";
    if (!descricaoTrim) newErrors.descricao = "Descrição é obrigatória";
    if (!funcoesArr.length) newErrors.funcoes = "Adicione pelo menos 1 função";

    setSetorErrors(newErrors);

    // se tiver erro, não envia
    if (newErrors.titulo || newErrors.descricao || newErrors.funcoes) {
      if (newErrors.titulo) {
        const el = document.querySelector('input[name="titulo"]');
        if (el) el.focus();
      } else if (newErrors.descricao) {
        const el = document.querySelector('textarea[name="descricao"]');
        if (el) el.focus();
      }
      return;
    }

    setSetorSubmitting(true);
    try {
      const payload = { titulo: tituloTrim, descricao: descricaoTrim, funcoes: funcoesArr };
      const res = await fetchWithTimeout(`${API_BASE_URL}/pool`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      }, 10000);

      const data = res;

      // atualiza setores local
      setSetores(prev => [{ id: data.id || Date.now(), titulo: data.titulo || payload.titulo, descricao: data.descricao || payload.descricao }, ...prev]);

      try {
        const fRes = await fetchWithTimeout(`${API_BASE_URL}/funcoes`, { method: 'GET', credentials: 'include' }, 10000);
        const allFuncoes = fRes;
        if (Array.isArray(allFuncoes)) setFuncoes(allFuncoes);
      } catch (err) {
        if (Array.isArray(data.funcoes) && data.funcoes.length) {
          setFuncoes(prev => {
            const missing = data.funcoes.filter(f => !prev.includes(f));
            return [...missing, ...prev];
          });
        }
      }

      showToast("success", "Setor criado");

      // reset modal e estado de validação
      setSetorModalData({ titulo: "", descricao: "" });
      setSetorFuncoes([]);
      setSetorFuncoesInput("");
      setSubmitAttemptedSetor(false);
      setSetorErrors({ titulo: null, descricao: null, funcoes: null });
      setShowSetorModal(false);
    } catch (err) {
      console.error('[handleCriarSetorModal] erro:', err);
      showToast("danger", "Erro ao criar setor");
    } finally {
      setSetorSubmitting(false);
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

    const correcoes = { "auxiliar_limpeza": "Auxiliar de Limpeza", "auxiliar limpeza": "Auxiliar de Limpeza", "apoio_tecnico": "Apoio Técnico", "tecnico": "Técnico", "manutencao": "Manutenção", "media": "Média" };

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
      {showSetorModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowSetorModal(false)} // clique no backdrop fecha
          aria-modal="true"
        >
          <div
            className="w-full max-w-md p-4"
            onClick={(ev) => ev.stopPropagation()} // evita fechar ao clicar dentro
          >
            <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Criar Setor</h3>
                <button type="button" onClick={() => setShowSetorModal(false)} className="text-gray-400 hover:bg-gray-200 rounded-lg w-8 h-8 inline-flex justify-center items-center">
                  <svg className="w-4 h-4" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1l12 12M13 1L1 13" />
                  </svg>
                </button>
              </div>

              {/* Body / Form */}
              <form onSubmit={handleCriarSetorModal} className="p-4 space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Título<span className="ml-1 self-start leading-none text-red-500">*</span></label>
                  <input name="titulo" value={setorModalData.titulo} onChange={(e) => { handleSetorModalChange(e); if (setorErrors.titulo) clearSetorError('titulo'); }}
                    className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-600 dark:border-gray-500 text-sm dark:text-white focus:outline-none focus:ring-0 ${submitAttemptedSetor && setorErrors.titulo ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-violet-500'}`} placeholder="Ex: manutencao" required />
                  {submitAttemptedSetor && setorErrors.titulo && <div className="text-xs text-red-500 mt-1">{setorErrors.titulo}</div>}
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Descrição<span className="ml-1 self-start leading-none text-red-500">*</span></label>
                  <textarea name="descricao" value={setorModalData.descricao} onChange={handleSetorModalChange}
                    className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-600 dark:border-gray-500 text-sm dark:text-white focus:outline-none focus:ring-0 ${submitAttemptedSetor && setorErrors.titulo ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-violet-500'}`} rows={4} placeholder="Descrição do setor" />
                  {submitAttemptedSetor && setorErrors.descricao && <div className="text-xs text-red-500 mt-1">{setorErrors.descricao}</div>}
                </div>

                <div>

                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Funções (tags)<span className="ml-1 self-start leading-none text-red-500">*</span></label>

                  <div className="relative">
                    <div className="flex gap-2">
                      <input
                        id="setor-funcao-input"
                        type="text"
                        value={setorFuncoesInput}
                        onChange={onSetorFuncaoInput}
                        onFocus={() => {
                          setSetorFuncaoFocused(true);
                          const all = Array.isArray(funcoes) ? funcoes.slice(0, 50) : [];
                          setSetorFilteredFuncoes(all);
                          setSetorHighlightIndex(all.length ? 0 : -1);
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setSetorFuncaoFocused(false);
                            setSetorFilteredFuncoes([]);
                            setSetorHighlightIndex(-1);
                          }, 150);
                        }}
                        onKeyDown={onSetorFuncaoKeyDown}
                        autoComplete="off"
                        placeholder="Digite uma função"
                        aria-autocomplete="list"
                        aria-controls="setor-funcao-suggestions"
                        aria-expanded={setorFuncaoFocused && setorFilteredFuncoes.length > 0}
                        className={`flex-1 px-3 py-2 rounded-lg border bg-white dark:bg-gray-600 dark:border-gray-500 text-sm dark:text-white focus:outline-none focus:ring-0 ${submitAttemptedSetor && setorErrors.titulo ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-violet-500'}`}
                      />
                      <button
                        type="button"
                        onClick={() => addFuncaoTag(setorFuncoesInput)}
                        className="py-2 px-3 inline-flex items-center gap-x-2 text-sm poppins-medium rounded-lg border border-transparent bg-violet-500 hover:bg-violet-600 text-white focus:outline-hidden focus:bg-violet-600 disabled:opacity-50 disabled:pointer-events-none "
                      ><svg className="shrink-0 size-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg></button>
                    </div>

                    {setorFuncaoFocused && setorFilteredFuncoes.length > 0 && (
                      <ul
                        id="setor-funcao-suggestions"
                        role="listbox"
                        aria-label="Sugestões de função"
                        className="absolute z-[999] mt-2 w-full max-h-48 overflow-auto rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      >
                        {setorFilteredFuncoes.map((f, idx) => {
                          const isHighlighted = setorHighlightIndex === idx;
                          return (
                            <li
                              key={f + idx}
                              id={`setor-funcao-option-${idx}`}
                              role="option"
                              aria-selected={isHighlighted}
                              onMouseDown={(ev) => { ev.preventDefault(); }}
                              onClick={() => selectFuncao(f)}
                              onMouseEnter={() => setSetorHighlightIndex(idx)}
                              className={`px-3 py-2 cursor-pointer select-none text-sm ${isHighlighted ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                              <div className="dark:text-gray-300">{formatarLabel(f)}</div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {setorFuncoes.map((f, idx) => (
                      <span key={f + idx} className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-sm dark:text-gray-100">
                        <span>{formatarLabel(f)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFuncao(idx)}
                          className="w-5 h-5 inline-flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                          aria-label={`Remover ${f}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  {submitAttemptedSetor && setorErrors.funcoes && <div className="text-xs text-red-500 mt-1">{setorErrors.funcoes}</div>}
                </div>


                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => { setShowSetorModal(false); }} className="inline-flex items-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-sm  px-3 py-1.5">Cancelar</button>
                  <button type="submit" disabled={setorSubmitting} className="py-2 px-3 inline-flex items-center gap-x-2 text-sm poppins-medium rounded-lg border border-transparent bg-violet-500 hover:bg-violet-600 text-white focus:outline-hidden focus:bg-violet-600 disabled:opacity-50 disabled:pointer-events-none ">
                    {setorSubmitting ? 'Salvando...' : 'Criar setor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      <div className="p-4 w-full dark:bg-gray-900">
        <div className="p-4 mt-14">

          <div className="flex max-w-full dark:bg-gray-900 ">
            {/* ASIDE FIXO */}
            {/* <aside className="hidden md:block fixed top-23 left-[80px] w-64 bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-4 dark:bg-gray-800 dark:border-gray-700">
              <h2 className="text-lg poppins-semibold mb-3 dark:text-white">Índice</h2>
              <nav className="flex flex-col gap-3 text-violet-500 dark:text-purple-500">
                <a href="#criar-usuario" className="hover:underline">Criar Usuário</a>
                <a href="#setores" className="hover:underline">Setores</a>
                <a href="#prioridade" className="hover:underline">Prioridade</a>
              </nav>
            </aside> */}
            <aside className="hidden md:block fixed top-23 left-[80px] w-64 rounded-md border bg-white px-6 py-6 shadow-md dark:bg-gray-800 dark:border-gray-700 lg:w-56">
              <div className="pb-2 text-xl font-medium text-violet-600 dark:text-purple-400">Índice</div>
              <hr className="h-1 w-10 bg-violet-600 dark:bg-purple-500 my-2" />
              <nav className="mt-4 flex flex-col gap-3">
                <a className="text-sm font-medium text-violet-600 dark:text-purple-400 hover:text-violet-500" href="#criar-usuario">Criar Usuário</a>
                <a className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-violet-500" href="#setores">Setores</a>
                <a className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-violet-500" href="#prioridade">Prioridade</a>
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
                        <label htmlFor="user_username" className={`peer-focus:poppins-medium absolute text-sm ${submitAttempted && errors.username ? 'text-red-500' : 'text-gray-500'} ${submitAttempted && errors.username ? '' : 'dark:text-gray-400'} duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto ${submitAttempted && errors.username ? 'peer-focus:text-red-500' : 'peer-focus:text-violet-500 peer-focus:dark:text-violet-500'} peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}><span className="leading-none">Username</span>
                          <span className="ml-1 self-start leading-none text-red-500">*</span>
                        </label>
                        <div className="mt-2">
                          {usernameChecking && <span className="text-xs text-gray-500">Verificando...</span>}
                          {!usernameChecking && usernameExists && <div className="text-xs text-red-500">Esse username já existe</div>}
                          {!usernameChecking && !usernameExists && form.username && <div className="text-xs text-green-600"></div>}
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
                      <div className="relative mb-5 group w-full md:w-60 overflow-visible">
                        <div id="funcao-input-wrapper" className="relative">
                          {/* <input
                            type="text"
                            name="funcao"
                            id="user_function"
                            autoComplete="off"
                            className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 appearance-none
      ${submitAttempted && errors.funcao ? 'border-red-500' : 'border-gray-300'}
      dark:text-white dark:border-gray-600 dark:focus:border-purple-500 focus:outline-none focus:ring-0 ${submitAttempted && errors.funcao ? 'focus:border-red-500' : 'focus:border-[#7F56D8]'} peer`}
                            placeholder=" "
                            // value={form.funcao}
                            value={displayFuncao}
                            onChange={onSetorFuncaoInput}
                            onFocus={() => {
                              setFuncaoFocused(true);
                              // quando foca, preenche filtered com todas as funcoes (se input vazio)
                              const all = funcoes.filter(f => f.toLowerCase().includes((form.funcao || '').toLowerCase()));
                              setFilteredFuncoes(all);
                              setHighlightIndex(all.length ? 0 : -1);
                            }}
                            onBlur={() => {
                              // delay para permitir click em item antes de limpar
                              setTimeout(() => {
                                setFuncaoFocused(false);
                                setFilteredFuncoes([]);
                                setHighlightIndex(-1);
                              }, 150);
                            }}
                            onKeyDown={onSetorFuncaoKeyDown}
                            required
                            aria-autocomplete="list"
                            aria-controls="funcao-suggestions"
                            aria-expanded={funcaoFocused && filteredFuncoes.length > 0}
                            aria-haspopup="listbox"
                          /> */}
                          <input
                            type="text"
                            name="funcao"
                            id="user_function"
                            autoComplete="off"
                            className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 appearance-none
    ${submitAttempted && errors.funcao ? 'border-red-500' : 'border-gray-300'}
    dark:text-white dark:border-gray-600 dark:focus:border-purple-500 focus:outline-none focus:ring-0 ${submitAttempted && errors.funcao ? 'focus:border-red-500' : 'focus:border-[#7F56D8]'} peer`}
                            placeholder=" "
                            value={funcaoInput}                 // <--- agora controlado
                            onChange={onFuncaoInput}            // <--- handler novo
                            onFocus={() => {
                              setFuncaoFocused(true);
                              const all = Array.isArray(funcoes) ? funcoes.slice(0, 50) : [];
                              setFilteredFuncoes(all);
                              setHighlightIndex(all.length ? 0 : -1);
                            }}
                            onBlur={() => {
                              setTimeout(() => {
                                setFuncaoFocused(false);
                                setFilteredFuncoes([]);
                                setHighlightIndex(-1);
                              }, 150);
                            }}
                            onKeyDown={onFuncaoKeyDown}         // <--- handler novo
                            required
                            aria-autocomplete="list"
                            aria-controls="funcao-suggestions"
                            aria-expanded={funcaoFocused && filteredFuncoes.length > 0}
                            aria-haspopup="listbox"
                          />

                          <label
                            htmlFor="user_function"
                            className={`peer-focus:poppins-medium absolute text-sm ${submitAttempted && errors.funcao ? 'text-red-500' : 'text-gray-500'} ${submitAttempted && errors.funcao ? '' : 'dark:text-gray-400'} duration-300 transform -translate-y-6 scale-75 top-3  origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto ${submitAttempted && errors.funcao ? 'peer-focus:text-red-500' : 'peer-focus:text-[#7F56D8] peer-focus:dark:text-purple-500'} peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}
                          ><span className="leading-none">Função</span>
                            <span className="ml-1 self-start leading-none text-red-500">*</span>
                          </label>

                          {/* lista de sugestões */}
                          {funcaoFocused && filteredFuncoes.length > 0 && (
                            <ul
                              id="funcao-suggestions"
                              role="listbox"
                              aria-label="Sugestões de função"
                              className="absolute z-[999] mt-2 w-full max-h-48 overflow-auto rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                            >
                              {/* {filteredFuncoes.map((f, idx) => (
                                <li
                                  key={f}
                                  id={`funcao-option-${idx}`}
                                  role="option"
                                  aria-selected={highlightIndex === idx}
                                  onMouseDown={(e) => { e.preventDefault(); 
                                  onClick={() => selectFuncao(f)}
                                  onMouseEnter={() => setHighlightIndex(idx)}
                                  className={`px-3 py-2 cursor-pointer select-none ${highlightIndex === idx ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                >
                                  <div className="text-sm dark:text-gray-300">{formatarLabel(f)}</div>
                                </li>
                              ))} */}
                              {filteredFuncoes.map((f, idx) => (
                                <li
                                  key={f + idx}
                                  id={`funcao-option-${idx}`}
                                  role="option"
                                  aria-selected={highlightIndex === idx}
                                  onMouseDown={(e) => { e.preventDefault(); }}
                                  onClick={() => selectFuncaoUser(f)}   // <-- chama o select do form
                                  onMouseEnter={() => setHighlightIndex(idx)}
                                  className={`px-3 py-2 cursor-pointer select-none ${highlightIndex === idx ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                >
                                  <div className="text-sm dark:text-gray-300">{formatarLabel(f)}</div>
                                </li>
                              ))}

                            </ul>
                          )}


                          {submitAttempted && errors.funcao && <div className="text-xs text-red-500 mt-1">{errors.funcao}</div>}
                        </div>
                      </div>
                    </div>

                    {/* Linha 3: Senha + Confirmar senha */}
                    <div className="flex flex-col md:flex-row gap-6 overflow-visible">
                      {/* Senha */}
                      <div className="relative overflow-visible mb-5 group w-full md:w-60">
                        <input
                          type={showPassword ? "text" : "password"}
                          onFocus={() => setShowEye(true)}     // mostra o olho ao focar
                          onBlur={() => { if (!form.senha) setShowEye(false); }} // esconde se perder foco sem nada digitado
                          name="senha"
                          id="user_password"
                          className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 appearance-none ${submitAttempted && errors.senha ? 'border-red-500' : 'border-gray-300'} dark:text-white dark:border-gray-600 dark:focus:border-purple-500 focus:outline-none focus:ring-0 ${submitAttempted && errors.senha ? 'focus:border-red-500' : 'focus:border-[#7F56D8]'} peer`} placeholder=" " value={form.senha} onChange={(e) => {
                            handleSenhaChange(e);
                            if (errors.senha) setErrors(prev => ({ ...prev, senha: null }));
                          }} required />
                        {/* <label
                          htmlFor="user_password"
                          className={`peer-focus:poppins-medium absolute text-sm ${submitAttempted && errors.senha ? 'text-red-500' : 'text-gray-500'} ${submitAttempted && errors.senha ? '' : 'dark:text-gray-400'} duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto ${submitAttempted && errors.senha ? 'peer-focus:text-red-500' : 'peer-focus:text-[#7F56D8] peer-focus:dark:text-purple-500'} peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}><span className="leading-none">Senha</span>
                          <span className="ml-1 self-start leading-none text-red-500">*</span>
                        </label> */}
                        <label
                          htmlFor="user_password"
                          className={`peer-focus:poppins-medium absolute text-sm
    ${submitAttempted && errors.senha ? 'text-red-500' : 'text-gray-500'}
    ${submitAttempted && errors.senha ? '' : 'dark:text-gray-400'}
    duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0]
    peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto
    ${submitAttempted && errors.senha ? 'peer-focus:text-red-500' : 'peer-focus:text-[#7F56D8] peer-focus:dark:text-purple-500'}
    peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
    peer-focus:scale-75 peer-focus:-translate-y-6`}
                        >
                          <span className="leading-none">Senha</span>
                          <span className="ml-1 self-start leading-none text-red-500">*</span>
                        </label>
                        {/* botão do olho, aparece só se showEye = true */}
                        {showEye && (
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? (
                              // olho aberto
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                                <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
                              </svg>

                            ) : (
                              // olho fechado
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.676 12.553a11.249 11.249 0 0 1-2.631 4.31l-3.099-3.099a5.25 5.25 0 0 0-6.71-6.71L7.759 4.577a11.217 11.217 0 0 1 4.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113Z" />
                                <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0 1 15.75 12ZM12.53 15.713l-4.243-4.244a3.75 3.75 0 0 0 4.244 4.243Z" />
                                <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 0 0-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 0 1 6.75 12Z" />
                              </svg>

                            )}
                          </button>
                        )}
                        {submitAttempted && errors.senha && <div className="text-xs text-red-500 mt-1">{errors.senha}</div>}
                      </div>

                      {/* Confirmar senha */}
                      <div className="relative z-0 mb-5 group w-full md:w-60">
                        <input
                          type={showRepeatPassword ? "text" : "password"}
                          onFocus={() => setShowEye(true)}     // mostra o olho ao focar
                          onBlur={() => { if (!form.repeat_password) setShowEye(false); }} // esconde se perder foco sem nada digitado
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
                         {/* botão do olho, aparece só se showEye = true */}
                {showEye && (
                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showRepeatPassword ? (
                      // olho aberto
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                        <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
                      </svg>

                    ) : (
                      // olho fechado
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.676 12.553a11.249 11.249 0 0 1-2.631 4.31l-3.099-3.099a5.25 5.25 0 0 0-6.71-6.71L7.759 4.577a11.217 11.217 0 0 1 4.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113Z" />
                        <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0 1 15.75 12ZM12.53 15.713l-4.243-4.244a3.75 3.75 0 0 0 4.244 4.243Z" />
                        <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 0 0-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 0 1 6.75 12Z" />
                      </svg>

                    )}
                  </button>
                )}
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
                            <button type="button" onClick={() => { setShowSetorModal(true); setNovoSetor({ titulo: "", descricao: "" }); }} className="py-2 px-3 inline-flex items-center gap-x-2 text-sm poppins-medium rounded-lg border border-transparent bg-violet-500 hover:bg-violet-600 text-white focus:outline-hidden focus:bg-violet-600 disabled:opacity-50 disabled:pointer-events-none "><svg className="shrink-0 size-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>Criar setor</button>
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
                                        <input type="text" value={editPrioridade.nome} onChange={(e) => handleNovaPrioridadeChange('nome', e.target.value)} className={`dark:bg-gray-900 w-full p-2 border rounded-lg text-sm dark:text-gray-300 ${novaPrioridadeErrors.nome ? 'border-red-500 ring-1 ring-red-500' : 'focus:outline-none focus:ring-2 focus:ring-violet-500'}`} required />
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
                                        <input type="number" value={editPrioridade.horas_limite} onChange={(e) => handleNovaPrioridadeChange('horas_limite', e.target.value)} className={`dark:bg-gray-900 w-full p-2 border rounded-lg text-sm dark:text-gray-300  ${novaPrioridadeErrors.horas_limite ? 'border-red-500 ring-1 ring-red-500' : 'focus:outline-none focus:ring-2 focus:ring-violet-500'}`} required />
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
                                              <button onClick={() => { setEditPrioridade({ ...p, horas_limite: Number(p.horas_limite) }); setOpenPrioridadeDropdownId(null); }} className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200 w-full text-left">Editar</button>
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
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md dark:bg-gray-700">
                  <div className="text-center">
                    <svg className="mx-auto mb-4 text-gray-400 w-12 h-12" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    <h3 className="mb-5 text-lg poppins-regular text-gray-500">Tem certeza que deseja excluir este setor?</h3>
                    <button onClick={() => { if (setorParaExcluir) excluirSetor(setorParaExcluir); setMostrarModalConfirmacaoSetor(false); setSetorParaExcluir(null); }} className="text-white bg-[#7F56D8] focus:ring-4 focus:outline-none focus:ring-[#7F56D8] poppins-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">Sim, excluir</button>
                    <button onClick={() => { setMostrarModalConfirmacaoSetor(false); setSetorParaExcluir(null); }} className="py-2.5 px-5 ms-3 text-sm poppins-medium text-gray-900 focus:outline-none bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600 rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-[#7F56D8] focus:z-10 focus:ring-4 focus:ring-gray-100">Cancelar</button>
                  </div>
                </div>
              </div>
            )}

            {/* tem tz q deseja excluir a prioridade? */}
            {mostrarModalConfirmacaoPrioridade && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md dark:bg-gray-700">
                  <div className="text-center">
                    <svg className="mx-auto mb-4 text-gray-400 w-12 h-12" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    <h3 className="mb-5 text-lg poppins-regular text-gray-500">Tem certeza que deseja excluir esta prioridade?</h3>
                    <button onClick={() => { if (prioridadeParaExcluir) handleExcluirPrioridade(prioridadeParaExcluir); setMostrarModalConfirmacaoPrioridade(false); setPrioridadeParaExcluir(null); }} className="text-white bg-[#7F56D8] focus:ring-4 focus:outline-none focus:ring-[#7F56D8] poppins-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">Sim, excluir</button>
                    <button onClick={() => { setMostrarModalConfirmacaoPrioridade(false); setPrioridadeParaExcluir(null); }} className="py-2.5 px-5 ms-3 text-sm poppins-medium text-gray-900 focus:outline-none bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600 rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-[#7F56D8] focus:z-10 focus:ring-4 focus:ring-gray-100">Cancelar</button>
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