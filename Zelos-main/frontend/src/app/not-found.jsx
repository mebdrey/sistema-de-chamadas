// app/not-found.jsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-neutral-900 dark:to-neutral-800 p-6">
      <div className="max-w-3xl w-full bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-700 rounded-2xl shadow-lg p-8 sm:p-12">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            {/* Decorative illustration */}
            <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-[#7F56D8] to-violet-400 flex items-center justify-center text-white text-4xl shadow-md">
              😕
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
              Página não encontrada
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6">
              A URL que você tentou acessar não existe ou foi movida. Pode ter acontecido um erro de digitação, ou o recurso foi removido.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/login" className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#7F56D8] hover:bg-[#6543b8] text-white font-medium shadow-sm">
                Voltar para o início
              </Link>

              <a href="mailto:suporte@zelos.com?subject=Página%20não%20encontrada" className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              >
                Reportar problema
              </a>
            </div>

            <div className="mt-6 text-xs text-gray-400">
              Se precisar, pressione <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-neutral-800 text-gray-700">Ctrl + R</span> para recarregar, ou verifique a URL.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
