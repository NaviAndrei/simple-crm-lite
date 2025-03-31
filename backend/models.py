from backend.app import db
from datetime import datetime
from enum import Enum as PyEnum
import logging

# Get a logger instance
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

# Define Enums for contact type and sales stage
class ContactType(PyEnum):
    LEAD = 'LEAD'
    CUSTOMER = 'CUSTOMER'
    PROSPECT = 'PROSPECT'
    OTHER = 'OTHER'

class SalesStage(PyEnum):
    PROSPECTING = 'PROSPECTING'
    QUALIFICATION = 'QUALIFICATION'
    PROPOSAL = 'PROPOSAL'
    NEGOTIATION = 'NEGOTIATION'
    CLOSED_WON = 'CLOSED_WON'
    CLOSED_LOST = 'CLOSED_LOST'

class TaskStatus(PyEnum):
    PENDING = 'Pending'
    IN_PROGRESS = 'In Progress'
    COMPLETED = 'Completed'
    OVERDUE = 'Overdue'

class Contact(db.Model):
    """Model for storing contact information."""
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    contact_type = db.Column(db.Enum(ContactType, native_enum=False, validate_strings=True), nullable=False, default=ContactType.LEAD)
    sales_stage = db.Column(db.Enum(SalesStage, native_enum=False, validate_strings=True), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Add relationship with Company
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'))
    company = db.relationship('Company', back_populates='contacts')

    # One-to-many relationship with interactions
    interactions = db.relationship('Interaction', back_populates='contact', lazy='dynamic', cascade="all, delete-orphan")
    
    # Relația cu meetings
    meetings = db.relationship('Meeting', secondary='meeting_attendees', back_populates='attendees')

    # One-to-many relationship with tasks
    tasks = db.relationship('Task', back_populates='contact', lazy='dynamic', cascade="all, delete-orphan")

    def to_dict(self):
        """Convert the model instance to a dictionary."""
        logger.debug(f"Contact ID {self.id}: Raw sales_stage type={type(self.sales_stage)}, value={repr(self.sales_stage)}")
        try:
            sales_stage_value = self.sales_stage.value if self.sales_stage else None
        except Exception as e:
            logger.error(f"Contact ID {self.id}: Error accessing sales_stage.value: {e}", exc_info=True)
            sales_stage_value = "ERROR_ACCESSING_VALUE"

        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'contact_type': self.contact_type.value if self.contact_type else None,
            'sales_stage': sales_stage_value,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'company_id': self.company_id,
            'company': self.company.to_dict() if self.company else None,
            # Optionally include interactions count or simplified list
            # 'interactions_count': self.interactions.count()
            # Optionally include tasks count
            # 'tasks_count': self.tasks.count()
        }

    # Simple dict to avoid deep nesting in related models
    def to_dict_simple(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email
        }

class Company(db.Model):
    """Model for storing company information."""
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    website = db.Column(db.String(200))
    address = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # One-to-many relationship with contacts
    contacts = db.relationship('Contact', back_populates='company', lazy=True)

    # One-to-many relationship with interactions
    interactions = db.relationship('Interaction', back_populates='company', lazy='dynamic', cascade="all, delete-orphan")
    
    # Relația cu meetings
    meetings = db.relationship('Meeting', back_populates='company', lazy='dynamic')

    # One-to-many relationship with tasks
    tasks = db.relationship('Task', back_populates='company', lazy='dynamic', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Company {self.name}>'

    def to_dict(self):
        """Convert the model instance to a dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'website': self.website,
            'address': self.address,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'contacts_count': len(self.contacts),
            # Optionally include interactions count or simplified list
            # 'interactions_count': self.interactions.count()
            # 'tasks_count': self.tasks.count()
        }

    # Simple dict to avoid deep nesting in related models
    def to_dict_simple(self):
        return {
            'id': self.id,
            'name': self.name
        }

class Interaction(db.Model):
    """Model pentru stocarea interacțiunilor/activităților."""
    id = db.Column(db.Integer, primary_key=True)
    interaction_type = db.Column(db.String(50), nullable=False)  # e.g., 'Call', 'Email', 'Meeting', 'Note'
    notes = db.Column(db.Text, nullable=True)
    interaction_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Legături către Contact și Companie (opționale, dar cel puțin una trebuie să fie prezentă)
    contact_id = db.Column(db.Integer, db.ForeignKey('contact.id'), nullable=True)
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'), nullable=True)
    
    # Definirea relațiilor inverse
    contact = db.relationship('Contact', back_populates='interactions')
    company = db.relationship('Company', back_populates='interactions')

    def __repr__(self):
        return f'<Interaction {self.id} - Type: {self.interaction_type}>'

    def to_dict(self):
        """Convertește instanța modelului într-un dicționar."""
        return {
            'id': self.id,
            'interaction_type': self.interaction_type,
            'notes': self.notes,
            'interaction_date': self.interaction_date.isoformat() if self.interaction_date else None,
            'contact_id': self.contact_id,
            'company_id': self.company_id,
            # Optional: include simplified contact/company info if needed
            'contact': self.contact.to_dict_simple() if self.contact else None,
            'company': self.company.to_dict_simple() if self.company else None
        }

class Notification(db.Model):
    """Model pentru stocarea notificărilor de sistem."""
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(255), nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Câmpuri opționale pentru a lega notificarea de o resursă specifică
    link_contact_id = db.Column(db.Integer, db.ForeignKey('contact.id'), nullable=True)
    link_company_id = db.Column(db.Integer, db.ForeignKey('company.id'), nullable=True)
    link_interaction_id = db.Column(db.Integer, db.ForeignKey('interaction.id'), nullable=True) # Poate link direct la interacțiune?
    
    # Nu definim relații inverse complexe aici pentru simplitate

    def __repr__(self):
        return f'<Notification {self.id} - Read: {self.is_read}>'

    def to_dict(self):
        """Convertește instanța modelului într-un dicționar."""
        return {
            'id': self.id,
            'message': self.message,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'link_contact_id': self.link_contact_id,
            'link_company_id': self.link_company_id,
            'link_interaction_id': self.link_interaction_id
        }

# Tabela de asociere pentru relația many-to-many între Meeting și Contact (participanți)
meeting_attendees = db.Table('meeting_attendees',
    db.Column('meeting_id', db.Integer, db.ForeignKey('meeting.id'), primary_key=True),
    db.Column('contact_id', db.Integer, db.ForeignKey('contact.id'), primary_key=True)
)

class Meeting(db.Model):
    """Model pentru stocarea întâlnirilor."""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(200), nullable=True)
    start = db.Column(db.DateTime, nullable=False)
    end = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='confirmed')  # confirmed, tentative, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Legătura cu compania (opțional)
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'), nullable=True)
    company = db.relationship('Company', back_populates='meetings')
    
    # Relația many-to-many cu contactele (participanții)
    attendees = db.relationship('Contact', secondary=meeting_attendees, back_populates='meetings')
    
    def __repr__(self):
        return f'<Meeting {self.id} - Title: {self.title}>'
    
    def to_dict(self):
        """Convertește instanța modelului într-un dicționar."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'location': self.location,
            'start': self.start.isoformat() if self.start else None,
            'end': self.end.isoformat() if self.end else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'company_id': self.company_id,
            'company_name': self.company.name if self.company else None,
            'attendees': [{'id': contact.id, 'name': contact.name} for contact in self.attendees]
        }

# New Model: Task
class Task(db.Model):
    """Model pentru stocarea sarcinilor (tasks)."""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    due_date = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.Enum(TaskStatus), nullable=False, default=TaskStatus.PENDING)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Legături către Contact și Companie (cel puțin una ar trebui să fie prezentă, de obicei)
    contact_id = db.Column(db.Integer, db.ForeignKey('contact.id'), nullable=True)
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'), nullable=True)

    # Optional: Link to the user who is assigned the task, if user model exists
    # assigned_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    # Relații inverse
    contact = db.relationship('Contact', back_populates='tasks')
    company = db.relationship('Company', back_populates='tasks')
    
    def __repr__(self):
        return f'<Task {self.id} - {self.title} - Status: {self.status.value}>'
        
    def to_dict(self):
        """Convert task to dictionary representation."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'status': self.status.value if self.status else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'contact_id': self.contact_id,
            'company_id': self.company_id,
            'contact_name': self.contact.name if self.contact else None,
            'company_name': self.company.name if self.company else None
        }
