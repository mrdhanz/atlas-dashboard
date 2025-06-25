# backend/services/cicd-connector-py/app.py
import os
import logging
import time
import threading
from flask import Flask, request, jsonify
import requests
import redis

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# The internal URL of our Node.js service's broadcast endpoint
# We will create this endpoint in the next step.
NODE_SERVICE_BROADCAST_URL = "http://localhost:8081/api/internal/broadcast"

@app.route('/api/v1/hooks/generic', methods=['POST'])
def handle_generic_hook():
    """
    Receives a generic webhook, transforms it, and forwards it for broadcast.
    In a real app, you'd have specific handlers for gitlab, github, etc.
    """
    data = request.json
    app.logger.info(f"Received webhook: {data}")

    # Basic validation
    if not data or 'projectName' not in data or 'status' not in data:
        return jsonify({"error": "Invalid payload"}), 400

    # Transform the payload into our standard event format
    event_payload = {
        "type": "PIPELINE_UPDATE",
        "payload": {
            "projectName": data.get("projectName"),
            "status": data.get("status"),
            "commitMessage": data.get("commitMessage", "N/A"),
            "timestamp": data.get("timestamp")
        }
    }

    # Forward the event to the Node.js service to be broadcasted via WebSocket
    try:
        requests.post(NODE_SERVICE_BROADCAST_URL, json=event_payload)
        app.logger.info(f"Forwarded event to Node.js service: {event_payload}")
        return jsonify({"status": "event forwarded"}), 200
    except requests.exceptions.RequestException as e:
        app.logger.error(f"Failed to forward event to Node.js service: {e}")
        return jsonify({"error": "failed to contact broadcast service"}), 500

# Connect to Redis
r = redis.Redis(host='flexible-pug-51108.upstash.io', password='AcekAAIjcDE4NjEzY2QxZjRlNjg0N2E3YjNhYWZhYjgxYmRiY2U0MXAxMA', port=6379, ssl=True, db=0, decode_responses=True)

def report_health():
    while True:
        try:
            # Set a key with an expiration of 30 seconds
            r.set("health:cicd-py", "healthy", ex=30)
        except redis.exceptions.RedisError as e:
            app.logger.error(f"Could not report health to Redis: {e}")
        time.sleep(15) # Report every 15 seconds

# Start the health reporting in a background thread
health_thread = threading.Thread(target=report_health, daemon=True)
health_thread.start()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8082)