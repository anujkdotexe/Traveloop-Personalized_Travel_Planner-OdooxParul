import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Icons
const MapIcon = () => <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 6L1 22L8 18L16 22L23 18L23 2L16 6L8 2L1 6ZM8 2V18M16 6V22"/></svg>;
const CompassIcon = () => <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76L14.12 14.12L7.76 16.24L9.88 9.88L16.24 7.76Z"/></svg>;
const ShieldIcon = () => <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22S8 18 8 12V5L12 2L16 5V12S16 18 12 22Z"/></svg>;
const ZapIcon = () => <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const GlobeIcon = () => <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="landing-page" style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      {/* ── Navigation ─────────────────────────────── */}
      <nav style={{ 
        position: 'fixed', top: 0, width: '100%', zIndex: 1000, 
        background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)', padding: '1rem 5%',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div className="flex items-center gap-sm">
          <div style={{ 
            width: 32, height: 32, background: 'var(--primary)', 
            borderRadius: 10, display: 'flex', alignItems: 'center', 
            justifyContent: 'center', color: '#fff' 
          }}>
            <MapIcon />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>Traveloop</span>
        </div>
        
        <div className="flex items-center gap-md">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Sign In</Link>
              <Link to="/signup" className="btn btn-primary">Start Planning — It's Free</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────── */}
      <section style={{ 
        padding: '160px 5% 100px', textAlign: 'center', 
        background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.08), transparent), radial-gradient(circle at bottom left, rgba(20, 184, 166, 0.05), transparent)'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <span className="badge badge-ongoing" style={{ marginBottom: '1.5rem', padding: '6px 16px' }}>
            <ZapIcon /> AI-Powered Travel Planning
          </span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Plan your next <span style={{ color: 'var(--primary)', position: 'relative' }}>
              adventure
              <svg style={{ position: 'absolute', bottom: -10, left: 0, width: '100%' }} viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 0 100 5" stroke="var(--secondary)" strokeWidth="4" fill="none" />
              </svg>
            </span> in minutes.
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: 600, margin: '0 auto 2.5rem' }}>
            Dream, design, and organize multi-city itineraries with live currency tracking, budget insights, and community inspiration.
          </p>
          <div className="flex justify-center gap-md">
            <Link to="/signup" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
              Create Your First Trip
            </Link>
            <Link to="/community" className="btn btn-outline" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
              Explore Itineraries
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────── */}
      <section style={{ padding: '80px 5%', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Everything you need to travel smarter</h2>
          <p>From budget tracking to shared journals, we've got you covered.</p>
        </div>
        
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {[
            { 
              title: 'Multi-City Builder', 
              desc: 'Seamlessly add stops, activities, and transport between cities with our interactive timeline.',
              icon: CompassIcon, color: 'var(--primary)'
            },
            { 
              title: 'Live Budget Insights', 
              desc: 'Track expenses in any currency and see live conversions to INR. Stay within budget, always.',
              icon: GlobeIcon, color: 'var(--secondary)'
            },
            { 
              title: 'Community Shared', 
              desc: 'Get inspired by trips shared by other travelers or share your own masterfully planned journeys.',
              icon: ShieldIcon, color: 'var(--accent)'
            }
          ].map((f, i) => (
            <div key={i} className="card card-hover" style={{ padding: '2.5rem', border: '1px solid var(--border)' }}>
              <div style={{ 
                width: 50, height: 50, borderRadius: 15, background: f.color + '15', 
                color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <f.icon />
              </div>
              <h3 style={{ marginBottom: '1rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.95rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────── */}
      <section style={{ padding: '100px 5%', textAlign: 'center' }}>
        <div className="card" style={{ 
          background: 'var(--primary)', color: '#fff', padding: '80px 40px',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
          maxWidth: 1000, margin: '0 auto'
        }}>
          <h2 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '1.5rem' }}>Ready to start your journey?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', marginBottom: '2.5rem' }}>
            Join 12,000+ travelers planning their dream trips on Traveloop.
          </p>
          <Link to="/signup" className="btn btn-secondary" style={{ background: '#fff', color: 'var(--primary)', padding: '16px 40px' }}>
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────── */}
      <footer style={{ padding: '60px 5%', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div className="flex items-center justify-center gap-sm" style={{ marginBottom: '1.5rem' }}>
          <div style={{ width: 24, height: 24, background: 'var(--primary)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <MapIcon />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Traveloop</span>
        </div>
        <p style={{ fontSize: '0.9rem' }}>© 2026 Traveloop. Built for the modern traveler.</p>
      </footer>
    </div>
  );
}
