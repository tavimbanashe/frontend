import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import '../styles/calendarPage.css';
import Modal from '@mui/material/Modal';
import { Box, Button, TextField, Typography } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
};

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalEvent, setModalEvent] = useState({
        title: '',
        description: '',
        start_date: null,
        end_date: null,
    });

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('/api/calendar/events');
                const data = await response.json();
                const formattedEvents = data.map((event) => ({
                    id: event.id,
                    title: event.title,
                    start: new Date(event.start_date),
                    end: new Date(event.end_date),
                    description: event.description,
                }));
                setEvents(formattedEvents);
            } catch (error) {
                console.error('Error fetching calendar events:', error);
            }
        };
        fetchEvents();
    }, []);

    const handleModalSave = async () => {
        if (!modalEvent.start_date || !modalEvent.end_date) {
            alert('Please select valid start and end dates.');
            return;
        }

        try {
            const response = await fetch('/api/calendar/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(modalEvent),
            });

            if (response.ok) {
                const savedEvent = await response.json();
                setEvents((prevEvents) => [
                    ...prevEvents,
                    {
                        id: savedEvent.id,
                        title: savedEvent.title,
                        start: new Date(savedEvent.start_date),
                        end: new Date(savedEvent.end_date),
                        description: savedEvent.description,
                    },
                ]);
                setIsModalOpen(false);
                setModalEvent({
                    title: '',
                    description: '',
                    start_date: null,
                    end_date: null,
                });
            } else {
                console.error('Error saving event:', await response.text());
            }
        } catch (error) {
            console.error('Error saving event:', error);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleSlotSelect = (slotInfo) => {
        setModalEvent({
            title: '',
            description: '',
            start_date: null,
            end_date: null,
        });
        setIsModalOpen(true);
    };

    const eventPropGetter = () => ({
        style: {
            backgroundColor: '#0073e6',
            color: '#fff',
            borderRadius: '5px',
            padding: '5px',
        },
    });

    return (
        <div className="dashboard">
            <TopMenu />
            <Sidebar />
            <main className="calendar-page">
                <h1>Church Calendar</h1>
                <div className="calendar-container">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        selectable
                        onSelectSlot={handleSlotSelect}
                        style={{ height: 700, margin: '20px auto', maxWidth: '90%' }}
                        eventPropGetter={eventPropGetter}
                    />
                </div>

                {/* Modal for adding new events */}
                <Modal open={isModalOpen} onClose={handleModalClose}>
                    <Box sx={modalStyle}>
                        <Typography variant="h6" component="h2" gutterBottom>
                            Add Event
                        </Typography>
                        <TextField
                            fullWidth
                            label="Title"
                            value={modalEvent.title}
                            onChange={(e) =>
                                setModalEvent({ ...modalEvent, title: e.target.value })
                            }
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            value={modalEvent.description}
                            onChange={(e) =>
                                setModalEvent({ ...modalEvent, description: e.target.value })
                            }
                            margin="normal"
                            multiline
                            rows={3}
                        />
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateTimePicker
                                label="Start Date"
                                value={modalEvent.start_date}
                                onChange={(date) =>
                                    setModalEvent({ ...modalEvent, start_date: date })
                                }
                                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                            />
                            <DateTimePicker
                                label="End Date"
                                value={modalEvent.end_date}
                                onChange={(date) =>
                                    setModalEvent({ ...modalEvent, end_date: date })
                                }
                                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                            />
                        </LocalizationProvider>
                        <Box mt={2} display="flex" justifyContent="space-between">
                            <Button variant="contained" color="primary" onClick={handleModalSave}>
                                Save
                            </Button>
                            <Button variant="outlined" onClick={handleModalClose}>
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                </Modal>
            </main>
        </div>
    );
};

export default CalendarPage;
