import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import { DataGrid } from '@mui/x-data-grid';
import '../styles/offeringsPage.css';

const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000'; // Define the API base URL

const OfferingsPage = () => {
    const [offerings, setOfferings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newOffering, setNewOffering] = useState({
        giver_name: '',
        email: '',
        amount: '',
        offering_date: '',
        notes: '',
    });

    useEffect(() => {
        fetchOfferings();
    }, []);

    const fetchOfferings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/offerings`); // Use the updated API_BASE_URL
            const data = await response.json();
            setOfferings(data);
        } catch (error) {
            console.error('Failed to fetch offerings:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewOffering((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveOffering = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/offerings`, { // Use the updated API_BASE_URL
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOffering),
            });
            if (response.ok) {
                fetchOfferings();
                setIsModalOpen(false);
                setNewOffering({ giver_name: '', email: '', amount: '', offering_date: '', notes: '' });
            }
        } catch (error) {
            console.error('Failed to save offering:', error);
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'giver_name', headerName: 'Giver Name', width: 200 },
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'amount', headerName: 'Amount', width: 150 },
        { field: 'offering_date', headerName: 'Date', width: 150 },
        { field: 'notes', headerName: 'Notes', width: 250 },
    ];

    return (
        <div className="dashboard">
            <TopMenu />
            <Sidebar />
            <main className="offerings-page">
                <header className="offerings-header">
                    <h1>Offerings</h1>
                    <button className="add-button" onClick={() => setIsModalOpen(true)}>
                        + Add Offering
                    </button>
                </header>

                <section className="offerings-table">
                    <DataGrid
                        rows={offerings}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5, 10, 20]}
                        autoHeight
                    />
                </section>

                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Add Offering</h2>
                            <form>
                                <input
                                    type="text"
                                    name="giver_name"
                                    placeholder="Giver Name"
                                    value={newOffering.giver_name}
                                    onChange={handleInputChange}
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={newOffering.email}
                                    onChange={handleInputChange}
                                />
                                <input
                                    type="number"
                                    name="amount"
                                    placeholder="Amount"
                                    value={newOffering.amount}
                                    onChange={handleInputChange}
                                />
                                <input
                                    type="date"
                                    name="offering_date"
                                    value={newOffering.offering_date}
                                    onChange={handleInputChange}
                                />
                                <textarea
                                    name="notes"
                                    placeholder="Notes"
                                    value={newOffering.notes}
                                    onChange={handleInputChange}
                                />
                                <div className="modal-actions">
                                    <button type="button" onClick={handleSaveOffering}>
                                        Save
                                    </button>
                                    <button type="button" onClick={() => setIsModalOpen(false)}>
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

export default OfferingsPage;
