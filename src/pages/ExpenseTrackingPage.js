import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '../styles/expenseTrackingPage.css';

// Use the API_BASE_URL from environment variables
const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

const ExpenseTrackingPage = () => {
    const [expenses, setExpenses] = useState([]);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        category: '',
    });
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newExpense, setNewExpense] = useState({
        category: '',
        description: '',
        amount: '',
        expense_date: '',
    });

    // Fetch expenses from API
    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/expenses`);
                const data = await response.json();
                setExpenses(data);
            } catch (error) {
                console.error('Error fetching expenses:', error);
            }
        };
        fetchExpenses();
    }, []);

    // Apply filters to expenses
    useEffect(() => {
        const filtered = expenses.filter((expense) => {
            const matchesDate =
                (!filters.startDate || new Date(expense.expense_date) >= new Date(filters.startDate)) &&
                (!filters.endDate || new Date(expense.expense_date) <= new Date(filters.endDate));
            const matchesCategory =
                !filters.category || expense.category.toLowerCase().includes(filters.category.toLowerCase());
            return matchesDate && matchesCategory;
        });

        const validatedExpenses = filtered.map((expense) => ({
            ...expense,
            amount: parseFloat(expense.amount) || 0, // Ensure the amount is parsed as a valid number
        }));

        console.log('Validated Expenses:', validatedExpenses); // Debugging
        setFilteredExpenses(validatedExpenses);
    }, [filters, expenses]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    // Handle adding a new expense
    const handleAddExpense = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newExpense),
            });
            const data = await response.json();
            if (response.ok) {
                setExpenses((prev) => [...prev, data]);
                setNewExpense({ category: '', description: '', amount: '', expense_date: '' });
                setIsModalOpen(false);
            } else {
                console.error('Error adding expense:', data.message);
            }
        } catch (error) {
            console.error('Error adding expense:', error);
        }
    };

    // Export filtered expenses to CSV
    const exportToCSV = () => {
        const headers = ['Category', 'Description', 'Amount', 'Date'];
        const rows = filteredExpenses.map((expense) => [
            expense.category,
            expense.description || 'N/A',
            `$${expense.amount.toFixed(2)}`,
            new Date(expense.expense_date).toLocaleDateString(),
        ]);
        const csvContent = [headers, ...rows]
            .map((row) => row.map((field) => `"${field}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `expenses_${new Date().toISOString()}.csv`;
        link.click();
    };

    // Export filtered expenses to Excel
    const exportToExcel = () => {
        const rows = filteredExpenses.map((expense) => ({
            Category: expense.category,
            Description: expense.description || 'N/A',
            Amount: `$${expense.amount.toFixed(2)}`,
            Date: new Date(expense.expense_date).toLocaleDateString(),
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
        XLSX.writeFile(workbook, `expenses_${new Date().toISOString()}.xlsx`);
    };

    // Export filtered expenses to PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Expense Tracking Report', 14, 20);

        const rows = filteredExpenses.map((expense) => [
            expense.category,
            expense.description || 'N/A',
            `$${expense.amount.toFixed(2)}`,
            new Date(expense.expense_date).toLocaleDateString(),
        ]);

        doc.autoTable({
            head: [['Category', 'Description', 'Amount', 'Date']],
            body: rows,
            startY: 30,
        });

        doc.save(`expenses_${new Date().toISOString()}.pdf`);
    };

    return (
        <div className="dashboard">
            <TopMenu />
            <Sidebar />
            <main className="expense-tracking-page">
                <header className="expense-header">
                    <h1>Expense Tracking</h1>
                    <div className="header-actions">
                        <button onClick={exportToCSV}>Export to CSV</button>
                        <button onClick={exportToExcel}>Export to Excel</button>
                        <button onClick={exportToPDF}>Export to PDF</button>
                    </div>
                </header>

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
                            name="category"
                            placeholder="Search by Category"
                            value={filters.category}
                            onChange={handleFilterChange}
                        />
                    </div>
                </section>

                <section className="chart-section">
                    <h2>Expense Summary</h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={filteredExpenses}>
                            <XAxis dataKey="category" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="amount" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </section>

                <section className="expenses-section">
                    <h2>All Expenses</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map((expense) => (
                                <tr key={expense.id}>
                                    <td>{expense.category}</td>
                                    <td>{expense.description || 'N/A'}</td>
                                    <td>
                                        {`$${expense.amount.toFixed(2)}`}
                                    </td>
                                    <td>{new Date(expense.expense_date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {isModalOpen && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>Add Expense</h2>
                            <input
                                type="text"
                                placeholder="Category"
                                value={newExpense.category}
                                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                            />
                            <textarea
                                placeholder="Description"
                                value={newExpense.description}
                                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="Amount"
                                value={newExpense.amount}
                                onChange={(e) =>
                                    setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || '' })
                                }
                            />
                            <input
                                type="date"
                                value={newExpense.expense_date}
                                onChange={(e) => setNewExpense({ ...newExpense, expense_date: e.target.value })}
                            />
                            <button onClick={handleAddExpense}>Save</button>
                            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ExpenseTrackingPage;
