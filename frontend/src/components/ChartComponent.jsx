import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ChartComponent = ({ type, data, title }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151',
        }
      },
      title: {
        display: !!title,
        text: title,
        color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: type !== 'pie' ? {
      y: {
        ticks: { color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563' },
        grid: { color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb' }
      },
      x: {
        ticks: { color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563' },
        grid: { display: false }
      }
    } : {}
  };

  return (
    <div className="h-64 sm:h-80 w-full p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm">
      {type === 'bar' && <Bar options={options} data={data} />}
      {type === 'pie' && <Pie options={options} data={data} />}
      {type === 'line' && <Line options={options} data={data} />}
    </div>
  );
};

export default ChartComponent;
