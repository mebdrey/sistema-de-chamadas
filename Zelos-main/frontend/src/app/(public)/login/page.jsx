"use client";
import { useEffect } from "react";

export default function Login() {
  useEffect(() => {
    document.title = 'Zelos - Login';
  }, []);

  return (
    <main className="overflow-hidden w-screen h-screen">

      {/* header */}
      <nav className="bg-white border-gray-200 dark:bg-gray-900 w-screen">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a href="https://flowbite.com/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Flowbite Logo" />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>
          </a>
        </div>
      </nav>

      {/* conteudo principal da pag de login */}
<section className="flex flex-row w-full h-full">
      <section className="w-1/2 h-full justify-items-center content-center">
        <div className='flex flex-col w-md'>
          <h1 className="poppins-bold text-[3rem] text-[#2E2C34] mb-4">Entrar</h1>
          <p className="poppins-regular text-[#2E2C34] text-[1rem]">Faça login para acessar sua conta.</p>

          {/* inputs de email e senha */}
          <form className="">
            <div className="relative z-0 w-full mb-5 group">
              <input type="email" name="floating_email" id="floating_email" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-[#7F56D8] focus:outline-none focus:ring-0 focus:border-[#7F56D8] peer poppins-regular my-9" placeholder=" " required />
              <label htmlFor="floating_email" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-[#7F56D8] peer-focus:dark:text-[#7F56D8] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 poppins-regular">Email</label>
            </div>

            <div className="relative z-0 w-full mb-5 group">
              <input type="password" name="floating_password" id="floating_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-[#7F56D8] focus:outline-none focus:ring-0 focus:border-[#7F56D8] peer poppins-regular my-9" placeholder=" " required />
              <label htmlFor="floating_password" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-[#7F56D8] peer-focus:dark:text-[#7F56D8] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 poppins-regular" >Senha</label>
            </div>

            {/* concordancia com os termos + esqueci a senha*/}
            <div className="flex justify-between items-center mb-4 mb-10">
              <div className="flex items-center">
                <input type="checkbox" id="hs-default-checkbox" className="accent-[#7F56D8] shrink-0 mt-0.5 border-[#7F56D8] rounded-sm focus:ring-[#7F56D8] disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:focus:ring-offset-gray-800" />
                <label htmlFor="hs-default-checkbox" className="text-sm text-gray-500 ms-3 dark:text-neutral-400 poppins-regular">Eu li e concordo com os <a href="#" className="text-[#7F56D8] dark:text-blue-500 hover:underline poppins-regular">termos</a>.</label>
              </div>

              <div><a href="#"><p className="text-sm text-[#7F56D8] hover:underline poppins-regular">Esqueci a senha</p></a></div>
            </div>

            {/* botao de entrar */}
            <button type="submit" className="text-white bg-[#7F56D8] hover:bg-[#7761A9] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-[#7F56D8] dark:focus:ring-[#7761A9] poppins-regular px-18">Entrar</button>

            <div>
              <div className="py-3 flex items-center text-xs text-gray-400 uppercase before:flex-1 before:border-t before:border-gray-200 before:me-6 after:flex-1 after:border-t after:border-gray-200 after:ms-6 dark:text-neutral-500 dark:before:border-neutral-600 dark:after:border-neutral-600 my-8">Ou</div>
              <button type="button" className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800 poppins-regular">
                <svg className="w-4 h-auto" width="46" height="47" viewBox="0 0 46 47" fill="none">
                  <path d="M46 24.0287C46 22.09 45.8533 20.68 45.5013 19.2112H23.4694V27.9356H36.4069C36.1429 30.1094 34.7347 33.37 31.5957 35.5731L31.5663 35.8669L38.5191 41.2719L38.9885 41.3306C43.4477 37.2181 46 31.1669 46 24.0287Z" fill="#4285F4" />
                  <path d="M23.4694 47C29.8061 47 35.1161 44.9144 39.0179 41.3012L31.625 35.5437C29.6301 36.9244 26.9898 37.8937 23.4987 37.8937C17.2793 37.8937 12.0281 33.7812 10.1505 28.1412L9.88649 28.1706L2.61097 33.7812L2.52296 34.0456C6.36608 41.7125 14.287 47 23.4694 47Z" fill="#34A853" />
                  <path d="M10.1212 28.1413C9.62245 26.6725 9.32908 25.1156 9.32908 23.5C9.32908 21.8844 9.62245 20.3275 10.0918 18.8588V18.5356L2.75765 12.8369L2.52296 12.9544C0.909439 16.1269 0 19.7106 0 23.5C0 27.2894 0.909439 30.8731 2.49362 34.0456L10.1212 28.1413Z" fill="#FBBC05" />
                  <path d="M23.4694 9.07688C27.8699 9.07688 30.8622 10.9863 32.5344 12.5725L39.1645 6.11C35.0867 2.32063 29.8061 0 23.4694 0C14.287 0 6.36607 5.2875 2.49362 12.9544L10.0918 18.8588C11.9987 13.1894 17.25 9.07688 23.4694 9.07688Z" fill="#EB4335" />
                </svg>Entrar com o Google</button>
            </div>
          </form>

        </div>
      </section>

      <section className="w-1/2 h-full justify-items-center content-center">

        {/* imagem do login*/}
        <div></div>
      </section>
      </section>
    </main>
  );
}
