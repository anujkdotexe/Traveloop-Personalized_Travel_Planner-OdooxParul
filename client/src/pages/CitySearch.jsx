import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useToast, ToastContainer } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const SearchIcon = () => <svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const ChevronLeftIcon = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>;
const PlusIcon = () => <svg className="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const CheckIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>;
const GlobeIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const TrendIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const DollarIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;

const CITIES = [
  { id: 1,  name: 'Paris',       country: 'France',           region: 'Europe',  cost_index: '$$$$', popularity: 98, img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=400&q=80', tags: ['Romantic', 'Culture', 'Art'] },
  { id: 2,  name: 'Tokyo',       country: 'Japan',            region: 'Asia',    cost_index: '$$$',  popularity: 95, img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80', tags: ['Tech', 'Food', 'Anime'] },
  { id: 3,  name: 'New York',    country: 'USA',              region: 'Americas',cost_index: '$$$$', popularity: 96, img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=80', tags: ['Nightlife', 'Shopping', 'Culture'] },
  { id: 4,  name: 'Dubai',       country: 'UAE',              region: 'Middle East',cost_index:'$$$$',popularity:88, img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80', tags: ['Luxury', 'Shopping', 'Desert'] },
  { id: 5,  name: 'Rome',        country: 'Italy',            region: 'Europe',  cost_index: '$$$',  popularity: 93, img: 'https://images.unsplash.com/photo-1552832230-c0197DD2a538?auto=format&fit=crop&w=400&q=80', tags: ['History', 'Food', 'Architecture'] },
  { id: 6,  name: 'Bali',        country: 'Indonesia',        region: 'Asia',    cost_index: '$$',   popularity: 91, img: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=400&q=80', tags: ['Beach', 'Spiritual', 'Nature'] },
  { id: 7,  name: 'Barcelona',   country: 'Spain',            region: 'Europe',  cost_index: '$$$',  popularity: 90, img: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=400&q=80', tags: ['Architecture', 'Beach', 'Nightlife'] },
  { id: 8,  name: 'Cape Town',   country: 'South Africa',     region: 'Africa',  cost_index: '$$',   popularity: 82, img: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=400&q=80', tags: ['Nature', 'Adventure', 'Scenic'] },
  { id: 9,  name: 'Bangkok',     country: 'Thailand',         region: 'Asia',    cost_index: '$',    popularity: 87, img: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=400&q=80', tags: ['Food', 'Temples', 'Street Life'] },
  { id: 10, name: 'Sydney',      country: 'Australia',        region: 'Oceania', cost_index: '$$$$', popularity: 86, img: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=400&q=80', tags: ['Beach', 'Nature', 'Urban'] },
  { id: 11, name: 'London',      country: 'United Kingdom',   region: 'Europe',  cost_index: '$$$$', popularity: 97, img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=400&q=80', tags: ['History', 'Royal', 'Culture'] },
  { id: 12, name: 'Istanbul',    country: 'Turkey',           region: 'Europe',  cost_index: '$$',   popularity: 85, img: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=400&q=80', tags: ['History', 'Food', 'Bazaars'] },
];

const REGIONS = ['All Regions', 'Europe', 'Asia', 'Americas', 'Middle East', 'Africa', 'Oceania'];
const COST_FILTERS = ['Any Budget', '$', '$$', '$$$', '$$$$'];

function PopularityBar({ value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 4, background: 'var(--bg-surface-alt)', borderRadius: 9999 }}>
        <div style={{ width: `${value}%`, height: '100%', background: 'var(--primary)', borderRadius: 9999 }} />
      </div>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 28 }}>{value}</span>
    </div>
  );
}

export default function CitySearch() {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('All Regions');
  const [costFilter, setCostFilter] = useState('Any Budget');
  const [sortBy, setSortBy] = useState('popularity');
  const [added, setAdded] = useState({});
  const [trip, setTrip] = useState(null);
  const [existingStops, setExistingStops] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId');
  const { token } = useAuth();
  const { toasts, showToast, dismissToast } = useToast();

  useEffect(() => {
    if (!tripId || !token) return;
    fetch(`/api/trips/${tripId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') {
          setTrip(d.data.trip);
          setExistingStops(d.data.stops || []);
        }
      })
      .catch(() => {});
  }, [tripId, token]);

  let cities = CITIES
    .filter(c => region === 'All Regions' || c.region === region)
    .filter(c => costFilter === 'Any Budget' || c.cost_index === costFilter)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.country.toLowerCase().includes(search.toLowerCase()) || c.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));

  if (sortBy === 'popularity') cities = [...cities].sort((a, b) => b.popularity - a.popularity);
  if (sortBy === 'name')       cities = [...cities].sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy === 'cost-asc')   cities = [...cities].sort((a, b) => a.cost_index.length - b.cost_index.length);
  if (sortBy === 'cost-desc')  cities = [...cities].sort((a, b) => b.cost_index.length - a.cost_index.length);

  const handleAdd = async (city) => {
    if (!tripId || !token) {
      showToast('Please start planning a trip first.', 'info');
      return;
    }
    try {
      const arrivalDate = trip?.start_date || new Date().toISOString().split('T')[0];
      const departureDate = trip?.end_date || arrivalDate;
      const sequenceOrder = existingStops.length + 1;
      const res = await fetch('/api/trips/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          trip_id: tripId,
          city_name: city.name,
          country: city.country,
          arrival_date: arrivalDate,
          departure_date: departureDate,
          sequence_order: sequenceOrder
        })
      });
      if (!res.ok) throw new Error('Failed to add city');
      setAdded(prev => ({ ...prev, [city.id]: true }));
      showToast(`${city.name} added to your trip!`, 'success');
      setTimeout(() => navigate(`/itinerary/${tripId}`), 1200);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="flex items-center gap-sm mb-lg">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-icon"><ChevronLeftIcon /></button>
          <div>
            <h1>City Search</h1>
            <p>Discover and add cities to your itinerary. {cities.length} destinations found.</p>
          </div>
        </div>

        {/* ── Search + Filters ─────────────────────── */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '1rem', alignItems: 'end' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Search Cities</label>
              <div className="input-icon-wrap">
                <span className="input-icon"><SearchIcon /></span>
                <input className="input-field" placeholder="Search by city, country, or interest..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Region</label>
              <select className="input-field" style={{ minWidth: 140 }} value={region} onChange={e => setRegion(e.target.value)}>
                {REGIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Budget</label>
              <select className="input-field" style={{ minWidth: 120 }} value={costFilter} onChange={e => setCostFilter(e.target.value)}>
                {COST_FILTERS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Sort By</label>
              <select className="input-field" style={{ minWidth: 130 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="popularity">Popularity</option>
                <option value="name">Name A–Z</option>
                <option value="cost-asc">Cost: Low–High</option>
                <option value="cost-desc">Cost: High–Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── City Grid ───────────────────────────── */}
        {cities.length === 0 ? (
          <div className="card text-center" style={{ padding: 'var(--space-xl)' }}>
            <GlobeIcon />
            <h4>No cities match your filters</h4>
            <p>Try adjusting the region, budget, or search term.</p>
          </div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: '1.5rem' }}>
            {cities.map(city => (
              <div key={city.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: 180, backgroundImage: `url(${city.img})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.65),transparent)' }} />
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', color: '#fff', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700 }}>
                    {city.cost_index}
                  </div>
                  <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.9rem' }}>
                    <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: 2 }}>{city.name}</h4>
                    <div className="flex items-center gap-xs" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                      <GlobeIcon />{city.country} &bull; {city.region}
                    </div>
                  </div>
                </div>
                <div style={{ padding: '1.1rem 1.25rem' }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div className="flex items-center gap-xs" style={{ marginBottom: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <TrendIcon /> Popularity
                    </div>
                    <PopularityBar value={city.popularity} />
                  </div>
                  <div className="flex flex-wrap gap-xs" style={{ marginBottom: '1rem' }}>
                    {city.tags.map(tag => (
                      <span key={tag} style={{ padding: '2px 10px', background: 'var(--bg-surface-alt)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 600 }}>{tag}</span>
                    ))}
                  </div>
                  <button className={`btn w-full ${added[city.id] ? 'btn-secondary' : 'btn-primary'}`} onClick={() => !added[city.id] && handleAdd(city)}>
                    {added[city.id] ? <><CheckIcon /> Added to Trip</> : <><PlusIcon /> Add to Trip</>}
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
