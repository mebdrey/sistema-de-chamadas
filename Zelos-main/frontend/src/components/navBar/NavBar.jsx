'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


const SideBar = ({ user, setUser, userType, navFechada, setNavFechada }) => {
    const router = useRouter();
    // state no componente
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [notificacoes, setNotificacoes] = useState([]);
    const [mounted, setMounted] = useState(false);
    const [dropdownUserOpen, setDropdownUserOpen] = useState(false);
    const [dropdownNotificationOpen, setDropdownNotificationOpen] = useState(false);
    const [unvisualizedCount, setUnvisualizedCount] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);

    // links da sidebar
    let links = [];

    if (userType === 'admin') {
        links = [
            { label: 'Dashboard', href: '/admin/dashboard', icon: (<svg className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-[#7F56D8]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21"><path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" /><path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" /></svg>) },
            { label: 'Chamados', href: '/admin/chamados', icon: (<svg className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-[#7F56D8]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18"><path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" /></svg>) },
            {
                label: 'Setores', href: '/admin/setores', icon: (<svg className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-[#7F56D8]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                    <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                </svg>)
            },
            {
                label: 'Painel de Gestão', href: '/admin/painelGestao', icon: (<svg xmlns="http://www.w3.org/2000/svg" className="shrink-0 w-5 h-5 text-gray-500 transition-colors duration-200 group-hover:text-[#7F56D8]" fill="currentColor" aria-hidden="true" viewBox="0 0 640 640"><path d="M259.1 73.5C262.1 58.7 275.2 48 290.4 48L350.2 48C365.4 48 378.5 58.7 381.5 73.5L396 143.5C410.1 149.5 423.3 157.2 435.3 166.3L503.1 143.8C517.5 139 533.3 145 540.9 158.2L570.8 210C578.4 223.2 575.7 239.8 564.3 249.9L511 297.3C511.9 304.7 512.3 312.3 512.3 320C512.3 327.7 511.8 335.3 511 342.7L564.4 390.2C575.8 400.3 578.4 417 570.9 430.1L541 481.9C533.4 495 517.6 501.1 503.2 496.3L435.4 473.8C423.3 482.9 410.1 490.5 396.1 496.6L381.7 566.5C378.6 581.4 365.5 592 350.4 592L290.6 592C275.4 592 262.3 581.3 259.3 566.5L244.9 496.6C230.8 490.6 217.7 482.9 205.6 473.8L137.5 496.3C123.1 501.1 107.3 495.1 99.7 481.9L69.8 430.1C62.2 416.9 64.9 400.3 76.3 390.2L129.7 342.7C128.8 335.3 128.4 327.7 128.4 320C128.4 312.3 128.9 304.7 129.7 297.3L76.3 249.8C64.9 239.7 62.3 223 69.8 209.9L99.7 158.1C107.3 144.9 123.1 138.9 137.5 143.7L205.3 166.2C217.4 157.1 230.6 149.5 244.6 143.4L259.1 73.5zM320.3 400C364.5 399.8 400.2 363.9 400 319.7C399.8 275.5 363.9 239.8 319.7 240C275.5 240.2 239.8 276.1 240 320.3C240.2 364.5 276.1 400.2 320.3 400z" /></svg>
                )
            }
        ];
    } else if (userType === 'tecnico') {
        links = [
            { label: 'Chamados', href: '/tecnico/chamados', icon: (<svg className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-[#7F56D8]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18"><path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" /></svg>) },
            {
                label: 'Perfil', href: '/tecnico/perfil', icon: (<svg className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-[#7F56D8]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                </svg>
                )
            }
        ];
    } else if (userType === 'usuario') {
        links = [
            { label: 'Chamados', href: '/usuario/chamados', icon: (<svg className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-[#7F56D8]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18"><path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" /></svg>) },
            {
                label: 'Perfil', href: '/usuario/perfil', icon: (<svg className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-[#7F56D8]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                </svg>
                )
            },
        ];
    }

    // pra sidebar "abrir" e "fechar"
    const sidebar = () => { setNavFechada(prev => !prev); };

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        function handleClickOutside(e) {
            // se clicar fora do avatar => fecha
            if (dropdownUserOpen && !e.target.closest('#dropdown-user-button') && !e.target.closest('#dropdown-user')) { setDropdownUserOpen(false); }

            // se clicar fora do bell => fecha
            if (dropdownNotificationOpen && !e.target.closest('#dropdown-notification-button') && !e.target.closest('#dropdownNotification')) { setDropdownNotificationOpen(false); }

            // se clicar fora do menu mobile => fecha
            if (isMenuOpen && !e.target.closest('#mobile-menu') && !e.target.closest('#mobile-menu-button')) { setIsMenuOpen(false); }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownUserOpen, dropdownNotificationOpen, isMenuOpen]);

    let perfis = [];

    if (userType === 'tecnico') { perfis = [{ label: 'Perfil', href: '/tecnico/perfil' }] }
    else if (userType === 'usuario') { perfis = [{ label: 'Perfil', href: '/usuario/perfil' }] }
    else if (userType === 'admin') { perfis = [{ label: 'Perfil', href: '/admin/perfil' }] }

    // busca notificações (quando abrir dropdown)
    async function fetchNotificacoes() {
        try {
            const res = await fetch("http://localhost:8080/notificacoes", {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" }
            });
            if (!res.ok) throw new Error("Erro ao buscar notificações");
            const data = await res.json();
            setNotificacoes(data);
        } catch (err) {
            console.error("Erro ao buscar notificações:", err);
        }
    }

    // busca contagem (total / nao lidas / nao visualizadas)
    async function fetchContagens() {
        try {
            const res = await fetch("http://localhost:8080/notificacoes/contagem", {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" }
            });
            if (!res.ok) throw new Error("Erro ao buscar contagem");
            const data = await res.json();
            setUnvisualizedCount(Number(data.nao_visualizadas || data.unvisualized || 0));
            setUnreadCount(Number(data.nao_lidas || data.nao_lidas || 0));
        } catch (err) {
            console.error("Erro ao buscar contagem de notificações:", err);
        }
    }

    // quando abrir o dropdown: marcar visualizadas e buscar lista + contagem
    useEffect(() => {
        if (dropdownNotificationOpen) {
            // marca como visualizadas (o user "viu" as notificações)
            fetch("http://localhost:8080/notificacoes/visualizadas", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" }
            }).catch(err => console.error("Erro marcando visualizadas:", err))
                .finally(() => {
                    // depois de marcar visualizadas, busca a lista atualizada e as contagens
                    fetchNotificacoes();
                    fetchContagens();
                });
        }
    }, [dropdownNotificationOpen]);

    // buscar contagem ao montar e a cada 30s (polling simples)
    useEffect(() => {
        fetchContagens();
        const id = setInterval(fetchContagens, 30000); // 30s
        return () => clearInterval(id);
    }, []);

    // função ao abrir/acionar uma notificação individual (marca como lida)
    async function abrirNotificacao(n) {
        // se já for lida, apenas abre; se não, marcar como lida
        try {
            // chama seu endpoint já existente para marcar como lida
            if (!n.lida) {
                await fetch(`http://localhost:8080/notificacoes/${n.id}/marcar-lida`, {
                    method: "POST", // ou PUT conforme sua rota (se seu endpoint atual for diferente, adapte)
                    credentials: "include",
                    headers: { "Content-Type": "application/json" }
                });
            }
        } catch (err) {
            console.error("Erro marcando notificação como lida:", err);
        } finally {
            // atualiza lista e contagem
            fetchNotificacoes();
            fetchContagens();
            // aqui você pode abrir o modal/detalhe da notificação
            // openModalComNotificacao(n)
        }
    }

    function getNotificacaoIcon(tipo) {
        switch (tipo) {
            case "resposta_tecnico": // apontamento
                return (
                    <svg className="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                        <path d="M18 0H2a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2v4a1 1 0 0 0 1.707.707L10.414 13H18a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5 4h2a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2ZM5 4h5a1 1 0 1 1 0 2H5a1 1 0 0 1 0-2Zm2 5H5a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Zm9 0h-6a1 1 0 0 1 0-2h6a1 1 0 1 1 0 2Z" />
                    </svg>
                );

            case "tecnico_atribuido": // atribuição
                return (
                    <svg className="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                        <path d="M6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Zm11-3h-2V5a1 1 0 0 0-2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 0 0 2 0V9h2a1 1 0 1 0 0-2Z" />
                    </svg>
                );

            default: // qualquer chamado (criado, finalizado, atualizado etc.)
                return (
                    <svg className="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                        <path d="M1 18h16a1 1 0 0 0 1-1v-6h-4.439a.99.99 0 0 0-.908.6 3.978 3.978 0 0 1-7.306 0 .99.99 0 0 0-.908-.6H0v6a1 1 0 0 0 1 1Z" />
                        <path d="M4.439 9a2.99 2.99 0 0 1 2.742 1.8 1.977 1.977 0 0 0 3.638 0A2.99 2.99 0 0 1 13.561 9H17.8L15.977.783A1 1 0 0 0 15 0H3a1 1 0 0 0-.977.783L.2 9h4.239Z" />
                    </svg>
                );
        }
    }

    if (!mounted) return null; // evita SSR

    // ----- Função de logout -----
    const handleLogout = async () => {
        try {
            const res = await fetch('http://localhost:8080/auth/logout', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro no logout');

            setUser(null);
            alert('Logout realizado com sucesso');
            router.push('/login');
        } catch (err) {
            console.error('Erro ao deslogar:', err);
            alert('Erro de rede ao tentar deslogar');
        }
    };

    console.log("userType:", userType, "links:", links);

    return (
        <>
            {/*navbar */}
            <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="px-3 py-3 lg:px-5 lg:pl-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start rtl:justify-end">
                            <a href="http://localhost:3000/" className="flex ms-2 md:me-24">
                                {/* <img src="/img/zelos-name.svg" className="h-8 me-3 text-gray-100" alt="Zelos Logo" /> */}
                                <svg
                                    className="h-8 me-3 text-gray-800 dark:text-gray-300"
                                    viewBox="0 0 366 84"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M18.4824 79.4987C13.2168 79.4987 8.95117 77.9102 5.69076 74.7279C2.42513 71.5352 0.794922 67.4518 0.794922 62.4779C0.794922 60.1029 1.27409 57.8268 2.23242 55.6445C3.20117 53.4674 4.80013 51.4102 7.02409 49.4779L40.1699 19.8945C40.321 19.7435 40.4512 19.5768 40.5658 19.3945C40.6751 19.2018 40.7324 18.9935 40.7324 18.7695C40.7324 18.4779 40.6335 18.207 40.4408 17.957C40.2585 17.6966 40.0345 17.4883 39.7741 17.332C39.5241 17.181 39.2428 17.1029 38.9408 17.1029H2.69076V1.64453H43.0658C46.6178 1.64453 49.7116 2.3737 52.3366 3.83203C54.972 5.27995 57.0345 7.27995 58.5241 9.83203C60.0085 12.3893 60.7533 15.332 60.7533 18.6654C60.7533 21.0404 60.2845 23.3268 59.3574 25.5195C58.4251 27.7018 56.9616 29.681 54.9616 31.457L21.3783 61.1445C21.3053 61.2279 21.2168 61.3477 21.1074 61.4987C20.9928 61.6393 20.9199 61.7643 20.8783 61.8737C20.8366 61.9883 20.8158 62.1549 20.8158 62.3737C20.8158 62.6654 20.8887 62.9466 21.0449 63.207C21.196 63.4727 21.4199 63.681 21.7116 63.832C22.0033 63.9727 22.3366 64.0404 22.7116 64.0404H61.2949V79.4987H18.4824Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M83.2005 79.4987C78.8255 79.4987 74.8516 78.4779 71.2839 76.4362C67.7266 74.3945 64.8932 71.655 62.7839 68.207C60.6693 64.7643 59.6172 60.8529 59.6172 56.4779C59.6172 53.2174 60.3359 50.1602 61.7839 47.3112C63.2266 44.4518 65.1797 41.9883 67.638 39.9154C65.263 37.9154 63.388 35.5508 62.013 32.8112C60.638 30.0612 59.9505 27.1654 59.9505 24.1237C59.9505 19.8216 60.9818 15.9779 63.0547 12.6029C65.138 9.22786 67.9193 6.5612 71.4089 4.60286C74.8932 2.63411 78.7474 1.64453 82.9714 1.64453H115.784V17.2279H85.8672C84.4609 17.2279 83.1641 17.5612 81.9714 18.2279C80.7891 18.8945 79.8464 19.7852 79.138 20.8945C78.4297 22.0091 78.0755 23.306 78.0755 24.7904C78.0755 26.1966 78.4297 27.4727 79.138 28.6237C79.8464 29.7799 80.7891 30.6654 81.9714 31.2904C83.1641 31.9154 84.4609 32.2279 85.8672 32.2279H111.992V47.8112H86.4297C84.8724 47.8112 83.4609 48.181 82.2005 48.9154C80.9349 49.6549 79.9297 50.6185 79.1797 51.8112C78.4401 52.9935 78.0755 54.3633 78.0755 55.9154C78.0755 57.4049 78.4401 58.7591 79.1797 59.9779C79.9297 61.2018 80.9349 62.1445 82.2005 62.8112C83.4609 63.4779 84.8724 63.8112 86.4297 63.8112H115.784V79.4987H83.2005Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M140.904 79.4987C136.081 79.4987 131.852 78.4258 128.217 76.2695C124.592 74.1185 121.779 71.2643 119.779 67.707C117.779 64.1549 116.779 60.2227 116.779 55.9154V1.64453H135.446V57.2487C135.446 59.0404 136.076 60.6029 137.342 61.9362C138.602 63.2695 140.16 63.9362 142.008 63.9362H162.592V79.4987H140.904Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M292.665 79.4987V63.9362H325.915C327.399 63.9362 328.732 63.5716 329.915 62.832C331.107 62.082 332.05 61.1185 332.748 59.9362C333.456 58.7435 333.811 57.4466 333.811 56.0404C333.811 54.556 333.456 53.2227 332.748 52.0404C332.05 50.8477 331.107 49.8841 329.915 49.1445C328.732 48.3945 327.399 48.0195 325.915 48.0195H313.915C309.383 48.0195 305.269 47.1341 301.561 45.3529C297.852 43.5768 294.899 40.9674 292.706 37.5195C290.524 34.0768 289.436 29.9466 289.436 25.1237C289.436 20.3737 290.467 16.2591 292.54 12.7695C294.623 9.28516 297.441 6.5612 300.998 4.60286C304.566 2.63411 308.498 1.64453 312.79 1.64453H347.165V17.2279H314.915C313.566 17.2279 312.337 17.5612 311.227 18.2279C310.113 18.8945 309.258 19.7852 308.665 20.8945C308.081 22.0091 307.79 23.2279 307.79 24.5612C307.79 25.8945 308.081 27.1029 308.665 28.1862C309.258 29.2591 310.113 30.1237 311.227 30.7904C312.337 31.457 313.566 31.7904 314.915 31.7904H327.477C332.436 31.7904 336.748 32.7383 340.415 34.6237C344.092 36.5143 346.946 39.1445 348.977 42.5195C351.019 45.8945 352.04 49.8477 352.04 54.3737C352.04 59.707 350.982 64.2487 348.873 67.9987C346.758 71.7383 343.925 74.5925 340.373 76.5612C336.816 78.5195 332.883 79.4987 328.581 79.4987H292.665Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M354.923 80.8333C351.965 80.8333 349.428 79.776 347.319 77.6667C345.204 75.5573 344.152 73.0573 344.152 70.1667C344.152 67.1979 345.204 64.6563 347.319 62.5417C349.428 60.4323 351.965 59.375 354.923 59.375C357.809 59.375 360.309 60.4323 362.423 62.5417C364.548 64.6563 365.611 67.1979 365.611 70.1667C365.611 72.0833 365.121 73.8646 364.152 75.5C363.194 77.125 361.913 78.4271 360.319 79.3958C358.72 80.3542 356.923 80.8333 354.923 80.8333Z"
                                        fill="currentColor"
                                    />
                                    <defs>
                                        <clipPath id="clip0">
                                            <rect x="154" y="0" width="140" height="84" rx="42" />
                                        </clipPath>
                                    </defs>

                                    <g clipPath="url(#clip0)" stroke="currentColor" strokeWidth="29.8651">
                                        <path
                                            d="M196.072 0.306641H251.765C262.77 0.306641 273.328 4.67644 281.109 12.4577C288.89 20.2442 293.265 30.7962 293.265 41.8067C293.265 52.8119 288.89 63.3692 281.109 71.1504C273.328 78.9317 262.77 83.3067 251.765 83.3067H196.072C185.067 83.3067 174.51 78.9317 166.729 71.1504C158.947 63.3692 154.572 52.8119 154.572 41.8067C154.572 30.7962 158.947 20.2442 166.729 12.4577C174.51 4.67644 185.067 0.306641 196.072 0.306641Z"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="29.8651"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </g>
                                </svg>

                            </a>
                        </div>

                        <div className='flex flex-row gap-10'>
                            {/* Botão do sino */}
                            <button id="dropdown-notification-button" onClick={() => setDropdownNotificationOpen(v => !v)} className="relative inline-flex items-center text-sm poppins-medium text-center text-gray-500 hover:text-gray-900 focus:outline-none dark:hover:text-white dark:text-gray-400" type="button">
                                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 14 20">
                                    <path d="M12.133 10.632v-1.8A5.406 5.406 0 0 0 7.979 3.57.946.946 0 0 0 8 3.464V1.1a1 1 0 0 0-2 0v2.364a.946.946 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C1.867 13.018 0 13.614 0 14.807 0 15.4 0 16 .538 16h12.924C14 16 14 15.4 14 14.807c0-1.193-1.867-1.789-1.867-4.175ZM3.823 17a3.453 3.453 0 0 0 6.354 0H3.823Z" />
                                </svg>
                                {unvisualizedCount > 0 && (
                                    <span title={`${unvisualizedCount} nova(s)`} className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-600 rounded-full">
                                        {unvisualizedCount > 9 ? '9+' : unvisualizedCount}
                                    </span>
                                )}
                            </button>

                            {dropdownNotificationOpen && (
                                <div id="dropdownNotification" className="absolute right-0 mt-2 top-12 z-20 w-full max-w-sm bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-800 dark:divide-gray-700" aria-labelledby="dropdownNotificationButton">
                                    <div className="block px-4 py-2 poppins-medium text-center text-gray-700 rounded-t-lg bg-gray-50 dark:bg-gray-800 dark:text-white">Notificações</div>
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-80 overflow-y-auto">
                                        {notificacoes.length > 0 ? (
                                            notificacoes.map((n) => (
                                                <a
                                                    key={n.id}
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        abrirNotificacao(n);
                                                    }}
                                                    className={`flex px-4 py-3 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 ${!n.lida ? "bg-gray-50 dark:bg-gray-600" : ""}`}
                                                >
                                                    <div className="shrink-0">
                                                        {/* <img className="rounded-full w-11 h-11" src="/docs/images/people/profile-picture-1.jpg" alt="avatar" /> */}
                                                        <div className="flex items-center justify-center w-11 h-11 bg-violet-500 border border-white rounded-full dark:border-gray-800">
                                                            {getNotificacaoIcon(n.tipo)}
                                                        </div>
                                                    </div>
                                                    <div className="w-full ps-3">
                                                        <div className="text-gray-500 text-sm mb-1.5 dark:text-gray-400">
                                                            <span className="poppins-semibold text-gray-900 dark:text-white">{n.titulo}</span>
                                                            <p>{n.descricao}</p>
                                                        </div>
                                                        <div className="text-xs text-violet-500 dark:text-violet-500">
                                                            {new Date(n.criado_em).toLocaleString("pt-BR")}
                                                        </div>
                                                    </div>
                                                </a>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-sm text-gray-500">Nenhuma notificação</div>
                                        )}
                                    </div>

                                    <a href="#" className="block py-2 text-sm poppins-medium text-center text-gray-900 rounded-b-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white">
                                        <div className="inline-flex items-center ">
                                            <svg className="w-4 h-4 me-2 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 14">
                                                <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                                            </svg>
                                            Ver todas
                                        </div>
                                    </a>
                                </div>
                            )}

                            {/* avatar do usuario */}
                            <div className="flex items-center">
                                <div className="flex items-center ms-3">
                                    <div>
                                        <button type="button" id="dropdown-user-button" aria-expanded={dropdownUserOpen} onClick={() => setDropdownUserOpen(!dropdownUserOpen)} className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 ">
                                            <span className="sr-only">Open user menu</span>
                                            <div className="relative w-8 h-8 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-700">
                                                {user?.ftPerfil ? (
                                                    <img className="object-cover w-full h-full" src={`http://localhost:8080/${user.ftPerfil}`} alt="Foto de perfil" />
                                                ) : (
                                                    <svg className="absolute w-10 h-10 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                    {dropdownUserOpen && (
                                        <div className="z-50 absolute right-6 md:right-0 top-10 my-4 text-base list-none bg-white dark:bg-gray-800 divide-y divide-gray-100 rounded-sm shadow-sm" id="dropdown-user">
                                            <div className="px-4 py-3" role="none">
                                                <p className="text-sm text-gray-900 dark:text-gray-200" role="none">{user?.nome || 'Nome não informado'}</p>
                                                <p className="text-sm poppins-medium text-gray-900 dark:text-gray-200 truncate " role="none">{user?.username || 'Email não informado'}</p>
                                            </div>
                                            <ul className="py-1" role="none">
                                                <li>
                                                    {perfis.map((perfil) => (
                                                        <div key={perfil.href}>
                                                            <a href={perfil.href} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">Perfil</a>
                                                        </div>
                                                    ))}

                                                </li>
                                                <li>
                                                    <button className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem" onClick={(e) => {
                                                        e.preventDefault();
                                                        handleLogout();
                                                    }}>Sair</button>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Botão hamburger – aparece só em telas < md */}
                            <button id="mobile-menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 md:hidden dark:bg-gray-800 dark:hover:bg-gray-700">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>

                    </div>
                    {/* Menu mobile – hidden em telas grandes */}
                    <div id="mobile-menu" className={`${isMenuOpen ? 'block' : 'hidden'} w-full mt-4 md:hidden`}>
                        <ul className="space-y-2 poppins-medium">
                            {links.map((link) => (
                                <li key={link.href}>
                                    <a href={link.href} className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-[#E6DAFF] dark:hover:bg-gray-700 group">
                                        {link.icon}
                                        <span className="ml-3 transition-all duration-200 group-hover:text-[#7F56D8] dark:text-gray-500 ">{link.label}</span>
                                    </a>

                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </nav>

            {/* itens da sidebar */}
            <aside id="logo-sidebar" className={`fixed top-0 left-0 z-40 h-screen pt-20 transition-all bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${navFechada ? 'w-16' : 'w-64'} hidden md:block`} aria-label="Sidebar">
                <div className={`flex px-2 mb-5 ${navFechada ? 'justify-center' : 'justify-end'}`}>
                    <button onClick={sidebar} data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar" aria-controls="logo-sidebar" className="text-gray-500 hover:text-gray-800 transition-colors">
                        {navFechada ? (
                            <svg className="hs-overlay-minified:block shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M15 3v18" /><path d="m8 9 3 3-3 3" />
                            </svg>
                        ) : (
                            <svg className="hs-overlay-minified:hidden shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M15 3v18" /><path d="m10 15-3-3 3-3" />
                            </svg>
                        )}
                    </button>
                </div>

                <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
                    <ul className="space-y-2 poppins-medium">
                        {links.map((link) => (
                            <li key={link.href}>
                                <a href={link.href} className="flex items-center p-2 text-gray-900 rounded-lg group hover:bg-[#E6DAFF] dark:hover:bg-gray-700 h-fit">
                                    {/* <a href={link.href} className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-[#E6DAFF] group"> */}
                                    {link.icon}
                                    {/* <span className={"ml-3 transition-all duration-200 group-hover:text-[#7F56D8] dark:text-gray-500 " + (navFechada ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto")}>
                                        {link.label}
                                    </span> */}
                                    {!navFechada && (
                                        <span className="ml-3 whitespace-nowrap transition-colors duration-200 group-hover:text-[#7F56D8] dark:text-gray-500 ">
                                            {link.label}
                                        </span>
                                    )}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

        </>
    )
}

export default SideBar;