"use client"
import { useEffect, useState, useMemo } from "react";
import { initFlowbite } from 'flowbite';
import { useRouter } from 'next/navigation';
import OrdenarPor from '@/components/DropDown/DropDown.jsx';

export default function ChamadosAdmin() {
  const [isOpen, setIsOpen] = useState(false); // p drawer abrir e fechar
  const [isMounted, setIsMounted] = useState(false); // espera o componente estar carregado no navegador p evitar erros de renderizacao
  const [chamados, setChamados] = useState([]);// p selecionar os chamados com base no status
  const [abaAtiva, setAbaAtiva] = useState('todos');
  const [tiposServico, setTiposServico] = useState([]); // mostra os tipos de servicos/setores
  const [setoresSelecionados, setSetoresSelecionados] = useState([]); // guarda o tipo de servico selecionado
  const [busca, setBusca] = useState(""); // armazena o que htmlFor digitado no campo de busca
  const [dropdownSetorAberto, setDropdownSetorAberto] = useState(false);
  const [dropdownPrioridadeAberto, setDropdownPrioridadeAberto] = useState(false);
  const [prioridadesSelecionadas, setPrioridadesSelecionadas] = useState([]);
  const [ordenarPor, setOrdenarPor] = useState('mais_recente'); // ordenar por mais recente ou mais antigo, por padrao ele mostra os mais recentes primeiro
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosPorSetor, setUsuariosPorSetor] = useState({ tecnicos: [], auxiliares: [] });
  const [tipoServico, setTipoServico] = useState(""); // recebe do chamado
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [openAtribuirDropdown, setOpenAtribuirDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ prioridade: "", tecnico_id: "", tipo_id: "", descricao: "", assunto: "", status_chamado: "", data_limite: "" });

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

  // array com prioridade
  const prioridades = [{ label: 'Baixa', value: 'baixa' }, { label: 'Média', value: 'media' }, { label: 'Alta', value: 'alta' }];
  const prioridadeMap = { 1: { label: 'Baixa', value: 'baixa' }, 2: { label: 'Média', value: 'media' }, 3: { label: 'Alta', value: 'alta' } };

  const getPrioridadeLabel = (id) => { return prioridadeMap[id] ? prioridadeMap[id].label : 'Não definida'; };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    // Pegando os dados do formulário
    const formData = req.body;
    {/*ENVIO PARA O BACK*/ }
    try {
      const response = await fetch("http://localhost:8080/pool", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), credentials: "include"
      });

      const data = await response.json();
      setResposta(JSON.stringify(data, null, 2));

      //alert 
      if (response.ok) {
        alert("Setor cadastrada com sucesso!");
        setResposta(JSON.stringify(data, null, 2));
        form.reset(); // limpa o formulário
      }
      else { alert("Erro ao cadastrar setor."); }
    } catch (error) {
      console.error("Erro:", error);
      setResposta("Erro ao enviar os dados.");
    }
  };

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

  const getTecnicoNome = (tecnicoId) => {
    if (chamadoSelecionado?.tecnico_nome) return chamadoSelecionado.tecnico_nome;
    if (tecnicoId && usuariosMap[tecnicoId]) return usuariosMap[tecnicoId].nome;
    return 'Nenhum técnico/auxiliar atribuído.';
  };

  const getTipoServicoTitulo = (tipoId) => {
    if (chamadoSelecionado?.tipo_titulo) return chamadoSelecionado.tipo_titulo;
    return mapaTipoIdParaTitulo[tipoId] || 'Tipo não informado';
  };

  // Função para atribuir técnico/auxiliar ao chamado selecionado
  const handleAtribuirChamado = async (tecnicoId) => {
    if (!chamadoSelecionado) return;

    try {
      const res = await fetch("http://localhost:8080/atribuir-tecnico", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chamadoId: chamadoSelecionado.id, tecnicoId, }), credentials: "include"
      });

      if (!res.ok) throw new Error("Erro ao atribuir chamado");

      // Atualiza o chamado no estado
      setChamados((prev) => prev.map((c) => c.id === chamadoSelecionado.id ? { ...c, tecnico_id: tecnicoId } : c));

      // Atualiza também o chamadoSelecionado
      setChamadoSelecionado((prev) => ({ ...prev, tecnico_id: tecnicoId, }));

      alert("Chamado atribuído com sucesso!");
    } catch (err) {
      console.error("Erro ao atribuir chamado:", err);
      alert("Falha ao atribuir chamado.");
    }
  };

  // sempre que abrir/selecionar um chamado, preenche o formData
  useEffect(() => {
    if (chamadoSelecionado) {
      setFormData({
        prioridade_id: chamadoSelecionado.prioridade_id ?? 'none',
        tecnico_id: chamadoSelecionado.tecnico_id ?? "",
        tipo_id: chamadoSelecionado.tipo_id ?? "",
        descricao: chamadoSelecionado.descricao ?? "",
        assunto: chamadoSelecionado.assunto ?? "",
        status_chamado: chamadoSelecionado.status_chamado ?? "pendente",
        data_limite: chamadoSelecionado.data_limite ?? ''
      });
      setIsEditing(false); // start in read mode
    } else {
      setIsEditing(false);
      setFormData({ prioridade_id: "", tecnico_id: "", tipo_id: "", descricao: "", assunto: "", status_chamado: "", data_limite: '' });
    }
  }, [chamadoSelecionado]);

  // handle change genérico
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // salvar (PATCH)
  const handleSave = async () => {
    if (!chamadoSelecionado) return;
    const id = chamadoSelecionado.id;

    // construir payload com apenas os campos que mudaram (ou que tenham valor)
    const payload = {};
    const permitidos = ['prioridade_id', 'tecnico_id', 'tipo_id', 'descricao', 'assunto', 'status_chamado'];
    for (const campo of permitidos) {
      // conversão para number em tecnico_id/tipo_id quando necessário
      const val = formData[campo];
      if (val !== undefined && val !== null && String(val) !== String(chamadoSelecionado[campo])) {
        if ((campo === 'tecnico_id' || campo === 'tipo_id' || campo === 'prioridade_id') && val !== "") { payload[campo] = Number(val); }
        else { payload[campo] = val; }
      }
    }

    if (Object.keys(payload).length === 0) {
      alert('Nenhuma alteração detectada.');
      setIsEditing(false);
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

      alert('Chamado atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar chamado:', err);
      alert('Erro ao salvar alterações. Veja o console para detalhes.');
    }
  };

  // cancelar edição (recarrega os valores originais do chamado)
  const handleCancel = () => {
    if (chamadoSelecionado) {
      setFormData({
        prioridade_id: chamadoSelecionado.prioridade_id ?? 'none',
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

    const correcoes = { "auxiliar limpeza": "Auxiliar de Limpeza", "apoio tecnico": "Apoio Técnico", "tecnico": "Técnico", "manutencao": "Manutenção" };

    if (correcoes[texto]) { return correcoes[texto]; }

    // capitaliza cada palavra caso não tenha uma correção personalizada
    return texto
      .split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  }

  function formatarDataSimples(dataString) {
    if (!dataString) return '';
    return new Date(dataString).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  return (
    <>{/* conteudo da pagina */}
      <div className="p-4 w-full dark:bg-gray-900">
        <div className="p-4 mt-14">
          <div className='flex flex-row flex-wrap gap-6 w-full justify-between mb-15'>
            <div className="w-fit flex-wrap gap-4 flex flex-row ">
              {/* select */}
              <OrdenarPor ordenarPor={ordenarPor} setOrdenarPor={setOrdenarPor} />
              {/* dropdown de Setor */}
              <div className="relative inline-block">
                <button onClick={() => setDropdownSetorAberto(!dropdownSetorAberto)} className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-[#F8FAFB] focus:text-[#7F56D8] poppins-medium rounded-lg text-sm px-3 py-1.5" type="button" id="dropdownHelperButton">
                  Setor
                  <svg className="w-2.5 h-2.5 ms-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" /></svg>
                </button>
                {dropdownSetorAberto && (
                  <div id="dropdownHelper" className="absolute z-10 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-60 ">
                    <ul className="p-3 space-y-1 text-sm text-gray-700 " aria-labelledby="dropdownHelperButton">
                      {tiposServico.length > 0 ? (
                        tiposServico.map((setor, index) => (
                          <li key={setor.id}>
                            <div className="flex p-2 rounded-sm hover:bg-gray-100">
                              <div className="flex items-center h-5">
                                <input id={`helper-checkbox-${index}`} type="checkbox" name="setor" value={setor.titulo} checked={setoresSelecionados.includes(setor.titulo)} onChange={(e) => {
                                  const checked = e.target.checked;
                                  const valor = setor.titulo;
                                  if (checked) { setSetoresSelecionados((prev) => [...prev, valor]); }
                                  else { setSetoresSelecionados((prev) => prev.filter((s) => s !== valor)); }
                                }} className="w-4 h-4 text-[#7F56D8] bg-gray-100 border-gray-300 rounded-sm focus:ring-[#E6DAFF] focus:ring-2" />
                              </div>
                              <div className="ms-2 text-sm">
                                <label htmlFor={`helper-checkbox-${index}`} className="poppins-medium text-gray-900 ">
                                  <div>{formatarLabel(setor.titulo.replace(/_/g, " "))}</div>
                                  <p className="text-xs poppins-regular text-gray-500">{setor.descricao || "Sem descrição"}</p>
                                </label>
                              </div>
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-gray-500 px-3">Nenhum setor encontrado.</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Dropdown de Prioridade */}
              <div className="relative inline-block">
                <button onClick={() => setDropdownPrioridadeAberto(!dropdownPrioridadeAberto)} className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-[#F8FAFB] focus:text-[#7F56D8] poppins-medium rounded-lg text-sm px-3 py-1.5" type="button" id="dropdownPrioridadeButton">
                  Prioridade
                  <svg className="w-2.5 h-2.5 ms-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" /></svg>
                </button>
                {dropdownPrioridadeAberto && (
                  <div id="dropdownPrioridade" className="absolute z-10 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-48">
                    <ul className="p-3 space-y-1 text-sm text-gray-700" aria-labelledby="dropdownPrioridadeButton">
                      {prioridades.map((prioridade, index) => (
                        <li key={index}>
                          <div className="flex p-2 rounded-sm hover:bg-gray-100">
                            <div className="flex items-center h-5">
                              <input id={`prioridade-checkbox-${index}`} type="checkbox" name="prioridade" value={prioridade.value} checked={prioridadesSelecionadas.includes(prioridade.value)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const valor = prioridade.value;
                                  if (checked) { setPrioridadesSelecionadas((prev) => [...prev, valor]); }
                                  else { setPrioridadesSelecionadas((prev) => prev.filter((p) => p !== valor)); }
                                }} className="w-4 h-4 text-[#7F56D8] bg-gray-100 border-gray-300 rounded-sm focus:ring-[#E6DAFF] focus:ring-2 " />
                            </div>
                            <div className="ms-2 text-sm"><label htmlFor={`prioridade-checkbox-${index}`} className="poppins-medium text-gray-900">{prioridade.label}</label></div>
                          </div>
                        </li>
                      ))}
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
                  <svg className="w-4 h-4 text-gray-500 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2" />
                  </svg>
                </div>
                <input type="text" id="simple-search" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#7F56D8] focus:border-[#7F56D8] block w-full ps-10 p-2.5" placeholder="Pesquisar chamado" value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
            </form>
          </div>
          <section>
            <div className="flex flex-row items-center justify-between mb-4 border-b border-gray-200">
              <ul className="flex flex-wrap -mb-px text-sm poppins-medium text-center">
                {/* Tabs */}
                {statusAbas.map((status) => {
                  const statusId = normalizarId(status)
                  return (
                    <li className="me-2" role="presentation" key={status}>
                      <button onClick={() => setAbaAtiva(statusId)} className={`inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 ${abaAtiva === statusId ? "active border-[#7F56D8] text-[#7F56D8]" : "border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 "}`} type="button" >{primeiraLetraMaiuscula(status)}</button>
                    </li>
                  )
                })}
              </ul>
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
                      c.assunto.toLowerCase().includes(busca.toLowerCase()) ||
                      c.descricao.toLowerCase().includes(busca.toLowerCase()) || String(c.id).includes(busca);

                    const correspondeSetor = setoresSelecionados.length === 0 || setoresSelecionados.includes(mapaTipoIdParaTitulo[c.tipo_id]);

                    // const correspondePrioridade = prioridadesSelecionadas.length === 0 || prioridadesSelecionadas.includes(c.prioridade);
                    const prioridadeDoChamado = prioridadeMap[c.prioridade_id];
                    const correspondePrioridade = prioridadesSelecionadas.length === 0 || (prioridadeDoChamado && prioridadesSelecionadas.includes(prioridadeDoChamado.value));

                    return correspondeBusca && correspondeSetor && correspondePrioridade;
                  })
                  .sort((a, b) => {
                    const dataA = new Date(a.criado_em);
                    const dataB = new Date(b.criado_em);
                    return ordenarPor === "mais_antigo" ? dataA - dataB : dataB - dataA;
                  });

                return (
                  <div key={status} className={`${abaAtiva === statusId ? "grid" : "hidden"} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5`} >
                    {chamadosFiltrados.length === 0 ? (
                      <div className="p-4 md:p-5"><p className="text-gray-500"> Nenhum chamado encontrado.</p></div>
                    ) : (chamadosFiltrados.map((chamado) => (
                      <div key={chamado.id} onClick={() => { setChamadoSelecionado(chamado); setIsOpen(true); }} className="justify-between p-4 md:p-5 flex flex-col bg-white border border-gray-200 border-t-4 border-t-blue-600 shadow-2xs rounded-xl dark:bg-gray-800 dark:border dark:border-gray-700 dark:border-neutral-700 dark:border-t-blue-500 dark:shadow-neutral-700/70 cursor-pointer dark:hover:border-purple-500">
                        <div className="flex items-center gap-4 justify-between pt-2 pb-4 mb-4 border-b border-gray-200 dark:bg-gray-800 ">
                          <h3 className="text-base poppins-bold text-gray-800 dark:text-gray-200   ">{primeiraLetraMaiuscula(chamado.assunto)}</h3>
                          <button type="button" className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 poppins-medium rounded-full text-sm px-5 py-1 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-500 ">{primeiraLetraMaiuscula(chamado.status_chamado)}</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 ">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-100 ">Usuário</p>
                            <p className="text-sm poppins-bold  dark:text-gray-200">{chamado?.usuario_nome || chamado?.nome_usuario || 'Nome não encontrado'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-100">Criado em</p>
                            <p className="text-sm poppins-bold  dark:text-gray-200">{formatarDataSimples(chamado.criado_em)} </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-100">Prioridade</p>
                            <p className="text-sm poppins-bold  dark:text-gray-200">{getPrioridadeLabel(chamado.prioridade_id)}</p>
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
            <div id="drawer-right-example" className={`fixed top-0 right-0 z-99 h-screen p-4 overflow-y-auto transition-transform border-l border-gray-200 dark:border-neutral-700 bg-white w-80 dark:bg-gray-800 ${isOpen ? "translate-x-0" : "translate-x-full"}`} tabIndex="-1" aria-labelledby="drawer-right-label" >
              <h5 id="drawer-right-label" className="inline-flex items-center mb-4 text-base poppins-semibold text-gray-500">
                <svg className="w-4 h-4 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>Detalhes do chamado</h5>
              <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center" >
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span className="sr-only">Close menu</span>
              </button>
              <div>
                <p className="mb-2 text-sm text-gray-400 ">Usuário</p>
                <p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-300">{getUsuarioNome(chamadoSelecionado?.usuario_id)}</p>
              </div>
              {/* Tipo de serviço -> select se estiver editando, senão texto */}
              <div>
                <p className="mb-2 text-sm text-gray-400 ">Tipo de serviço</p>
                {isEditing ? (
                  <>
                    <select id="tipo_id" name="tipo_id" value={formData.tipo_id ?? ""} onChange={handleChange} className="block w-full p-2 mb-6 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50">
                      <option value="">Selecione um tipo</option>
                      {tiposServico.map((t) => (<option key={t.id} value={t.id}>{formatarLabel(t.titulo.replace(/_/g, ' '))}</option>))}
                    </select>
                  </>) : (<p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-300">{formatarLabel(getTipoServicoTitulo(chamadoSelecionado?.tipo_id))}</p>
                )}
              </div>

              {/* Prioridade */}
              <div>
                <p className="mb-2 text-sm text-gray-400 ">Prioridade</p>
                {isEditing ? (<>
                  <select id="prioridade_id" name="prioridade_id" value={formData.prioridade_id ?? ""} onChange={handleChange} className="block w-full p-2 mb-6 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50">
                    <option value="">Selecione uma prioridade</option>
                    {Object.entries(prioridadeMap).map(([id, { label }]) => (<option key={id} value={id}> {label}</option>))}
                  </select>
                </>) : (
                  <p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-300">{formatarLabel(getPrioridadeLabel(chamadoSelecionado?.prioridade_id))}</p>
                )}
              </div>

              {/* Assunto */}
              <div>
                <p className="mb-2 text-sm text-gray-400 ">Assunto</p>
                {isEditing ? (
                  <div>
                    <input type="text" id="assunto" name="assunto" value={formData.assunto ?? ""} onChange={handleChange} className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                ) : (<p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-300">{chamadoSelecionado?.assunto}</p>)}
              </div>
              
              {/* Descrição */}
              <div>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Descrição</p>
                {isEditing ? (
                  <div> <textarea id="descricao" name="descricao" rows="4" value={formData.descricao ?? ""} onChange={handleChange} className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500" /></div>
                ) : (<p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-300">{chamadoSelecionado?.descricao}</p>)}
              </div>
              <div>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Imagem</p>
                {chamadoSelecionado?.imagem ? (
                  <div className="mb-6">
                    <img src={chamadoSelecionado.imagem} alt={`Anexo chamado #${chamadoSelecionado?.id}`} className="max-w-full max-h-48 object-contain rounded-md" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/default-anexo.png"; }} />
                  </div>
                ) : (<p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-300">Nenhum anexo foi enviado para o chamado</p>)}
              </div>
              <div>
                <p className="mb-2 text-sm text-gray-400 ">Identificador do item (n° de patrimônio)</p>
                <p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-300">{chamadoSelecionado?.patrimonio}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Data limite</p>
                {chamadoSelecionado?.data_limite ? (
                <div className="mb-6">
                  <p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-300">{chamadoSelecionado?.data_limite}</p></div>
              ) : (<p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-300">Chamado sem data limite.</p>)}
              </div>
              {/* <div>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Técnico/Auxiliar</p>
                  <div className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-400">
                    {!chamadoSelecionado?.tecnico_id ? (
                      <><div>Nenhum técnico/auxiliar atribuído.</div>
                         botao que abre/fecha dropdown
                        <button onClick={() => setOpenAtribuirDropdown((v) => !v)}
                          aria-expanded={openAtribuirDropdown} aria-controls="dropdownUsers" className="mt-4 py-2 px-6 inline-flex items-center gap-x-1 text-xs poppins-medium rounded-full border border-dashed border-gray-200 bg-white text-gray-800 hover:bg-gray-50 focus:outline-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700">
                          <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                          Adicionar
                        </button>
                        {openAtribuirDropdown && (
                          <div id="dropdownUsers" className="z-10 bg-white rounded-lg shadow-sm w-60 dark:bg-gray-700 mt-2">
                            <ul className="h-48 py-2 overflow-y-auto text-gray-700 dark:text-gray-200">
                              {Array.isArray(usuariosFiltrados) && usuariosFiltrados.length > 0 ? (
                                usuariosFiltrados.map((u) => {
                                  const selected = usuarioSelecionado === u.id;
                                  return (
                                    <li key={u.id}>
                                      <button type="button" onClick={() => setUsuarioSelecionado(u.id)} className={`w-full text-left flex items-center px-4 py-2 focus:outline-none ${selected ? "bg-blue-100 dark:bg-blue-600 text-blue-800 dark:text-white": "hover:bg-gray-100 dark:hover:bg-gray-600" }`}>
                                        <img className="w-6 h-6 me-2 rounded-full" src={u.ftPerfil ? `http://localhost:8080/${u.ftPerfil}` : "/default-avatar.png"}alt={u.nome}/>
                                        <span className="truncate">{u.nome}</span> </button></li>
                                  ); })
                              ) : ( <li className="px-4 py-2 text-sm text-gray-500">Nenhum usuário disponível</li> )} </ul>
                            <div className="border-t border-gray-200">
                              <button type="button" onClick={async () => {
                                  // chama a função existente para atribuir e depois faz reset/fechamento
                                  await handleAtribuirChamado(usuarioSelecionado);
                                  // se atribuição bem-sucedida, handleAtribuirChamado já atualizou estados do chamado,
                                  // mas vamos garantir que dropdown fecha e seleção é limpa
                                  setOpenAtribuirDropdown(false); setUsuarioSelecionado(null);
                                }} disabled={!usuarioSelecionado} className={`w-full flex items-center justify-center gap-x-2 px-4 py-3 text-sm poppins-medium rounded-b-lg
                  ${usuarioSelecionado ? "text-blue-600 border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-blue-500"
                                    : "text-gray-400 border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-800 cursor-not-allowed" }`} >
                                <svg className="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                  <path d="M6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Zm11-3h-2V5a1 1 0 0 0-2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 0 0 2 0V9h2a1 1 0 1 0 0-2Z" />
                                </svg> Atribuir</button> </div> </div>
                        )} </> ) : ( <p>{getTecnicoNome(chamadoSelecionado?.tecnico_id)}</p>
                    )} </div></div> */}
              {/* Técnico / Atribuir */}
              <div>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Técnico/Auxiliar</p>
                <div className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-200">
                  {isEditing ? (
                    <>
                      <>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setOpenAtribuirDropdown((v) => !v)} aria-expanded={openAtribuirDropdown} aria-controls="dropdownUsers" className="mt-2 py-2 px-6 inline-flex items-center gap-x-1 text-xs poppins-medium rounded-full border border-dashed border-gray-200 bg-white text-gray-800 hover:bg-gray-50 focus:outline-none">
                            Adicionar
                          </button>
                        </div>
                        {openAtribuirDropdown && (
                          <div id="dropdownUsers" className="z-10 bg-white rounded-lg shadow-sm w-60 mt-2">
                            <ul className="h-48 py-2 overflow-y-auto text-gray-700">
                              {Array.isArray(usuariosFiltrados) && usuariosFiltrados.length > 0 ? (
                                usuariosFiltrados.map((u) => {
                                  const selected = usuarioSelecionado === u.id;
                                  return (
                                    <li key={u.id}>
                                      <button type="button" onClick={() => { setUsuarioSelecionado(u.id); setFormData(prev => ({ ...prev, tecnico_id: u.id })); }} className={`w-full text-left flex items-center px-4 py-2 focus:outline-none ${selected ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"}`}>
                                        <img className="w-6 h-6 me-2 rounded-full" src={u.ftPerfil ? `http://localhost:8080/${u.ftPerfil}` : "/default-avatar.png"} alt={u.nome} />
                                        <span className="truncate">{u.nome}</span>
                                      </button>
                                    </li>
                                  );
                                })
                              ) : (<li className="px-4 py-2 text-sm text-gray-500">Nenhum usuário disponível</li>)
                              }
                            </ul>
                            <div className="border-t border-gray-200">
                              <button type="button" onClick={() => {//fecha o dropdown e mantém a seleção em formData(o PATCH será feito pelo botão Salvar)
                                setOpenAtribuirDropdown(false);
                              }} disabled={!usuarioSelecionado} className={`w-full px-4 py-3 text-sm poppins-medium ${usuarioSelecionado ? "text-blue-600 bg-gray-50" : "text-gray-400 bg-gray-100 cursor-not-allowed"}`}>
                                Selecionar
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    </>
                  ) : (
                    <>
                      {!chamadoSelecionado?.tecnico_id ? (
                        <> <div>Nenhum técnico/auxiliar atribuído.</div>
                          {/* <button onClick={() => setOpenAtribuirDropdown((v) => !v)} aria-expanded={openAtribuirDropdown} aria-controls="dropdownUsers" className="mt-4 py-2 px-6 inline-flex items-center gap-x-1 text-xs poppins-medium rounded-full border border-dashed border-gray-200 bg-white text-gray-800 hover:bg-gray-50">
                            Adicionar</button> */}
                          {/* dropdown users (mantido do seu código) */}
                          {/* {openAtribuirDropdown && (
                            <div id="dropdownUsers" className="z-10 bg-white rounded-lg shadow-sm w-60 mt-2">
                              <ul className="h-48 py-2 overflow-y-auto text-gray-700">
                                {Array.isArray(usuariosFiltrados) && usuariosFiltrados.length > 0 ? (
                                  usuariosFiltrados.map((u) => { const selected = usuarioSelecionado === u.id;
                                    return (
                                      <li key={u.id}>
                                        <button type="button" onClick={() => setUsuarioSelecionado(u.id)} className={`w-full text-left flex items-center px-4 py-2 focus:outline-none ${selected ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"}`}>
                                          <img className="w-6 h-6 me-2 rounded-full" src={u.ftPerfil ? `http://localhost:8080/${u.ftPerfil}` : "/default-avatar.png"} alt={u.nome} />
                                          <span className="truncate">{u.nome}</span>
                                        </button>
                                      </li>
                                    );}) ) : (<li className="px-4 py-2 text-sm text-gray-500">Nenhum usuário disponível</li>)}
                              </ul>
                              <div className="border-t border-gray-200">
                                <button type="button" onClick={async () => { await handleAtribuirChamado(usuarioSelecionado); setOpenAtribuirDropdown(false); setUsuarioSelecionado(null); }} disabled={!usuarioSelecionado} className={`w-full px-4 py-3 text-sm poppins-medium ${usuarioSelecionado ? "text-blue-600 bg-gray-50" : "text-gray-400 bg-gray-100 cursor-not-allowed"}`}>
                                  Atribuir
                                </button>
                              </div>
                            </div>
                          )} */}
                        </>
                      ) : (<p>{getTecnicoNome(chamadoSelecionado?.tecnico_id)}</p>)}
                    </>
                  )}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm text-gray-400 ">Criado em</p>
                <p className="mb-6 text-sm poppins-bold text-gray-800 dark:text-gray-200">{formatarDataSimples(chamadoSelecionado?.criado_em)} </p>
              </div>
              {/* Status (select se editando) */}
              <div className="mb-4">
                {isEditing ? (
                  <><label htmlFor="status_chamado" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white ">Status</label>
                    <select id="status_chamado" name="status_chamado" value={formData.status_chamado ?? "pendente"} onChange={handleChange} className="block w-full p-2 mb-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:border-[#7F56D8]">
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
                      <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm poppins-medium text-center text-[#7F56D8] bg-white border border-gray-200 rounded-lg hover:bg-gray-100">
                        Editar chamado
                      </button>
                    ) : (<p className="col-span-2 text-sm text-gray-500 italic"> Chamados concluídos não podem ser editados. </p>
                    )}
                  </>
                ) : (
                  <>
                    <button onClick={handleSave} className="px-4 py-2 text-sm poppins-medium text-center text-white bg-[#7F56D8] rounded-lg">
                      Salvar
                    </button>
                    <button onClick={handleCancel} className="px-4 py-2 text-sm poppins-medium text-center text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-[#7F56D8]">
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
