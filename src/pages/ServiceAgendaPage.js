import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import '../styles/serviceAgendaPage.css';

const ServiceAgendaPage = () => {
    const [agendas, setAgendas] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAgenda, setNewAgenda] = useState({
        service_date: '',
        title: '',
        description: '',
        start_time: '',
        end_time: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    // Fetch service agendas
    useEffect(() => {
        const fetchAgendas = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/api/service-agenda`);
                if (!response.ok) throw new Error('Failed to fetch service agendas.');
                const data = await response.json();
                setAgendas(data);
            } catch (err) {
                console.error('Error fetching service agendas:', err.message);
                setError('Error fetching agendas. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchAgendas();
    }, [API_BASE_URL]);

    const handleAgendaSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/service-agenda`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAgenda),
            });
            if (!response.ok) throw new Error('Failed to add agenda.');

            const data = await response.json();
            setAgendas((prev) => [...prev, data]);
            setNewAgenda({ service_date: '', title: '', description: '', start_time: '', end_time: '' });
            setIsModalOpen(false);
        } catch (err) {
            console.error('Error adding agenda:', err.message);
            setError('Error adding agenda. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard">
            <TopMenu />
            <Sidebar />
            <main className="service-agenda-page">
                <header className="agenda-header">
                    <h1>Service Agenda</h1>
                    <button className="add-button" onClick={() => setIsModalOpen(true)}>
                        + Add Agenda
                    </button>
                </header>

                <section className="agenda-section">
                    <h2>Upcoming Agendas</h2>
                    {loading ? (
                        <p>Loading agendas...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : (
                        <table className="agenda-table">
                            <thead>
                                <tr>
                                    <th>Service Date</th>
                                    <th>Title</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agendas.map((agenda) => (
                                    <tr key={agenda.id}>
                                        <td>{new Date(agenda.service_date).toLocaleDateString()}</td>
                                        <td>{agenda.title}</td>
                                        <td>{agenda.start_time}</td>
                                        <td>{agenda.end_time}</td>
                                        <td>{agenda.description || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>

                {/* Modal */}
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Add Agenda</h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleAgendaSubmit();
                                }}
                            >
                                <input
                                    type="date"
                                    value={newAgenda.service_date}
                                    onChange={(e) => setNewAgenda({ ...newAgenda, service_date: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={newAgenda.title}
                                    onChange={(e) => setNewAgenda({ ...newAgenda, title: e.target.value })}
                                    required
                                />
                                <textarea
                                    placeholder="Description"
                                    value={newAgenda.description}
                                    onChange={(e) => setNewAgenda({ ...newAgenda, description: e.target.value })}
                                />
                                <input
                                    type="time"
                                    value={newAgenda.start_time}
                                    onChange={(e) => setNewAgenda({ ...newAgenda, start_time: e.target.value })}
                                    required
                                />
                                <input
                                    type="time"
                                    value={newAgenda.end_time}
                                    onChange={(e) => setNewAgenda({ ...newAgenda, end_time: e.target.value })}
                                    required
                                />
                                <div className="modal-actions">
                                    <button type="submit" className="submit-button">
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ServiceAgendaPage;
