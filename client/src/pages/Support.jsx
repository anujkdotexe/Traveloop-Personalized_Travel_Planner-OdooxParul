import Navbar from '../components/Navbar';

export default function Support() {
  return (
    <>
      <Navbar />
      <div className="page-container">
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-xl) 0' }}>
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
              <svg className="icon" style={{ width: 40, height: 40 }} viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h1>Help & Support</h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
              Need assistance? Our team is here to help you plan the perfect journey.
            </p>
            
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem', textAlign: 'left' }}>
              <div className="card" style={{ background: 'var(--bg-page)' }}>
                <h4 style={{ marginBottom: 8 }}>Knowledge Base</h4>
                <p style={{ fontSize: '0.85rem' }}>Browse articles on how to use Traveloop features, manage trips, and more.</p>
                <button className="btn btn-ghost btn-sm" style={{ marginTop: '1rem', color: 'var(--primary)', padding: 0 }}>Explore FAQ &rarr;</button>
              </div>
              <div className="card" style={{ background: 'var(--bg-page)' }}>
                <h4 style={{ marginBottom: 8 }}>Contact Us</h4>
                <p style={{ fontSize: '0.85rem' }}>Send us a message and we'll get back to you within 24 hours.</p>
                <button className="btn btn-ghost btn-sm" style={{ marginTop: '1rem', color: 'var(--primary)', padding: 0 }}>support@traveloop.com</button>
              </div>
            </div>

            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Available Monday - Friday, 9:00 AM - 6:00 PM EST.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
