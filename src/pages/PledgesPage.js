import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import { DataGrid } from '@mui/x-data-grid';
import '../styles/pledges.css';

const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000'; // Define the API base URL

const PledgesPage = () => {
    const [pledgesData, setPledgesData] = useState([]);

    useEffect(() => {
        const fetchPledgesData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/pledges`); // Use the updated API_BASE_URL
                const data = await response.json();
                setPledgesData(data);
            } catch (error) {
                console.error('Error fetching pledges data:', error);
            }
        };
        fetchPledgesData();
    }, []);

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'member_name', headerName: 'Member Name', width: 200 },
        { field: 'purpose', headerName: 'Purpose', width: 200 },
        { field: 'amount', headerName: 'Amount', width: 150 },
        { field: 'status', headerName: 'Status', width: 150 },
    ];

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="pledges-page">
                <TopMenu />
                <header className="pledges-header">
                    <h1>Pledge Records</h1>
                </header>
                <section className="pledges-table">
                    <DataGrid rows={pledgesData} columns={columns} pageSize={5} />
                </section>
            </main>
        </div>
    );
};

export default PledgesPage;
