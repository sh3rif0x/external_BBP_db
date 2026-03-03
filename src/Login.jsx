import React, { useState } from 'react';
import './Auth.css';

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        // Simulate login
        localStorage.setItem('user', JSON.stringify({ email, loggedIn: true }));
        onLogin({ email });
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Bug Bounty Programs</h2>
                <p className="auth-subtitle">Sign in to your account</p>
                
                <form onSubmit={handleLogin}>
                    {error && <div className="error-message">{error}</div>}
                    
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                        />
                    </div>

                    <button type="submit" className="btn-login">Sign In</button>
                </form>

                <p className="auth-footer">Demo: Use any email and 6+ character password</p>
            </div>
        </div>
    );
}
