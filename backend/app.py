import os
import logging

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy.orm import DeclarativeBase
from flask_migrate import Migrate # Import Flask-Migrate
from sqlalchemy import MetaData # Import MetaData for naming convention

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Define naming convention for constraints
# See: https://flask-sqlalchemy.palletsprojects.com/en/3.0.x/models/#define-models-and-tables
# And: https://alembic.sqlalchemy.org/en/latest/naming.html
convention = {
    "ix": 'ix_%(column_0_label)s',
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

class Base(DeclarativeBase):
    # Apply naming convention to the metadata used by the Base class
    metadata = MetaData(naming_convention=convention)

# Initialize SQLAlchemy with the Base class (which now includes metadata with naming convention)
db = SQLAlchemy(model_class=Base)

# Initialize Migrate - Added render_as_batch=True for SQLite compatibility
migrate = Migrate(render_as_batch=True) # Create Migrate instance with batch mode enabled

# Create the Flask application
app = Flask(__name__)

# Enable CORS
CORS(app)

# Configure the application
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

# Set up database - Folosim SQLite
# Creează calea absolută către directorul proiectului
basedir = os.path.abspath(os.path.dirname(__file__))
# Definește calea către fișierul bazei de date SQLite în directorul rădăcină al proiectului
db_path = os.path.join(os.path.dirname(basedir), 'crm_lite.db') 
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize the database and migrate with the app
db.init_app(app)
migrate.init_app(app, db) # Initialize Migrate with app and db

# !! IMPORTANT: Remove db.create_all() as migrations will handle the schema !!
# with app.app_context():
#    # Import models here to avoid circular imports
#    from backend.models import Contact, Company, Interaction, Notification, Meeting 
#    db.create_all()
#    logger.debug(f"Database tables created at {db_path}")

# Import routes
from backend.routes import register_routes  # Change to use backend package
register_routes(app)

logger.debug("Application initialized with Flask-Migrate (batch mode enabled)")
