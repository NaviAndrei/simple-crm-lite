import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ContactMenu({ contact, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close the menu when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="dropdown" ref={menuRef}>
      <button
        className="btn btn-link text-secondary p-0 px-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <i className="fas fa-ellipsis-v"></i>
      </button>

      {isOpen && (
        <div className="dropdown-menu show position-absolute end-0" style={{ minWidth: '120px' }}>
          <button
            className="dropdown-item"
            onClick={() => {
              navigate(`/contacts/edit/${contact.id}`);
              setIsOpen(false);
            }}
          >
            <i className="fas fa-edit me-2"></i>
            Edit
          </button>
          <button
            className="dropdown-item text-danger"
            onClick={() => {
              onDelete(contact.id);
              setIsOpen(false);
            }}
          >
            <i className="fas fa-trash-alt me-2"></i>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default ContactMenu;