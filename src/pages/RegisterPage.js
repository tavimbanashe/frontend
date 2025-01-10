import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css'; // Import the updated CSS for authentication styling

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);  // Loading state
    const [error, setError] = useState('');  // Error message state
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');  // Clear previous errors

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await response.json();

            if (response.ok) {
                alert('Registration successful');
                navigate('/login');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Error registering:', error);
            setError('An error occurred. Please try again later.');
        } finally {
            setLoading(false);  // Reset loading state
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form register-form">
            <h2>Register</h2>
            
            {/* Username input */}
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            
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
                {loading ? 'Registering...' : 'Register'}
            </button>

            {/* Link to the login page */}
            <Link to="/login" className="auth-link">
                Already have an account? Login
            </Link>
        </form>
    );
};

export default RegisterPage;
