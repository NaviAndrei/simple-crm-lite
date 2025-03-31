import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllContacts } from '../services/contactService';
import { getAllCompanies } from '../services/companyService';
import { getTotalInteractionsCount } from '../services/interactionService';
import { getMeetings } from '../services/meetingService';
import { useNotifications } from '../contexts/NotificationContext';

const Dashboard = () => {
  const { unreadCount: unreadNotifications } = useNotifications();
  const [stats, setStats] = useState({
    contacts: 0,
    companies: 0,
    interactions: 0,
    upcoming: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Obținem datele pentru contacte, companii și interacțiuni
        const [contactsData, companiesData, interactionsCountData] = await Promise.all([
          getAllContacts(),
          getAllCompanies(),
          getTotalInteractionsCount()
        ]);
        
        // Încercăm să obținem meetings, dar dacă eșuează, nu oprim întregul dashboard
        let upcomingMeetingsCount = 0;
        try {
          const meetingsData = await getMeetings();
          
          // Ne asigurăm că toate datele sunt procesate corect
          const now = new Date();
          // Verificăm fiecare meeting să aibă start ca Date, nu ca obiect complex
          const upcomingMeetings = meetingsData.filter(meeting => {
            const meetingStart = meeting.start instanceof Date 
              ? meeting.start 
              : new Date(meeting.start);
            return meetingStart > now;
          });
          
          upcomingMeetingsCount = upcomingMeetings.length;
        } catch (meetingErr) {
          console.warn("Meetings API not available yet:", meetingErr);
          // Continuăm fără date de meetings
        }
        
        setStats({
          contacts: contactsData.length,
          companies: companiesData.length,
          interactions: interactionsCountData || 0,
          upcoming: upcomingMeetingsCount
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load dashboard statistics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container-fluid mt-4">
      <h1 className="mb-4">Dashboard</h1>
      
      <div className="row g-4">
        {/* Card Contacts */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm dashboard-card">
            <div className="card-body d-flex flex-column justify-content-center align-items-center">
              <i className="fas fa-address-book fa-3x text-primary mb-3"></i>
              <h5 className="card-title">Total Contacts</h5>
              <p className="card-text display-4">{stats.contacts}</p>
              <Link to="/contacts" className="btn btn-outline-primary mt-auto">View Contacts</Link>
            </div>
          </div>
        </div>
        
        {/* Card Companies */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm dashboard-card">
            <div className="card-body d-flex flex-column justify-content-center align-items-center">
              <i className="fas fa-building fa-3x text-info mb-3"></i>
              <h5 className="card-title">Total Companies</h5>
              <p className="card-text display-4">{stats.companies}</p>
              <Link to="/companies" className="btn btn-outline-info mt-auto">View Companies</Link>
            </div>
          </div>
        </div>
        
        {/* Card Interactions */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm dashboard-card">
            <div className="card-body d-flex flex-column justify-content-center align-items-center">
              <i className="fas fa-comments fa-3x text-success mb-3"></i>
              <h5 className="card-title">Total Interactions</h5>
              <p className="card-text display-4">{stats.interactions}</p>
              <Link to="/interactions" className="btn btn-outline-success mt-auto">View Interactions</Link>
            </div>
          </div>
        </div>
        
        {/* Card Upcoming Meetings */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm dashboard-card">
            <div className="card-body d-flex flex-column justify-content-center align-items-center">
              <i className="fas fa-calendar-alt fa-3x text-warning mb-3"></i>
              <h5 className="card-title">Upcoming Meetings</h5>
              <p className="card-text display-4">{stats.upcoming}</p>
              <Link to="/meetings" className="btn btn-outline-warning mt-auto">View Meetings</Link>
            </div>
          </div>
        </div>
        
        {/* Notifications */}
        <div className="col-md-6 col-lg-4">
          <Link to="/notifications" className="text-decoration-none text-dark">
            <div className="card h-100 shadow-sm dashboard-card">
              <div className="card-body d-flex flex-column justify-content-center align-items-center">
                <div className="position-relative">
                  <i className="fas fa-bell fa-3x text-warning mb-3"></i>
                  {unreadNotifications > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {unreadNotifications > 99 ? '99+' : unreadNotifications}
                    </span>
                  )}
                </div>
                <h5 className="card-title">Notifications</h5>
                {unreadNotifications > 0 ? (
                  <p className="card-text text-primary fw-semibold">You have {unreadNotifications} unread notifications</p>
                ) : (
                  <p className="card-text text-muted">See latest updates and alerts.</p>
                )}
                <div className="mt-auto">
                  <span className="btn btn-outline-warning">View Notifications</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Card Activity Report */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm dashboard-card">
            <div className="card-body d-flex flex-column justify-content-center align-items-center">
              <i className="fas fa-chart-line fa-3x text-info mb-3"></i>
              <h5 className="card-title">Activity Report</h5>
              <p className="card-text text-muted">See reports and analytics.</p>
              <Link to="/reports" className="btn btn-outline-info mt-auto">View Reports</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;