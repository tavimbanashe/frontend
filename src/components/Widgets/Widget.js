import React from 'react';
import '../../styles/widget.css'; // Reference Widget CSS from styles folder

const Widget = ({ title, value, icon }) => {
    return (
        <div className="widget">
            <i className="material-icons">{icon}</i>
            <div>
                <h3>{title}</h3>
                <p>{value}</p>
            </div>
        </div>
    );
};

export default Widget;
