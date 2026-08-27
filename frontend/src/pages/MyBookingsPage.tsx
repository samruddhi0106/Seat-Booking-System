import React, { useState, useEffect } from 'react';
import { fetchUserBookings, cancelBooking, getEvents } from '../api';

interface MyBookingsPageProps {
  user: { name: string; email: string };
}

const TICKET_PRICE = 90;

export const MyBookingsPage: React.FC<MyBookingsPageProps> = ({ user }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [eventsMap, setEventsMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingBooking, setDeletingBooking] = useState<any | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [cancelStatus, setCancelStatus] = useState<'idle' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [user.email]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingsData, eventsData] = await Promise.all([
        fetchUserBookings(user.email),
        getEvents()
      ]);

      const map: Record<string, any> = {};
      eventsData.forEach((e: any) => {
        map[e.id || e._id] = e;
      });

      setEventsMap(map);
      setBookings(bookingsData || []);
    } catch (err) {
      console.error('Failed to load bookings data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBooking) return;
    try {
      setIsCancelling(true);
      setErrorMessage('');

      // 1. Call API passing the MongoDB ID and payload fields
      await cancelBooking({
        _id: deletingBooking._id,
        id: deletingBooking.id,
        user_email: user.email,
        event_id: deletingBooking.event_id,
        seat_ids: deletingBooking.seat_ids,
      });

      // 2. Remove from local UI state immediately
      setBookings((prevBookings) =>
        prevBookings.filter((b) => {
          const targetId = deletingBooking._id || deletingBooking.id;
          const currentId = b._id || b.id;
          if (targetId && currentId) {
            return currentId !== targetId;
          }
          return !(
            b.event_id === deletingBooking.event_id &&
            b.seat_ids.join(',') === deletingBooking.seat_ids.join(',')
          );
        })
      );

      // 3. Show cancellation success banner
      setCancelStatus('success');

      // 4. Reset modal and refetch DB data to stay in sync
      setTimeout(async () => {
        setCancelStatus('idle');
        setDeletingBooking(null);
        setIsCancelling(false);
        await loadData();
      }, 1500);

    } catch (err: any) {
      console.error('Failed to cancel booking', err);
      setIsCancelling(false);
      setErrorMessage(
        err.response?.data?.detail || 'Failed to cancel booking. Document not found in database.'
      );
    }
  };

  if (loading && bookings.length === 0) {
    return <div style={{ color: '#fff', padding: '2rem' }}>Loading bookings...</div>;
  }

  return (
    <div style={{ padding: '2rem', color: '#fff', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>My Bookings</h1>

      {bookings.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>No bookings found for {user.email}.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {bookings.map((b) => {
            const event = eventsMap[b.event_id];
            const totalPrice = b.seat_ids.length * TICKET_PRICE;
            return (
              <div key={b._id || b.id || `${b.event_id}-${b.seat_ids.join('-')}`} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#38bdf8', fontSize: '1.3rem' }}>
                      {event ? event.title : 'Event Booking'}
                    </h3>
                    {event && (
                      <p style={{ margin: '0.2rem 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                        📍 {event.venue} | 📅 {new Date(event.date_time).toLocaleString()}
                      </p>
                    )}
                    <p style={{ margin: '0.5rem 0 0.2rem 0', color: '#cbd5e1' }}>
                      <strong>Seats:</strong> {b.seat_ids.join(', ')} ({b.seat_ids.length} Seats)
                    </p>
                    <p style={{ margin: '0.2rem 0', color: '#4ade80', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      Total Price: ${totalPrice} (${TICKET_PRICE}/seat)
                    </p>
                  </div>

                  <button onClick={() => setDeletingBooking(b)} style={dangerBtnStyle}>
                    Delete Booking
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL POP-UP */}
      {deletingBooking && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            {cancelStatus === 'success' ? (
              <div style={redCancelBannerStyle}>
                ✕ Cancelled from your booking!
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: '1.5rem', color: '#f87171', margin: '0 0 0.5rem 0' }}>
                  Delete Booking Confirmation
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Are you sure you want to cancel this booking reservation?
                </p>

                {errorMessage && (
                  <div style={errorBannerStyle}>
                    {errorMessage}
                  </div>
                )}

                <div style={cardStyle}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#38bdf8' }}>
                    {eventsMap[deletingBooking.event_id]?.title || 'Sci-Fi Blockbuster 2026'}
                  </h3>
                  <p style={{ margin: '0.3rem 0', color: '#cbd5e1' }}>
                    <strong>Seats Reserved:</strong> {deletingBooking.seat_ids.join(', ')} ({deletingBooking.seat_ids.length} Seats)
                  </p>
                  <p style={{ margin: '0.3rem 0', color: '#4ade80', fontWeight: 'bold' }}>
                    Total Amount to Cancel: ${deletingBooking.seat_ids.length * TICKET_PRICE}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={handleConfirmDelete} 
                    disabled={isCancelling} 
                    style={{ ...dangerBtnStyle, opacity: isCancelling ? 0.6 : 1 }}
                  >
                    {isCancelling ? 'Cancelling...' : 'Yes, Cancel My Booking'}
                  </button>
                  <button 
                    onClick={() => {
                      setDeletingBooking(null);
                      setErrorMessage('');
                    }} 
                    disabled={isCancelling} 
                    style={secondaryBtnStyle}
                  >
                    Go Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const cardStyle: React.CSSProperties = {
  backgroundColor: '#1e293b',
  padding: '1.5rem',
  borderRadius: '8px',
  border: '1px solid #334155',
};

const dangerBtnStyle: React.CSSProperties = {
  backgroundColor: '#dc2626',
  color: '#fff',
  padding: '0.6rem 1.2rem',
  border: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const secondaryBtnStyle: React.CSSProperties = {
  backgroundColor: '#334155',
  color: '#fff',
  padding: '0.6rem 1.2rem',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.85)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: '#0f172a',
  padding: '2rem',
  borderRadius: '12px',
  border: '1px solid #334155',
  maxWidth: '500px',
  width: '90%',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
};

const redCancelBannerStyle: React.CSSProperties = {
  backgroundColor: '#7f1d1d',
  color: '#fca5a5',
  padding: '1.2rem',
  borderRadius: '8px',
  fontWeight: 'bold',
  fontSize: '1.2rem',
  border: '1px solid #ef4444',
  textAlign: 'center',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
};

const errorBannerStyle: React.CSSProperties = {
  backgroundColor: '#450a0a',
  color: '#fca5a5',
  padding: '0.75rem',
  borderRadius: '6px',
  marginBottom: '1rem',
  border: '1px solid #991b1b',
};