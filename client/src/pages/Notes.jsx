import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/Toast';

const PlusIcon = () => <svg className="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrashIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const ClockIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const PinIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const FileIcon = () => <svg className="icon icon-xl" viewBox="0 0 24 24" style={{ color: 'var(--border)' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;

export default function Notes() {
  const { id: tripId } = useParams();
  const { token } = useAuth();
  const { showToast, toasts, dismissToast } = useToast();
  
  const [notes, setNotes] = useState([]);
  const [active, setActive] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [newNote, setNewNote] = useState({ content: '' });
  const [editingNote, setEditingNote] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/trips/${tripId}/notes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setNotes(data.data || []);
        if (data.data?.length && !active) setActive(data.data[0]);
      }
    } catch (err) {
      showToast('Failed to load notes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, [tripId]);

  const saveNew = async () => {
    if (!newNote.content.trim()) return;
    try {
      const res = await fetch(`/api/trips/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ trip_id: tripId, content: newNote.content })
      });
      if (res.ok) {
        const data = await res.json();
        showToast('Note saved!', 'success');
        fetchNotes();
        setIsNew(false);
        setNewNote({ content: '' });
      }
    } catch (err) {
      showToast('Failed to save note.', 'error');
    }
  };

  const deleteNote = async (id) => {
    try {
      const res = await fetch(`/api/trips/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Note removed.', 'info');
        setNotes(prev => prev.filter(n => n.id !== id));
        setActive(null);
      }
    } catch (err) {
      showToast('Delete failed.', 'error');
    }
  };

  const saveEdit = async () => {
    if (!editContent.trim() || !editingNote) return;
    try {
      const res = await fetch(`/api/trips/notes/${editingNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: editContent })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Note updated!', 'success');
        setNotes(prev => prev.map(n => n.id === editingNote.id ? data.data : n));
        setActive(data.data);
        setEditingNote(null);
        setEditContent('');
      } else {
        showToast(data.message || 'Failed to update note.', 'error');
      }
    } catch (err) {
      showToast('Failed to update note.', 'error');
    }
  };

  const filtered = notes.filter(n => n.content.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="loading-center">Loading...</div>;

  return (
    <>
      <Navbar />
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: 'calc(100vh - 64px)' }}>
        <aside style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', padding: 'var(--space-lg)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="flex justify-between items-center">
            <h3 style={{ fontSize: '1rem' }}>Trip Journal</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setIsNew(true)}><PlusIcon /> New</button>
          </div>
          <input className="input-field" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} style={{ fontSize: '0.85rem' }} />
          
          {filtered.map(note => (
            <button key={note.id} onClick={() => { setActive(note); setIsNew(false); }} style={{ width: '100%', textAlign: 'left', background: active?.id === note.id ? 'var(--bg-surface-alt)' : 'transparent', border: `1.5px solid ${active?.id === note.id ? 'var(--primary)' : 'transparent'}`, borderRadius: 'var(--radius-md)', padding: '1rem', cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ fontWeight: 600, marginBottom: 4, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {note.content.split('\n')[0] || 'Untitled Note'}
              </div>
              <div className="flex items-center gap-xs" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <ClockIcon /> {new Date(note.created_at).toLocaleDateString()}
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
                <textarea className="input-field" rows={15} style={{ resize: 'none', lineHeight: 1.8, fontSize: '1.1rem' }} placeholder="Write your note here..." value={newNote.content} onChange={e => setNewNote(n => ({ ...n, content: e.target.value }))} />
              </div>
            </div>
          ) : active ? (
            <div style={{ maxWidth: 700 }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <div className="flex items-center gap-sm" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <ClockIcon /> {new Date(active.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-sm">
                  <button className="btn btn-outline btn-sm" onClick={() => { setEditingNote(active); setEditContent(active.content); }}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteNote(active.id)}><TrashIcon /> Delete</button>
                </div>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--text-main)' }}>
                {active.content}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
              <FileIcon />
              <p>Select a note or create a new one</p>
            </div>
          )}
        </main>
      </div>

      <Modal isOpen={!!editingNote} onClose={() => { setEditingNote(null); setEditContent(''); }} title="Edit Note" maxWidth="760px">
        <div className="input-group">
          <textarea className="input-field" rows={12} style={{ resize: 'none', lineHeight: 1.8, fontSize: '1rem' }} value={editContent} onChange={e => setEditContent(e.target.value)} />
        </div>
        <div className="flex justify-end gap-sm">
          <button className="btn btn-outline" onClick={() => { setEditingNote(null); setEditContent(''); }}>Cancel</button>
          <button className="btn btn-primary" onClick={saveEdit}>Save Changes</button>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
