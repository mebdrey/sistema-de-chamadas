'use client'
import { useState } from "react";

export default function ChamadosTecnico() {
  const [isOpen, setIsOpen] = useState(false); // p drawer abrir e fechar

  return (
    <>
      <div className="m-50"></div>

      {/* Card */}
      <div onClick={() => setIsOpen(true)} className="max-w-xs flex flex-col bg-white border border-gray-200 border-t-4 border-t-blue-600 shadow-2xs rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:border-t-blue-500 dark:shadow-neutral-700/70 cursor-pointer" >
        <div className="p-4 md:p-5">
          <div className="px-4 pt-2 pb-4 mb-4 border-b border-gray-200 sm:px-5 dark:border-neutral-700">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Assunto chamado</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-neutral-500">Usuário</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">Nome usuario</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-neutral-500">Criado em</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">data</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-neutral-500">Prioridade</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">alta, media, baixa</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-neutral-500">Chamado ID</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">#</p>
            </div>
          </div>
          <a className="mt-3 inline-flex items-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-hidden focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-600 dark:focus:text-blue-600" href="#">
            Card link
            <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
          </a>
        </div>
      </div>

      {/* Drawer */}
      <div id="drawer-right-example" className={`fixed top-0 right-0 z-99 h-screen p-4 overflow-y-auto transition-transform bg-white w-80 dark:bg-gray-800 ${isOpen ? "translate-x-0" : "translate-x-full"}`} tabIndex="-1" aria-labelledby="drawer-right-label" >
        <h5 id="drawer-right-label" className="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>Detalhes do chamado</h5>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
          </svg>
          <span className="sr-only">Close menu</span>
        </button>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Supercharge your hiring by taking advantage of our <a href="#" className="text-blue-600 underline font-medium dark:text-blue-500 hover:no-underline">limited-time sale</a> for Flowbite Docs + Job Board.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <a href="#" className="px-4 py-2 text-sm font-medium text-center text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Learn more</a>
          <a href="#" className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
            Get access
            <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
            </svg>
          </a>
        </div>
      </div>
    </>
  );
}
