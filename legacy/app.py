from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import datetime
import os

app = Flask(__name__, static_folder='.')
CORS(app)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory('.', path)

# Database path
DB_PATH = 'database.sql' # In practice this would be a .db file, but we'll use sqlite here.
# Note: Since the provided file is database.sql, we'd need to run it to create an actual .db file.

def get_db_connection():
    # For this demonstration, we'll use a local sqlite database
    conn = sqlite3.connect('portfolio.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    # Read the schema from database.sql
    with open('database.sql', 'r') as f:
        schema = f.read()
    conn.executescript(schema)
    conn.commit()
    conn.close()

@app.route('/api/contact', methods=['POST'])
def contact():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')
    
    if not all([name, email, message]):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO contact_messages (sender_name, sender_email, message, received_at)
            VALUES (?, ?, ?, ?)
        ''', (name, email, message, datetime.datetime.now()))
        conn.commit()
        conn.close()
        return jsonify({"success": "Message sent successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/projects', methods=['GET'])
def get_projects():
    # For now, return static data or fetch from DB if populated
    projects = [
        {
            "title": "Resume Analyzer",
            "description": "AI-powered tool that analyzes resumes against job descriptions to provide compatibility scores.",
            "tags": ["NLP", "React", "Flask"],
            "img": "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=2070&auto=format&fit=crop"
        },
        {
            "title": "Ad Budget Optimizer",
            "description": "Smart system to optimize advertising spend across multiple platforms using ML for maximum ROI.",
            "tags": ["ML", "Python", "Data Viz"],
            "img": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
        },
        {
            "title": "SmartRoad",
            "description": "Real-time pothole detection system using computer vision to improve road safety.",
            "tags": ["Computer Vision", "IoT", "Python"],
            "img": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop"
        }
    ]
    return jsonify(projects)

if __name__ == '__main__':
    # Initialize the DB if it doesn't exist
    import os
    if not os.path.exists('portfolio.db'):
        init_db()
    app.run(debug=True, port=5000)
