import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import { ProtectedRoute, AdminRoute } from './routes/ProtectedRoute';

import Login from './pages/Login';
import Home from './pages/Home';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import MyTrips from './pages/MyTrips';
import ItineraryBuilder from './pages/ItineraryBuilder';
import ItineraryView from './pages/ItineraryView';
import CitySearch from './pages/CitySearch';
import ActivitySearch from './pages/ActivitySearch';
import Budget from './pages/Budget';
import Checklist from './pages/Checklist';
import Notes from './pages/Notes';
import Community from './pages/Community';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import SharedView from './pages/SharedView';
import ExpenseInvoice from './pages/ExpenseInvoice';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public ─────────────────────────────── */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/shared/:id" element={<SharedView />} />

          {/* ── Authenticated users ─────────────────── */}
          <Route path="/dashboard"             element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create-trip"           element={<ProtectedRoute><CreateTrip /></ProtectedRoute>} />
          <Route path="/trips"                 element={<ProtectedRoute><MyTrips /></ProtectedRoute>} />
          <Route path="/itinerary/:id"         element={<ProtectedRoute><ItineraryBuilder /></ProtectedRoute>} />
          <Route path="/itinerary-view/:id"    element={<ProtectedRoute><ItineraryView /></ProtectedRoute>} />
          <Route path="/city-search"           element={<ProtectedRoute><CitySearch /></ProtectedRoute>} />
          <Route path="/activity-search"       element={<ProtectedRoute><ActivitySearch /></ProtectedRoute>} />
          <Route path="/budget/:id"            element={<ProtectedRoute><Budget /></ProtectedRoute>} />
          <Route path="/checklist/:id"         element={<ProtectedRoute><Checklist /></ProtectedRoute>} />
          <Route path="/notes/:id"             element={<ProtectedRoute><Notes /></ProtectedRoute>} />
          <Route path="/community"             element={<ProtectedRoute><Community /></ProtectedRoute>} />
          <Route path="/profile"              element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/invoice/:id"          element={<ProtectedRoute><ExpenseInvoice /></ProtectedRoute>} />

          {/* ── Admin only ──────────────────────────── */}
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

          {/* ── Fallback ────────────────────────────── */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>


  );
}
