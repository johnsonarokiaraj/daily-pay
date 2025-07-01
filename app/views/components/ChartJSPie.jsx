import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

const COLORS = [
  '#059669', '#10b981', '#34d399', '#6ee7b7', '#9cf0d8',
  '#dc2626', '#f87171', '#fca5a5', '#fecaca', '#fee2e2',
];

export default function ChartJSPie({ data, title }) {
  const chartData = {
    labels: data.length > 0 ? data.map(d => d.tag) : ['No Data'],
    datasets: [
      {
        data: data.length > 0 ? data.map(d => d.value) : [1],
        backgroundColor: COLORS,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#222',
          font: { size: 14, weight: 'bold' },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ₹${value.toLocaleString()}`;
          },
        },
      },
      title: {
        display: !!title,
        text: title,
        color: '#222',
        font: { size: 18, weight: 'bold' },
      },
    },
  };

  return (
    <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
}

