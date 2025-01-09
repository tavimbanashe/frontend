import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import '../styles/attendancePage.css';

const AttendancePage = () => {
    const [events, setEvents] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);

    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

    const [newEvent, setNewEvent] = useState({
        name: '',
        date: '',
        description: '',
    });

    const [newAttendance, setNewAttendance] = useState({
        member_id: '',
        event_id: '',
        date: '',
        status: '',
        notes: '',
    });

    const [members, setMembers] = useState([]);

    // Fetch events, attendance, and members
    useEffect(() => {
        const fetchData = async () => {
            try {
                const eventsResponse = await fetch(`${API_BASE_URL}/api/attendance/events`);
                const attendanceResponse = await fetch(`${API_BASE_URL}/api/attendance/records`);
                const membersResponse = await fetch(`${API_BASE_URL}/api/members`);
                setEvents(await eventsResponse.json());
                setAttendanceRecords(await attendanceResponse.json());
                setMembers(await membersResponse.json());
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const handleEventSubmit = async () => {
        try {
            const response = await fetch((`${API_BASE_URL}/api/attendance/events`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEvent),
            });
            const data = await response.json();
            if (response.ok) {
                setEvents((prev) => [...prev, data]);
                setNewEvent({ name: '', date: '', description: '' });
                setIsEventModalOpen(false);
            } else {
                console.error('Error adding event:', data.message);
            }
        } catch (error) {
            console.error('Error adding event:', error);
        }
    };

    const handleAttendanceSubmit = async () => {
        try {
            const response = await fetch((`${API_BASE_URL}/api/attendance/records`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAttendance),
            });
            const data = await response.json();
            if (response.ok) {
                setAttendanceRecords((prev) => [...prev, data]);
                setNewAttendance({ member_id: '', event_id: '', date: '', status: '', notes: '' });
                setIsAttendanceModalOpen(false);
            } else {
                console.error('Error adding attendance:', data.message);
            }
        } catch (error) {
            console.error('Error adding attendance:', error);
        }
    };

    return (
        <div className="dashboard">
            <TopMenu />
            <Sidebar />
            <main className="attendance-page">
                <header className="attendance-header">
                    <h1>Attendance Management</h1>
                    <div className="attendance-actions">
                        <button className="add-button" onClick={() => setIsEventModalOpen(true)}>
                            + Add Event
                        </button>
                        <button className="add-button" onClick={() => setIsAttendanceModalOpen(true)}>
                            + Add Attendance
                        </button>
                    </div>
                </header>

                <section className="events-section">
                    <h2>Events</h2>
                    <table className="attendance-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Date</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((event) => (
                                <tr key={event.id}>
                                    <td>{event.name}</td>
                                    <td>{new Date(event.date).toLocaleDateString()}</td>
                                    <td>{event.description || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <section className="attendance-section">
                    <h2>Attendance Records</h2>
                    <table className="attendance-table">
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Event</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceRecords.map((record) => (
                                <tr key={record.id}>
                                    <td>{record.member_name}</td>
                                    <td>{record.event_name || 'General'}</td>
                                    <td>{new Date(record.date).toLocaleDateString()}</td>
                                    <td>{record.status}</td>
                                    <td>{record.notes || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* Event Modal */}
                {isEventModalOpen && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>Add Event</h2>
                            <input
                                type="text"
                                placeholder="Event Name"
                                value={newEvent.name}
                                onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                            />
                            <input
                                type="date"
                                value={newEvent.date}
                                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                            />
                            <textarea
                                placeholder="Description"
                                value={newEvent.description}
                                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                            />
                            <button onClick={handleEventSubmit}>Save</button>
                            <button onClick={() => setIsEventModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                {/* Attendance Modal */}
                {isAttendanceModalOpen && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>Add Attendance</h2>
                            <select
                                value={newAttendance.member_id}
                                onChange={(e) => setNewAttendance({ ...newAttendance, member_id: e.target.value })}
                            >
                                <option value="">Select Member</option>
                                {members.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {`${member.first_name} ${member.last_name}`}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={newAttendance.event_id}
                                onChange={(e) => setNewAttendance({ ...newAttendance, event_id: e.target.value })}
                            >
                                <option value="">Select Event</option>
                                {events.map((event) => (
                                    <option key={event.id} value={event.id}>
                                        {event.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="date"
                                value={newAttendance.date}
                                onChange={(e) => setNewAttendance({ ...newAttendance, date: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Status"
                                value={newAttendance.status}
                                onChange={(e) => setNewAttendance({ ...newAttendance, status: e.target.value })}
                            />
                            <textarea
                                placeholder="Notes"
                                value={newAttendance.notes}
                                onChange={(e) => setNewAttendance({ ...newAttendance, notes: e.target.value })}
                            />
                            <button onClick={handleAttendanceSubmit}>Save</button>
                            <button onClick={() => setIsAttendanceModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AttendancePage;
