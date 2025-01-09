import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import '../styles/volunteerSchedulePage.css';

// API Base URL from the environment variable
const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000'; // Default to localhost for development

const VolunteerSchedulePage = () => {
    const [schedules, setSchedules] = useState([]);
    const [members, setMembers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formValues, setFormValues] = useState({
        member_id: '',
        event_date: '',
        role: '',
        notes: '',
    });

    useEffect(() => {
        fetchSchedules();
        fetchMembers();
    }, []);

    const fetchSchedules = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/volunteer-schedules`);
            const data = await response.json();
            setSchedules(data);
        } catch (error) {
            console.error('Error fetching schedules:', error);
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

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const url = `${API_BASE_URL}/api/volunteer-schedules`;
        const method = formValues.id ? 'PUT' : 'POST';
        const finalUrl = formValues.id ? `${url}/${formValues.id}` : url;

        try {
            const response = await fetch(finalUrl, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formValues),
            });
            if (response.ok) {
                fetchSchedules();
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Error saving schedule:', error);
        }
    };

    return (
        <div className="dashboard">
            <Sidebar />
            <div className="main-content">
                <TopMenu />
                <header className="schedule-header">
                    <h1>Volunteer Schedules</h1>
                    <button onClick={() => setIsModalOpen(true)}>+ Add Schedule</button>
                </header>
                <table className="schedule-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Date</th>
                            <th>Role</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.map((schedule) => (
                            <tr key={schedule.id}>
                                <td>{`${schedule.first_name} ${schedule.last_name}`}</td>
                                <td>{schedule.event_date}</td>
                                <td>{schedule.role}</td>
                                <td>{schedule.notes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Add/Edit Schedule</h2>
                            <select
                                name="member_id"
                                value={formValues.member_id}
                                onChange={handleFormChange}
                            >
                                <option value="">Select Member</option>
                                {members.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {`${member.first_name} ${member.last_name}`}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="date"
                                name="event_date"
                                value={formValues.event_date}
                                onChange={handleFormChange}
                            />
                            <input
                                type="text"
                                name="role"
                                value={formValues.role}
                                onChange={handleFormChange}
                                placeholder="Role"
                            />
                            <textarea
                                name="notes"
                                value={formValues.notes}
                                onChange={handleFormChange}
                                placeholder="Notes"
                            />
                            <button onClick={handleSubmit}>Save</button>
                            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VolunteerSchedulePage;
