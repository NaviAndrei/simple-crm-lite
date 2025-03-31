import React, { useState, useEffect } from 'react';
import { createMeeting, updateMeeting } from '../services/meetingService';
import { format } from 'date-fns';

const MeetingForm = ({ meeting, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    start: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    end: format(new Date(Date.now() + 3600000), "yyyy-MM-dd'T'HH:mm"),
    status: 'scheduled'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Starea pentru opțiunile de status
  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'postponed', label: 'Postponed' },
    { value: 'pending', label: 'Pending' },
    { value: 'draft', label: 'Draft' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' }
  ];
  
  useEffect(() => {
    if (meeting) {
      setFormData({
        id: meeting.id || '',
        title: meeting.title || '',
        description: meeting.description || '',
        start: meeting.start ? format(new Date(meeting.start), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        end: meeting.end ? format(new Date(meeting.end), "yyyy-MM-dd'T'HH:mm") : format(new Date(Date.now() + 3600000), "yyyy-MM-dd'T'HH:mm"),
        status: meeting.status || 'scheduled'
      });
    } else {
      // Reset form for new meeting
      setFormData({
        id: '',
        title: '',
        description: '',
        start: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        end: format(new Date(Date.now() + 3600000), "yyyy-MM-dd'T'HH:mm"),
        status: 'scheduled'
      });
    }
  }, [meeting]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Convert dates back to Date objects
      const meetingData = {
        ...formData,
        start: new Date(formData.start),
        end: new Date(formData.end)
      };
      
      let result;
      if (meeting && meeting.id) {
        // Update existing meeting
        result = await updateMeeting(meetingData);
      } else {
        // Create new meeting
        result = await createMeeting(meetingData);
      }
      
      onSave(result);
      onClose();
    } catch (err) {
      console.error('Error saving meeting:', err);
      setError('Failed to save meeting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{meeting && meeting.id ? 'Edit Meeting' : 'New Meeting'}</h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={isSubmitting}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              
              <div className="mb-3">
                <label htmlFor="title" className="form-label">Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="title" 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea 
                  className="form-control" 
                  id="description" 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="start" className="form-label">Start Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className="form-control" 
                    id="start" 
                    name="start"
                    value={formData.start}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label htmlFor="end" className="form-label">End Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className="form-control" 
                    id="end" 
                    name="end"
                    value={formData.end}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="status" className="form-label">Status</label>
                <select 
                  className="form-select" 
                  id="status" 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span className="visually-hidden">Loading...</span>
                  </>
                ) : (
                  meeting && meeting.id ? 'Update Meeting' : 'Create Meeting'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MeetingForm; 