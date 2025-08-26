"use client";
import { useState, useRef, useEffect } from "react";

export default function ChatWidget({chamadoSelecionado,  position = "bottom-right" }) {

  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(1);
  const [messages, setMessages] = useState([
    { id: 1, role: "agent", text: "Olá! Como posso ajudar?" },
  ]);
  const [draft, setDraft] = useState("");
  const listRef = useRef(null);

  const pos = position === "bottom-left"
    ? { button: "left-4 bottom-4", panel: "left-4 bottom-20" }
    : { button: "right-4 bottom-4", panel: "right-4 bottom-20" };

  useEffect(() => {
    if (open) {
      setUnread(0);
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [open, messages]);

  function sendMessage(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    const newMsg = { id: Date.now(), role: "user", text: draft };
    setMessages((m) => [...m, newMsg]);
    setDraft("");
    // simulação de resposta
    setTimeout(() => {
      setMessages((m) => [...m, { id: Date.now(), role: "agent", text: "Recebi sua mensagem 👍" }]);
    }, 600);
  }

  const [mensagens, setMensagens] = useState(null); // null = ainda não carregou
  const [conteudo, setConteudo] = useState('');
  const [loadingMensagens, setLoadingMensagens] = useState(false);

  useEffect(() => { //carregar mensagens do chamado com base no parâmetro 'chamadoSelecionado'
    const fetchMensagens = async () => {
      if (!chamadoSelecionado?.id) return;

      setLoadingMensagens(true);
      try {
        const response = await fetch(`http://localhost:8080/chat?idChamado=${chamadoSelecionado.id}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Erro ao buscar mensagens');

        const data = await response.json();
        if (JSON.stringify(data.mensagens) !== JSON.stringify(mensagens)) { setMensagens(data.mensagens); }
      }
      catch (err) { console.error("Erro ao buscar mensagens do chamado", err); }
      finally { setLoadingMensagens(false); } // só marca como carregado no fim

    };
    fetchMensagens();

    const interval = setInterval(fetchMensagens, 5000); // atualiza a cada 5s
    return () => clearInterval(interval);
  }, [chamadoSelecionado]);

  //envia mensagem 
  const enviarMsg = async (e, tipo = 'tecnico') => {
    e.preventDefault(); // evita reload da página
    if (!conteudo.trim()) return; // evita enviar mensagem sem nada
    try {
      const endpoint =
        tipo === 'tecnico'
          ? 'http://localhost:8080/tecnico-enviar-msg'
          : 'http://localhost:8080/enviar-msg';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          idChamado: chamadoSelecionado.id,
          conteudoMsg: conteudo,
        }),
      });

      if (!response.ok) throw new Error('Erro ao enviar mensagem');

      // Atualiza mensagens
      const res = await fetch(`http://localhost:8080/chat?idChamado=${chamadoSelecionado.id}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Erro ao atualizar mensagens');
      const data = await res.json();
      setMensagens(data.mensagens);
      setConteudo('');
    } catch (error) { console.error('Erro ao enviar mensagem: ', error); }
  };

  return (
    <>
      {/* Janela de chat */}
      <div
        className={[
          "fixed z-50 w-[92vw] max-w-sm rounded-2xl border border-gray-200",
          "bg-white shadow-xl dark:bg-zinc-900 dark:border-zinc-700",
          "transition-all duration-200",
          pos.panel,
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-zinc-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Suporte</h2>
          <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800">
            <span className="sr-only">Fechar</span>—
          </button>
        </div>

        {/* Mensagens */}
        {mensagens === null ? (
          <p className="text-gray-500">Carregando...</p>
        ) : (
          <div ref={listRef} className="h-72 overflow-y-auto p-3 space-y-2 text-sm">

            {mensagens.map((msg, index) => {
              const isTecnico = msg.id_tecnico !== null;
              //const data = new Date(msg.data_envio).toLocaleString();

              return (
                <div key={index} className={`flex ${isTecnico ? "justify-end" : "justify-start"}`}>
                  <div
                    className={
                      `px-3 py-2 rounded-2xl max-w-[75%]
                     ${isTecnico ? "bg-violet-600 text-white rounded-br-none" : "bg-gray-100 text-gray-900 dark:bg-zinc-800 dark:text-zinc-100 rounded-bl-none"}`
                                           
                    }
                  >
                     {msg.conteudo}
                  </div>
                </div>
              )
            })}
            {/* {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={[
                  "px-3 py-2 rounded-2xl max-w-[75%]",
                  m.role === "user"
                    ? "bg-violet-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-900 dark:bg-zinc-800 dark:text-zinc-100 rounded-bl-none",
                ].join(" ")}
              >
                {m.text}
              </div>
            </div>
          ))} */}
          </div>
        )}


        {/* Input */}
        <form onSubmit={(e) => enviarMsg(e)} className="p-2 border-t border-gray-200 dark:border-zinc-700 flex gap-2">
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

      {/* Bolha flutuante */}
      <button
        onClick={() => setOpen((s) => !s)}
        className={`fixed ${pos.button} z-50 h-14 w-14 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500`}
      >
        💬
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
            {unread}
          </span>
        )}
      </button>
    </>
  );
}
