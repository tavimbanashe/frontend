import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import HomeIcon from '@mui/icons-material/Home';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import '../styles/topmenu.css';

const TopMenu = () => {
    const [openModal, setOpenModal] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [profile, setProfile] = useState({ username: '', email: '' });
    const [settings, setSettings] = useState({ theme: 'light', notifications: true });
    const navigate = useNavigate();

    // Fetch initial notifications and profile data
    useEffect(() => {
        // Mock fetch for notifications
        setNotifications([
            { id: 1, message: 'New event created' },
            { id: 2, message: 'Budget updated' },
            { id: 3, message: 'Volunteer schedule published' },
        ]);

        // Mock fetch for profile
        setProfile({ username: 'JohnDoe', email: 'john@example.com' });
    }, []);

    const handleOpenModal = (modalName) => setOpenModal(modalName);
    const handleCloseModal = () => setOpenModal(null);

    const handleProfileSave = () => {
        console.log('Saving profile...', profile);
        setOpenModal(null);
        alert('Profile updated successfully!');
    };

    const handleSettingsSave = () => {
        console.log('Saving settings...', settings);
        setOpenModal(null);
        alert('Settings updated successfully!');
    };

    const logout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const modals = {
        notifications: (
            <div>
                <h3>Notifications</h3>
                <ul>
                    {notifications.map((notification) => (
                        <li key={notification.id}>{notification.message}</li>
                    ))}
                </ul>
            </div>
        ),
        profile: (
            <div>
                <h3>Your Profile</h3>
                <form>
                    <label>
                        Username:
                        <input
                            type="text"
                            value={profile.username}
                            onChange={(e) =>
                                setProfile((prev) => ({ ...prev, username: e.target.value }))
                            }
                        />
                    </label>
                    <label>
                        Email:
                        <input
                            type="email"
                            value={profile.email}
                            onChange={(e) =>
                                setProfile((prev) => ({ ...prev, email: e.target.value }))
                            }
                        />
                    </label>
                    <button type="button" className="save-button" onClick={handleProfileSave}>
                        Save
                    </button>
                </form>
            </div>
        ),
        settings: (
            <div>
                <h3>Settings</h3>
                <form>
                    <label>
                        Theme:
                        <select
                            value={settings.theme}
                            onChange={(e) =>
                                setSettings((prev) => ({ ...prev, theme: e.target.value }))
                            }
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </label>
                    <label>
                        Notifications:
                        <input
                            type="checkbox"
                            checked={settings.notifications}
                            onChange={(e) =>
                                setSettings((prev) => ({ ...prev, notifications: e.target.checked }))
                            }
                        />
                    </label>
                    <button type="button" className="save-button" onClick={handleSettingsSave}>
                        Save
                    </button>
                </form>
            </div>
        ),
        help: (
            <div>
                <h3>Help</h3>
                <ul>
                    <li><a href="/faq">FAQs</a></li>
                    <li><a href="/contact-support">Contact Support</a></li>
                </ul>
            </div>
        ),
        logout: (
            <div>
                <h3>Confirm Logout</h3>
                <p>Are you sure you want to log out?</p>
                <button className="confirm-button" onClick={logout}>
                    Yes, Logout
                </button>
                <button className="cancel-button" onClick={handleCloseModal}>
                    Cancel
                </button>
            </div>
        ),
    };

    const menuItems = [
        { icon: <HomeIcon />, label: 'Home', onClick: () => navigate('/dashboard') },
        { icon: <NotificationsIcon />, label: 'Notifications', modal: 'notifications' },
        { icon: <PersonIcon />, label: 'Profile', modal: 'profile' },
        { icon: <SettingsIcon />, label: 'Settings', modal: 'settings' },
        { icon: <HelpIcon />, label: 'Help', modal: 'help' },
        { icon: <LogoutIcon />, label: 'Logout', modal: 'logout' },
    ];

    return (
        <div className="top-menu">
            <div className="top-menu-logo" onClick={() => navigate('/dashboard')}>
                MyApp
            </div>
            <div className="top-menu-icons">
                {menuItems.map((item, index) => (
                    <Tooltip key={index} title={item.label} arrow>
                        <div
                            className="top-menu-item"
                            onClick={() => item.modal ? handleOpenModal(item.modal) : item.onClick()}
                        >
                            {item.icon}
                        </div>
                    </Tooltip>
                ))}
            </div>

            {/* Modal */}
            <Modal
                open={!!openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box className="modal-box">
                    <h2 id="modal-title">
                        {openModal?.charAt(0).toUpperCase() + openModal?.slice(1)}
                    </h2>
                    <div id="modal-description">{modals[openModal]}</div>
                    <button className="close-button" onClick={handleCloseModal}>
                        Close
                    </button>
                </Box>
            </Modal>
        </div>
    );
};

export default TopMenu;
