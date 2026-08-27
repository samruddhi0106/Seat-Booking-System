import React, { useState } from 'react';

interface AuthPageProps {
  onLogin: (userData: { name: string; email: string }) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const getRegisteredUsers = (): { name: string; email: string }[] => {
    const users = localStorage.getItem('registered_users');
    return users ? JSON.parse(users) : [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

    const registeredUsers = getRegisteredUsers();

    if (isRegistering) {
      // REGISTRATION ONLY
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }

      const existingUser = registeredUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (existingUser) {
        setError('User already exists! Please log in instead.');
        return;
      }

      // Save user to database
      const newUser = { name: name.trim(), email: email.trim().toLowerCase() };
      const updatedUsers = [...registeredUsers, newUser];
      localStorage.setItem('registered_users', JSON.stringify(updatedUsers));

      // Show success message and redirect to Login view
      setSuccessMsg('Registration successful! Please login with your email.');
      setIsRegistering(false);
      setName('');
    } else {
      // LOGIN ONLY
      const existingUser = registeredUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (!existingUser) {
        setError('User not found in registration database. Please register first.');
        return;
      }

      localStorage.setItem('user', JSON.stringify(existingUser));
      onLogin(existingUser);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#f8fafc' }}>
          {isRegistering ? 'Register Account' : 'User Login'}
        </h2>

        {error && <div style={errorStyle}>{error}</div>}
        {successMsg && <div style={successStyle}>{successMsg}</div>}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                style={inputStyle}
              />
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={inputStyle}
            />
          </div>

          <button type="submit" style={btnStyle}>
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: '#94a3b8' }}>
            {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setSuccessMsg('');
            }}
            style={toggleBtnStyle}
          >
            {isRegistering ? 'Login Here' : 'Register Here'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Inline Styles
const containerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '80vh',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#1e293b',
  padding: '2.5rem',
  borderRadius: '8px',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.5rem',
  color: '#cbd5e1',
  fontSize: '0.9rem',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '6px',
  border: '1px solid #334155',
  backgroundColor: '#0f172a',
  color: '#fff',
  boxSizing: 'border-box',
};

const btnStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  backgroundColor: '#4f46e5',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const toggleBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#38bdf8',
  fontWeight: 'bold',
  cursor: 'pointer',
  textDecoration: 'underline',
};

const errorStyle: React.CSSProperties = {
  backgroundColor: '#7f1d1d',
  color: '#fca5a5',
  padding: '0.75rem',
  borderRadius: '6px',
  marginBottom: '1rem',
  fontSize: '0.85rem',
  textAlign: 'center',
};

const successStyle: React.CSSProperties = {
  backgroundColor: '#14532d',
  color: '#86efac',
  padding: '0.75rem',
  borderRadius: '6px',
  marginBottom: '1rem',
  fontSize: '0.85rem',
  textAlign: 'center',
};