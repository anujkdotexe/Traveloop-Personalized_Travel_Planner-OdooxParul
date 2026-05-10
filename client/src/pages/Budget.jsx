import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Chart from 'chart.js/auto';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/Toast';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';

/* ── Icons ─────────────────────────────────────────────────────────────────── */
const ChevronLeftIcon = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>;
const DownloadIcon    = () => <svg className="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const WalletIcon      = () => <svg className="icon" viewBox="0 0 24 24"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>;
const AlertIcon       = () => <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const TrendIcon       = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>;

const COLORS = ['#6366f1','#14b8a6','#f43f5e','#f59e0b','#8b5cf6','#10b981'];


export default function Budget() {
  const { id: tripId } = useParams();
  const { token } = useAuth();
  const { showToast, toasts, dismissToast } = useToast();
  
  const [data, setData] = useState(null);
  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const doughnutRef = useRef(null);
  const barRef = useRef(null);
  const chartsRef = useRef({ doughnut: null, bar: null });

  const fetchData = async () => {
    try {
      const [bRes, tRes] = await Promise.all([
        fetch(`/api/trips/${tripId}/budget`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/trips/${tripId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const bData = await bRes.json();
      const tData = await tRes.json();
      if (bRes.ok && tRes.ok) {
        setData(bData.data);
        setTrip(tData.data.trip);
        setStops(tData.data.stops);
      }
    } catch (err) {
      showToast('Failed to load budget data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchData(); }, [tripId, token]);

  const country = useMemo(() => stops[0]?.country || 'India', [stops]);
  const format = (n) => formatCurrency(n, country);
  const currency = useMemo(() => getCurrencySymbol(country), [country]);

  useEffect(() => {
    if (!data || !doughnutRef.current || !barRef.current) return;

    if (chartsRef.current.doughnut) chartsRef.current.doughnut.destroy();
    if (chartsRef.current.bar) chartsRef.current.bar.destroy();

    chartsRef.current.doughnut = new Chart(doughnutRef.current, {
      type: 'doughnut',
      data: { 
        labels: data.breakdown.map(e => e.category), 
        datasets: [{ data: data.breakdown.map(e => e.total), backgroundColor: COLORS, borderWidth: 0, hoverOffset: 12 }] 
      },
      options: { plugins: { legend: { display: false } }, cutout: '72%', responsive: true },
    });

    chartsRef.current.bar = new Chart(barRef.current, {
      type: 'bar',
      data: { 
        labels: ['Planned', 'Actual'], 
        datasets: [{ 
          label: `Cost (${currency})`, 
          data: [data.activity_cost, data.grand_total], 
          backgroundColor: ['#6366f1', '#14b8a6'], 
          borderRadius: 8 
        }] 
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } }, responsive: true, maintainAspectRatio: false },
    });
  }, [data, currency]);

  const total = Number(data?.grand_total || 0);
  const budgetLimit = 100000; // Mock budget limit
  const over = total > budgetLimit;
  const breakdown = data?.breakdown || [];
  const expenses = data?.expenses || [];
  const activityCost = Number(data?.activity_cost || 0);

  if (loading) return <div className="loading-center">Loading Budget...</div>;

  if (!data) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <div className="card text-center" style={{ padding: '3rem' }}>
            <h3 style={{ marginBottom: 8 }}>Budget data is unavailable</h3>
            <p>We could not load the budget breakdown for this trip.</p>
          </div>
        </div>
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="flex items-center gap-md" style={{ marginBottom: 'var(--space-lg)' }}>
          <Link to="/trips" className="btn btn-ghost btn-icon"><ChevronLeftIcon /></Link>
          <div><h1>Budget Insights</h1><p>{trip?.title} &mdash; Financial Breakdown</p></div>
          <div style={{ marginLeft: 'auto' }}><Link to={`/invoice/${tripId}`} className="btn btn-outline"><DownloadIcon /> View Invoice</Link></div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1.5rem', marginBottom: 'var(--space-xl)' }}>
          {[
            { label: 'Total Actual', value: format(total), icon: WalletIcon, color: 'var(--primary)' },
            { label: 'Budget Status', value: over ? `${format(total-budgetLimit)} Over` : `${format(budgetLimit-total)} Under`, icon: AlertIcon, color: over ? 'var(--accent)' : 'var(--success)' },
            { label: 'Planned Estimate', value: format(activityCost), icon: TrendIcon, color: 'var(--secondary)' },
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
            <h3 style={{ marginBottom: '1.5rem' }}>Expense Categories</h3>
            <div style={{ maxWidth: 260, margin: '0 auto 1.5rem' }}><canvas ref={doughnutRef} /></div>
            {breakdown.map((e, i) => (
              <div key={e.category} className="flex justify-between items-center" style={{ marginBottom: '0.6rem' }}>
                <span className="flex items-center gap-sm"><span style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], display: 'inline-block' }} />{e.category}</span>
                <strong>{format(e.total)}</strong>
              </div>
            ))}
            {breakdown.length === 0 && <p className="text-center text-muted">No expenses recorded yet.</p>}
          </div>

          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.25rem' }}>Planned vs Actual</h3>
              <div style={{ height: 200 }}><canvas ref={barRef} /></div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--bg-surface-alt)' }}>
                  <tr>{['Date','Category','Amount'].map(h => <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem' }}>{new Date(e.date).toLocaleDateString()}</td>
                      <td style={{ padding: '0.9rem 1rem', fontWeight: 600, fontSize: '0.85rem' }}>{e.category}</td>
                      <td style={{ padding: '0.9rem 1rem', fontWeight: 700 }}>{format(e.amount)}</td>
                    </tr>
                  ))}
                  {expenses.length === 0 && <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

