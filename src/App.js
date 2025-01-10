import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import MembersPage from './pages/MembersPage';
import NewMembersPage from './pages/NewMembersPage';
import CellMinistryPage from './pages/CellMinistryPage';
import CounselingPage from './pages/CounselingPage';
import AttendanceRecordsPage from './pages/AttendanceRecordsPage';
import VolunteerSchedulePage from './pages/VolunteerSchedulePage';
import CalendarPage from './pages/CalendarPage';
import ServiceAgendaPage from './pages/ServiceAgendaPage';
import GivingReportsPage from './pages/GivingReportsPage';
import ExpenseTrackingPage from './pages/ExpenseTrackingPage';
import BudgetAllocationPage from './pages/BudgetAllocationPage';
import CommunicationPage from './pages/CommunicationPage';
import ServicePlanningPage from './pages/ServicePlanningPage';
import TithesPage from './pages/TithesPage';
import SpecialGivingPage from './pages/SpecialGivingPage';
import OnlineGivingPage from './pages/OnlineGivingPage';
import RolesPermissionsPage from './pages/RolesPermissionsPage';
import ReportsAnalyticsPage from './pages/ReportsAnalyticsPage';
import EventsPage from './pages/EventsPage';
import OtherApisPage from './pages/OtherApisPage';
import OfferingsPage from './pages/OfferingsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
// Uncomment these if GivingPage and PledgesPage are ready
// import GivingPage from './pages/GivingPage';
// import PledgesPage from './pages/PledgesPage';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/members" element={<ProtectedRoute><MembersPage /></ProtectedRoute>} />
                    <Route path="/members/new" element={<ProtectedRoute><NewMembersPage /></ProtectedRoute>} />
                    <Route path="/members/cell-ministry" element={<ProtectedRoute><CellMinistryPage /></ProtectedRoute>} />
                    <Route path="/members/counseling" element={<ProtectedRoute><CounselingPage /></ProtectedRoute>} />
                    <Route path="/attendance/records" element={<ProtectedRoute><AttendanceRecordsPage /></ProtectedRoute>} />
                    <Route path="/attendance/volunteer-schedule" element={<ProtectedRoute><VolunteerSchedulePage /></ProtectedRoute>} />
                    <Route path="/attendance/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                    <Route path="/attendance/service-agenda" element={<ProtectedRoute><ServiceAgendaPage /></ProtectedRoute>} />
                    <Route path="/financials/giving-reports" element={<ProtectedRoute><GivingReportsPage /></ProtectedRoute>} />
                    <Route path="/financials/expense-tracking" element={<ProtectedRoute><ExpenseTrackingPage /></ProtectedRoute>} />
                    <Route path="/financials/budget-allocation" element={<ProtectedRoute><BudgetAllocationPage /></ProtectedRoute>} />
                    <Route path="/communication" element={<ProtectedRoute><CommunicationPage /></ProtectedRoute>} />
                    <Route path="/service-planning" element={<ProtectedRoute><ServicePlanningPage /></ProtectedRoute>} />
                    <Route path="/giving/tithes" element={<ProtectedRoute><TithesPage /></ProtectedRoute>} />
                    <Route path="/giving/special-giving" element={<ProtectedRoute><SpecialGivingPage /></ProtectedRoute>} />
                    <Route path="/giving/online-giving" element={<ProtectedRoute><OnlineGivingPage /></ProtectedRoute>} />
                    <Route path="/roles-permissions" element={<ProtectedRoute><RolesPermissionsPage /></ProtectedRoute>} />
                    <Route path="/reports" element={<ProtectedRoute><ReportsAnalyticsPage /></ProtectedRoute>} />
                    <Route path="/events/schedule" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
                    <Route path="/apis" element={<ProtectedRoute><OtherApisPage /></ProtectedRoute>} />
                    <Route path="/giving/offerings" element={<ProtectedRoute><OfferingsPage /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                    <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />

                    {/* Uncomment these routes when ready */}
                    {/* 
                    <Route path="/giving" element={<ProtectedRoute><GivingPage /></ProtectedRoute>} />
                    <Route path="/pledges" element={<ProtectedRoute><PledgesPage /></ProtectedRoute>} />
                    */}

                    {/* Default Route */}
                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
