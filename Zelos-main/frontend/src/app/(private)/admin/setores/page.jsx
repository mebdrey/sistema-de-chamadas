"use client"
import { useEffect, useState } from "react";

// import "./setores.css"
export default function setores() {
    const [mostrarCheckboxes, setMostrarCheckboxes] = useState(false);
    const [todosSelecionados, setTodosSelecionados] = useState(false);
    const [selecionados, setSelecionados] = useState({ 1: false, 3: false });
 const [setores, setSetores] = useState({});


    const checkboxTodos = (checked) => {
        setTodosSelecionados(checked);
        const novos = {};
        Object.keys(selecionados).forEach((id) => {
            novos[id] = checked;
        });
        setSelecionados(novos);
    };

    const checkboxIndividual = (id, checked) => {
        const novos = { ...selecionados, [id]: checked };
        setSelecionados(novos);
        setTodosSelecionados(Object.values(novos).every(Boolean));
    };


  useEffect(() => {
    fetch("/usuarios-por-setor")
      .then(res => res.json())
      .then(data => setSetores(data));
  }, []);


    return (
        <>
            {/* //             <div className="page">
//                 <h1 className="title">Setores</h1>
//                 <div className="limpeza">
//                     <div className="tabela">
//                         <h1 className=" text-purple-700 bg-purple-50">Limpeza</h1>
//                         <div className="linha"></div>
//                         <div className="relative overflow-x-auto">
//                             <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
//                                 <thead className="text-xs text-purple-700 uppercase bg-purple-50 dark:bg-gray-700 dark:text-gray-400">
//                                     <tr>
//                                         <th scope="col" className="col px-6 py-3"> Nome</th>
//                                         <th scope=" col" className="col px-6 py-3"></th>
//                                         <th scope="col" className="col px-6 py-3">Email</th>
//                                         <th scope=" col" className="col px-6 py-3">Status</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                 <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
//                                         <th scope="row" className="th px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste</th>
//                                         <td className="px-6 py-4"></td>
//                                         <td className="px-6 py-4"> teste@gmail.com</td>
//                                         <td className="px-6 py-4">ativo</td>
//                                     </tr>
//                                     <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
//                                         <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste2 </th>
//                                         <td className="px-6 py-4"></td>
//                                         <td className="px-6 py-4">teste2@gmail.com</td>
//                                         <td className="px-6 py-4">inativo</td>
//                                     </tr>
//                                     <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
//                                         <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste3 </th>
//                                         <td className="px-6 py-4">  </td>
//                                         <td className="px-6 py-4"> teste3@gmail.com </td>
//                                         <td className="px-6 py-4"> ativo</td>
//                                     </tr>
//                                     <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
//                                         <th scope="row" className="row px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste4 </th>
//                                         <td className="px-6 py-4"></td>
//                                         <td className="px-6 py-4">teste4@gmail.com</td>
//                                          <td className="px-6 py-4">
//                                             inativo</td>
//                                     </tr>
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="externo">
//                     <div className="tabela">
//                         <h1 className=" text-purple-700 bg-purple-50">Externo</h1>
//                         <div className="linha"></div>
//                         <div className="relative overflow-x-auto">
//                             <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
//                                 <thead className="text-xs text-purple-700 uppercase bg-purple-50 dark:bg-gray-700 dark:text-gray-400">
//                                     <tr>
//                                         <th scope="col" className="px-6 py-3"> Nome</th>
//                                         <th scope="col" className="px-6 py-3"></th>
//                                         <th scope="col" className="px-6 py-3">Email </th>
//                                         <th scope="col" className="px-6 py-3">Status</th>
//                                     </tr></thead>
//                                 <tbody>
//                                 <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
//                                         <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste</th>
//                                         <td className="px-6 py-4"></td>
//                                         <td className="px-6 py-4"> teste@gmail.com</td>
//                                         <td className="px-6 py-4">ativo</td>
//                                     </tr>
//                                     <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
//                                         <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste2 </th>
//                                         <td className="px-6 py-4"></td>
//                                         <td className="px-6 py-4">teste2@gmail.com</td>
//                                         <td className="px-6 py-4">inativo</td>
//                                     </tr>
//                                     <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
//                                         <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste3 </th>
//                                         <td className="px-6 py-4">  </td>
//                                         <td className="px-6 py-4"> teste3@gmail.com </td>
//                                         <td className="px-6 py-4"> ativo</td>
//                                     </tr>
//                                     <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
//                                         <th scope="row" className="row px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste4 </th>
//                                         <td className="px-6 py-4"></td>
//                                         <td className="px-6 py-4">teste4@gmail.com</td>
//                                          <td className="px-6 py-4">inativo</td>
//                                     </tr>
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="manutencao">
//                     <div className="tabela">
//                         <h1 className=" text-purple-700 bg-purple-50">Manutenção</h1>
//                         <div className="linha"></div>
//                         <div className="relative overflow-x-auto">
//                             <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
//                                 <thead className="text-xs text-purple-700 uppercase bg-purple-50 dark:bg-gray-700 dark:text-gray-400">
//                                     <tr>
//                                         <th scope="th col" className="px-6 py-3">Nome</th>
//                                         <th scope="th col" className="px-6 py-3"></th>
//                                         <th scope="th col" className="px-6 py-3">Email</th>
//                                         <th scope="th col" className="px-6 py-3">Status </th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
//                                         <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste</th>
//                                         <td className="px-6 py-4"></td>
//                                         <td className="px-6 py-4"> teste@gmail.com</td>
//                                         <td className="px-6 py-4">ativo</td>
//                                     </tr>
//                                     <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
//                                         <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste2 </th>
//                                         <td className="px-6 py-4"></td>
//                                         <td className="px-6 py-4">teste2@gmail.com</td>
//                                         <td className="px-6 py-4">inativo</td>
//                                     </tr>
//                                     <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
//                                         <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste3 </th>
//                                         <td className="px-6 py-4">  </td>
//                                         <td className="px-6 py-4"> teste3@gmail.com </td>
//                                         <td className="px-6 py-4"> ativo</td>
//                                     </tr>
//                                     <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
//                                         <th scope="row" className="row px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste4 </th>
//                                         <td className="px-6 py-4"></td>
//                                         <td className="px-6 py-4">teste4@gmail.com</td>
//                                          <td className="px-6 py-4">
//                                             inativo</td>
//                                     </tr>
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="apoio">
//                     <div className="tabela">
//                         <h1 className=" text-purple-700 bg-purple-50">Apoio Técnico </h1>
//                         <div className="linha"></div>
//                         <div className="relative overflow-x-auto">
//                             <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
//                                 <thead className="text-xs text-purple-700 uppercase bg-purple-50 dark:bg-gray-700 dark:text-gray-400">
//                                     <tr>
//                                         <th scope="col" className="px-6 py-3"> Nome</th>
//                                         <th scope="col" className="px-6 py-3"> </th>
//                                         <th scope="col" className="px-6 py-3"> Email </th>
//                                         <th scope="col" className="px-6 py-3">Status</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
//                                         <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste </th>
//                                         <td className="px-6 py-4"> </td>
//                                         <td className="px-6 py-4">teste@gmail.com</td>
//                                         <td className="px-6 py-4">ativo</td>
//                                     </tr>
//                                     <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
//                                         <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste2</th>
//                                         <td className="px-6 py-4"> </td>
//                                         <td className="px-6 py-4"> teste2@gmail.com</td>
//                                         <td className="px-6 py-4"> inativo</td>
//                                     </tr>
//                                     <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
//                                         <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste3 </th>
//                                         <td className="px-6 py-4">  </td>
//                                         <td className="px-6 py-4">@gmail.com</td>
//                                         <td className="px-6 py-4">ativo</td></tr>
//                                     <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
//                                         <th scope="row" className="row px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste4</th>
//                                         <td className="px-6 py-4"></td>
//                                         <td className="px-6 py-4">teste4@gmail.Chamados</td>
//                                         <td className="px-6 py-4">inativo</td>
//                                     </tr>
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>
//             </div> */}

            <div className="p-4 w-full">
                <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">

{/* <div class="flex items-center justify-between flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 py-4 bg-white dark:bg-gray-900">
                            <div>
                                <button id="dropdownActionButton" data-dropdown-toggle="dropdownAction" class="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" type="button">
                                    <span class="sr-only">Action button</span>
                                    Action
                                    <svg class="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
                                    </svg>
                                </button>
                                <div id="dropdownAction" class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 dark:divide-gray-600">
                                    <ul class="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownActionButton">
                                        <li>
                                            <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setMostrarCheckboxes(true)}>Adicionar usuário</a>
                                        </li>
                                        <li>
                                            <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setMostrarCheckboxes(true)}>Ativar conta</a>
                                        </li>
                                    </ul>
                                    <div class="py-1">
                                        <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white" onClick={() => setMostrarCheckboxes(true)}>Deletar usuário</a>
                                    </div>
                                </div>
                            </div>
                            <label for="table-search" class="sr-only">Search</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                                    <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                    </svg>
                                </div>



                                <input type="text" id="table-search-users" class="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Pesquisar por usuário" />
                            </div>
                        </div>


                    <div class="relative w-full h-fit shadow-md sm:rounded-lg">
                        <div class="flex items-center justify-between flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 py-4 bg-white dark:bg-gray-900">
                            <div>
                                <h3 className="dark:text-white">Setor de Manutenção</h3>
                            </div>
                        </div>


                        
                        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" class="p-4">
                                        <div class="flex items-center">
                                            <input id="checkbox-all-search" type="checkbox" className={`${mostrarCheckboxes ? "block" : "hidden"} w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600`}
                                                checked={todosSelecionados}
                                                onChange={(e) => checkboxTodos(e.target.checked)} />
                                            <label for="checkbox-all-search" class="sr-only">checkbox</label>
                                        </div>
                                    </th>
                                    <th scope="col" class="px-6 py-3">Nome</th>
                                    <th scope="col" class="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td class="w-4 p-4">
                                        <div class="flex items-center">
                                            <input id="checkbox-table-search-1" type="checkbox" className={`${mostrarCheckboxes ? "block" : "hidden"} w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600`}
                                                checked={selecionados[1]}
                                                onChange={(e) => checkboxIndividual(1, e.target.checked)} />
                                            <label for="checkbox-table-search-1" class="sr-only">checkbox</label>
                                        </div>
                                    </td>
                                    <th scope="row" class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                                        <img class="w-10 h-10 rounded-full" src="/docs/images/people/profile-picture-1.jpg" alt="Jese image" />
                                        <div class="ps-3">
                                            <div class="text-base font-semibold">Neil Sims</div>
                                            <div class="font-normal text-gray-500">neil.sims@flowbite.com</div>
                                        </div>
                                    </th>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center">
                                            <div class="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div> Online
                                        </div>
                                    </td>
                                </tr>

                                <tr class="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td class="w-4 p-4">
                                        <div class="flex items-center">
                                            <input id="checkbox-table-search-3" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                            <label for="checkbox-table-search-3" class="sr-only">checkbox</label>
                                        </div>
                                    </td>
                                    <th scope="row" class="flex items-center px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        <img class="w-10 h-10 rounded-full" src="/docs/images/people/profile-picture-4.jpg" alt="Jese image" />
                                        <div class="ps-3">
                                            <div class="text-base font-semibold">Leslie Livingston</div>
                                            <div class="font-normal text-gray-500">leslie@flowbite.com</div>
                                        </div>
                                    </th>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center">
                                            <div class="h-2.5 w-2.5 rounded-full bg-red-500 me-2"></div> Offline
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div> */}

 
    <div className="space-y-6">
      {Object.entries(setores).map(([setor, usuarios]) => (
        <div key={setor} className="relative w-full h-fit shadow-md sm:rounded-lg">
          <div className="flex items-center justify-between py-4 bg-white dark:bg-gray-900">
            <h3 className="dark:text-white">Setor de {setor}</h3>
          </div>
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="p-4"></th>
                <th className="px-6 py-3">Nome</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(user => (
                <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="w-4 p-4"></td>
                  <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                    <img className="w-10 h-10 rounded-full" src={user.foto_url} alt={user.nome} />
                    <div className="ps-3">
                      <div className="text-base font-semibold">{user.nome}</div>
                      <div className="font-normal text-gray-500">{user.email}</div>
                    </div>
                  </th>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div
                        className={`h-2.5 w-2.5 rounded-full me-2 ${
                          user.status === "online" ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                      {user.status}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>

                </div>
            </div>
        </>
    )
}