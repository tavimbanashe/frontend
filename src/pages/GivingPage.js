import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import { DataGrid } from '@mui/x-data-grid';
import '../styles/giving.css';

const GivingPage = () => {
    const [givingData, setGivingData] = useState([]);
    const [loading, setLoading] = useState(false); // Loading state
    const [error, setError] = useState('');       // Error state

    useEffect(() => {
        const fetchGivingData = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/giving`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                const data = await response.json();

                if (response.ok) {
                    setGivingData(data);
                } else {
                    setError(data.message || 'Failed to fetch giving records.');
                }
            } catch (error) {
                console.error('Error fetching giving data:', error);
                setError('An error occurred. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchGivingData();
    }, []);

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'member_name', headerName: 'Member Name', width: 200 },
        { field: 'type', headerName: 'Type', width: 150 },
        { field: 'amount', headerName: 'Amount', width: 150 },
        { field: 'date', headerName: 'Date', width: 200 },
        { field: 'payment_platform', headerName: 'Payment Platform', width: 200 },
    ];

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="giving-page">
                <TopMenu />
                <header className="giving-header">
                    <h1>Giving Records</h1>
                </header>
                <section className="giving-table">
                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : (
                        <DataGrid rows={givingData} columns={columns} pageSize={5} />
                    )}
                </section>
            </main>
        </div>
    );
};

export default GivingPage;
