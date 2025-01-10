import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import { DataGrid } from '@mui/x-data-grid';
import '../styles/pledges.css';

const PledgesPage = () => {
    const [pledgesData, setPledgesData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPledgesData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/pledges`);
                if (!response.ok) {
                    throw new Error('Failed to fetch pledges data');
                }
                const data = await response.json();
                setPledgesData(data);
            } catch (err) {
                console.error('Error fetching pledges data:', err);
                setError('Failed to load pledges data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchPledgesData();
    }, []);

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'member_name', headerName: 'Member Name', width: 200 },
        { field: 'purpose', headerName: 'Purpose', width: 200 },
        {
            field: 'amount',
            headerName: 'Amount',
            width: 150,
            renderCell: (params) => `$${params.row.amount.toFixed(2)}`,
        },
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
                    {loading ? (
                        <p>Loading pledge records...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : (
                        <DataGrid
                            rows={pledgesData}
                            columns={columns}
                            pageSize={5}
                            rowsPerPageOptions={[5, 10, 20]}
                            autoHeight
                            disableSelectionOnClick
                        />
                    )}
                </section>
            </main>
        </div>
    );
};

export default PledgesPage;
