import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css'; // Import the updated CSS for authentication styling

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);  // Loading state
    const [error, setError] = useState('');  // Error message state
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');  // Clear previous errors

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (response.ok) {
                login(data);  // Assuming the data contains user info or a token
                navigate('/dashboard');
            } else {
                setError(data.message || 'Login failed');  // Set error message from the API response
            }
        } catch (error) {
            console.error('Error logging in:', error);
            setError('An error occurred. Please try again later.');
        } finally {
            setLoading(false);  // Reset loading state
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form login-form">
            <h2>Login</h2>
            
            {/* Email input */}
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            
            {/* Password input */}
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            
            {/* Display error message if there's any */}
            {error && <div className="error-message">{error}</div>}
            
            {/* Submit button */}
            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>

            {/* Link to the registration page */}
            <Link to="/register" className="auth-link">
                Don't have an account? Register
            </Link>
        </form>
    );
};

export default LoginPage;
