import React, { useState } from 'react';
import Modal from '../components/Modal';
import '../styles/profilePage.css';

const ProfilePage = () => {
    const [profile, setProfile] = useState({
        username: 'John Doe',
        email: 'john@example.com',
    });
    const [modalVisible, setModalVisible] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const updateProfile = () => {
        alert('Profile updated successfully!');
        setModalVisible(false);
    };

    return (
        <div className="page">
            <header className="page-header">
                <h1>Profile</h1>
                <button
                    className="edit-button"
                    onClick={() => setModalVisible(true)}
                >
                    Edit Profile
                </button>
            </header>
            <div className="profile-details">
                <p><strong>Username:</strong> {profile.username}</p>
                <p><strong>Email:</strong> {profile.email}</p>
            </div>
            {modalVisible && (
                <Modal
                    title="Edit Profile"
                    onClose={() => setModalVisible(false)}
                >
                    <label>Username:</label>
                    <input
                        type="text"
                        name="username"
                        value={profile.username}
                        onChange={handleInputChange}
                    />
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleInputChange}
                    />
                    <div className="modal-actions">
                        <button
                            className="save-button"
                            onClick={updateProfile}
                        >
                            Save
                        </button>
                        <button
                            className="cancel-button"
                            onClick={() => setModalVisible(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ProfilePage;
