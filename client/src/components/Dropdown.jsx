import { useState, useRef, useEffect } from 'react';

export default function Dropdown({ trigger, children, align = 'right', width = '240px' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const alignmentStyle = align === 'right' ? { right: 0 } : { left: 0 };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <div onClick={() => setOpen(!open)} style={{ cursor: 'pointer' }}>
        {trigger(open)}
      </div>
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          ...alignmentStyle,
          width,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
          overflow: 'hidden',
          animation: 'dropdownIn 0.2s ease'
        }}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
