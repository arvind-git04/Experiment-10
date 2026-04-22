import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Movies from './pages/Movies';
import Shows from './pages/Shows';
import Bookings from './pages/Bookings';
import SeatBooking from './pages/SeatBooking';
import ManageMovies from './pages/ManageMovies';
import ManageShows from './pages/ManageShows';

// Route guards
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner"><div className="spinner" /> Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner"><div className="spinner" /> Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/movies" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to={user.role === 'admin' ? '/dashboard' : '/movies'} replace /> : children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1a1a1a', color: '#fff', border: '1px solid #2e2e2e' },
          success: { iconTheme: { primary: '#46d369', secondary: '#000' } },
          error:   { iconTheme: { primary: '#e50914', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/"         element={<Navigate to="/movies" replace />} />
          <Route path="/movies"   element={<Movies />} />
          <Route path="/shows"    element={<Shows />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/book/:showId" element={<SeatBooking />} />

          {/* Admin */}
          <Route path="/dashboard"      element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/manage-movies"  element={<AdminRoute><ManageMovies /></AdminRoute>} />
          <Route path="/manage-shows"   element={<AdminRoute><ManageShows /></AdminRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
