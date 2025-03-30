import os
import logging
from flask import send_from_directory, Flask
from backend.app import app

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Serve React frontend - this route must be defined after all API routes
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    logger.debug(f"Serving path: {path}")
    static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend', 'build')
    
    if path and os.path.exists(os.path.join(static_folder, path)):
        logger.debug(f"Serving file: {path}")
        return send_from_directory(static_folder, path)
    else:
        logger.debug("Serving index.html")
        return send_from_directory(static_folder, 'index.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)