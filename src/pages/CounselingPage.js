import React, { useState, useEffect, useCallback } from 'react';
import { Button, IconButton, Modal, Box, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit, Delete } from '@mui/icons-material';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import '../styles/CounselingPage.css';

const CounselingPage = () => {
    const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

    const [counselors, setCounselors] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState({ counselors: true, sessions: true });
    const [openModal, setOpenModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [modalType, setModalType] = useState('counselor');

    const fetchCounselors = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/members/counseling/counselors`);
            if (!response.ok) throw new Error('Failed to fetch counselors');
            const data = await response.json();
            setCounselors(data);
        } catch (error) {
            console.error('Error fetching counselors:', error);
        } finally {
            setLoading((prev) => ({ ...prev, counselors: false }));
        }
    }, [API_BASE_URL]);

    const fetchSessions = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/members/counseling/sessions`);
            if (!response.ok) throw new Error('Failed to fetch sessions');
            const data = await response.json();
            setSessions(data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setLoading((prev) => ({ ...prev, sessions: false }));
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        fetchCounselors();
        fetchSessions();
    }, [fetchCounselors, fetchSessions]);

    const handleOpenModal = (type, item = null) => {
        setModalType(type);
        setSelectedItem(item);
        setFormData(
            item || (type === 'counselor' ? {
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                specialization: '',
            } : {
                member_id: '',
                counselor_id: '',
                session_date: '',
                notes: '',
                status: 'Scheduled',
            })
        );
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleSave = async () => {
        const method = selectedItem ? 'PUT' : 'POST';
        const endpoint = selectedItem
            ? `${API_BASE_URL}/api/members/counseling/${modalType === 'counselor' ? 'counselors' : 'sessions'}/${selectedItem.id}`
            : `${API_BASE_URL}/api/members/counseling/${modalType === 'counselor' ? 'counselors' : 'sessions'}`;

        try {
            await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            modalType === 'counselor' ? fetchCounselors() : fetchSessions();
            handleCloseModal();
        } catch (error) {
            console.error(`Error saving ${modalType}:`, error);
        }
    };

    const handleDelete = async (type, id) => {
        try {
            await fetch(`${API_BASE_URL}/api/members/counseling/${type}/${id}`, {
                method: 'DELETE',
            });
            type === 'counselors' ? fetchCounselors() : fetchSessions();
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
        }
    };

    const counselorColumns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'first_name', headerName: 'First Name', width: 150 },
        { field: 'last_name', headerName: 'Last Name', width: 150 },
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'phone', headerName: 'Phone', width: 150 },
        { field: 'specialization', headerName: 'Specialization', width: 200 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <div style={{ display: 'flex', gap: '10px' }}>
                    <IconButton onClick={() => handleOpenModal('counselor', params.row)}>
                        <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete('counselors', params.row.id)}>
                        <Delete />
                    </IconButton>
                </div>
            ),
        },
    ];

    const sessionColumns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'member_name', headerName: 'Member', width: 200 },
        { field: 'counselor_name', headerName: 'Counselor', width: 200 },
        { field: 'session_date', headerName: 'Date', width: 150 },
        { field: 'status', headerName: 'Status', width: 150 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <div style={{ display: 'flex', gap: '10px' }}>
                    <IconButton onClick={() => handleOpenModal('session', params.row)}>
                        <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete('sessions', params.row.id)}>
                        <Delete />
                    </IconButton>
                </div>
            ),
        },
    ];

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="main-content">
                <TopMenu />
                <div className="counseling-header">
                    <h1>Counselors</h1>
                    <Button variant="contained" onClick={() => handleOpenModal('counselor')}>
                        Add Counselor
                    </Button>
                </div>
                <DataGrid
                    rows={counselors}
                    columns={counselorColumns}
                    loading={loading.counselors}
                    style={{ height: 500, marginBottom: 50 }}
                />
                <div className="counseling-header">
                    <h1>Sessions</h1>
                    <Button variant="contained" onClick={() => handleOpenModal('session')}>
                        Add Session
                    </Button>
                </div>
                <DataGrid
                    rows={sessions}
                    columns={sessionColumns}
                    loading={loading.sessions}
                    style={{ height: 300 }}
                />
                <Modal open={openModal} onClose={handleCloseModal}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 400,
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            p: 4,
                        }}
                    >
                        <h2>{selectedItem ? `Edit ${modalType}` : `Add ${modalType}`}</h2>
                        {modalType === 'counselor' ? (
                            <>
                                <TextField
                                    label="First Name"
                                    fullWidth
                                    margin="normal"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                />
                                <TextField
                                    label="Last Name"
                                    fullWidth
                                    margin="normal"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                />
                                <TextField
                                    label="Email"
                                    fullWidth
                                    margin="normal"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                                <TextField
                                    label="Phone"
                                    fullWidth
                                    margin="normal"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                                <TextField
                                    label="Specialization"
                                    fullWidth
                                    margin="normal"
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                />
                            </>
                        ) : (
                            <>
                                <TextField
                                    label="Member ID"
                                    fullWidth
                                    margin="normal"
                                    value={formData.member_id}
                                    onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
                                />
                                <TextField
                                    label="Counselor ID"
                                    fullWidth
                                    margin="normal"
                                    value={formData.counselor_id}
                                    onChange={(e) => setFormData({ ...formData, counselor_id: e.target.value })}
                                />
                                <TextField
                                    label="Date"
                                    type="date"
                                    fullWidth
                                    margin="normal"
                                    InputLabelProps={{ shrink: true }}
                                    value={formData.session_date}
                                    onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                                />
                                <TextField
                                    label="Status"
                                    fullWidth
                                    margin="normal"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                />
                                <TextField
                                    label="Notes"
                                    fullWidth
                                    margin="normal"
                                    multiline
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </>
                        )}
                        <Button variant="contained" onClick={handleSave} sx={{ mt: 2 }}>
                            Save
                        </Button>
                    </Box>
                </Modal>
            </main>
        </div>
    );
};

export default CounselingPage;
