import React, { useState, useEffect } from 'react';
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

    // Fetch roles and permissions
    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await fetch('/api/roles-permissions/roles');
            const data = await response.json();
            setRoles(data.map((role) => ({ ...role, id: role.role_id })));
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const handleRoleSelect = async (roleId) => {
        setSelectedRole(roleId);
        try {
            const response = await fetch(`/api/roles-permissions/role-permissions/${roleId}`);
            const data = await response.json();
            setRolePermissions(data.map((permission, index) => ({ ...permission, id: index })));
        } catch (error) {
            console.error('Error fetching role permissions:', error);
        }
    };

    const handleAddOrEditRole = async () => {
        const method = editMode ? 'PUT' : 'POST';
        const url = editMode
            ? `/api/roles-permissions/roles/${roleForm.role_id}`
            : '/api/roles-permissions/roles';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role_name: roleForm.role_name }),
            });

            if (response.ok) {
                fetchRoles();
                setIsRoleModalOpen(false);
                setRoleForm({ role_id: null, role_name: '' });
                setEditMode(false);
            } else {
                console.error('Error saving role.');
            }
        } catch (error) {
            console.error('Error saving role:', error);
        }
    };

    const handleDeleteRole = async (roleId) => {
        if (!window.confirm('Are you sure you want to delete this role?')) return;

        try {
            const response = await fetch(`/api/roles-permissions/roles/${roleId}`, { method: 'DELETE' });
            if (response.ok) {
                fetchRoles();
                if (selectedRole === roleId) {
                    setSelectedRole(null);
                    setRolePermissions([]);
                }
            } else {
                console.error('Error deleting role.');
            }
        } catch (error) {
            console.error('Error deleting role:', error);
        }
    };

    const handleAddPermission = async () => {
        if (!selectedRole || !newPermission) return;

        try {
            const response = await fetch('/api/roles-permissions/role-permissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role_id: selectedRole, permission_name: newPermission }),
            });

            if (response.ok) {
                handleRoleSelect(selectedRole); // Refresh permissions for the selected role
                setIsPermissionModalOpen(false);
                setNewPermission('');
            } else {
                console.error('Error adding permission.');
            }
        } catch (error) {
            console.error('Error adding permission:', error);
        }
    };

    const handleDeletePermission = async (permissionId) => {
        if (!window.confirm('Are you sure you want to remove this permission?')) return;

        try {
            const response = await fetch(`/api/roles-permissions/role-permissions/${permissionId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                handleRoleSelect(selectedRole);
            } else {
                console.error('Error deleting permission.');
            }
        } catch (error) {
            console.error('Error deleting permission:', error);
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
                    <div style={{ height: 400, width: '100%' }}>
                        <DataGrid
                            rows={roles}
                            columns={roleColumns}
                            pageSize={5}
                            rowsPerPageOptions={[5, 10, 20]}
                            onRowClick={(params) => handleRoleSelect(params.row.role_id)}
                        />
                    </div>
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
