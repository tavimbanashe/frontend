import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import {
    LineChart,
    Line,
    Tooltip,
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
} from 'recharts';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import '../styles/budgetAllocationPage.css';
import * as XLSX from 'xlsx';
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

    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                const budgetsResponse = await fetch('/api/budgets');
                const summaryResponse = await fetch('/api/budgets/summary');
                const budgetsData = await budgetsResponse.json();
                const summaryData = await summaryResponse.json();

                setBudgets(budgetsData);
                setSummary(summaryData);
                setFilteredBudgets(budgetsData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching budgets:', error);
                setLoading(false);
            }
        };

        fetchBudgets();
        const interval = setInterval(fetchBudgets, 10000); // Poll every 10 seconds

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);

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
            const response = await fetch('/api/budgets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBudget),
            });
            const data = await response.json();

            if (response.ok) {
                setBudgets((prev) => [...prev, data]);
                setNewBudget({ category: '', allocated_amount: '' });
                setIsModalOpen(false);
            } else {
                console.error('Error adding budget:', data.message);
            }
        } catch (error) {
            console.error('Error adding budget:', error);
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
                    </div>
                </header>

                <section className="chart-section">
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={summary}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="total_allocated" stroke="#8884d8" animationDuration={1500} />
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
                            placeholder="Min Remaining Budget"
                            value={filters.minRemaining}
                            onChange={handleFilterChange}
                        />
                        <input
                            type="number"
                            name="maxRemaining"
                            placeholder="Max Remaining Budget"
                            value={filters.maxRemaining}
                            onChange={handleFilterChange}
                        />
                    </div>
                </section>

                <section className="budgets-section">
                    <table className="budgets-table">
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
                                    <CSSTransition key={budget.id} timeout={300} classNames="fade">
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
                </section>

                <section className="pagination">
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentPage(index + 1)}
                            className={currentPage === index + 1 ? 'active' : ''}
                        >
                            {index + 1}
                        </button>
                    ))}
                </section>

                {isModalOpen && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>Add Budget</h2>
                            <input
                                type="text"
                                placeholder="Category"
                                value={newBudget.category}
                                onChange={(e) =>
                                    setNewBudget({ ...newBudget, category: e.target.value })
                                }
                            />
                            <input
                                type="number"
                                placeholder="Allocated Amount"
                                value={newBudget.allocated_amount}
                                onChange={(e) =>
                                    setNewBudget({
                                        ...newBudget,
                                        allocated_amount: parseFloat(e.target.value) || '',
                                    })
                                }
                            />
                            <button onClick={handleAddBudget}>Save</button>
                            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BudgetAllocationPage;
