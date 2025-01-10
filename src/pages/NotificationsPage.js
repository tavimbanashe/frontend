import React, { useState } from 'react';
import Modal from '../components/Modal';
import '../styles/notificationsPage.css';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([
        { id: 1, message: 'Event scheduled for tomorrow.', read: false },
        { id: 2, message: 'Budget report approved.', read: true },
        { id: 3, message: 'New member added.', read: false },
    ]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);

    const openModal = (notification) => {
        setSelectedNotification(notification);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedNotification(null);
    };

    const markAsRead = (id) => {
        setNotifications((prev) =>
            prev.map((notif) =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    const deleteNotification = (id) => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
        closeModal();
    };

    return (
        <div className="page">
            <header className="page-header">
                <h1>Notifications</h1>
                <button
                    className="clear-button"
                    onClick={() => setNotifications([])}
                >
                    Clear All
                </button>
            </header>
            <div className="notifications-list">
                {notifications.length === 0 ? (
                    <p>No notifications available.</p>
                ) : (
                    notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`notification-item ${
                                notif.read ? 'read' : 'unread'
                            }`}
                            onClick={() => openModal(notif)}
                        >
                            {notif.message}
                        </div>
                    ))
                )}
            </div>
            {modalVisible && selectedNotification && (
                <Modal
                    title="Notification Details"
                    onClose={closeModal}
                >
                    <p>{selectedNotification.message}</p>
                    <div className="modal-actions">
                        <button
                            className="mark-read-button"
                            onClick={() => markAsRead(selectedNotification.id)}
                        >
                            Mark as Read
                        </button>
                        <button
                            className="delete-button"
                            onClick={() => deleteNotification(selectedNotification.id)}
                        >
                            Delete
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default NotificationsPage;
