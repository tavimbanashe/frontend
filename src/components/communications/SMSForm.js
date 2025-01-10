import React, { useState } from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';

const SMSForm = () => {
    const [message, setMessage] = useState('');
    const [recipients, setRecipients] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSendSMS = async () => {
        if (!message || !recipients) {
            setError('Both recipients and message are required.');
            return;
        }

        setError(null);
        try {
            const response = await fetch('/api/communication/sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipients, message }),
            });

            if (response.ok) {
                setSuccess('SMS sent successfully!');
                setMessage('');
                setRecipients('');
            } else {
                throw new Error('Failed to send SMS.');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Box className="sms-form">
            <Typography variant="h5">Send SMS</Typography>
            <TextField
                label="Recipients (comma-separated)"
                fullWidth
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                margin="normal"
            />
            <TextField
                label="Message"
                fullWidth
                multiline
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                margin="normal"
            />
            {error && <Typography color="error">{error}</Typography>}
            {success && <Typography color="primary">{success}</Typography>}
            <Button
                variant="contained"
                color="primary"
                onClick={handleSendSMS}
                sx={{ marginTop: 2 }}
            >
                Send SMS
            </Button>
        </Box>
    );
};

export default SMSForm;
