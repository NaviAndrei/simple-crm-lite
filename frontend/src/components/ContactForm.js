import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createContact, updateContact, getContactById } from '../services/contactService';

function ContactForm({ refreshContacts, contacts }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: ''
  });
  
  // Validation and submission state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // Load contact data if editing
  useEffect(() => {
    const loadContact = async () => {
      if (isEditing) {
        try {
          // First try to find the contact in the props
          if (contacts) {
            const contact = contacts.find(c => c.id === parseInt(id));
            if (contact) {
              setFormData({
                name: contact.name || '',
                company: contact.company || '',
                email: contact.email || '',
                phone: contact.phone || ''
              });
              return;
            }
          }
          
          // If not found or contacts not provided, fetch from API
          const data = await getContactById(id);
          setFormData({
            name: data.name || '',
            company: data.company || '',
            email: data.email || '',
            phone: data.phone || ''
          });
        } catch (error) {
          console.error('Error loading contact:', error);
          setApiError('Failed to load contact data. Please try again.');
        }
      }
    };
    
    loadContact();
  }, [id, isEditing, contacts]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Validate form
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
    
    if (formData.phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setApiError(null);
    
    try {
      if (isEditing) {
        await updateContact(id, formData);
      } else {
        await createContact(formData);
      }
      
      refreshContacts();
      navigate('/');
    } catch (error) {
      console.error('Error saving contact:', error);
      setApiError(`Failed to ${isEditing ? 'update' : 'create'} contact. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="card bg-dark">
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
              placeholder="Enter full name"
              required
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>
          
          <div className="mb-3">
            <label htmlFor="company" className="form-label">Company</label>
            <input
              type="text"
              className="form-control"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Enter company name (optional)"
            />
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
              placeholder="Enter email address"
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
              placeholder="Enter phone number (optional)"
            />
            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
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
                  Saving...
                </>
              ) : (
                <>Save Contact</>
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
    </div>
  );
}

export default ContactForm;
