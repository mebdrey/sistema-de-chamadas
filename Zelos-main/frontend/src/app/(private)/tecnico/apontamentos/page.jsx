'use client';

import { useState, useEffect } from 'react';

export default function ApontamentosPage() {
  const [apontamentos, setApontamentos] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [apontamentoAtivo, setApontamentoAtivo] = useState(null);

  // Buscar apontamentos simulados (substitua por fetch real)
  useEffect(() => {
    const exemplo = [
      {
        id: 1,
        descricao: 'Desmontagem e análise do equipamento.',
        comeco: '2025-08-17T10:35:00',
        fim: '2025-08-17T12:15:00'
      },
      {
        id: 2,
        descricao: 'Troca de cabo e teste de rede.',
        comeco: '2025-08-17T14:00:00',
        fim: null // Em andamento
      }
    ];
    setApontamentos(exemplo);
    setApontamentoAtivo(exemplo.find((a) => !a.fim));
  }, []);

  const iniciarApontamento = async () => {
    if (!descricao.trim()) return;
    // Aqui você chamaria o backend com fetch/axios
    const novo = {
      id: Date.now(),
      descricao,
      comeco: new Date().toISOString(),
      fim: null
    };
    setApontamentos((prev) => [...prev, novo]);
    setApontamentoAtivo(novo);
    setDescricao('');
  };

  const finalizarApontamento = async (id) => {
    const atualizado = apontamentos.map((a) =>
      a.id === id ? { ...a, fim: new Date().toISOString() } : a
    );
    setApontamentos(atualizado);
    setApontamentoAtivo(null);
  };

  return (
     <div className="p-4 w-full">
                <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14"></div>
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Apontamentos do Chamado #123</h1>

      {/* Timeline */}
      <ol className="relative border-s border-gray-300 mb-10">
        {apontamentos.map((a) => (
          <li key={a.id} className="mb-10 ms-4">
            <div className={`absolute w-3 h-3 rounded-full mt-1.5 -start-1.5 ${a.fim ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <time className="mb-1 text-sm text-gray-500">
              {new Date(a.comeco).toLocaleString('pt-BR')}
            </time>
            <h3 className="text-lg font-semibold">
              {a.fim ? 'Apontamento finalizado' : 'Apontamento em andamento'}
            </h3>
            <p className="text-gray-700">{a.descricao}</p>
            {a.fim && (
              <p className="text-sm text-gray-500 mt-1">
                Encerrado em {new Date(a.fim).toLocaleString('pt-BR')}
              </p>
            )}
          </li>
        ))}
      </ol>

      {/* Formulário */}
      {!apontamentoAtivo && (
        <div className="mb-6">
          <label htmlFor="descricao" className="block mb-2 text-sm font-medium text-gray-900">
            Nova atividade realizada
          </label>
          <textarea
            id="descricao"
            rows="4"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Descreva o que foi feito..."
          />
          <button
            onClick={iniciarApontamento}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Iniciar apontamento
          </button>
        </div>
      )}

      {/* Botão para encerrar apontamento */}
      {apontamentoAtivo && (
        <div className="mt-6">
          <p className="text-sm text-gray-700 mb-2">
            Apontamento em andamento desde:{' '}
            {new Date(apontamentoAtivo.comeco).toLocaleString('pt-BR')}
          </p>
          <button
            onClick={() => finalizarApontamento(apontamentoAtivo.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Encerrar apontamento
          </button>
        </div>
      )}
    </div>
     </div> 
  );
}
