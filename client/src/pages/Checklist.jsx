import { useState } from 'react';
import Navbar from '../components/Navbar';

const CheckIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>;
const PlusIcon = () => <svg className="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrashIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const RefreshIcon = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const PrintIcon = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;

const INIT = {
  Documents: [
    { id: 1, name: 'Passport and Visa', packed: true },
    { id: 2, name: 'Travel Insurance PDF', packed: false },
    { id: 3, name: 'Flight Booking Confirmation', packed: true },
  ],
  Clothing: [
    { id: 4, name: 'Summer T-shirts (5 pieces)', packed: true },
    { id: 5, name: 'Lightweight Jacket', packed: false },
    { id: 6, name: 'Comfortable Walking Shoes', packed: false },
  ],
  Electronics: [
    { id: 7, name: 'Phone Charger', packed: false },
    { id: 8, name: 'Universal Power Adapter', packed: true },
    { id: 9, name: 'Earphones', packed: false },
  ],
};

export default function Checklist() {
  const [items, setItems] = useState(INIT);
  const [newItem, setNewItem] = useState('');
  const [activeCategory, setActiveCategory] = useState('Documents');
  const [search, setSearch] = useState('');
  const allItems = Object.values(items).flat();
  const packed = allItems.filter(i => i.packed).length;
  const progress = Math.round((packed / allItems.length) * 100);

  const toggle = (cat, id) => setItems(p => ({ ...p, [cat]: p[cat].map(i => i.id === id ? { ...i, packed: !i.packed } : i) }));
  const addItem = (cat) => { if (!newItem.trim()) return; setItems(p => ({ ...p, [cat]: [...p[cat], { id: Date.now(), name: newItem.trim(), packed: false }] })); setNewItem(''); };
  const removeItem = (cat, id) => setItems(p => ({ ...p, [cat]: p[cat].filter(i => i.id !== id) }));
  const resetAll = () => setItems(p => Object.fromEntries(Object.entries(p).map(([c, is]) => [c, is.map(i => ({ ...i, packed: false }))])));

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="flex justify-between items-center mb-lg">
          <div><h1>Packing Checklist</h1><p>Summer in Europe &mdash; Stay organized for your journey.</p></div>
          <div className="flex gap-sm">
            <button className="btn btn-outline" onClick={resetAll}><RefreshIcon /> Reset</button>
            <button className="btn btn-outline"><PrintIcon /> Print</button>
          </div>
        </div>
        <div style={{ marginBottom: 'var(--space-lg)', maxWidth: 400 }}>
          <input className="input-field" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
            <h4>Overall Progress</h4>
            <span style={{ fontWeight: 700, color: progress === 100 ? 'var(--success)' : 'var(--secondary)', fontSize: '1.1rem' }}>{progress}%</span>
          </div>
          <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>{packed} of {allItems.length} items packed</p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
          {Object.entries(items).map(([cat, its]) => {
            const visible = its.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
            const catPacked = its.filter(i => i.packed).length;
            return (
              <div key={cat} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="flex justify-between items-center" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface-alt)' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>{cat}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{catPacked}/{its.length} packed</span>
                </div>
                {visible.map(item => (
                  <div key={item.id} className="check-item">
                    <div className={`checkbox-custom${item.packed ? ' checked' : ''}`} onClick={() => toggle(cat, item.id)}>
                      {item.packed && <CheckIcon />}
                    </div>
                    <span style={{ flex: 1, textDecoration: item.packed ? 'line-through' : 'none', color: item.packed ? 'var(--text-muted)' : 'var(--text-main)', fontSize: '0.92rem' }}>{item.name}</span>
                    <button className="btn btn-ghost btn-icon-sm" onClick={() => removeItem(cat, item.id)} style={{ color: 'var(--border)' }}><TrashIcon /></button>
                  </div>
                ))}
                <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                  <input className="input-field" style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }} placeholder={`Add ${cat.toLowerCase()} item...`} value={activeCategory === cat ? newItem : ''} onFocus={() => setActiveCategory(cat)} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem(cat)} />
                  <button className="btn btn-primary btn-sm" onClick={() => addItem(cat)}><PlusIcon /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
