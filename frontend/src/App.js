import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ContactList from './components/ContactList';
import ContactForm from './components/ContactForm';
import { getAllContacts } from './services/contactService';

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
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="container py-4 flex-grow-1">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <Routes>
            <Route 
              path="/" 
              element={
                <ContactList 
                  contacts={contacts} 
                  loading={loading} 
                  refreshContacts={refreshContacts} 
                />
              } 
            />
            <Route 
              path="/add" 
              element={
                <ContactForm 
                  refreshContacts={refreshContacts}
                />
              } 
            />
            <Route 
              path="/edit/:id" 
              element={
                <ContactForm 
                  refreshContacts={refreshContacts}
                  contacts={contacts}
                />
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="bg-dark text-light py-3 text-center">
          <div className="container">
            <p className="mb-0">Simple CRM Lite © {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
