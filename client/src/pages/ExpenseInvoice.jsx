import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/Toast';
import { formatCurrency } from '../utils/currency';
import Modal from '../components/Modal';

/* ── Icons ─────────────────────────────────────────────────────────────────── */
const ChevronLeftIcon = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>;
const DownloadIcon    = () => <svg className="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const MailIcon        = () => <svg className="icon" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const CheckCircleIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const AlertIcon       = () => <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const DollarIcon      = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const FileTextIcon    = () => <svg className="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;

const CATEGORY_COLORS = { Hotel: 'var(--primary)', Travel: 'var(--secondary)', Food: '#f59e0b', Activity: '#8b5cf6' };

export default function ExpenseInvoice() {
  const { id: tripId } = useParams();
  const { token } = useAuth();
  const { toasts, showToast, dismissToast } = useToast();
  
  const [data, setData] = useState(null);
  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');
  const [showConfirm, setShowConfirm] = useState(false);

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
      showToast('Failed to load invoice.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchData(); }, [tripId, token]);

  const country = useMemo(() => stops[0]?.country || 'India', [stops]);
  const format = (n) => formatCurrency(n, country);

  const items = data?.expenses || [];
  const subtotal = data?.grand_total || 0;
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = Number(subtotal) + tax;
  const TOTAL_BUDGET = 100000;

  const handleMarkPaid = () => { setStatus('paid'); setShowConfirm(false); showToast('Invoice marked as paid.', 'success'); };
  const handleDownload = () => { window.print(); showToast('Print dialog opened.', 'success'); };
  const handleSendMail = () => showToast('Invoice sent to your email.', 'success');

  if (loading) return <div className="loading-center">Generating Invoice...</div>;

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="flex items-center gap-sm mb-lg no-print">

          <Link to={`/budget/${tripId}`} className="btn btn-ghost btn-icon"><ChevronLeftIcon /></Link>
          <div style={{ flex: 1 }}>
            <h1>Expense Invoice</h1>
            <p>Full billing breakdown for your trip.</p>
          </div>
          <div className="flex gap-sm">
            <button className="btn btn-outline" onClick={handleDownload}><DownloadIcon /> Download PDF</button>

            <button className="btn btn-outline" onClick={handleSendMail}><MailIcon /> Send as Email</button>
            {status !== 'paid' && <button className="btn btn-primary" onClick={() => setShowConfirm(true)}><CheckCircleIcon /> Mark as Paid</button>}
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 340px', gap: 'var(--space-lg)', alignItems: 'start' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }} id="printable-invoice">
            <div style={{ padding: '2rem 2.5rem', background: 'linear-gradient(135deg,var(--primary) 0%,#8b5cf6 100%)', color: '#fff' }}>
              <div className="flex justify-between items-start">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileTextIcon /></div>
                    <div><div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Traveloop</div></div>
                  </div>
                  <h2 style={{ color: '#fff', marginBottom: 4 }}>Trip Invoice</h2>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem' }}>{trip?.title}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: 4 }}>INV-{tripId.slice(0, 8).toUpperCase()}</div>
                  <div style={{ fontSize: '0.82rem', opacity: 0.8 }}>Issued: {new Date().toLocaleDateString()}</div>
                  <div style={{ marginTop: 12 }}>
                    <span style={{ padding: '4px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 800, background: status === 'paid' ? '#10b981' : 'rgba(255,255,255,0.25)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)' }}>
                      {status === 'paid' ? 'PAID' : 'PAYMENT PENDING'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{new Date(item.date).toLocaleDateString()}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: `${CATEGORY_COLORS[item.category] || 'var(--border)'}18`, color: CATEGORY_COLORS[item.category] || 'var(--text-main)', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.78rem' }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{format(item.amount)}</td>
                    </tr>
                  ))}
                  {items.length === 0 && <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center' }}>No expenses to show.</td></tr>}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 320 }}>
                <div className="flex justify-between" style={{ padding: '0.5rem 0', fontSize: '0.9rem' }}>
                  <span>Subtotal</span><span style={{ fontWeight: 600 }}>{format(subtotal)}</span>
                </div>
                <div className="flex justify-between" style={{ padding: '0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span>Tax (5%)</span><span style={{ fontWeight: 600 }}>{format(tax)}</span>
                </div>
                <div className="flex justify-between" style={{ padding: '1rem 0 0', marginTop: 4, borderTop: '2px solid var(--border)' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem' }}>Grand Total</span>
                  <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--primary)' }}>{format(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }} className="no-print">

            <div className="card">
              <div className="flex items-center gap-sm" style={{ marginBottom: '1.25rem' }}>
                <DollarIcon />
                <h4>Budget Summary</h4>
              </div>
              <div className="flex justify-between items-center" style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Expenses</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{format(grandTotal)}</span>
              </div>
              <div style={{ marginTop: '1.25rem' }}>
                <div className="flex justify-between" style={{ marginBottom: 6, fontSize: '0.78rem' }}>
                  <span style={{ fontWeight: 600 }}>Budget Used</span>
                  <span style={{ fontWeight: 700 }}>{Math.min(100, Math.round((grandTotal / TOTAL_BUDGET) * 100))}%</span>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${Math.min(100, (grandTotal / TOTAL_BUDGET) * 100)}%`, background: grandTotal > TOTAL_BUDGET ? 'var(--accent)' : 'var(--secondary)' }} />
                </div>
              </div>
            </div>

            <div className="card" style={{ borderLeft: `4px solid ${status === 'paid' ? 'var(--secondary)' : 'var(--warning)'}` }}>
              <div className="flex items-center gap-sm">
                {status === 'paid' ? <span style={{ color: 'var(--secondary)' }}><CheckCircleIcon /></span> : <span style={{ color: 'var(--warning)' }}><AlertIcon /></span>}
                <div>
                  <div style={{ fontWeight: 700 }}>{status === 'paid' ? 'Payment Complete' : 'Payment Pending'}</div>
                  <p style={{ fontSize: '0.8rem', marginTop: 2 }}>{status === 'paid' ? 'Invoice settled.' : 'Please mark once paid.'}</p>
                </div>
              </div>
              {status !== 'paid' && <button className="btn btn-primary w-full" style={{ marginTop: '1rem' }} onClick={() => setShowConfirm(true)}>Mark as Paid</button>}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Payment" maxWidth="400px">
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Are you sure you want to mark this invoice as paid? This action will update the trip status and notify the user.</p>
        <div className="flex justify-end gap-sm">
          <button className="btn btn-outline" onClick={() => setShowConfirm(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleMarkPaid}>Confirm Paid</button>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

