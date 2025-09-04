'use client';
import React, { useEffect, useRef, useState } from 'react';

const TIMEOUT_MS = 10_000;      // timeout para cada fetch
const PING_INTERVAL = 3000;    // intervalo entre tentativas de reconexão
const MAX_PING_RETRIES = 60;   // máximo tentativas (apenas safety)

export default function ClientFetchInterceptor() {
  const originalFetchRef = useRef(typeof window !== 'undefined' ? window.fetch : null);
  const [offline, setOffline] = useState(false);
  const pingIntervalRef = useRef(null);
  const pingAttemptsRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // guarda fetch original
    const originalFetch = originalFetchRef.current || window.fetch;

    // wrapper
    async function wrappedFetch(input, init = {}) {
      // Create AbortController timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      // merge signals if provided
      if (init.signal) {
        // if caller passed a signal, we won't replace it; but we respect ours by race:
        const callerSignal = init.signal;
        // create a new combined signal by aborting when either aborts:
        // simplest: if caller aborts, we abort our controller too
        callerSignal.addEventListener?.('abort', () => controller.abort());
      }
      const finalInit = { ...init, signal: controller.signal, credentials: init.credentials ?? 'include' };

      try {
        const response = await originalFetch(input, finalInit);
        clearTimeout(timeoutId);

        // 401/403 -> forçar logout/redirect
        if (response.status === 401 || response.status === 403) {
          // pode rodar limpeza local de auth aqui se quiser
          // forçar redirect completo (evita ficar "preso" na página com erro)
          window.location.href = '/login';
          // never continue
          throw new Error('Unauthorized');
        }

        // server errors -> trigger offline overlay and throw so callers can handle
        if (response.status >= 500) {
          triggerOfflineMode();
        }

        return response;
      } catch (err) {
        clearTimeout(timeoutId);

        // AbortError (timeout) ou network error (TypeError) -> entrar em offline mode
        if (err.name === 'AbortError' || err instanceof TypeError) {
          triggerOfflineMode();
        }

        throw err; // preserve semantics for existing code
      }
    }

    // install wrapper
    window.fetch = wrappedFetch;

    // cleanup on unmount (rare)
    return () => {
      window.fetch = originalFetch;
      clearInterval(pingIntervalRef.current);
    };
  }, []);

  // ativa overlay + inicia polling se ainda não ativo
  const triggerOfflineMode = () => {
    if (offline) return;
    setOffline(true);
    pingAttemptsRef.current = 0;

    // start pinging server directly with original fetch to avoid recursion issues
    const originalFetch = originalFetchRef.current || window.fetch;
    pingIntervalRef.current = setInterval(async () => {
      pingAttemptsRef.current += 1;
      try {
        // ping a rota leve; /api/health é preferível, mas '/' geralmente serve
        // usamos originalFetch direto para evitar wrapper recursion
        const pingRes = await originalFetch(window.location.origin + '/', { method: 'HEAD', credentials: 'include' });
        // consider OK if got any response (2xx/3xx/4xx all mean server is reachable)
        if (pingRes) {
          // servidor voltou — limpar overlay e recarregar (garante estado limpo)
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
          setOffline(false);
          // opcional: reload para garantir que o front sincronize novamente com o server
          // se preferir evitar reload, remova a linha abaixo
          window.location.reload();
        }
      } catch (e) {
        // ainda offline; se exceder tentativas, continue tentando (no dev, pode levar alguns segundos)
        if (pingAttemptsRef.current >= MAX_PING_RETRIES) {
          // opcional: aumente MAX_PING_RETRIES / alerte o usuário
          // manter tentando indefinidamente é ok também
        }
      }
    }, PING_INTERVAL);
  };

  return (
    <>
      {offline && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.35)',
            zIndex: 999999,
          }}
        >
          <div style={{ background: 'white', padding: 20, borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Reconectando ao servidor…</div>
            <div style={{ fontSize: 13, color: '#444' }}>
              O servidor pode estar reiniciando. Tentando reconectar automaticamente.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
