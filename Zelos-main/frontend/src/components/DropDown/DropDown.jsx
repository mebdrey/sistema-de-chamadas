// 'use client';
// import React, { useState, useEffect } from 'react';

// const OrdenarPor = () => {

// const [showDropdown, setShowDropdown] = useState(false); // mostrar o dropdown
// const [ordenarPor, setOrdenarPor] = useState('mais_recente'); // ordenar por mais recente ou mais antigo, por padrao ele mostra os mais recentes primeiro

// const opcoesOrdenacao = [
//         { label: 'Mais antigo primeiro', value: 'mais_antigo' },
//         { label: 'Mais recente primeiro', value: 'mais_recente' }
//     ];

//     // Fecha ao clicar fora
//     useEffect(() => {
//         const handleClickOutside = (event) => { if (!event.target.closest('#ordenarDropdownWrapper')) {setShowDropdown(false);}};
//         document.addEventListener('click', handleClickOutside);
//         return () => document.removeEventListener('click', handleClickOutside);
//     }, []);
//     return(
//         <>
//         {/* select */}
//                         <div id="ordenarDropdownWrapper" className="relative inline-block">
//                             <button onClick={(e) => {
//                                 e.stopPropagation(); // previne o fechamento imediato
//                                 setShowDropdown(!showDropdown);
//                             }} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 poppins-medium rounded-lg text-sm px-8 py-2.5 h-fit text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button" > Ordenar por
//                                 <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6" >
//                                     <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
//                                 </svg>
//                             </button>
//                             <div className={`absolute mt-2 z-10 ${showDropdown ? 'block' : 'hidden'} w-48 bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600`}>
//                                 {opcoesOrdenacao.map((opcao, index) => (
//                                     <div key={index} className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
//                                         <input id={`ordenar-radio-${index}`} type="radio" value={opcao.value} name="ordenar" checked={ordenarPor === opcao.value} onChange={() => setOrdenarPor(opcao.value)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
//                                         <label htmlFor={`ordenar-radio-${index}`} className="w-full ms-2 text-sm poppins-medium text-gray-900 rounded-sm dark:text-gray-300">
//                                             {opcao.label}
//                                         </label>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//         </>)}
// export default OrdenarPor;
'use client';
import React, { useState, useEffect } from 'react';

const OrdenarPor = ({ ordenarPor, setOrdenarPor }) => {
  const [showDropdown, setShowDropdown] = useState(false); // mostrar o dropdown

  const opcoesOrdenacao = [
    { label: 'Mais antigo primeiro', value: 'mais_antigo' },
    { label: 'Mais recente primeiro', value: 'mais_recente' }
  ];

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('#ordenarDropdownWrapper')) {setShowDropdown(false);}
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div id="ordenarDropdownWrapper" className="relative inline-block">
      <button onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }} className="inline-flex items-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-600 focus:ring-4 focus:ring-[#F8FAFB] dark:focus:ring-gray-800 focus:text-[#7F56D8] dark:focus:text-white poppins-medium rounded-lg text-sm px-3 py-1.5" type="button" aria-haspopup="true" aria-expanded={showDropdown}> <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true" >
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" /></svg><p className='hidden md:inline focus:text-[#7F56D8] poppins-medium text-sm ms-3 '>Ordenar por</p>
      </button>

      <div className={`absolute mt-2 z-10 ${showDropdown ? 'block' : 'hidden'} w-48 bg-white dark:bg-gray-700 divide-y divide-gray-100 rounded-lg shadow-sm `}>
        {opcoesOrdenacao.map((opcao, index) => (
          <div key={index} className="flex items-center p-2 rounded-sm hover:bg-gray-100 ">
            <input id={`ordenar-radio-${index}`} type="radio" value={opcao.value} name="ordenar" checked={ordenarPor === opcao.value} onChange={() => setOrdenarPor(opcao.value)} className="w-4 h-4 text-[#7F56D8] bg-gray-100 border-gray-300 focus:ring-[#E6DAFF] focus:ring-2" />
            <label htmlFor={`ordenar-radio-${index}`} className="w-full ms-2 text-sm poppins-medium text-gray-900 rounded-sm dark:text-gray-300">
              {opcao.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdenarPor;

