import React, { useState } from 'react';
import './Auth.css';

export default function Auth({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const getUsers = () => {
        const users = localStorage.getItem('bbp_users');
        return users ? JSON.parse(users) : [];
    };

    const saveUsers = (users) => {
        localStorage.setItem('bbp_users', JSON.stringify(users));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

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

        const users = getUsers();

        if (isLogin) {
            // Handle Login
            const user = users.find(u => u.email === email && u.password === password);
            if (!user) {
                setError('Invalid email or password');
                return;
            }
            localStorage.setItem('bbp_current_user', JSON.stringify(user));
            onLogin(user);
        } else {
            // Handle Sign Up
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }

            if (users.find(u => u.email === email)) {
                setError('Email already registered');
                return;
            }

            const newUser = {
                id: Date.now(),
                email,
                password,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            saveUsers(users);
            localStorage.setItem('bbp_current_user', JSON.stringify(newUser));
            onLogin(newUser);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError('');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Bug Bounty Programs</h2>
                <p className="auth-subtitle">
                    {isLogin ? 'Sign in to your account' : 'Create a new account'}
                </p>

                <form onSubmit={handleSubmit}>
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

                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setError('');
                                }}
                            />
                        </div>
                    )}

                    <button type="submit" className="btn-login">
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-toggle">
                    <p>
                        {isLogin ? "Don't have an account?" : 'Already have an account?'}
                        <button type="button" onClick={toggleMode} className="toggle-btn">
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>

                <p className="auth-footer">
                    Demo: Email any@email.com, Password: 123456
                </p>
            </div>
        </div>
    );
}
