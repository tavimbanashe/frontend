import React from 'react';
import '../styles/modal.css';

const Modal = ({ title, children, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <header className="modal-header">
                    <h2>{title}</h2>
                    <button className="close-button" onClick={onClose}>
                        ×
                    </button>
                </header>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
