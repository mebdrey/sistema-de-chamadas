'use client'
import { useState } from "react";
import './chamados.css'

export default function ChamadosTecnico() {
    const [isOpen, setIsOpen] = useState(false); // p drawer abrir e fechar

    return (
        <>
            <section className="pagina-chamados  ">
                <div className="indicador">
                    <h1 className="titulo">Chamados</h1>
                </div>

                <div className="container-chamados">

                    <div className="flex justify-between">

                        <div className="total-chamados"><p>Total de Chamados: 1244</p></div>

                        <div className="filtros flex gap-3">
                            <select className="filtro rounded-sm w-[150px] border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-500" >
                                <option value="prioridade">Prioridade</option>
                                <option value="prioridade1">Prioridade Alta</option>
                                <option value="prioridade2">Prioridade Média</option>
                                <option value="prioridade">Prioridade Baixa</option>
                            </select>
                            <select className="filtro rounded-sm w-[150px] border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-500" >
                                <option value="setor">Setores</option>
                                <option value="setor1">Setor Técnico</option>
                                <option value="setor2">Setor de Limpeza</option>
                            </select>
                            <select className="filtro rounded-sm w-[150px] border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-500" >
                                <option value="tempo">Essa semana</option>
                                <option value="tempo1">Hoje</option>
                                <option value="tempo2">Esse mês</option>
                            </select>
                        </div>

                    </div>

                    <div className="cards-chamados">
                        {/**tab do tailwind */}
                        <div class="mb-4 border-b border-gray-200 dark:border-gray-700">
                            {/**Categorias */}
                            <ul class="flex flex-wrap -mb-px text-sm font-medium text-center" id="default-styled-tab" data-tabs-toggle="#default-styled-tab-content" data-tabs-active-classes="text-purple-600 hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-500 border-purple-600 dark:border-purple-500" data-tabs-inactive-classes="dark:border-transparent text-gray-500 hover:text-gray-600 dark:text-gray-400 border-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:text-gray-300" role="tablist">
                                <li class="me-2" role="presentation">
                                    <button class="inline-block p-4 border-b-2 rounded-t-lg" id="profile-styled-tab" data-tabs-target="#styled-profile" type="button" role="tab" aria-controls="profile" aria-selected="false">Todos</button>
                                </li>
                                <li class="me-2" role="presentation">
                                    <button class="inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" id="dashboard-styled-tab" data-tabs-target="#styled-dashboard" type="button" role="tab" aria-controls="dashboard" aria-selected="false">Aberto</button>
                                </li>
                                <li class="me-2" role="presentation">
                                    <button class="inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" id="settings-styled-tab" data-tabs-target="#styled-settings" type="button" role="tab" aria-controls="settings" aria-selected="false">Em andamento</button>
                                </li>
                                <li role="presentation">
                                    <button class="inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" id="contacts-styled-tab" data-tabs-target="#styled-contacts" type="button" role="tab" aria-controls="contacts" aria-selected="false">Fechado</button>
                                </li>
                            </ul>
                        </div>
                        <div id="default-styled-tab-content">
                            {/**Conteúdo */}

                            <div class="hidden p-4 rounded-lg  " id="styled-profile" role="tabpanel" aria-labelledby="profile-tab">
                                <p class="text-sm text-gray-500 dark:text-gray-400">Colocar aqui todos os chamados</p>

                                <div className="cards">
                                    <div className="card p-3 border-1 border-gray-200 rounded-md w-[400px] h-[250px]">
                                        <div className="flex justify-between">
                                            <div className="flex gap-2">
                                                <div className="icone"><svg className="icone-chamado w-[20px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M288.6 76.8C344.8 20.6 436 20.6 492.2 76.8C548.4 133 548.4 224.2 492.2 280.4L328.2 444.4C293.8 478.8 238.1 478.8 203.7 444.4C169.3 410 169.3 354.3 203.7 319.9L356.5 167.3C369 154.8 389.3 154.8 401.8 167.3C414.3 179.8 414.3 200.1 401.8 212.6L249 365.3C239.6 374.7 239.6 389.9 249 399.2C258.4 408.5 273.6 408.6 282.9 399.2L446.9 235.2C478.1 204 478.1 153.3 446.9 122.1C415.7 90.9 365 90.9 333.8 122.1L169.8 286.1C116.7 339.2 116.7 425.3 169.8 478.4C222.9 531.5 309 531.5 362.1 478.4L492.3 348.3C504.8 335.8 525.1 335.8 537.6 348.3C550.1 360.8 550.1 381.1 537.6 393.6L407.4 523.6C329.3 601.7 202.7 601.7 124.6 523.6C46.5 445.5 46.5 318.9 124.6 240.8L288.6 76.8z" /></svg></div>
                                                <h1 className="titulo-chamado">Meu PC não quer atualizar</h1>
                                            </div>

                                            <div className="status">Aberto</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="hidden p-4 rounded-lg " id="styled-dashboard" role="tabpanel" aria-labelledby="dashboard-tab">
                                <p class="text-sm text-gray-500 dark:text-gray-400">Colocar aqui os chamados abertos</p>
                            </div>

                            <div class="hidden p-4 rounded-lg " id="styled-settings" role="tabpanel" aria-labelledby="settings-tab">
                                <p class="text-sm text-gray-500 dark:text-gray-400">Colocar aqui os chamados em andamento</p>
                            </div>

                            <div class="hidden p-4 rounded-lg " id="styled-contacts" role="tabpanel" aria-labelledby="contacts-tab">
                                <p class="text-sm text-gray-500 dark:text-gray-400">Colocar aqui os chamados fechados</p>
                            </div>
                        </div>
                    </div>

                </div>
            </section>


            {/* Card */}

        </>
    );
}
