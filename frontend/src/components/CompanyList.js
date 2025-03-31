import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCompanies, deleteCompany } from '../services/companyService';

function CompanyList({ refreshCompanies }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllCompanies();
        setCompanies(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError(err.message || 'Failed to load companies. Please try again later.');
        setCompanies([]); // Reset companies on error
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await deleteCompany(id);
        // After successful deletion, refresh the companies list
        const data = await getAllCompanies();
        setCompanies(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Failed to delete company. Please try again.');
      }
    }
  };

  const filteredCompanies = companies.filter(company => {
    const search = searchTerm.toLowerCase();
    return (
      company.name.toLowerCase().includes(search) ||
      (company.website && company.website.toLowerCase().includes(search)) ||
      (company.address && company.address.toLowerCase().includes(search))
    );
  });

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="card bg-dark">
      <div className="card-header bg-dark">
        <h2 className="mb-0">Companies</h2>
        <div className="form-group mt-3">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {Array.isArray(filteredCompanies) && filteredCompanies.map(company => (
          <div key={company.id} className="col">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{company.name || 'Unnamed Company'}</h5>
                {company.website && (
                  <p className="card-text">
                    <i className="fas fa-globe me-2"></i>
                    <a 
                      href={`https://${company.website.replace(/^https?:\/\//, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {company.website}
                    </a>
                  </p>
                )}
                {company.address && (
                  <p className="card-text">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    {company.address}
                  </p>
                )}
                <p className="card-text">
                  <i className="fas fa-users me-2"></i>
                  {typeof company.contacts_count === 'number' ? company.contacts_count : 0} contacts
                </p>
              </div>
              <div className="card-footer bg-transparent border-top-0">
                <div className="d-flex justify-content-end gap-2">
                  <Link 
                    to={`/companies/edit/${company.id}`} 
                    className="btn btn-sm btn-outline-primary"
                  >
                    <i className="fas fa-edit me-1"></i>
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(company.id)} 
                    className="btn btn-sm btn-outline-danger"
                  >
                    <i className="fas fa-trash-alt me-1"></i>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center my-5">
          <p className="text-muted">No companies found.</p>
        </div>
      )}
    </div>
  );
}

export default CompanyList; 