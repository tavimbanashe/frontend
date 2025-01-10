import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import { DataGrid } from '@mui/x-data-grid';
import '../styles/offeringsPage.css';

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOfferings();
    }, []);

    const fetchOfferings = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/offerings`);
            if (!response.ok) {
                throw new Error('Failed to fetch offerings');
            }
            const data = await response.json();
            setOfferings(data);
        } catch (err) {
            console.error('Error fetching offerings:', err);
            setError('Failed to load offerings. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewOffering((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveOffering = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/offerings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOffering),
            });
            if (!response.ok) {
                throw new Error('Failed to save offering');
            }
            await fetchOfferings();
            setIsModalOpen(false);
            setNewOffering({ giver_name: '', email: '', amount: '', offering_date: '', notes: '' });
        } catch (err) {
            console.error('Error saving offering:', err);
            setError('Failed to save offering. Please try again.');
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
                    {loading ? (
                        <p>Loading offerings...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : (
                        <DataGrid
                            rows={offerings}
                            columns={columns}
                            pageSize={5}
                            rowsPerPageOptions={[5, 10, 20]}
                            autoHeight
                        />
                    )}
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
