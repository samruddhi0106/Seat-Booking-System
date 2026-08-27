import React from 'react';
import { EventItem } from '../types';

interface EventListPageProps {
  events: EventItem[];
  onSelectEvent: (id: string) => void;
  onSeed?: () => void;
}

export const EventListPage: React.FC<EventListPageProps> = ({
  events,
  onSelectEvent,
  onSeed,
}) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Available Events</h1>
        {onSeed && (
          <button
            onClick={onSeed}
            style={{
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Seed Sample Data
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>No events found. Click "Seed Sample Data" to load sample events.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {events.map((evt) => (
            <div
              key={evt.id}
              onClick={() => onSelectEvent(evt.id)}
              style={{
                backgroundColor: '#1e293b',
                padding: '1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                border: '1px solid #334155',
                transition: 'transform 0.2s, border-color 0.2s',
              }}
            >
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#38bdf8' }}>{evt.title}</h3>
              <p style={{ margin: '0.25rem 0', color: '#94a3b8', fontSize: '0.9rem' }}>📍 {evt.venue}</p>
              <p style={{ margin: '0.25rem 0', color: '#94a3b8', fontSize: '0.9rem' }}>📅 {evt.date_time}</p>
              <div style={{ marginTop: '1rem', color: '#3b82f6', fontWeight: 'bold' }}>
                View Seats &rarr;
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};