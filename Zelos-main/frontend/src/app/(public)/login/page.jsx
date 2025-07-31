"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";

export default function Login () {
  // titulo da guia
  useEffect(() => {
    document.title = 'Zelos - Login';
  }, []);
  return (
<>
<main>
    <section>
        <div className='flex flex-col'>
            <h1>Entrar</h1>
            <p>Faça login para acessar sua conta.</p>
        </div>
        {/* imagem do login */}
        <div></div>
    </section>
</main>
</>
  );
}