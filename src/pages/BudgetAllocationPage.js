import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import '../styles/budgetAllocationPage.css';
import * as XLSX from 'xlsx'; // Added XLSX import
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const BudgetAllocationPage = () => {
    const [budgets, setBudgets] = useState([]);
    const [summary, setSummary] = useState([]);
    const [filteredBudgets, setFilteredBudgets] = useState([]);
    const [filters, setFilters] = useState({ category: '', minRemaining: '', maxRemaining: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBudget, setNewBudget] = useState({ category: '', allocated_amount: '' });
    const [loading, setLoading] = useState(true);

    const itemsPerPage = 10;

    const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

    const fetchBudgets = useCallback(async () => {
        const budgetsUrl = `${API_BASE_URL}/api/budgets`;
        const summaryUrl = `${API_BASE_URL}/api/budgets/summary`;
        console.log('Fetching budgets from:', budgetsUrl);

        try {
            const [budgetsResponse, summaryResponse] = await Promise.all([
                fetch(budgetsUrl),
                fetch(summaryUrl),
            ]);

            if (!budgetsResponse.ok || !summaryResponse.ok) {
                throw new Error(`HTTP error! Status: ${budgetsResponse.status}, ${summaryResponse.status}`);
            }

            const budgetsData = await budgetsResponse.json();
            const summaryData = await summaryResponse.json();

            setBudgets(budgetsData);
            setSummary(summaryData);
            setFilteredBudgets(budgetsData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching budgets:', error.message);
            setLoading(false);
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        fetchBudgets();
        const interval = setInterval(fetchBudgets, 10000); // Poll every 10 seconds

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [fetchBudgets]);

    useEffect(() => {
        const applyFilters = () => {
            const filtered = budgets.filter((budget) => {
                const remaining = Number(budget.allocated_amount || 0) - Number(budget.used_amount || 0);

                const matchesCategory =
                    !filters.category || budget.category.toLowerCase().includes(filters.category.toLowerCase());
                const matchesMinRemaining =
                    !filters.minRemaining || remaining >= parseFloat(filters.minRemaining);
                const matchesMaxRemaining =
                    !filters.maxRemaining || remaining <= parseFloat(filters.maxRemaining);

                return matchesCategory && matchesMinRemaining && matchesMaxRemaining;
            });

            setFilteredBudgets(filtered);
        };

        applyFilters();
    }, [filters, budgets]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handleAddBudget = async () => {
        if (!newBudget.category || !newBudget.allocated_amount) {
            alert('Please fill in all fields.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/budgets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBudget),
            });

            if (response.ok) {
                const data = await response.json();
                setBudgets((prev) => [...prev, data]);
                setNewBudget({ category: '', allocated_amount: '' });
                setIsModalOpen(false);
            } else {
                const errorData = await response.json();
                console.error('Error adding budget:', errorData.message);
            }
        } catch (error) {
            console.error('Error adding budget:', error.message);
        }
    };

    const exportToCSV = () => {
        const headers = ['Category', 'Allocated', 'Used', 'Remaining'];
        const rows = filteredBudgets.map((budget) => [
            budget.category,
            `$${Number(budget.allocated_amount || 0).toFixed(2)}`,
            `$${Number(budget.used_amount || 0).toFixed(2)}`,
            `$${(Number(budget.allocated_amount || 0) - Number(budget.used_amount || 0)).toFixed(2)}`,
        ]);

        const csvContent = [headers, ...rows]
            .map((row) => row.map((field) => `"${field}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `budget_allocations_${new Date().toISOString()}.csv`;
        link.click();
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text('Budget Allocation Report', 14, 20);

        const rows = filteredBudgets.map((budget) => [
            budget.category,
            `$${Number(budget.allocated_amount || 0).toFixed(2)}`,
            `$${Number(budget.used_amount || 0).toFixed(2)}`,
            `$${(Number(budget.allocated_amount || 0) - Number(budget.used_amount || 0)).toFixed(2)}`,
        ]);

        doc.autoTable({
            head: [['Category', 'Allocated', 'Used', 'Remaining']],
            body: rows,
            startY: 30,
        });

        doc.save(`budget_allocations_${new Date().toISOString()}.pdf`);
    };

    const exportToExcel = () => {
        const headers = ['Category', 'Allocated', 'Used', 'Remaining'];
        const rows = filteredBudgets.map((budget) => ({
            Category: budget.category,
            Allocated: `$${Number(budget.allocated_amount || 0).toFixed(2)}`,
            Used: `$${Number(budget.used_amount || 0).toFixed(2)}`,
            Remaining: `$${(Number(budget.allocated_amount || 0) - Number(budget.used_amount || 0)).toFixed(2)}`,
        }));

        const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Budget Allocations');
        XLSX.writeFile(wb, `budget_allocations_${new Date().toISOString()}.xlsx`);
    };

    const paginatedBudgets = filteredBudgets.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const totalPages = Math.ceil(filteredBudgets.length / itemsPerPage);

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner" />
                <p>Loading budgets...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <TopMenu />
            <Sidebar />
            <main className="budget-allocation-page">
                <header className="budget-header">
                    <h1>Budget Allocation</h1>
                    <div className="header-actions">
                        <button className="add-button" onClick={() => setIsModalOpen(true)}>
                            + Add Budget
                        </button>
                        <button className="export-button" onClick={exportToCSV}>
                            Export to CSV
                        </button>
                        <button className="export-button" onClick={exportToPDF}>
                            Export to PDF
                        </button>
                        <button className="export-button" onClick={exportToExcel}>
                            Export to Excel
                        </button>
                    </div>
                </header>

                {/* Line Chart Section */}
                <section className="chart-section">
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={summary}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="total_allocated"
                                stroke="#82ca9d"
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </section>

                <section className="filters-section">
                    <h2>Filters</h2>
                    <div className="filters">
                        <input
                            type="text"
                            name="category"
                            placeholder="Search by Category"
                            value={filters.category}
                            onChange={handleFilterChange}
                        />
                        <input
                            type="number"
                            name="minRemaining"
                            placeholder="Min Remaining"
                            value={filters.minRemaining}
                            onChange={handleFilterChange}
                        />
                        <input
                            type="number"
                            name="maxRemaining"
                            placeholder="Max Remaining"
                            value={filters.maxRemaining}
                            onChange={handleFilterChange}
                        />
                    </div>
                </section>

                

            
                {/* Paginated Table */}
                <section className="table-section">
                    <table className="budget-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Allocated</th>
                                <th>Used</th>
                                <th>Remaining</th>
                            </tr>
                        </thead>
                        <tbody>
                            <TransitionGroup component={null}>
                                {paginatedBudgets.map((budget) => (
                                    <CSSTransition
                                        key={budget.id}
                                        timeout={500}
                                        classNames="row"
                                    >
                                        <tr>
                                            <td>{budget.category}</td>
                                            <td>${Number(budget.allocated_amount || 0).toFixed(2)}</td>
                                            <td>${Number(budget.used_amount || 0).toFixed(2)}</td>
                                            <td>${(Number(budget.allocated_amount || 0) - Number(budget.used_amount || 0)).toFixed(2)}</td>
                                        </tr>
                                    </CSSTransition>
                                ))}
                            </TransitionGroup>
                        </tbody>
                    </table>
                    <div className="pagination">
                        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                            <button
                                key={page}
                                className={`page-button ${page === currentPage ? 'active' : ''}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                </section>

             {/* Add Budget Modal */}
                {isModalOpen && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>Add New Budget</h2>
                            <input
                                type="text"
                                placeholder="Category"
                                value={newBudget.category}
                                onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="Allocated Amount"
                                value={newBudget.allocated_amount}
                                onChange={(e) => setNewBudget({ ...newBudget, allocated_amount: e.target.value })}
                            />
                            <div className="modal-actions">
                                <button onClick={handleAddBudget}>Add</button>
                                <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BudgetAllocationPage;
