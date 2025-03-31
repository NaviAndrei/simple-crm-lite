import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createContact, updateContact, getContactById } from '../services/contactService';
import { getAllCompanies } from '../services/companyService';
import { createInteraction, deleteInteraction } from '../services/interactionService';
import { createMeeting } from '../services/meetingService';

function ContactForm({ refreshContacts, contacts }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const contactId = parseInt(id);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company_id: '',
    email: '',
    phone: '',
    contact_type: 'LEAD',
    sales_stage: ''
  });
  
  // Stare pentru interacțiuni
  const [interactions, setInteractions] = useState([]);
  
  // Stare pentru noul formular de interacțiune
  const [newInteraction, setNewInteraction] = useState({
    interaction_type: 'Note',
    notes: '',
    meeting_date: new Date().toISOString().substr(0, 16), // Format: 2023-01-01T12:00
    meeting_status: 'scheduled'
  });
  
  // Stare pentru a urmări ștergerea interacțiunilor
  const [deletingInteractionIds, setDeletingInteractionIds] = useState(new Set());
  const [isSubmittingInteraction, setIsSubmittingInteraction] = useState(false);
  
  // Validation and submission state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [interactionError, setInteractionError] = useState(null);
  
  // Contact type options
  const contactTypes = [
    { value: 'LEAD', label: 'Lead' },
    { value: 'PROSPECT', label: 'Prospect' },
    { value: 'CUSTOMER', label: 'Customer' },
    { value: 'OTHER', label: 'Other' }
  ];
  
  // Sales stage options
  const salesStages = [
    { value: '', label: 'None' },
    { value: 'PROSPECTING', label: 'Prospecting' },
    { value: 'QUALIFICATION', label: 'Qualification' },
    { value: 'PROPOSAL', label: 'Proposal' },
    { value: 'NEGOTIATION', label: 'Negotiation' },
    { value: 'CLOSED_WON', label: 'Closed Won' },
    { value: 'CLOSED_LOST', label: 'Closed Lost' }
  ];
  
  // Load contact data if editing - folosim useCallback pentru a memora funcția
  const loadContactData = useCallback(async () => {
    if (!isEditing) return;
    
    try {
      setInteractions([]);
      setInteractionError(null);
      setIsSubmitting(true);

      let contactData = null;
      if (contacts) {
        const foundContact = contacts.find(c => c.id === contactId);
        if (foundContact) {
          contactData = foundContact;
        }
      }
      
      if (!contactData) {
        contactData = await getContactById(contactId);
      }
      
      setFormData({
        name: contactData.name || '',
        company_id: contactData.company?.id || '',
        email: contactData.email || '',
        phone: contactData.phone || '',
        contact_type: contactData.contact_type || 'LEAD',
        sales_stage: contactData.sales_stage || ''
      });
      
      // Asigurăm-ne că interacțiunile au ID-uri valide pentru chei
      const validInteractions = Array.isArray(contactData.interactions) 
        ? contactData.interactions.filter(interaction => interaction && interaction.id) 
        : [];
      
      setInteractions(validInteractions);
    } catch (error) {
      console.error('Error loading contact or interactions:', error);
      setApiError('Failed to load contact data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [contactId, contacts, isEditing]);
  
  useEffect(() => {
    loadContactData();
  }, [loadContactData]);
  
  // Încărcăm lista de companii când se montează componenta
  const [companies, setCompanies] = useState([]);
  
  const loadCompanies = useCallback(async () => {
    try {
      const data = await getAllCompanies();
      setCompanies(data);
    } catch (err) {
      console.error('Error fetching companies:', err);
      // Putem păstra eroarea API pentru formular
    }
  }, []);
  
  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);
  
  // Handle Interaction Deletion
  const handleDeleteInteraction = async (interactionId) => {
    if (window.confirm('Are you sure you want to delete this interaction?')) {
      try {
        setInteractionError(null);
        // Adăugăm ID-ul la setul de interacțiuni în curs de ștergere
        setDeletingInteractionIds(prev => new Set([...prev, interactionId]));
        
        await deleteInteraction(interactionId);
        
        // Actualizăm local starea interacțiunilor
        setInteractions(prev => prev.filter(interaction => interaction.id !== interactionId));
      } catch (error) {
        console.error('Failed to delete interaction:', error);
        setInteractionError('Failed to delete interaction. Please try again.');
      } finally {
        // Eliminăm ID-ul din setul de interacțiuni în curs de ștergere
        setDeletingInteractionIds(prev => {
          const newSet = new Set([...prev]);
          newSet.delete(interactionId);
          return newSet;
        });
      }
    }
  };

  // Handle Interaction Form Change
  const handleInteractionChange = (e) => {
    const { name, value } = e.target;
    setNewInteraction(prev => ({ ...prev, [name]: value }));
  };

  // Handle Interaction Form Submit
  const handleInteractionSubmit = async (e) => {
    e.preventDefault();
    if (!newInteraction.interaction_type || !newInteraction.notes.trim()) {
      setInteractionError('Interaction type and notes are required.');
      return;
    }
    setIsSubmittingInteraction(true);
    setInteractionError(null);
    try {
      const interactionData = { 
        ...newInteraction, 
        contact_id: contactId
      };
      const createdInteraction = await createInteraction(interactionData);
      
      // Dacă interacțiunea este de tip Meeting, creăm automat și un meeting
      if (newInteraction.interaction_type === 'Meeting') {
        try {
          // Folosim data din formular sau data curentă dacă nu există
          const startDate = newInteraction.meeting_date 
            ? new Date(newInteraction.meeting_date) 
            : new Date();
          
          // Setăm data de sfârșit ca fiind peste o oră
          const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
          
          // Creăm un meeting folosind datele din interacțiune
          await createMeeting({
            title: `Meeting with ${formData.name}`,
            description: newInteraction.notes,
            start: startDate,
            end: endDate,
            status: newInteraction.meeting_status || 'scheduled'
          });
          
          console.log('Meeting created automatically from interaction');
        } catch (meetingError) {
          console.error('Error creating automatic meeting:', meetingError);
          // Nu oprim procesul dacă crearea meeting-ului eșuează
        }
      }
      
      // Verificăm dacă răspunsul API conține un ID valid
      if (createdInteraction && createdInteraction.id) {
        // Adăugăm noua interacțiune la începutul listei
        setInteractions(prev => [createdInteraction, ...prev]);
        // Resetăm formularul
        setNewInteraction({ 
          interaction_type: 'Note', 
          notes: '', 
          meeting_date: new Date().toISOString().substr(0, 16),
          meeting_status: 'scheduled'
        });
      } else {
        throw new Error("Created interaction missing ID");
      }
    } catch (error) {
      console.error('Failed to add interaction:', error);
      setInteractionError('Failed to add interaction. Please try again.');
    } finally {
      setIsSubmittingInteraction(false);
    }
  };

  // Handle Contact Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Validate Contact Form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (formData.phone) {
      const cleanedPhone = formData.phone.replace(/[-\s()]/g, '');
      if (!/^(?:\+)?[0-9]\d{1,14}$/.test(cleanedPhone)) {
        newErrors.phone = 'Phone number is invalid';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle Contact Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setApiError(null);
    
    const dataToSend = { 
      ...formData, 
      company_id: formData.company_id ? parseInt(formData.company_id) : null 
    };

    try {
      if (isEditing) {
        await updateContact(contactId, dataToSend);
      } else {
        await createContact(dataToSend);
      }
      
      if (typeof refreshContacts === 'function') {
        refreshContacts();
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving contact:', error);
      setApiError(`Failed to ${isEditing ? 'update' : 'create'} contact. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="card bg-dark mb-4">
      <div className="card-header">
        <h2 className="mb-0">{isEditing ? 'Edit Contact' : 'Add New Contact'}</h2>
      </div>
      <div className="card-body">
        {apiError && (
          <div className="alert alert-danger" role="alert">
            {apiError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name *</label>
            <input
              type="text"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>
          
          <div className="mb-3">
            <label htmlFor="company_id" className="form-label">Company</label>
            <select
              className="form-select"
              id="company_id"
              name="company_id"
              value={formData.company_id}
              onChange={handleChange}
            >
              <option value="">-- None --</option>
              {companies.map(company => (
                <option key={`company-${company.id}`} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email *</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
          
          <div className="mb-3">
            <label htmlFor="phone" className="form-label">Phone</label>
            <input
              type="tel"
              className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+40 123 456 789"
            />
            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
          </div>
          
          <div className="mb-3">
            <label className="form-label" htmlFor="contact_type">Contact Type</label>
            <select
              id="contact_type"
              name="contact_type"
              className={`form-select ${errors.contact_type ? 'is-invalid' : ''}`}
              value={formData.contact_type}
              onChange={handleChange}
            >
              {contactTypes.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.contact_type && <div className="invalid-feedback">{errors.contact_type}</div>}
          </div>
          
          <div className="mb-3">
            <label className="form-label" htmlFor="sales_stage">Sales Stage</label>
            <select
              id="sales_stage"
              name="sales_stage"
              className={`form-select ${errors.sales_stage ? 'is-invalid' : ''}`}
              value={formData.sales_stage}
              onChange={handleChange}
            >
              {salesStages.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.sales_stage && <div className="invalid-feedback">{errors.sales_stage}</div>}
          </div>
          
          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Contact' : 'Create Contact'
              )}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate('/')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      
      {isEditing && (
        <div className="card-footer bg-dark">
          <h3 className="mb-3">Interactions</h3>
          
          {interactionError && (
            <div className="alert alert-danger">{interactionError}</div>
          )}
          
          <form onSubmit={handleInteractionSubmit} className="mb-4">
            <div className="mb-3">
              <label htmlFor="interaction_type" className="form-label">Interaction Type</label>
              <select
                className="form-select"
                id="interaction_type"
                name="interaction_type"
                value={newInteraction.interaction_type}
                onChange={handleInteractionChange}
                required
              >
                <option value="Note">Note</option>
                <option value="Call">Call</option>
                <option value="Meeting">Meeting</option>
                <option value="Email">Email</option>
              </select>
            </div>
            
            {/* Afișează câmpul de dată doar pentru interacțiunile de tip Meeting */}
            {newInteraction.interaction_type === 'Meeting' && (
              <>
                <div className="mb-3">
                  <label htmlFor="meeting_date" className="form-label">Meeting Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    id="meeting_date"
                    name="meeting_date"
                    value={newInteraction.meeting_date}
                    onChange={handleInteractionChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="meeting_status" className="form-label">Meeting Status</label>
                  <select
                    className="form-select"
                    id="meeting_status"
                    name="meeting_status"
                    value={newInteraction.meeting_status}
                    onChange={handleInteractionChange}
                    required
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="postponed">Postponed</option>
                    <option value="pending">Pending</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </>
            )}
            
            <div className="mb-3">
              <label htmlFor="notes" className="form-label">Notes</label>
              <textarea
                className="form-control"
                id="notes"
                name="notes"
                value={newInteraction.notes}
                onChange={handleInteractionChange}
                rows="3"
                required
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={isSubmittingInteraction}
            >
              {isSubmittingInteraction ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Adding...
                </>
              ) : 'Add Interaction'}
            </button>
          </form>
          
          <h4>Recent Interactions</h4>
          {interactions.length === 0 ? (
            <p className="text-muted">No interactions recorded yet.</p>
          ) : (
            <div className="list-group">
              {interactions.map((interaction) => {
                const isDeleting = deletingInteractionIds.has(interaction.id);
                return (
                  <div 
                    key={`interaction-${interaction.id}`} 
                    className={`list-group-item list-group-item-action bg-dark border-secondary mb-2 ${isDeleting ? 'opacity-50' : ''}`}
                  >
                    <div className="d-flex w-100 justify-content-between">
                      <h5 className="mb-1">{interaction.interaction_type}</h5>
                      <small className="text-muted">
                        {interaction.interaction_date 
                          ? new Date(interaction.interaction_date).toLocaleString('ro-RO') 
                          : 'Date unavailable'}
                      </small>
                    </div>
                    <p className="mb-1" style={{ whiteSpace: 'pre-wrap' }}>{interaction.notes}</p>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm mt-2"
                      onClick={() => handleDeleteInteraction(interaction.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : (
                        <><i className="fas fa-trash-alt me-1"></i> Delete</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ContactForm;
