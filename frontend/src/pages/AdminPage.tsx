import React, { useEffect, useState } from 'react';
import { fetchAdminStats } from '../api';
import { AdminStat } from '../types';

export const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStat[]>([]);

  useEffect(() => {
    fetchAdminStats().then((data: AdminStat[]) => setStats(data || []));
  }, []);

  return (
    <div className="container">
      <h2>Admin Dashboard - Event Analytics</h2>
      <div className="grid">
        {stats.map((s) => (
          <div key={s.event_id} className="card">
            <h3>{s.title}</h3>
            <p>Total Seats: {s.total_seats}</p>
            <p>Booked: {s.booked_seats}</p>
            <p>Available: {s.available_seats}</p>
            <h4>Occupancy Rate: {s.occupancy}</h4>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;