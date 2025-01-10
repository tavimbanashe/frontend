import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';
import * as XLSX from 'xlsx'; // For Excel export
import jsPDF from 'jspdf'; // For PDF export
import 'jspdf-autotable'; // For PDF tables
import '../styles/givingReportsPage.css';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

const GivingReportsPage = () => {
    const [reports, setReports] = useState([]);
    const [summary, setSummary] = useState([]);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        donorName: '',
    });
    const [filteredReports, setFilteredReports] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newGiving, setNewGiving] = useState({
        amount: '',
        giving_date: '',
        type: '',
        notes: '',
    });
    const [members, setMembers] = useState([]);
    const [selectedMemberId, setSelectedMemberId] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const reportsResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/giving-reports`);
                const summaryResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/giving-reports/summary`);
                const membersResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/members`);

                if (!reportsResponse.ok || !summaryResponse.ok || !membersResponse.ok) {
                    throw new Error('Failed to fetch data from the server');
                }

                const reportsData = await reportsResponse.json();
                const summaryData = await summaryResponse.json();
                const membersData = await membersResponse.json();

                setReports(Array.isArray(reportsData) ? reportsData : []);
                setSummary(Array.isArray(summaryData) ? summaryData : []);
                setMembers(Array.isArray(membersData) ? membersData : []);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const filtered = reports.filter((report) => {
            const matchesDate =
                (!filters.startDate || new Date(report.giving_date) >= new Date(filters.startDate)) &&
                (!filters.endDate || new Date(report.giving_date) <= new Date(filters.endDate));
            const matchesDonor =
                !filters.donorName ||
                `${report.first_name} ${report.last_name}`.toLowerCase().includes(filters.donorName.toLowerCase());
            return matchesDate && matchesDonor;
        });
        setFilteredReports(filtered);
    }, [filters, reports]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddGivingChange = (e) => {
        const { name, value } = e.target;
        setNewGiving((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddGivingSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/giving-reports`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    member_id: selectedMemberId,
                    amount: newGiving.amount,
                    giving_date: newGiving.giving_date,
                    type: newGiving.type,
                    notes: newGiving.notes,
                }),
            });

            if (response.ok) {
                const addedGiving = await response.json();
                setReports((prev) => [...prev, addedGiving]);
                setIsAdding(false);
                setNewGiving({ amount: '', giving_date: '', type: '', notes: '' });
                setSelectedMemberId('');
            } else {
                console.error('Failed to add new giving entry.');
            }
        } catch (error) {
            console.error('Error adding new giving entry:', error);
        }
    };

    const exportToCSV = () => {
        const headers = ['Donor', 'Amount', 'Date', 'Type', 'Notes'];
        const rows = filteredReports.map((report) => [
            `${report.first_name || 'Unknown'} ${report.last_name || 'Donor'}`,
            `$${Number(report.amount).toFixed(2)}`,
            new Date(report.giving_date).toLocaleDateString(),
            report.type,
            report.notes || 'N/A',
        ]);
        const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `giving_reports_${new Date().toISOString()}.csv`;
        link.click();
    };

    const exportToExcel = () => {
        const rows = filteredReports.map((report) => ({
            Donor: `${report.first_name || 'Unknown'} ${report.last_name || 'Donor'}`,
            Amount: `$${Number(report.amount).toFixed(2)}`,
            Date: new Date(report.giving_date).toLocaleDateString(),
            Type: report.type,
            Notes: report.notes || 'N/A',
        }));
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'GivingReports');
        XLSX.writeFile(workbook, `giving_reports_${new Date().toISOString()}.xlsx`);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Giving Reports', 14, 20);
        const rows = filteredReports.map((report) => [
            `${report.first_name || 'Unknown'} ${report.last_name || 'Donor'}`,
            `$${Number(report.amount).toFixed(2)}`,
            new Date(report.giving_date).toLocaleDateString(),
            report.type,
            report.notes || 'N/A',
        ]);
        doc.autoTable({ head: [['Donor', 'Amount', 'Date', 'Type', 'Notes']], body: rows, startY: 30, theme: 'grid' });
        doc.save(`giving_reports_${new Date().toISOString()}.pdf`);
    };

    const getMaxYValue = (data) => Math.max(...data.map((item) => item.total_amount));

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="giving-reports-page">
                <TopMenu />
                <div className="charts-section">
                    <h2>Giving Reports Summary</h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={summary}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="total_amount" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="charts-section">
                    <h2>Line Chart - Giving Trends</h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={summary}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="total_amount" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="filters-section">
                    <h3>Filters</h3>
                    <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                    />
                    <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                    />
                    <input
                        type="text"
                        name="donorName"
                        placeholder="Donor Name"
                        value={filters.donorName}
                        onChange={handleFilterChange}
                    />
                </div>
                <div className="export-section">
                    <button onClick={exportToCSV}>Export to CSV</button>
                    <button onClick={exportToExcel}>Export to Excel</button>
                    <button onClick={exportToPDF}>Export to PDF</button>
                </div>
                <div className="members-section">
                    <h3>Select a Member</h3>
                    <select
                        value={selectedMemberId}
                        onChange={(e) => setSelectedMemberId(e.target.value)}
                    >
                        <option value="">Select a Member</option>
                        {members.map((member) => (
                            <option key={member.id} value={member.id}>
                                {member.first_name} {member.last_name}
                            </option>
                        ))}
                    </select>
                </div>
            </main>
        </div>
    );
};

export default GivingReportsPage;
