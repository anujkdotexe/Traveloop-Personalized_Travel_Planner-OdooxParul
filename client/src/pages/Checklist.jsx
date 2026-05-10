import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/Toast';

const CheckIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>;
const PlusIcon = () => <svg className="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrashIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const RefreshIcon = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const PrintIcon = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;

export default function Checklist() {
  const { id: tripId } = useParams();
  const { token } = useAuth();
  const { showToast, toasts, dismissToast } = useToast();
  
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [groupBy, setGroupBy] = useState('Category');
  const [filterBy, setFilterBy] = useState('All');
  const [sortBy, setSortBy] = useState('Default');
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const res = await fetch(`/api/trips/${tripId}/checklist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setItems(data.data || []);
    } catch (err) {
      showToast('Failed to load checklist.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [tripId]);

  const toggle = async (id) => {
    try {
      const res = await fetch(`/api/trips/checklist/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchItems();
    } catch (err) {
      showToast('Action failed.', 'error');
    }
  };

  const addItem = async (cat) => {
    if (!newItem.trim()) return;
    try {
      const res = await fetch(`/api/trips/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ trip_id: tripId, item_name: newItem.trim(), category: cat })
      });
      if (res.ok) { fetchItems(); setNewItem(''); }
    } catch (err) {
      showToast('Failed to add item.', 'error');
    }
  };

  const removeItem = async (id) => {
    try {
      await fetch(`/api/trips/checklist/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchItems();
    } catch (err) {
      showToast('Delete failed.', 'error');
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = items.filter(i => i.item_name.toLowerCase().includes(search.toLowerCase()));
    
    if (filterBy === 'Packed') result = result.filter(i => i.is_packed);
    if (filterBy === 'Unpacked') result = result.filter(i => !i.is_packed);
    
    if (sortBy === 'A – Z') result.sort((a, b) => a.item_name.localeCompare(b.item_name));
    if (sortBy === 'Packed First') result.sort((a, b) => (a.is_packed === b.is_packed ? 0 : a.is_packed ? -1 : 1));
    
    return result;
  }, [items, search, filterBy, sortBy]);

  const grouped = useMemo(() => {
    if (groupBy === 'None') return { 'All Items': filteredAndSorted };
    if (groupBy === 'Status') return {
      'Packed': filteredAndSorted.filter(i => i.is_packed),
      'To Pack': filteredAndSorted.filter(i => !i.is_packed)
    };
    
    // Group by Category (Default)
    return filteredAndSorted.reduce((acc, item) => {
      const cat = item.category || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
  }, [filteredAndSorted, groupBy]);

  const packed = items.filter(i => i.is_packed).length;
  const progress = items.length ? Math.round((packed / items.length) * 100) : 0;

  if (loading) return <div className="loading-center">Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="flex justify-between items-center mb-lg no-print">
          <div><h1>Packing Checklist</h1><p>Stay organized for your journey.</p></div>
          <div className="flex gap-sm">
            <button className="btn btn-outline" onClick={() => window.print()}><PrintIcon /> Download PDF</button>

          </div>
        </div>

        <div className="toolbar no-print">
          <div className="toolbar-search-wrap">
            <div className="input-icon-wrap">
              <span className="input-icon"><svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
              <input className="input-field" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <select className="input-field" style={{ width: 'auto' }} value={groupBy} onChange={e => setGroupBy(e.target.value)}>
            <option value="Category">Group by: Category</option>
            <option value="Status">Group by: Status</option>
            <option value="None">Group by: None</option>
          </select>
          <select className="input-field" style={{ width: 'auto' }} value={filterBy} onChange={e => setFilterBy(e.target.value)}>
            <option value="All">Filter: All</option>
            <option value="Packed">Filter: Packed</option>
            <option value="Unpacked">Filter: Unpacked</option>
          </select>
          <select className="input-field" style={{ width: 'auto' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="Default">Sort: Default</option>
            <option value="A – Z">Sort: A – Z</option>
            <option value="Packed First">Sort: Packed First</option>
          </select>
        </div>

        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
            <h4>Overall Progress</h4>
            <span style={{ fontWeight: 700, color: progress === 100 ? 'var(--success)' : 'var(--secondary)', fontSize: '1.1rem' }}>{progress}%</span>
          </div>
          <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>{packed} of {items.length} items packed</p>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
          {Object.entries(grouped).map(([cat, its]) => (
            <div key={cat} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="flex justify-between items-center" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface-alt)' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>{cat}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{its.length} items</span>
              </div>
              {its.map(item => (
                <div key={item.id} className="check-item">
                  <div className={`checkbox-custom${item.is_packed ? ' checked' : ''}`} onClick={() => toggle(item.id)}>
                    {item.is_packed && <CheckIcon />}
                  </div>
                  <span style={{ flex: 1, textDecoration: item.is_packed ? 'line-through' : 'none', color: item.is_packed ? 'var(--text-muted)' : 'var(--text-main)', fontSize: '0.92rem' }}>{item.item_name}</span>
                  <button className="btn btn-ghost btn-icon-sm no-print" onClick={() => removeItem(item.id)} style={{ color: 'var(--border)' }}><TrashIcon /></button>
                </div>
              ))}
              {groupBy === 'Category' && (
                <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }} className="no-print">
                  <input className="input-field" style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }} placeholder={`Add to ${cat}...`} value={activeCategory === cat ? newItem : ''} onFocus={() => setActiveCategory(cat)} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem(cat)} />
                  <button className="btn btn-primary btn-sm" onClick={() => addItem(cat)}><PlusIcon /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
