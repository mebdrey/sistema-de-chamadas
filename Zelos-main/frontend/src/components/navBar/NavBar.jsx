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


    useEffect(() => {
        if (dropdownNotificationOpen) {
            fetch("http://localhost:8080/notificacoes", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then((res) => {
                    if (!res.ok) throw new Error("Erro ao buscar notificações");
                    return res.json();
                })
                .then((data) => setNotificacoes(data))
                .catch((err) => console.error("Erro ao buscar notificações:", err));
        }
    }, [dropdownNotificationOpen]);

    function getNotificacaoIcon(tipo) {
        switch (tipo) {
            case "resposta_tecnico": // apontamento
                return (
                    <svg className="w-2 h-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                        <path d="M18 0H2a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2v4a1 1 0 0 0 1.707.707L10.414 13H18a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5 4h2a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2ZM5 4h5a1 1 0 1 1 0 2H5a1 1 0 0 1 0-2Zm2 5H5a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Zm9 0h-6a1 1 0 0 1 0-2h6a1 1 0 1 1 0 2Z" />
                    </svg>
                );

            case "tecnico_atribuido": // atribuição
                return (
                    <svg className="w-2 h-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                        <path d="M6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Zm11-3h-2V5a1 1 0 0 0-2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 0 0 2 0V9h2a1 1 0 1 0 0-2Z" />
                    </svg>
                );

            default: // qualquer chamado (criado, finalizado, atualizado etc.)
                return (
                    <svg className="w-2 h-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
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
                                <img src="/img/zelos-name.svg" className="h-8 me-3" alt="Zelos Logo" />
                                {/* <img src="https://flowbite.com/docs/images/logo.svg" className="h-8 me-3" alt="FlowBite Logo" />
                                <span className="self-center text-xl poppins-semibold sm:text-2xl whitespace-nowrap dark:text-white">Flowbite</span> */}
                            </a>
                        </div>

                        <div className='flex flex-row gap-10'>
                            {/* notificacoes */}
                            {/* <button id="dropdown-notification-button" onClick={() => setDropdownNotificationOpen(!dropdownNotificationOpen)} className="relative inline-flex items-center text-sm poppins-medium text-center text-gray-500 hover:text-gray-900 focus:outline-none dark:hover:text-white dark:text-gray-400" type="button">
                                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 14 20">
                                    <path d="M12.133 10.632v-1.8A5.406 5.406 0 0 0 7.979 3.57.946.946 0 0 0 8 3.464V1.1a1 1 0 0 0-2 0v2.364a.946.946 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C1.867 13.018 0 13.614 0 14.807 0 15.4 0 16 .538 16h12.924C14 16 14 15.4 14 14.807c0-1.193-1.867-1.789-1.867-4.175ZM3.823 17a3.453 3.453 0 0 0 6.354 0H3.823Z" />
                                </svg>
                                <div className="absolute block w-3 h-3 bg-red-500 border-2 border-white rounded-full -top-0.5 start-2.5 dark:border-gray-900"></div>
                            </button> */}

                            {/* Botão do sino */}
                            <button id="dropdown-notification-button" onClick={() => setDropdownNotificationOpen(!dropdownNotificationOpen)} className="relative inline-flex items-center text-sm poppins-medium text-center text-gray-500 hover:text-gray-900 focus:outline-none dark:hover:text-white dark:text-gray-400" type="button">
                                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 14 20">
                                    <path d="M12.133 10.632v-1.8A5.406 5.406 0 0 0 7.979 3.57.946.946 0 0 0 8 3.464V1.1a1 1 0 0 0-2 0v2.364a.946.946 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C1.867 13.018 0 13.614 0 14.807 0 15.4 0 16 .538 16h12.924C14 16 14 15.4 14 14.807c0-1.193-1.867-1.789-1.867-4.175ZM3.823 17a3.453 3.453 0 0 0 6.354 0H3.823Z" />
                                </svg>
                                {/* Pontinho vermelho se tiver notificações não lidas */}
                                {notificacoes.some(n => !n.lida) && (
                                    <div className="absolute block w-3 h-3 bg-red-500 border-2 border-white rounded-full -top-0.5 start-2.5"></div>
                                )}
                            </button>

                            {dropdownNotificationOpen && (
                                <div id="dropdownNotification" className="absolute right-0 mt-2 top-12 z-20 w-full max-w-sm bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-800 dark:divide-gray-700" aria-labelledby="dropdownNotificationButton">
                                    <div className="block px-4 py-2 poppins-medium text-center text-gray-700 rounded-t-lg bg-gray-50 dark:bg-gray-800 dark:text-white">Notificações</div>
                                    {/* <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                            <a href="#" className="flex px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <div className="shrink-0">
                                                    <img className="rounded-full w-11 h-11" src="/docs/images/people/profile-picture-1.jpg" alt="Jese image" />
                                                    <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-blue-600 border border-white rounded-full dark:border-gray-800">
                                                        <svg className="w-2 h-2 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                                                            <path d="M1 18h16a1 1 0 0 0 1-1v-6h-4.439a.99.99 0 0 0-.908.6 3.978 3.978 0 0 1-7.306 0 .99.99 0 0 0-.908-.6H0v6a1 1 0 0 0 1 1Z" />
                                                            <path d="M4.439 9a2.99 2.99 0 0 1 2.742 1.8 1.977 1.977 0 0 0 3.638 0A2.99 2.99 0 0 1 13.561 9H17.8L15.977.783A1 1 0 0 0 15 0H3a1 1 0 0 0-.977.783L.2 9h4.239Z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="w-full ps-3">
                                                    <div className="text-gray-500 text-sm mb-1.5 dark:text-gray-400">New message from <span className="poppins-semibold text-gray-900 dark:text-white">Jese Leos</span>: "Hey, what's up? All set htmlFor the presentation?"</div>
                                                    <div className="text-xs text-blue-600 dark:text-blue-500">a few moments ago</div>
                                                </div>
                                            </a>
                                            <a href="#" className="flex px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <div className="shrink-0">
                                                    <img className="rounded-full w-11 h-11" src="/docs/images/people/profile-picture-2.jpg" alt="Joseph image" />
                                                    <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-gray-900 border border-white rounded-full dark:border-gray-800">
                                                        <svg className="w-2 h-2 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                                            <path d="M6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Zm11-3h-2V5a1 1 0 0 0-2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 0 0 2 0V9h2a1 1 0 1 0 0-2Z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="w-full ps-3">
                                                    <div className="text-gray-500 text-sm mb-1.5 dark:text-gray-400"><span className="poppins-semibold text-gray-900 dark:text-white">Joseph Mcfall</span> and <span className="poppins-medium text-gray-900 dark:text-white">5 others</span> started following you.</div>
                                                    <div className="text-xs text-blue-600 dark:text-blue-500">10 minutes ago</div>
                                                </div>
                                            </a>
                                            <a href="#" className="flex px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <div className="shrink-0">
                                                    <img className="rounded-full w-11 h-11" src="/docs/images/people/profile-picture-3.jpg" alt="Bonnie image" />
                                                    <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-red-600 border border-white rounded-full dark:border-gray-800">
                                                        <svg className="w-2 h-2 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                                            <path d="M17.947 2.053a5.209 5.209 0 0 0-3.793-1.53A6.414 6.414 0 0 0 10 2.311 6.482 6.482 0 0 0 5.824.5a5.2 5.2 0 0 0-3.8 1.521c-1.915 1.916-2.315 5.392.625 8.333l7 7a.5.5 0 0 0 .708 0l7-7a6.6 6.6 0 0 0 2.123-4.508 5.179 5.179 0 0 0-1.533-3.793Z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="w-full ps-3">
                                                    <div className="text-gray-500 text-sm mb-1.5 dark:text-gray-400"><span className="poppins-semibold text-gray-900 dark:text-white">Bonnie Green</span> and <span className="poppins-medium text-gray-900 dark:text-white">141 others</span> love your story. See it and view more stories.</div>
                                                    <div className="text-xs text-blue-600 dark:text-blue-500">44 minutes ago</div>
                                                </div>
                                            </a>
                                            <a href="#" className="flex px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <div className="shrink-0">
                                                    <img className="rounded-full w-11 h-11" src="/docs/images/people/profile-picture-4.jpg" alt="Leslie image" />
                                                    <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-green-400 border border-white rounded-full dark:border-gray-800">
                                                        <svg className="w-2 h-2 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                                            <path d="M18 0H2a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2v4a1 1 0 0 0 1.707.707L10.414 13H18a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5 4h2a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2ZM5 4h5a1 1 0 1 1 0 2H5a1 1 0 0 1 0-2Zm2 5H5a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Zm9 0h-6a1 1 0 0 1 0-2h6a1 1 0 1 1 0 2Z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="w-full ps-3">
                                                    <div className="text-gray-500 text-sm mb-1.5 dark:text-gray-400"><span className="poppins-semibold text-gray-900 dark:text-white">Leslie Livingston</span> mentioned you in a comment: <span className="poppins-medium text-blue-500" href="#">@bonnie.green</span> what do you say?</div>
                                                    <div className="text-xs text-blue-600 dark:text-blue-500">1 hour ago</div>
                                                </div>
                                            </a>
                                            <a href="#" className="flex px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <div className="shrink-0">
                                                    <img className="rounded-full w-11 h-11" src="/docs/images/people/profile-picture-5.jpg" alt="Robert image" />
                                                    <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-purple-500 border border-white rounded-full dark:border-gray-800">
                                                        <svg className="w-2 h-2 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 14">
                                                            <path d="M11 0H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm8.585 1.189a.994.994 0 0 0-.9-.138l-2.965.983a1 1 0 0 0-.685.949v8a1 1 0 0 0 .675.946l2.965 1.02a1.013 1.013 0 0 0 1.032-.242A1 1 0 0 0 20 12V2a1 1 0 0 0-.415-.811Z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="w-full ps-3">
                                                    <div className="text-gray-500 text-sm mb-1.5 dark:text-gray-400"><span className="poppins-semibold text-gray-900 dark:text-white">Robert Brown</span> posted a new video: Glassmorphism - learn how to implement the new design trend.</div>
                                                    <div className="text-xs text-blue-600 dark:text-blue-500">3 hours ago</div>
                                                </div>
                                            </a>
                                        </div> */}
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
                                                    className={`flex px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 ${!n.lida ? "bg-gray-50" : ""}`}
                                                >
                                                    <div className="shrink-0">
                                                        <img className="rounded-full w-11 h-11" src="/docs/images/people/profile-picture-1.jpg" alt="avatar" />
                                                        <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-blue-600 border border-white rounded-full dark:border-gray-800">
                                                            {getNotificacaoIcon(n.tipo)}
                                                        </div>
                                                    </div>
                                                    <div className="w-full ps-3">
                                                        <div className="text-gray-500 text-sm mb-1.5 dark:text-gray-400">
                                                            <span className="poppins-semibold text-gray-900 dark:text-white">{n.titulo}</span>
                                                            <p>{n.descricao}</p>
                                                        </div>
                                                        <div className="text-xs text-blue-600 dark:text-blue-500">
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
                                            <div className="relative w-8 h-8 overflow-hidden bg-gray-100 rounded-full">
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
                                        <div className="z-50 absolute right-6 md:right-0 top-10 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-sm shadow-sm" id="dropdown-user">
                                            <div className="px-4 py-3" role="none">
                                                <p className="text-sm text-gray-900 " role="none">{user?.nome || 'Nome não informado'}</p>
                                                <p className="text-sm poppins-medium text-gray-900 truncate " role="none">{user?.username || 'Email não informado'}</p>
                                            </div>
                                            <ul className="py-1" role="none">
                                                <li>
                                                    {perfis.map((perfil) => (
                                                        <div key={perfil.href}>
                                                            <a href={perfil.href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 " role="menuitem">Perfil</a>
                                                        </div>
                                                    ))}

                                                </li>
                                                <li>
                                                    <button className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 " role="menuitem" onClick={(e) => {
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
                            <button id="mobile-menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 md:hidden">
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
                                    <a href={link.href} className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-[#E6DAFF] group">
                                        {link.icon}
                                        <span className="ml-3 transition-all duration-200 group-hover:text-[#7F56D8]">{link.label}</span>
                                    </a>

                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </nav>

            {/* itens da sidebar */}
            <aside id="logo-sidebar" className={`fixed top-0 left-0 z-40 h-screen pt-20 transition-all bg-white border-r border-gray-200 ${navFechada ? 'w-16' : 'w-64'} hidden md:block`} aria-label="Sidebar">
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

                <div className="h-full px-3 pb-4 overflow-y-auto bg-white ">
                    <ul className="space-y-2 poppins-medium">
                        {links.map((link) => (
                            <li key={link.href}>
                                <a href={link.href} className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-[#E6DAFF] group">
                                    {link.icon}
                                    <span className={"ml-3 transition-all duration-200 group-hover:text-[#7F56D8]" + (navFechada ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto")}>
                                        {link.label}
                                    </span>
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