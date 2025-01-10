import React, { useState, useEffect, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import { IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Snackbar, Alert } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { FaEdit, FaTrash } from 'react-icons/fa';
import '../styles/specialGivingPage.css';

const SpecialGivingPage = () => {
    const [specialGivingData, setSpecialGivingData] = useState([]);
    const [donors, setDonors] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSpecialGiving, setNewSpecialGiving] = useState({
        donor_id: '',
        amount: '',
        date: '',
        type: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [specialGivingToDelete, setSpecialGivingToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const fetchData = async (url, setter, errorMessage) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(errorMessage);
            }
            const data = await response.json();
            setter(data);
        } catch (error) {
            console.error(error.message);
            setError(errorMessage);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchData(`${process.env.REACT_APP_API_BASE_URL}/api/special-givings`, setSpecialGivingData, 'Error fetching special giving data');
        fetchData(`${process.env.REACT_APP_API_BASE_URL}/api/members`, setDonors, 'Error fetching donors');
        setLoading(false);
    }, []);

    const filteredSpecialGiving = useMemo(() => {
        return specialGivingData.filter((giving) =>
            [giving.donor_name, giving.amount, giving.date]
                .some((field) =>
                    field?.toString().toLowerCase().includes(searchQuery.toLowerCase())
                )
        );
    }, [specialGivingData, searchQuery]);

    const rows = filteredSpecialGiving.map((item) => ({
        id: item.id,
        donor: `${item.first_name || 'Unknown'} ${item.last_name || 'Donor'}`,
        amount: `$${item.amount.toFixed(2)}`,
        date: new Date(item.date).toLocaleDateString(),
        type: item.type,
        notes: item.notes || 'N/A',
    }));

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'donor', headerName: 'Donor Name', width: 200 },
        { field: 'amount', headerName: 'Amount', width: 150 },
        { field: 'date', headerName: 'Date', width: 150 },
        { field: 'type', headerName: 'Type', width: 150 },
        { field: 'notes', headerName: 'Notes', width: 250 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Tooltip title="Edit">
                        <IconButton>
                            <FaEdit />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton onClick={() => handleOpenDialog(params.row.id)}>
                            <FaTrash />
                        </IconButton>
                    </Tooltip>
                </div>
            ),
        },
    ];

    const handleOpenDialog = (givingId) => {
        setSpecialGivingToDelete(givingId);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSpecialGivingToDelete(null);
    };

    const handleDeleteSpecialGiving = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/special-givings/${specialGivingToDelete}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete special giving entry');
            }
            setSnackbarMessage('Special giving entry deleted successfully!');
            setSnackbarOpen(true);
            fetchData(`${process.env.REACT_APP_API_BASE_URL}/api/special-givings`, setSpecialGivingData, 'Error fetching special giving data');
        } catch (error) {
            setSnackbarMessage('Error deleting special giving entry');
            setSnackbarOpen(true);
            console.error(error.message);
        } finally {
            handleCloseDialog();
        }
    };

    const handleAddGivingChange = (e) => {
        const { name, value } = e.target;
        setNewSpecialGiving((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddGivingSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/special-givings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSpecialGiving),
            });

            if (!response.ok) throw new Error('Failed to add special giving entry.');

            const newGiving = await response.json();
            setSpecialGivingData((prev) => [...prev, newGiving]);
            setIsModalOpen(false);
            setNewSpecialGiving({ donor_id: '', amount: '', date: '', type: '', notes: '' });
        } catch (err) {
            console.error('Error adding special giving entry:', err.message);
            setError('Error adding special giving entry. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClearSearch = () => setSearchQuery('');

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
        setSnackbarMessage('');
    };

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="special-giving-page">
                <TopMenu />
                <header className="page-header">
                    <h1>Special Giving</h1>
                    <div className="search-container">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search special giving"
                        />
                        {searchQuery && (
                            <Tooltip title="Clear Search">
                                <IconButton onClick={handleClearSearch}>
                                    <span style={{ fontSize: '1.5em', cursor: 'pointer' }}>✖</span>
                                </IconButton>
                            </Tooltip>
                        )}
                        <Tooltip title="Add Special Giving">
                            <IconButton onClick={() => setIsModalOpen(true)}>
                                <AddCircleOutlineIcon color="primary" fontSize="large" />
                            </IconButton>
                        </Tooltip>
                    </div>
                </header>

                <section className="grid-section">
                    {loading ? (
                        <p>Loading special giving data...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : (
                        <div style={{ height: 600, width: '100%' }}>
                            <DataGrid
                                rows={rows}
                                columns={columns}
                                pageSize={10}
                                checkboxSelection
                                disableSelectionOnClick
                                autoHeight
                            />
                        </div>
                    )}
                </section>

                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Add Special Giving</h2>
                            <form onSubmit={handleAddGivingSubmit}>
                                <select
                                    name="donor_id"
                                    value={newSpecialGiving.donor_id}
                                    onChange={handleAddGivingChange}
                                    required
                                >
                                    <option value="">Select Donor</option>
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

                <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
                    <DialogTitle>
                        <Typography variant="h6">Confirm Deletion</Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete this special giving entry? This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="secondary" variant="outlined">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteSpecialGiving} color="primary" variant="contained">
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar 
                    open={snackbarOpen} 
                    autoHideDuration={6000} 
                    onClose={handleCloseSnackbar}>
                    <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </main>
        </div>
    );
};

export default SpecialGivingPage;
