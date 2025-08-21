"use client"
import { useEffect, useState } from "react";

export default function Setores() {
    const [setoresSelecionados, setSetoresSelecionados] = useState({ auxiliares: true, tecnicos: true, }); // Estado que guarda quais setores estão selecionados no dropdown, inicialmente todos true para mostrar todos ao entrar na página
    const [setores, setSetores] = useState({}); // Dados completos dos usuários por setor vindo da API
    const [dropdownAberto, setDropdownAberto] = useState(false); // Estado para controlar dropdown aberto/fechado
    const [dropdownAbertoId, setDropdownAbertoId] = useState(null); // controla o estado de dropdown aberto/fechado (dropdown p cada usuario)
    const [busca, setBusca] = useState(""); // armazena o que for digitado no campo de busca
    const [mostrarModalConfirmacao, setMostrarModalConfirmacao] = useState(false);
    const [usuarioParaDeletar, setUsuarioParaDeletar] = useState(null);

    // Carrega dados da API ao montar componente
    useEffect(() => {
        fetch("http://localhost:8080/usuarios-por-setor", { credentials: 'include' })
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
        .flatMap(([, usuarios]) => usuarios)
        .filter((usuario) => {
            const termo = busca.toLowerCase();
            return (
                usuario.nome.toLowerCase().includes(termo) ||
                usuario.email.toLowerCase().includes(termo) ||
                usuario.funcao.toLowerCase().includes(termo) ||
                usuario.id.toString().includes(termo)  // caso queira buscar por id também
            );
        });


function deletarUsuario(id) {
  fetch(`http://localhost:8080/usuarios/${id}`, {
    method: "DELETE",
    credentials: 'include'
  })
    .then((res) => {
      if (!res.ok) throw new Error("Erro ao excluir usuário");
      return res.json();
    })
    .then((data) => {
      alert(data.mensagem);
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

    function primeiraLetraMaiuscula(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    // formata os tipos de servico
    function formatarLabel(str) {
        const texto = str.replace(/_/g, ' ').toLowerCase();

        const correcoes = {
            "auxiliar limpeza": "Auxiliar de Limpeza",
            "apoio tecnico": "Apoio Técnico",
            "tecnico": "Técnico"
        };

        if (correcoes[texto]) {
            return correcoes[texto];
        }

        // capitaliza cada palavra caso não tenha uma correção personalizada
        return texto
            .split(' ')
            .map(p => p.charAt(0).toUpperCase() + p.slice(1))
            .join(' ');
    }

    return (
        <div className="p-4 h-screen w-full">
            <div className="p-4  rounded-lg dark:border-gray-700 mt-14">

                <div className="flex items-center justify-between flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 p-4 ">
                    <div className="relative inline-block text-left">
                        {/* <button onClick={() => setDropdownAberto(!dropdownAberto)} className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 poppins-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" >
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

                        <button id="dropdownHelperButton" className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-[#F8FAFB] focus:text-[#7F56D8] poppins-medium rounded-lg text-sm px-3 py-1.5" type="button" onClick={() => setDropdownAberto(!dropdownAberto)}>Filtros
                            <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6" >
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                            </svg>
                        </button>

                        {/* Dropdown menu */}
                        {dropdownAberto && (
                            <div id="dropdownHelper" className="z-10 absolute mt-1 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 dark:divide-gray-600" style={{ top: "100%", left: 0 }} >
                                <ul className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownHelperButton" >
                                    {Object.keys(setores).map((nomeSetor) => (
                                        <li key={nomeSetor}>
                                            <div className="flex p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                                                <div className="flex items-center h-5">
                                                    <input id={`checkbox-${nomeSetor}`} type="checkbox" checked={!!setoresSelecionados[nomeSetor]} onChange={() => toggleSetor(nomeSetor)}
                                                        className="w-4 h-4 text-[#7F56D8] bg-gray-100 border-gray-300 rounded-sm focus:ring-[#7F56D8] dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                                    />
                                                </div>
                                                <div className="ms-2 text-sm">
                                                    <label htmlFor={`checkbox-${nomeSetor}`} className="poppins-medium text-gray-900 dark:text-gray-300 capitalize">
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
                    {/* Barra de pesquisa */}
                    <form className="flex items-center" onSubmit={(e) => e.preventDefault()}>
                        <label htmlFor="simple-search" className="sr-only">Search</label>
                        <div className="relative w-80">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                id="simple-search"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#7F56D8] focus:border-[#7F56D8] block w-full ps-10 p-2.5"
                                placeholder="Pesquisar por usuário"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)} />
                        </div>
                    </form>
                </div>


                {/* Dropdown botão */}
                {/* <button id="dropdownHelperButton" data-dropdown-toggle="dropdownHelper" className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 poppins-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" type="button" onClick={() => setDropdownAberto(!dropdownAberto)}>Filtros
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
                      className="poppins-medium text-gray-900 dark:text-gray-300 capitalize"
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
                    <table className="w-full text-sm text-left text-gray-500 ">
                        <thead className="text-xs text-gray-700 uppercase bg-[#E6DAFF]">
                            <tr>
                                <th className="px-6 py-3">Nome</th>
                                <th className="px-6 py-3">Função</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className='w-full'>
                            {usuariosFiltrados.length === 0 && (
                                <tr className="w-full">
                                    <td colSpan="3" className="w-full px-6 py-4 text-center">
                                        Nenhum usuário para o tipo selecionado.
                                    </td>
                                </tr>
                            )}
                            {usuariosFiltrados.map((usuario) => (
                                <tr key={usuario.id} className="bg-white border-b border-gray-200 hover:bg-gray-50" >
                                    <th scope="row" className="flex items-center px-6 py-4 poppins-medium text-gray-900 whitespace-nowrap " >
                                        <div className="relative w-8 h-8 overflow-hidden bg-gray-100 rounded-full ">
                                            {usuario.ftPerfil ? (
                                                <img className="w-10 h-10 rounded-full object-cover" src={`http://localhost:8080/${usuario.ftPerfil}`} alt={usuario.nome} />
                                            ) : (
                                                <svg className="absolute w-10 h-10 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>


                                        <div className="ms-3">
                                            <div>{usuario.nome}</div>
                                            <div className="text-gray-500 text-sm">{usuario.email}</div>
                                        </div>
                                    </th>
                                    <td className="px-6 py-4">{formatarLabel(usuario.funcao)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className={`h-2.5 w-2.5 rounded-full me-2 ${usuario.status_usuarios === "ativo" ? "bg-green-500" : "bg-red-500"}`}></div>
                                            {primeiraLetraMaiuscula(usuario.status_usuarios)}
                                        </div>
                                    </td>

                                    <td className="relative">
                                        <button onClick={() => setDropdownAbertoId((prev) => (prev === usuario.id ? null : usuario.id))} className="inline-flex items-center p-2 text-sm poppins-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50" type="button" aria-expanded={dropdownAbertoId === usuario.id} aria-haspopup="true" >
                                            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 3" >
                                                <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                                            </svg>
                                        </button>

                                        {/* Dropdown */}
                                        {dropdownAbertoId === usuario.id && (
                                            <div className="z-10 absolute right-0 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44" role="menu" aria-orientation="vertical" aria-labelledby="dropdownMenuIconHorizontalButton" >
                                                <ul className="py-2 text-sm text-gray-700 ">
                                                    <li>
                                                        <a href="#" className="block px-4 py-2 hover:bg-gray-100" role="menuitem">Ver perfil</a>
                                                    </li>
                                                    <li>
                                                        <a href="#" className="block px-4 py-2 hover:bg-gray-100" role="menuitem">Desativar conta</a>
                                                    </li>
                                                </ul>
                                                <div className="py-2">
                                                   <a onClick={() => {setUsuarioParaDeletar(usuario.id); setMostrarModalConfirmacao(true);}} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Deletar usuário</a>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* tem tz q deseja excluir o usuario? */}
                {mostrarModalConfirmacao && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <div className="text-center">
        <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 " fill="none" viewBox="0 0 20 20">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <h3 className="mb-5 text-lg poppins-regular text-gray-500">Tem certeza que deseja excluir este usuário?</h3>
        <button onClick={() => { deletarUsuario(usuarioParaDeletar); setMostrarModalConfirmacao(false);}} className="text-white bg-[#7F56D8] focus:ring-4 focus:outline-none focus:ring-[#7F56D8] poppins-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">Sim, excluir
        </button>
        <button onClick={() => { setMostrarModalConfirmacao(false); setUsuarioParaDeletar(null); }} className="py-2.5 px-5 ms-3 text-sm poppins-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-[#7F56D8] focus:z-10 focus:ring-4 focus:ring-gray-100" >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}

            </div>
        </div>
    );
}
