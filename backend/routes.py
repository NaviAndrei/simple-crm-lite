import logging
from flask import request, jsonify
from backend.app import db
from backend.models import Contact

logger = logging.getLogger(__name__)

def register_routes(app):
    """Register all routes with the Flask application."""
    
    @app.route('/api/contacts', methods=['GET'])
    def get_contacts():
        """Get all contacts."""
        try:
            contacts = Contact.query.all()
            return jsonify([contact.to_dict() for contact in contacts]), 200
        except Exception as e:
            logger.error(f"Error fetching contacts: {str(e)}")
            return jsonify({"error": "Failed to fetch contacts"}), 500
    
    @app.route('/api/contacts/<int:contact_id>', methods=['GET'])
    def get_contact(contact_id):
        """Get a specific contact by ID."""
        try:
            contact = Contact.query.get(contact_id)
            if not contact:
                return jsonify({"error": "Contact not found"}), 404
            return jsonify(contact.to_dict()), 200
        except Exception as e:
            logger.error(f"Error fetching contact {contact_id}: {str(e)}")
            return jsonify({"error": f"Failed to fetch contact with ID {contact_id}"}), 500
    
    @app.route('/api/contacts', methods=['POST'])
    def create_contact():
        """Create a new contact."""
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['name', 'email']
            for field in required_fields:
                if field not in data or not data[field]:
                    return jsonify({"error": f"Field '{field}' is required"}), 400
            
            # Create new contact
            new_contact = Contact(
                name=data['name'],
                company=data.get('company', ''),
                email=data['email'],
                phone=data.get('phone', '')
            )
            
            db.session.add(new_contact)
            db.session.commit()
            
            return jsonify(new_contact.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating contact: {str(e)}")
            return jsonify({"error": "Failed to create contact"}), 500
    
    @app.route('/api/contacts/<int:contact_id>', methods=['PUT'])
    def update_contact(contact_id):
        """Update an existing contact."""
        try:
            contact = Contact.query.get(contact_id)
            if not contact:
                return jsonify({"error": "Contact not found"}), 404
            
            data = request.get_json()
            
            # Update contact fields if provided
            if 'name' in data and data['name']:
                contact.name = data['name']
            if 'company' in data:
                contact.company = data['company']
            if 'email' in data and data['email']:
                contact.email = data['email']
            if 'phone' in data:
                contact.phone = data['phone']
            
            db.session.commit()
            
            return jsonify(contact.to_dict()), 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating contact {contact_id}: {str(e)}")
            return jsonify({"error": f"Failed to update contact with ID {contact_id}"}), 500
    
    @app.route('/api/contacts/<int:contact_id>', methods=['DELETE'])
    def delete_contact(contact_id):
        """Delete a contact."""
        try:
            contact = Contact.query.get(contact_id)
            if not contact:
                return jsonify({"error": "Contact not found"}), 404
            
            db.session.delete(contact)
            db.session.commit()
            
            return jsonify({"message": f"Contact with ID {contact_id} deleted successfully"}), 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error deleting contact {contact_id}: {str(e)}")
            return jsonify({"error": f"Failed to delete contact with ID {contact_id}"}), 500
    
    @app.route('/api', methods=['GET'])
    def index():
        """Root endpoint for health check."""
        return jsonify({"status": "API is running"}), 200
