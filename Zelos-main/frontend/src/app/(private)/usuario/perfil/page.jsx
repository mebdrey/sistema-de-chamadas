"use client";
import React, { useEffect, useRef, useState } from "react";

const InlineField = React.memo(function InlineField({
    label,
    fieldKey,
    value = "",
    editable = true,
    type = "text",
    isEditing = false,
    onStartEdit = () => { },
    onCancel = () => { },
    onSave = async () => { },
}) {
    const [localValue, setLocalValue] = useState(value ?? "");
    const [saving, setSaving] = useState(false);
    const inputRef = useRef(null);

    // sempre que entrar em modo edição, inicializa o localValue com value
    useEffect(() => {
        if (isEditing) {
            setLocalValue(value ?? "");
        }
    }, [isEditing, value]);

    // foca o input quando a edição começa
    useEffect(() => {
        if (!isEditing) return;
        // setTimeout 0 para garantir que o elemento já esteja no DOM
        const t = setTimeout(() => {
            const el = inputRef.current;
            if (el && typeof el.focus === "function") {
                el.focus();
                // posiciona cursor no final
                try {
                    const len = el.value?.length ?? 0;
                    el.setSelectionRange(len, len);
                } catch (e) { /* ignora se não suportar */ }
                // opcional: selecionar tudo em vez de posicionar no final:
                // el.select();
            }
        }, 0);
        return () => clearTimeout(t);
    }, [isEditing]);

    async function handleSave() {
        setSaving(true);
        try {
            await onSave(localValue);
        } catch (err) {
            // onSave deve lançar erro se falhar — aqui apenas logamos
            console.error("Erro onSave InlineField:", err);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="mb-4">
            <div className="text-xs text-gray-400">{label}</div>

            {!isEditing ? (
                <div className="flex items-center gap-3">
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                        {value ?? "—"}
                    </div>
                    {editable && (
                        <button
                            aria-label={`Editar ${label}`}
                            onClick={() => onStartEdit()}
                            className="text-gray-400 hover:text-violet-500 p-1 rounded"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="stroke-current">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0L14.1 4.64l3.75 3.75 2.86-1.35z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex items-center gap-2 w-full mt-2">
                    {type === "textarea" ? (
                        <textarea
                            ref={inputRef}
                            value={localValue}
                            onChange={(e) => setLocalValue(e.target.value)}
                            rows={3}
                            className="w-full border rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300
             focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600
             dark:focus:ring-violet-500"
                        />
                    ) : (
                        <input
                            ref={inputRef}
                            type={type}
                            value={localValue}
                            onChange={(e) => setLocalValue(e.target.value)}
                            className="w-full border rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300
             focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600
             dark:focus:ring-violet-500"
  autoComplete="off"
                        />
                    )}

                    <div className="flex gap-2">
                        <button
                            disabled={saving}
                            onClick={handleSave}
                            className="flex flex-row gap-2 items-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
                        >
                            {saving ? "Salvando..." : "Salvar"}
                        </button>
                        <button onClick={onCancel} className="py-2.5 px-5 text-sm font-medium text-violet-600 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-violet-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
});

export default function MeuPerfil() {
    useEffect(() => { document.title = "Zelos - Meu Perfil"; }, []);

    const [usuario, setUsuario] = useState(null);
    const [loadingPerfil, setLoadingPerfil] = useState(true);
    const [erro, setErro] = useState("");
    const [statusMsg, setStatusMsg] = useState(null);
    const [editingField, setEditingField] = useState(null); // qual campo está em edição agora

    // foto
    const [fotoFile, setFotoFile] = useState(null); // arquivo selecionado temporário
    const [previewTemp, setPreviewTemp] = useState(null); // preview temporário (no modal)
    const fileInputRef = useRef(null);
    const [uploadingFoto, setUploadingFoto] = useState(false);

    // modal foto
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    // carregar perfil (uma única vez)
    useEffect(() => {
        async function loadPerfil() {
            try {
                setLoadingPerfil(true);
                const res = await fetch("http://localhost:8080/perfil", { credentials: "include" });
                const data = await res.json();
                if (!res.ok) throw new Error(data.mensagem || "Erro ao carregar perfil");
                setUsuario(data);
            } catch (err) {
                console.error("Erro ao carregar perfil:", err);
                setErro("Erro ao carregar perfil.");
            } finally {
                setLoadingPerfil(false);
            }
        }
        loadPerfil();
    }, []);

    // salvar campo isolado via PATCH — chamado pelo InlineField
    async function saveField(fieldKey, newValue) {
        if (!usuario) return;
        try {
            const payload = { [fieldKey]: newValue };
            const res = await fetch("http://localhost:8080/editarPerfil", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.mensagem || "Erro ao salvar");
            setUsuario(prev => ({ ...prev, ...payload }));
            setStatusMsg({ type: "success", text: "Alteração salva." });
            setEditingField(null);
        } catch (err) {
            console.error("Erro ao salvar campo:", err);
            setStatusMsg({ type: "error", text: err?.message || "Erro ao salvar" });
        }
    }

    // handle file change (quando usuário escolhe arquivo dentro do modal)
    function handleFileChange(e) {
        const f = e.target.files?.[0];
        if (!f) return;
        setFotoFile(f);
        setPreviewTemp(URL.createObjectURL(f));
    }

    // enviar foto (upload)
    async function enviarFoto() {
        if (!fotoFile) {
            setStatusMsg({ type: "error", text: "Selecione uma foto antes de salvar." });
            return;
        }
        setUploadingFoto(true);
        try {
            const formData = new FormData();
            formData.append("foto", fotoFile);
            const res = await fetch("http://localhost:8080/editarFoto", {
                method: "POST",
                body: formData,
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.mensagem || "Erro ao enviar foto");
            // atualiza caminho da foto no usuário (backend retorna caminho)
            setUsuario(prev => ({ ...prev, ftPerfil: data.caminho }));
            setStatusMsg({ type: "success", text: "Foto atualizada." });
            // limpa temporários e fecha modal
            setFotoFile(null);
            setPreviewTemp(null);
            setShowPhotoModal(false);
        } catch (err) {
            console.error("Erro ao enviar foto:", err);
            setStatusMsg({ type: "error", text: err?.message || "Erro ao enviar foto" });
        } finally {
            setUploadingFoto(false);
        }
    }

    // remover foto
    async function removerFoto() {
        try {
            const res = await fetch("http://localhost:8080/removerFoto", {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Erro ao remover foto");
            setUsuario(prev => ({ ...prev, ftPerfil: null }));
            setStatusMsg({ type: "success", text: "Foto removida." });
        } catch (err) {
            console.error("Erro ao remover foto:", err);
            setStatusMsg({ type: "error", text: err?.message || "Erro ao remover foto" });
        }
    }

    function cancelPhotoModal() {
        setFotoFile(null);
        setPreviewTemp(null);
        setShowPhotoModal(false);
    }

    useEffect(() => {
        if (!statusMsg) return;
        const id = setTimeout(() => setStatusMsg(null), 4000);
        return () => clearTimeout(id);
    }, [statusMsg]);

    // loaders / erros
    if (erro) return <div className="p-6 text-red-600">{erro}</div>;
    if (loadingPerfil || !usuario) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div role="status" className="text-center">
                    <svg aria-hidden className="mx-auto w-10 h-10 text-gray-200 animate-spin fill-violet-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591..." fill="currentColor" />
                    </svg>
                    <span className="sr-only">Carregando perfil...</span>
                </div>
            </div>
        );
    }

    function pegarPrimeiroEUltimoNome(nome) {
        if (!nome) return { primeiroNome: "", ultimoNome: "" };
        const arr = nome.trim().split(" ");
        return { primeiroNome: arr[0], ultimoNome: arr[arr.length - 1] };
    }
    const nomes = pegarPrimeiroEUltimoNome(usuario.nome);

    const avatarSrcServer = usuario.ftPerfil ? `http://localhost:8080/${usuario.ftPerfil}` : null;
    const avatarHeaderSrc = previewTemp || avatarSrcServer;

    
    function formatarLabel(str) {
        const texto = str.replace(/_/g, ' ').toLowerCase();
    
        const correcoes = { "auxiliar limpeza": "Auxiliar de Limpeza", "apoio tecnico": "Apoio Técnico", "tecnico": "Técnico", "manutencao": "Manutenção", "usuario": "Usuário" };
    
        if (correcoes[texto]) { return correcoes[texto]; }
    
        // capitaliza cada palavra caso não tenha uma correção personalizada
        return texto
          .split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      }
    return (
        <div className="p-4 h-screen w-full ">
            <div className="p-4 mt-14">
                <div className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                    {/* header */}
                    <div className="flex items-center gap-6 p-6 border-b border-gray-100 dark:border-gray-800">
                        <div className="relative">
                            {/* <img src={avatarHeaderSrc} alt="Foto do usuário" className="w-28 h-28 object-cover rounded-full border-4 border-white dark:border-gray-800 shadow" /> */}
                            {!avatarHeaderSrc ? (
                                <div className="w-28 h-28 flex items-center justify-center rounded-full border-4 border-white dark:border-gray-800 shadow bg-transparent overflow-hidden">
                                    <div className="relative w-full h-full">
                                        <svg
                                            className="absolute left-[-8%] top-[-8%] w-[120%] h-[120%] text-gray-400"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg"
                                            preserveAspectRatio="xMidYMid meet"
                                        >
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={avatarHeaderSrc}
                                    alt="Foto do usuário"
                                    className="w-28 h-28 object-cover rounded-full border-4 border-white dark:border-gray-800 shadow"
                                />
                            )}

                            <button
                                onClick={() => { setPreviewTemp(null); setFotoFile(null); setShowPhotoModal(true); }}
                                className="absolute bottom-0 right-0 bg-violet-600 text-white rounded-full p-2 cursor-pointer hover:bg-violet-700"
                                title="Alterar foto"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="stroke-current">
                                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <input id="fotoInput" ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-gray-400">Bem vindo</div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{nomes.primeiroNome} <span className="text-gray-500">{nomes.ultimoNome}</span></h2>
                                    <div className="text-sm text-gray-500 mt-1">{formatarLabel(usuario.funcao)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* corpo com campos */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InlineField
                                label="Nome completo"
                                fieldKey="nome"
                                value={usuario.nome}
                                editable={false} // NÃO editável conforme pedido
                                isEditing={editingField === "nome"}
                                onStartEdit={() => setEditingField("nome")}
                                onCancel={() => setEditingField(null)}
                                onSave={(newVal) => saveField("nome", newVal)}
                            />

                            <InlineField
                                label="Departamento"
                                fieldKey="funcao"
                                value={formatarLabel(usuario.funcao)}
                                editable={false} // NÃO editável conforme pedido
                                isEditing={false}
                                onStartEdit={() => { }}
                                onCancel={() => { }}
                                onSave={() => { }}
                            />

                           
                        </div>

                        <div>
                             <InlineField
                                label="Email educacional"
                                fieldKey="email"
                                value={usuario.email}
                                editable={false}
                                type="email"
                                isEditing={editingField === "email"}
                                onStartEdit={() => setEditingField("email")}
                                onCancel={() => setEditingField(null)}
                                onSave={(newVal) => saveField("email", newVal)}
                            />
                            <div className="mb-4">
                                <div className="text-xs text-gray-400">Username</div>
                                <div className="text-lg font-medium text-gray-900 dark:text-white">{usuario.username}</div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Modal de foto */}
                {showPhotoModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/50" onClick={cancelPhotoModal} />
                        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg w-[90%] max-w-lg p-6 z-60">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Atualizar foto de perfil</h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="text-xs text-gray-500">Foto atual</div>
                                    <div className="relative w-36 h-36 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-700">
                                        {usuario?.ftPerfil ? (
                                            <img className="object-cover w-full h-full" src={`http://localhost:8080/${usuario.ftPerfil}`} alt="Foto de perfil" />
                                        ) : (
                                            <svg
                                                className="absolute left-[-12%] top-[-12%] w-[124%] h-[124%] text-gray-400"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                                xmlns="http://www.w3.org/2000/svg"
                                                preserveAspectRatio="xMidYMid meet"
                                            >
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <button onClick={removerFoto} className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-violet-600 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-violet-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Remover</button>
                                </div>

                                <div className="flex flex-col items-center gap-3">
                                    <div className="text-xs text-gray-500">Pré-visualização</div>
                                    <div className="w-36 h-36 border rounded-full overflow-hidden flex items-center justify-center bg-gray-50">
                                        {previewTemp ? (
                                            <img src={previewTemp} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-sm text-gray-400">Nenhuma imagem selecionada</div>
                                        )}
                                    </div>

                                    { /* AQUI: se houver foto mostra o rodapé (Cancelar/Salvar) no lugar do botão "Selecionar imagem". Se não houver, mostra o botão "Selecionar imagem". */}
                                    {(fotoFile || previewTemp) ? (
                                        <div className={`${(fotoFile || previewTemp) ? "" : "hidden"} flex justify-end gap-3`}>
                                            <button onClick={cancelPhotoModal} className="py-2.5 px-5 text-sm font-medium text-violet-600 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-violet-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Cancelar</button>
                                            <button onClick={enviarFoto} disabled={uploadingFoto || !fotoFile} className="flex flex-row gap-2 items-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition">
                                                {uploadingFoto ? "Enviando..." : "Salvar"}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="mt-2 flex gap-2">
                                            <button onClick={() => fileInputRef.current?.click()} className="py-2.5 px-5 text-sm font-medium text-violet-600 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-violet-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Selecionar imagem</button>
                                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
