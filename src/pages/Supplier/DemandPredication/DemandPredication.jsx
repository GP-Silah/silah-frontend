import React, { useEffect } from 'react';
import './DemandPredication.css';
import { Line } from 'react-chartjs-2';
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Legend,
} from 'chart.js';
import { useTranslation } from 'react-i18next';

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Legend);

export default function StockForecast() {
  const { t, i18n } = useTranslation('demandPredication');

  useEffect(() => {
    document.title = t('pageTitle');
    document.documentElement.setAttribute('dir', i18n.dir());
  }, [i18n.language, t]);

  const data = {
    labels: ['April', 'May', 'June'],
    datasets: [
      {
        label: 'Demand',
        data: [50, 30, 80],
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74, 144, 226, 0.2)',
        tension: 0.3,
      },
      {
        label: 'Current Stock',
        data: [40, 40, 40],
        borderColor: '#A17CCB',
        backgroundColor: 'rgba(161, 124, 203, 0.2)',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { boxWidth: 15, color: '#444', font: { size: 13 } },
      },
    },
    scales: {
      y: { beginAtZero: false, min: 30, max: 80, ticks: { color: '#555' } },
      x: { ticks: { color: '#555' } },
    },
  };

  return (
    <div className="forecast-page">
      <div className="forecast-container">
        <h1 className="forecast-title">Stock Demand Forecast</h1>
        <p className="forecast-subtitle">
          AI-powered insights to help you plan ahead for the next three months
        </p>

        <div className="forecast-product">
          <h3>Forecasted Product</h3>
          <img
            src="/images/candle.png"
            alt="Amber Candle"
            className="forecast-image"
          />
          <p className="forecast-product-name">Amber - 250ml Soy Candle</p>
        </div>

        <div className="forecast-chart">
          <Line data={data} options={options} />
        </div>

        <p className="forecast-note">
          To avoid shortages, consider restocking <b>120 units</b> as per AI
          demand predictions.
        </p>
      </div>
    </div>
  );
}
