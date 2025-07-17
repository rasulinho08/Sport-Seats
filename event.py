from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from datetime import datetime, date, time
import os
from src.models.event import Event
from src.models.user import db

event_bp = Blueprint("event", __name__)

# Configuration for file uploads
UPLOAD_FOLDER = "src/static/assets/images"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@event_bp.route("/events", methods=["GET", "POST"])
def handle_events():
    if request.method == "POST":
        # Logic for creating a new event
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ["title", "sport", "venue", "date", "time", "price"]
            for field in required_fields:
                if field not in data:
                    return jsonify({
                        "success": False,
                        "message": f"Missing required field: {field}"
                    }), 400
            
            # Parse date and time
            event_date = datetime.strptime(data["date"], "%Y-%m-%d").date()
            event_time = datetime.strptime(data["time"], "%H:%M").time()
            
            # Create new event
            new_event = Event(
                title=data["title"],
                sport=data["sport"],
                venue=data["venue"],
                date=event_date,
                time=event_time,
                price=float(data["price"]),
                image=data.get("image", ""),
                featured=data.get("featured", False)
            )
            
            db.session.add(new_event)
            db.session.commit()
            
            return jsonify({
                "success": True,
                "message": "Event created successfully",
                "event": new_event.to_dict()
            }), 201
            
        except ValueError as e:
            return jsonify({
                "success": False,
                "message": f"Invalid date/time format: {str(e)}"
            }), 400
        except Exception as e:
            db.session.rollback()
            return jsonify({
                "success": False,
                "message": f"Error creating event: {str(e)}"
            }), 500
    else: # GET request
        # Logic for getting all events
        try:
            events = Event.query.all()
            return jsonify({
                "success": True,
                "events": [event.to_dict() for event in events]
            }), 200
        except Exception as e:
            return jsonify({
                "success": False,
                "message": f"Error fetching events: {str(e)}"
            }), 500

@event_bp.route("/events/<int:event_id>", methods=["GET", "PUT", "DELETE"])
def handle_single_event(event_id):
    event = Event.query.get_or_404(event_id)

    if request.method == "GET":
        """Get specific event by ID"""
        return jsonify({
            "success": True,
            "event": event.to_dict()
        }), 200

    elif request.method == "PUT":
        """Update an existing event"""
        try:
            data = request.get_json()
            
            # Update fields if provided
            if "title" in data:
                event.title = data["title"]
            if "sport" in data:
                event.sport = data["sport"]
            if "venue" in data:
                event.venue = data["venue"]
            if "date" in data:
                event.date = datetime.strptime(data["date"], "%Y-%m-%d").date()
            if "time" in data:
                event.time = datetime.strptime(data["time"], "%H:%M").time()
            if "price" in data:
                event.price = float(data["price"])
            if "image" in data:
                event.image = data["image"]
            if "featured" in data:
                event.featured = data["featured"]
            
            event.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify({
                "success": True,
                "message": "Event updated successfully",
                "event": event.to_dict()
            }), 200
            
        except ValueError as e:
            return jsonify({
                "success": False,
                "message": f"Invalid date/time format: {str(e)}"
            }), 400
        except Exception as e:
            db.session.rollback()
            return jsonify({
                "success": False,
                "message": f"Error updating event: {str(e)}"
            }), 500

    elif request.method == "DELETE":
        """Delete an event"""
        try:
            db.session.delete(event)
            db.session.commit()
            
            return jsonify({
                "success": True,
                "message": "Event deleted successfully"
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({
                "success": False,
                "message": f"Error deleting event: {str(e)}"
            }), 500

@event_bp.route("/events/<int:event_id>/upload-image", methods=["POST"])
def upload_event_image(event_id):
    """Upload image for an event"""
    try:
        event = Event.query.get_or_404(event_id)
        
        if "file" not in request.files:
            return jsonify({
                "success": False,
                "message": "No file provided"
            }), 400
        
        file = request.files["file"]
        
        if file.filename == "":
            return jsonify({
                "success": False,
                "message": "No file selected"
            }), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Add timestamp to avoid filename conflicts
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_")
            filename = timestamp + filename
            
            # Ensure upload directory exists
            upload_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), UPLOAD_FOLDER)
            os.makedirs(upload_path, exist_ok=True)
            
            file_path = os.path.join(upload_path, filename)
            file.save(file_path)
            
            # Update event image path
            event.image = f"assets/images/{filename}"
            event.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify({
                "success": True,
                "message": "Image uploaded successfully",
                "image_path": event.image
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Invalid file type. Allowed types: png, jpg, jpeg, gif"
            }), 400
            
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Error uploading image: {str(e)}"
        }), 500
