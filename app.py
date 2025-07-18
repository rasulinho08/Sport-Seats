from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import IntegrityError, OperationalError
from datetime import timedelta
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

# Configuration
app.config["JWT_SECRET_KEY"] = "super-secret-key-change-in-production"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)

# Database configuration - Using SQLite for simplicity instead of PostgreSQL
DATABASE_URL = "sqlite:///sport_seat.db"

try:
    engine = create_engine(DATABASE_URL, echo=True)
    Session = sessionmaker(bind=engine)
    Base = declarative_base()
    logger.info("Database connection established successfully")
except Exception as e:
    logger.error(f"Database connection failed: {e}")
    raise

# User model
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(120), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "is_admin": self.is_admin
        }

# Create tables
try:
    Base.metadata.create_all(engine)
    logger.info("Database tables created successfully")
except Exception as e:
    logger.error(f"Failed to create tables: {e}")

# In-memory storage for events (for simplicity)
events = []
next_event_id = 1

# Routes for serving HTML files
@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/login.html")
def login_page():
    return send_from_directory(".", "login.html")

@app.route("/register.html")
def register_page():
    return send_from_directory(".", "register.html")

@app.route("/admin.html")
def admin_page():
    return send_from_directory(".", "admin.html")

# API Routes for User Management
@app.route("/api/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "No data provided"}), 400
            
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"message": "Email and password are required"}), 400

        # Basic email validation
        if "@" not in email or "." not in email:
            return jsonify({"message": "Invalid email format"}), 400

        # Password strength validation
        if len(password) < 6:
            return jsonify({"message": "Password must be at least 6 characters long"}), 400

        session = Session()
        try:
            # Check if user already exists
            existing_user = session.query(User).filter_by(email=email).first()
            if existing_user:
                return jsonify({"message": "Email already exists"}), 400

            # Hash password and create user
            hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
            is_admin = (email == "mamishovrasul028@gmail.com")
            
            new_user = User(email=email, password=hashed_password, is_admin=is_admin)
            session.add(new_user)
            session.commit()
            
            logger.info(f"New user registered: {email}")
            return jsonify({"message": "User registered successfully"}), 201

        except IntegrityError:
            session.rollback()
            return jsonify({"message": "Email already exists"}), 400
        except Exception as e:
            session.rollback()
            logger.error(f"Registration error: {e}")
            return jsonify({"message": "Registration failed"}), 500
        finally:
            session.close()

    except Exception as e:
        logger.error(f"Registration endpoint error: {e}")
        return jsonify({"message": "Server error"}), 500

@app.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "No data provided"}), 400
            
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"message": "Email and password are required"}), 400

        session = Session()
        try:
            user = session.query(User).filter_by(email=email).first()
            
            if user and bcrypt.check_password_hash(user.password, password):
                access_token = create_access_token(identity={
                    "id": user.id,
                    "email": user.email,
                    "is_admin": user.is_admin
                })
                
                logger.info(f"User logged in: {email}")
                return jsonify({
                    "access_token": access_token,
                    "user": user.to_dict()
                }), 200
            else:
                return jsonify({"message": "Invalid credentials"}), 401

        except Exception as e:
            logger.error(f"Login error: {e}")
            return jsonify({"message": "Login failed"}), 500
        finally:
            session.close()

    except Exception as e:
        logger.error(f"Login endpoint error: {e}")
        return jsonify({"message": "Server error"}), 500

@app.route("/api/admin/check", methods=["GET"])
@jwt_required()
def admin_check():
    try:
        identity = get_jwt_identity()
        return jsonify({"is_admin": identity["is_admin"]}), 200
    except Exception as e:
        logger.error(f"Admin check error: {e}")
        return jsonify({"message": "Server error"}), 500

@app.route("/api/users", methods=["GET"])
@jwt_required()
def get_users():
    try:
        identity = get_jwt_identity()
        if not identity["is_admin"]:
            return jsonify({"message": "Admin access required"}), 403

        session = Session()
        try:
            users = session.query(User).all()
            users_data = [user.to_dict() for user in users]
            return jsonify({"users": users_data}), 200
        finally:
            session.close()

    except Exception as e:
        logger.error(f"Get users error: {e}")
        return jsonify({"message": "Server error"}), 500

@app.route("/api/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    try:
        identity = get_jwt_identity()
        if not identity["is_admin"]:
            return jsonify({"message": "Admin access required"}), 403

        session = Session()
        try:
            user = session.query(User).filter_by(id=user_id).first()
            if not user:
                return jsonify({"message": "User not found"}), 404

            # Prevent admin from deleting themselves
            if user.id == identity["id"]:
                return jsonify({"message": "Cannot delete your own account"}), 400

            session.delete(user)
            session.commit()
            
            logger.info(f"User deleted by admin: {user.email}")
            return jsonify({"message": "User deleted successfully"}), 200

        finally:
            session.close()

    except Exception as e:
        logger.error(f"Delete user error: {e}")
        return jsonify({"message": "Server error"}), 500

# API Routes for Event Management
@app.route("/api/events", methods=["GET"])
def get_events():
    try:
        return jsonify({"events": events}), 200
    except Exception as e:
        logger.error(f"Get events error: {e}")
        return jsonify({"message": "Server error"}), 500

@app.route("/api/events", methods=["POST"])
def create_event():
    global next_event_id
    try:
        data = request.get_json(force=True)
        
        if not data:
            return jsonify({"message": "No data provided"}), 400

        # Check for required fields
        required_fields = ["title", "sport", "venue", "date", "time", "price"]
        missing_fields = [field for field in required_fields if field not in data or not data[field]]
        
        if missing_fields:
            return jsonify({"message": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        # Validate price
        try:
            price = float(data["price"])
            if price < 0:
                return jsonify({"message": "Price must be a positive number"}), 400
        except (ValueError, TypeError):
            return jsonify({"message": "Price must be a valid number"}), 400

        event = {
            "id": next_event_id,
            "title": data["title"],
            "sport": data["sport"],
            "venue": data["venue"],
            "date": data["date"],
            "time": data["time"],
            "price": price,
            "image": data.get("image", ""),
            "featured": data.get("featured", False)
        }

        events.append(event)
        next_event_id += 1

        logger.info(f"New event created: {event['title']}")
        return jsonify(event), 201
        
    except Exception as e:
        logger.error(f"Create event error: {e}")
        return jsonify({"message": f"Failed to create event: {str(e)}"}), 500

@app.route("/api/events/<int:event_id>", methods=["PUT"])
def update_event(event_id):
    try:
        data = request.get_json(force=True)
        
        if not data:
            return jsonify({"message": "No data provided"}), 400
            
        for event in events:
            if event["id"] == event_id:
                # Validate price if provided
                if "price" in data:
                    try:
                        price = float(data["price"])
                        if price < 0:
                            return jsonify({"message": "Price must be a positive number"}), 400
                        data["price"] = price
                    except (ValueError, TypeError):
                        return jsonify({"message": "Price must be a valid number"}), 400
                
                event.update(data)
                logger.info(f"Event updated: {event['title']}")
                return jsonify(event), 200
                
        return jsonify({"message": "Event not found"}), 404
        
    except Exception as e:
        logger.error(f"Update event error: {e}")
        return jsonify({"message": f"Failed to update event: {str(e)}"}), 500

@app.route("/api/events/<int:event_id>", methods=["DELETE"])
def delete_event(event_id):
    global events
    try:
        original_length = len(events)
        events = [event for event in events if event["id"] != event_id]
        
        if len(events) == original_length:
            return jsonify({"message": "Event not found"}), 404
            
        logger.info(f"Event deleted: ID {event_id}")
        return jsonify({"message": "Event deleted successfully"}), 200
        
    except Exception as e:
        logger.error(f"Delete event error: {e}")
        return jsonify({"message": f"Failed to delete event: {str(e)}"}), 500

# Health check endpoint
@app.route("/api/health", methods=["GET"])
def health_check():
    try:
        # Test database connection
        session = Session()
        try:
            session.execute("SELECT 1")
            db_status = "healthy"
        except Exception as e:
            db_status = f"unhealthy: {str(e)}"
        finally:
            session.close()

        return jsonify({
            "status": "healthy",
            "database": db_status,
            "events_count": len(events)
        }), 200

    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"message": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"message": "Internal server error"}), 500

if __name__ == "__main__":
    logger.info("Starting Flask application...")
    app.run(host="0.0.0.0", port=5000, debug=True)

