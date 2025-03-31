import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ContactCard from './ContactCard';
import { deleteContact } from '../services/contactService';

function ContactList({ contacts, loading, refreshContacts }) {
  console.log("ContactList received contacts prop:", contacts);

  const [searchTerm, setSearchTerm] = useState('');
  const [deleteStatus, setDeleteStatus] = useState({ loading: false, error: null });

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact => {
    const search = searchTerm.toLowerCase();
    return (
      contact.name.toLowerCase().includes(search) ||
      (contact.company && typeof contact.company === 'string' 
        ? contact.company.toLowerCase().includes(search)
        : contact.company && typeof contact.company === 'object' && contact.company.name 
          ? contact.company.name.toLowerCase().includes(search)
          : false) ||
      contact.email.toLowerCase().includes(search) ||
      (contact.phone && contact.phone.includes(search))
    );
  });



  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        setDeleteStatus({ loading: true, error: null });
        await deleteContact(id);
        refreshContacts();
      } catch (error) {
        console.error('Failed to delete contact:', error);
        setDeleteStatus({ loading: false, error: 'Failed to delete contact. Please try again.' });
      } finally {
        setDeleteStatus({ loading: false, error: null });
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading contacts...</p>
      </div>
    );
  }

  return (
    <div className="card bg-dark">
      <div className="card-header bg-dark">
        <h2 className="mb-0">Contacts</h2>
        <div className="form-group mt-3">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="card-body">
        {deleteStatus.error && (
          <div className="alert alert-danger mb-3">{deleteStatus.error}</div>
        )}
        
        {filteredContacts.length === 0 ? (
          <div className="text-center my-4">
            <i className="fas fa-users fa-3x mb-3 text-secondary"></i>
            <h4>No contacts found</h4>
            {searchTerm ? (
              <p>No contacts match your search. Try a different term or clear the search.</p>
            ) : (
              <p>Add your first contact to get started.</p>
            )}
            <Link to="/add" className="btn btn-primary mt-2">
              <i className="fas fa-plus me-1"></i> Add New Contact
            </Link>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {filteredContacts.map(contact => (
              <div className="col" key={contact.id}>
                <ContactCard 
                  contact={contact} 
                  onDelete={() => handleDelete(contact.id)}
                  deleteInProgress={deleteStatus.loading}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactList;
