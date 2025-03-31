import logging
from flask import request, jsonify
from backend.app import db
from backend.models import Contact, Company, Interaction, Notification, Meeting, Task
from sqlalchemy import func
from datetime import datetime
from backend.models import TaskStatus

logger = logging.getLogger(__name__)

def register_routes(app):
    """Register all routes with the Flask application."""
    
    @app.route('/api/contacts', methods=['GET'])
    def get_contacts():
        """Get all contacts."""
        try:
            # This fetches ALL contacts without pagination
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
            contact_data = contact.to_dict()
            contact_data['interactions'] = [interaction.to_dict() for interaction in contact.interactions.order_by(Interaction.interaction_date.desc()).all()]
            return jsonify(contact_data), 200
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
                email=data['email'],
                phone=data.get('phone', ''),
                company_id=data.get('company_id'),
                contact_type=data.get('contact_type', 'LEAD'),
                sales_stage=data.get('sales_stage')
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
            if 'company_id' in data:
                if data['company_id'] is None:
                    contact.company_id = None
                else:
                    try:
                        company_id_int = int(data['company_id'])
                        company = Company.query.get(company_id_int)
                        if company:
                            contact.company_id = company_id_int
                        else:
                            pass
                    except (ValueError, TypeError):
                        pass
            if 'email' in data and data['email']:
                contact.email = data['email']
            if 'phone' in data:
                contact.phone = data['phone']
            if 'contact_type' in data:
                contact.contact_type = data['contact_type']
            if 'sales_stage' in data:
                contact.sales_stage = data['sales_stage']
            
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

    @app.route('/api/companies', methods=['GET'])
    def get_companies():
        """Get all companies."""
        try:
            companies = Company.query.all()
            return jsonify([company.to_dict() for company in companies]), 200
        except Exception as e:
            logger.error(f"Error fetching companies: {str(e)}")
            return jsonify({"error": "Failed to fetch companies"}), 500

    @app.route('/api/companies/<int:company_id>', methods=['GET'])
    def get_company(company_id):
        """Get a specific company by ID."""
        try:
            company = Company.query.get(company_id)
            if not company:
                return jsonify({"error": "Company not found"}), 404
            company_data = company.to_dict()
            company_data['interactions'] = [interaction.to_dict() for interaction in company.interactions.order_by(Interaction.interaction_date.desc()).all()]
            return jsonify(company_data), 200
        except Exception as e:
            logger.error(f"Error fetching company {company_id}: {str(e)}")
            return jsonify({"error": f"Failed to fetch company with ID {company_id}"}), 500

    @app.route('/api/companies', methods=['POST'])
    def create_company():
        """Create a new company."""
        try:
            data = request.get_json()
            
            # Validate required fields
            if not data.get('name'):
                return jsonify({"error": "Company name is required"}), 400
            
            company = Company(
                name=data['name'],
                website=data.get('website', ''),
                address=data.get('address', '')
            )
            
            db.session.add(company)
            db.session.commit()
            
            return jsonify(company.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating company: {str(e)}")
            return jsonify({"error": "Failed to create company"}), 500

    @app.route('/api/companies/<int:company_id>', methods=['PUT'])
    def update_company(company_id):
        """Update an existing company."""
        try:
            company = Company.query.get(company_id)
            if not company:
                return jsonify({"error": "Company not found"}), 404
            
            data = request.get_json()
            if 'name' in data and data['name']:
                company.name = data['name']
            if 'website' in data:
                company.website = data['website']
            if 'address' in data:
                company.address = data['address']
            
            db.session.commit()
            return jsonify(company.to_dict()), 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating company {company_id}: {str(e)}")
            return jsonify({"error": f"Failed to update company"}), 500

    @app.route('/api/companies/<int:company_id>', methods=['DELETE'])
    def delete_company(company_id):
        """Delete a company."""
        try:
            company = Company.query.get(company_id)
            if not company:
                return jsonify({"error": "Company not found"}), 404
            
            db.session.delete(company)
            db.session.commit()
            
            return jsonify({"message": f"Company deleted successfully"}), 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error deleting company {company_id}: {str(e)}")
            return jsonify({"error": "Failed to delete company"}), 500

    @app.route('/api/interactions', methods=['POST'])
    def create_interaction():
        """Creează o nouă interacțiune și o notificare asociată."""
        try:
            data = request.get_json()
            
            interaction_type = data.get('interaction_type')
            notes = data.get('notes')
            contact_id = data.get('contact_id')
            company_id = data.get('company_id')

            # Validare: Tipul interacțiunii este obligatoriu
            if not interaction_type:
                return jsonify({"error": "Interaction type is required"}), 400
            
            # Validare: Trebuie specificat cel puțin un contact_id sau company_id
            if not contact_id and not company_id:
                return jsonify({"error": "Either contact_id or company_id must be provided"}), 400
            
            # Opțional: Verifică dacă contact_id sau company_id sunt valide
            if contact_id:
                contact = Contact.query.get(contact_id)
                if not contact:
                    return jsonify({"error": f"Contact with ID {contact_id} not found"}), 404
            if company_id:
                company = Company.query.get(company_id)
                if not company:
                     return jsonify({"error": f"Company with ID {company_id} not found"}), 404

            # Creează noua interacțiune
            new_interaction = Interaction(
                interaction_type=interaction_type,
                notes=notes,
                contact_id=contact_id,
                company_id=company_id
            )
            db.session.add(new_interaction)
            # Dăm flush pentru a obține ID-ul interacțiunii înainte de commit
            db.session.flush()

            # Creează mesajul notificării
            target_info = f"Contact: {contact.name}" if contact_id else f"Company: {company.name}"
            if contact_id and company_id:
                 target_info = f"Contact: {contact.name} (Company: {company.name})"
            
            notification_message = f"New interaction '{interaction_type}' added for {target_info}."
            
            # Creează noua notificare
            new_notification = Notification(
                message=notification_message,
                link_contact_id=contact_id,
                link_company_id=company_id,
                link_interaction_id=new_interaction.id # Legăm de ID-ul interacțiunii create
            )
            db.session.add(new_notification)

            # Acum facem commit pentru ambele
            db.session.commit()

            return jsonify(new_interaction.to_dict()), 201

        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating interaction and notification: {str(e)}")
            return jsonify({"error": "Failed to create interaction"}), 500

    @app.route('/api/interactions/count', methods=['GET'])
    def get_interactions_count():
        """Returnează numărul total de interacțiuni."""
        try:
            count = Interaction.query.count()
            return jsonify({"count": count}), 200
        except Exception as e:
            logger.error(f"Error counting interactions: {str(e)}")
            return jsonify({"error": "Failed to count interactions"}), 500

    @app.route('/api/interactions', methods=['GET'])
    def get_interactions():
        """Returnează o listă cu toate interacțiunile, sortate descrescător după dată."""
        try:
            # TODO: Adaugă filtrare opțională (ex: ?contact_id=X, ?company_id=Y) dacă e necesar în viitor
            interactions = Interaction.query.order_by(Interaction.interaction_date.desc()).all()
            return jsonify([interaction.to_dict() for interaction in interactions]), 200
        except Exception as e:
            logger.error(f"Error fetching all interactions: {str(e)}")
            return jsonify({"error": "Failed to fetch interactions"}), 500

    @app.route('/api/interactions/<int:interaction_id>', methods=['DELETE'])
    def delete_interaction(interaction_id):
        """Șterge o interacțiune specifică."""
        try:
            interaction = Interaction.query.get(interaction_id)
            if not interaction:
                return jsonify({"error": "Interaction not found"}), 404
            
            db.session.delete(interaction)
            db.session.commit()
            
            return jsonify({"message": f"Interaction with ID {interaction_id} deleted successfully"}), 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error deleting interaction {interaction_id}: {str(e)}")
            return jsonify({"error": f"Failed to delete interaction with ID {interaction_id}"}), 500

    @app.route('/api/reports/interactions-by-type', methods=['GET'])
    def get_report_interactions_by_type():
        """Returnează un raport cu numărul de interacțiuni grupate după tip."""
        try:
            # Interogare care grupează după tip și numără intrările pentru fiecare tip
            report_data = db.session.query(
                Interaction.interaction_type,
                func.count(Interaction.id).label('count')
            ).group_by(Interaction.interaction_type).all()
            
            # Formatează rezultatul într-un dicționar {tip: count}
            report_dict = {row.interaction_type: row.count for row in report_data}
            
            # Asigură-te că toate tipurile posibile sunt prezente, chiar dacă au count 0
            all_types = ['Call', 'Email', 'Meeting', 'Note']
            for interaction_type in all_types:
                if interaction_type not in report_dict:
                    report_dict[interaction_type] = 0
            
            return jsonify(report_dict), 200
        except Exception as e:
            logger.error(f"Error generating interactions by type report: {str(e)}")
            return jsonify({"error": "Failed to generate report"}), 500

    # === Secțiune Notificări ===
    @app.route('/api/notifications', methods=['GET'])
    def get_notifications():
        """Returnează toate notificările, cele mai recente primele."""
        try:
            # Poate adăuga filtrare ?is_read=false în viitor
            notifications = Notification.query.order_by(Notification.created_at.desc()).all()
            return jsonify([notification.to_dict() for notification in notifications]), 200
        except Exception as e:
            logger.error(f"Error fetching notifications: {str(e)}")
            return jsonify({"error": "Failed to fetch notifications"}), 500

    @app.route('/api/notifications/<int:notification_id>/read', methods=['PUT'])
    def mark_notification_read(notification_id):
        """Marchează o notificare specifică ca citită."""
        try:
            notification = Notification.query.get(notification_id)
            if not notification:
                return jsonify({"error": "Notification not found"}), 404
            
            if not notification.is_read:
                notification.is_read = True
                db.session.commit()
            
            # Returnează notificarea actualizată sau doar un mesaj de succes
            return jsonify(notification.to_dict()), 200 
            # Sau: return jsonify({"message": "Notification marked as read"}), 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error marking notification {notification_id} as read: {str(e)}")
            return jsonify({"error": "Failed to mark notification as read"}), 500
    
    # === Sfârșit Secțiune Notificări ===

    @app.route('/api/meetings', methods=['GET'])
    def get_meetings():
        """Obține toate întâlnirile."""
        try:
            # Opțional, filtrare pentru a afișa doar întâlnirile viitoare
            show_all = request.args.get('all', 'false').lower() == 'true'
            if show_all:
                meetings = Meeting.query.order_by(Meeting.start).all()
            else:
                # Filtru pentru a afișa doar întâlnirile viitoare (data de început >= acum)
                meetings = Meeting.query.filter(Meeting.start >= datetime.utcnow()).order_by(Meeting.start).all()
            
            return jsonify([meeting.to_dict() for meeting in meetings]), 200
        except Exception as e:
            logger.error(f"Error fetching meetings: {str(e)}")
            return jsonify({"error": "Failed to fetch meetings"}), 500

    @app.route('/api/meetings/<int:meeting_id>', methods=['GET'])
    def get_meeting(meeting_id):
        """Obține o întâlnire specifică după ID."""
        try:
            meeting = Meeting.query.get(meeting_id)
            if not meeting:
                return jsonify({"error": "Meeting not found"}), 404
            
            return jsonify(meeting.to_dict()), 200
        except Exception as e:
            logger.error(f"Error fetching meeting {meeting_id}: {str(e)}")
            return jsonify({"error": f"Failed to fetch meeting with ID {meeting_id}"}), 500

    @app.route('/api/meetings', methods=['POST'])
    def create_meeting():
        """Creează o nouă întâlnire."""
        try:
            data = request.get_json()
            
            # Validare câmpuri obligatorii
            required_fields = ['title', 'start', 'end']
            for field in required_fields:
                if field not in data or not data[field]:
                    return jsonify({"error": f"Field '{field}' is required"}), 400
            
            # Parsare date pentru start și end
            try:
                start_time = datetime.fromisoformat(data['start'].replace('Z', '+00:00'))
                end_time = datetime.fromisoformat(data['end'].replace('Z', '+00:00'))
            except (ValueError, TypeError):
                return jsonify({"error": "Invalid date format for start or end time"}), 400
            
            # Creează întâlnirea
            new_meeting = Meeting(
                title=data['title'],
                description=data.get('description', ''),
                location=data.get('location', ''),
                start=start_time,
                end=end_time,
                status=data.get('status', 'confirmed'),
                company_id=data.get('company_id')
            )
            
            # Adaugă participanți dacă există
            if 'attendees' in data and isinstance(data['attendees'], list):
                for attendee_id in data['attendees']:
                    contact = Contact.query.get(attendee_id)
                    if contact:
                        new_meeting.attendees.append(contact)
            
            db.session.add(new_meeting)
            db.session.commit()
            
            return jsonify(new_meeting.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating meeting: {str(e)}")
            return jsonify({"error": f"Failed to create meeting: {str(e)}"}), 500

    @app.route('/api/meetings/<int:meeting_id>', methods=['PUT'])
    def update_meeting(meeting_id):
        """Actualizează o întâlnire existentă."""
        try:
            meeting = Meeting.query.get(meeting_id)
            if not meeting:
                return jsonify({"error": "Meeting not found"}), 404
            
            data = request.get_json()
            
            # Actualizare câmpuri
            if 'title' in data and data['title']:
                meeting.title = data['title']
                
            if 'description' in data:
                meeting.description = data['description']
                
            if 'location' in data:
                meeting.location = data['location']
                
            if 'start' in data and data['start']:
                try:
                    meeting.start = datetime.fromisoformat(data['start'].replace('Z', '+00:00'))
                except (ValueError, TypeError):
                    return jsonify({"error": "Invalid date format for start time"}), 400
                
            if 'end' in data and data['end']:
                try:
                    meeting.end = datetime.fromisoformat(data['end'].replace('Z', '+00:00'))
                except (ValueError, TypeError):
                    return jsonify({"error": "Invalid date format for end time"}), 400
                
            if 'status' in data:
                meeting.status = data['status']
                
            if 'company_id' in data:
                meeting.company_id = data['company_id']
            
            # Actualizare participanți
            if 'attendees' in data and isinstance(data['attendees'], list):
                # Șterge participanții existenți
                meeting.attendees.clear()
                
                # Adaugă noii participanți
                for attendee_id in data['attendees']:
                    contact = Contact.query.get(attendee_id)
                    if contact:
                        meeting.attendees.append(contact)
            
            db.session.commit()
            
            return jsonify(meeting.to_dict()), 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating meeting {meeting_id}: {str(e)}")
            return jsonify({"error": f"Failed to update meeting with ID {meeting_id}"}), 500
    
    @app.route('/api/meetings/<int:meeting_id>', methods=['DELETE'])
    def delete_meeting(meeting_id):
        """Șterge o întâlnire."""
        try:
            meeting = Meeting.query.get(meeting_id)
            if not meeting:
                return jsonify({"error": "Meeting not found"}), 404
            
            db.session.delete(meeting)
            db.session.commit()
            
            return jsonify({"message": f"Meeting with ID {meeting_id} deleted successfully"}), 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error deleting meeting {meeting_id}: {str(e)}")
            return jsonify({"error": f"Failed to delete meeting with ID {meeting_id}"}), 500
    
    @app.route('/api/meetings/upcoming-count', methods=['GET'])
    def get_upcoming_meetings_count():
        """Returnează numărul de întâlniri viitoare."""
        try:
            count = Meeting.query.filter(Meeting.start >= datetime.utcnow()).count()
            return jsonify({"upcoming_meetings_count": count}), 200
        except Exception as e:
            logger.error(f"Error counting upcoming meetings: {str(e)}")
            return jsonify({"error": "Failed to count upcoming meetings"}), 500

    # ---------- Task Routes ----------
    @app.route('/api/tasks', methods=['GET'])
    def get_tasks():
        """Get all tasks."""
        try:
            tasks = []
            query = db.session.query(Task)
            
            # Filter by contact_id if provided
            contact_id = request.args.get('contact_id')
            if contact_id:
                query = query.filter(Task.contact_id == contact_id)
                
            # Filter by company_id if provided
            company_id = request.args.get('company_id')
            if company_id:
                query = query.filter(Task.company_id == company_id)
                
            # Filter by status if provided
            status = request.args.get('status')
            if status:
                query = query.filter(Task.status == status)
                
            # Execute query and convert to dict
            tasks = [task.to_dict() for task in query.order_by(Task.due_date).all()]
            
            return jsonify(tasks), 200
        except Exception as e:
            logger.error(f"Error fetching tasks: {str(e)}")
            return jsonify({"error": "Failed to fetch tasks"}), 500
    
    @app.route('/api/tasks/<int:task_id>', methods=['GET'])
    def get_task(task_id):
        """Get a specific task by ID."""
        try:
            task = Task.query.get(task_id)
            if not task:
                return jsonify({"error": "Task not found"}), 404
            return jsonify(task.to_dict()), 200
        except Exception as e:
            logger.error(f"Error fetching task {task_id}: {str(e)}")
            return jsonify({"error": f"Failed to fetch task with ID {task_id}"}), 500
    
    @app.route('/api/tasks', methods=['POST'])
    def create_task():
        """Create a new task."""
        try:
            data = request.get_json()
            
            # Validate required fields
            if not data.get('title'):
                return jsonify({"error": "Task title is required"}), 400
            
            # Either contact_id or company_id should be provided
            if not data.get('contact_id') and not data.get('company_id'):
                return jsonify({"error": "Either contact_id or company_id must be provided"}), 400
            
            # Create new task
            new_task = Task(
                title=data['title'],
                description=data.get('description', ''),
                due_date=datetime.fromisoformat(data['due_date']) if data.get('due_date') else None,
                status=data.get('status', 'PENDING'),
                contact_id=data.get('contact_id'),
                company_id=data.get('company_id')
            )
            
            db.session.add(new_task)
            db.session.commit()
            
            return jsonify(new_task.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating task: {str(e)}")
            return jsonify({"error": f"Failed to create task: {str(e)}"}), 500
    
    @app.route('/api/tasks/<int:task_id>', methods=['PUT'])
    def update_task(task_id):
        """Update an existing task."""
        try:
            task = Task.query.get(task_id)
            if not task:
                return jsonify({"error": "Task not found"}), 404
            
            data = request.get_json()
            
            # Update task fields if provided
            if 'title' in data:
                task.title = data['title']
            if 'description' in data:
                task.description = data['description']
            if 'due_date' in data and data['due_date']:
                task.due_date = datetime.fromisoformat(data['due_date'])
            if 'status' in data:
                task.status = data['status']
            if 'contact_id' in data:
                task.contact_id = data['contact_id']
            if 'company_id' in data:
                task.company_id = data['company_id']
            
            task.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify(task.to_dict()), 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating task {task_id}: {str(e)}")
            return jsonify({"error": f"Failed to update task with ID {task_id}"}), 500
    
    @app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
    def delete_task(task_id):
        """Delete a task."""
        try:
            task = Task.query.get(task_id)
            if not task:
                return jsonify({"error": "Task not found"}), 404
            
            db.session.delete(task)
            db.session.commit()
            
            return jsonify({"message": f"Task with ID {task_id} deleted successfully"}), 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error deleting task {task_id}: {str(e)}")
            return jsonify({"error": f"Failed to delete task with ID {task_id}"}), 500
    
    @app.route('/api/tasks/count', methods=['GET'])
    def get_tasks_count():
        """Get count of tasks grouped by status."""
        try:
            tasks_count = db.session.query(
                Task.status, 
                func.count(Task.id)
            ).group_by(Task.status).all()
            
            # Fix: Use the actual enum values from TaskStatus
            result = {}
            for status, count in tasks_count:
                result[status.name] = count  # Use enum member name (PENDING) instead of value (Pending)
            
            # Add any missing statuses with count 0 - use enum member names
            for status in TaskStatus.__members__.keys():  # This gets ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']
                if status not in result:
                    result[status] = 0
            
            return jsonify(result), 200
        except Exception as e:
            logger.error(f"Error fetching tasks count: {str(e)}")
            return jsonify({"error": "Failed to fetch tasks count"}), 500
            
    # ---------- Sales Pipeline Routes ----------
    @app.route('/api/sales/pipeline', methods=['GET'])
    def get_sales_pipeline():
        """Get contacts grouped by sales stage for pipeline view."""
        try:
            # Query all contacts that have a sales_stage
            pipeline_data = {}
            
            # Get all contacts with a sales stage
            contacts = Contact.query.filter(Contact.sales_stage.isnot(None)).all()
            
            # Group contacts by sales stage
            for contact in contacts:
                stage = contact.sales_stage.value
                if stage not in pipeline_data:
                    pipeline_data[stage] = []
                pipeline_data[stage].append(contact.to_dict())
            
            # Ensure all stages are present in response
            for stage in ['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']:
                if stage not in pipeline_data:
                    pipeline_data[stage] = []
            
            return jsonify(pipeline_data), 200
        except Exception as e:
            logger.error(f"Error fetching sales pipeline: {str(e)}")
            return jsonify({"error": "Failed to fetch sales pipeline data"}), 500
