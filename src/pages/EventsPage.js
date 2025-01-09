import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import { DataGrid } from '@mui/x-data-grid';
import '../styles/eventsPage.css';

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEvent, setCurrentEvent] = useState({
        id: null,
        name: '',
        date: '',
        description: '',
    });

    // Fetch all events
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('/api/events');
                const data = await response.json();
                setEvents(data);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };
        fetchEvents();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentEvent((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveEvent = async (e) => {
        e.preventDefault();
        try {
            const method = currentEvent.id ? 'PUT' : 'POST';
            const url = currentEvent.id ? `/api/events/${currentEvent.id}` : '/api/events';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentEvent),
            });
            if (response.ok) {
                const updatedEvent = await response.json();
                setEvents((prev) =>
                    currentEvent.id
                        ? prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
                        : [...prev, updatedEvent]
                );
                setIsModalOpen(false);
                setCurrentEvent({ id: null, name: '', date: '', description: '' });
            }
        } catch (error) {
            console.error('Error saving event:', error);
        }
    };

    const handleDeleteEvent = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await fetch(`/api/events/${id}`, { method: 'DELETE' });
                setEvents((prev) => prev.filter((event) => event.id !== id));
            } catch (error) {
                console.error('Error deleting event:', error);
            }
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'date', headerName: 'Date', width: 150 },
        { field: 'description', headerName: 'Description', width: 300 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <div>
                    <button onClick={() => handleEditEvent(params.row)}>Edit</button>
                    <button onClick={() => handleDeleteEvent(params.row.id)}>Delete</button>
                </div>
            ),
        },
    ];

    const handleEditEvent = (event) => {
        setCurrentEvent(event);
        setIsModalOpen(true);
    };

    return (
        <div className="dashboard">
            <TopMenu />
            <Sidebar />
            <main className="events-page">
                <header className="events-header">
                    <h1>Events Management</h1>
                    <button onClick={() => setIsModalOpen(true)}>+ Add Event</button>
                </header>
                <DataGrid rows={events} columns={columns} autoHeight />
                {isModalOpen && (
                    <div className="modal">
                        <form onSubmit={handleSaveEvent}>
                            <input
                                type="text"
                                name="name"
                                placeholder="Event Name"
                                value={currentEvent.name}
                                onChange={handleInputChange}
                                required
                            />
                            <textarea
                                name="description"
                                placeholder="Event Description"
                                value={currentEvent.description}
                                onChange={handleInputChange}
                                required
                            ></textarea>
                            <input
                                type="datetime-local"
                                name="date"
                                value={currentEvent.date}
                                onChange={handleInputChange}
                                required
                            />
                            <button type="submit">Save</button>
                            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default EventsPage;
