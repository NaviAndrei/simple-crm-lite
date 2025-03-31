import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ContactList from './components/ContactList';
import ContactForm from './components/ContactForm';
import { getAllContacts } from './services/contactService';
import './style/dropdown.css';
import CompanyList from './components/CompanyList';
import CompanyForm from './components/CompanyForm';
import Dashboard from './components/Dashboard';
import InteractionList from './components/InteractionList';
import ReportsPage from './components/ReportsPage';
import NotificationsPage from './components/NotificationsPage';
import MeetingsCalendarPage from './components/MeetingsCalendarPage';
import TasksPage from './components/TasksPage';
import SalesPipelinePage from './components/SalesPipelinePage';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to refresh the contacts list
  const refreshContacts = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Fetch contacts from API
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const data = await getAllContacts();
        setContacts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setError('Failed to load contacts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [refreshKey]);

  return (
    <NotificationProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <main className="container py-4 flex-grow-1">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route 
                path="/contacts" 
                element={
                  <ContactList 
                    contacts={contacts} 
                    loading={loading} 
                    refreshContacts={refreshContacts} 
                  />
                } 
              />
              <Route 
                path="/contacts/add" 
                element={
                  <ContactForm 
                    refreshContacts={refreshContacts}
                  />
                } 
              />
              <Route 
                path="/contacts/edit/:id" 
                element={
                  <ContactForm 
                    refreshContacts={refreshContacts}
                    contacts={contacts}
                  />
                } 
              />
              <Route 
                path="/companies" 
                element={
                  <CompanyList 
                    refreshCompanies={refreshContacts}
                  />
                } 
              />
              <Route 
                path="/companies/add" 
                element={
                  <CompanyForm 
                    refreshCompanies={refreshContacts}
                  />
                } 
              />
              <Route 
                path="/companies/edit/:id" 
                element={
                  <CompanyForm 
                    refreshCompanies={refreshContacts}
                  />
                } 
              />
              <Route path="/interactions" element={<InteractionList />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/meetings" element={<MeetingsCalendarPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/sales/pipeline" element={<SalesPipelinePage />} />
            </Routes>
          </main>
          <footer className="bg-dark text-light py-3 text-center">
            <div className="container">
              <p className="mb-0">Simple CRM Lite © {new Date().getFullYear()}</p>
            </div>
          </footer>
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;
