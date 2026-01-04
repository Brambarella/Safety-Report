import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function Dashboard() {
  const [summary, setSummary] = useState({
    totalLagging: 0,
    totalLeading: 0,
    temuanOpen: 0,
    temuanClosed: 0,
    laggingByJenis: {},
    leadingByJenis: {},
  });

  const authHeader = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }), []);

  const fetchSummary = async () => {
    try {
      const [lapRes, actRes, temRes] = await Promise.all([
        axios.get('http://localhost:5001/api/laporan', authHeader),
        axios.get('http://localhost:5001/api/aktivitas-k3', authHeader),
        axios.get('http://localhost:5001/api/temuan/verified', authHeader),
      ]);

      // === Lagging per jenis ===
      const laggingByJenis = lapRes.data.data.reduce((acc, cur) => {
        acc[cur.jenis_insiden] = (acc[cur.jenis_insiden] || 0) + 1;
        return acc;
      }, {});

      // === Leading per jenis ===
      const leadingByJenis = actRes.data.data.reduce((acc, cur) => {
        acc[cur.jenis_aktivitas] = (acc[cur.jenis_aktivitas] || 0) + 1;
        return acc;
      }, {});

      setSummary({
        totalLagging: lapRes.data.data.length,
        totalLeading: actRes.data.data.length,
        temuanOpen: temRes.data.data.filter(t => t.status_temuan === 'Open').length,
        temuanClosed: temRes.data.data.filter(t => t.status_temuan === 'Closed').length,
        laggingByJenis,
        leadingByJenis,
      });
    } catch (err) {
      console.error('Gagal mengambil data dashboard', err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  /* =====================
     DATA GRAFIK
  ===================== */

  const laggingChart = {
    labels: Object.keys(summary.laggingByJenis),
    datasets: [
      {
        label: 'Lagging Indicator',
        data: Object.values(summary.laggingByJenis),
      },
    ],
  };

  const leadingChart = {
    labels: Object.keys(summary.leadingByJenis),
    datasets: [
      {
        label: 'Leading Indicator',
        data: Object.values(summary.leadingByJenis),
      },
    ],
  };

  const temuanChart = {
    labels: ['Open', 'Closed'],
    datasets: [
      {
        label: 'Status Temuan',
        data: [summary.temuanOpen, summary.temuanClosed],
      },
    ],
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Dashboard K3 (Ringkasan)</h2>

      {/* ===== SUMMARY CARD ===== */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 40 }}>
        <Card title="Total Lagging" value={summary.totalLagging} />
        <Card title="Total Leading" value={summary.totalLeading} />
        <Card title="Temuan Open" value={summary.temuanOpen} />
        <Card title="Temuan Closed" value={summary.temuanClosed} />
      </div>

      {/* ===== GRAFIK ===== */}
      <div style={{ width: '70%', marginBottom: 50 }}>
        <h4>Grafik Lagging Indicator</h4>
        <Bar data={laggingChart} />
      </div>

      <div style={{ width: '70%', marginBottom: 50 }}>
        <h4>Grafik Leading Indicator</h4>
        <Bar data={leadingChart} />
      </div>

      <div style={{ width: '70%' }}>
        <h4>Grafik Status Temuan Lapangan</h4>
        <Bar data={temuanChart} />
      </div>
    </div>
  );
}

/* ===== CARD COMPONENT ===== */
const Card = ({ title, value }) => (
  <div style={cardStyle}>
    <h4>{title}</h4>
    <p style={{ fontSize: 22, fontWeight: 'bold' }}>{value}</p>
  </div>
);

const cardStyle = {
  border: '1px solid #ccc',
  borderRadius: 8,
  padding: 20,
  width: 180,
  textAlign: 'center',
};

export default Dashboard;
