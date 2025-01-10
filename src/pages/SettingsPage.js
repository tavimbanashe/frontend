import React, { useState } from 'react';
import Modal from '../components/Modal';
import '../styles/settingsPage.css';

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        theme: 'Light',
        notificationsEnabled: true,
    });
    const [modalVisible, setModalVisible] = useState(false);

    const toggleTheme = () =>
        setSettings((prev) => ({
            ...prev,
            theme: prev.theme === 'Light' ? 'Dark' : 'Light',
        }));

    const toggleNotifications = () =>
        setSettings((prev) => ({
            ...prev,
            notificationsEnabled: !prev.notificationsEnabled,
        }));

    return (
        <div className="page">
            <header className="page-header">
                <h1>Settings</h1>
                <button
                    className="edit-button"
                    onClick={() => setModalVisible(true)}
                >
                    Edit Settings
                </button>
            </header>
            <div className="settings-details">
                <p>
                    <strong>Theme:</strong> {settings.theme}
                </p>
                <p>
                    <strong>Notifications:</strong>{' '}
                    {settings.notificationsEnabled ? 'Enabled' : 'Disabled'}
                </p>
            </div>
            {modalVisible && (
                <Modal
                    title="Edit Settings"
                    onClose={() => setModalVisible(false)}
                >
                    <div>
                        <label>Theme:</label>
                        <button onClick={toggleTheme}>
                            Switch to {settings.theme === 'Light' ? 'Dark' : 'Light'}
                        </button>
                    </div>
                    <div>
                        <label>Notifications:</label>
                        <button onClick={toggleNotifications}>
                            {settings.notificationsEnabled ? 'Disable' : 'Enable'}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default SettingsPage;
