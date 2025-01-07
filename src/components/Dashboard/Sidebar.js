import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/sidebar.css';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventIcon from '@mui/icons-material/Event';
import SecurityIcon from '@mui/icons-material/Security';
import BarChartIcon from '@mui/icons-material/BarChart';
import MessageIcon from '@mui/icons-material/Message';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const Sidebar = () => {
    const [activeMenu, setActiveMenu] = useState(null);
    const location = useLocation();

    const handleMenuClick = (index, hasSubItems) => {
        if (hasSubItems) {
            setActiveMenu(activeMenu === index ? null : index);
        }
    };

    const menuItems = [
        { title: 'Home', icon: <DashboardIcon />, route: '/dashboard' },
        {
            title: 'Members',
            icon: <GroupIcon />,
            subItems: [
                { title: 'All Members', route: '/members' },
                { title: 'First Timers & New Converts', route: '/members/new' },
                { title: 'Cell Ministry', route: '/members/cell-ministry' },
                { title: 'Counseling', route: '/members/counseling' },
            ],
        },
        {
            title: 'Attendance',
            icon: <CalendarTodayIcon />,
            subItems: [
                { title: 'Attendance Records', route: '/attendance/records' },
                { title: 'Volunteer Schedule', route: '/attendance/volunteer-schedule' },
                { title: 'Service Agenda', route: '/attendance/service-agenda' },
                { title: 'Church Calendar', route: '/attendance/calendar' },
            ],
        },
        {
            title: 'Financials',
            icon: <AttachMoneyIcon />,
            subItems: [
                { title: 'Giving Reports', route: '/financials/giving-reports' },
                { title: 'Expense Tracking', route: '/financials/expense-tracking' },
                { title: 'Budget Allocation', route: '/financials/budget-allocation' },
            ],
        },
        { title: 'Reports & Analytics', icon: <BarChartIcon />, route: '/reports' },
        { title: 'Communication', icon: <MessageIcon />, route: '/communication' },
        {
            title: 'Giving & Pledges',
            icon: <VolunteerActivismIcon />,
            subItems: [
                { title: 'Tithes', route: '/giving/tithes' },
                { title: 'Offerings', route: '/giving/offerings' },
                { title: 'Special Giving', route: '/giving/special-giving' },
                { title: 'Online Giving', route: '/giving/online-giving' },
            ],
        },
        {
            title: 'Events Management',
            icon: <EventIcon />,
            subItems: [
                { title: 'Event Scheduling', route: '/events/schedule' },
                { title: 'Volunteer Management', route: '/events/volunteers' },
            ],
        },
        {
            title: 'Service Planning',
            icon: <MenuBookIcon />,
            route: '/service-planning',
        },
        {
            title: 'Other APIs',
            icon: <IntegrationInstructionsIcon />,
            route: '/apis',
        },
        { title: 'Roles & Permissions', icon: <SecurityIcon />, route: '/roles-permissions' },
    ];

    return (
        <aside className="sidebar">
            <ul>
                {menuItems.map((item, index) => (
                    <li
                        key={index}
                        className={
                            location.pathname.startsWith(item.route) ||
                            (item.subItems &&
                                item.subItems.some((subItem) =>
                                    location.pathname.startsWith(subItem.route)
                                ))
                                ? 'active'
                                : ''
                        }
                    >
                        <div
                            className="menu-item"
                            onClick={() => handleMenuClick(index, item.subItems)}
                        >
                            <span className="icon">{item.icon}</span>
                            {item.route ? (
                                <Link to={item.route} className="menu-link">
                                    {item.title}
                                </Link>
                            ) : (
                                <span className="menu-link">{item.title}</span>
                            )}
                        </div>
                        {item.subItems && (
                            <ul
                                className={`submenu ${
                                    activeMenu === index ? 'expanded' : ''
                                }`}
                            >
                                {item.subItems.map((subItem, subIndex) => (
                                    <li
                                        key={subIndex}
                                        className={
                                            location.pathname === subItem.route
                                                ? 'active'
                                                : ''
                                        }
                                    >
                                        <Link to={subItem.route}>
                                            {subItem.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default Sidebar;
