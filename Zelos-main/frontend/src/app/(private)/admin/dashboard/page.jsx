"use client"
import React, { useEffect, useState, useRef } from "react";
import './dashboard.css'
import GraficoDeLinhas from '../../../../components/GraficoLinhas/GraficoDeLinhas.jsx'
import GraficoChamadosPorMes from '../../../../components/GraficoMes/GraficoChamadosPorMes.jsx'
import AnimatedNumber from '@/components/AnimatedValue/AnimatedValue.jsx'

export default function admDashboard() {
 const [modo, setModo] = useState('mensal'); // 'mensal' ou 'anual'
  const [qndtChamados, setQndtChamados] = useState([]);

  // Função para buscar dados do backend
  const fetchChamados = async () => {
    try {
      const res = await fetch(`http://localhost:8080/contar-por-status?modo=${modo}`);
      const data = await res.json();
      setQndtChamados(data);
    } catch (error) {
      console.error('Erro ao buscar dados dos chamados:', error);
    }
  };

  useEffect(() => {
    fetchChamados();
  }, [modo]);

  // Função para alternar entre mensal/anual
  const handleToggle = () => {
    setModo((prev) => (prev === 'mensal' ? 'anual' : 'mensal'));
  };

  return (
    <>
      {/* conteudo da pagina */}
      <div className="page">
        <div className="p-4 w-full">
          <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">

             {/* TOGGLE */}
      <div className="mb-4 flex justify-center items-center gap-x-3">
        <label htmlFor="toggle-count-switch" className="text-sm text-gray-800 dark:text-neutral-200">Mensal</label>
        <label htmlFor="toggle-count-switch" className="relative inline-block w-11 h-6 cursor-pointer">
          <input
            type="checkbox"
            id="toggle-count-switch"
            className="peer sr-only"
            checked={modo === 'anual'}
            onChange={handleToggle}
          />
          <span className="absolute inset-0 bg-gray-200 rounded-full transition-colors duration-200 ease-in-out peer-checked:bg-blue-600 dark:bg-neutral-700 dark:peer-checked:bg-blue-500"></span>
          <span className="absolute top-1/2 start-0.5 -translate-y-1/2 size-5 bg-white rounded-full shadow-xs transition-transform duration-200 ease-in-out peer-checked:translate-x-full dark:bg-neutral-400 dark:peer-checked:bg-white"></span>
        </label>
        <label htmlFor="toggle-count-switch" className="text-sm text-gray-800 dark:text-neutral-200">Anual</label>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        {qndtChamados.map((nChamados, index) => (
          <div key={index} className="flex items-center justify-center h-fit rounded-sm">
            <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <div className="flex flex-row gap-3">
                <svg className="w-7 h-7 text-gray-500 dark:text-gray-400 mb-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 5h-.7c.229-.467.349-.98.351-1.5a3.5 3.5 0 0 0-3.5-3.5c-1.717 0-3.215 1.2-4.331 2.481C8.4.842 6.949 0 5.5 0A3.5 3.5 0 0 0 2 3.5c.003.52.123 1.033.351 1.5H2a2 2 0 0 0-2 2v3a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a2 2 0 0 0-2-2ZM8.058 5H5.5a1.5 1.5 0 0 1 0-3c.9 0 2 .754 3.092 2.122-.219.337-.392.635-.534.878Zm6.1 0h-3.742c.933-1.368 2.371-3 3.739-3a1.5 1.5 0 0 1 0 3h.003ZM11 13H9v7h2v-7Zm-4 0H2v5a2 2 0 0 0 2 2h3v-7Zm6 0v7h3a2 2 0 0 0 2-2v-5h-5Z" />
                </svg>
                <h5 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  <AnimatedNumber value={nChamados.qtd} duration={300} />
                </h5>
              </div>

              <p className="mb-3 font-normal text-gray-500 dark:text-gray-400">
                Chamados {nChamados.tipo}
              </p>
              <a href={nChamados.link} className="inline-flex font-medium items-center text-blue-600 hover:underline">
                Ver mais
                <svg className="w-3 h-3 ms-2.5 rtl:rotate-[270deg]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>

            <div className="flex items-center justify-center h-fit mb-4 rounded-sm">
              <div className="w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">

                <GraficoChamadosPorMes />
              </div>
            </div>

            {/* <div className="tabela">
              <h1 className="text-purple-700">Usuários</h1>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-purple-700 uppercase bg-purple-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Nome
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Setor
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        teste
                      </th>
                      <td className="px-6 py-4">
                        técnico
                      </td>
                      <td className="px-6 py-4">
                        teste@gmail.com
                      </td>
                      <td className="px-6 py-4">
                        ativo
                      </td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        teste2
                      </th>
                      <td className="px-6 py-4">
                        técnico
                      </td>
                      <td className="px-6 py-4">
                        teste2@gmail.com
                      </td>
                      <td className="px-6 py-4">
                        inativo
                      </td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        teste3
                      </th>
                      <td className="px-6 py-4">
                        usuário
                      </td>
                      <td className="px-6 py-4">
                        teste3@gmail.com
                      </td>
                      <td className="px-6 py-4">
                        ativo
                      </td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        teste4
                      </th>
                      <td className="px-6 py-4">
                        usuário
                      </td>
                      <td className="px-6 py-4">
                        teste4@gmail.com
                      </td>
                      <td className="px-6 py-4">
                        inativo
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div> */}

            {/* grupo de 4 graficos pequenos */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* <GraficoDeLinhas /> */}

        


            {/* grafico grande */}
            {/* <div className="flex items-center justify-center h-48 mb-4 rounded-sm bg-gray-50 dark:bg-gray-800">
            <p className="text-2xl text-gray-400 dark:text-gray-500">
              <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16" />
              </svg>
            </p>
          </div> */}


            {/* grupo de 4 graficos pequenos */}
            {/* <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-center rounded-sm bg-gray-50 h-28 dark:bg-gray-800">
              <p className="text-2xl text-gray-400 dark:text-gray-500">
                <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16" />
                </svg>
              </p>
            </div>
            <div className="flex items-center justify-center rounded-sm bg-gray-50 h-28 dark:bg-gray-800">
              <p className="text-2xl text-gray-400 dark:text-gray-500">
                <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16" />
                </svg>
              </p>
            </div>
            <div className="flex items-center justify-center rounded-sm bg-gray-50 h-28 dark:bg-gray-800">
              <p className="text-2xl text-gray-400 dark:text-gray-500">
                <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16" />
                </svg>
              </p>
            </div>
            <div className="flex items-center justify-center rounded-sm bg-gray-50 h-28 dark:bg-gray-800">
              <p className="text-2xl text-gray-400 dark:text-gray-500">
                <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16" />
                </svg>
              </p>
            </div>
          </div> */}

          </div>
          </div>
        </div>
      </div>
    </>
  )
}