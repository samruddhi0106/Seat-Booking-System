import React, { useState, useEffect } from 'react';
import { AuthPage } from './pages/AuthPage';
import { EventListPage } from './pages/EventListPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { getEvents, seedEvents } from './api';
import { EventItem } from './types';

export const App: React.FC = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [currentView, setCurrentView] = useState<'events' | 'detail' | 'bookings'>('events');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [logoutMessage, setLogoutMessage] = useState<string>('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data || []);
    } catch (err) {
      console.error("Failed to load events", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('events');
    
    // Show green logout banner
    setLogoutMessage('Logged out successfully!');

    // Automatically hide banner after 3 seconds
    setTimeout(() => {
      setLogoutMessage('');
    }, 3000);
  };

  if (!user) {
    return (
      <div style={{ position: 'relative' }}>
        {logoutMessage && (
          <div style={logoutBannerStyle}>
            ✓ {logoutMessage}
          </div>
        )}
        <AuthPage onLogin={(userData) => setUser(userData)} />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', backgroundColor: '#1e293b' }}>
        <h2 style={{ margin: 0, color: '#38bdf8', cursor: 'pointer' }} onClick={() => setCurrentView('events')}>
          Mini-BookMyShow
        </h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => setCurrentView('events')} style={navBtnStyle}>Events</button>
          <button onClick={() => setCurrentView('bookings')} style={navBtnStyle}>My Bookings</button>
          <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{user.email}</span>
          <button onClick={handleLogout} style={{ ...navBtnStyle, backgroundColor: '#ef4444' }}>Logout</button>
        </div>
      </nav>

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {currentView === 'events' && (
          loading ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '3rem' }}>
              Loading events...
            </div>
          ) : (
            <EventListPage
              events={events}
              onSelectEvent={(id: string) => { 
                setSelectedEventId(id); 
                setCurrentView('detail'); 
              }}
              onSeed={async () => { 
                await seedEvents(); 
                await loadEvents(); 
              }}
            />
          )
        )}
        {currentView === 'detail' && selectedEventId && (
          <EventDetailPage 
            eventId={selectedEventId} 
            user={user} 
            onBack={() => setCurrentView('events')} 
            onBookingSuccess={() => setCurrentView('bookings')}
          />
        )}
        {currentView === 'bookings' && (
          <MyBookingsPage user={user} />
        )}
      </main>
    </div>
  );
};

const navBtnStyle: React.CSSProperties = {
  backgroundColor: '#3b82f6',
  color: '#fff',
  border: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const logoutBannerStyle: React.CSSProperties = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  backgroundColor: '#166534',
  color: '#4ade80',
  border: '1px solid #22c55e',
  padding: '0.8rem 1.5rem',
  borderRadius: '8px',
  fontWeight: 'bold',
  fontSize: '1rem',
  zIndex: 9999,
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
};

export default App;