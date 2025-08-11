"use client"
import { useEffect, useState } from "react";

// export default function Setores() {
//     const [mostrarCheckboxes, setMostrarCheckboxes] = useState(false);
//     const [todosSelecionados, setTodosSelecionados] = useState({});
//     const [selecionados, setSelecionados] = useState({});
//     const [setores, setSetores] = useState({});
//     const [dropdownAberto, setDropdownAberto] = useState(false);

//     const checkboxTodos = (nomeSetor, checked) => {
//         setTodosSelecionados((prev) => ({
//             ...prev,
//             [nomeSetor]: checked, // guarda estado por setor
//         }));

//         setSelecionados((prev) => {
//             const novos = { ...prev };
//             setores[nomeSetor].forEach((usuario) => {
//                 novos[usuario.id] = checked;
//             });
//             return novos;
//         });
//     };

//     const checkboxIndividual = (nomeSetor, id, checked) => {
//   setSelecionados((prev) => {
//     const novos = { ...prev, [id]: checked };

//     const todosMarcados = setores[nomeSetor].every(
//       (usuario) => novos[usuario.id]
//     );

//     setTodosSelecionados((prevTodos) => ({
//       ...prevTodos,
//       [nomeSetor]: todosMarcados,
//     }));

//     return novos;
//   });
// };

//     useEffect(() => {
//         fetch("http://localhost:8080/usuarios-por-setor")
//             .then((res) => res.json())
//             .then((data) => {
//                 setSetores(data);

//                 // inicializa todos os IDs como false
//                 const inicial = {};
//                 Object.values(data).flat().forEach((user) => {
//                     inicial[user.id] = false;
//                 });
//                 setSelecionados(inicial);
//             });
//     }, []);

//     const abrirFecharDropdown = () => {
//         setDropdownAberto(!dropdownAberto);
//     };

//     return (
//         <>
//             <div className="p-4 w-full">
//                 <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">

//                     <div className="flex items-center justify-between flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 py-4 bg-white dark:bg-gray-900">
//                         <div className="relative inline-block text-left">
//                             <button
//                                 onClick={() => setDropdownAberto(!dropdownAberto)}
//                                 className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
//                             >
//                                 Action
//                                 <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
//                                     <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
//                                 </svg>
//                             </button>

//                             {dropdownAberto && (
//                                 <div
//                                     className="z-10 absolute mt-1 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 dark:divide-gray-600"
//                                     style={{ top: "100%", left: 0 }}
//                                 >
//                                     <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
//                                         <li>
//                                             <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" onClick={e => { e.preventDefault(); setMostrarCheckboxes(true); setDropdownAberto(false); }}>
//                                                 Adicionar usuário
//                                             </a>
//                                         </li>
//                                         <li>
//                                             <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" onClick={e => { e.preventDefault(); setMostrarCheckboxes(true); setDropdownAberto(false); }}>
//                                                 Ativar conta
//                                             </a>
//                                         </li>
//                                     </ul>
//                                     <div className="py-1">
//                                         <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white" onClick={e => { e.preventDefault(); setMostrarCheckboxes(true); setDropdownAberto(false); }}>
//                                             Deletar usuário
//                                         </a>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>

//                         <label htmlFor="table-search" className="sr-only">Search</label>
//                         <div className="relative">
//                             <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
//                                 <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
//                                     <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
//                                 </svg>
//                             </div>

//                             <input
//                                 type="text"
//                                 id="table-search-users"
//                                 className="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
//                                 placeholder="Pesquisar por usuário"
//                             />
//                         </div>
//                     </div>

//                     {Object.entries(setores).map(([nomeSetor, usuarios]) => (
//                         <div key={nomeSetor} className="relative w-full h-fit shadow-md sm:rounded-lg">
//                             <div className="flex items-center justify-between flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 py-4 bg-white dark:bg-gray-900">
//                                 <div>
//                                     <h2 className="text-lg font-semibold capitalize">{nomeSetor}</h2>
//                                 </div>
//                                 <div>
//                                     <button
//                                         onClick={() => setMostrarCheckboxes(!mostrarCheckboxes)}
//                                         className="inline-flex items-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
//                                     >
//                                         Selecionar usuários
//                                     </button>
//                                 </div>
//                             </div>

//                             <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
//                                 <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
//                                     <tr>
//                                         {mostrarCheckboxes && (
//                                             <th scope="col" className="p-4">
//                                                 <input type="checkbox" checked={todosSelecionados[nomeSetor] || false} onChange={(e) => checkboxTodos(nomeSetor, e.target.checked)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
//                                             </th>
//                                         )}

//                                         <th className="p-4"></th>

//                                         <th scope="col" className="px-6 py-3">Nome</th>
//                                         <th scope="col" className="px-6 py-3">Função</th>
//                                         <th scope="col" className="px-6 py-3">Status</th>
//                                     </tr>
//                                 </thead>

//                                 <tbody>
//                                     {usuarios.map((usuario) => (
//                                         <tr
//                                             key={usuario.id}
//                                             className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
//                                         >
//                                             {mostrarCheckboxes && (
//                                                 <td className="p-4">
//                                                     <input
//                                                         type="checkbox"
//                                                         checked={selecionados[usuario.id] || false}
//                                                         onChange={(e) => checkboxIndividual(nomeSetor, usuario.id, e.target.checked)}
//                                                         className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
//                                                     />
//                                                 </td>
//                                             )}

//                                             <td className="w-4 p-4"></td>

//                                             <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
//                                                 <img className="w-10 h-10 rounded-full" src={usuario.foto_url} alt={usuario.nome} />
//                                                 <div className="ps-3">
//                                                     <div className="text-base font-semibold">{usuario.nome}</div>
//                                                     <div className="font-normal text-gray-500">{usuario.email}</div>
//                                                 </div>
//                                             </th>

//                                             <td className="px-6 py-4">{usuario.funcao}</td>

//                                             <td className="px-6 py-4">
//                                                 <div className="flex items-center">
//                                                     <div
//                                                         className={`h-2.5 w-2.5 rounded-full me-2 ${usuario.status_usuarios === "ativo" ? "bg-green-500" : "bg-red-500"
//                                                             }`}
//                                                     ></div>
//                                                     {usuario.status_usuarios}
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </>
//     );
// }

export default function Setores() {
    const [setoresSelecionados, setSetoresSelecionados] = useState({ auxiliares: true, tecnicos: true, }); // Estado que guarda quais setores estão selecionados no dropdown, inicialmente todos true para mostrar todos ao entrar na página
    const [setores, setSetores] = useState({}); // Dados completos dos usuários por setor vindo da API
    const [dropdownAberto, setDropdownAberto] = useState(false); // Estado para controlar dropdown aberto/fechado
    const [dropdownAbertoId, setDropdownAbertoId] = useState(null); // controla o estado de dropdown aberto/fechado (dropdown p cada usuario)


    // Carrega dados da API ao montar componente
    useEffect(() => {
        fetch("http://localhost:8080/usuarios-por-setor")
            .then((res) => res.json())
            .then((data) => {
                setSetores(data);
            });
    }, []);

    // Função para lidar com check/uncheck dos setores no dropdown
    function toggleSetor(nomeSetor) {
        setSetoresSelecionados((prev) => ({
            ...prev,
            [nomeSetor]: !prev[nomeSetor],
        }));
    }

    // Juntar usuários só dos setores selecionados para exibir numa tabela só
    const usuariosFiltrados = Object.entries(setores)
        .filter(([nomeSetor]) => setoresSelecionados[nomeSetor])
        .flatMap(([, usuarios]) => usuarios);

    // excluir usuario
    function deletarUsuario(id) {
        if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
            fetch(`http://localhost:8080/usuarios/${id}`, {
                method: "DELETE",
            })
                .then((res) => {
                    if (!res.ok) throw new Error("Erro ao excluir usuário");
                    return res.json();
                })
                .then((data) => {
                    alert(data.mensagem);
                    // Recarrega a lista
                    setSetores((prev) => {
                        const atualizado = { ...prev };
                        for (const setor in atualizado) {
                            atualizado[setor] = atualizado[setor].filter((u) => u.id !== id);
                        }
                        return atualizado;
                    });
                })
                .catch((err) => {
                    console.error(err);
                    alert("Não foi possível excluir o usuário.");
                });
        }
    }


    return (
        <div className="p-4 w-full">
            <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">

                <div className="flex items-center justify-between flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 p-4 bg-white dark:bg-gray-900">
                    <div className="relative inline-block text-left">
                        {/* <button onClick={() => setDropdownAberto(!dropdownAberto)} className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" >
                                Action
                                <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                </svg>
                            </button>

                            {dropdownAberto && (
                                <div className="z-10 absolute mt-1 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 dark:divide-gray-600" style={{ top: "100%", left: 0 }} >
                                    <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                                        <li>
                                            <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" onClick={e => { e.preventDefault(); setMostrarCheckboxes(true); setDropdownAberto(false); }}>
                                                Adicionar usuário
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" onClick={e => { e.preventDefault(); setMostrarCheckboxes(true); setDropdownAberto(false); }}>
                                                Ativar conta
                                            </a>
                                        </li>
                                    </ul>
                                    <div className="py-1">
                                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white" onClick={e => { e.preventDefault(); setMostrarCheckboxes(true); setDropdownAberto(false); }}>
                                            Deletar usuário
                                        </a>
                                    </div>
                                </div>
                            )} */}

                        <button id="dropdownHelperButton" data-dropdown-toggle="dropdownHelper" className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" type="button" onClick={() => setDropdownAberto(!dropdownAberto)}>Filtros
                            <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6" >
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                            </svg>
                        </button>

                        {/* Dropdown menu */}
                        {dropdownAberto && (
                            <div id="dropdownHelper"
                                className="z-10 absolute mt-1 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 dark:divide-gray-600" style={{ top: "100%", left: 0 }} >
                                <ul
                                    className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200"
                                    aria-labelledby="dropdownHelperButton"
                                >
                                    {Object.keys(setores).map((nomeSetor) => (
                                        <li key={nomeSetor}>
                                            <div className="flex p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                                                <div className="flex items-center h-5">
                                                    <input
                                                        id={`checkbox-${nomeSetor}`}
                                                        type="checkbox"
                                                        checked={!!setoresSelecionados[nomeSetor]}
                                                        onChange={() => toggleSetor(nomeSetor)}
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                                    />
                                                </div>
                                                <div className="ms-2 text-sm">
                                                    <label
                                                        htmlFor={`checkbox-${nomeSetor}`}
                                                        className="font-medium text-gray-900 dark:text-gray-300 capitalize"
                                                    >
                                                        {nomeSetor}
                                                    </label>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <label htmlFor="table-search" className="sr-only">Search</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>

                        <input
                            type="text"
                            id="table-search-users"
                            className="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Pesquisar por usuário"
                        />
                    </div>
                </div>


                {/* Dropdown botão */}
                {/* <button id="dropdownHelperButton" data-dropdown-toggle="dropdownHelper" className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" type="button" onClick={() => setDropdownAberto(!dropdownAberto)}>Filtros
        <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6" >
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
        </svg>
      </button>

      {/* Dropdown menu */}
                {/* {dropdownAberto && (
        <div id="dropdownHelper"
          className="z-10 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-60 dark:bg-gray-700 dark:divide-gray-600"
        >
          <ul
            className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200"
            aria-labelledby="dropdownHelperButton"
          >
            {Object.keys(setores).map((nomeSetor) => (
              <li key={nomeSetor}>
                <div className="flex p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                  <div className="flex items-center h-5">
                    <input
                      id={`checkbox-${nomeSetor}`}
                      type="checkbox"
                      checked={!!setoresSelecionados[nomeSetor]}
                      onChange={() => toggleSetor(nomeSetor)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                  </div>
                  <div className="ms-2 text-sm">
                    <label
                      htmlFor={`checkbox-${nomeSetor}`}
                      className="font-medium text-gray-900 dark:text-gray-300 capitalize"
                    >
                      {nomeSetor}
                    </label>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )} */}

                {/* Tabela única com usuários filtrados */}
                <div className="overflow-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Nome</th>
                                <th className="px-6 py-3">Função</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuariosFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-center">
                                        Nenhum usuário para o tipo selecionado.
                                    </td>
                                </tr>
                            )}
                            {usuariosFiltrados.map((usuario) => (
                                <tr key={usuario.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600" >
                                    <th scope="row" className="flex items-center px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white" >
                                        <img className="w-10 h-10 rounded-full" src={usuario.foto_url} alt={usuario.nome} />

                                        <div className="ms-3">
                                            <div>{usuario.nome}</div>
                                            <div className="text-gray-500 text-sm">{usuario.email}</div>
                                        </div>
                                    </th>
                                    <td className="px-6 py-4">{usuario.funcao}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div
                                                className={`h-2.5 w-2.5 rounded-full me-2 ${usuario.status_usuarios === "ativo"
                                                    ? "bg-green-500"
                                                    : "bg-red-500"
                                                    }`}
                                            ></div>
                                            {usuario.status_usuarios}
                                        </div>
                                    </td>

                                    <td className="relative">
                                        <button onClick={() => setDropdownAbertoId((prev) => (prev === usuario.id ? null : usuario.id))} className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-600" type="button" aria-expanded={dropdownAbertoId === usuario.id} aria-haspopup="true" >
                                            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 3" >
                                                <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                                            </svg>
                                        </button>

                                        {/* Dropdown */}
                                        {dropdownAbertoId === usuario.id && (
                                            <div className="z-10 absolute right-0 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 dark:divide-gray-600" role="menu" aria-orientation="vertical" aria-labelledby="dropdownMenuIconHorizontalButton" >
                                                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                                                    <li>
                                                        <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Ver perfil</a>
                                                    </li>
                                                    <li>
                                                        <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Desativar conta</a>
                                                    </li>
                                                </ul>
                                                <div className="py-2">
                                                    <a onClick={() => deletarUsuario(usuario.id)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white" role="menuitem">Deletar usuário</a>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
