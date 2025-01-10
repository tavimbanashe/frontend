import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import '../styles/newMembersPage.css';

const NewMembersPage = () => {
    const [activeTab, setActiveTab] = useState('firstTimers');
    const [newMembers, setNewMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
    const [dialog, setDialog] = useState({ open: false, member: null });

    const fetchData = async (url, setter, errorMessage) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(errorMessage);
            const data = await response.json();
            setter(data);
        } catch (err) {
            console.error(err.message);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const endpoint =
            activeTab === 'firstTimers'
                ? `${process.env.REACT_APP_API_BASE_URL}/api/members/first-timers`
                : `${process.env.REACT_APP_API_BASE_URL}/api/members/new-converts`;

        fetchData(endpoint, setNewMembers, 'Failed to load new members.');
    }, [activeTab]);

    const handleUpdateMember = (member) => {
        setDialog({ open: true, member });
    };

    const handleDialogClose = () => {
        setDialog({ open: false, member: null });
    };

    const handleDialogSave = async () => {
        const endpoint = `${process.env.REACT_APP_API_BASE_URL}/api/members/${dialog.member.id}`;
        try {
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dialog.member),
            });
            if (!response.ok) throw new Error('Failed to update member');
            setSnackbar({ open: true, message: 'Member updated successfully!', severity: 'success' });
            setNewMembers((prev) =>
                prev.map((m) => (m.id === dialog.member.id ? { ...dialog.member } : m))
            );
        } catch (err) {
            console.error('Error updating member:', err);
            setSnackbar({ open: true, message: 'Error updating member.', severity: 'error' });
        } finally {
            handleDialogClose();
        }
    };

    const handleDeleteMember = async (id) => {
        if (window.confirm(`Are you sure you want to delete member with ID: ${id}?`)) {
            const endpoint =
                activeTab === 'firstTimers'
                    ? `${process.env.REACT_APP_API_BASE_URL}/api/members/first-timers/${id}`
                    : `${process.env.REACT_APP_API_BASE_URL}/api/members/new-converts/${id}`;
            try {
                const response = await fetch(endpoint, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete member');
                setNewMembers((prev) => prev.filter((m) => m.id !== id));
                setSnackbar({ open: true, message: 'Member deleted successfully!', severity: 'success' });
            } catch (err) {
                console.error('Error deleting member:', err);
                setSnackbar({ open: true, message: 'Error deleting member.', severity: 'error' });
            }
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ open: false, message: '', severity: '' });
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'name', headerName: 'Name', width: 180, renderCell: (params) => `${params.row.first_name} ${params.row.last_name}` },
        { field: 'email', headerName: 'Email', width: 200 },
        activeTab === 'firstTimers'
            ? { field: 'first_visit_date', headerName: 'First Visit Date', width: 180 }
            : { field: 'conversion_date', headerName: 'Conversion Date', width: 180 },
        activeTab === 'firstTimers'
            ? { field: 'follow_up_notes', headerName: 'Follow-Up Notes', width: 200 }
            : { field: 'assigned_counselor', headerName: 'Assigned Counselor', width: 200 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <div className="action-buttons">
                    <button
                        className="edit-button"
                        onClick={() => handleUpdateMember(params.row)}
                    >
                        <FaEdit />
                    </button>
                    <button
                        className="delete-button"
                        onClick={() => handleDeleteMember(params.row.id)}
                    >
                        <FaTrash />
                    </button>
                </div>
            ),
        },
    ];

    const rows = newMembers.map((member, index) => ({
        id: member.id || member.member_id || index,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        first_visit_date: member.first_visit_date,
        follow_up_notes: member.follow_up_notes,
        conversion_date: member.conversion_date,
        assigned_counselor: member.assigned_counselor,
    }));

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="main-content">
                <TopMenu />
                <header className="members-header">
                    <h1>New Members</h1>
                    <div className="tabs">
                        <button
                            className={`tab-button ${activeTab === 'firstTimers' ? 'active' : ''}`}
                            onClick={() => setActiveTab('firstTimers')}
                        >
                            First Timers
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'newConverts' ? 'active' : ''}`}
                            onClick={() => setActiveTab('newConverts')}
                        >
                            New Converts
                        </button>
                    </div>
                </header>
                <section className="members-content">
                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : (
                        <div style={{ height: 400, width: '100%' }}>
                            <DataGrid
                                rows={rows}
                                columns={columns}
                                pageSize={5}
                                checkboxSelection
                                disableSelectionOnClick
                                sortingOrder={['asc', 'desc']}
                                pageSizeOptions={[5, 10, 25]}
                                pagination
                            />
                        </div>
                    )}
                </section>
            </main>
            <Dialog open={dialog.open} onClose={handleDialogClose}>
                <DialogTitle>Edit Member</DialogTitle>
                <DialogContent>
                    <TextField
                        label="First Name"
                        fullWidth
                        margin="normal"
                        value={dialog.member?.first_name || ''}
                        onChange={(e) => setDialog({ ...dialog, member: { ...dialog.member, first_name: e.target.value } })}
                    />
                    <TextField
                        label="Last Name"
                        fullWidth
                        margin="normal"
                        value={dialog.member?.last_name || ''}
                        onChange={(e) => setDialog({ ...dialog, member: { ...dialog.member, last_name: e.target.value } })}
                    />
                    <TextField
                        label="Email"
                        fullWidth
                        margin="normal"
                        value={dialog.member?.email || ''}
                        onChange={(e) => setDialog({ ...dialog, member: { ...dialog.member, email: e.target.value } })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleDialogSave} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default NewMembersPage;
