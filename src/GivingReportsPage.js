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
    ReferenceLine,
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
        const fetchReports = async () => {
            try {
                const reportsResponse = await fetch('/api/giving-reports');
                const summaryResponse = await fetch('/api/giving-reports/summary');

                const reportsData = await reportsResponse.json();
                const summaryData = await summaryResponse.json();

                setReports(Array.isArray(reportsData) ? reportsData : []);
                setSummary(Array.isArray(summaryData) ? summaryData : []);
            } catch (error) {
                console.error('Error fetching giving reports:', error);
            }
        };

        const fetchMembers = async () => {
            try {
                const response = await fetch('/api/members');
                const membersData = await response.json();
                setMembers(membersData);
            } catch (error) {
                console.error('Error fetching members:', error);
            }
        };

        fetchReports();
        fetchMembers();
    }, []);

    useEffect(() => {
        const filtered = reports.filter((report) => {
            const matchesDate =
                (!filters.startDate || new Date(report.giving_date) >= new Date(filters.startDate)) &&
                (!filters.endDate || new Date(report.giving_date) <= new Date(filters.endDate));
            const matchesDonor =
                !filters.donorName ||
                `${report.first_name} ${report.last_name}`
                    .toLowerCase()
                    .includes(filters.donorName.toLowerCase());
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
            const response = await fetch('/api/giving-reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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
                setNewGiving({
                    amount: '',
                    giving_date: '',
                    type: '',
                    notes: '',
                });
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
        const csvContent = [headers, ...rows]
            .map((row) => row.map((field) => `"${field}"`).join(','))
            .join('\n');

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

        doc.autoTable({
            head: [['Donor', 'Amount', 'Date', 'Type', 'Notes']],
            body: rows,
            startY: 30,
            theme: 'grid',
            styles: { fontSize: 12 },
        });

        doc.save(`giving_reports_${new Date().toISOString()}.pdf`);
    };

    const getMaxYValue = (data) => {
        const values = data.map((item) => item.total_amount);
        return Math.max(...values);
    };

    return (
        <div className="dashboard">
            <TopMenu />
            <Sidebar />
            <main className="giving-reports-page">
                <header className="reports-header">
                    <h1>Giving Reports</h1>
                    <div className="header-actions">
                        <button className="export-button" onClick={exportToCSV}>
                            Export to CSV
                        </button>
                        <button className="export-button" onClick={exportToExcel}>
                            Export to Excel
                        </button>
                        <button className="export-button" onClick={exportToPDF}>
                            Export to PDF
                        </button>
                        <button className="add-button" onClick={() => setIsAdding(true)}>
                            Add Giving
                        </button>
                    </div>
                </header>

                {isAdding && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Add Giving Entry</h2>
                            <form onSubmit={handleAddGivingSubmit} className="add-giving-form">
                                <select
                                    name="member"
                                    value={selectedMemberId}
                                    onChange={(e) => setSelectedMemberId(e.target.value)}
                                    required
                                >
                                    <option value="">Select Donor</option>
                                    {members.map((member) => (
                                        <option key={member.id} value={member.id}>
                                            {member.first_name} {member.last_name}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    name="amount"
                                    placeholder="Amount"
                                    value={newGiving.amount}
                                    onChange={handleAddGivingChange}
                                    required
                                />
                                <input
                                    type="date"
                                    name="giving_date"
                                    value={newGiving.giving_date}
                                    onChange={handleAddGivingChange}
                                    required
                                />
                                <input
                                    type="text"
                                    name="type"
                                    placeholder="Type (e.g., Tithe, Offering)"
                                    value={newGiving.type}
                                    onChange={handleAddGivingChange}
                                    required
                                />
                                <textarea
                                    name="notes"
                                    placeholder="Notes (optional)"
                                    value={newGiving.notes}
                                    onChange={handleAddGivingChange}
                                ></textarea>
                                <div className="form-actions">
                                    <button type="submit" className="submit-button">
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={() => setIsAdding(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <section className="filters-section">
                    <h2>Filters</h2>
                    <div className="filters">
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
                            placeholder="Search by Donor Name"
                            value={filters.donorName}
                            onChange={handleFilterChange}
                        />
                    </div>
                </section>

                <section className="chart-section">
                    <h2>Giving Summary by Type</h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={summary}>
                            <XAxis dataKey="type" />
                            <YAxis domain={[0, getMaxYValue(summary) * 1.1]} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="total_amount" fill={COLORS[1]} />
                            <ReferenceLine
                                y={getMaxYValue(summary) / 2}
                                label="Mid Point"
                                stroke="red"
                                strokeDasharray="3 3"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </section>

                <section className="chart-section">
                    <h2>Donor Contributions (Line Graph)</h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                            data={filteredReports.map((report) => ({
                                giving_date: new Date(report.giving_date).toLocaleDateString(),
                                amount: Number(report.amount),
                            }))}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="giving_date" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="amount"
                                stroke={COLORS[0]}
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </section>

                <section className="reports-section">
                    <h2>Filtered Reports</h2>
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>Donor</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.map((report) => {
                                const member = members.find((member) => member.id === report.member_id);
                                const donorName = member ? `${member.first_name} ${member.last_name}` : 'Unknown Donor';
                                return (
                                    <tr key={report.id}>
                                        <td>{donorName}</td>
                                        <td>{`$${Number(report.amount).toFixed(2)}`}</td>
                                        <td>{new Date(report.giving_date).toLocaleDateString()}</td>
                                        <td>{report.type}</td>
                                        <td>{report.notes || 'N/A'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </section>
            </main>
        </div>
    );
};

export default GivingReportsPage;
