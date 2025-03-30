import React from 'react';
import { Link } from 'react-router-dom';

function ContactCard({ contact, onDelete, deleteInProgress }) {
  return (
    <div className="card h-100 bg-dark">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <h5 className="card-title mb-1">{contact.name}</h5>
          <div className="dropdown">
            <button 
              className="btn btn-sm btn-outline-secondary" 
              type="button" 
              id={`dropdownMenuButton-${contact.id}`} 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              <i className="fas fa-ellipsis-v"></i>
            </button>
            <ul className="dropdown-menu" aria-labelledby={`dropdownMenuButton-${contact.id}`}>
              <li>
                <Link className="dropdown-item" to={`/edit/${contact.id}`}>
                  <i className="fas fa-edit me-2"></i> Edit
                </Link>
              </li>
              <li>
                <button 
                  className="dropdown-item text-danger" 
                  onClick={onDelete}
                  disabled={deleteInProgress}
                >
                  <i className="fas fa-trash-alt me-2"></i> Delete
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        {contact.company && (
          <p className="card-subtitle mb-2 text-muted">
            <i className="fas fa-building me-2"></i>
            {contact.company}
          </p>
        )}
        
        <div className="mt-3">
          <p className="mb-1">
            <i className="fas fa-envelope me-2"></i>
            <a href={`mailto:${contact.email}`} className="text-info">
              {contact.email}
            </a>
          </p>
          
          {contact.phone && (
            <p className="mb-1">
              <i className="fas fa-phone me-2"></i>
              <a href={`tel:${contact.phone}`} className="text-info">
                {contact.phone}
              </a>
            </p>
          )}
        </div>
      </div>
      
      <div className="card-footer bg-dark d-flex justify-content-between">
        <small className="text-muted">
          Added: {new Date(contact.created_at).toLocaleDateString()}
        </small>
        <Link to={`/edit/${contact.id}`} className="btn btn-sm btn-outline-primary">
          <i className="fas fa-edit me-1"></i> Edit
        </Link>
      </div>
    </div>
  );
}

export default ContactCard;
