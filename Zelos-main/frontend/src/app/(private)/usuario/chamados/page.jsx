"use client"
import SideBar from '../../../../components/NavBar/NavBar.jsx';
import { useEffect, useState } from "react";
import { initFlowbite } from 'flowbite'

export default function ChamadosCliente() {
    // select de periodo 
    const [selecionarPeriodo, setSelecionarPeriodo] = useState('mes') // "mes" = esse mês
    // espera o componente estar carregado no navegador p evitar erros de renderizacao
    const [isMounted, setIsMounted] = useState(false);
    // p selecionar os chamados com base no status
    const [chamados, setChamados] = useState([])
    const [abaAtiva, setAbaAtiva] = useState('todos')
    // guarda o tipo de serviço que o usuario seleciona 
    const [tipoServico, setTipoServico] = useState('');
    // guarda a sala selecionada 
    const [salaSelecionada, setSalaSelecionada] = useState('');

    // funcao do flowbite p/ configurar funções de inicializacao p dropdown, modal e assim por diante
    // useEffect(() => {
    //     initFlowbite()
    // }, [])

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // enviar respostas p back-end
    // useEffect(() => {
    //     //   fetch('http://localhost:8080/historico-chamados', { credentials: 'include' })
    //     fetch('http://localhost:8080/verChamados', { credentials: 'include' })
    //         .then(res => {
    //             if (!res.ok) throw new Error('Erro ao buscar dados');
    //             return res.json();
    //         })
    //         .then(data => setCliente(data.infoCliente || []))
    //         .catch(err => {
    //             console.error('Erro ao carregar chamados do usuário:', err);
    //             setCliente([]);
    //         });
    // }, []);

    function primeiraLetraMaiuscula(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    // STATUS DOS CHAMAFOS
    const statusAbas = ['Todos', 'Em aberto', 'Em andamento', 'Encerrados']
    // funcao p normalizar id
    const normalizarId = (texto) => texto.toLowerCase().replace(/\s+/g, '-')

    // array com periodos
    const periodos = [
        { label: 'Essa semana', value: 'semana' },
        { label: 'Esse mês', value: 'mes' },
        { label: 'Esse ano', value: 'ano' }
    ];

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
                        </svg></button>

                        <div id="dropdownRadioBgHover" className="z-10 hidden w-48 bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600">

                            {/* {periodos.map((periodo, index) => (
                                <div key={index} className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <input id={`periodo-radio-${index}`} type="radio" value={periodo.value} name="periodo" checked={selecionarPeriodo === periodo.value} onChange={() => setSelecionarPeriodo(periodo.value)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                                    <label htmlFor={`periodo-radio-${index}`} className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300"> {periodo.label} </label>
                                </div>
                            ))} */}

                            {isMounted &&
                                periodos.map((periodo, index) => (
                                    <div key={index} className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <input id={`periodo-radio-${index}`} type="radio" value={periodo.value} name="periodo" checked={selecionarPeriodo === periodo.value} onChange={() => setSelecionarPeriodo(periodo.value)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                                        <label htmlFor={`periodo-radio-${index}`} className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">
                                            {periodo.label}
                                        </label>
                                    </div>
                                ))}


                            {/* <ul className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownRadioBgHoverButton">
                                <li>
                                    <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <input id={`periodo-radio-${index}`} type="radio" value="" name="default-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                                        <label htmlFor={`periodo-radio-${index}`} className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">Essa semana</label>
                                    </div>
                                </li>
                                <li>
                                    <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <input id="default-radio-5" type="radio" value="mes" name="default-radio" defaultChecked={true} onChange={() => setSelecionarPeriodo('mes')}} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                                        <label htmlFor="default-radio-5" className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">Esse mês</label>
                                    </div>
                                </li>
                                <li>
                                    <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <input id="default-radio-6" type="radio" value="" name="default-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                                        <label htmlFor="default-radio-6" className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">Esse ano</label>
                                    </div>
                                </li>
                            </ul> */}
                        </div>

                        {/* barra de pesquisa */}
                        <form className="flex items-center">
                            <label htmlFor="simple-search" className="sr-only">Search</label>
                            <div className="relative w-80">
                                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2" />
                                    </svg>
                                </div>
                                <input type="text" id="simple-search" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Pesquisar chamado" required />
                            </div>
                            <button type="submit" className="p-2.5 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                </svg>
                                <span className="sr-only">Search</span>
                            </button>
                        </form>
                    </div>
                    <section>
                        <div className="flex flex-row items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700">
                            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" id="default-tab" data-tabs-toggle="#default-tab-content" role="tablist">
                                {/* <li className="me-2" role="presentation">
                                    <button className={`inline-block p-4 border-b-2 rounded-t-lg ${abaAtiva === 'todos' ? 'active' : ''}`} onClick={() => setAbaAtiva('todos')} id="todos-tab" data-tabs-target="#todos" type="button" role="tab" aria-controls="todos" aria-selected="false">Todos</button>
                                </li>
                                <li className="me-2" role="presentation">
                                    <button className={`inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${abaAtiva === 'em aberto' ? 'active' : ''}`} onClick={() => setAbaAtiva('em aberto')} id="aberto-tab" data-tabs-target="#aberto" type="button" role="tab" aria-controls="aberto" aria-selected="false">Em aberto</button>
                                </li>
                                <li className="me-2" role="presentation">
                                    <button className={`inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300${abaAtiva === 'em andamento' ? 'active' : ''}`} onClick={() => setAbaAtiva('em andamento')} id="andamento-tab" data-tabs-target="#andamento" type="button" role="tab" aria-controls="andamento" aria-selected="false">Em andamento</button>
                                </li>
                                <li role="presentation">
                                    <button className={`inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${abaAtiva === 'encerrados' ? 'active' : ''}`} onClick={() => setAbaAtiva('encerrados')} id="encerrados-tab" data-tabs-target="#encerrados" type="button" role="tab" aria-controls="encerrados" aria-selected="false">Encerrados</button>
                                </li> */}

                                {/* Tabs */}
                                {statusAbas.map((status) => {
                                    const statusId = normalizarId(status)
                                    return (
                                        <li className="me-2" role="presentation" key={status}>
                                            <button
                                                className={`inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${abaAtiva === statusId ? 'active' : ''}`}
                                                onClick={() => setAbaAtiva(statusId)}
                                                id={`${statusId}-tab`}
                                                data-tabs-target={`#${statusId}`}
                                                type="button"
                                                role="tab"
                                                aria-controls={statusId}
                                                aria-selected={abaAtiva === statusId}
                                            >
                                                {status}
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>

                            {/* modal */}
                            <button data-modal-target="crud-modal" data-modal-toggle="crud-modal" className="flex flex-row items-center block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 h-fit text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button"><svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>Novo chamado</button>

                            <div id="crud-modal" tabIndex="-1" aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                                <div className="relative p-4 w-full max-w-md max-h-full">

                                    <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">

                                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Novo chamado</h3>
                                            <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="crud-modal">
                                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                                </svg>
                                                <span className="sr-only">Close modal</span>
                                            </button>
                                        </div>

                                        <form className="p-4 md:p-5">
                                            <div className="grid gap-4 mb-4 grid-cols-2">
                                                <div className="col-span-2">
                                                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Assunto</label>
                                                    <input type="text" name="name" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Digite o assunto" required="" />
                                                </div>
                                                <div className="col-span-2">
                                                    <label htmlFor="servico" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tipo de serviço</label>
                                                    <select id="servico" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" value={tipoServico} onChange={(e) => setTipoServico(e.target.value)}>
                                                        <option value="">Selecione tipo de serviço</option>
                                                        <option value="TV">TV/Monitors</option>
                                                        <option value="PC">PC</option>
                                                        <option value="GA">Gaming/Console</option>
                                                        <option value="PH">Phones</option>
                                                    </select>
                                                </div>
                                                <div className="col-span-2">
                                                    <label htmlFor="local" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Local</label>
                                                    <div className="flex">
                                                        <button id="states-button" data-dropdown-toggle="dropdown-states" className="shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-s-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700 dark:text-white dark:border-gray-600" type="button">Selecionar bloco <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                                        </svg>
                                                        </button>
                                                        <div id="dropdown-states" className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700">
                                                            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="states-button">
                                                                <li>
                                                                    <button type="button" className="inline-flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                                                                        <div className="inline-flex items-center">Bloco A</div>
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button type="button" className="inline-flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                                                                        <div className="inline-flex items-center">Bloco B</div>
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button type="button" className="inline-flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                                                                        <div className="inline-flex items-center">Bloco C</div>
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button type="button" className="inline-flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                                                                        <div className="inline-flex items-center">Bloco D</div>
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <label htmlFor="salas" className="sr-only">Escolha a sala</label>
                                                        <select id="salas" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-e-lg border-s-gray-100 dark:border-s-gray-700 border-s-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={salaSelecionada} onChange={(e) => setSalaSelecionada(e.target.value)}>
                                                            <option value="">Escolha a sala</option>
                                                            <option value="CA">California</option>
                                                            <option value="TX">Texas</option>
                                                            <option value="WH">Washinghton</option>
                                                            <option value="FL">Florida</option>
                                                            <option value="VG">Virginia</option>
                                                            <option value="GE">Georgia</option>
                                                            <option value="MI">Michigan</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Descrição</label>
                                                    <textarea id="description" rows="4" className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Escreva a descrição do chamado"></textarea>
                                                </div>
                                                <div className="col-span-2">
                                                    <label htmlFor="file" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Enviar imagem</label>
                                                    {/* <textarea id="file" rows="4" className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Escreva a descrição do chamado"></textarea> */}
                                                    <div className="flex items-center justify-center w-1/2 h-20">
                                                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                <svg className="me-1 -ms-1 w-8 h-8 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                                                            </div>
                                                            <input id="dropzone-file" type="file" className="hidden" />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <button type="submit" className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Criar chamado</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="default-tab-content">
                            {/* <div className="hidden flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70" id="todos" role="tabpanel" aria-labelledby="todos-tab">
                                <div className="p-4 md:p-5">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Ticket# 2023-CS123</h3>
                                    <h6 className="text-base font-bold text-gray-800 dark:text-white">How to deposit money to my portal?</h6>
                                    <p className="mt-2 text-gray-500 dark:text-neutral-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>

                                </div>
                                <div className="flex flex-row justify-between items-center bg-gray-100 border-t border-gray-200 rounded-b-xl py-3 px-4 md:py-4 md:px-5 dark:bg-neutral-900 dark:border-neutral-700">
                                    <p className="text-sm text-gray-500 dark:text-neutral-500">Posted at 12:45 AM</p>
                                    <a className="inline-flex items-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-hidden focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-600 dark:focus:text-blue-600" href="#">
                                        Card link
                                        <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m9 18 6-6-6-6"></path>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            <div className="hidden flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70" id="aberto" role="tabpanel" aria-labelledby="aberto-tab">
                                <div className="p-4 md:p-5">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Ticket# 2023-CS123</h3>
                                    <h6 className="text-base font-bold text-gray-800 dark:text-white">How to deposit money to my portal?</h6>
                                    <p className="mt-2 text-gray-500 dark:text-neutral-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>

                                </div>
                                <div className="flex flex-row justify-between items-center bg-gray-100 border-t border-gray-200 rounded-b-xl py-3 px-4 md:py-4 md:px-5 dark:bg-neutral-900 dark:border-neutral-700">
                                    <p className="text-sm text-gray-500 dark:text-neutral-500">Posted at 12:45 AM</p>
                                    <a className="inline-flex items-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-hidden focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-600 dark:focus:text-blue-600" href="#">
                                        Card link
                                        <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m9 18 6-6-6-6"></path>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            <div className="hidden flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70" id="andamento" role="tabpanel" aria-labelledby="andamento-tab">
                                <div className="p-4 md:p-5">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Ticket# 2023-CS123</h3>
                                    <h6 className="text-base font-bold text-gray-800 dark:text-white">How to deposit money to my portal?</h6>
                                    <p className="mt-2 text-gray-500 dark:text-neutral-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>

                                </div>
                                <div className="flex flex-row justify-between items-center bg-gray-100 border-t border-gray-200 rounded-b-xl py-3 px-4 md:py-4 md:px-5 dark:bg-neutral-900 dark:border-neutral-700">
                                    <p className="text-sm text-gray-500 dark:text-neutral-500">Posted at 12:45 AM</p>
                                    <a className="inline-flex items-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-hidden focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-600 dark:focus:text-blue-600" href="#">Ver relatório<svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m9 18 6-6-6-6"></path>
                                    </svg>
                                    </a>
                                </div>
                            </div>
                            <div className="hidden flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70" id="encerrados" role="tabpanel" aria-labelledby="encerrados-tab">
                                <div className="p-4 md:p-5">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Ticket# 2023-CS123</h3>
                                    <h6 className="text-base font-bold text-gray-800 dark:text-white">How to deposit money to my portal?</h6>
                                    <p className="mt-2 text-gray-500 dark:text-neutral-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                                </div>
                                <div className="flex flex-row justify-between items-center bg-gray-100 border-t border-gray-200 rounded-b-xl py-3 px-4 md:py-4 md:px-5 dark:bg-neutral-900 dark:border-neutral-700">
                                    <p className="text-sm text-gray-500 dark:text-neutral-500">Posted at 12:45 AM</p>
                                    <a className="inline-flex items-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-hidden focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-600 dark:focus:text-blue-600" href="#">
                                        Card link
                                        <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m9 18 6-6-6-6"></path>
                                        </svg>
                                    </a>
                                </div>
                            </div> */}

                            {statusAbas.map((status) => {
                                const statusId = normalizarId(status)
                                const chamadosFiltrados =
                                    status === 'todos'
                                        ? chamados
                                        : chamados.filter((c) => normalizarId(c.status_chamado) === statusId)

                                return (
                                    <div
                                        key={status}
                                        className="hidden flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70"
                                        id={statusId}
                                        role="tabpanel"
                                        aria-labelledby={`${statusId}-tab`}
                                    >
                                        {chamadosFiltrados.length === 0 ? (
                                            <div className="p-4 md:p-5">
                                                <p className="text-gray-500 dark:text-neutral-400">Nenhum chamado encontrado.</p>
                                            </div>
                                        ) : (
                                            chamadosFiltrados.map((chamado) => (
                                                <div key={chamado.id} className="p-4 md:p-5 border-b last:border-0 border-gray-200 dark:border-neutral-700">
                                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Ticket# {chamado.id}</h3>
                                                    <h6 className="text-base font-bold text-gray-800 dark:text-white">{chamado.subtitulo}</h6>
                                                    <p className="mt-2 text-gray-500 dark:text-neutral-400">{chamado.descricao}</p>
                                                    <div className="flex flex-row justify-between items-center bg-gray-100 border-t border-gray-200 rounded-b-xl py-3 px-4 mt-4 dark:bg-neutral-900 dark:border-neutral-700">
                                                        <p className="text-sm text-gray-500 dark:text-neutral-500">
                                                            Postado em {new Date(chamado.criado_em).toLocaleString('pt-BR')}
                                                        </p>
                                                        <a className="inline-flex items-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-hidden focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-600 dark:focus:text-blue-600" href="#">
                                                            Ver chamado
                                                            <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="m9 18 6-6-6-6"></path>
                                                            </svg>
                                                        </a>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                </div>
            </div>
        </>
    )
}