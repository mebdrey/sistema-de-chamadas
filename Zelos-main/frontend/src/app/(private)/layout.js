'use client';
import "../globals.css";
import { useState, useEffect } from 'react';
import SideBar from '../../components/NavBar/NavBar.jsx';
import { initFlowbite } from 'flowbite'

import { usePathname } from "next/navigation";
import { getMetadataFromPath } from "../utils/metadata.js";

export default function PrivateLayout({ children }) {
     const pathname = usePathname();

  useEffect(() => {
    const meta = getMetadataFromPath(pathname.replace(/^\//, "")); // remove /
    document.title = meta.title;
    const descTag = document.querySelector("meta[name='description']");
    if (descTag) {
      descTag.setAttribute("content", meta.description);
    }
  }, [pathname]);

    // sidebar  fechada = true: largura 64px, aberta = false: largura 256px
    const [navFechada, setNavFechada] = useState(true);
    const sidebarWidth = navFechada ? 64 : 256; // valores em px correspondentes ao Tailwind
    const mainWidth = `calc(100% - ${sidebarWidth}px)`;

    // funcao do flowbite p/ configurar funções de inicializacao p dropdown, modal e assim por diante
        useEffect(() => {
            initFlowbite()
        }, [])
    return (
        <>
            <SideBar navFechada={navFechada} setNavFechada={setNavFechada} />
            <main className="w-full justify-items-end">
                <section className="h-fit transition-all duration-300" style={{ width: mainWidth }}>
                    {children}
                </section>
            </main>
        </>
    );
}
