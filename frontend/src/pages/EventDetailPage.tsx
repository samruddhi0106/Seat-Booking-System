import React, { useState, useEffect } from 'react';
import { getEvents, createBooking } from '../api';

interface EventDetailPageProps {
  eventId: string;
  user: { name: string; email: string };
  onBack: () => void;
  onBookingSuccess: () => void;
}

const TICKET_PRICE = 90;

export const EventDetailPage: React.FC<EventDetailPageProps> = ({
  eventId,
  user,
  onBack,
  onBookingSuccess,
}) => {
  const [event, setEvent] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      const currentEvent = data.find((e: any) => e.id === eventId);
      setEvent(currentEvent);
    } catch (err) {
      setError('Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleFinalBooking = async () => {
    try {
      setBookingStatus('submitting');
      setError('');
      
      await createBooking({
        event_id: eventId,
        user_name: user.name,
        user_email: user.email,
        seat_ids: selectedSeats,
      });

      setBookingStatus('success');

      setTimeout(() => {
        setShowConfirmModal(false);
        onBookingSuccess();
      }, 1500);

    } catch (err: any) {
      setError(err.response?.data?.detail || 'Booking failed. Please try again.');
      setBookingStatus('idle');
    }
  };

  if (loading) return <div style={{ color: '#fff', padding: '2rem' }}>Loading...</div>;
  if (!event) return <div style={{ color: '#fff', padding: '2rem' }}>Event not found.</div>;

  const totalAmount = selectedSeats.length * TICKET_PRICE;

  if (isReviewing) {
    return (
      <div style={{ padding: '2rem', color: '#fff', maxWidth: '700px', margin: '0 auto', position: 'relative' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.2rem' }}>Confirm your bookings</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Review selected seats before finalizing your reservation
        </p>

        {error && <div style={errorBannerStyle}>{error}</div>}

        <div style={cardStyle}>
          <h2 style={{ fontSize: '1.4rem', color: '#38bdf8', marginBottom: '1rem' }}>{event.title}</h2>
          <p style={{ color: '#cbd5e1', marginBottom: '0.5rem' }}>
            📍 <strong>Venue:</strong> {event.venue}
          </p>
          <p style={{ color: '#cbd5e1', marginBottom: '1.5rem' }}>
            📅 <strong>Date:</strong> {new Date(event.date_time).toLocaleString()}
          </p>

          <div style={{ borderTop: '1px solid #334155', paddingTop: '1rem' }}>
            <p><strong>Selected Seats:</strong> {selectedSeats.join(', ')}</p>
            <p><strong>Total Seats Selected:</strong> {selectedSeats.length}</p>
            <p><strong>Price per Ticket:</strong> ${TICKET_PRICE}</p>
          </div>

          <div style={{ borderTop: '1px solid #334155', marginTop: '1.5rem', paddingTop: '1rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#4ade80' }}>
              Total Amount: ${totalAmount}
            </h3>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button onClick={() => setShowConfirmModal(true)} style={primaryBtnStyle}>
            Confirm & Book All
          </button>
          <button onClick={() => setIsReviewing(false)} style={secondaryBtnStyle}>
            Go Back
          </button>
        </div>

        {/* MODAL WITH GREEN SUCCESS MESSAGE */}
        {showConfirmModal && (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              {bookingStatus === 'success' ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={successBannerStyle}>
                    ✓ Booking Confirmed Successfully!
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Redirecting to My Bookings...
                  </p>
                </div>
              ) : (
                <>
                  <h2 style={{ margin: '0 0 1rem 0', color: '#38bdf8', fontSize: '1.5rem' }}>
                    Confirm Reservation?
                  </h2>
                  <p style={{ color: '#cbd5e1', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                    Are you sure you want to finalize booking <strong>{selectedSeats.length} seat(s)</strong> for{' '}
                    <strong>${totalAmount}</strong>?
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={handleFinalBooking}
                      disabled={bookingStatus === 'submitting'}
                      style={{
                        ...primaryBtnStyle,
                        opacity: bookingStatus === 'submitting' ? 0.6 : 1,
                      }}
                    >
                      {bookingStatus === 'submitting' ? 'Processing...' : 'Confirm & Book'}
                    </button>
                    <button
                      onClick={() => setShowConfirmModal(false)}
                      disabled={bookingStatus === 'submitting'}
                      style={secondaryBtnStyle}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', color: '#fff', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={onBack} style={secondaryBtnStyle}>
        ← Back to Events
      </button>

      <h1 style={{ marginTop: '1.5rem', fontSize: '2rem' }}>{event.title}</h1>
      <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
        📍 {event.venue} | 📅 {new Date(event.date_time).toLocaleString()}
      </p>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 16, height: 16, backgroundColor: '#22c55e', borderRadius: 3 }}></span>
          Available
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 16, height: 16, backgroundColor: '#ef4444', borderRadius: 3 }}></span>
          Booked
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 16, height: 16, backgroundColor: '#eab308', borderRadius: 3 }}></span>
          Selected
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${event.seats_per_row || 8}, 45px)`, gap: '8px', marginBottom: '2rem' }}>
        {event.seats?.map((seat: any) => {
          const isBooked = seat.status === 'booked';
          const isSelected = selectedSeats.includes(seat.seat_id);

          let bg = '#22c55e';
          if (isBooked) bg = '#ef4444';
          if (isSelected) bg = '#eab308';

          return (
            <button
              key={seat.seat_id}
              disabled={isBooked}
              onClick={() => toggleSeat(seat.seat_id)}
              style={{
                width: '45px',
                height: '45px',
                backgroundColor: bg,
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: isBooked ? 'not-allowed' : 'pointer',
              }}
            >
              {isBooked ? '' : seat.seat_id}
            </button>
          );
        })}
      </div>

      <div style={cardStyle}>
        <p style={{ margin: '0 0 0.5rem 0' }}>
          <strong>Total Selected Seats:</strong> {selectedSeats.length}
        </p>
        <p style={{ margin: '0 0 1rem 0' }}>
          <strong>Calculated Amount ($90/seat):</strong> ${totalAmount}
        </p>

        <button
          disabled={selectedSeats.length === 0}
          onClick={() => setIsReviewing(true)}
          style={{
            ...primaryBtnStyle,
            opacity: selectedSeats.length === 0 ? 0.5 : 1,
            cursor: selectedSeats.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Review and Confirm Booking ({selectedSeats.length} Seats - ${totalAmount})
        </button>
      </div>
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

const primaryBtnStyle: React.CSSProperties = {
  backgroundColor: '#4f46e5',
  color: '#fff',
  padding: '0.75rem 1.5rem',
  border: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const secondaryBtnStyle: React.CSSProperties = {
  backgroundColor: '#334155',
  color: '#fff',
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

const errorBannerStyle: React.CSSProperties = {
  backgroundColor: '#7f1d1d',
  color: '#fca5a5',
  padding: '0.75rem',
  borderRadius: '6px',
  marginBottom: '1rem',
};

const successBannerStyle: React.CSSProperties = {
  backgroundColor: '#166534',
  color: '#4ade80',
  padding: '1rem',
  borderRadius: '6px',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  border: '1px solid #22c55e',
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
  backgroundColor: '#1e293b',
  padding: '2rem',
  borderRadius: '12px',
  border: '1px solid #475569',
  maxWidth: '450px',
  width: '90%',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
};