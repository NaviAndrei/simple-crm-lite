import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getMeetings, deleteMeeting } from '../services/meetingService';
import MeetingForm from './MeetingForm';

// Înlocuim react-big-calendar cu o soluție simplă tabelară

const MeetingsCalendarPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  
  // State pentru gestionarea formularului și a întâlnirii selectate
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Funcție pentru formatarea status-ului (prima literă capitalizată)
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Funcție pentru a obține clasa CSS pentru badge în funcție de status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      case 'scheduled':
        return 'bg-primary';
      case 'postponed':
        return 'bg-warning';
      case 'pending':
        return 'bg-info';
      case 'draft':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await getMeetings();
      
      console.log('API data:', data);
      
      // Create simple, primitive-only events
      const simplifiedEvents = Array.isArray(data) ? data.map(meeting => ({
        id: String(meeting.id || ''),
        title: String(meeting.title || ''),
        description: String(meeting.description || ''),
        start: meeting.start ? new Date(meeting.start) : new Date(),
        end: meeting.end ? new Date(meeting.end) : new Date(Date.now() + 3600000),
        status: String(meeting.status || 'scheduled'),
      })) : [];
      
      console.log('Simplified events:', simplifiedEvents);
      setEvents(simplifiedEvents);
      setError(null);
    } catch (err) {
      console.error('Error loading meetings:', err);
      setError('Failed to load meetings');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Gestionarea acțiunilor CRUD
  const handleViewMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setIsFormOpen(true);
  };

  const handleNewMeeting = () => {
    setSelectedMeeting(null);
    setIsFormOpen(true);
  };

  const handleSaveMeeting = (savedMeeting) => {
    loadEvents(); // Reîncarcă toate întâlnirile după salvare
  };

  const handleDeleteClick = (meeting) => {
    setMeetingToDelete(meeting);
    setIsConfirmDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!meetingToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteMeeting(meetingToDelete.id);
      setIsConfirmDialogOpen(false);
      setMeetingToDelete(null);
      
      // Actualizăm lista după ștergere
      await loadEvents();
    } catch (err) {
      console.error('Error deleting meeting:', err);
      setError('Failed to delete meeting. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Formatarea datelor pentru afișare
  const formatDate = (date) => {
    if (!date) return '';
    try {
      return format(new Date(date), 'dd MMM yyyy HH:mm');
    } catch (err) {
      console.error('Date formatting error:', err);
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Meetings List</h2>
      
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      
      <div className="card mb-4">
        <div className="card-body">
          {events.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th scope="col">Title</th>
                    <th scope="col">Start Date</th>
                    <th scope="col">End Date</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(event => (
                    <tr key={event.id}>
                      <td>{event.title}</td>
                      <td>{formatDate(event.start)}</td>
                      <td>{formatDate(event.end)}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(event.status)}`}>
                          {formatStatus(event.status)}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleViewMeeting(event)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteClick(event)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">No meetings found.</div>
          )}
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Add New Meeting</h5>
        </div>
        <div className="card-body">
          <button 
            className="btn btn-primary"
            onClick={handleNewMeeting}
          >
            Schedule New Meeting
          </button>
        </div>
      </div>
      
      {/* Formular pentru adăugare/editare întâlnire */}
      <MeetingForm 
        meeting={selectedMeeting}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveMeeting}
      />
      
      {/* Dialog de confirmare ștergere */}
      {isConfirmDialogOpen && (
        <div className="modal d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setIsConfirmDialogOpen(false)}
                  disabled={isDeleting}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete the meeting "{meetingToDelete?.title}"?</p>
                <p className="text-danger">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsConfirmDialogOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span className="ms-1">Deleting...</span>
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsCalendarPage; 