import React from 'react';
import { Seat } from '../types';

interface Props {
  seats: Seat[];
  selectedSeatIds: string[];
  onToggleSeat: (seatId: string) => void;
}

export const SeatMap: React.FC<Props> = ({ seats, selectedSeatIds, onToggleSeat }) => {
  const rows = Array.from(new Set(seats.map((s) => s.row))).sort();

  return (
    <div>
      <div className="screen">SCREEN THIS WAY</div>
      <div className="seat-grid">
        {rows.map((rowLetter) => {
          const rowSeats = seats
            .filter((s) => s.row === rowLetter)
            .sort((a, b) => a.number - b.number);

          return (
            <div key={rowLetter} className="seat-row">
              <span className="row-label">{rowLetter}</span>
              {rowSeats.map((seat) => {
                const isSelected = selectedSeatIds.includes(seat.seat_id);
                const isBooked = seat.status === 'booked';

                let seatClass = 'seat available';
                if (isBooked) seatClass = 'seat booked';
                else if (isSelected) seatClass = 'seat selected';

                return (
                  <button
                    key={seat.seat_id}
                    className={seatClass}
                    disabled={isBooked}
                    onClick={() => onToggleSeat(seat.seat_id)}
                    title={`${seat.seat_id} - ${seat.category} ($${seat.price})`}
                  >
                    {seat.number}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};