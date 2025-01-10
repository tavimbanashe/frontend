import React, { useEffect, useState } from 'react';

const LookupDropdown = ({ name, value, onChange, endpoint }) => {
    const [options, setOptions] = useState([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await fetch(endpoint);
                const data = await response.json();
                setOptions(data);
            } catch (error) {
                console.error('Error fetching lookup options:', error);
            }
        };
        fetchOptions();
    }, [endpoint]);

    return (
        <select name={name} value={value} onChange={onChange}>
            <option value="">Select</option>
            {options.map((option) => (
                <option key={option.id} value={option.id}>
                    {option.name}
                </option>
            ))}
        </select>
    );
};

export default LookupDropdown;
