import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DataGrid } from '@mui/x-data-grid';
import '../styles/reportsanalyticsPage.css';

const ReportsAnalyticsPage = () => {
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({ startDate: '', endDate: '', reportType: '' });
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch Reports Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/reports-analytics');
                const result = await response.json();

                console.log('Fetched data:', result);

                if (Array.isArray(result)) {
                    setData(result);
                    setFilteredData(result);
                } else {
                    throw new Error('Data format is not an array');
                }
            } catch (err) {
                setError('Failed to load data. Please try again.');
                console.error('Error fetching reports data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Apply Filters
    const applyFilters = useCallback(() => {
        if (!Array.isArray(data)) return;

        const filtered = data.filter((item) => {
            const matchesStartDate = !filters.startDate || new Date(item.date) >= new Date(filters.startDate);
            const matchesEndDate = !filters.endDate || new Date(item.date) <= new Date(filters.endDate);
            const matchesType = !filters.reportType || item.type.includes(filters.reportType);
            return matchesStartDate && matchesEndDate && matchesType;
        });
        setFilteredData(filtered);
    }, [data, filters]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'type', headerName: 'Report Type', width: 200 },
        { field: 'date', headerName: 'Date', width: 150 },
        { field: 'details', headerName: 'Details', width: 300 },
    ];

    return (
        <div className="dashboard">
            <TopMenu />
            <Sidebar />
            <main className="reports-analytics-page">
                <header className="reports-header">
                    <h1>Reports & Analytics</h1>
                </header>

                <section className="filters-section">
                    <h2>Filter Reports</h2>
                    <div className="filters-container">
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            placeholder="Start Date"
                        />
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            placeholder="End Date"
                        />
                        <select
                            name="reportType"
                            value={filters.reportType}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Types</option>
                            <option value="Attendance">Attendance</option>
                            <option value="Giving">Giving</option>
                            <option value="Membership">Membership</option>
                        </select>
                        <button
                            className="apply-filters-button"
                            onClick={applyFilters}
                        >
                            Apply Filters
                        </button>
                    </div>
                </section>

                {error ? (
                    <p className="error-message">{error}</p>
                ) : loading ? (
                    <p className="loading-message">Loading reports...</p>
                ) : (
                    <>
                        <section className="chart-section">
                            <h2>Report Insights</h2>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={filteredData}>
                                    <XAxis dataKey="type" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8884d8" barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </section>

                        <section className="reports-section">
                            <h2>Filtered Reports</h2>
                            <div style={{ height: 400, width: '100%' }}>
                                <DataGrid
                                    rows={filteredData}
                                    columns={columns}
                                    pageSize={5}
                                    rowsPerPageOptions={[5, 10, 20]}
                                    disableSelectionOnClick
                                    autoHeight
                                />
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default ReportsAnalyticsPage;
