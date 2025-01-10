import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import { DataGrid } from '@mui/x-data-grid';
import '../styles/servicePlanningPage.css';

const ServicePlanningPage = () => {
    const [services, setServices] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newService, setNewService] = useState({
        name: '',
        date: '',
        time: '',
        description: '',
    });

    // Fetch services from the backend
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('/api/service-planning');
                const data = await response.json();
                setServices(data);
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };
        fetchServices();
    }, []);

    // Handle Add Service Button Click
    const handleAddService = () => {
        setIsModalOpen(true);
    };

    // Handle Modal Close
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setNewService({
            name: '',
            date: '',
            time: '',
            description: '',
        });
    };

    // Handle Input Change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewService((prev) => ({ ...prev, [name]: value }));
    };

    // Handle Form Submission
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/service-planning', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newService),
            });
            if (response.ok) {
                const addedService = await response.json();
                setServices((prev) => [...prev, addedService]);
                handleCloseModal();
            } else {
                console.error('Failed to add service');
            }
        } catch (error) {
            console.error('Error adding service:', error);
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'name', headerName: 'Service Name', width: 200 },
        { field: 'date', headerName: 'Date', width: 150 },
        { field: 'time', headerName: 'Time', width: 150 },
        { field: 'description', headerName: 'Description', width: 300 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <div>
                    <button
                        className="edit-button"
                        onClick={() => console.log('Edit:', params.row)}
                    >
                        Edit
                    </button>
                    <button
                        className="delete-button"
                        onClick={() => console.log('Delete:', params.row)}
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="dashboard">
            <TopMenu />
            <Sidebar />
            <main className="service-planning-page">
                <header className="service-planning-header">
                    <h1>Service Planning</h1>
                    <button className="add-button" onClick={handleAddService}>
                        + Add Service
                    </button>
                </header>

                <div className="service-table">
                    <DataGrid
                        rows={services}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5, 10, 20]}
                        autoHeight
                        disableSelectionOnClick
                    />
                </div>

                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-box">
                            <h2>Add New Service</h2>
                            <form onSubmit={handleFormSubmit}>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Service Name"
                                    value={newService.name}
                                    onChange={handleInputChange}
                                    required
                                />
                                <input
                                    type="date"
                                    name="date"
                                    value={newService.date}
                                    onChange={handleInputChange}
                                    required
                                />
                                <input
                                    type="time"
                                    name="time"
                                    value={newService.time}
                                    onChange={handleInputChange}
                                    required
                                />
                                <textarea
                                    name="description"
                                    placeholder="Description"
                                    value={newService.description}
                                    onChange={handleInputChange}
                                ></textarea>
                                <div className="modal-actions">
                                    <button type="submit" className="submit-button">
                                        Add Service
                                    </button>
                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={handleCloseModal}
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

export default ServicePlanningPage;
