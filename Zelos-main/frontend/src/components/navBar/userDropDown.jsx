'use client';
import { useState } from 'react';

export default function UserDropdown({ nome, email }) {
    const [open, setOpen] = useState(false);

    return (
        <>
  <div className="flex items-center">
                                <div className="flex items-center ms-3">
                                    <div>
                                        <button type="button" className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" aria-expanded="false" data-dropdown-toggle="dropdown-user">
                                            <span className="sr-only">Open user menu</span>
                                            <div class="relative w-8 h-8 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                                                <svg class="absolute w-10 h-10 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
                                            </div>
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
        </>



        //     <div className="flex items-center">
        //   <div className="flex items-center ms-3">
        //     <div>
        //       <button
        //         type="button"
        //         className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
        //         aria-expanded={open}
        //         onClick={() => setOpen(!open)}
        //       >
        //         <span className="sr-only">Open user menu</span>
        //         <div className="relative w-8 h-8 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
        //           <svg
        //             className="absolute w-10 h-10 text-gray-400 -left-1"
        //             fill="currentColor"
        //             viewBox="0 0 20 20"
        //             xmlns="http://www.w3.org/2000/svg"
        //           >
        //             <path
        //               fillRule="evenodd"
        //               d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
        //               clipRule="evenodd"
        //             />
        //           </svg>
        //         </div>
        //       </button>
        //     </div>
        //     <div
        //       className={`z-50 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-sm shadow-sm dark:bg-gray-700 dark:divide-gray-600 ${
        //         open ? 'block' : 'hidden'
        //       }`}
        //     >
        //       <div className="px-4 py-3" role="none">
        //         <p className="text-sm text-gray-900 dark:text-white" role="none">{nome}</p>
        //         <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-300" role="none">{email}</p>
        //       </div>
        //       <ul className="py-1" role="none">
        //         <li>
        //           <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Perfil</a>
        //         </li>
        //         <li>
        //           <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Configurações</a>
        //         </li>
        //         <li>
        //           <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Sair</a>
        //         </li>
        //       </ul>
        //     </div>
        //   </div>
        // </div>



    );
}
