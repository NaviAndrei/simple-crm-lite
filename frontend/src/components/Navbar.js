import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import NotificationBadge from './NotificationBadge';

function Navbar() {
  const location = useLocation();
  
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/dashboard">
          <i className="fas fa-tachometer-alt me-2"></i>
          CRM Lite
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} 
                to="/dashboard"
              >
                <i className="fas fa-home me-1"></i> Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname.startsWith('/contacts') ? 'active' : ''}`} 
                to="/contacts"
              >
                <i className="fas fa-users me-1"></i> Contacts
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname.startsWith('/companies') ? 'active' : ''}`} 
                to="/companies"
              >
                <i className="fas fa-building me-1"></i> Companies
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/meetings' ? 'active' : ''}`} 
                to="/meetings"
              >
                <i className="fas fa-calendar-alt me-1"></i> Meetings
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/tasks' ? 'active' : ''}`} 
                to="/tasks"
              >
                <i className="fas fa-tasks me-1"></i> Tasks
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/sales/pipeline' ? 'active' : ''}`} 
                to="/sales/pipeline"
              >
                <i className="fas fa-funnel-dollar me-1"></i> Sales Pipeline
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/reports' ? 'active' : ''}`} 
                to="/reports"
              >
                <i className="fas fa-chart-pie me-1"></i> Reports
              </Link>
            </li>
          </ul>
          
          <div className="d-flex align-items-center gap-3">
            <NotificationBadge />
            
            <div className="d-flex gap-2">
              <Link to="/contacts/add" className="btn btn-success">
                <i className="fas fa-user-plus me-1"></i> Add Contact
              </Link>
              <Link to="/companies/add" className="btn btn-success">
                <i className="fas fa-building me-1"></i> Add Company
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
