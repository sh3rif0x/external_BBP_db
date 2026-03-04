import React, { useState } from 'react';
import './Auth.css';

export default function Auth({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Valid credentials
    const VALID_USERNAME = 'sh3rif0x';
    const VALID_PASSWORD = 'sh3rif0x';

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password.trim()) {
            setError('❌ Please enter username and password');
            return;
        }

        if (username === VALID_USERNAME && password === VALID_PASSWORD) {
            // Login successful
            const user = {
                id: Date.now(),
                username: username,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem('bbp_current_user', JSON.stringify(user));
            onLogin(user);
        } else {
            setError('❌ Invalid username or password');
            setPassword('');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>🎯 Bug Bounty Programs</h1>
                <p className="auth-subtitle">Hunting Platform</p>

                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="username">👤 Username</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError('');
                            }}
                            className="form-input"
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">🔒 Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            className="form-input"
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="btn-login">
                        🔓 Login
                    </button>
                </form>

                <p className="auth-footer">
                    🔐 Bug Bounty Programs Portal
                </p>
            </div>
        </div>
    );
}
