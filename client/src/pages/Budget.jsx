import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Chart from 'chart.js/auto';

const ChevronLeftIcon = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>;
const WalletIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M20 12V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M16 12h4v4h-4z"/></svg>;
const AlertIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const TrendIcon = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>;
const DownloadIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

const expenses = [
  { category: 'Hotel', description: 'Hotel Ritz Paris - 6 nights', qty: 6, unitCost: 200, amount: 1200 },
  { category: 'Travel', description: 'Flight bookings (CDG to LHR)', qty: 1, unitCost: 100, amount: 100 },
  { category: 'Dining', description: 'Daily meals estimate', qty: 14, unitCost: 60, amount: 840 },
  { category: 'Sightseeing', description: 'Museum entries and tours', qty: 1, unitCost: 180, amount: 180 },
  { category: 'Transport', description: 'Local metro and taxis', qty: 1, unitCost: 150, amount: 150 },
];
const total = expenses.reduce((s, e) => s + e.amount, 0);
const budget = 3000;
const COLORS = ['#6366f1', '#14b8a6', '#f43f5e', '#f59e0b', '#8b5cf6'];

export default function Budget() {
  const doughnutRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    const d = new Chart(doughnutRef.current, {
      type: 'doughnut',
      data: { labels: expenses.map(e => e.category), datasets: [{ data: expenses.map(e => e.amount), backgroundColor: COLORS, borderWidth: 0, hoverOffset: 12 }] },
      options: { plugins: { legend: { display: false } }, cutout: '72%', responsive: true },
    });
    const b = new Chart(barRef.current, {
      type: 'bar',
      data: { labels: ['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7'], datasets: [{ label: 'Daily Spend ($)', data: [1300,60,85,75,90,60,70], backgroundColor: '#6366f1', borderRadius: 8, hoverBackgroundColor: '#4f46e5' }] },
      options: { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { borderDash: [4,4] } } }, responsive: true, maintainAspectRatio: false },
    });
    return () => { d.destroy(); b.destroy(); };
  }, []);

  const over = total > budget;

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="flex items-center gap-md" style={{ marginBottom: 'var(--space-lg)' }}>
          <Link to="/trips" className="btn btn-ghost btn-icon"><ChevronLeftIcon /></Link>
          <div><h1>Budget Insights</h1><p>Summer in Europe &mdash; Cost Breakdown</p></div>
          <div style={{ marginLeft: 'auto' }}><button className="btn btn-outline"><DownloadIcon /> Export Invoice</button></div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1.5rem', marginBottom: 'var(--space-xl)' }}>
          {[
            { label: 'Total Estimated', value: `$${total.toLocaleString()}`, icon: WalletIcon, color: 'var(--primary)' },
            { label: 'Budget Status', value: over ? `$${(total-budget).toLocaleString()} Over` : `$${(budget-total).toLocaleString()} Under`, icon: AlertIcon, color: over ? 'var(--accent)' : 'var(--success)' },
            { label: 'Daily Average', value: `$${Math.round(total/14).toLocaleString()}`, icon: TrendIcon, color: 'var(--secondary)' },
          ].map(k => (
            <div key={k.label} className="card" style={{ borderLeft: `4px solid ${k.color}` }}>
              <div className="flex items-center gap-sm" style={{ marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                <k.icon /><span className="input-label" style={{ margin: 0 }}>{k.label}</span>
              </div>
              <h2 style={{ color: k.color }}>{k.value}</h2>
            </div>
          ))}
        </div>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1.6fr', gap: 'var(--space-lg)' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Category Distribution</h3>
            <div style={{ maxWidth: 260, margin: '0 auto 1.5rem' }}><canvas ref={doughnutRef} /></div>
            {expenses.map((e, i) => (
              <div key={e.category} className="flex justify-between items-center" style={{ marginBottom: '0.6rem' }}>
                <span className="flex items-center gap-sm"><span style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i], display: 'inline-block' }} />{e.category}</span>
                <strong>${e.amount.toLocaleString()}</strong>
              </div>
            ))}
          </div>
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.25rem' }}>Daily Spend Trend</h3>
              <div style={{ height: 200 }}><canvas ref={barRef} /></div>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--bg-surface-alt)' }}>
                  <tr>{['#','Category','Description','Qty','Unit Cost','Amount'].map(h => <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {expenses.map((e, i) => (
                    <tr key={e.category} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{i+1}</td>
                      <td style={{ padding: '0.9rem 1rem', fontWeight: 600, fontSize: '0.85rem' }}>{e.category}</td>
                      <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{e.description}</td>
                      <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem' }}>{e.qty}</td>
                      <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem' }}>${e.unitCost}</td>
                      <td style={{ padding: '0.9rem 1rem', fontWeight: 700 }}>${e.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr style={{ background: 'var(--bg-surface-alt)' }}>
                    <td colSpan={5} style={{ padding: '1rem', fontWeight: 700, textAlign: 'right' }}>Grand Total</td>
                    <td style={{ padding: '1rem', fontWeight: 800, fontSize: '1.05rem', color: over ? 'var(--accent)' : 'var(--text-main)' }}>${total.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
