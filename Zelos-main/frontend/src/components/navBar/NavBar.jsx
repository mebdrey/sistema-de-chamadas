'use client';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initFlowbite } from 'flowbite'
const SideBar = ({ userType, navFechada, setNavFechada }) => {
    // espera o componente estar carregado no navegador p evitar erros de renderizacao
    // const [mounted, setMounted] = useState(false);
    // useEffect(() => {
    //     setMounted(true);
    // }, []);
    // if (!mounted) return null;

    // useEffect(() => {
    //   initFlowbite()
    // }, [])
    // links da sidebar
    let links = [];

    if (userType === 'admin') {
        links = [
            { label: 'Dashboard', href: '/admin/dashboard', icon: (<svg className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21"><path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" /><path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" /></svg>) },
            { label: 'Chamados', href: '/admin/chamados', icon: (<svg className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18"><path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" /></svg>) },
            {
                label: 'Setores', href: '/admin/setores', icon: (<svg className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                    <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                </svg>)
            },
        ];
    } else if (userType === 'tecnico') {
        links = [
            { label: 'Chamados', href: '/tecnico/chamados' },
            { label: 'Equipe', href: '/tecnico/equipe' },
            { label: 'Configurações', href: '/tecnico/configuracoes' },
        ];
    } else if (userType === 'usuario') {
        links = [
            { label: 'Chamados', href: '/usuario/chamados' },
            { label: 'Notificações', href: '/usuario/notificacoes' },
            { label: 'Configurações', href: '/usuario/configuracoes' },
        ];
    }

    // pra sidebar "abrir" e "fechar"
    // const [navFechada, setNavFechada] = useState(false);
    const sidebar = () => {
        setNavFechada(prev => !prev);
    };

    return (
        <>
            {/*navbar */}
            <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="px-3 py-3 lg:px-5 lg:pl-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start rtl:justify-end">
                            <button data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar" aria-controls="logo-sidebar" type="button" className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                                <span className="sr-only">Open sidebar</span>
                                <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                                </svg>
                            </button>
                            <a href="https://flowbite.com" className="flex ms-2 md:me-24">
                                <img src="https://flowbite.com/docs/images/logo.svg" className="h-8 me-3" alt="FlowBite Logo" />
                                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">Flowbite</span>
                            </a>
                        </div>

                        <div className='flex flex-row gap-10'>
                            {/* notificacoes */}
                            <button id="dropdownNotificationButton" data-dropdown-toggle="dropdownNotification" className="relative inline-flex items-center text-sm font-medium text-center text-gray-500 hover:text-gray-900 focus:outline-none dark:hover:text-white dark:text-gray-400" type="button">
                                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 14 20">
                                    <path d="M12.133 10.632v-1.8A5.406 5.406 0 0 0 7.979 3.57.946.946 0 0 0 8 3.464V1.1a1 1 0 0 0-2 0v2.364a.946.946 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C1.867 13.018 0 13.614 0 14.807 0 15.4 0 16 .538 16h12.924C14 16 14 15.4 14 14.807c0-1.193-1.867-1.789-1.867-4.175ZM3.823 17a3.453 3.453 0 0 0 6.354 0H3.823Z" />
                                </svg>

                                <div className="absolute block w-3 h-3 bg-red-500 border-2 border-white rounded-full -top-0.5 start-2.5 dark:border-gray-900"></div>
                            </button>

                            <div id="dropdownNotification" className="z-20 hidden w-full max-w-sm bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-800 dark:divide-gray-700" aria-labelledby="dropdownNotificationButton">
                                <div className="block px-4 py-2 font-medium text-center text-gray-700 rounded-t-lg bg-gray-50 dark:bg-gray-800 dark:text-white">Notificações</div>
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
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
                                            <div className="text-gray-500 text-sm mb-1.5 dark:text-gray-400">New message from <span className="font-semibold text-gray-900 dark:text-white">Jese Leos</span>: "Hey, what's up? All set for the presentation?"</div>
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
                                            <div className="text-gray-500 text-sm mb-1.5 dark:text-gray-400"><span className="font-semibold text-gray-900 dark:text-white">Joseph Mcfall</span> and <span className="font-medium text-gray-900 dark:text-white">5 others</span> started following you.</div>
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
                                            <div className="text-gray-500 text-sm mb-1.5 dark:text-gray-400"><span className="font-semibold text-gray-900 dark:text-white">Bonnie Green</span> and <span className="font-medium text-gray-900 dark:text-white">141 others</span> love your story. See it and view more stories.</div>
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
                                            <div className="text-gray-500 text-sm mb-1.5 dark:text-gray-400"><span className="font-semibold text-gray-900 dark:text-white">Leslie Livingston</span> mentioned you in a comment: <span className="font-medium text-blue-500" href="#">@bonnie.green</span> what do you say?</div>
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
                                            <div className="text-gray-500 text-sm mb-1.5 dark:text-gray-400"><span className="font-semibold text-gray-900 dark:text-white">Robert Brown</span> posted a new video: Glassmorphism - learn how to implement the new design trend.</div>
                                            <div className="text-xs text-blue-600 dark:text-blue-500">3 hours ago</div>
                                        </div>
                                    </a>
                                </div>
                                <a href="#" className="block py-2 text-sm font-medium text-center text-gray-900 rounded-b-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white">
                                    <div className="inline-flex items-center ">
                                        <svg className="w-4 h-4 me-2 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 14">
                                            <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                                        </svg>
                                        View all
                                    </div>
                                </a>
                            </div>

                            {/* avatar do usuario */}
                            <div className="flex items-center">
                                <div className="flex items-center ms-3">
                                    <div>
                                        <button type="button" className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" aria-expanded="false" data-dropdown-toggle="dropdown-user">
                                            <span className="sr-only">Open user menu</span>
                                            <img className="w-8 h-8 rounded-full" src="https://flowbite.com/docs/images/people/profile-picture-5.jpg" alt="user photo" />
                                        </button>
                                    </div>
                                    <div className="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-sm shadow-sm dark:bg-gray-700 dark:divide-gray-600" id="dropdown-user">
                                        <div className="px-4 py-3" role="none">
                                            <p className="text-sm text-gray-900 dark:text-white" role="none">Nome do usuario</p>
                                            <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-300" role="none">Email</p>
                                        </div>
                                        <ul className="py-1" role="none">
                                            <li>
                                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Perfil</a>
                                            </li>
                                            <li>
                                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Configurações</a>
                                            </li>
                                            <li>
                                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Sair</a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </nav>

            {/* itens da sidebar */}
            <aside
                id="logo-sidebar"
                className={`fixed top-0 left-0 z-40 h-screen pt-20 transition-all bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 ${navFechada ? 'w-16' : 'w-64'}`} aria-label="Sidebar">
                <div className={`flex px-2 mb-5 ${navFechada ? 'justify-center' : 'justify-end'}`}>
                    <button
                        onClick={sidebar}
                        className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        {navFechada ? (
                            <svg className="hs-overlay-minified:block shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="18" x="3" y="3" rx="2" />
                                <path d="M15 3v18" />
                                <path d="m8 9 3 3-3 3" />
                            </svg>
                        ) : (
                            <svg className="hs-overlay-minified:hidden shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="18" x="3" y="3" rx="2" />
                                <path d="M15 3v18" />
                                <path d="m10 15-3-3 3-3" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* links */}
                <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
                    <ul className="space-y-2 font-medium">
                        {links.map((link) => (
                            <li key={link.href}>
                                <a href={link.href} className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                    {link.icon}
                                    <span
                                        className={
                                            "ml-3 transition-all duration-200 " +
                                            (navFechada ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto")
                                        }
                                    >
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