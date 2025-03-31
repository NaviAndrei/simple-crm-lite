import os
import logging
from flask import send_from_directory, Flask
from backend.app import app

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Serve static files
@app.route('/static/<path:filename>')
def serve_static(filename):
    static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend', 'build', 'static')
    return send_from_directory(static_folder, filename)

# Serve add contact page
@app.route('/add')
def serve_add_page():
    static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend', 'build')
    return send_from_directory(static_folder, 'add.html')

# Serve edit contact page
@app.route('/edit/<contact_id>')
def serve_edit_page(contact_id):
    static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend', 'build')
    return send_from_directory(static_folder, 'edit.html')

# Serve React frontend - this route must be defined after all API routes
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    logger.debug(f"Serving path: {path}")
    static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend', 'build')
    
    # Special handling for /add and /edit routes
    if path.startswith('add'):
        return serve_add_page()
    elif path.startswith('edit/'):
        contact_id = path.split('/')[-1]
        return serve_edit_page(contact_id)
    elif path and os.path.exists(os.path.join(static_folder, path)):
        logger.debug(f"Serving file: {path}")
        return send_from_directory(static_folder, path)
    else:
        logger.debug("Serving index.html")
        return send_from_directory(static_folder, 'index.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)