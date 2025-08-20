'use client';
import "../globals.css";
import { useState, useEffect } from 'react';
import SideBar from '../../components/NavBar/NavBar.jsx';
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute.jsx";
import { initFlowbite } from 'flowbite'
import 'flowbite/dist/flowbite.css';
import { usePathname } from "next/navigation";
import { getMetadataFromPath } from "../utils/metadata.js";
import { useRouter } from "next/navigation";

export default function PrivateLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const [userType, setUserType] = useState(null);
  const router = useRouter();

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
   // pega se está em tela grande (desktop) ou pequena (tablet pra baixo)
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768); // md breakpoint
    };
    handleResize(); // roda na montagem
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mainWidth = isDesktop ? `calc(100% - ${sidebarWidth}px)` : "100%";

  useEffect(() => {
    import('flowbite'); // garante que o JS rode só no cliente
  }, []);

  // Busca dados do usuário logado via API

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("http://localhost:8080/auth/check-auth", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Não autenticado");

        const data = await res.json();
        setUser(data.user);
        setUserType(data.user.funcao);
      } catch (error) {
        setUser(null);
        setUserType(null);
        router.push("/login");
      } finally {
        setLoading(false); 
      }
    }

    fetchUser();
  }, [router]);

  // bloqueia renderização enquanto checa autenticação
  if (loading) return null;

  return (
    <>
    <ProtectedRoute>
      <SideBar user={user} setUser={setUser} userType={user?.funcao} navFechada={navFechada} setNavFechada={setNavFechada} />
      <main className="w-full bg-[#F8FAFB] justify-items-end">
        <section className="h-fit transition-all duration-300" style={{ width: mainWidth }}>
          {children}
        </section>
      </main>
      </ProtectedRoute>
    </>
  );
}
