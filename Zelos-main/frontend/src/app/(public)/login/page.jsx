"use client";
import { useEffect, useState } from "react";
import Image from 'next/image';
import Link from 'next/link';
// import { useGoogleLogin } from '@react-oauth/google';
import "./login.css";
import { useRouter } from 'next/navigation';
import '@/app/globals.css'


export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [showEye, setShowEye] = useState(false); // controla se o olho aparece
  const [password, setPassword] = useState("");


  useEffect(() => {
    document.title = 'Zelos - Login';

    // faz uma requisição só para o backend criar a sessão/cookie
    // fetch('http://localhost:8080/auth/check-auth', {
    //   credentials: 'include'
    // }).catch(() => { });
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
        // SALVA no localStorage para outros componentes lerem (só os campos necessários)
        try {
          const minimal = {
            id: data.user.id,
            nome: data.user.nome || data.user.name || '',
            funcao: data.user.funcao || data.user.role || ''
          };
          localStorage.setItem('currentUser', JSON.stringify(minimal));
        } catch (e) {
          console.warn('Falha ao salvar currentUser no localStorage', e);
        }

        // alert('Login realizado com sucesso');
        const funcao = data.user.funcao?.toLowerCase();

        if (funcao === 'admin') {
          router.push('/admin/dashboard');
        } else if (funcao === 'tecnico') {
          router.push('/tecnico/chamados');
        } else if (funcao === 'auxiliar_limpeza') {
          router.push('/auxiliar_limpeza/chamados');
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
      <nav className="bg-white dark:bg-gray-900 border-gray-200 w-screen">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a href="/login" className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="self-center text-2xl poppins-bold whitespace-nowrap zelos-name">
              <svg
                className="h-8 me-3 text-gray-800 dark:text-gray-300"
                viewBox="0 0 366 84"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18.4824 79.4987C13.2168 79.4987 8.95117 77.9102 5.69076 74.7279C2.42513 71.5352 0.794922 67.4518 0.794922 62.4779C0.794922 60.1029 1.27409 57.8268 2.23242 55.6445C3.20117 53.4674 4.80013 51.4102 7.02409 49.4779L40.1699 19.8945C40.321 19.7435 40.4512 19.5768 40.5658 19.3945C40.6751 19.2018 40.7324 18.9935 40.7324 18.7695C40.7324 18.4779 40.6335 18.207 40.4408 17.957C40.2585 17.6966 40.0345 17.4883 39.7741 17.332C39.5241 17.181 39.2428 17.1029 38.9408 17.1029H2.69076V1.64453H43.0658C46.6178 1.64453 49.7116 2.3737 52.3366 3.83203C54.972 5.27995 57.0345 7.27995 58.5241 9.83203C60.0085 12.3893 60.7533 15.332 60.7533 18.6654C60.7533 21.0404 60.2845 23.3268 59.3574 25.5195C58.4251 27.7018 56.9616 29.681 54.9616 31.457L21.3783 61.1445C21.3053 61.2279 21.2168 61.3477 21.1074 61.4987C20.9928 61.6393 20.9199 61.7643 20.8783 61.8737C20.8366 61.9883 20.8158 62.1549 20.8158 62.3737C20.8158 62.6654 20.8887 62.9466 21.0449 63.207C21.196 63.4727 21.4199 63.681 21.7116 63.832C22.0033 63.9727 22.3366 64.0404 22.7116 64.0404H61.2949V79.4987H18.4824Z"
                  fill="currentColor"
                />
                <path
                  d="M83.2005 79.4987C78.8255 79.4987 74.8516 78.4779 71.2839 76.4362C67.7266 74.3945 64.8932 71.655 62.7839 68.207C60.6693 64.7643 59.6172 60.8529 59.6172 56.4779C59.6172 53.2174 60.3359 50.1602 61.7839 47.3112C63.2266 44.4518 65.1797 41.9883 67.638 39.9154C65.263 37.9154 63.388 35.5508 62.013 32.8112C60.638 30.0612 59.9505 27.1654 59.9505 24.1237C59.9505 19.8216 60.9818 15.9779 63.0547 12.6029C65.138 9.22786 67.9193 6.5612 71.4089 4.60286C74.8932 2.63411 78.7474 1.64453 82.9714 1.64453H115.784V17.2279H85.8672C84.4609 17.2279 83.1641 17.5612 81.9714 18.2279C80.7891 18.8945 79.8464 19.7852 79.138 20.8945C78.4297 22.0091 78.0755 23.306 78.0755 24.7904C78.0755 26.1966 78.4297 27.4727 79.138 28.6237C79.8464 29.7799 80.7891 30.6654 81.9714 31.2904C83.1641 31.9154 84.4609 32.2279 85.8672 32.2279H111.992V47.8112H86.4297C84.8724 47.8112 83.4609 48.181 82.2005 48.9154C80.9349 49.6549 79.9297 50.6185 79.1797 51.8112C78.4401 52.9935 78.0755 54.3633 78.0755 55.9154C78.0755 57.4049 78.4401 58.7591 79.1797 59.9779C79.9297 61.2018 80.9349 62.1445 82.2005 62.8112C83.4609 63.4779 84.8724 63.8112 86.4297 63.8112H115.784V79.4987H83.2005Z"
                  fill="currentColor"
                />
                <path
                  d="M140.904 79.4987C136.081 79.4987 131.852 78.4258 128.217 76.2695C124.592 74.1185 121.779 71.2643 119.779 67.707C117.779 64.1549 116.779 60.2227 116.779 55.9154V1.64453H135.446V57.2487C135.446 59.0404 136.076 60.6029 137.342 61.9362C138.602 63.2695 140.16 63.9362 142.008 63.9362H162.592V79.4987H140.904Z"
                  fill="currentColor"
                />
                <path
                  d="M292.665 79.4987V63.9362H325.915C327.399 63.9362 328.732 63.5716 329.915 62.832C331.107 62.082 332.05 61.1185 332.748 59.9362C333.456 58.7435 333.811 57.4466 333.811 56.0404C333.811 54.556 333.456 53.2227 332.748 52.0404C332.05 50.8477 331.107 49.8841 329.915 49.1445C328.732 48.3945 327.399 48.0195 325.915 48.0195H313.915C309.383 48.0195 305.269 47.1341 301.561 45.3529C297.852 43.5768 294.899 40.9674 292.706 37.5195C290.524 34.0768 289.436 29.9466 289.436 25.1237C289.436 20.3737 290.467 16.2591 292.54 12.7695C294.623 9.28516 297.441 6.5612 300.998 4.60286C304.566 2.63411 308.498 1.64453 312.79 1.64453H347.165V17.2279H314.915C313.566 17.2279 312.337 17.5612 311.227 18.2279C310.113 18.8945 309.258 19.7852 308.665 20.8945C308.081 22.0091 307.79 23.2279 307.79 24.5612C307.79 25.8945 308.081 27.1029 308.665 28.1862C309.258 29.2591 310.113 30.1237 311.227 30.7904C312.337 31.457 313.566 31.7904 314.915 31.7904H327.477C332.436 31.7904 336.748 32.7383 340.415 34.6237C344.092 36.5143 346.946 39.1445 348.977 42.5195C351.019 45.8945 352.04 49.8477 352.04 54.3737C352.04 59.707 350.982 64.2487 348.873 67.9987C346.758 71.7383 343.925 74.5925 340.373 76.5612C336.816 78.5195 332.883 79.4987 328.581 79.4987H292.665Z"
                  fill="currentColor"
                />
                <path
                  d="M354.923 80.8333C351.965 80.8333 349.428 79.776 347.319 77.6667C345.204 75.5573 344.152 73.0573 344.152 70.1667C344.152 67.1979 345.204 64.6563 347.319 62.5417C349.428 60.4323 351.965 59.375 354.923 59.375C357.809 59.375 360.309 60.4323 362.423 62.5417C364.548 64.6563 365.611 67.1979 365.611 70.1667C365.611 72.0833 365.121 73.8646 364.152 75.5C363.194 77.125 361.913 78.4271 360.319 79.3958C358.72 80.3542 356.923 80.8333 354.923 80.8333Z"
                  fill="currentColor"
                />
                <defs>
                  <clipPath id="clip0">
                    <rect x="154" y="0" width="140" height="84" rx="42" />
                  </clipPath>
                </defs>

                <g clipPath="url(#clip0)" stroke="currentColor" strokeWidth="29.8651">
                  <path
                    d="M196.072 0.306641H251.765C262.77 0.306641 273.328 4.67644 281.109 12.4577C288.89 20.2442 293.265 30.7962 293.265 41.8067C293.265 52.8119 288.89 63.3692 281.109 71.1504C273.328 78.9317 262.77 83.3067 251.765 83.3067H196.072C185.067 83.3067 174.51 78.9317 166.729 71.1504C158.947 63.3692 154.572 52.8119 154.572 41.8067C154.572 30.7962 158.947 20.2442 166.729 12.4577C174.51 4.67644 185.067 0.306641 196.072 0.306641Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="29.8651"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              </svg>
            </span>
          </a>
        </div>
      </nav>

      {/* conteudo principal da pag de login */}
      <section className="flex flex-row !w-full h-full principal-container dark:bg-gray-800">
        <section className="w-1/2 h-full justify-items-center content-center form-login bg-white dark:bg-gray-800">
          <div className='flex flex-col w-md form-login-container'>
            <h1 className="poppins-bold text-[3rem] text-[#2E2C34] dark:text-white mb-4">Entrar</h1>
            <p className="poppins-regular text-[#2E2C34] text-[1rem] dark:text-white">Faça login para acessar sua conta.</p>

            {/* inputs de email e senha */}
            <form onSubmit={login}>
              <div className="relative z-0 w-full mb-5 group">
                <input type="nuber" name="floating_num" id="floating_num" className="block py-2.5 px-0 w-full text-sm text-gray-900 dark:text-gray-100 bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-700 appearance-none dark:focus:border-[#7F56D8] focus:outline-none focus:ring-0 focus:border-[#7F56D8] peer poppins-regular my-9" placeholder=" " required />
                <label htmlFor="floating_num" className="peer-focus:poppins-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-8 scale-75 top-2.5 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-[#7F56D8] peer-focus:dark:text-[#7F56D8] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-8 poppins-regular">Username</label>
              </div>

              <div className="relative z-0 w-full mb-5 group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="floating_password"
                  id="floating_password"
                  value={password}
                  onFocus={() => setShowEye(true)}     // mostra o olho ao focar
                  onBlur={() => { if (!password) setShowEye(false); }} // esconde se perder foco sem nada digitado
                  onChange={(e) => setPassword(e.target.value)} // controla valor
                  className="block py-2.5 px-0 pr-10 w-full text-sm text-gray-900 dark:text-gray-100 bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-700 appearance-none focus:outline-none focus:ring-0 focus:border-[#7F56D8] peer poppins-regular my-9"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="floating_password"
                  className="peer-focus:poppins-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-8 scale-75 top-2.5 -z-10 origin-[0] peer-focus:text-[#7F56D8] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-8 poppins-regular"
                >
                  Senha
                </label>

                {/* botão do olho, aparece só se showEye = true */}
                {showEye && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      // olho aberto
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                        <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
                      </svg>

                    ) : (
                      // olho fechado
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.676 12.553a11.249 11.249 0 0 1-2.631 4.31l-3.099-3.099a5.25 5.25 0 0 0-6.71-6.71L7.759 4.577a11.217 11.217 0 0 1 4.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113Z" />
                        <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0 1 15.75 12ZM12.53 15.713l-4.243-4.244a3.75 3.75 0 0 0 4.244 4.243Z" />
                        <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 0 0-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 0 1 6.75 12Z" />
                      </svg>

                    )}
                  </button>
                )}
              </div>
              {erro && (
                <p className="text-red-500 text-sm mb-10 poppins-regular">{erro}</p>
              )}
              {/* concordancia com os termos */}
              {/* <div className="flex justify-between items-center mb-4 mb-10">
                <div className="flex items-center">
                  <input type="checkbox" id="hs-default-checkbox" className="accent-[#7F56D8] shrink-0 border-[#7F56D8] rounded-sm focus:ring-[#7F56D8] disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:focus:ring-offset-gray-800" />
                  <label htmlFor="hs-default-checkbox" className="text-sm text-gray-500 ms-3 dark:text-neutral-400 poppins-regular">Eu li e concordo com os <a href="#" className="text-[#7F56D8] hover:underline poppins-regular">termos</a>.</label>
                </div>
                <div><Link href="/forgotPassword"><p className="text-sm text-[#7F56D8] hover:underline poppins-regular">Esqueci a senha</p></Link></div>
              </div> */}

              {/* botao de entrar */}
              <button type="submit" disabled={loading} className="text-white bg-violet-500 hover:bg-violet-600 focus:ring-4 focus:outline-none focus:ring-blue-300 poppins-medium rounded-full text-sm w-full px-5 py-4 text-center dark:bg-violet-500 dark:hover:bg-violet-600 dark:focus:ring-violet-500 poppins-regular px-18"> {loading ? (
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

        <section className="w-1/2 h-full justify-items-center content-center cont-img dark:bg-gray-800">

          {/* imagem do login*/}
          <div className="justify-center items-center bg-neutral-100 dark:bg-gray-700 rounded-3xl">
            <Image
              src="/img/loginZelos.png"
              width={400}
              height={600}
              alt="Mão segurando celular"
              className='login-img '
            />
          </div>
        </section>
      </section>
    </main>
  );
}