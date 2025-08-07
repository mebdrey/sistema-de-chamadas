"use client"
import "./setores.css"
export default function setores() {
    return (
        <>
            <div className="page">
                <h1 className="title">Setores</h1>
                <div className="limpeza">
                    <div className="tabela">
                        <h1 className=" text-purple-700 bg-purple-50">Limpeza</h1>
                        <div className="linha"></div>
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-purple-700 uppercase bg-purple-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3"> Nome</th>
                                        <th scope="col" className="px-6 py-3">Setor</th>
                                        <th scope="col" className="px-6 py-3">Email</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste</th>
                                        <td className="px-6 py-4">técnico</td>
                                        <td className="px-6 py-4"> teste@gmail.com</td>
                                        <td className="px-6 py-4">ativo</td>
                                    </tr>
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste2 </th>
                                        <td className="px-6 py-4">técnico</td>
                                        <td className="px-6 py-4">teste2@gmail.com</td>
                                        <td className="px-6 py-4">inativo</td>
                                    </tr>
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste3 </th>
                                        <td className="px-6 py-4"> usuário </td>
                                        <td className="px-6 py-4"> teste3@gmail.com </td>
                                        <td className="px-6 py-4"> ativo</td>
                                    </tr>
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste4 </th>
                                        <td className="px-6 py-4">usuário</td>
                                        <td className="px-6 py-4">teste4@gmail.com</td>
                                         <td className="px-6 py-4">
                                            inativo</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="externo">
                    <div className="tabela">
                        <h1 className=" text-purple-700 bg-purple-50">Externo</h1>
                        <div className="linha"></div>
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-purple-700 uppercase bg-purple-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3"> Nome</th>
                                        <th scope="col" className="px-6 py-3">Setor</th>
                                        <th scope="col" className="px-6 py-3">Email </th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste</th>
                                        <td className="px-6 py-4">técnico</td>
                                        <td className="px-6 py-4"> teste@gmail.com</td>
                                        <td className="px-6 py-4">ativo</td>
                                    </tr>
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste2 </th>
                                        <td className="px-6 py-4">técnico</td>
                                        <td className="px-6 py-4">teste2@gmail.com</td>
                                        <td className="px-6 py-4">inativo</td>
                                    </tr>
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste3 </th>
                                        <td className="px-6 py-4"> usuário </td>
                                        <td className="px-6 py-4"> teste3@gmail.com </td>
                                        <td className="px-6 py-4"> ativo</td>
                                    </tr>
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste4 </th>
                                        <td className="px-6 py-4">usuário</td>
                                        <td className="px-6 py-4">teste4@gmail.com</td>
                                         <td className="px-6 py-4">inativo</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="manutencao">
                    <div className="tabela">
                        <h1 className=" text-purple-700 bg-purple-50">Manutenção</h1>
                        <div className="linha"></div>
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-purple-700 uppercase bg-purple-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Nome</th>
                                        <th scope="col" className="px-6 py-3">Setor</th>
                                        <th scope="col" className="px-6 py-3">Email</th>
                                        <th scope="col" className="px-6 py-3">Status </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste</th>
                                        <td className="px-6 py-4">técnico</td>
                                        <td className="px-6 py-4"> teste@gmail.com</td>
                                        <td className="px-6 py-4">ativo</td>
                                    </tr>
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste2 </th>
                                        <td className="px-6 py-4">técnico</td>
                                        <td className="px-6 py-4">teste2@gmail.com</td>
                                        <td className="px-6 py-4">inativo</td>
                                    </tr>
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste3 </th>
                                        <td className="px-6 py-4"> usuário </td>
                                        <td className="px-6 py-4"> teste3@gmail.com </td>
                                        <td className="px-6 py-4"> ativo</td>
                                    </tr>
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste4 </th>
                                        <td className="px-6 py-4">usuário</td>
                                        <td className="px-6 py-4">teste4@gmail.com</td>
                                         <td className="px-6 py-4">
                                            inativo</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="apoio">
                    <div className="tabela">
                        <h1 className=" text-purple-700 bg-purple-50">Apoio Técnico</h1>
                        <div className="linha"></div>
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-purple-700 uppercase bg-purple-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3"> Nome</th>
                                        <th scope="col" className="px-6 py-3"> Setor</th>
                                        <th scope="col" className="px-6 py-3"> Email </th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste </th>
                                        <td className="px-6 py-4"> técnico</td>
                                        <td className="px-6 py-4">teste@gmail.com</td>
                                        <td className="px-6 py-4">ativo</td>
                                    </tr>
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste2</th>
                                        <td className="px-6 py-4"> técnico</td>
                                        <td className="px-6 py-4"> teste2@gmail.com</td>
                                        <td className="px-6 py-4"> inativo</td>
                                    </tr>
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste3 </th>
                                        <td className="px-6 py-4"> usuário </td>
                                        <td className="px-6 py-4">@gmail.com</td>
                                        <td className="px-6 py-4">ativo</td></tr>
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">teste4</th>
                                        <td className="px-6 py-4">usuário</td>
                                        <td className="px-6 py-4">teste4@gmail.Chamados</td>
                                        <td className="px-6 py-4">inativo</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

