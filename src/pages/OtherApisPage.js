import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import '../styles/otherApisPage.css';

const OtherApisPage = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [jokeData, setJokeData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch Weather Data
    const fetchWeatherData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/weather');
            if (!response.ok) throw new Error('Failed to fetch weather data');
            const data = await response.json();
            setWeatherData(data);
        } catch (err) {
            setError('Unable to fetch weather data.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch Joke Data
    const fetchJokeData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/jokes');
            if (!response.ok) throw new Error('Failed to fetch joke data');
            const data = await response.json();
            setJokeData(data);
        } catch (err) {
            setError('Unable to fetch joke data.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch Data on Component Load
    useEffect(() => {
        fetchWeatherData();
        fetchJokeData();
    }, []);

    return (
        <div className="dashboard">
            <TopMenu />
            <Sidebar />
            <main className="other-apis-page">
                <header className="header">
                    <h1>Other APIs</h1>
                    <button
                        className="refresh-button"
                        onClick={() => {
                            fetchWeatherData();
                            fetchJokeData();
                        }}
                    >
                        Refresh Data
                    </button>
                </header>

                <section className="api-section">
                    <h2>Weather Data</h2>
                    {loading ? (
                        <p>Loading weather data...</p>
                    ) : weatherData ? (
                        <div className="weather-widget">
                            <p><strong>Location:</strong> {weatherData.name}</p>
                            <p><strong>Temperature:</strong> {weatherData.main.temp}°C</p>
                            <p><strong>Condition:</strong> {weatherData.weather[0].description}</p>
                        </div>
                    ) : (
                        <p>{error || 'No weather data available.'}</p>
                    )}
                </section>

                <section className="api-section">
                    <h2>Joke of the Day</h2>
                    {loading ? (
                        <p>Loading joke data...</p>
                    ) : jokeData ? (
                        <div className="joke-widget">
                            <p>{jokeData.setup}</p>
                            <p><em>{jokeData.punchline}</em></p>
                        </div>
                    ) : (
                        <p>{error || 'No joke data available.'}</p>
                    )}
                </section>
            </main>
        </div>
    );
};

export default OtherApisPage;
