import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import '../styles/communicationPage.css';
import { Button, TextField, Typography, Box } from '@mui/material';

const CommunicationPage = () => {
    const [logs, setLogs] = useState([]);
    const [recipients, setRecipients] = useState([]);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [smsMessage, setSmsMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Ensure this is being used
    const [error, setError] = useState(null);

    // Fetch recipients
    const fetchRecipients = async () => {
        setIsLoading(true); // Set loading to true when fetching data
        try {
            const response = await fetch('/api/communication/recipients');
            if (!response.ok) throw new Error('Failed to fetch recipients');
            const data = await response.json();
            setRecipients(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false); // Set loading to false after fetching data
        }
    };

    // Fetch logs
    const fetchLogs = async () => {
        setIsLoading(true); // Set loading to true when fetching logs
        try {
            const response = await fetch('/api/communication/logs');
            if (!response.ok) throw new Error('Failed to fetch logs');
            const data = await response.json();
            setLogs(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false); // Set loading to false after fetching logs
        }
    };

    useEffect(() => {
        fetchRecipients();
        fetchLogs();
    }, []);

    const handleSendEmail = async () => {
        setIsLoading(true); // Set loading to true when sending email
        try {
            const response = await fetch('/api/communication/send/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject: emailSubject, message: emailMessage }),
            });
            if (!response.ok) throw new Error('Failed to send emails');
            alert('Emails sent successfully!');
            fetchLogs(); // Refresh logs
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false); // Set loading to false after sending email
        }
    };

    const handleSendSMS = async () => {
        setIsLoading(true); // Set loading to true when sending SMS
        try {
            const response = await fetch('/api/communication/send/sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: smsMessage }),
            });
            if (!response.ok) throw new Error('Failed to send SMS');
            alert('SMS sent successfully!');
            fetchLogs(); // Refresh logs
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false); // Set loading to false after sending SMS
        }
    };

    // Columns for logs DataGrid
    const logColumns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'type', headerName: 'Type', width: 120 },
        { field: 'subject', headerName: 'Subject', width: 200 },
        { field: 'message', headerName: 'Message', flex: 1 },
        { field: 'recipients', headerName: 'Recipients', flex: 1 },
        { field: 'sent_at', headerName: 'Sent At', width: 180 },
    ];

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="communications-page">
                <TopMenu />
                <header className="communications-header">
                    <Typography variant="h4" component="h1">
                        Communication Module
                    </Typography>
                </header>

                {/* Email Section */}
                <section className="message-section">
                    <Typography variant="h6">Send Email</Typography>
                    <TextField
                        label="Subject"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                    />
                    <TextField
                        label="Message"
                        variant="outlined"
                        multiline
                        rows={4}
                        fullWidth
                        margin="normal"
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSendEmail}
                        disabled={isLoading}
                        style={{ marginTop: '10px' }}
                    >
                        {isLoading ? 'Sending...' : 'Send Email'}
                    </Button>
                </section>

                {/* SMS Section */}
                <section className="message-section">
                    <Typography variant="h6">Send SMS</Typography>
                    <TextField
                        label="Message"
                        variant="outlined"
                        multiline
                        rows={3}
                        fullWidth
                        margin="normal"
                        value={smsMessage}
                        onChange={(e) => setSmsMessage(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleSendSMS}
                        disabled={isLoading}
                        style={{ marginTop: '10px' }}
                    >
                        {isLoading ? 'Sending...' : 'Send SMS'}
                    </Button>
                </section>

                {/* Recipients Section */}
                <section className="recipients-section">
                    <Typography variant="h6">Recipients</Typography>
                    <DataGrid
                        rows={recipients.map((r, index) => ({ id: index + 1, ...r }))}
                        columns={[
                            { field: 'email', headerName: 'Email', width: 300 },
                            { field: 'phone', headerName: 'Phone', width: 200 },
                        ]}
                        pageSize={5}
                        rowsPerPageOptions={[5, 10]}
                        autoHeight
                    />
                </section>

                {/* Logs Section */}
                <section className="logs-section">
                    <Typography variant="h6">Communication Logs</Typography>
                    <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <DataGrid
                            rows={logs}
                            columns={logColumns}
                            pageSize={5}
                            rowsPerPageOptions={[5, 10, 25]}
                            autoHeight
                            disableSelectionOnClick
                            style={{ marginTop: '20px' }}
                        />
                        {error && (
                            <Typography variant="body1" color="error" style={{ marginTop: '20px' }}>
                                Error: {error}
                            </Typography>
                        )}
                    </Box>
                </section>
            </main>
        </div>
    );
};

export default CommunicationPage;
