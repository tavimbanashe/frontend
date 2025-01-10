import React, { useState } from 'react';
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
        ...initialData,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = `${process.env.REACT_APP_API_BASE_URL}/members${formData.id ? `/${formData.id}` : ''}`;
            const method = formData.id ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    date_of_birth: formData.date_of_birth,
                    gender_id: formData.gender_id,
                    member_type_id: formData.member_type_id,
                    group_id: formData.group_id,
                    department_id: formData.department_id,
                    notes: formData.notes,
                    profile_picture_url: formData.profile_picture_url,
                }),
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(errorResponse.message || "Failed to save member.");
            }

            const result = await response.json();
            setSnackbar({
                open: true,
                message: `Member ${formData.id ? 'updated' : 'added'} successfully!`,
                severity: 'success',
            });

            onSubmit(result); // Pass the result to the parent component
            onClose();
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
                        placeholder="Select the date of birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                    />

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

                    <textarea
                        name="notes"
                        placeholder="Add any additional notes about the member"
                        value={formData.notes}
                        onChange={handleChange}
                    ></textarea>

                    <input
                        type="text"
                        name="profile_picture_url"
                        placeholder="Enter profile picture URL (optional)"
                        value={formData.profile_picture_url}
                        onChange={handleChange}
                    />

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
