function Indicadores() {
    const indicadores = [
      { titulo: "Tempo médio de resolução", valor: "2h 35min" },
      { titulo: "Chamados resolvidos este mês", valor: "124" },
      { titulo: "Satisfação do cliente", valor: "92%" }
    ];
  
    return (
      <div className="grid grid-cols-3 gap-4">
        {indicadores.map((item, idx) => (
          <div key={idx} className="bg-[#1f2937] p-4 rounded-2xl shadow-md text-center">
            <p className="text-gray-400 text-sm">{item.titulo}</p>
            <h2 className="text-xl poppins-bold text-purple-400">{item.valor}</h2>
          </div>
        ))}
      </div>
    );
  }
  