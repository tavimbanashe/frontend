import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import { DataGrid } from '@mui/x-data-grid';
import '../styles/onlineGivingPage.css';

const OnlineGivingPage = () => {
    const [donations, setDonations] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDonation, setNewDonation] = useState({
        donor_name: '',
        email: '',
        amount: '',
        platform: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const platforms = ['PayPal', 'Stripe', 'PayFast'];

    // Fetch donations
    useEffect(() => {
        const fetchDonations = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/online-giving`);
                if (!response.ok) {
                    throw new Error('Failed to fetch donations');
                }
                const data = await response.json();
                setDonations(data);
            } catch (err) {
                console.error('Error fetching donations:', err);
                setError('Failed to load donations. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchDonations();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewDonation((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddDonation = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/online-giving`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDonation),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add donation');
            }
            const addedDonation = await response.json();
            setDonations((prev) => [...prev, addedDonation]);
            setIsModalOpen(false);
            setNewDonation({ donor_name: '', email: '', amount: '', platform: '' });
        } catch (err) {
            console.error('Error adding donation:', err);
            setError('Failed to add donation. Please try again.');
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'donor_name', headerName: 'Giver Name', width: 180 },
        { field: 'email', headerName: 'Email', width: 220 },
        {
            field: 'amount',
            headerName: 'Amount',
            width: 150,
            renderCell: (params) => `$${params.row.amount.toFixed(2)}`,
        },
        { field: 'platform', headerName: 'Platform', width: 150 },
        { field: 'status', headerName: 'Status', width: 150 },
    ];

    return (
        <div className="dashboard">
            <TopMenu />
            <Sidebar />
            <main className="online-giving-page">
                <header className="header">
                    <h1>Online Giving</h1>
                    <button
                        className="add-button"
                        onClick={() => setIsModalOpen(true)}
                    >
                        + Add Giving
                    </button>
                </header>

                <section className="donations-grid">
                    <h2>Givings List</h2>
                    {loading ? (
                        <p>Loading donations...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : (
                        <div style={{ height: 400, width: '100%' }}>
                            <DataGrid
                                rows={donations}
                                columns={columns}
                                pageSize={5}
                                rowsPerPageOptions={[5, 10, 20]}
                                disableSelectionOnClick
                                autoHeight
                            />
                        </div>
                    )}
                </section>

                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Add Giving</h2>
                            <form onSubmit={handleAddDonation}>
                                <input
                                    type="text"
                                    name="donor_name"
                                    placeholder="Giver Name"
                                    value={newDonation.donor_name}
                                    onChange={handleInputChange}
                                    required
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={newDonation.email}
                                    onChange={handleInputChange}
                                    required
                                />
                                <input
                                    type="number"
                                    name="amount"
                                    placeholder="Amount"
                                    value={newDonation.amount}
                                    onChange={handleInputChange}
                                    required
                                />
                                <select
                                    name="platform"
                                    value={newDonation.platform}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Platform</option>
                                    {platforms.map((platform, index) => (
                                        <option key={index} value={platform}>
                                            {platform}
                                        </option>
                                    ))}
                                </select>
                                <div className="modal-actions">
                                    <button type="submit" className="submit-button">
                                        Save
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

export default OnlineGivingPage;
