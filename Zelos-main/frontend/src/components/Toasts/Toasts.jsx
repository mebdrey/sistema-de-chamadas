'use client';
import { useState } from "react";
const ToastMsg = () => {
    const [toasts, setToasts] = useState([]); // { id, type: 'success'|'danger'|'warning', message }

    // alias para showToast 
    const showToastLocal = (type, message, timeout = 5000) => showToast(type, message, timeout);

    const removeToast = (id) => {
        // aplica a classe de saída antes de remover
        setToasts((prev) =>
            prev.map((t) =>
                t.id === id ? { ...t, leaving: true } : t
            )
        );

        // espera animação acabar antes de remover
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 300); // ms precisa bater com toast-out (0.25s)
    };

    const showToast = (type, message, timeout = 5000) => {
        const id = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const newToast = { id, type, message };
        setToasts((prev) => [newToast, ...prev]);
        if (timeout > 0) { setTimeout(() => removeToast(id), timeout); }
    };

    return {
        UI: (
            <>
                {/* TOASTS: canto inferior direito */}
                <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-[99]">
                    {toasts.map(({ id, type, message, leaving  }) => (
                        <div key={id} className={`flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800 border ${type === 'success' ? 'border-green-100' : type === 'danger' ? 'border-red-100' : 'border-orange-100'}`} role="alert">
                            <div className={`inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg ${type === 'success' ? 'text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200' : type === 'danger' ? 'text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200' : 'text-orange-500 bg-orange-100 dark:bg-orange-700 dark:text-orange-200'} toast-card ${leaving ? "toast-out" : "toast-in"}`}>
                                {type === 'success' && (
                                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                                    </svg>
                                )}
                                {type === 'danger' && (
                                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
                                    </svg>
                                )}
                                {type === 'warning' && (
                                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z" />
                                    </svg>
                                )}
                            </div>

                            <div className="ms-3 text-sm font-normal max-w-xs break-words">{message}</div>

                            <button type="button" onClick={() => removeToast(id)} className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Close" >
                                <span className="sr-only">Close</span>
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            </>
        ), showToast
    }
}


export default ToastMsg;