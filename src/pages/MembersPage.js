import React, { useState, useEffect, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import MemberForm from '../components/Members/MemberForm';
import { IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Snackbar, Alert } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { FaEdit, FaTrash } from 'react-icons/fa';
import '../styles/members.css';

const MembersPage = () => {
    const [members, setMembers] = useState([]);
    const [dropdownData, setDropdownData] = useState({
        genders: [],
        memberTypes: [],
        groups: [],
        departments: [],
    });
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/members');
            const data = await response.json();
            setMembers(data);
        } catch (error) {
            setError('Error fetching members');
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const response = await fetch('/api/members/dropdowns');
            const data = await response.json();
            setDropdownData(data);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        }
    };

    useEffect(() => {
        fetchMembers();
        fetchDropdownData();
    }, []);

    const filteredMembers = useMemo(() => {
        return members.filter((member) =>
            [member.first_name, member.last_name, member.email]
                .some((field) =>
                    field?.toLowerCase().includes(searchQuery.toLowerCase())
                )
        );
    }, [members, searchQuery]);

    const rows = filteredMembers.map((member) => ({
        id: member.id,
        name: `${member.first_name} ${member.last_name}`,
        email: member.email,
        phone: member.phone,
        gender: dropdownData.genders.find((g) => g.id === member.gender_id)?.name || 'N/A',
        member_type: dropdownData.memberTypes.find((t) => t.id === member.member_type_id)?.name || 'N/A',
        group: dropdownData.groups.find((g) => g.id === member.group_id)?.name || 'N/A',
        department: dropdownData.departments.find((d) => d.id === member.department_id)?.name || 'N/A',
    }));

    const handleAddMember = () => {
        setEditingMember(null);
        setIsFormOpen(true);
    };

    const handleEditMember = (member) => {
        setEditingMember(member);
        setIsFormOpen(true);
    };

    const handleOpenDialog = (memberId) => {
        setMemberToDelete(memberId);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setMemberToDelete(null);
    };

    const handleDeleteMember = async () => {
        try {
            const response = await fetch(`/api/members/${memberToDelete}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Failed to delete member');
            }
            setSnackbarMessage('Member deleted successfully!');
            setSnackbarOpen(true);
            fetchMembers();
        } catch (error) {
            setSnackbarMessage('Error deleting member');
            setSnackbarOpen(true);
            console.error(error.message);
        } finally {
            handleCloseDialog();
        }
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        fetchMembers();
    };

    const handleClearSearch = () => setSearchQuery('');

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
        setSnackbarMessage('');
    };

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="main-content">
                <TopMenu />
                <header className="members-header">
                    <h1>Members</h1>
                    <div className="search-container">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search members"
                        />
                        {searchQuery && (
                            <Tooltip title="Clear Search">
                                <IconButton onClick={handleClearSearch}>
                                    <span style={{ fontSize: '1.5em', cursor: 'pointer' }}>✖</span>
                                </IconButton>
                            </Tooltip>
                        )}
                        <Tooltip title="Add Member">
                            <IconButton onClick={handleAddMember}>
                                <AddCircleOutlineIcon color="primary" fontSize="large" />
                            </IconButton>
                        </Tooltip>
                    </div>
                </header>
                <section className="members-content">
                    {loading ? (
                        <p>Loading members...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : (
                        <div style={{ height: 600, width: '100%' }}>
                            <DataGrid
                                rows={rows}
                                columns={[
                                    { field: 'id', headerName: 'ID', width: 80 },
                                    { field: 'name', headerName: 'Name', width: 180 },
                                    { field: 'email', headerName: 'Email', width: 200 },
                                    { field: 'phone', headerName: 'Phone', width: 150 },
                                    { field: 'gender', headerName: 'Gender', width: 150 },
                                    { field: 'member_type', headerName: 'Member Type', width: 150 },
                                    { field: 'group', headerName: 'Group', width: 150 },
                                    { field: 'department', headerName: 'Department', width: 150 },
                                    {
                                        field: 'actions',
                                        headerName: 'Actions',
                                        width: 150,
                                        renderCell: (params) => (
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <Tooltip title="Edit">
                                                    <IconButton onClick={() => handleEditMember(params.row)}>
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
                                ]}
                                pageSize={10}
                                checkboxSelection
                                disableSelectionOnClick
                            />
                        </div>
                    )}
                </section>
                {isFormOpen && (
                    <MemberForm
                        initialData={editingMember}
                        onClose={handleFormClose}
                        dropdownData={dropdownData}
                    />
                )}
                <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
                    <DialogTitle>
                        <Typography variant="h6">Confirm Deletion</Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete this member? This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="secondary" variant="outlined">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteMember} color="primary" variant="contained">
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

export default MembersPage;
