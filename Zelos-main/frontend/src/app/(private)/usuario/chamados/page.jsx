"use client"
import SideBar from '../../../components/NavBar.jsx';
import { useState } from 'react'

export default function chamadosCliente() {
    const [selecionarPeriodo, setSelecionarPeriodo] = useState('mes') // "mes" = esse mês
    return (
        <>
            {/* <SideBar userType="usuario" /> */}
            {/* conteudo da pagina */}
            <div className="p-4 w-full">
                <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">


                    <div className='flex flex-row w-full justify-between mb-15'>
                        {/* select */}
                        <button id="dropdownRadioBgHoverButton" data-dropdown-toggle="dropdownRadioBgHover" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-8 py-2.5 h-fit text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">Período <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                        </svg>
                        </button>

                        <div id="dropdownRadioBgHover" className="z-10 hidden w-48 bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600">
                            <ul className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownRadioBgHoverButton">
                                <li>
                                    <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <input id="default-radio-4" type="radio" value="" name="default-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                                        <label htmlFor="default-radio-4" className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">Essa semana</label>
                                    </div>
                                </li>
                                <li>
                                    <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <input id="default-radio-5" type="radio" value="mes" name="default-radio" checked={selecionarPeriodo === 'mes'} onChange={() => setSelectedPeriod('mes')} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                                        <label htmlFor="default-radio-5" className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">Esse mês</label>
                                    </div>
                                </li>
                                <li>
                                    <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <input id="default-radio-6" type="radio" value="" name="default-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                                        <label htmlFor="default-radio-6" className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">Esse ano</label>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* barra de pesquisa */}
                        <form className="w-96">
                            <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                            <div className="relative">
                                {/* <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                    </svg>
                                </div> */}
                                <input type="search" id="default-search" className="block w-full px-8 py-2.5 h-fit text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Pesquisar chamados" required />
                                <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"><svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                </svg></button>
                            </div>
                        </form>

                    </div>

                    <section>

                        {/* */}
                        <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" id="default-tab" data-tabs-toggle="#default-tab-content" role="tablist">
                                <li className="me-2" role="presentation">
                                    <button className="inline-block p-4 border-b-2 rounded-t-lg" id="todos-tab" data-tabs-target="#todos" type="button" role="tab" aria-controls="todos" aria-selected="false">Todos</button>
                                </li>
                                <li className="me-2" role="presentation">
                                    <button className="inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" id="aberto-tab" data-tabs-target="#aberto" type="button" role="tab" aria-controls="aberto" aria-selected="false">Em aberto</button>
                                </li>
                                <li className="me-2" role="presentation">
                                    <button className="inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" id="andamento-tab" data-tabs-target="#andamento" type="button" role="tab" aria-controls="andamento" aria-selected="false">Em andamento</button>
                                </li>
                                <li role="presentation">
                                    <button className="inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" id="encerrados-tab" data-tabs-target="#encerrados" type="button" role="tab" aria-controls="encerrados" aria-selected="false">Encerrados</button>
                                </li>
                            </ul>
                        </div>
                        
                        <div id="default-tab-content">
                            {/* <div className="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="todos" role="tabpanel" aria-labelledby="todos-tab">
                                <p className="text-sm text-gray-500 dark:text-gray-400">This is some placeholder content the <strong className="font-medium text-gray-800 dark:text-white">todos tab's associated content</strong>. Clicking another tab will toggle the visibility of this one htmlFor the next. The tab JavaScript swaps classes to control the content visibility and styling.</p>
                            </div> */}

                            <div class="hidden flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70" id="todos" role="tabpanel" aria-labelledby="todos-tab">
                                <div class="p-4 md:p-5">
                                    <h3 class="text-lg font-bold text-gray-800 dark:text-white">
                                        Card title
                                    </h3>
                                    <p class="mt-2 text-gray-500 dark:text-neutral-400">
                                        With supporting text below as a natural lead-in to additional content.
                                    </p>
                                    <a class="mt-3 inline-flex items-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-hidden focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-600 dark:focus:text-blue-600" href="#">
                                        Card link
                                        <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="m9 18 6-6-6-6"></path>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            {/* <div className="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="aberto" role="tabpanel" aria-labelledby="aberto-tab">
                                <p className="text-sm text-gray-500 dark:text-gray-400">This is some placeholder content the <strong className="font-medium text-gray-800 dark:text-white">aberto tab's associated content</strong>. Clicking another tab will toggle the visibility of this one htmlFor the next. The tab JavaScript swaps classes to control the content visibility and styling.</p>
                            </div> */}
                            <div class="hidden flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70" id="aberto" role="tabpanel" aria-labelledby="aberto-tab">
                                <div class="p-4 md:p-5">
                                    <h3 class="text-lg font-bold text-gray-800 dark:text-white">
                                        Card title
                                    </h3>
                                    <p class="mt-2 text-gray-500 dark:text-neutral-400">
                                        With supporting text below as a natural lead-in to additional content.
                                    </p>
                                    <a class="mt-3 inline-flex items-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-hidden focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-600 dark:focus:text-blue-600" href="#">
                                        Card link
                                        <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="m9 18 6-6-6-6"></path>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            {/* <div className="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="andamento" role="tabpanel" aria-labelledby="andamento-tab">
                                <p className="text-sm text-gray-500 dark:text-gray-400">This is some placeholder content the <strong className="font-medium text-gray-800 dark:text-white">andamento tab's associated content</strong>. Clicking another tab will toggle the visibility of this one htmlFor the next. The tab JavaScript swaps classes to control the content visibility and styling.</p>
                            </div> */}
                            <div class="hidden flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70" id="andamento" role="tabpanel" aria-labelledby="andamento-tab">
                                <div class="p-4 md:p-5">
                                    <h3 class="text-lg font-bold text-gray-800 dark:text-white">
                                        Card title
                                    </h3>
                                    <p class="mt-2 text-gray-500 dark:text-neutral-400">
                                        With supporting text below as a natural lead-in to additional content.
                                    </p>
                                    <a class="mt-3 inline-flex items-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-hidden focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-600 dark:focus:text-blue-600" href="#">
                                        Card link
                                        <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="m9 18 6-6-6-6"></path>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            {/* <div className="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="encerrados" role="tabpanel" aria-labelledby="encerrados-tab">
                                <p className="text-sm text-gray-500 dark:text-gray-400">This is some placeholder content the <strong className="font-medium text-gray-800 dark:text-white">encerrados tab's associated content</strong>. Clicking another tab will toggle the visibility of this one htmlFor the next. The tab JavaScript swaps classes to control the content visibility and styling.</p>
                            </div> */}
                            <div class="hidden flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70" id="encerrados" role="tabpanel" aria-labelledby="encerrados-tab">
                                <div class="p-4 md:p-5">
                                    <h3 class="text-lg font-bold text-gray-800 dark:text-white">
                                        Card title
                                    </h3>
                                    <p class="mt-2 text-gray-500 dark:text-neutral-400">
                                        With supporting text below as a natural lead-in to additional content.
                                    </p>
                                    <a class="mt-3 inline-flex items-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-hidden focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-600 dark:focus:text-blue-600" href="#">
                                        Card link
                                        <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="m9 18 6-6-6-6"></path>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>


                    </section>
                </div>
            </div>
        </>
    )
}