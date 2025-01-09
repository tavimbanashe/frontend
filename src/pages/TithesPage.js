import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import { DataGrid } from '@mui/x-data-grid';
import '../styles/tithesPage.css';

// API Base URL from the environment variable
const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000'; // Default to localhost for development

const TithesPage = () => {
    const [tithes, setTithes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTithe, setNewTithe] = useState({
        member_id: '',
        amount: '',
        date: '',
        notes: '',
    });
    const [members, setMembers] = useState([]);

    // Fetch Tithes and Members Data
    useEffect(() => {
        const fetchTithes = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/tithes`);
                const data = await response.json();
                setTithes(data);
            } catch (error) {
                console.error('Error fetching tithes:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchMembers = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/members`);
                const data = await response.json();
                setMembers(data);
            } catch (error) {
                console.error('Error fetching members:', error);
            }
        };

        fetchTithes();
        fetchMembers();
    }, []);

    const handleAddTitheChange = (e) => {
        const { name, value } = e.target;
        setNewTithe((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddTitheSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/api/tithes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTithe),
            });

            if (response.ok) {
                const addedTithe = await response.json();
                setTithes((prev) => [...prev, addedTithe]);
                setIsModalOpen(false);
                setNewTithe({
                    member_id: '',
                    amount: '',
                    date: '',
                    notes: '',
                });
            } else {
                console.error('Failed to add tithe.');
            }
        } catch (error) {
            console.error('Error adding tithe:', error);
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'member', headerName: 'Member', width: 180 },
        { field: 'amount', headerName: 'Amount', width: 120 },
        { field: 'date', headerName: 'Date', width: 150 },
        { field: 'notes', headerName: 'Notes', width: 200 },
    ];

    const rows = tithes.map((tithe) => ({
        id: tithe.id,
        member: members.find((m) => m.id === tithe.member_id)?.first_name + ' ' +
                members.find((m) => m.id === tithe.member_id)?.last_name || 'Unknown Member',
        amount: `$${Number(tithe.amount).toFixed(2)}`,
        date: new Date(tithe.date).toLocaleDateString(),
        notes: tithe.notes || 'N/A',
    }));

    return (
        <div className="dashboard">
            <TopMenu />
            <Sidebar />
            <main className="tithes-page">
                <header className="tithes-header">
                    <h1>Tithes</h1>
                    <button
                        className="add-button"
                        onClick={() => setIsModalOpen(true)}
                    >
                        + Add Tithe
                    </button>
                </header>

                <section className="tithes-content">
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div style={{ height: 400, width: '100%' }}>
                            <DataGrid
                                rows={rows}
                                columns={columns}
                                pageSize={5}
                                rowsPerPageOptions={[5, 10, 20]}
                                checkboxSelection
                                disableSelectionOnClick
                            />
                        </div>
                    )}
                </section>

                {/* Add Tithe Modal */}
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Add Tithe</h2>
                            <form onSubmit={handleAddTitheSubmit}>
                                <label>Member</label>
                                <select
                                    name="member_id"
                                    value={newTithe.member_id}
                                    onChange={handleAddTitheChange}
                                    required
                                >
                                    <option value="">Select Member</option>
                                    {members.map((member) => (
                                        <option key={member.id} value={member.id}>
                                            {`${member.first_name} ${member.last_name}`}
                                        </option>
                                    ))}
                                </select>
                                <label>Amount</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={newTithe.amount}
                                    onChange={handleAddTitheChange}
                                    required
                                />
                                <label>Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={newTithe.date}
                                    onChange={handleAddTitheChange}
                                    required
                                />
                                <label>Notes</label>
                                <textarea
                                    name="notes"
                                    value={newTithe.notes}
                                    onChange={handleAddTitheChange}
                                ></textarea>
                                <div className="modal-actions">
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

export default TithesPage;
