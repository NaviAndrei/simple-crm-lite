import React from 'react';
import ContactMenu from './ContactMenu';

function ContactCard({ contact, onDelete }) {
  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h5 className="card-title">{contact.name}</h5>
            {contact.company && (
              <h6 className="card-subtitle mb-2 text-muted">
                <i className="fas fa-building me-2"></i>
                {typeof contact.company === 'object' ? contact.company.name : contact.company}
              </h6>
            )}
          </div>
          <div className="position-relative">
            <ContactMenu contact={contact} onDelete={onDelete} />
          </div>
        </div>
        
        <div className="mt-3">
          <p className="card-text">
            <i className="fas fa-envelope me-2"></i>
            <a href={`mailto:${contact.email}`} className="text-decoration-none">
              {contact.email}
            </a>
          </p>
          {contact.phone && (
            <p className="card-text">
              <i className="fas fa-phone me-2"></i>
              <a href={`tel:${contact.phone}`} className="text-decoration-none">
                {contact.phone}
              </a>
            </p>
          )}
          <p className="card-text text-muted mt-2">
            <i className="fas fa-calendar me-2"></i>
            Added: {new Date(contact.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ContactCard;
