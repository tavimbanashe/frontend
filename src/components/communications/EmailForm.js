import React, { useState } from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';

const EmailForm = () => {
    const [subject, setSubject] = useState('');
    const [recipients, setRecipients] = useState('');
    const [body, setBody] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSendEmail = async () => {
        if (!subject || !recipients || !body) {
            setError('All fields are required.');
            return;
        }

        setError(null);
        try {
            const response = await fetch('/api/communication/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipients, subject, body }),
            });

            if (response.ok) {
                setSuccess('Email sent successfully!');
                setSubject('');
                setRecipients('');
                setBody('');
            } else {
                throw new Error('Failed to send email.');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Box className="email-form">
            <Typography variant="h5">Send Email</Typography>
            <TextField
                label="Recipients (comma-separated)"
                fullWidth
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                margin="normal"
            />
            <TextField
                label="Subject"
                fullWidth
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                margin="normal"
            />
            <TextField
                label="Body"
                fullWidth
                multiline
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                margin="normal"
            />
            {error && <Typography color="error">{error}</Typography>}
            {success && <Typography color="primary">{success}</Typography>}
            <Button
                variant="contained"
                color="primary"
                onClick={handleSendEmail}
                sx={{ marginTop: 2 }}
            >
                Send Email
            </Button>
        </Box>
    );
};

export default EmailForm;
