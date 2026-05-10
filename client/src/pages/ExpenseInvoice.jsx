import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useToast, ToastContainer } from '../components/Toast';

/* ── Icons ─────────────────────────────────────────────────────────────────── */
const ChevronLeftIcon = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>;
const DownloadIcon    = () => <svg className="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const MailIcon        = () => <svg className="icon" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const CheckCircleIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const AlertIcon       = () => <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const DollarIcon      = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const FileTextIcon    = () => <svg className="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const PlaneIcon       = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 5.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>;
const HotelIcon       = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const FoodIcon        = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
const ActivityIcon    = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;

const INVOICE_ITEMS = [
  { id: 1, category: 'Hotel',     icon: <HotelIcon />,    description: 'Hotel booking Paris, 6 nights', qty_unit: '6 nights', unit_cost: 9000, amount: 54000 },
  { id: 2, category: 'Travel',    icon: <PlaneIcon />,    description: 'Flight bookings (DXB — PAR)', qty_unit: '2 people',  unit_cost: 12500, amount: 25000 },
  { id: 3, category: 'Food',      icon: <FoodIcon />,     description: 'Meals — Paris & London',      qty_unit: '14 days',  unit_cost: 1800, amount: 25200 },
  { id: 4, category: 'Activity',  icon: <ActivityIcon />, description: 'Guided tours & experiences',  qty_unit: '5 tours',  unit_cost: 3800, amount: 19000 },
  { id: 5, category: 'Hotel',     icon: <HotelIcon />,    description: 'Hotel booking London, 7 nights', qty_unit: '7 nights', unit_cost: 8200, amount: 57400 },
  { id: 6, category: 'Travel',    icon: <PlaneIcon />,    description: 'Train PAR — LON (Eurostar)',  qty_unit: '2 tickets', unit_cost: 4500, amount: 9000 },
];

const CATEGORY_COLORS = { Hotel: 'var(--primary)', Travel: 'var(--secondary)', Food: '#f59e0b', Activity: '#8b5cf6' };

function formatINR(n) { return `INR ${n.toLocaleString('en-IN')}`; }

export default function ExpenseInvoice() {
  const { id } = useParams();
  const [status, setStatus] = useState('pending');
  const { toasts, showToast, dismissToast } = useToast();

  const subtotal  = INVOICE_ITEMS.reduce((s, i) => s + i.amount, 0);
  const tax       = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + tax;
  const TOTAL_BUDGET = 220000;
  const remaining = TOTAL_BUDGET - grandTotal;

  const handleMarkPaid = () => { setStatus('paid'); showToast('Invoice marked as paid.', 'success'); };
  const handleDownload = () => showToast('Invoice downloaded as PDF.', 'success');
  const handleSendMail = () => showToast('Invoice sent to your email.', 'success');

  return (
    <>
      <Navbar />
      <div className="page-container">
        {/* ── Page header ──────────────────────────── */}
        <div className="flex items-center gap-sm mb-lg">
          <Link to={`/budget/${id || '1'}`} className="btn btn-ghost btn-icon"><ChevronLeftIcon /></Link>
          <div style={{ flex: 1 }}>
            <h1>Expense Invoice</h1>
            <p>Full billing breakdown for your trip.</p>
          </div>
          <div className="flex gap-sm">
            <button className="btn btn-outline" onClick={handleDownload}><DownloadIcon /> Download Invoice</button>
            <button className="btn btn-outline" onClick={handleSendMail}><MailIcon /> Send as Email</button>
            {status !== 'paid' && <button className="btn btn-primary" onClick={handleMarkPaid}><CheckCircleIcon /> Mark as Paid</button>}
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 340px', gap: 'var(--space-lg)', alignItems: 'start' }}>
          {/* ── Left — Invoice document ───────────── */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Invoice header */}
            <div style={{ padding: '2rem 2.5rem', background: 'linear-gradient(135deg,var(--primary) 0%,#8b5cf6 100%)', color: '#fff' }}>
              <div className="flex justify-between items-start">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileTextIcon /></div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Traveloop</div>
                      <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>Travel Planning Platform</div>
                    </div>
                  </div>
                  <h2 style={{ color: '#fff', marginBottom: 4 }}>Trip Invoice</h2>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem' }}>Summer in Europe Adventure</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: 4 }}>INV-2024-0018</div>
                  <div style={{ fontSize: '0.82rem', opacity: 0.8, marginBottom: 4 }}>Issued Date: Jun 1, 2024</div>
                  <div style={{ fontSize: '0.82rem', opacity: 0.8, marginBottom: 12 }}>Due Date: Jun 10, 2024</div>
                  <span style={{ padding: '4px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 800, background: status === 'paid' ? '#10b981' : 'rgba(255,255,255,0.25)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)' }}>
                    {status === 'paid' ? 'PAID' : 'PAYMENT PENDING'}
                  </span>
                </div>
              </div>

              {/* Travel Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                {[
                  { label: 'Route', value: 'Dubai — Paris — London' },
                  { label: 'Duration', value: 'Jun 12 – Jun 25, 2024' },
                  { label: 'Travellers', value: '2 Adults' },
                ].map(d => (
                  <div key={d.label}>
                    <div style={{ fontSize: '0.72rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{d.label}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{d.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Line items */}
            <div style={{ overflowX: 'auto' }}>
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Qty / Unit</th>
                    <th style={{ textAlign: 'right' }}>Unit Cost</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {INVOICE_ITEMS.map((item, i) => (
                    <tr key={item.id}>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{i + 1}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: `${CATEGORY_COLORS[item.category]}18`, color: CATEGORY_COLORS[item.category], borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.78rem' }}>
                          {item.icon} {item.category}
                        </span>
                      </td>
                      <td>{item.description}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{item.qty_unit}</td>
                      <td style={{ textAlign: 'right' }}>{formatINR(item.unit_cost)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatINR(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 320 }}>
                {[
                  { label: 'Subtotal', value: formatINR(subtotal) },
                  { label: 'GST (5%)',  value: formatINR(tax), muted: true },
                ].map(row => (
                  <div key={row.label} className="flex justify-between" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                    <span style={{ color: row.muted ? 'var(--text-muted)' : 'var(--text-main)' }}>{row.label}</span>
                    <span style={{ fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between" style={{ padding: '1rem 0 0', marginTop: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem' }}>Grand Total</span>
                  <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--primary)' }}>{formatINR(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right — Budget summary panel ──────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Budget Overview */}
            <div className="card">
              <div className="flex items-center gap-sm" style={{ marginBottom: '1.25rem' }}>
                <DollarIcon />
                <h4>Budget Summary</h4>
              </div>
              {[
                { label: 'Total Budget',   value: formatINR(TOTAL_BUDGET), color: 'var(--text-main)' },
                { label: 'Total Expenses', value: formatINR(grandTotal),   color: 'var(--primary)' },
                { label: 'Remaining',      value: formatINR(remaining),    color: remaining >= 0 ? 'var(--secondary)' : 'var(--accent)' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center" style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{row.label}</span>
                  <span style={{ fontWeight: 800, color: row.color }}>{row.value}</span>
                </div>
              ))}

              {/* Budget progress */}
              <div style={{ marginTop: '1.25rem' }}>
                <div className="flex justify-between" style={{ marginBottom: 6, fontSize: '0.78rem' }}>
                  <span style={{ fontWeight: 600 }}>Budget Used</span>
                  <span style={{ fontWeight: 700, color: grandTotal > TOTAL_BUDGET ? 'var(--accent)' : 'var(--secondary)' }}>
                    {Math.min(100, Math.round((grandTotal / TOTAL_BUDGET) * 100))}%
                  </span>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${Math.min(100, (grandTotal / TOTAL_BUDGET) * 100)}%`, background: grandTotal > TOTAL_BUDGET ? 'var(--accent)' : 'var(--secondary)' }} />
                </div>
                {grandTotal > TOTAL_BUDGET && (
                  <div className="flex items-center gap-xs" style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>
                    <AlertIcon /> Over budget by {formatINR(grandTotal - TOTAL_BUDGET)}
                  </div>
                )}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="card">
              <h4 style={{ marginBottom: '1.25rem' }}>By Category</h4>
              {Object.entries(
                INVOICE_ITEMS.reduce((acc, item) => {
                  acc[item.category] = (acc[item.category] || 0) + item.amount;
                  return acc;
                }, {})
              ).sort((a, b) => b[1] - a[1]).map(([cat, total]) => (
                <div key={cat} style={{ marginBottom: '1rem' }}>
                  <div className="flex justify-between" style={{ marginBottom: 5 }}>
                    <span style={{ fontSize: '0.83rem', fontWeight: 700, color: CATEGORY_COLORS[cat] }}>{cat}</span>
                    <span style={{ fontSize: '0.83rem', fontWeight: 700 }}>{formatINR(total)}</span>
                  </div>
                  <div className="progress-bar-track" style={{ height: 6 }}>
                    <div style={{ width: `${(total / subtotal) * 100}%`, height: '100%', background: CATEGORY_COLORS[cat], borderRadius: 9999, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Payment status */}
            <div className="card" style={{ borderLeft: `4px solid ${status === 'paid' ? 'var(--secondary)' : 'var(--warning)'}` }}>
              <div className="flex items-center gap-sm">
                {status === 'paid' ? <span style={{ color: 'var(--secondary)' }}><CheckCircleIcon /></span> : <span style={{ color: 'var(--warning)' }}><AlertIcon /></span>}
                <div>
                  <div style={{ fontWeight: 700 }}>{status === 'paid' ? 'Payment Complete' : 'Payment Pending'}</div>
                  <p style={{ fontSize: '0.8rem', marginTop: 2 }}>{status === 'paid' ? 'Invoice fully settled.' : 'Mark as paid once payment is done.'}</p>
                </div>
              </div>
              {status !== 'paid' && (
                <button className="btn btn-primary w-full" style={{ marginTop: '1rem' }} onClick={handleMarkPaid}>Mark as Paid</button>
              )}
            </div>

            <div className="flex gap-sm">
              <button className="btn btn-outline flex-1" onClick={handleDownload}><DownloadIcon /> Download</button>
              <button className="btn btn-outline flex-1" onClick={handleSendMail}><MailIcon /> Email</button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
