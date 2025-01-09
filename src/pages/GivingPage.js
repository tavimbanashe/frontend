import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import { DataGrid } from '@mui/x-data-grid';
import '../styles/giving.css';

// Use the API_BASE_URL from environment variables
const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

const GivingPage = () => {
    const [givingData, setGivingData] = useState([]);

    // Fetch giving data from API
    useEffect(() => {
        const fetchGivingData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/giving`);
                const data = await response.json();
                setGivingData(data);
            } catch (error) {
                console.error('Error fetching giving data:', error);
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
                    <DataGrid rows={givingData} columns={columns} pageSize={5} />
                </section>
            </main>
        </div>
    );
};

export default GivingPage;
