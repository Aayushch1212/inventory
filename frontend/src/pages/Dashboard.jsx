import { useState, useEffect } from 'react';
import { getDashboardStats } from '../api/client';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading stats…</div>;

  const cards = [
    { label: 'Total Products', value: stats?.total_products ?? 0, cls: 'purple', symbol: '◈' },
    { label: 'Total Customers', value: stats?.total_customers ?? 0, cls: 'pink', symbol: '◉' },
    { label: 'Total Orders', value: stats?.total_orders ?? 0, cls: 'teal', symbol: '◎' },
    { label: 'Revenue', value: `$${(stats?.total_revenue ?? 0).toFixed(2)}`, cls: 'green', symbol: '◆' },
    { label: 'Low Stock', value: stats?.low_stock_products ?? 0, cls: 'red', symbol: '⚠' },
    { label: 'Pending Orders', value: stats?.pending_orders ?? 0, cls: 'orange', symbol: '◷' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div className="stat-grid">
        {cards.map(({ label, value, cls, symbol }) => (
          <div key={label} className={`stat-card ${cls}`}>
            <div className="stat-label">{symbol} {label}</div>
            <div className="stat-value">{value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⬡</div>
        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>
          Inventory &amp; Order Management
        </p>
        <p style={{ fontSize: 13 }}>
          Navigate using the sidebar to manage products, customers, and orders.
        </p>
      </div>
    </div>
  );
}
