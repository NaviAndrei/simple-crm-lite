import os
import logging

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy.orm import DeclarativeBase

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class Base(DeclarativeBase):
    pass

# Initialize SQLAlchemy with the Base class
db = SQLAlchemy(model_class=Base)

# Create the Flask application
app = Flask(__name__)

# Enable CORS
CORS(app)

# Configure the application
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

# Set up database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Initialize the database with the app
db.init_app(app)

# Create all tables
with app.app_context():
    # Import models here to avoid circular imports
    from backend.models import Contact
    db.create_all()
    logger.debug("Database tables created")

# Import routes
from backend.routes import register_routes
register_routes(app)

logger.debug("Application initialized")
