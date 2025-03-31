import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCompany, updateCompany, getCompany } from '../services/companyService';
import { createInteraction, deleteInteraction } from '../services/interactionService';
import { createMeeting } from '../services/meetingService';

function CompanyForm({ refreshCompanies }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [interactions, setInteractions] = useState([]);
  const [interactionSubmitError, setInteractionSubmitError] = useState(null);
  const [isSubmittingInteraction, setIsSubmittingInteraction] = useState(false);
  const [newInteraction, setNewInteraction] = useState({
    interaction_type: 'Note',
    notes: '',
    meeting_date: new Date().toISOString().substr(0, 16), // Format: 2023-01-01T12:00
    meeting_status: 'scheduled'
  });
  const [deletingInteractionIds, setDeletingInteractionIds] = useState(new Set());

  const isEditing = Boolean(id);

  const loadCompanyData = useCallback(async () => {
    if (!isEditing) return;
    
    setIsSubmitting(true);
    setApiError(null);
    setInteractionSubmitError(null);
    
    try {
      const data = await getCompany(id);
      setFormData({
        name: data.name,
        website: data.website || '',
        address: data.address || ''
      });
      
      const validInteractions = Array.isArray(data.interactions) 
        ? data.interactions.filter(interaction => interaction && interaction.id) 
        : [];
      
      setInteractions(validInteractions);
    } catch (error) {
      console.error('Error fetching company:', error);
      setApiError('Failed to load company details.');
    } finally {
      setIsSubmitting(false);
    }
  }, [id, isEditing]);

  useEffect(() => {
    loadCompanyData();
  }, [loadCompanyData]);

  const handleInteractionChange = (e) => {
    const { name, value } = e.target;
    setNewInteraction(prev => ({ ...prev, [name]: value }));
  };

  const handleAddInteraction = async (e) => {
    e.preventDefault();
    if (!newInteraction.interaction_type || !newInteraction.notes.trim()) {
      setInteractionSubmitError('Interaction type and notes are required.');
      return;
    }

    setIsSubmittingInteraction(true);
    setInteractionSubmitError(null);

    try {
      const interactionData = {
        ...newInteraction,
        company_id: id
      };
      
      const createdInteraction = await createInteraction(interactionData);
      
      if (newInteraction.interaction_type === 'Meeting') {
        try {
          const startDate = newInteraction.meeting_date 
            ? new Date(newInteraction.meeting_date) 
            : new Date();
          
          const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
          
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
        }
      }
      
      if (createdInteraction && createdInteraction.id) {
        setInteractions(prev => [createdInteraction, ...prev]);
        setNewInteraction({ 
          interaction_type: 'Note', 
          notes: '', 
          meeting_date: new Date().toISOString().substr(0, 16),
          meeting_status: 'scheduled'
        });
      } else {
        throw new Error("Created interaction is missing ID");
      }
    } catch (error) {
      console.error('Error adding interaction:', error);
      setInteractionSubmitError('Failed to add interaction.');
    } finally {
      setIsSubmittingInteraction(false);
    }
  };

  const handleDeleteInteraction = async (interactionId) => {
    setDeletingInteractionIds(prev => new Set([...prev, interactionId]));
    setInteractionSubmitError(null);
    
    try {
      await deleteInteraction(interactionId);
      
      setInteractions(prev => prev.filter(interaction => interaction.id !== interactionId));
    } catch (error) {
      console.error('Error deleting interaction:', error);
      setInteractionSubmitError('Failed to delete interaction.');
    } finally {
      setDeletingInteractionIds(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(interactionId);
        return newSet;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      if (isEditing) {
        await updateCompany(id, formData);
      } else {
        await createCompany(formData);
      }
      if (typeof refreshCompanies === 'function') {
        refreshCompanies();
      }
      navigate('/companies');
    } catch (error) {
      console.error('Error saving company:', error);
      setApiError(`Failed to ${isEditing ? 'update' : 'create'} company.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="card bg-dark mb-4">
      <div className="card-header">
        <h2 className="mb-0">{isEditing ? 'Edit Company' : 'Add New Company'}</h2>
      </div>
      <div className="card-body">
        {apiError && (
          <div className="alert alert-danger" role="alert">
            {apiError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Company Name *</label>
            <input
              type="text"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="website" className="form-label">Website</label>
            <input
              type="url"
              className="form-control"
              id="website"
              value={formData.website || ''}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              placeholder="https://example.com"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="address" className="form-label">Address</label>
            <textarea
              className="form-control"
              id="address"
              value={formData.address || ''}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              rows="3"
            />
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || isSubmittingInteraction}
            >
              {isSubmitting ? 'Saving Company...' : 'Save Company'}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate('/companies')}
              disabled={isSubmitting || isSubmittingInteraction}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {isEditing && (
        <div className="card-footer bg-dark">
          <h3 className="mb-3">Interactions</h3>
          
          {interactionSubmitError && (
            <div className="alert alert-danger">{interactionSubmitError}</div>
          )}
          
          <form onSubmit={handleAddInteraction} className="mb-4">
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

export default CompanyForm;