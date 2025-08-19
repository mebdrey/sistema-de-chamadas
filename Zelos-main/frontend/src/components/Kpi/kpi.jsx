import Chart from "react-apexcharts";

export default function KpiSla() {
  const options = {
    chart: { type: "radialBar" },
    plotOptions: {
      radialBar: {
        hollow: { size: "70%" },
        dataLabels: {
          name: { show: true, fontSize: "16px" },
          value: { fontSize: "22px", color: "#a78bfa" }
        }
      }
    },
    labels: ["SLA cumprido"]
  };

  const series = [76]; // % de SLA cumprido
  return <Chart options={options} series={series} type="radialBar" height={300} />;
}