import { useState } from 'react';
import Navbar from '../components/Navbar';

const PlusIcon = () => <svg className="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrashIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const ClockIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const PinIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const FileIcon = () => <svg className="icon icon-xl" viewBox="0 0 24 24" style={{ color: 'var(--border)' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;

const NOTES = [
  { id: 1, title: 'Hotel Check-in Details', stop: 'Paris', content: 'Hotel Ritz Paris, 15 Place Vendome.\nCheck-in from 3:00 PM.\nReservation: TRV-8829\nLocal Contact: +33 1 43 16 30 30', timestamp: '12 Jun, 10:30 AM' },
  { id: 2, title: 'Must-try Croissants', stop: 'General', content: 'Boulangerie Poilane on Rue du Cherche-Midi. Open from 7 AM.', timestamp: '12 Jun, 2:15 PM' },
  { id: 3, title: 'London Tube Tips', stop: 'London', content: 'Get an Oyster card from any station. Zone 1-2 covers all central London.', timestamp: '18 Jun, 9:00 AM' },
];

export default function Notes() {
  const [notes, setNotes] = useState(NOTES);
  const [active, setActive] = useState(NOTES[0]);
  const [isNew, setIsNew] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', stop: 'General', content: '' });
  const [search, setSearch] = useState('');

  const saveNew = () => {
    if (!newNote.title.trim()) return;
    const n = { ...newNote, id: Date.now(), timestamp: new Date().toLocaleString() };
    setNotes(prev => [n, ...prev]);
    setActive(n);
    setIsNew(false);
    setNewNote({ title: '', stop: 'General', content: '' });
  };

  const deleteNote = (id) => {
    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    setActive(remaining[0] || null);
  };

  const filtered = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Navbar />
      {/* Standard toolbar — wireframe Screen 13 */}
      <div style={{ padding: '1rem 5%', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="toolbar" style={{ marginBottom: 0 }}>
          <div className="toolbar-search-wrap">
            <div className="input-icon-wrap">
              <span className="input-icon"><svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
              <input className="input-field" placeholder="Search trip notes..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <select className="input-field" style={{ width: 'auto', minWidth: 130 }}><option>Group by: All</option><option>Group by: Stop</option><option>Group by: Day</option></select>
          <select className="input-field" style={{ width: 'auto', minWidth: 100 }}><option>Filter: All</option><option>Filter: Paris</option><option>Filter: London</option></select>
          <select className="input-field" style={{ width: 'auto', minWidth: 120 }}><option>Sort: Newest</option><option>Sort: Oldest</option><option>Sort: A – Z</option></select>
          <button className="btn btn-primary btn-sm" onClick={() => setIsNew(true)}><PlusIcon /> Add Note</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: 'calc(100vh - 120px)' }}>
        <aside style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', padding: 'var(--space-lg)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="flex justify-between items-center">
            <h3 style={{ fontSize: '1rem' }}>Trip Journal</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setIsNew(true)}><PlusIcon /> New</button>
          </div>
          <input className="input-field" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} style={{ fontSize: '0.85rem' }} />
          <div className="tabs" style={{ marginBottom: 0 }}>
            {['All', 'By Day', 'By Stop'].map(t => <button key={t} className={`tab-btn${t === 'All' ? ' active' : ''}`} style={{ flex: 1, justifyContent: 'center' }}>{t}</button>)}
          </div>
          {filtered.map(note => (
            <button key={note.id} onClick={() => { setActive(note); setIsNew(false); }} style={{ width: '100%', textAlign: 'left', background: active?.id === note.id ? 'var(--bg-surface-alt)' : 'transparent', border: `1.5px solid ${active?.id === note.id ? 'var(--primary)' : 'transparent'}`, borderRadius: 'var(--radius-md)', padding: '1rem', cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ fontWeight: 600, marginBottom: 4, fontSize: '0.9rem' }}>{note.title}</div>
              <div className="flex items-center gap-xs" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <PinIcon /> {note.stop} <span style={{ margin: '0 4px' }}>&bull;</span> <ClockIcon /> {note.timestamp}
              </div>
            </button>
          ))}
        </aside>
        <main style={{ background: 'white', padding: 'var(--space-xl)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {isNew ? (
            <div style={{ maxWidth: 700 }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                <h3>New Note</h3>
                <div className="flex gap-sm">
                  <button className="btn btn-outline" onClick={() => setIsNew(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={saveNew}>Save Note</button>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Title</label>
                <input className="input-field" style={{ fontSize: '1.3rem', fontWeight: 700 }} placeholder="Note title..." value={newNote.title} onChange={e => setNewNote(n => ({ ...n, title: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Linked Stop</label>
                <select className="input-field" value={newNote.stop} onChange={e => setNewNote(n => ({ ...n, stop: e.target.value }))}>
                  <option>General</option><option>Paris</option><option>London</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Content</label>
                <textarea className="input-field" rows={12} style={{ resize: 'none', lineHeight: 1.8 }} placeholder="Write your note here..." value={newNote.content} onChange={e => setNewNote(n => ({ ...n, content: e.target.value }))} />
              </div>
            </div>
          ) : active ? (
            <div style={{ maxWidth: 700 }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', marginBottom: 6 }}>{active.title}</h2>
                  <div className="flex items-center gap-sm" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span>Stop: <strong style={{ color: 'var(--primary)' }}>{active.stop}</strong></span>
                    <span>&bull;</span><ClockIcon /> {active.timestamp}
                  </div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => deleteNote(active.id)}><TrashIcon /> Delete</button>
              </div>
              <textarea className="input-field" style={{ width: '100%', minHeight: 400, border: 'none', padding: 0, fontSize: '1.05rem', lineHeight: 1.9, resize: 'none', outline: 'none', color: 'var(--text-main)' }}
                value={active.content}
                onChange={e => { setActive(a => ({ ...a, content: e.target.value })); setNotes(prev => prev.map(n => n.id === active.id ? { ...n, content: e.target.value } : n)); }}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
              <FileIcon />
              <p>Select a note or create a new one</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
