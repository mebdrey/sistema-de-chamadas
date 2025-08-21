import Chart from "react-apexcharts";

export default function KpiSla() {
  const options = {
    chart: { type: "radialBar" },
    plotOptions: {
      radialBar: {
        hollow: { size: "70%" },
        dataLabels: {
          name: { show: true, fontSize: "16px" },
          value: { fontSize: "22px", color: "#7f56d8" }
        }
      }
    },
    labels: ["SLA cumprido"],
    colors: ["#7f56d8"]
  };

  const series = [76]; // % de SLA cumprido
  return <Chart options={options} series={series} type="radialBar" height={340} />;
}