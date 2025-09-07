"use client";
import { useState, useRef, useEffect } from "react";


export default function ChatWidget({ chamadoSelecionado, position = "bottom-right" }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [mensagens, setMensagens] = useState(null); // null = ainda não carregou
  const [conteudo, setConteudo] = useState("");
  const [loadingMensagens, setLoadingMensagens] = useState(false);
  const [isSending, setIsSending] = useState(false);
  // novo state para meta-dados do chamado vindo do endpoint /chat
  const [chamadoInfo, setChamadoInfo] = useState(null);


  // undefined = ainda não buscado, null = não autenticado, object = user
  const [currentUser, setCurrentUser] = useState(undefined);

  const listRef = useRef(null);

  const pos =
    position === "bottom-left"
      ? { button: "left-4 bottom-4", panel: "md:left-4 md:bottom-20" }
      : { button: "right-4 bottom-4", panel: "md:right-4 md:bottom-20" };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("http://localhost:8080/auth/check-auth", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        setCurrentUser(null);
        return null;
      }
      const userObj = data.user || (data.authenticated ? data : null);
      if (!userObj || !userObj.id) {
        setCurrentUser(null);
        return null;
      }
      const mapped = { id: Number(userObj.id), role: String(userObj.funcao || userObj.role || "").toLowerCase() };
      setCurrentUser(mapped);
      return mapped;
    } catch (err) {
      console.error("[Chat] erro fetchCurrentUser:", err);
      setCurrentUser(null);
      return null;
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // --- fetch mensagens (sempre atualiza a lista; polling leve) ---
  // useEffect(() => {
  //   let mounted = true;
  //   if (!chamadoSelecionado?.id) {
  //     setMensagens(null);
  //     return;
  //   }

  //   const fetchMensagens = async () => {
  //     if (!chamadoSelecionado?.id) return;
  //     setLoadingMensagens(true);
  //     try {
  //       const res = await fetch(`http://localhost:8080/chat?idChamado=${chamadoSelecionado.id}`, {
  //         method: "GET",
  //         credentials: "include",
  //       });
  //       if (!res.ok) throw new Error("Erro ao buscar mensagens");
  //       const data = await res.json();
  //       if (!mounted) return;
  //       setMensagens(Array.isArray(data.mensagens) ? data.mensagens : []);
  //     } catch (err) {
  //       console.error("[Chat] Erro ao buscar mensagens:", err);
  //     } finally {
  //       if (mounted) setLoadingMensagens(false);
  //     }
  //   };

  //   // initial + interval
  //   fetchMensagens();
  //   const interval = setInterval(fetchMensagens, 5000);
  //   return () => { mounted = false; clearInterval(interval); };
  // }, [chamadoSelecionado]);
  useEffect(() => {
    let mounted = true;
    // limpa estados quando não houver chamado selecionado
    if (!chamadoSelecionado?.id) {
      setMensagens(null);
      setChamadoInfo(null);
      return;
    }

    const fetchMensagens = async () => {
      if (!chamadoSelecionado?.id) return;
      setLoadingMensagens(true);
      try {
        const res = await fetch(`http://localhost:8080/chat?idChamado=${chamadoSelecionado.id}`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Erro ao buscar mensagens");
        const data = await res.json();

        if (!mounted) return;
        // mensagens: tolerante (data.mensagens ou data.messages ou data)
        const msgs = Array.isArray(data.mensagens)
          ? data.mensagens
          : Array.isArray(data.messages)
            ? data.messages
            : Array.isArray(data)
              ? data
              : [];

        setMensagens(msgs);
        // guarda o objeto chamado retornado pelo backend (opcional, mas importante)
        setChamadoInfo(data.chamado ?? null);
      } catch (err) {
        console.error("[Chat] Erro ao buscar mensagens:", err);
      } finally {
        if (mounted) setLoadingMensagens(false);
      }
    };

    // initial + interval
    fetchMensagens();
    const interval = setInterval(fetchMensagens, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, [chamadoSelecionado]);


  // --- polling só para contar não-lidas: roda APENAS quando houver chamado selecionado e o painel estiver FECHADO ---
  useEffect(() => {
    let mounted = true;
    // só faz polling quando houver chamadoSelecionado, currentUser conhecido e painel fechado
    if (!chamadoSelecionado?.id || currentUser === undefined || open) {
      // se painel aberto, badge fica zerado (pois marcamos lidas)
      if (open) setUnread(0);
      return;
    }

    const fetchNaoLidas = async () => {
      try {
        // garante usuário conhecido
        if (currentUser === undefined) await fetchCurrentUser();
        if (!currentUser || !chamadoSelecionado?.id) {
          if (mounted) setUnread(0);
          return;
        }
        const url = `http://localhost:8080/mensagens/nao-lidas?idChamado=${encodeURIComponent(chamadoSelecionado.id)}`;
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) {
          console.warn("[Chat] fetchNaoLidas não-ok:", res.status);
          if (mounted) setUnread(0);
          return;
        }
        const data = await res.json().catch(() => ({ naoLidas: 0 }));
        if (mounted) setUnread(Number(data.naoLidas || 0));
      } catch (err) {
        console.error("[Chat] Erro fetchNaoLidas:", err);
        if (mounted) setUnread(0);
      }
    };

    fetchNaoLidas();
    const interval = setInterval(fetchNaoLidas, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, [chamadoSelecionado, currentUser, open]);

  // --- quando abrir o painel, marcar mensagens como lidas PARA ESTE USUÁRIO e zerar badge ---
  useEffect(() => {
    let mounted = true;
    if (!open || !chamadoSelecionado?.id || !currentUser || !currentUser.id) return;

    const marcarComoLidas = async () => {
      try {
        const res = await fetch("http://localhost:8080/mensagens/marcar-lidas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ idChamado: chamadoSelecionado.id }),
        });
        if (!res.ok) {
          console.warn("[Chat] marcar-lidas não-ok", res.status);
        } else {
          // atualizar lista imediatamente
          const updated = await fetch(`http://localhost:8080/chat?idChamado=${chamadoSelecionado.id}`, {
            method: "GET",
            credentials: "include",
          });
          // if (updated.ok) {
          //   const data = await updated.json();
          //   if (mounted) setMensagens(Array.isArray(data.mensagens) ? data.mensagens : []);
          // }
          if (updated.ok) {
            const data = await updated.json();
            if (mounted) {
              const msgs = Array.isArray(data.mensagens)
                ? data.mensagens
                : Array.isArray(data.messages)
                  ? data.messages
                  : Array.isArray(data)
                    ? data
                    : [];
              setMensagens(msgs);
              setChamadoInfo(data.chamado ?? null);
            }
          }
          if (mounted) setUnread(0);
        }
      } catch (err) {
        console.error("[Chat] Erro marcarComoLidas:", err);
      }
    };

    marcarComoLidas();
    return () => { mounted = false; };
  }, [open, chamadoSelecionado, currentUser]);

  // rolar ao final quando abrir/já possuir mensagens
  useEffect(() => {
    if (open) {
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 80);
    }
  }, [open, mensagens]);

  // helper: decide se a mensagem é do usuário logado (tolerante strings/numbers)
  const isMessageMine = (msg) => {
    if (!currentUser || !currentUser.id) return false;
    const myId = Number(currentUser.id);
    const msgTecnico = msg.id_tecnico !== null && msg.id_tecnico !== undefined ? Number(msg.id_tecnico) : null;
    const msgUsuario = msg.id_usuario !== null && msg.id_usuario !== undefined ? Number(msg.id_usuario) : null;
    return msgTecnico === myId || msgUsuario === myId;
  };

  // enviar mensagem -> usa endpoint unificado /mensagem
  const enviarMsg = async (e) => {
    e?.preventDefault();
    if (!conteudo.trim() || !chamadoSelecionado?.id) return;
    if (isSending) return;
    if (currentUser === undefined) {
      await fetchCurrentUser();
    }
    if (!currentUser || !currentUser.id) return;

    setIsSending(true);
    const endpoint = "http://localhost:8080/mensagem";
    const payload = { idChamado: chamadoSelecionado.id, conteudoMsg: conteudo };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      let body;
      try {
        const contentType = res.headers.get("content-type") || "";
        body = contentType.includes("application/json") ? await res.json() : await res.text();
      } catch (parseErr) {
        body = null;
      }

      if (res.status === 401) {
        setCurrentUser(null);
        throw new Error("Não autenticado");
      }
      if (!res.ok) {
        const errMsg = (body && (body.erro || body.error || body.message)) || "Erro ao enviar mensagem";
        throw new Error(errMsg);
      }

      // sucesso -> atualizar mensagens
      const updated = await fetch(`http://localhost:8080/chat?idChamado=${chamadoSelecionado.id}`, {
        method: "GET",
        credentials: "include",
      });
      // if (updated.ok) {
      //   const data = await updated.json();
      //   setMensagens(Array.isArray(data.mensagens) ? data.mensagens : []);
      // }
      if (updated.ok) {
        const data = await updated.json();
        const msgs = Array.isArray(data.mensagens)
          ? data.mensagens
          : Array.isArray(data.messages)
            ? data.messages
            : Array.isArray(data)
              ? data
              : [];
        setMensagens(msgs);
        setChamadoInfo(data.chamado ?? null);
      }
      setConteudo("");
      // se painel fechado, incrementa badge (porque a outra ponta pode não ter lido) — melhor deixar servidor controlar via polling
      // então não mexemos em unread aqui; polling irá atualizar
    } catch (err) {
      console.error("[Chat] Erro ao enviar mensagem (front):", err);
    } finally {
      setIsSending(false);
    }
  };

const getInterlocutorName = () => {
  const isTech = !!currentUser?.role && String(currentUser.role).toLowerCase().includes("tecnico");

  // 1) Priorizar o chamadoInfo vindo do backend (se houver)
  if (chamadoInfo) {
    // alias que usamos no backend: chamado_usuario_nome / chamado_tecnico_nome
    if (isTech) {
      const nome = (chamadoInfo.chamado_usuario_nome ?? chamadoInfo.usuario_nome ?? chamadoInfo.usuario_nome_full ?? "");
      if (String(nome).trim()) return String(nome).trim();
    } else {
      const nome = (chamadoInfo.chamado_tecnico_nome ?? chamadoInfo.tecnico_nome ?? chamadoInfo.tecnico_nome_full ?? "");
      if (String(nome).trim()) return String(nome).trim();
    }
  }

  // 2) Fallback: olhar no chamadoSelecionado (props) se tiver campos nome
  if (chamadoSelecionado) {
    if (isTech) {
      const nome = `${chamadoSelecionado.usuario_nome ?? ""} ${chamadoSelecionado.usuario_sobrenome ?? ""}`.trim();
      if (nome) return nome;
      if (chamadoSelecionado.usuario_id) return String(chamadoSelecionado.usuario_id); // fallback mínimo
    } else {
      const nome = `${chamadoSelecionado.tecnico_nome ?? ""} ${chamadoSelecionado.tecnico_sobrenome ?? ""}`.trim();
      if (nome) return nome;
      if (chamadoSelecionado.tecnico_id) return String(chamadoSelecionado.tecnico_id);
    }
  }

  // 3) Buscar nas mensagens (última mensagem com nome preenchido)
  if (Array.isArray(mensagens) && mensagens.length > 0) {
    for (let i = mensagens.length - 1; i >= 0; i--) {
      const m = mensagens[i];
      if (isTech) {
        const nome = (m.m_usuario_nome ?? m.usuario_nome ?? `${m.usuario_nome ?? ""} ${m.usuario_sobrenome ?? ""}`).trim();
        if (nome) return nome;
      } else {
        const nome = (m.m_tecnico_nome ?? m.tecnico_nome ?? `${m.tecnico_nome ?? ""} ${m.tecnico_sobrenome ?? ""}`).trim();
        if (nome) return nome;
      }
    }
  }

  // 4) fallback final
  return "Chat";
};

// retorna a url do avatar do interlocutor (ou null)
const getInterlocutorAvatarUrl = () => {
  const isTech = !!currentUser?.role && String(currentUser.role).toLowerCase().includes("tecnico");

  // 1) priorizar chamadoInfo vindo do backend (tem os aliases que definimos)
  if (chamadoInfo) {
    if (isTech) {
      const ft = chamadoInfo.chamado_usuario_ftPerfil ?? null;
      if (ft) return buildAvatarUrl(ft);
    } else {
      const ft = chamadoInfo.chamado_tecnico_ftPerfil ?? null;
      if (ft) return buildAvatarUrl(ft);
    }
  }

  // 2) fallback para chamadoSelecionado (props) — caso você já tenha ftPerfil ali
  if (chamadoSelecionado) {
    if (isTech) {
      const ft = chamadoSelecionado.usuario_ftPerfil ?? chamadoSelecionado.usuario_ftperfil ?? null;
      if (ft) return buildAvatarUrl(ft);
    } else {
      const ft = chamadoSelecionado.tecnico_ftPerfil ?? chamadoSelecionado.tecnico_ftperfil ?? null;
      if (ft) return buildAvatarUrl(ft);
    }
  }

  // 3) fallback nas mensagens (ultima mensagem que tiver ft)
  if (Array.isArray(mensagens) && mensagens.length > 0) {
    for (let i = mensagens.length - 1; i >= 0; i--) {
      const m = mensagens[i];
      const ftUser = m.m_usuario_ftPerfil ?? m.usuario_ftPerfil ?? m.usuario_ftperfil;
      const ftTech = m.m_tecnico_ftPerfil ?? m.tecnico_ftPerfil ?? m.tecnico_ftperfil;
      if (isTech && ftUser) return buildAvatarUrl(ftUser);
      if (!isTech && ftTech) return buildAvatarUrl(ftTech);
    }
  }

  return null;
};

// helper para construir a URL pública do avatar
const buildAvatarUrl = (ftValue) => {
  // se ftValue já for URL absoluta, retorna direto
  if (typeof ftValue === "string" && (ftValue.startsWith("http://") || ftValue.startsWith("https://"))) {
    return ftValue;
  }
  // caso armazene apenas o nome do arquivo, combine com a pasta pública do servidor
  // ajuste '/uploads' para o path real onde as imagens ficam servidas
  return `http://localhost:8080/uploads/${encodeURIComponent(String(ftValue))}`;
};

  return (
    <>
      {/* Janela de chat */}
      {/* <div
        className={[
          "fixed z-50 w-full md:w-[92vw] max-w-sm rounded-2xl border border-gray-200",
          "bg-white shadow-xl dark:bg-zinc-900 dark:border-gray-500 ",
          "transition-all duration-200",
          pos.panel,
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
        ].join(" ")}
      > */}
      {/* <div
  className={[
    // comportamento mobile: ocupa toda a viewport
    "fixed z-60 inset-0 md:inset-auto",

    // largura em mobile: full; em md volta para 92vw / max-w-sm
    "w-full md:w-[92vw] md:max-w-sm",

    // posicionamento em md (reposição do seu pos.panel)
    "md:right-4 md:bottom-20",

    // bordas: sem arredondamento em mobile, com arredondamento em md
    "rounded-none md:rounded-2xl",

    // estilos visuais
    "border border-gray-200 bg-white shadow-xl dark:bg-gray-800 dark:border-gray-500",

    // transições e transformadas: em mobile fechar -> translate-y-full (sai por baixo)
    "transition-all duration-200",

    // controle de abertura/fechamento (diferencia desktop/mobile para o translate)
    open
      ? "opacity-100 translate-y-0"
      : "opacity-0 md:translate-y-2 translate-y-full pointer-events-none",

    // garantir overflow para o conteúdo interno
    "overflow-hidden"
  ].join(" ")}
> */}
   <div
        className={[
          "fixed w-full h-full md:h-auto z-60 md:w-[92vw] md:max-w-sm rounded-2xl border border-gray-200",
          "bg-white shadow-xl dark:bg-gray-900 dark:border-gray-500 ",
          "transition-all duration-200",
          // "right-0 left-0 bottom-0",
          pos.panel,
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
        ].join(" ")}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-t-2xl">
          <div className="flex items-center gap-3">
    {/* Avatar */}
    {(() => {
      const avatarUrl = getInterlocutorAvatarUrl();
      if (avatarUrl) {
        return (
          <img
            src={avatarUrl}
            alt={`${getInterlocutorName()} avatar`}
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/img/default-avatar.png'; }}
          />
        );
      }
      // fallback com iniciais / ícone
      const name = getInterlocutorName();
      const initials = name && name !== 'Chat' ? name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : null;
      return (
        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-200">
          {initials || 'C'}
        </div>
      );
    })()}

    {/* Nome */}
    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-400">
      {getInterlocutorName()}
    </h2>
  </div>
          <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300">
            <span className="sr-only">Fechar</span>—
          </button>
        </div>

<div className="h-full">
{/* Mensagens */}
        {mensagens === null ? (
          <p className="p-3 text-gray-500">Carregando...</p>
        ) : (
          <div ref={listRef} className="h-9/10 md:h-72 overflow-y-auto p-3 space-y-2 text-sm dark:bg-gray-800">
            {mensagens.length === 0 && <div className="text-center text-xs text-gray-400">Sem mensagens</div>}

            {mensagens.map((msg, idx) => {
              const mine = isMessageMine(msg);
              return (
                <div key={idx} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={[
                      "px-3 py-2 rounded-2xl max-w-[75%] break-words",
                      mine ? "bg-violet-600 text-white rounded-br-none" : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:bg-zinc-800 dark:text-zinc-100 rounded-bl-none",
                    ].join(" ")}
                  >
                    {msg.conteudo}
                    <div className="text-[10px] opacity-70 mt-1 text-right">
                      {msg.data_envio ? new Date(msg.data_envio).toLocaleTimeString() : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Input */}
        <form onSubmit={enviarMsg} className="p-2 border-t border-gray-200 dark:border-gray-600 flex gap-2 dark:bg-gray-900 dark:text-white rounded-b-2xl">
          <input
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder="Digite uma mensagem…"
            className="flex-1 text-sm bg-transparent outline-none px-2"
          />
          <button
            type="submit"
            disabled={!conteudo.trim()}
            className="px-3 py-1 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
          >
            Enviar
          </button>
        </form>
</div>
        
      </div>

      {/* Bolha flutuante */}
      <button
        onClick={() => setOpen((s) => !s)}
        className={`fixed ${pos.button} z-50 h-14 w-14 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
          <path fillRule="evenodd" d="M5.337 21.718a6.707 6.707 0 0 1-.533-.074.75.75 0 0 1-.44-1.223 3.73 3.73 0 0 0 .814-1.686c.023-.115-.022-.317-.254-.543C3.274 16.587 2.25 14.41 2.25 12c0-5.03 4.428-9 9.75-9s9.75 3.97 9.75 9c0 5.03-4.428 9-9.75 9-.833 0-1.643-.097-2.417-.279a6.721 6.721 0 0 1-4.246.997Z" clipRule="evenodd" />
        </svg>

        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </>
  );
}
