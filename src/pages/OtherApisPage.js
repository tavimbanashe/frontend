import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import '../styles/otherApisPage.css';

const OtherApisPage = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [jokeData, setJokeData] = useState(null);
    const [error, setError] = useState({ weather: '', joke: '' });
    const [loading, setLoading] = useState({ weather: false, joke: false });

    // Fetch Weather Data
    const fetchWeatherData = async () => {
        setLoading((prev) => ({ ...prev, weather: true }));
        setError((prev) => ({ ...prev, weather: '' }));
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/weather`);
            if (!response.ok) throw new Error('Failed to fetch weather data');
            const data = await response.json();
            setWeatherData(data);
        } catch (err) {
            console.error('Error fetching weather data:', err);
            setError((prev) => ({ ...prev, weather: 'Unable to fetch weather data.' }));
        } finally {
            setLoading((prev) => ({ ...prev, weather: false }));
        }
    };

    // Fetch Joke Data
    const fetchJokeData = async () => {
        setLoading((prev) => ({ ...prev, joke: true }));
        setError((prev) => ({ ...prev, joke: '' }));
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/jokes`);
            if (!response.ok) throw new Error('Failed to fetch joke data');
            const data = await response.json();
            setJokeData(data);
        } catch (err) {
            console.error('Error fetching joke data:', err);
            setError((prev) => ({ ...prev, joke: 'Unable to fetch joke data.' }));
        } finally {
            setLoading((prev) => ({ ...prev, joke: false }));
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

                {/* Weather Section */}
                <section className="api-section">
                    <h2>Weather Data</h2>
                    {loading.weather ? (
                        <p>Loading weather data...</p>
                    ) : weatherData ? (
                        <div className="weather-widget">
                            <p><strong>Location:</strong> {weatherData.name}</p>
                            <p><strong>Temperature:</strong> {weatherData.main.temp}°C</p>
                            <p><strong>Condition:</strong> {weatherData.weather[0].description}</p>
                        </div>
                    ) : (
                        <p>{error.weather || 'No weather data available.'}</p>
                    )}
                </section>

                {/* Joke Section */}
                <section className="api-section">
                    <h2>Joke of the Day</h2>
                    {loading.joke ? (
                        <p>Loading joke data...</p>
                    ) : jokeData ? (
                        <div className="joke-widget">
                            <p>{jokeData.setup}</p>
                            <p><em>{jokeData.punchline}</em></p>
                        </div>
                    ) : (
                        <p>{error.joke || 'No joke data available.'}</p>
                    )}
                </section>
            </main>
        </div>
    );
};

export default OtherApisPage;
