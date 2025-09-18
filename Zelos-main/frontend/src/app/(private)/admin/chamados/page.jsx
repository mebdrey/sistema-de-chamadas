"use client"
import { useEffect, useState, useMemo, useRef } from "react";
import { initFlowbite } from 'flowbite';
import { useRouter } from 'next/navigation';
import OrdenarPor from '@/components/DropDown/DropDown.jsx';
import ToastMsg from "@/components/Toasts/Toasts";

// useOnClickOutside & useOnEscape 
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    if (!ref?.current) return;

    const listener = (event) => {
      if (!ref.current) return;
      if (ref.current.contains(event.target)) return;
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

function useOnEscape(handler) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') handler(e);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handler]);
}


export default function ChamadosAdmin() {
  const [isOpen, setIsOpen] = useState(false); // p drawer abrir e fechar
  const [isMounted, setIsMounted] = useState(false); // espera o componente estar carregado no navegador p evitar erros de renderizacao
  const [chamados, setChamados] = useState([]);// p selecionar os chamados com base no status
  const [abaAtiva, setAbaAtiva] = useState('todos');
  const [tiposServico, setTiposServico] = useState([]); // mostra os tipos de servicos/setores
  const [setoresSelecionados, setSetoresSelecionados] = useState([]); // guarda o tipo de servico selecionado
  const [busca, setBusca] = useState(""); // armazena o que htmlFor digitado no campo de busca
  const [dropdownSetorAberto, setDropdownSetorAberto] = useState(false);
  const [prioridades, setPrioridades] = useState([]);
  const [dropdownPrioridadeAberto, setDropdownPrioridadeAberto] = useState(false);
  const [prioridadesSelecionadas, setPrioridadesSelecionadas] = useState([]);
  const [ordenarPor, setOrdenarPor] = useState('mais_recente'); // ordenar por mais recente ou mais antigo, por padrao ele mostra os mais recentes primeiro
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosPorSetor, setUsuariosPorSetor] = useState({ tecnicos: [], auxiliares: [] });
  const [tipoServico, setTipoServico] = useState(""); // recebe do chamado
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [usuarioAtribuido, setUsuarioAtribuido] = useState(null);
  const [openAtribuirDropdown, setOpenAtribuirDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ prioridade_id: "", tecnico_id: "", tipo_id: "", descricao: "", assunto: "", status_chamado: "", data_limite: "" });
  const [openAbas, setOpenAbas] = useState(false);
  const [resposta, setResposta] = useState(null);
  const dropdownRef = useRef(null);
  // validação para exigir técnico quando concluir
  const [tecnicoObrigatorioError, setTecnicoObrigatorioError] = useState(false);
  const { UI: ToastsUI, showToast } = ToastMsg(); // pega UI e função showToast
  // refs para dropdowns e modal
  const setorRef = useRef(null);
  const prioridadeRef = useRef(null);
  const chamadoModalContentRef = useRef(null);

  // fecha ao clicar fora
  useOnClickOutside(setorRef, () => setDropdownSetorAberto(false));
  useOnClickOutside(prioridadeRef, () => setDropdownPrioridadeAberto(false));
  useOnClickOutside(chamadoModalContentRef, () => {
    if (isOpen) setIsOpen(false);
  });

  // fecha ao pressionar ESC
  useOnEscape(() => {
    if (dropdownSetorAberto) setDropdownSetorAberto(false);
    if (dropdownPrioridadeAberto) setDropdownPrioridadeAberto(false);
    if (isOpen) setIsOpen(false); // fecha o drawer/modal do chamado
  });


  useEffect(() => { setIsMounted(true); initFlowbite(); }, []);// inicializa dropdowns, modais, etc.

  useEffect(() => {  // busca os chamados feitos pelo usuario
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
  const statusAbas = ['todos', 'pendente', 'em andamento', 'concluido'];
  // funcao p normalizar id
  const normalizarId = (texto) => typeof texto === 'string' ? texto.toLowerCase().replace(/\s+/g, '-') : '';
  useEffect(() => {
    function onClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenAbas(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Carrega prioridades do backend (usa a rota que você já tem: GET /prioridades)
  const listarPrioridades = async () => {
    try {
      const res = await fetch(`http://localhost:8080/prioridades`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      // garante array e ordena por id (ou por horas_limite se preferir)
      if (Array.isArray(data)) {
        // opcional: ordenar por id para previsibilidade
        data.sort((a, b) => Number(a.id) - Number(b.id));
        setPrioridades(data);
      } else {
        setPrioridades([]);
      }
    } catch (err) {
      console.error('Falha ao carregar prioridades:', err);
      setPrioridades([]);
    }
  };

  // carregar ao montar
  useEffect(() => {
    listarPrioridades();
  }, []);

  // calcula data limite dinamicamente usando prioridades carregadas do backend
  const calcularDataLimite = (chamado) => {
    if (!chamado) return null;

    // 1) se já existe data_limite persistida, usa ela (mantém compatibilidade)
    if (chamado.data_limite) {
      const dt = new Date(chamado.data_limite);
      if (!Number.isNaN(dt.getTime())) return dt;
    }

    // 2) determina prioridade (se estiver em edição, prefira formData.prioridade_id)
    const prioridadeId = (typeof formData?.prioridade_id !== 'undefined' && formData.prioridade_id !== '')
      ? Number(formData.prioridade_id)
      : Number(chamado.prioridade_id);

    if (!prioridadeId) return null;

    // 3) encontra a prioridade carregada no estado
    const p = prioridades.find(x => Number(x.id) === prioridadeId);
    const horasLimite = p ? Number(p.horas_limite) : (Number(chamado.horas_limite) || null);

    if (!horasLimite || isNaN(horasLimite)) return null;

    // 4) pega criado_em e transforma em Date de forma robusta
    const criadoStr = chamado.criado_em;
    if (!criadoStr) return null;
    const safeIso = (typeof criadoStr === 'string' && criadoStr.includes(' ') && !criadoStr.includes('T'))
      ? criadoStr.replace(' ', 'T')
      : criadoStr;
    const criado = new Date(safeIso);
    if (Number.isNaN(criado.getTime())) return null;

    // 5) calcula deadline
    const deadline = new Date(criado.getTime() + horasLimite * 60 * 60 * 1000);
    return deadline;
  };

  // helper: formata data/hora pt-BR (dd/mm/yyyy hh:mm)
  const formatarDataHoraPtBr = (dateObj) => {
    if (!dateObj) return '';
    // se recebeu string, converte pra Date
    const d = (typeof dateObj === 'string') ? new Date(dateObj.includes('T') ? dateObj : dateObj.replace(' ', 'T')) : dateObj;
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // recalcula a data limite em tempo real enquanto o usuário edita a prioridade
  const dataLimitePreview = useMemo(() => {
    // calcular usando o chamadoSelecionado e o formData atual
    // calcularDataLimite já usa formData.prioridade_id quando definido
    return calcularDataLimite(chamadoSelecionado);
    // dependências: recalcula ao mudar chamadoSelecionado, prioridades ou formData.prioridade_id
  }, [chamadoSelecionado, prioridades, formData?.prioridade_id]);


  // retorna o objeto prioridade (ou undefined)
  const getPrioridadeById = (id) => {
    if (id === null || typeof id === 'undefined' || id === '') return undefined;
    return prioridades.find(p => Number(p.id) === Number(id));
  };

  // retorna somente o nome (label) da prioridade ou fallback
  const getPrioridadeNome = (id) => {
    const p = getPrioridadeById(id);
    return p ? p.nome : '';
  };

  // retorna nome + horas como string para exibição compacta: "Alta — 8h"
  const getPrioridadeLabel = (id) => {
    const p = getPrioridadeById(id);
    return p ? `${p.nome} — ${p.horas_limite}h` : '';
  };


  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const form = e.target;

  //   const formData = req.body;// Pegando os dados do formulário
  //   {/*ENVIO PARA O BACK*/ }
  //   try {
  //     const response = await fetch("http://localhost:8080/pool", {
  //       method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData), credentials: "include"
  //     });

  //     const data = await response.json();
  //     setResposta(JSON.stringify(data, null, 2));

  //     //alert 
  //     if (response.ok) {
  //       showToast("success", "Setor cadastrada com sucesso!");
  //       setResposta(JSON.stringify(data, null, 2));
  //       form.reset(); // limpa o formulário
  //     }
  //     else { showToast("danger", "Erro ao cadastrar setor."); }
  //   } catch (error) {
  //     console.error("Erro:", error);
  //     setResposta("Erro ao enviar os dados.");
  //   }
  // };
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const form = e.target;
  //   const fd = new FormData(form);
  //   const payload = Object.fromEntries(fd.entries()); // { titulo: "x", descricao: "y" }

  //   try {
  //     const response = await fetch(`http://localhost:8080/pool`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //       credentials: "include"
  //     });
  //     const data = await response.json();
  //     setResposta(JSON.stringify(data, null, 2));
  //     if (response.ok) {
  //       showToast("success", "Setor cadastrado com sucesso!");
  //       form.reset();
  //     } else {
  //       showToast("danger", data?.message || "Erro ao cadastrar setor.");
  //     }
  //   } catch (error) {
  //     console.error("Erro:", error);
  //     setResposta("Erro ao enviar os dados.");
  //     showToast("danger", "Erro ao enviar os dados.");
  //   }
  // };


  // busca os tipos de servico
  useEffect(() => {
    fetch('http://localhost:8080/servicos', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const ativos = data.filter(servico => servico.status_pool === 'ativo');
        setTiposServico(ativos);
      })
      .catch(err => console.error('Erro ao carregar tipos de serviço:', err));
  }, []);

  const chamadosFiltrados = useMemo(() => {
    return [...chamados].sort((a, b) => {
      const dataA = new Date(a.criado_em);
      const dataB = new Date(b.criado_em);
      return ordenarPor === 'mais_antigo' ? dataA - dataB : dataB - dataA;
    });
  }, [chamados, ordenarPor]);

  // objeto de mapeamento de tipo_id para titulo
  const mapaTipoIdParaTitulo = useMemo(() => {
    const mapa = {};
    tiposServico.forEach((t) => { mapa[t.id] = t.titulo; });
    return mapa;
  }, [tiposServico]);

  // BUSCA USUÁRIOS  -----------------------------

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await fetch("http://localhost:8080/usuarios-por-setor", { credentials: "include" });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Erro ao buscar usuários: ${res.status} ${res.statusText} ${text}`);
        }

        const data = await res.json();
        const { tecnicos = [], auxiliares = [] } = data || {};
        setUsuariosPorSetor({ tecnicos, auxiliares });

        setUsuarios([...tecnicos, ...auxiliares]);
      } catch (err) {
        console.error("Erro ao carregar usuários:", err);
        setUsuariosPorSetor({ tecnicos: [], auxiliares: [] });
        setUsuarios([]);
      }
    };
    fetchUsuarios();
  }, []);

  const usuariosFiltrados = (() => {
    const tipo = chamadoSelecionado?.tipo_titulo?.toLowerCase();
    if (!tipo) return [];
    if (["externo", "apoio_tecnico", "manutencao"].includes(tipo)) { return usuariosPorSetor.tecnicos || []; }

    if (tipo === "limpeza") { return usuariosPorSetor.auxiliares || []; }
    return [];
  })();

  // mapa id => usuário para lookup rápido
  const usuariosMap = useMemo(() => {
    const m = {};
    usuarios.forEach(u => { if (u && typeof u.id !== 'undefined') m[u.id] = u; });
    return m;
  }, [usuarios]);

  // helpers para obter nomes 
  const getUsuarioNome = (usuarioId) => {
    if (chamadoSelecionado?.usuario_nome) return chamadoSelecionado.usuario_nome;
    if (usuarioId && usuariosMap[usuarioId]) return usuariosMap[usuarioId].nome;
    return 'Nome não encontrado';
  };

  // const getTecnicoNome = (tecnicoId) => {
  //   if (chamadoSelecionado?.tecnico_nome) return chamadoSelecionado.tecnico_nome;
  //   if (tecnicoId && usuariosMap[tecnicoId]) return usuariosMap[tecnicoId].nome;
  //   return 'Nenhum técnico/auxiliar atribuído.';
  // };
  const getTecnicoNome = (tecnicoId) => {
  // preferir lookup por id (garante nome correto quando usuariosMap contém o usuário)
  if (tecnicoId && usuariosMap[tecnicoId]) return usuariosMap[tecnicoId].nome;
  if (chamadoSelecionado?.tecnico_nome) return chamadoSelecionado.tecnico_nome;
  return 'Nenhum técnico/auxiliar atribuído.';
};


  const getTipoServicoTitulo = (tipoId) => {
    if (chamadoSelecionado?.tipo_titulo) return chamadoSelecionado.tipo_titulo;
    return mapaTipoIdParaTitulo[tipoId] || 'Tipo não informado';
  };

  // sempre que abrir a edição para um chamado, inicializa usuarioAtribuido com o técnico já salvo (se houver)
  useEffect(() => {
    if (!isEditing) return;

    // se já existe um usuário atribuído no chamado selecionado, tenta encontrá-lo na lista carregada
    const tecnicoId = chamadoSelecionado?.tecnico_id;
    if (tecnicoId) {
      // tenta encontrar na lista de usuários filtrados (ou na lista global de usuarios, se existir)
      const user =
        (Array.isArray(usuariosFiltrados) && usuariosFiltrados.find(u => Number(u.id) === Number(tecnicoId)))
        || (Array.isArray(usuarios) && usuarios.find(u => Number(u.id) === Number(tecnicoId))); // usuarios é opcional
      if (user) {
        setUsuarioAtribuido(user);
        setUsuarioSelecionado(user.id);
        setFormData(prev => ({ ...prev, tecnico_id: Number(user.id) }));
      } else {
        // se não encontrou no cache, limpa (opcional: você pode buscar o usuário via API aqui)
        setUsuarioAtribuido(null);
        setUsuarioSelecionado(null);
      }
    } else {
      // sem técnico no chamado
      setUsuarioAtribuido(null);
      setUsuarioSelecionado(null);
    }
  }, [isEditing, chamadoSelecionado, usuariosFiltrados /*, usuarios se existir */]);

  // Função para atribuir técnico/auxiliar ao chamado selecionado
  // const handleAtribuirChamado = async (tecnicoId) => {
  //   if (!chamadoSelecionado) return;

  //   try {
  //     const res = await fetch("http://localhost:8080/atribuir-tecnico", {
  //       method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chamadoId: chamadoSelecionado.id, tecnicoId, }), credentials: "include"
  //     });

  //     if (!res.ok) throw new Error("Erro ao atribuir chamado");

  //     // Atualiza o chamado no estado
  //     setChamados((prev) => prev.map((c) => c.id === chamadoSelecionado.id ? { ...c, tecnico_id: tecnicoId } : c));

  //     setChamadoSelecionado((prev) => ({ ...prev, tecnico_id: tecnicoId, })); // Atualiza também o chamadoSelecionado

  //     showToast("success", "Chamado atribuído com sucesso!");
  //   } catch (err) {
  //     console.error("Erro ao atribuir chamado:", err);
  //     showToast("danger", "Falha ao atribuir chamado.");
  //   }
  // };
  const handleAtribuirChamado = async (tecnicoId) => {
  if (!chamadoSelecionado) return null;

  try {
    const res = await fetch("http://localhost:8080/atribuir-tecnico", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chamadoId: chamadoSelecionado.id, tecnicoId }),
      credentials: "include"
    });
    if (!res.ok) throw new Error("Erro ao atribuir chamado");

    // procura o usuário no mapa/lista para obter o nome
    const user = usuariosMap[tecnicoId] || usuarios.find(u => Number(u.id) === Number(tecnicoId)) || null;
    const nomeTecnico = user?.nome ?? null;

    // atualiza array e o selecionado com id + nome (mantém outros campos)
    setChamados(prev => prev.map(c => c.id === chamadoSelecionado.id ? { ...c, tecnico_id: tecnicoId, ...(nomeTecnico ? { tecnico_nome: nomeTecnico } : {}) } : c));
    setChamadoSelecionado(prev => prev ? ({ ...prev, tecnico_id: tecnicoId, ...(nomeTecnico ? { tecnico_nome: nomeTecnico } : {}) }) : prev);

    showToast("success", "Chamado atribuído com sucesso!");
    return true; // retorna algo útil para o chamador
  } catch (err) {
    console.error("Erro ao atribuir chamado:", err);
    showToast("danger", "Falha ao atribuir chamado.");
    throw err;
  }
};


  // sempre que abrir/selecionar um chamado, preenche o formData
  // useEffect(() => {
  //   if (chamadoSelecionado) {
  //     setFormData({
  //       prioridade_id: chamadoSelecionado.prioridade_id ?? '',
  //       tecnico_id: chamadoSelecionado.tecnico_id ?? "",
  //       tipo_id: chamadoSelecionado.tipo_id ?? "",
  //       descricao: chamadoSelecionado.descricao ?? "",
  //       assunto: chamadoSelecionado.assunto ?? "",
  //       status_chamado: chamadoSelecionado.status_chamado ?? "pendente",
  //       data_limite: chamadoSelecionado.data_limite ?? ''
  //     });
  //     setIsEditing(false); // start in read mode
  //   } else {
  //     setIsEditing(false);
  //     setFormData({ prioridade_id: "", tecnico_id: "", tipo_id: "", descricao: "", assunto: "", status_chamado: "", data_limite: '' });
  //   }
  // }, [chamadoSelecionado]);
  useEffect(() => {
    if (chamadoSelecionado) {
      setFormData({
        prioridade_id: chamadoSelecionado.prioridade_id ?? '',
        tecnico_id: chamadoSelecionado.tecnico_id ?? "",
        tipo_id: chamadoSelecionado.tipo_id ?? "",
        descricao: chamadoSelecionado.descricao ?? "",
        assunto: chamadoSelecionado.assunto ?? "",
        status_chamado: chamadoSelecionado.status_chamado ?? "pendente",
        data_limite: chamadoSelecionado.data_limite ?? ''
      });
    } else {
      setFormData({ prioridade_id: "", tecnico_id: "", tipo_id: "", descricao: "", assunto: "", status_chamado: "", data_limite: '' });
    }
  }, [chamadoSelecionado]);


  // handle change genérico
  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  // };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        value === ''
          ? '' // keep empty select as empty string
          : (name === 'prioridade_id' || name === 'tecnico_id' || name === 'tipo_id'
            ? Number(value)
            : value)
    }));
  };


  // salvar (PATCH)
  const handleSave = async () => {
    if (!chamadoSelecionado) return;
    const id = chamadoSelecionado.id;

    // construir payload com apenas os campos que mudaram (ou que tenham valor)
    // const payload = {};
    // const permitidos = ['prioridade_id', 'tecnico_id', 'tipo_id', 'descricao', 'assunto', 'status_chamado'];
    // for (const campo of permitidos) {
    //   // conversão para number em tecnico_id/tipo_id quando necessário
    //   const val = formData[campo];
    //   if (val !== undefined && val !== null && String(val) !== String(chamadoSelecionado[campo])) {
    //     if ((campo === 'tecnico_id' || campo === 'tipo_id' || campo === 'prioridade_id') && val !== "") {
    //       const num = Number(val);
    //       if (!Number.isNaN(num)) {
    //         payload[campo] = num;
    //       } else {
    //         // se por algum motivo val não é numérico, ignora o campo para não enviar NaN
    //         console.warn(`Campo ${campo} tem valor não numérico:`, val);
    //       }
    //     } else { payload[campo] = val; }
    //   }
    // }

    // if (Object.keys(payload).length === 0) {
    //   showToast("warning", 'Nenhuma alteração detectada.');
    //   setIsEditing(false);
    //   return;
    // }

    // // validação: se o novo status será 'concluido', exige um tecnico
    // // determine qual será o novo status após o PATCH (se o campo status_chamado foi alterado em payload)
    // const novoStatus = payload.status_chamado !== undefined ? payload.status_chamado : chamadoSelecionado?.status_chamado;
    // const tecnicoNoPayload = payload.tecnico_id !== undefined ? payload.tecnico_id : (formData.tecnico_id || chamadoSelecionado?.tecnico_id || (usuarioAtribuido && usuarioAtribuido.id));

    // if (novoStatus === 'concluido' && !tecnicoNoPayload) {
    //   // erro: não permitir salvar
    //   setTecnicoObrigatorioError(true);
    //   showToast('danger', 'Ao concluir um chamado, informe obrigatoriamente o técnico responsável.');
    //   // opcional: focar no botão de atribuir/abrir dropdown
    //   setOpenAtribuirDropdown(true);
    //   return;
    // }
    // construir payload com apenas os campos que mudaram (ou que tenham valor)
    const payload = {};
    const permitidos = ['prioridade_id', 'tecnico_id', 'tipo_id', 'descricao', 'assunto', 'status_chamado'];
    for (const campo of permitidos) {
      const val = formData[campo];
      const atual = chamadoSelecionado ? chamadoSelecionado[campo] : undefined;

      // Se o campo mudou (comparação segura)
      if (val !== undefined && val !== null && String(val) !== String(atual)) {
        // Para ids numéricos: aceitar número ou permitir remoção explícita ('') -> enviar null
        if (['tecnico_id', 'tipo_id', 'prioridade_id'].includes(campo)) {
          if (val === '' || val === null) {
            // inclusão explícita do campo com null sinaliza remoção para a API
            payload[campo] = null;
          } else {
            const num = Number(val);
            if (!Number.isNaN(num)) payload[campo] = num;
          }
        } else {
          // outros campos (texto, status, etc.)
          payload[campo] = val;
        }
      }
    }

    // Se não houver alterações detectadas
    if (Object.keys(payload).length === 0) {
      // showToast("warning", 'Nenhuma alteração detectada.');
      setIsEditing(false);
      return;
    }

    // // validação: se o novo status será 'concluido', exige um tecnico
    // const novoStatus = payload.hasOwnProperty('status_chamado') ? payload.status_chamado : chamadoSelecionado?.status_chamado;

    // // determinar o técnico final que será enviado / efetivamente salvo:
    // // prioridade: payload (pode ter null para remoção) -> formData (pode ser '' para remoção) -> chamadoSelecionado (valor atual)
    // let tecnicoFinal;
    // if (payload.hasOwnProperty('tecnico_id')) {
    //   tecnicoFinal = payload.tecnico_id; // pode ser number ou null
    // } else if (formData.hasOwnProperty('tecnico_id')) {
    //   tecnicoFinal = (formData.tecnico_id === '' ? null : formData.tecnico_id);
    // } else {
    //   tecnicoFinal = chamadoSelecionado?.tecnico_id ?? null;
    // }

    // // se estiver tentando concluir e não houver técnico definido -> erro e não envia
    // if ((String(novoStatus).trim().toLowerCase() === 'concluido') && (tecnicoFinal === null || tecnicoFinal === undefined || tecnicoFinal === "")) {
    //   setTecnicoObrigatorioError(true);
    //   showToast('danger', 'Ao concluir um chamado, informe obrigatoriamente o técnico responsável.');
    //   setOpenAtribuirDropdown(true);
    //   return;
    // }
    // Determina qual será o status após o PATCH (fonte: payload > chamadoSelecionado)
    const novoStatusRaw = payload.hasOwnProperty('status_chamado') ? payload.status_chamado : chamadoSelecionado?.status_chamado;
    const novoStatus = String(novoStatusRaw ?? '').trim().toLowerCase();

    // Determinar o técnico final que será enviado / efetivamente salvo:
    // prioridade: payload (pode ter null para remoção) -> formData ('' significa remoção) -> chamadoSelecionado (valor atual)
    let tecnicoFinal;
    if (payload.hasOwnProperty('tecnico_id')) {
      tecnicoFinal = payload.tecnico_id; // number ou null
    } else if (formData.hasOwnProperty('tecnico_id')) {
      tecnicoFinal = (formData.tecnico_id === '' ? null : formData.tecnico_id);
    } else {
      tecnicoFinal = chamadoSelecionado?.tecnico_id ?? null;
    }

    // Normaliza ausência
    const semTecnico = tecnicoFinal === null || tecnicoFinal === undefined || tecnicoFinal === "";

    // 1) Regras:
    // - Ao CONCLUIR: exige técnico (já existente logic).
    // - Em ANDAMENTO: não pode ficar sem técnico (novo requisito).
    if (novoStatus === 'concluido' && semTecnico) {
      setTecnicoObrigatorioError(true);
      showToast('danger', 'Ao concluir um chamado, informe obrigatoriamente o técnico responsável.');
      setOpenAtribuirDropdown(true);
      return;
    }

    if (novoStatus === 'em andamento' && semTecnico) {
      setTecnicoObrigatorioError(true);
      showToast('danger', 'Chamados em andamento precisam ter um técnico atribuído.');
      setOpenAtribuirDropdown(true);
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/chamado/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Falha ao salvar: ${res.status} ${res.statusText} ${text}`);
      }

      // atualizar o estado local com os novos valores
      const dadosAtualizados = { ...payload };
      setChamados((prev) => prev.map(c => c.id === id ? { ...c, ...payload } : c));
      setChamadoSelecionado((prev) => ({ ...prev, ...payload }));
      setIsEditing(false);

      if (payload.tipo_id) { dadosAtualizados.tipo_titulo = mapaTipoIdParaTitulo[payload.tipo_id]; }

      setChamados((prev) => prev.map(c => c.id === id ? { ...c, ...dadosAtualizados } : c));
      setChamadoSelecionado((prev) => ({ ...prev, ...dadosAtualizados }));

      showToast("success", 'Chamado atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar chamado:', err);
      showToast("danger", 'Erro ao salvar alterações');
    }
  };

  // cancelar edição (recarrega os valores originais do chamado)
  const handleCancel = () => {
    if (chamadoSelecionado) {
      setFormData({
        prioridade_id: chamadoSelecionado.prioridade_id ?? '',
        tecnico_id: chamadoSelecionado.tecnico_id ?? "",
        tipo_id: chamadoSelecionado.tipo_id ?? "",
        descricao: chamadoSelecionado.descricao ?? "",
        assunto: chamadoSelecionado.assunto ?? "",
        status_chamado: chamadoSelecionado.status_chamado ?? "pendente",
        data_limite: chamadoSelecionado.data_limite ?? ''
      });
    }
    setIsEditing(false);
  };

  function formatarLabel(str) {
    const texto = str.replace(/_/g, ' ').toLowerCase();

    const correcoes = { "auxiliar limpeza": "Auxiliar de Limpeza", "apoio tecnico": "Apoio Técnico", "tecnico": "Técnico", "manutencao": "Manutenção", 'media': 'Média' };

    if (correcoes[texto]) { return correcoes[texto]; }

    // capitaliza cada palavra caso não tenha uma correção personalizada
    return texto
      .split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  }

  return (
    <>{/* conteudo da pagina */}
      {ToastsUI}
      <div className="p-4 w-full dark:bg-gray-900">
        <div className="p-4 mt-14">
          <div className='flex flex-row flex-wrap gap-6 w-full justify-between  mb-15'>
            <div className="w-fit items-center flex flex-row flex-wrap">
              {/* select */}
              <OrdenarPor ordenarPor={ordenarPor} setOrdenarPor={setOrdenarPor} />

              <div className="mx-4 border-x border-gray-200 h-10 dark:border-gray-700"></div>

              {/* Dropdown de Prioridade */}
              <div ref={prioridadeRef} className="relative inline-block">
                <button onClick={() => setDropdownPrioridadeAberto(!dropdownPrioridadeAberto)} className="cursor-pointer text-white bg-violet-700 hover:bg-violet-800 focus:ring-4 focus:outline-none focus:ring-violet-300 poppins-medium rounded-lg text-sm px-8 py-2.5 text-center inline-flex items-center dark:bg-violet-600 dark:hover:bg-violet-700 dark:focus:ring-violet-800" type="button" id="dropdownPrioridadeButton">
                  Prioridade
                  <svg className="w-2.5 h-2.5 ms-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" /></svg>
                </button>
                {/* {dropdownPrioridadeAberto && (
                  <div id="dropdownPrioridade" className="absolute z-10 mt-2 bg-white dark:bg-gray-700 divide-y divide-gray-100 rounded-lg shadow-sm w-48">
                    <ul className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-100" aria-labelledby="dropdownPrioridadeButton">
                      {prioridades.map((prioridade, index) => (
                        <li key={index}>
                          <div className="flex p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600 hover:cursor-pointer">
                            <div className="flex items-center h-5">
                              <input id={`prioridade-checkbox-${index}`} type="checkbox" name="prioridade" value={prioridade.value} checked={prioridadesSelecionadas.includes(prioridade.value)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const valor = prioridade.value;
                                  if (checked) { setPrioridadesSelecionadas((prev) => [...prev, valor]); }
                                  else { setPrioridadesSelecionadas((prev) => prev.filter((p) => p !== valor)); }
                                }} className="hover:cursor-pointer w-4 h-4 text-violet-500 bg-gray-100 border-gray-300 rounded-sm focus:ring-[#E6DAFF] focus:ring-2 " />
                            </div>
                            <div className="ms-2 text-sm"><label htmlFor={`prioridade-checkbox-${index}`} className="hover:cursor-pointer poppins-medium text-gray-900 dark:text-gray-300">{prioridade.label}</label></div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )} */}
                {dropdownPrioridadeAberto && (
                  <div id="dropdownPrioridade" className="absolute z-10 mt-2 bg-white dark:bg-gray-700 divide-y divide-gray-100 rounded-lg shadow-sm w-48">
                    <ul className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-100" aria-labelledby="dropdownPrioridadeButton">
                      {prioridades.length === 0 ? (
                        <li className="px-3 py-2 text-xs text-gray-500">Nenhuma prioridade disponível.</li>
                      ) : (
                        prioridades.map((prioridade) => {
                          const idStr = String(prioridade.id);
                          const checked = prioridadesSelecionadas.includes(idStr); // armazenar ids como strings no array
                          return (
                            <li key={prioridade.id}>
                              <label className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600 hover:cursor-pointer">
                                <input
                                  id={`prioridade-checkbox-${prioridade.id}`}
                                  type="checkbox"
                                  name="prioridade"
                                  value={idStr}
                                  checked={checked}
                                  onChange={(e) => {
                                    const valor = e.target.value;
                                    if (e.target.checked) {
                                      setPrioridadesSelecionadas(prev => [...prev, valor]);
                                    } else {
                                      setPrioridadesSelecionadas(prev => prev.filter(p => p !== valor));
                                    }
                                  }}
                                  className="w-4 h-4 text-violet-500 bg-gray-100 border-gray-300 rounded-sm focus:ring-[#E6DAFF] focus:ring-2"
                                />
                                <div className="ms-2 text-sm poppins-medium text-gray-900 dark:text-gray-300">
                                  <div>{formatarLabel(prioridade.nome)}</div>
                                  <div className="text-xs text-gray-500">Prazo: {prioridade.horas_limite}h</div>
                                </div>
                              </label>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </div>
                )}

              </div>
              <div className="mx-4 border-x border-gray-200 h-10 dark:border-gray-700"></div>

              {/* dropdown de Setor */}
              <div ref={setorRef} className="relative inline-block">
                <button onClick={() => setDropdownSetorAberto(!dropdownSetorAberto)} className="cursor-pointer text-white bg-violet-700 hover:bg-violet-800 focus:ring-4 focus:outline-none focus:ring-violet-300 poppins-medium rounded-lg text-sm px-8 py-2.5 text-center inline-flex items-center dark:bg-violet-600 dark:hover:bg-violet-700 dark:focus:ring-violet-800 " type="button" id="dropdownHelperButton">
                  Setor
                  <svg className="w-2.5 h-2.5 ms-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" /></svg>
                </button>
                {dropdownSetorAberto && (
                  <div id="dropdownHelper" className="absolute z-10 mt-2 bg-white dark:bg-gray-700 divide-y divide-gray-100 rounded-lg shadow-sm w-60 ">
                    <ul className="p-3 space-y-1 text-sm text-gray-700  " aria-labelledby="dropdownHelperButton">
                      {tiposServico.length > 0 ? (
                        tiposServico.map((setor, index) => (
                          <li key={setor.id}>
                            <div className="flex p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                              <div className="flex items-center h-5">
                                <input id={`helper-checkbox-${index}`} type="checkbox" name="setor" value={setor.titulo} checked={setoresSelecionados.includes(setor.titulo)} onChange={(e) => {
                                  const checked = e.target.checked;
                                  const valor = setor.titulo;
                                  if (checked) { setSetoresSelecionados((prev) => [...prev, valor]); }
                                  else { setSetoresSelecionados((prev) => prev.filter((s) => s !== valor)); }
                                }} className="hover:cursor-pointer w-4 h-4 text-violet-500 bg-gray-100 border-gray-300 rounded-sm focus:ring-[#E6DAFF] focus:ring-2" />
                              </div>
                              <div className="ms-2 text-sm ">
                                <label htmlFor={`helper-checkbox-${index}`} className="hover:cursor-pointer poppins-medium text-gray-900 dark:text-gray-300">
                                  <div>{formatarLabel(setor.titulo.replace(/_/g, " "))}</div>
                                  <p className="text-xs poppins-regular text-gray-500">{setor.descricao || "Sem descrição"}</p>
                                </label>
                              </div>
                            </div>
                          </li>
                        ))
                      ) : (<li className="text-sm text-gray-500 px-3">Nenhum setor encontrado.</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            {/* Barra de pesquisa */}
            <form className="flex items-center" onSubmit={(e) => e.preventDefault()}>{/* evita recarregar a página */}
              <label htmlFor="simple-search" className="sr-only">Search</label>
              <div className="relative w-80">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2" /></svg>
                </div>
                <input type="text" id="simple-search" className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full ps-10 p-2.5" placeholder="Pesquisar chamado" value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
            </form>
          </div>
          <section>
            {/* Desktop: mostra suas tabs originais (sem mudar nada nelas) */}
            <div className="hidden md:block">
              <div className="flex flex-row items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700">
                <ul className="flex flex-wrap -mb-px text-sm poppins-medium text-center">
                  {statusAbas.map((status) => {
                    const statusId = normalizarId(status)
                    return (
                      <li className="me-2" role="presentation" key={status}>
                        <button
                          onClick={() => setAbaAtiva(statusId)}
                          className={`inline-block p-4 border-b-2 rounded-t-lg hover:text-violet-600 hover:border-violet-300 dark:hover:text-violet-600 dark:hover:border-violet-300 hover:cursor-pointer ${abaAtiva === statusId
                            ? "active border-[#7F56D8] text-[#7F56D8]"
                            : "border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 "
                            }`}
                          type="button"
                        >
                          {primeiraLetraMaiuscula(status)}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>

            {/* Mobile/Tablet: dropdown responsivo */}
            <div className="md:hidden relative mb-4" ref={dropdownRef}>
              <button
                onClick={() => setOpenAbas((v) => !v)}
                type="button"
                className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm
               text-gray-600 bg-white border-gray-300
               hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-[#F8FAFB]
               dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                {primeiraLetraMaiuscula(statusAbas.find((s) => normalizarId(s) === abaAtiva))}
                <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                </svg>
              </button>

              {openAbas && (
                <div className="absolute z-10 mt-1 w-40 min-w-max rounded-lg shadow-sm
                    bg-white border border-gray-200 divide-y divide-gray-100
                    dark:bg-gray-800 dark:border-gray-700">
                  <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                    {statusAbas.map((status) => {
                      const statusId = normalizarId(status)
                      return (
                        <li key={status}>
                          <button
                            onClick={() => { setAbaAtiva(statusId); setOpenAbas(false); }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100
                           dark:hover:bg-gray-700 dark:hover:text-white"
                          >
                            {primeiraLetraMaiuscula(status)}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div id="default-tab-content">
              {statusAbas.map((status) => {
                const statusId = normalizarId(status);

                // Primeiro filtra por status
                let filtradosPorStatus = status === "todos" ? chamados : chamados.filter((c) => normalizarId(c.status_chamado) === statusId);

                // // Depois aplica filtro de busca
                let chamadosFiltrados = filtradosPorStatus
                  .filter((c) => {
                    const correspondeBusca =
                      busca.trim() === "" ||
                      c.assunto.toLowerCase().includes(busca.toLowerCase()) || c.descricao.toLowerCase().includes(busca.toLowerCase()) || String(c.id).includes(busca);

                    const correspondeSetor = setoresSelecionados.length === 0 || setoresSelecionados.includes(mapaTipoIdParaTitulo[c.tipo_id]);

                    // const correspondePrioridade = prioridadesSelecionadas.length === 0 || prioridadesSelecionadas.includes(c.prioridade);
                    const prioridadeIdStr = String(c.prioridade_id ?? '');
                    const correspondePrioridade = prioridadesSelecionadas.length === 0 || prioridadesSelecionadas.includes(prioridadeIdStr);

                    return correspondeBusca && correspondeSetor && correspondePrioridade;
                  })
                  .sort((a, b) => {
                    const dataA = new Date(a.criado_em);
                    const dataB = new Date(b.criado_em);
                    return ordenarPor === "mais_antigo" ? dataA - dataB : dataB - dataA;
                  });

                return (
                  <div key={status} className={`${abaAtiva === statusId ? "grid" : "hidden"} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 `} >
                    {chamadosFiltrados.length === 0 ? (
                      <div className="p-4 md:p-5 "><p className="text-gray-500"> Nenhum chamado encontrado.</p></div>
                    ) : (chamadosFiltrados.map((chamado) => (
                      <div key={chamado.id} onClick={() => { setChamadoSelecionado(chamado); setIsOpen(true); }} className="justify-between p-4 md:p-5 flex flex-col bg-white border border-gray-200 border-t-4 border-t-violet-600 shadow-2xs rounded-xl dark:bg-gray-800 dark:border dark:border-gray-700 dark:border-neutral-700 dark:border-t-violet-500 dark:shadow-neutral-700/70 cursor-pointer hover:border-violet-500">
                        <div className="flex items-center gap-4 justify-between pt-2 pb-4 mb-4 border-b border-gray-200 dark:bg-gray-800 ">
                          <h3 className="text-base poppins-bold text-gray-800 dark:text-gray-200   ">{primeiraLetraMaiuscula(chamado.assunto)}</h3>
                          <button type="button" className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 poppins-medium rounded-full text-sm px-5 py-1 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-500 hover:cursor-pointer">{primeiraLetraMaiuscula(chamado.status_chamado)}</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 ">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-100 ">Usuário</p>
                            <p className="text-sm poppins-bold  dark:text-gray-200">{chamado?.usuario_nome || chamado?.nome_usuario || 'Nome não encontrado'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-100">Criado em</p>
                            <p className="text-sm poppins-bold  dark:text-gray-200">{new Date(chamado.criado_em).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-100">Prioridade</p>
                            {/* <p className="text-sm poppins-bold  dark:text-gray-200">{getPrioridadeLabel(chamado.prioridade_id)}</p> */}
                            <p className="text-sm poppins-bold  dark:text-gray-200">
                              {(() => {
                                const p = getPrioridadeById(chamado.prioridade_id);
                                return p ? `${formatarLabel(p.nome)}` : '-';
                              })()}
                            </p>

                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-100 ">Chamado ID</p>
                            <p className="text-sm poppins-bold  dark:text-gray-200">#{chamado.id}</p>
                          </div>
                        </div>
                      </div>
                    ))
                    )}
                  </div>
                );
              })}
            </div>
            {/* Drawer */}
            <div id="drawer-right-example" ref={chamadoModalContentRef} className={`fixed top-0 right-0 z-[50] h-screen p-4 pb-8 overflow-y-auto transition-transform border-l border-gray-200 dark:border-gray-600 bg-white w-80 dark:bg-gray-800 ${isOpen ? "translate-x-0" : "translate-x-full"}`} tabIndex="-1" aria-labelledby="drawer-right-label" >
              <h5 id="drawer-right-label" className="inline-flex items-center mb-4 text-base poppins-semibold text-gray-500">
                <svg className="w-4 h-4 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" /></svg>Detalhes do chamado</h5>
              <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center" >
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" /></svg>
                <span className="sr-only">Close menu</span>
              </button>
              <div>
                <p className="mb-2 text-sm text-gray-400 ">Usuário</p>
                <p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-300">{getUsuarioNome(chamadoSelecionado?.usuario_id)}</p>
              </div>
              <div>
                <p className="mb-2 text-sm text-gray-400 ">Criado em</p>
                <p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-200">{new Date(chamadoSelecionado?.criado_em).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}</p>
              </div>
              {/* Tipo de serviço -> select se estiver editando, senão texto */}
              <div>
                <p className="mb-2 text-sm text-gray-400 ">Tipo de serviço</p>
                {isEditing ? (
                  <>
                    <select id="tipo_id" name="tipo_id" value={formData.tipo_id ?? ""} onChange={handleChange} className="block w-full p-2 text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs focus:ring-violet-500 focus:border-violet-500">
                      <option value="">Selecione um tipo</option>
                      {tiposServico.map((t) => (<option key={t.id} value={t.id}>{formatarLabel(t.titulo.replace(/_/g, ' '))}</option>))}
                    </select>
                  </>) : (<p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-300">{formatarLabel(getTipoServicoTitulo(chamadoSelecionado?.tipo_id))}</p>
                )}
              </div>
              {/* Prioridade */}
              {/* <div>
                <p className="mb-2 text-sm text-gray-400 ">Prioridade</p>
                {isEditing ? (<>
                  <select id="prioridade_id" name="prioridade_id" value={formData.prioridade_id ?? ""} onChange={handleChange} className="block w-full p-2 text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs focus:ring-violet-500 focus:border-violet-500">
                    <option value="">Selecione uma prioridade</option>{Object.entries(prioridadeMap).map(([id, { label }]) => (<option key={id} value={id}> {label}</option>))}
                  </select>
                </>) : (
                  <p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-300">{formatarLabel(getPrioridadeLabel(chamadoSelecionado?.prioridade_id))}</p>
                )}
              </div> */}
              <div>
                <p className="mb-2 text-sm text-gray-400 ">Prioridade</p>

                {isEditing ? (
                  <>
                    <select
                      id="prioridade_id"
                      name="prioridade_id"
                      // armazenamos prioridade_id no formData como number ou "" quando vazio
                      value={formData.prioridade_id ?? ""}
                      onChange={handleChange}
                      className="block w-full p-2 text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs focus:ring-violet-500 focus:border-violet-500"
                    >
                      <option value="">Selecione uma prioridade</option>

                      {prioridades.length === 0 ? (
                        <option value="" disabled>Carregando prioridades...</option>
                      ) : (
                        prioridades.map((prioridade) => (
                          <option key={prioridade.id} value={prioridade.id}>
                            {formatarLabel(prioridade.nome)} — {prioridade.horas_limite}h
                          </option>
                        ))
                      )}
                    </select>
                  </>
                ) : (
                  // exibição quando não está editando: mostra nome e horas (se existir)
                  <p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-300">
                    {(() => {
                      const pid = chamadoSelecionado?.prioridade_id;

                      // sem prioridade atribuída
                      if (pid === undefined || pid === null || pid === '') {
                        return 'Prioridade não definida';
                      }

                      // prioridades ainda não carregadas do backend
                      if (!prioridades || prioridades.length === 0) {
                        return 'Carregando prioridades...';
                      }

                      // procura o objeto de prioridade no state dinâmico
                      const pObj = prioridades.find(p => Number(p.id) === Number(pid));

                      // mostra nome
                      if (pObj) return `${formatarLabel(pObj.nome)}`;

                      // fallback final
                      return 'Prioridade não definida';
                    })()}
                  </p>

                )}
              </div>

              {/* Assunto */}
              <div>
                <p className="mb-2 text-sm text-gray-400 ">Assunto</p>
                {isEditing ? (
                  <div>
                    <input type="text" id="assunto" name="assunto" value={formData.assunto ?? ""} onChange={handleChange} className="block w-full p-2 text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs focus:ring-violet-500 focus:border-violet-500" />
                  </div>
                ) : (<p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-300">{chamadoSelecionado?.assunto}</p>)}
              </div>

              {/* Descrição */}
              <div>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Descrição</p>
                {isEditing ? (
                  <div> <textarea id="descricao" name="descricao" rows="4" value={formData.descricao ?? ""} onChange={handleChange} className="block w-full p-2 text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs focus:ring-violet-500 focus:border-violet-500" /></div>
                ) : (<p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-300">{chamadoSelecionado?.descricao}</p>)}
              </div>
              <div>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Imagem</p>
                {chamadoSelecionado?.imagem ? (
                  <div className="mb-6">
                    <img src={`http://localhost:8080/uploads/${chamadoSelecionado.imagem}`} alt={`Anexo chamado #${chamadoSelecionado?.id}`} className="max-w-full max-h-48 object-contain rounded-md" />
                  </div>
                ) : (<p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-300">Nenhum anexo foi enviado para o chamado</p>)}
              </div>
              <div>
                <p className="mb-2 text-sm text-gray-400 ">Identificador do item (n° de patrimônio)</p>
                <p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-300">{chamadoSelecionado?.patrimonio}</p>
              </div>

              {/* Técnico / Atribuir */}
              <div className="mb-4">
                <p className="mb-2 text-sm text-gray-400">Técnico / Auxiliar</p>

                {isEditing ? (
                  <>
                    {/* caso exista um técnico atribuído: mostrar nome + botão Remover */}
                    {usuarioAtribuido ? (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-full">
                            {usuarioAtribuido.ftPerfil ? (
                              <img className="object-cover w-full h-full" src={`http://localhost:8080/uploads/${usuarioAtribuido.ftPerfil}`} alt={usuarioAtribuido.nome} />
                            ) : (
                              <svg className="absolute w-10 h-10 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                            )}
                          </div>

                          <div>
                            <div className="text-sm poppins-medium text-gray-900 dark:text-gray-300">{usuarioAtribuido.nome}</div>
                          </div>
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              // limpar usuario atribuido e liberar o campo para escolher outro (abre dropdown)
                              setUsuarioAtribuido(null);
                              setUsuarioSelecionado(null);
                              setFormData(prev => ({ ...prev, tecnico_id: '' })); // limpa campo no form
                              setOpenAtribuirDropdown(true); // abre dropdown para selecionar novo técnico
                            }}
                            className="py-1 px-3 text-xs poppins-medium rounded border bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-400"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ) : (
                      // sem técnico: mostrar botão Adicionar (abre dropdown)
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setOpenAtribuirDropdown(v => !v)}
                          aria-expanded={openAtribuirDropdown}
                          aria-controls="dropdownUsers"
                          className="mt-2 py-2 px-6 inline-flex items-center gap-x-1 text-xs poppins-medium rounded-full border border-dashed border-gray-200 bg-white text-gray-800 hover:bg-gray-50 focus:outline-none dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-500 dark:text-gray-300"
                        >
                          Adicionar
                        </button>
                      </div>
                    )}

                    {openAtribuirDropdown && (
                      <div id="dropdownUsers" className="z-10 bg-white dark:bg-gray-700 rounded-lg shadow-sm w-60 mt-2">
                        <ul className="h-48 py-2 overflow-y-auto text-gray-700 dark:text-gray-400">
                          {Array.isArray(usuariosFiltrados) && usuariosFiltrados.length > 0 ? (
                            usuariosFiltrados.map((u) => {
                              const selected = usuarioSelecionado === u.id;
                              return (
                                <li key={u.id}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setUsuarioSelecionado(u.id);
                                      setFormData(prev => ({ ...prev, tecnico_id: u.id }));
                                      setTecnicoObrigatorioError(false);
                                    }}
                                    className={`w-full text-left flex items-center px-4 py-2 focus:outline-none hover:bg-gray-100 dark:hover:bg-violet-500 ${selected ? "bg-violet-100 dark:bg-violet-400 text-violet-800" : ""}`}
                                  >
                                    <div className="relative w-8 h-8 overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-full mr-4">
                                      {u.ftPerfil ? (
                                        <img className="object-cover w-full h-full" src={`http://localhost:8080/uploads/${u.ftPerfil}`} alt={u.nome} />
                                      ) : (
                                        <svg className="absolute w-10 h-10 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                      )}
                                    </div>
                                    <span className="truncate text-sm">{u.nome}</span>
                                  </button>
                                </li>
                              );
                            })
                          ) : (
                            <li className="px-4 py-2 text-sm text-gray-500">Nenhum usuário disponível</li>
                          )}
                        </ul>

                        <div className="border-t border-gray-200">
                          <button
                            type="button"
                            // onClick={() => {
                            //   const user = usuariosFiltrados.find((u) => u.id === usuarioSelecionado);
                            //   if (user) {
                            //     setUsuarioAtribuido(user);
                            //     setFormData(prev => ({ ...prev, tecnico_id: user.id }));
                            //     setTecnicoObrigatorioError(false);
                            //   }
                            //   setOpenAtribuirDropdown(false);
                            // }}
                            // Replace this inline onClick handler (no dropdown) by the async version below
                            onClick={async () => {
                              const user = usuariosFiltrados.find((u) => u.id === usuarioSelecionado);
                              if (!user) {
                                setOpenAtribuirDropdown(false);
                                return;
                              }

                              try {
                                // chama a função existente que faz o PUT e já atualiza estado local
                                await handleAtribuirChamado(user.id);

                                // garantir preview/local state consistente (handleAtribuirChamado já faz isso, mas não custa reafirmar)
                                setUsuarioAtribuido(user);
                                setFormData(prev => ({ ...prev, tecnico_id: user.id }));
                                setTecnicoObrigatorioError(false);

                                // showToast("success", "Técnico atribuído e salvo no servidor.");
                              } catch (err) {
                                console.error("Erro ao atribuir técnico (botão):", err);
                                showToast("danger", "Não foi possível atribuir técnico no servidor.");
                              } finally {
                                setOpenAtribuirDropdown(false);
                              }
                            }}

                            disabled={!usuarioSelecionado}
                            className={`w-full px-4 py-3 text-sm poppins-medium ${usuarioSelecionado ? "text-violet-600 bg-gray-50 dark:bg-gray-400" : "text-gray-400 bg-gray-100 dark:bg-gray-600 cursor-not-allowed"}`}
                          >
                            Atribuir
                          </button>
                        </div>
                      </div>
                    )}

                    {tecnicoObrigatorioError && (
                      <p className="text-xs text-red-600 mt-2">Informe o técnico responsável para poder concluir o chamado.</p>
                    )}
                  </>
                ) : (
                  // visualização quando NÃO está editando
                  <>
                    {!chamadoSelecionado?.tecnico_id ? (
                      <div className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-300">Nenhum técnico/auxiliar atribuído.</div>
                    ) : (
                      <p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-300">{getTecnicoNome(chamadoSelecionado?.tecnico_id)}</p>
                    )}
                  </>
                )}
              </div>
              {/* -------- /Técnico -------- */}

              {/* ===== Finalizado em (aparece para concluídos ou em preview quando editar para 'concluido') ===== */}
              {(() => {
                // normaliza status vinda do form/chamado para comparação segura
                const formStatus = (typeof formData?.status_chamado !== 'undefined' && formData?.status_chamado !== null)
                  ? String(formData.status_chamado).trim().toLowerCase()
                  : '';
                const chamadoStatus = (typeof chamadoSelecionado?.status_chamado !== 'undefined' && chamadoSelecionado?.status_chamado !== null)
                  ? String(chamadoSelecionado.status_chamado).trim().toLowerCase()
                  : '';

                // Condições para renderizar:
                // 1) estamos editando e o form indica 'concluido' (preview)
                // 2) ou o chamado já está concluído e tem finalizado_em salvo
                const isEditingToConcluido = isEditing && formStatus === 'concluido';
                const isAlreadyConcluido = chamadoStatus === 'concluido' && !!chamadoSelecionado?.finalizado_em;

                if (!isEditingToConcluido && !isAlreadyConcluido) return null;

                // data finalizada: preferir valor salvo; se em edição e sem valor salvo, usar agora() como preview
                let finDate = null;
                if (chamadoSelecionado?.finalizado_em && !isEditingToConcluido) {
                  const finStr = chamadoSelecionado.finalizado_em;
                  const safeFin = (typeof finStr === 'string' && finStr.includes(' ') && !finStr.includes('T'))
                    ? `${finStr.replace(' ', 'T')}${finStr.endsWith('Z') ? '' : 'Z'}`
                    : finStr;
                  finDate = new Date(safeFin);
                } else {
                  // preview: momento atual (quando o admin marca 'concluido' no select)
                  finDate = new Date();
                }
                if (Number.isNaN(finDate.getTime())) return null;

                // obter deadline para comparação (usa dataLimitePreview se existir)
                const deadlineRaw = (typeof dataLimitePreview !== 'undefined') ? dataLimitePreview : calcularDataLimite(chamadoSelecionado);
                const deadline = deadlineRaw ? (deadlineRaw instanceof Date ? deadlineRaw : new Date(deadlineRaw)) : null;

                // determinar status (dentro/fora/sem prazo)
                let statusLabel = 'Sem data limite';
                let statusClass = 'bg-gray-200 text-gray-800';
                if (deadline && !Number.isNaN(deadline.getTime())) {
                  if (finDate.getTime() <= deadline.getTime()) {
                    statusLabel = 'Dentro do prazo';
                    statusClass = 'bg-emerald-100 text-emerald-800';
                  } else {
                    statusLabel = 'Fora do prazo';
                    statusClass = 'bg-red-100 text-red-800';
                  }
                }

                // calcular diferença (opcional)
                let deltaText = '';
                if (deadline && !Number.isNaN(deadline.getTime())) {
                  const diffMs = finDate.getTime() - deadline.getTime();
                  const absMin = Math.floor(Math.abs(diffMs) / 60000);
                  const hours = Math.floor(absMin / 60);
                  const minutes = absMin % 60;
                  if (hours > 0) deltaText = `${hours}h ${minutes}m`;
                  else if (minutes > 0) deltaText = `${minutes}m`;
                  else deltaText = 'agora';
                  deltaText = diffMs <= 0 ? `(${deltaText} adiantado)` : `(${deltaText} atrasado)`;
                }

                return (
                  <div className="mb-4 flex items-start gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">Finalizado em</p>
                      <p className="mb-1 text-sm poppins-bold text-gray-800 dark:text-gray-300">
                        {formatarDataHoraPtBr(finDate)}
                        {isEditingToConcluido && (
                          <span className="ml-2 text-xs text-gray-500 italic">(preview)</span>
                        )}
                      </p>
                    </div>

                    <div className="flex-shrink-0 mt-1 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${statusClass}`} title={deadline ? `Data limite: ${deadline ? formatarDataHoraPtBr(deadline) : '—'}` : 'Sem data limite'}>
                        {statusLabel}
                      </span>
                      {deltaText && <div className="text-xs text-gray-500 mt-1">{deltaText}</div>}
                    </div>
                  </div>
                );
              })()}
              {/* ===== /Finalizado em ===== */}


              {chamadoSelecionado?.status_chamado !== 'concluido' && (
                <div>
                  <p className="text-xs text-gray-400">Data limite</p>

                  {(() => {
                    // usa preview (useMemo) se existir, senão recalcula
                    const dataCalculada = typeof dataLimitePreview !== 'undefined'
                      ? dataLimitePreview
                      : calcularDataLimite(chamadoSelecionado);

                    if (!dataCalculada) {
                      return <p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-300">Chamado sem data limite.</p>;
                    }

                    const deadline = (dataCalculada instanceof Date) ? dataCalculada : new Date(dataCalculada);
                    if (Number.isNaN(deadline.getTime())) {
                      return <p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-300">Chamado sem data limite.</p>;
                    }

                    const agora = new Date();

                    // mostra "Prazo expirado" sempre que a deadline já passou
                    if (deadline.getTime() < agora.getTime()) {
                      return (
                        <p className="mb-6 text-sm poppins-bold text-red-600 dark:text-red-400">
                          Prazo expirado
                        </p>
                      );
                    }

                    // caso normal: mostra a data formatada
                    return (
                      <div className="mb-6">
                        <p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-300">
                          {formatarDataHoraPtBr(deadline)}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}
              {/* ===== /Data limite ===== */}

              {/* Status (select se editando) */}
              <div className="mb-4">
                {isEditing ? (
                  <><label htmlFor="status_chamado" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white ">Status</label>
                    <select id="status_chamado" name="status_chamado" value={formData.status_chamado ?? "pendente"} onChange={handleChange} className="block w-full p-2 text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs focus:ring-violet-500 focus:border-violet-500">
                      <option value="pendente">Pendente</option>
                      <option value="em andamento">Em andamento</option>
                      <option value="concluido">Concluído</option>
                    </select>
                  </>
                ) : (<></>)}
              </div>
              {/* Botões */}
              <div className="grid grid-cols-2 gap-2">
                {!isEditing ? (
                  <>
                    {["pendente", "em andamento"].includes(chamadoSelecionado?.status_chamado) ? (
                      <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm poppins-medium text-center text-[#7F56D8] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        Editar chamado
                      </button>
                    ) : (<p className="col-span-2 text-sm text-gray-500 italic">Chamados concluídos não podem ser editados. </p>
                    )}
                  </>
                ) : (
                  <>
                    <button onClick={handleSave} className="px-4 py-2 text-sm poppins-medium text-center text-white bg-violet-500 hover:bg-violet-600 rounded-lg">
                      Salvar
                    </button>
                    <button onClick={handleCancel} className="px-4 py-2 text-sm poppins-medium text-center text-gray-900 bg-white dark:bg-gray-700 dark:text-gray-300 dark:hover:text-gray-300 dark:hover:bg-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-[#7F56D8]">
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        </div >
      </div >
    </>
  )
}
