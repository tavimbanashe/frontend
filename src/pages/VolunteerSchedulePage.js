import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import '../styles/volunteerSchedulePage.css';

const VolunteerSchedulePage = () => {
    const [schedules, setSchedules] = useState([]);
    const [members, setMembers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formValues, setFormValues] = useState({
        id: null,
        member_id: '',
        event_date: '',
        role: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    // Fetch schedules and members
    useEffect(() => {
        fetchSchedules();
        fetchMembers();
    }, []);

    const fetchSchedules = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/volunteer-schedules`);
            if (!response.ok) throw new Error('Failed to fetch schedules.');
            const data = await response.json();
            setSchedules(data);
        } catch (err) {
            console.error('Error fetching schedules:', err.message);
            setError('Error fetching schedules. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/members`);
            if (!response.ok) throw new Error('Failed to fetch members.');
            const data = await response.json();
            setMembers(data);
        } catch (err) {
            console.error('Error fetching members:', err.message);
            setError('Error fetching members. Please try again.');
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = `${API_BASE_URL}/volunteer-schedules`;
        const method = formValues.id ? 'PUT' : 'POST';
        const finalUrl = formValues.id ? `${url}/${formValues.id}` : url;

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(finalUrl, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formValues),
            });
            if (!response.ok) throw new Error('Failed to save schedule.');
            await fetchSchedules(); // Refresh the list
            setIsModalOpen(false);
            setFormValues({ id: null, member_id: '', event_date: '', role: '', notes: '' });
        } catch (err) {
            console.error('Error saving schedule:', err.message);
            setError('Error saving schedule. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (schedule) => {
        setFormValues(schedule);
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormValues({ id: null, member_id: '', event_date: '', role: '', notes: '' });
    };

    return (
        <div className="dashboard">
            <Sidebar />
            <div className="main-content">
                <TopMenu />
                <header className="schedule-header">
                    <h1>Volunteer Schedules</h1>
                    <button onClick={() => setIsModalOpen(true)} className="add-button">
                        + Add Schedule
                    </button>
                </header>

                <section className="schedule-content">
                    {loading ? (
                        <p>Loading schedules...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : (
                        <table className="schedule-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Date</th>
                                    <th>Role</th>
                                    <th>Notes</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedules.map((schedule) => (
                                    <tr key={schedule.id}>
                                        <td>
                                            {members.find((m) => m.id === schedule.member_id)?.first_name || 'Unknown'}{' '}
                                            {members.find((m) => m.id === schedule.member_id)?.last_name || ''}
                                        </td>
                                        <td>{schedule.event_date}</td>
                                        <td>{schedule.role}</td>
                                        <td>{schedule.notes || 'N/A'}</td>
                                        <td>
                                            <button onClick={() => handleEdit(schedule)} className="edit-button">
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>

                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>{formValues.id ? 'Edit Schedule' : 'Add Schedule'}</h2>
                            <form onSubmit={handleSubmit}>
                                <label>Member</label>
                                <select
                                    name="member_id"
                                    value={formValues.member_id}
                                    onChange={handleFormChange}
                                    required
                                >
                                    <option value="">Select Member</option>
                                    {members.map((member) => (
                                        <option key={member.id} value={member.id}>
                                            {`${member.first_name} ${member.last_name}`}
                                        </option>
                                    ))}
                                </select>
                                <label>Date</label>
                                <input
                                    type="date"
                                    name="event_date"
                                    value={formValues.event_date}
                                    onChange={handleFormChange}
                                    required
                                />
                                <label>Role</label>
                                <input
                                    type="text"
                                    name="role"
                                    value={formValues.role}
                                    onChange={handleFormChange}
                                    placeholder="Role"
                                    required
                                />
                                <label>Notes</label>
                                <textarea
                                    name="notes"
                                    value={formValues.notes}
                                    onChange={handleFormChange}
                                    placeholder="Notes"
                                />
                                <div className="modal-actions">
                                    <button type="submit" className="submit-button">
                                        Save
                                    </button>
                                    <button type="button" className="cancel-button" onClick={handleCancel}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VolunteerSchedulePage;
