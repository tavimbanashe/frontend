import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import '../styles/attendanceRecordsPage.css';

const AttendanceRecordsPage = () => {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [members, setMembers] = useState([]);
    const [formValues, setFormValues] = useState({
        member_id: '',
        service_date: '',
        attended: false,
        notes: '',
    });

    useEffect(() => {
        fetchAttendanceRecords();
        fetchMembers();
    }, []);

    const fetchAttendanceRecords = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/attendance`);
            const data = await response.json();
            setAttendanceRecords(data);
        } catch (error) {
            console.error('Error fetching attendance records:', error);
        }
    };

    const fetchMembers = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/members`);
            const data = await response.json();
            setMembers(data);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredRecords = attendanceRecords.filter(
        (record) =>
            record.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.service_date.includes(searchQuery)
    );

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: name === 'attended' ? e.target.checked : value,
        }));
    };

    const handleAddRecord = () => {
        setEditingRecord(null);
        setFormValues({
            member_id: '',
            service_date: '',
            attended: false,
            notes: '',
        });
        setIsModalOpen(true);
    };

    const handleEditRecord = (record) => {
        setEditingRecord(record.id);
        setFormValues({
            member_id: record.member_id,
            service_date: record.service_date,
            attended: record.attended,
            notes: record.notes,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        const method = editingRecord ? 'PUT' : 'POST';
        const url = editingRecord
            ? `${process.env.REACT_APP_API_BASE_URL}/api/attendance/${editingRecord}`
            : `${process.env.REACT_APP_API_BASE_URL}/api/attendance`;
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formValues),
            });
            if (response.ok) {
                fetchAttendanceRecords();
                setIsModalOpen(false);
            } else {
                console.error('Error saving attendance record');
            }
        } catch (error) {
            console.error('Error saving attendance record:', error);
        }
    };

    const handleDeleteRecord = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/attendance/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    fetchAttendanceRecords();
                }
            } catch (error) {
                console.error('Error deleting attendance record:', error);
            }
        }
    };

    return (
        <div className="dashboard">
            <Sidebar />
            <div className="main-content">
                <TopMenu />
                <header className="attendance-header">
                    <h1>Attendance Records</h1>
                    <div className="actions">
                        <input
                            type="text"
                            placeholder="Search by name or date"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        <button onClick={handleAddRecord}>+ Add Record</button>
                    </div>
                </header>
                <table className="attendance-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Date</th>
                            <th>Attended</th>
                            <th>Notes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecords.map((record) => (
                            <tr key={record.id}>
                                <td>{`${record.first_name} ${record.last_name}`}</td>
                                <td>{record.service_date}</td>
                                <td>{record.attended ? 'Yes' : 'No'}</td>
                                <td>{record.notes}</td>
                                <td>
                                    <button onClick={() => handleEditRecord(record)}>Edit</button>
                                    <button onClick={() => handleDeleteRecord(record.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {isModalOpen && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>{editingRecord ? 'Edit Attendance Record' : 'Add Attendance Record'}</h2>
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
                            <input
                                type="date"
                                name="service_date"
                                value={formValues.service_date}
                                onChange={handleFormChange}
                                required
                            />
                            <label>
                                <input
                                    type="checkbox"
                                    name="attended"
                                    checked={formValues.attended}
                                    onChange={handleFormChange}
                                />
                                Attended
                            </label>
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

export default AttendanceRecordsPage;
