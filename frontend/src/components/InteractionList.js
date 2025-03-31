import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Importăm Link dacă vrem să legăm înapoi la contact/companie
import { getAllInteractions, deleteInteraction } from '../services/interactionService';

function InteractionList() {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingIds, setDeletingIds] = useState(new Set()); // Track which items are being deleted

  // Define fetchInteractions outside useEffect using useCallback
  const fetchInteractions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllInteractions();
      // Ensure data is an array before setting state
      setInteractions(Array.isArray(data) ? data : []); 
    } catch (err) {
      console.error("Error fetching interactions:", err);
      setError("Failed to load interactions. Please try again later.");
      setInteractions([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array as it doesn't depend on props or state from outside

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]); // Use fetchInteractions as dependency

  const handleDelete = async (id) => {
    // Check if already deleting to prevent double clicks
    if (deletingIds.has(id)) return;
    
    if (window.confirm('Are you sure you want to delete this interaction?')) {
      // Update UI optimistically
      const originalInteractions = [...interactions];
      setInteractions(prev => prev.filter(item => item.id !== id));
      setDeletingIds(prev => new Set(prev).add(id));
      setError(null); // Clear previous errors
      
      try {
        await deleteInteraction(id);
        // Success: ID already removed from deletingIds in finally block
      } catch (error) {
        console.error('Failed to delete interaction:', error);
        setError('Failed to delete interaction. Please try again.'); // Show error
        // Revert optimistic update on error
        setInteractions(originalInteractions);
        // fetchInteractions(); // Optionally re-fetch, but reverting is often enough
      } finally {
        // Remove ID from deleting set regardless of success or failure
        setDeletingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    }
  };

  // Utilizăm useMemo pentru a evita recalcularea la fiecare redare
  const filteredInteractions = useMemo(() => {
    if (!Array.isArray(interactions)) return []; // Ensure interactions is an array
    const search = searchTerm.toLowerCase();
    return interactions.filter(interaction => (
      interaction.interaction_type.toLowerCase().includes(search) ||
      (interaction.notes && interaction.notes.toLowerCase().includes(search)) ||
      // Poți adăuga aici căutare după nume contact/companie dacă le-am include în to_dict
      (interaction.contact_id && String(interaction.contact_id).includes(search)) ||
      (interaction.company_id && String(interaction.company_id).includes(search))
    ));
  }, [interactions, searchTerm]);


  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading Interactions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">All Interactions</h1>

       {/* Afișează eroarea dacă există */}
       {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}

      {/* Căutare */}
      <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search interactions (type, notes, contact/company ID)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
      </div>

      {/* Lista de interacțiuni */}
      {filteredInteractions.length === 0 ? (
        <p className="text-muted">No interactions found matching your search criteria.</p>
      ) : (
        <ul className="list-group">
          {filteredInteractions.map(interaction => {
            // Generează o cheie unică și stabilă 
            const itemKey = `interaction-${interaction.id}`;
            const isDeleting = deletingIds.has(interaction.id);
            
            return (
              <li 
                key={itemKey} 
                className={`list-group-item bg-dark text-light d-flex justify-content-between align-items-start mb-2 border-secondary ${isDeleting ? 'opacity-50' : ''}`}
              >
                <div className="flex-grow-1 me-3">
                  <strong className="d-block">{interaction.interaction_type}</strong>
                  <small className="text-muted d-block mb-1">
                    {interaction.interaction_date 
                      ? new Date(interaction.interaction_date).toLocaleString('ro-RO') 
                      : 'Date unavailable'}
                  </small>
                  {/* Afișează notițele dacă există */}
                  {interaction.notes && <p className="mb-1" style={{ whiteSpace: 'pre-wrap' }}>{interaction.notes}</p>}
                   {/* Afișează link către Contact/Companie dacă ID-urile există */}
                   <small className="text-info d-block">
                    {interaction.contact_id && (
                       <Link to={`/contacts/edit/${interaction.contact_id}`} className="text-info text-decoration-none">
                          <i className="fas fa-user me-1"></i> Contact ID: {interaction.contact_id}
                       </Link>
                    )}
                    {interaction.contact_id && interaction.company_id && ' | '}
                    {interaction.company_id && (
                       <Link to={`/companies/edit/${interaction.company_id}`} className="text-info text-decoration-none">
                          <i className="fas fa-building me-1"></i> Company ID: {interaction.company_id}
                       </Link>
                    )}
                   </small>
                </div>
                <button 
                  className="btn btn-sm btn-outline-danger flex-shrink-0"
                  onClick={() => handleDelete(interaction.id)}
                  title="Delete Interaction"
                  disabled={isDeleting}
                >
                   {isDeleting ? (
                     <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                   ) : (
                     <i className="fas fa-trash-alt"></i>
                   )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default InteractionList;