import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useToast, ToastContainer } from '../components/Toast';
import CurrencyBadge from '../components/CurrencyBadge';
import { useCurrency } from '../context/CurrencyContext';

const SearchIcon = () => <svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const ChevronLeftIcon = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>;
const PlusIcon = () => <svg className="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const CheckIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>;
const ClockIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const StarIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const FilterIcon = () => <svg className="icon" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;

// city → local currency mapping
const CITY_CURRENCY = {
  Paris: 'EUR', Tokyo: 'JPY', London: 'GBP', Rome: 'EUR',
  Dubai: 'AED', Barcelona: 'EUR',
};

const ACTIVITIES = [
  { id: 1,  name: 'Eiffel Tower Summit',       city: 'Paris',     category: 'sightseeing', cost: 45,  currency: 'EUR', duration: '2 hrs',  rating: 4.8, img: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=400&q=80', desc: 'Visit the top level of the iconic Parisian iron lattice tower for panoramic views.' },
  { id: 2,  name: 'Louvre Museum Tour',         city: 'Paris',     category: 'culture',     cost: 20,  currency: 'EUR', duration: '3 hrs',  rating: 4.7, img: 'https://images.unsplash.com/photo-1499098560697-4c6c42b5069b?auto=format&fit=crop&w=400&q=80', desc: 'Explore one of the world\'s largest art museums housing the Mona Lisa.' },
  { id: 3,  name: 'Seine River Dinner Cruise',  city: 'Paris',     category: 'dining',      cost: 95,  currency: 'EUR', duration: '2 hrs',  rating: 4.6, img: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?auto=format&fit=crop&w=400&q=80', desc: 'A romantic evening dinner cruise along the Seine with live music.' },
  { id: 4,  name: 'Tokyo Ramen Food Tour',      city: 'Tokyo',     category: 'food',        cost: 6000, currency: 'JPY', duration: '3.5 hrs',rating: 4.9, img: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=400&q=80', desc: 'A guided tour of Tokyo\'s top ramen shops with tastings and history.' },
  { id: 5,  name: 'Mount Fuji Day Trip',        city: 'Tokyo',     category: 'adventure',   cost: 12000, currency: 'JPY', duration: '10 hrs', rating: 4.9, img: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=400&q=80', desc: 'Full-day excursion to iconic Mount Fuji with guided hiking options.' },
  { id: 6,  name: 'British Museum',             city: 'London',    category: 'culture',     cost: 0,   currency: 'GBP', duration: '3 hrs',  rating: 4.8, img: 'https://images.unsplash.com/photo-1519219788971-8d9797e0928e?auto=format&fit=crop&w=400&q=80', desc: 'Free admission to one of the world\'s most comprehensive history museums.' },
  { id: 7,  name: 'London Eye Experience',      city: 'London',    category: 'sightseeing', cost: 35,  currency: 'GBP', duration: '1.5 hrs',rating: 4.5, img: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=400&q=80', desc: 'A slow capsule ride on the iconic Ferris wheel overlooking the Thames.' },
  { id: 8,  name: 'Colosseum Guided Tour',      city: 'Rome',      category: 'culture',     cost: 55,  currency: 'EUR', duration: '2.5 hrs',rating: 4.9, img: 'https://images.unsplash.com/photo-1552832230-c0197DD2a538?auto=format&fit=crop&w=400&q=80', desc: 'Expert-led tour of the iconic ancient Roman amphitheater.' },
  { id: 9,  name: 'Burj Khalifa Observatory',   city: 'Dubai',     category: 'sightseeing', cost: 250, currency: 'AED', duration: '2 hrs',  rating: 4.6, img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80', desc: 'Ride to the 124th floor for breathtaking views of Dubai skyline and desert.' },
  { id: 10, name: 'Desert Safari with BBQ',     city: 'Dubai',     category: 'adventure',   cost: 350, currency: 'AED', duration: '6 hrs',  rating: 4.7, img: 'https://images.unsplash.com/photo-1551041777-d84de60c94b2?auto=format&fit=crop&w=400&q=80', desc: 'Thrilling dune bashing followed by traditional Bedouin-style BBQ dinner.' },
  { id: 11, name: 'Sagrada Familia Visit',      city: 'Barcelona', category: 'culture',     cost: 40,  currency: 'EUR', duration: '2 hrs',  rating: 4.9, img: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=400&q=80', desc: 'Visit Gaudi\'s unfinished masterpiece — a UNESCO World Heritage Site.' },
  { id: 12, name: 'Soho Food Walking Tour',     city: 'London',    category: 'food',        cost: 65,  currency: 'GBP', duration: '3 hrs',  rating: 4.8, img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=80', desc: 'Sample the best street food and restaurants in London\'s vibrant Soho district.' },
];

const CATEGORIES = ['All', 'sightseeing', 'culture', 'dining', 'food', 'adventure'];
const DURATION_FILTERS = ['Any Duration', 'Under 2 hrs', '2–4 hrs', '4+ hrs'];
const COST_FILTERS = ['Any Cost', 'Free', 'Under $30', '$30–$80', 'Over $80'];

function RatingStars({ rating }) {
  return (
    <div className="flex items-center gap-xs">
      <span style={{ color: '#f59e0b' }}><StarIcon /></span>
      <span style={{ fontWeight: 700, fontSize: '0.83rem' }}>{rating}</span>
    </div>
  );
}

export default function ActivitySearch() {
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('All');
  const [costFilter, setCostFilter] = useState('Any Cost');
  const [durationFilter, setDurationFilter] = useState('Any Duration');
  const [sortBy, setSortBy]       = useState('rating');
  const [added, setAdded]         = useState({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId');
  const { toasts, showToast, dismissToast } = useToast();

  const matchesCost = (act) => {
    if (costFilter === 'Any Cost') return true;
    if (costFilter === 'Free') return act.cost === 0;
    if (costFilter === 'Under $30') return act.cost < 30;
    if (costFilter === '$30–$80') return act.cost >= 30 && act.cost <= 80;
    if (costFilter === 'Over $80') return act.cost > 80;
    return true;
  };
  const matchesDuration = (act) => {
    const hrs = parseFloat(act.duration);
    if (durationFilter === 'Any Duration') return true;
    if (durationFilter === 'Under 2 hrs') return hrs < 2;
    if (durationFilter === '2–4 hrs') return hrs >= 2 && hrs <= 4;
    if (durationFilter === '4+ hrs') return hrs > 4;
    return true;
  };

  let activities = ACTIVITIES
    .filter(a => category === 'All' || a.category === category)
    .filter(a => matchesCost(a))
    .filter(a => matchesDuration(a))
    .filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.city.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase()));

  if (sortBy === 'rating')    activities = [...activities].sort((a, b) => b.rating - a.rating);
  if (sortBy === 'cost-asc')  activities = [...activities].sort((a, b) => a.cost - b.cost);
  if (sortBy === 'cost-desc') activities = [...activities].sort((a, b) => b.cost - a.cost);
  if (sortBy === 'duration')  activities = [...activities].sort((a, b) => parseFloat(a.duration) - parseFloat(b.duration));
  if (sortBy === 'name')      activities = [...activities].sort((a, b) => a.name.localeCompare(b.name));

  const handleAdd = (act) => {
    setAdded(prev => ({ ...prev, [act.id]: true }));
    showToast(`"${act.name}" added to your itinerary!`, 'success');
    if (tripId) setTimeout(() => navigate(`/itinerary/${tripId}`), 1200);
  };

  const CATEGORY_COLORS = { sightseeing: 'var(--primary)', culture: '#8b5cf6', dining: 'var(--secondary)', food: '#f59e0b', adventure: 'var(--accent)' };


  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="flex items-center gap-sm mb-lg">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-icon"><ChevronLeftIcon /></button>
          <div>
            <h1>Activity Search</h1>
            <p>Browse and add experiences to enrich your trip. {activities.length} activities found.</p>
          </div>
        </div>


        {/* ── Filters ─────────────────────────────── */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: '1rem', alignItems: 'end' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Search Activities</label>
              <div className="input-icon-wrap">
                <span className="input-icon"><SearchIcon /></span>
                <input className="input-field" placeholder="Search by name, city, or keyword..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Cost</label>
              <select className="input-field" style={{ minWidth: 130 }} value={costFilter} onChange={e => setCostFilter(e.target.value)}>
                {COST_FILTERS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Duration</label>
              <select className="input-field" style={{ minWidth: 130 }} value={durationFilter} onChange={e => setDurationFilter(e.target.value)}>
                {DURATION_FILTERS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Sort By</label>
              <select className="input-field" style={{ minWidth: 130 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="rating">Top Rated</option>
                <option value="cost-asc">Cost: Low–High</option>
                <option value="cost-desc">Cost: High–Low</option>
                <option value="duration">Shortest First</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-sm" style={{ marginTop: '1.25rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.83rem', alignSelf: 'center', color: 'var(--text-muted)' }}><FilterIcon /> Type:</span>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{ padding: '5px 16px', borderRadius: 'var(--radius-full)', border: `1.5px solid ${category === cat ? 'var(--primary)' : 'var(--border)'}`, background: category === cat ? 'var(--primary)' : 'transparent', color: category === cat ? '#fff' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Activity Grid ────────────────────────── */}
        {activities.length === 0 ? (
          <div className="card text-center" style={{ padding: 'var(--space-xl)' }}>
            <h4>No activities match your filters</h4>
            <p>Try adjusting the category, cost, or duration filters.</p>
          </div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.5rem' }}>
            {activities.map(act => (
              <div key={act.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: 180, backgroundImage: `url(${act.img})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.6),transparent)' }} />
                  <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                    <span style={{ padding: '3px 12px', background: CATEGORY_COLORS[act.category] || 'var(--primary)', color: '#fff', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{act.category}</span>
                  </div>
                  <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.9rem' }}>
                    <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: 2 }}>{act.name}</h4>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>{act.city}</span>
                  </div>
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', borderRadius: 'var(--radius-md)', padding: '3px 10px' }}>
                    <RatingStars rating={act.rating} />
                  </div>
                </div>
                <div style={{ padding: '1.1rem 1.25rem' }}>
                  <p style={{ fontSize: '0.83rem', lineHeight: 1.6, marginBottom: '1rem' }}>{act.desc}</p>
                  <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                    <div className="flex items-center gap-md" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-xs"><ClockIcon /> {act.duration}</span>
                      <span style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{act.city}</span>
                    </div>
                    <CurrencyBadge amount={act.cost} country={act.city === 'Paris' ? 'France' : act.city === 'Tokyo' ? 'Japan' : act.city === 'London' ? 'UK' : act.city === 'Rome' ? 'Italy' : act.city === 'Dubai' ? 'UAE' : 'Spain'} size="md" />

                  </div>
                  <button className={`btn w-full ${added[act.id] ? 'btn-secondary' : 'btn-primary'}`} onClick={() => !added[act.id] && handleAdd(act)}>
                    {added[act.id] ? <><CheckIcon /> Added to Itinerary</> : <><PlusIcon /> Add to Itinerary</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
