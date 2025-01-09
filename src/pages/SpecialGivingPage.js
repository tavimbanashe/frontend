import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import { DataGrid } from '@mui/x-data-grid';
import '../styles/specialGivingPage.css';

// API Base URL from the environment variable
const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000'; // Default to localhost for development

const SpecialGivingPage = () => {
    const [specialGivingData, setSpecialGivingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSpecialGiving, setNewSpecialGiving] = useState({
        donor_id: '',
        amount: '',
        date: '',
        type: '',
        notes: '',
    });
    const [donors, setDonors] = useState([]);

    // Fetch special giving and donors
    useEffect(() => {
        const fetchSpecialGiving = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/special-giving`);
                const data = await response.json();
                setSpecialGivingData(data);
            } catch (error) {
                console.error('Error fetching special giving data:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchDonors = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/members`);
                const data = await response.json();
                setDonors(data);
            } catch (error) {
                console.error('Error fetching donors:', error);
            }
        };

        fetchSpecialGiving();
        fetchDonors();
    }, []);

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'donor', headerName: 'Donor Name', width: 200 },
        { field: 'amount', headerName: 'Amount', width: 150 },
        { field: 'date', headerName: 'Date', width: 150 },
        { field: 'type', headerName: 'Type', width: 150 },
        { field: 'notes', headerName: 'Notes', width: 250 },
    ];

    const rows = specialGivingData.map((item) => ({
        id: item.id,
        donor: `${item.first_name || 'Unknown'} ${item.last_name || 'Donor'}`,
        amount: `$${item.amount.toFixed(2)}`,
        date: new Date(item.date).toLocaleDateString(),
        type: item.type,
        notes: item.notes || 'N/A',
    }));

    const handleAddGivingChange = (e) => {
        const { name, value } = e.target;
        setNewSpecialGiving((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddGivingSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/api/special-giving`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSpecialGiving),
            });

            if (response.ok) {
                const newGiving = await response.json();
                setSpecialGivingData((prev) => [...prev, newGiving]);
                setIsModalOpen(false);
                setNewSpecialGiving({ donor_id: '', amount: '', date: '', type: '', notes: '' });
            } else {
                console.error('Failed to add special giving entry.');
            }
        } catch (error) {
            console.error('Error adding special giving entry:', error);
        }
    };

    return (
        <div className="dashboard">
            <TopMenu />
            <Sidebar />
            <main className="special-giving-page">
                <header className="page-header">
                    <h1>Special Giving</h1>
                    <button
                        className="add-button"
                        onClick={() => setIsModalOpen(true)}
                    >
                        + Add Special Giving
                    </button>
                </header>
                <section className="grid-section">
                    <div style={{ height: 600, width: '100%' }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            pageSize={10}
                            loading={loading}
                            disableSelectionOnClick
                            autoHeight
                            style={{ backgroundColor: 'white' }}
                        />
                    </div>
                </section>

                {isModalOpen && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>Add Special Giving</h2>
                            <form onSubmit={handleAddGivingSubmit}>
                                <select
                                    name="donor_id"
                                    value={newSpecialGiving.donor_id}
                                    onChange={handleAddGivingChange}
                                    required
                                >
                                    <option value="">Select Giver</option>
                                    {donors.map((donor) => (
                                        <option key={donor.id} value={donor.id}>
                                            {`${donor.first_name} ${donor.last_name}`}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    name="amount"
                                    placeholder="Amount"
                                    value={newSpecialGiving.amount}
                                    onChange={handleAddGivingChange}
                                    required
                                />
                                <input
                                    type="date"
                                    name="date"
                                    value={newSpecialGiving.date}
                                    onChange={handleAddGivingChange}
                                    required
                                />
                                <input
                                    type="text"
                                    name="type"
                                    placeholder="Type"
                                    value={newSpecialGiving.type}
                                    onChange={handleAddGivingChange}
                                    required
                                />
                                <textarea
                                    name="notes"
                                    placeholder="Notes"
                                    value={newSpecialGiving.notes}
                                    onChange={handleAddGivingChange}
                                />
                                <div className="form-actions">
                                    <button type="submit" className="submit-button">
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SpecialGivingPage;
