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

    // Fetch service agendas
    useEffect(() => {
        const fetchAgendas = async () => {
            try {
                const response = await fetch('/api/service-agenda');
                const data = await response.json();
                setAgendas(data);
            } catch (error) {
                console.error('Error fetching service agendas:', error);
            }
        };
        fetchAgendas();
    }, []);

    const handleAgendaSubmit = async () => {
        try {
            const response = await fetch('/api/service-agenda', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAgenda),
            });
            const data = await response.json();
            if (response.ok) {
                setAgendas((prev) => [...prev, data]);
                setNewAgenda({ service_date: '', title: '', description: '', start_time: '', end_time: '' });
                setIsModalOpen(false);
            } else {
                console.error('Error adding agenda:', data.message);
            }
        } catch (error) {
            console.error('Error adding agenda:', error);
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
                </section>

                {/* Modal */}
                {isModalOpen && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>Add Agenda</h2>
                            <input
                                type="date"
                                value={newAgenda.service_date}
                                onChange={(e) => setNewAgenda({ ...newAgenda, service_date: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Title"
                                value={newAgenda.title}
                                onChange={(e) => setNewAgenda({ ...newAgenda, title: e.target.value })}
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
                            />
                            <input
                                type="time"
                                value={newAgenda.end_time}
                                onChange={(e) => setNewAgenda({ ...newAgenda, end_time: e.target.value })}
                            />
                            <button onClick={handleAgendaSubmit}>Save</button>
                            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ServiceAgendaPage;
