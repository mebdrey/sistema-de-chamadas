"use client"
import dynamic from 'next/dynamic'
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function GraficoPorStatus() {
  const options = {
    chart: { type: 'donut' },
    labels: ['Em aberto', 'Em andamento', 'Encerrados'],
    colors: ['#A78BFA', '#60A5FA', '#34D399'],
    legend: { position: 'bottom' }
  }
//Quantidade de chamados
  const series = [55, 40, 80] 

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <h2 className="text-gray-700 dark:text-gray-300 mb-3">Chamados por Status</h2>
      <ApexChart options={options} series={series} type="donut" height={232} />
    </div>
  )
}