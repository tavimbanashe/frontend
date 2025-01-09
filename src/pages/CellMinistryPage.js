import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import '../styles/CellMinistryPage.css';

const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

const CellMinistryPage = () => {
    const [ministries, setMinistries] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formValues, setFormValues] = useState({
        name: '',
        leader_id: '',
        description: '',
    });
    const [members, setMembers] = useState([]);

    useEffect(() => {
        fetchMinistries();
        fetchMembers();
    }, []);

    const fetchMinistries = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/cell-ministries`);
            const data = await response.json();
            setMinistries(data);
        } catch (error) {
            console.error('Error fetching ministries:', error);
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
        const method = formValues.id ? 'PUT' : 'POST';
        const url = formValues.id
            ? `${API_BASE_URL}/api/cell-ministries/${formValues.id}`
            : `${API_BASE_URL}/api/cell-ministries`;
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formValues),
            });
            if (response.ok) {
                fetchMinistries();
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Error saving ministry:', error);
        }
    };

    return (
        <div className="dashboard">
            <Sidebar />
            <div className="main-content">
                <TopMenu />
                <header className="cell-ministry-header">
                    <h1>Cell Ministries</h1>
                    <button onClick={() => setIsModalOpen(true)}>+ Add Ministry</button>
                </header>
                <table className="ministries-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Leader</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ministries.map((ministry) => (
                            <tr key={ministry.id}>
                                <td>{ministry.name}</td>
                                <td>{`${ministry.leader_first_name || ''} ${
                                    ministry.leader_last_name || ''
                                }`}</td>
                                <td>{ministry.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {isModalOpen && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>Add/Edit Ministry</h2>
                            <input
                                type="text"
                                name="name"
                                value={formValues.name}
                                onChange={handleFormChange}
                                placeholder="Ministry Name"
                            />
                            <select
                                name="leader_id"
                                value={formValues.leader_id}
                                onChange={handleFormChange}
                            >
                                <option value="">Select Leader</option>
                                {members.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {`${member.first_name} ${member.last_name}`}
                                    </option>
                                ))}
                            </select>
                            <textarea
                                name="description"
                                value={formValues.description}
                                onChange={handleFormChange}
                                placeholder="Description"
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

export default CellMinistryPage;
