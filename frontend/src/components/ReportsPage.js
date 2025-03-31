import React, { useState, useEffect } from 'react';
import { getInteractionsByTypeReport } from '../services/reportService';

function ReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getInteractionsByTypeReport();
        setReportData(data);
      } catch (err) {
        console.error("Error fetching report:", err);
        setError("Failed to load report data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading Report...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Reports</h1>

      {/* Raport Interacțiuni după Tip */}
      <div className="card bg-dark text-light mb-4">
        <div className="card-header">
          <h4 className="mb-0">Interactions by Type</h4>
        </div>
        <div className="card-body">
          {reportData ? (
            <ul className="list-group list-group-flush">
              {Object.entries(reportData)
                     .sort(([typeA], [typeB]) => typeA.localeCompare(typeB)) // Sortează alfabetic după tip
                     .map(([type, count]) => (
                <li key={type} className="list-group-item bg-dark text-light d-flex justify-content-between align-items-center border-secondary">
                  <span>
                    <i className={`fas ${getIconForInteractionType(type)} me-2`}></i>
                    {type}
                  </span>
                  <span className="badge bg-primary rounded-pill">{count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No interaction data available.</p>
          )}
        </div>
      </div>

      {/* Aici pot fi adăugate alte carduri pentru rapoarte viitoare */}

    </div>
  );
}

// Funcție helper pentru a obține o iconiță pe baza tipului de interacțiune
function getIconForInteractionType(type) {
  switch (type) {
    case 'Call': return 'fa-phone';
    case 'Email': return 'fa-envelope';
    case 'Meeting': return 'fa-calendar-check';
    case 'Note': return 'fa-sticky-note';
    default: return 'fa-comment'; // Default icon
  }
}

export default ReportsPage;