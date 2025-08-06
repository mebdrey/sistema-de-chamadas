
"use client"
import React, { useEffect, useState, useRef } from "react";
import dynamic from 'next/dynamic'
import { ChevronDown, ChevronRight, ArrowUpRight } from 'lucide-react'
// Lazy load ApexCharts
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })


export default function GraficoChamadosPorMes() {
// grafico - chamados no mes de (?)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const options = {
    chart: {
      height: '100%',
      type: 'area',
      fontFamily: 'Inter, sans-serif',
      dropShadow: { enabled: false },
      toolbar: { show: false },
    },
    tooltip: {
      enabled: true,
      x: { show: false },
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
        shade: '#1C64F2',
        gradientToColors: ['#1C64F2'],
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 6 },
    grid: {
      show: false,
      strokeDashArray: 4,
      padding: { left: 2, right: 2, top: 0 },
    },
    series: [
      {
        name: 'New users',
        data: [6500, 6418, 6456, 6526, 6356, 6456],
        color: '#1A56DB',
      },
    ],
    xaxis: {
      categories: [
        '01 February',
        '02 February',
        '03 February',
        '04 February',
        '05 February',
        '06 February',
        '07 February',
      ],
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { show: false },
  }

  return(
    <>
    {/* grafico grande com o total de chamados */}
                  <div className="flex justify-between">
                    <div>
                      <h5 className="leading-none text-3xl font-bold text-gray-900 dark:text-white pb-2">32.4k</h5>
                      <p className="text-base font-normal text-gray-500 dark:text-gray-400">Quantidade de chamados neste mês</p>
                    </div>
                    <div className="flex items-center px-2.5 py-0.5 text-base font-semibold text-green-500 dark:text-green-500">
                      12%
                      <ArrowUpRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
    
                  <div className="mt-4">
                    <ApexChart options={options} series={options.series} type="area" height={160} />
                  </div>
    
                  <div className="grid grid-cols-1 border-t border-gray-200 dark:border-gray-700 pt-5">
                    <div className="flex justify-between items-center">
                      <div className="relative">
                        <button
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white inline-flex items-center"
                        >
                          Selecionar prioridade
                          <ChevronDown className="w-4 h-4 ml-1.5" />
                        </button>
    
                        {dropdownOpen && (
                          <div className="absolute z-10 mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm w-44">
                            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                              {['Alta', 'Baixa', 'Média'].map((label) => (
                                <li key={label}>
                                  <button
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                    onClick={() => {
                                      setDropdownOpen(false)
                                    }}
                                  >
                                    {label}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
    
                      <a
                        href="#"
                        className="uppercase text-sm font-semibold inline-flex items-center rounded-lg text-blue-600 hover:text-blue-700 dark:hover:text-blue-500 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Users Report
                        <ChevronRight className="w-3 h-3 ml-1.5" />
                      </a>
                    </div>
                  </div>
    
    </>
  )
}