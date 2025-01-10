import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton, TextField, Button } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import '../styles/rolesPermissionsPage.css';

const RolesPermissionsPage = () => {
    const [roles, setRoles] = useState([]);
    const [rolePermissions, setRolePermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [roleForm, setRoleForm] = useState({ role_id: null, role_name: '' });
    const [newPermission, setNewPermission] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    // Memoize fetchRoles to avoid unnecessary re-renders
    const fetchRoles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/roles-permissions/roles`);
            if (!response.ok) throw new Error('Failed to fetch roles.');
            const data = await response.json();
            setRoles(data.map((role) => ({ ...role, id: role.role_id })));
        } catch (err) {
            console.error(err.message);
            setError('Error fetching roles. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    // Fetch roles on component mount
    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const fetchPermissions = async (roleId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/roles-permissions/role-permissions/${roleId}`);
            if (!response.ok) throw new Error('Failed to fetch permissions.');
            const data = await response.json();
            setRolePermissions(data.map((permission, index) => ({ ...permission, id: index })));
        } catch (err) {
            console.error(err.message);
            setError('Error fetching permissions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSelect = async (roleId) => {
        setSelectedRole(roleId);
        await fetchPermissions(roleId);
    };

    const handleAddOrEditRole = async () => {
        const method = editMode ? 'PUT' : 'POST';
        const url = editMode
            ? `${API_BASE_URL}/api/roles-permissions/roles/${roleForm.role_id}`
            : `${API_BASE_URL}/api/roles-permissions/roles`;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role_name: roleForm.role_name }),
            });

            if (!response.ok) throw new Error('Failed to save role.');

            await fetchRoles();
            setIsRoleModalOpen(false);
            setRoleForm({ role_id: null, role_name: '' });
            setEditMode(false);
        } catch (err) {
            console.error(err.message);
            setError('Error saving role. Please try again.');
        }
    };

    const handleDeleteRole = async (roleId) => {
        if (!window.confirm('Are you sure you want to delete this role?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/roles-permissions/roles/${roleId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete role.');

            await fetchRoles();
            if (selectedRole === roleId) {
                setSelectedRole(null);
                setRolePermissions([]);
            }
        } catch (err) {
            console.error(err.message);
            setError('Error deleting role. Please try again.');
        }
    };

    const handleAddPermission = async () => {
        if (!selectedRole || !newPermission) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/roles-permissions/role-permissions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role_id: selectedRole, permission_name: newPermission }),
            });

            if (!response.ok) throw new Error('Failed to add permission.');

            await fetchPermissions(selectedRole);
            setIsPermissionModalOpen(false);
            setNewPermission('');
        } catch (err) {
            console.error(err.message);
            setError('Error adding permission. Please try again.');
        }
    };

    const handleDeletePermission = async (permissionId) => {
        if (!window.confirm('Are you sure you want to remove this permission?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/roles-permissions/role-permissions/${permissionId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete permission.');

            await fetchPermissions(selectedRole);
        } catch (err) {
            console.error(err.message);
            setError('Error deleting permission. Please try again.');
        }
    };

    const roleColumns = [
        { field: 'role_id', headerName: 'Role ID', width: 100 },
        { field: 'role_name', headerName: 'Role Name', width: 200 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <div>
                    <IconButton
                        color="primary"
                        onClick={() => {
                            setRoleForm(params.row);
                            setEditMode(true);
                            setIsRoleModalOpen(true);
                        }}
                    >
                        <Edit />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => handleDeleteRole(params.row.role_id)}>
                        <Delete />
                    </IconButton>
                </div>
            ),
        },
    ];

    const permissionColumns = [
        { field: 'permission_name', headerName: 'Permission Name', width: 250 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <IconButton color="secondary" onClick={() => handleDeletePermission(params.row.id)}>
                    <Delete />
                </IconButton>
            ),
        },
    ];

    return (
        <div className="dashboard">
            <TopMenu />
            <Sidebar />
            <main className="roles-permissions-page">
                <header>
                    <h1>Roles & Permissions</h1>
                </header>

                <section className="roles-grid">
                    <h2>Roles</h2>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            setIsRoleModalOpen(true);
                            setEditMode(false);
                            setRoleForm({ role_id: null, role_name: '' });
                        }}
                    >
                        + Add Role
                    </Button>
                    {loading ? (
                        <p>Loading roles...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : (
                        <div style={{ height: 400, width: '100%' }}>
                            <DataGrid
                                rows={roles}
                                columns={roleColumns}
                                pageSize={5}
                                rowsPerPageOptions={[5, 10, 20]}
                                onRowClick={(params) => handleRoleSelect(params.row.role_id)}
                            />
                        </div>
                    )}
                </section>

                <section className="permissions-grid">
                    <h2>Permissions for Selected Role</h2>
                    {selectedRole && (
                        <>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setIsPermissionModalOpen(true)}
                            >
                                + Add Permission
                            </Button>
                            <div style={{ height: 400, width: '100%' }}>
                                <DataGrid
                                    rows={rolePermissions}
                                    columns={permissionColumns}
                                    pageSize={5}
                                    rowsPerPageOptions={[5, 10, 20]}
                                />
                            </div>
                        </>
                    )}
                </section>

                {/* Role Modal */}
                {isRoleModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>{editMode ? 'Edit Role' : 'Add Role'}</h2>
                            <TextField
                                label="Role Name"
                                value={roleForm.role_name}
                                onChange={(e) => setRoleForm({ ...roleForm, role_name: e.target.value })}
                                fullWidth
                            />
                            <div className="modal-actions">
                                <Button variant="contained" color="primary" onClick={handleAddOrEditRole}>
                                    Save
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => setIsRoleModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Permission Modal */}
                {isPermissionModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Add Permission</h2>
                            <TextField
                                label="Permission Name"
                                value={newPermission}
                                onChange={(e) => setNewPermission(e.target.value)}
                                fullWidth
                            />
                            <div className="modal-actions">
                                <Button variant="contained" color="primary" onClick={handleAddPermission}>
                                    Save
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => setIsPermissionModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default RolesPermissionsPage;
