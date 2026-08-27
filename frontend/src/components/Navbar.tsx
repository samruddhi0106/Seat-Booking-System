import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => (
  <nav className="navbar">
    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>
      Mini-BookMyShow
    </div>
    <div>
      <Link to="/">Events</Link>
      <Link to="/my-bookings">My Bookings</Link>
      <Link to="/admin">Admin</Link>
    </div>
  </nav>
);