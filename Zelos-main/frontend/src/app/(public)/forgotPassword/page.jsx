"use client";
import { useEffect, useState } from "react";
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import './forgotPassword.css';

export default function Login() {
    /* titulo da guia */
    useEffect(() => {
        document.title = 'Zelos - Login';
    }, []);

    const [etapa, setEtapa] = useState(1); // controla qual etapa esta visivel
    const [email, setEmail] = useState(''); // armazena o email digitado
    const [codigo, setCodigo] = useState(''); // guarda o codigo enviado
    const [novaSenha, setNovaSenha] = useState(''); // armazena nova senha
    const [confirmarSenha, setConfirmarSenha] = useState(''); // armazena nova senha

    /* etapa 1 - o usuario digita seu email p receber o codigo */
    const enviarEmail = async () => {
        try {
            await axios.post('/forgotPassword', { email });
            setEtapa(2);
        } catch (err) {
            console.error(err);
        }
    };

    /* etapa 2 - o usuario o codigo q recebeu no seu email */
    const verificarCodigo = async () => {
        try {
            await axios.post('/verifyCode', { email, codigo });
            setEtapa(3);
        } catch (err) {
            console.error(err);
        }
    };

    /* etapa 3 - o usuario redefine sua senha */
    const redefinirSenha = async () => {
        if (novaSenha !== confirmarSenha) return alert('Senhas diferentes');
        try {
            await axios.post('/resetPassword', { email, novaSenha });
            alert('Senha redefinida com sucesso');
            // redirecionar para login se quiser
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <main className="overflow-hidden w-screen h-screen">

            {/* header */}
            <nav className="bg-white border-gray-200 w-screen">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <a href="https://flowbite.com/" className="flex items-center space-x-3 rtl:space-x-reverse">
                        <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Flowbite Logo" />
                        <span className="self-center text-2xl poppins-bold whitespace-nowrap ">Zelos</span>
                    </a>
                </div>
            </nav>

            {/* conteudo principal da pag de esqueci a senha */}
            <section className="flex flex-row w-full h-full principal-container">
                {etapa === 1 ? (
                    <>
                        {/* ----------------------------------- ETAPA 1 (email) --------------------------------------------------*/}
                        <section className="w-1/2 h-full justify-items-center content-center form-send-email">
                            <div className='flex flex-col w-2/3 form-email-container'>
                                <Link href="/login" className="relative w-fit group mb-8 no-underline inline-block"><p className="poppins-medium text-[#2E2C34] text-[1rem] flex flex-row items-center">
                                    <svg width="9" height="16" viewBox="0 0 9 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-4">
                                        <path d="M7.75012 14.75L1.00012 8L7.75012 1.25" stroke="#313131" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>Voltar para o login</p>
                                    <span className="absolute left-0 -bottom-0.5 h-[2px] w-full origin-left scale-x-0 bg-[#2E2C34] transition-transform duration-300 group-hover:scale-x-100"></span>
                                </Link>

                                <h1 className="poppins-bold text-[3rem] text-[#2E2C34] mb-4">Esqueceu a senha?</h1>
                                <p className="poppins-regular text-[#2E2C34] text-[1rem] ">Não se preocupe, acontece com todos nós. Insira seu email abaixo para recuperar sua senha.</p>
                                {/* inputs de email */}
                                <form className="">
                                    <div className="relative z-0 w-full mb-5 group">
                                        <input type="email" name="floating_email" id="floating_email" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-nonedark:focus:border-[#7F56D8] focus:outline-none focus:ring-0 focus:border-[#7F56D8] peer poppins-regular my-9" placeholder=" "  value={email} onChange={(e) => setEmail(e.target.value)}required />
                                        <label htmlFor="floating_email" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-8 scale-75 top-2.5 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-[#7F56D8] peer-focus:dark:text-[#7F56D8] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-8 poppins-regular">Email</label>
                                    </div>
                                    {/* botao de enviar */}
                                    <button type="button" className="text-white bg-[#7F56D8] hover:bg-[#7761A9] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-[#7F56D8] dark:focus:ring-[#7761A9] poppins-regular px-18" onClick={enviarEmail}>Enviar</button>
                                </form>
                            </div>
                        </section>

                        <section className="w-1/2 h-full justify-items-center content-center cont-img">

                            {/* imagem */}
                            <div>
                                <Image
                                    src="/img/login-img.svg"
                                    width={400}
                                    height={600}
                                    alt="Mão segurando celular"
                                    className='login-img'
                                />
                            </div>
                        </section>
                    </>
                ) : etapa === 2 ? (
                    <>
                        {/* ----------------------------------- ETAPA 2 (codigo) --------------------------------------------------*/}
                        <section className="w-1/2 h-full justify-items-center content-center form-send-code">
                            <div className='flex flex-col w-2/3 form-code-container'>
                                <Link href="/login" className="relative w-fit group mb-8 no-underline inline-block"><p className="poppins-medium text-[#2E2C34] text-[1rem] flex flex-row items-center">
                                    <svg width="9" height="16" viewBox="0 0 9 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-4">
                                        <path d="M7.75012 14.75L1.00012 8L7.75012 1.25" stroke="#313131" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>Voltar para o login</p>
                                    <span className="absolute left-0 -bottom-0.5 h-[2px] w-full origin-left scale-x-0 bg-[#2E2C34] transition-transform duration-300 group-hover:scale-x-100"></span>
                                </Link>

                                <h1 className="poppins-bold text-[3rem] text-[#2E2C34] mb-4">Verificar código</h1>
                                <p className="poppins-regular text-[#2E2C34] text-[1rem] ">Um codigo de verificação foi enviado para o seu email.</p>
                                {/* inputs de email */}
                                <form className="">
                                    <div className="relative z-0 w-full mb-5 group">
                                        <input name="floating_code" id="floating_code" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-nonedark:focus:border-[#7F56D8] focus:outline-none focus:ring-0 focus:border-[#7F56D8] peer poppins-regular my-9" placeholder=" " value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
                                        <label htmlFor="floating_code" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-8 scale-75 top-2.5 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-[#7F56D8] peer-focus:dark:text-[#7F56D8] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-8 poppins-regular">Inserir código</label>
                                    </div>
                                    {/* botao de enviar */}
                                    <button type="button" className="text-white bg-[#7F56D8] hover:bg-[#7761A9] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-[#7F56D8] dark:focus:ring-[#7761A9] poppins-regular px-18" onClick={verificarCodigo}>Confirmar</button>
                                </form>
                            </div>
                        </section>

                        <section className="w-1/2 h-full justify-items-center content-center cont-img">

                            {/* imagem */}
                            <div>
                                <Image
                                    src="/img/login-img.svg"
                                    width={400}
                                    height={600}
                                    alt="Mão segurando celular"
                                    className='login-img'
                                />
                            </div>
                        </section>
                    </>
                ) : (
                    <>
                        {/* ----------------------------------- ETAPA 3 (nova senha) --------------------------------------------------*/}
                        <section className="w-1/2 h-full justify-items-center content-center form-send-password">
                            <div className='flex flex-col w-2/3 form-password-container'>
                                <h1 className="poppins-bold text-[3rem] text-[#2E2C34] mb-4">Redefinição de senha</h1>
                                <p className="poppins-regular text-[#2E2C34] text-[1rem] ">Defina uma nova senha para sua conta.</p>
                                {/* inputs de email */}
                                <form className="">
                                    <div className="relative z-0 w-full mb-5 group">
                                        <input type="password" name="floating_password" id="floating_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-[#7F56D8] focus:outline-none focus:ring-0 focus:border-[#7F56D8] peer poppins-regular my-9" placeholder=" " value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required />
                                        <label htmlFor="floating_password" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-8 scale-75 top-2.5 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-[#7F56D8] peer-focus:dark:text-[#7F56D8] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-8 poppins-regular" >Nova senha</label>
                                    </div>
                                    <div className="relative z-0 w-full mb-5 group">
                                        <input type="password" name="floating_password" id="floating_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-[#7F56D8] focus:outline-none focus:ring-0 focus:border-[#7F56D8] peer poppins-regular my-9" placeholder=" "  value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required />
                                        <label htmlFor="floating_password" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-8 scale-75 top-2.5 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-[#7F56D8] peer-focus:dark:text-[#7F56D8] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-8 poppins-regular" >Confirmar senha</label>
                                    </div>
                                    {/* botao de enviar */}
                                    <button type="button" className="text-white bg-[#7F56D8] hover:bg-[#7761A9] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-[#7F56D8] dark:focus:ring-[#7761A9] poppins-regular px-18"  onClick={redefinirSenha}>Redefinir</button>
                                </form>
                            </div>
                        </section>

                        <section className="w-1/2 h-full justify-items-center content-center cont-img">

                            {/* imagem */}
                            <div>
                                <Image
                                    src="/img/login-img.svg"
                                    width={400}
                                    height={600}
                                    alt="Mão segurando celular"
                                    className='login-img'
                                />
                            </div>
                        </section>
                    </>
                )}
            </section>
        </main>
    );
}

