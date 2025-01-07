import React from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import TopMenu from '../components/TopMenu';
import Widget from '../components/Widgets/Widget';
import { Group, Event, AttachMoney } from '@mui/icons-material'; // Import MUI icons
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // Import Recharts components
import '../styles/dashboard.css'; // Import the required styles

const Dashboard = () => {
    // Dummy data for charts
    const membersGrowthData = [
        { month: 'January', growth: 65 },
        { month: 'February', growth: 59 },
        { month: 'March', growth: 80 },
        { month: 'April', growth: 81 },
        { month: 'May', growth: 56 },
        { month: 'June', growth: 55 },
    ];

    const givingTrendsData = [
        { month: 'January', giving: 2000 },
        { month: 'February', giving: 1800 },
        { month: 'March', giving: 2500 },
        { month: 'April', giving: 2700 },
        { month: 'May', giving: 2300 },
        { month: 'June', giving: 2100 },
    ];

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="main-content">
                <TopMenu />
                
                {/* Widgets Section */}
                <div className="widgets">
                    <Widget 
                        title="Total Members" 
                        value={120} 
                        icon={<Group />} // MUI Group icon
                    />
                    <Widget 
                        title="Upcoming Events" 
                        value={15} 
                        icon={<Event />} // MUI Event icon
                    />
                    <Widget 
                        title="Donations" 
                        value="$5,000" 
                        icon={<AttachMoney />} // MUI AttachMoney icon
                    />
                </div>

                {/* Charts Section */}
                <div className="charts">
                    {/* Membership Growth Chart */}
                    <div className="chart" id="members-chart">
                        <h3>Membership Growth</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={membersGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="growth" stroke="#8884d8" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Giving Trends Chart */}
                    <div className="chart" id="giving-chart">
                        <h3>Giving Trends</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={givingTrendsData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="giving" stroke="#82ca9d" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
