"use client";
import { useEffect, useState } from "react";
import Image from 'next/image';
import Link from 'next/link';
// import { useGoogleLogin } from '@react-oauth/google';
import "./login.css";
import { useRouter } from 'next/navigation';

export default function Login() {
useEffect(() => {
  document.title = 'Zelos - Login';

  // faz uma requisição só para o backend criar a sessão/cookie
  fetch('http://localhost:8080/auth/check-auth', {
    credentials: 'include'
  }).catch(() => {});
}, []);

const router = useRouter();
// qnd clica no botao de entrar ele mostra a animacao das bolinhas carregando
const [loading, setLoading] = useState(false);

const botaoCarregando = async (e) => {
  e.preventDefault();
  setLoading(true);

  await new Promise((resolve) => setTimeout(resolve, 2000));

  setLoading(false);
};

// login
const [erro, setErro] = useState('');
const [user, setUser] = useState(null);

const login = async (e) => {
  e.preventDefault();
  setLoading(true);

  const numero = document.getElementById('floating_num').value;
  const senha = document.getElementById('floating_password').value;

  try {
    const response = await fetch('http://localhost:8080/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ username: numero, password: senha })
    });

    const data = await response.json();

    if (!response.ok) {
      setErro(data?.error || data?.mensagem || 'Falha no login');
    } else {
      setErro('');
      setUser(data.user);
      alert('Login realizado com sucesso');
      const funcao = data.user.funcao?.toLowerCase();

      if (funcao === 'admin') {
        router.push('/admin/dashboard');
      } else if (funcao === 'tecnico' || funcao === 'auxiliar_limpeza') {
        router.push('/tecnico/chamados');
      } else {
        router.push('/usuario/chamados');
      }
    }
  } catch (error) {
    console.error('Erro ao tentar login:', error);
    setErro('Erro de rede ao tentar fazer login');
  }
  setLoading(false);
};

return (
  <main className="overflow-hidden w-screen h-screen">

    {/* header */}
    <nav className="bg-white border-gray-200 w-screen">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="/login" className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="self-center text-2xl poppins-bold whitespace-nowrap zelos-name"><img src="/img/zelos-name.svg" className="h-8" alt="Zelos name" /></span>
        </a>
      </div>
    </nav>

    {/* conteudo principal da pag de login */}
    <section className="flex flex-row w-full h-full principal-container">
      <section className="w-1/2 h-full justify-items-center content-center form-login">
        <div className='flex flex-col w-md form-login-container'>
          <h1 className="poppins-bold text-[3rem] text-[#2E2C34] mb-4">Entrar</h1>
          <p className="poppins-regular text-[#2E2C34] text-[1rem]">Faça login para acessar sua conta.</p>

          {/* inputs de email e senha */}
          <form onSubmit={login}>
            <div className="relative z-0 w-full mb-5 group">
              <input type="nuber" name="floating_num" id="floating_num" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-nonedark:focus:border-[#7F56D8] focus:outline-none focus:ring-0 focus:border-[#7F56D8] peer poppins-regular my-9" placeholder=" " required />
              <label htmlFor="floating_num" className="peer-focus:poppins-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-8 scale-75 top-2.5 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-[#7F56D8] peer-focus:dark:text-[#7F56D8] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-8 poppins-regular">Username</label>
            </div>

            <div className="relative z-0 w-full mb-5 group">
              <input type="password" name="floating_password" id="floating_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-[#7F56D8] focus:outline-none focus:ring-0 focus:border-[#7F56D8] peer poppins-regular my-9" placeholder=" " required />
              <label htmlFor="floating_password" className="peer-focus:poppins-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-8 scale-75 top-2.5 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-[#7F56D8] peer-focus:dark:text-[#7F56D8] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-8 poppins-regular" >Senha</label>
            </div>
            {erro && (
              <p className="text-red-500 text-sm mb-10 poppins-regular">{erro}</p>
            )}
            {/* concordancia com os termos */}
            <div className="flex justify-between items-center mb-4 mb-10">
              <div className="flex items-center">
                <input type="checkbox" id="hs-default-checkbox" className="accent-[#7F56D8] shrink-0 border-[#7F56D8] rounded-sm focus:ring-[#7F56D8] disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:focus:ring-offset-gray-800" />
                <label htmlFor="hs-default-checkbox" className="text-sm text-gray-500 ms-3 dark:text-neutral-400 poppins-regular">Eu li e concordo com os <a href="#" className="text-[#7F56D8] hover:underline poppins-regular">termos</a>.</label>
              </div>
            </div>

            {/* botao de entrar */}
            <button type="submit" disabled={loading} className="text-white bg-[#7F56D8] hover:bg-[#7F56D8] focus:ring-4 focus:outline-none focus:ring-blue-300 poppins-medium rounded-full text-sm w-full px-5 py-4 text-center dark:bg-[#7F56D8] dark:hover:bg-[#7F56D8] dark:focus:ring-[#7F56D8] poppins-regular px-18"> {loading ? (
              <div className="flex items-center justify-center gap-1 h-4">
                <div className="h-1 w-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-1 w-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-1 w-1 bg-white rounded-full animate-bounce"></div>
              </div>
            ) : (
              'Entrar'
            )}</button>
          </form>

        </div>
      </section>

      <section className="w-1/2 h-full justify-items-center content-center cont-img">

        {/* imagem do login*/}
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
    </section>
  </main>
);
}