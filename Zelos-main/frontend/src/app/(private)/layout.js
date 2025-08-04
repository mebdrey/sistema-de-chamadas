'use client';
import "../globals.css";
import { useState } from 'react';
import SideBar from '../components/NavBar.jsx';

export default function PrivateLayout({ children }) {
    // sidebar fechada = true → largura 64px, aberta = false → largura 256px
    const [navFechada, setNavFechada] = useState(false);
    const sidebarWidth = navFechada ? 64 : 256; // valores em px correspondentes ao Tailwind
    const mainWidth = `calc(100% - ${sidebarWidth}px)`;

    return (
        <>
            <SideBar navFechada={navFechada} setNavFechada={setNavFechada} />
            <main className="w-screen justify-items-end">
                <section className="h-fit transition-all duration-300" style={{ width: mainWidth }}>
                    {children}
                </section>
            </main>
        </>
    );
}
