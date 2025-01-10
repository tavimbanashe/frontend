import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import '../../styles/memberForm.css';

const MemberForm = ({ onClose, initialData = {}, dropdownData = {}, onSubmit }) => {
    const { genders = [], memberTypes = [], groups = [], departments = [] } = dropdownData;

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        date_of_birth: '',
        gender_id: '',
        member_type_id: '',
        group_id: '',
        department_id: '',
        notes: '',
        profile_picture_url: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });

    // Load initial data into the form
    useEffect(() => {
        if (initialData) {
            setFormData((prevData) => ({ ...prevData, ...initialData }));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const method = formData.id ? 'PUT' : 'POST';
            const url = `/api/members${formData.id ? `/${formData.id}` : ''}`;
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const result = await response.json();
                setSnackbar({ open: true, message: 'Member saved successfully!', severity: 'success' });
                onSubmit?.(result); // Optional callback for parent component
                onClose(); // Close the form after a successful save
            } else {
                const errorResponse = await response.json();
                throw new Error(errorResponse.message || 'An error occurred while saving');
            }
        } catch (error) {
            console.error('Error saving member:', error.message);
            setSnackbar({ open: true, message: error.message, severity: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ open: false, message: '', severity: '' });
    };

    return (
        <div className="member-form-overlay">
            <div className="member-form">
                <h2>{formData.id ? 'Edit Member' : 'Add Member'}</h2>
                <form onSubmit={handleSubmit}>
                    {/* Text Inputs */}
                    <input
                        type="text"
                        name="first_name"
                        placeholder="Enter the first name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="last_name"
                        placeholder="Enter the last name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter a valid email address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="phone"
                        placeholder="Enter the phone number"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    <textarea
                        name="address"
                        placeholder="Enter the address"
                        value={formData.address}
                        onChange={handleChange}
                    ></textarea>
                    <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                    />

                    {/* Dropdown Selects */}
                    <select
                        name="gender_id"
                        value={formData.gender_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Gender</option>
                        {genders.map((gender) => (
                            <option key={gender.id} value={gender.id}>
                                {gender.name}
                            </option>
                        ))}
                    </select>

                    <select
                        name="member_type_id"
                        value={formData.member_type_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Member Type</option>
                        {memberTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </select>

                    <select
                        name="group_id"
                        value={formData.group_id}
                        onChange={handleChange}
                    >
                        <option value="">Select Group</option>
                        {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))}
                    </select>

                    <select
                        name="department_id"
                        value={formData.department_id}
                        onChange={handleChange}
                    >
                        <option value="">Select Department</option>
                        {departments.map((department) => (
                            <option key={department.id} value={department.id}>
                                {department.name}
                            </option>
                        ))}
                    </select>

                    {/* Notes */}
                    <textarea
                        name="notes"
                        placeholder="Add any additional notes about the member"
                        value={formData.notes}
                        onChange={handleChange}
                    ></textarea>

                    {/* Profile Picture */}
                    <input
                        type="text"
                        name="profile_picture_url"
                        placeholder="Enter profile picture URL (optional)"
                        value={formData.profile_picture_url}
                        onChange={handleChange}
                    />

                    {/* Submit and Cancel Buttons */}
                    <div className="form-buttons">
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : formData.id ? 'Update Member' : 'Add Member'}
                        </button>
                        <button type="button" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            {/* Snackbar Notifications */}
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

export default MemberForm;
