import Chart from "react-apexcharts";

export default function ChamadosPorPrioridade() {
  const options = {
    chart: { type: "bar" },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6
      }
    },
    colors: ["#a78bfa", "#60a5fa", "#34d399"], // Roxo, Azul, Verde
    xaxis: {
      categories: ["Alta", "Média", "Baixa"]
    },
    legend: { show: false }
  };

  const series = [
    {
      name: "Chamados",
      data: [40, 70, 25] // qtd de chamados por prioridade
    }
  ];

  return <Chart options={options} series={series} type="bar" height={300} />;
}
