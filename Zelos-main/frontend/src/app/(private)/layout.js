'use client';
import "../globals.css";
import { useState, useEffect } from 'react';
import SideBar from '../../components/navBar/NavBar.jsx';
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute.jsx";
import { usePathname, useRouter } from "next/navigation";
import { getMetadataFromPath } from "../utils/metadata.js";
import 'flowbite/dist/flowbite.css';
import '@/app/globals.css'

// Helpers seguros para localStorage (não quebram no SSR)
const isBrowser = () => typeof window !== 'undefined';
const ls = {
  get: (k) => (isBrowser() ? window.localStorage.getItem(k) : null),
  set: (k, v) => { if (isBrowser()) window.localStorage.setItem(k, v); },
  remove: (k) => { if (isBrowser()) window.localStorage.removeItem(k); }
};

export default function PrivateLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const [userType, setUserType] = useState(null);
  const router = useRouter();

  // SEO por rota
  useEffect(() => {
    const meta = getMetadataFromPath(pathname.replace(/^\//, ""));
    if (isBrowser()) {
      document.title = meta.title;
      const descTag = document.querySelector("meta[name='description']");
      if (descTag) descTag.setAttribute("content", meta.description);
    }
  }, [pathname]);

  // sidebar  fechada = true: largura 64px, aberta = false: largura 256px
  const [navFechada, setNavFechada] = useState(true);
  const sidebarWidth = navFechada ? 64 : 256; // valores em px correspondentes ao Tailwind

  // pega se está em tela grande (desktop) ou pequena (tablet pra baixo)
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    if (!isBrowser()) return;
    const handleResize = () => setIsDesktop(window.innerWidth >= 768); // md breakpoint
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mainWidth = isDesktop ? `calc(100% - ${sidebarWidth}px)` : "100%";

  // carrega JS do Flowbite só no cliente
  useEffect(() => {
    (async () => {
      if (isBrowser()) {
        await import('flowbite');
      }
    })();
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

        // salva um "minimal" no localStorage com segurança (apenas no client)
        const minimal = {
          id: data.user.id,
          nome: data.user.nome || data.user.name || '',
          funcao: data.user.funcao || data.user.role || ''
        };
        ls.set('currentUser', JSON.stringify(minimal));
        ls.set('currentUserId', String(minimal.id));
      } catch (error) {
        setUser(null);
        setUserType(null);
        router.push("/login");
      } finally {setLoading(false);}
    }
    fetchUser();
  }, [router]);

  // >>> FIX PRINCIPAL <<<
  // NÃO ler localStorage no initializer. Começa undefined e preenche após o mount.
  const [currentUserId, setCurrentUserId] = useState(undefined);

  // tenta ler do localStorage no carregamento inicial (apenas client)
  useEffect(() => {
    if (!isBrowser()) return;
    try {
      const raw = ls.get('currentUser') || ls.get('currentUserId');
      if (!raw) { setCurrentUserId(undefined); return; }

      if (raw.startsWith?.('{')) {
        const obj = JSON.parse(raw);
        setCurrentUserId(obj?.id ? String(obj.id) : undefined);
      } 
      else { setCurrentUserId(String(raw));}
    } catch (e) {
      console.warn('Erro ao ler currentUser do localStorage', e);
      setCurrentUserId(undefined);
    }
  }, []);

  // para atualizar se o usuário fizer login em outra aba
  useEffect(() => {
    if (!isBrowser()) return;
    const handleStorage = () => {
      try {
        const raw = ls.get('currentUser') || ls.get('currentUserId');
        if (!raw) { setCurrentUserId(undefined); return; }

        if (raw.startsWith?.('{')) {
          const obj = JSON.parse(raw);
          setCurrentUserId(obj?.id ? String(obj.id) : undefined);
        }
        else { setCurrentUserId(String(raw)); }
      } catch (err) {
        console.warn('Erro no storage event', err);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // bloqueia renderização enquanto checa autenticação
  if (loading) return null;

  return (
    <>
      <ProtectedRoute>
        <SideBar user={user} setUser={setUser} userType={user?.funcao} navFechada={navFechada} setNavFechada={setNavFechada} />
        <main className="w-full min-h-screen bg-[#F8FAFB] dark:bg-gray-900 justify-items-end">
          <section className="flex-1 flex flex-col overflow-y-auto transition-all duration-300 dark:bg-gray-900" style={{ width: mainWidth }}>
            {children}
          </section>
        </main>
      </ProtectedRoute>
    </>
  );
}
