from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text, Float, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from sqlalchemy.exc import IntegrityError, OperationalError
from datetime import timedelta, datetime
import os
import logging
from flask_socketio import SocketIO, emit
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

# Configuration
app.config["JWT_SECRET_KEY"] = "super-secret-key-change-in-production"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config['SECRET_KEY'] = 'secret!'
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Database configuration - Using SQLite
DATABASE_URL = "sqlite:///sport_seats_enhanced.db"

try:
    engine = create_engine(DATABASE_URL, echo=True)
    Session = sessionmaker(bind=engine)
    Base = declarative_base()
    logger.info("Database connection established successfully")
except Exception as e:
    logger.error(f"Database connection failed: {e}")
    raise

# Enhanced User model
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(120), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to profile
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="user", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "is_admin": self.is_admin,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "profile": self.profile.to_dict() if self.profile else None
        }

# User Profile model
class UserProfile(Base):
    __tablename__ = "user_profiles"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    full_name = Column(String(100))
    phone = Column(String(20))
    date_of_birth = Column(String(10))  # YYYY-MM-DD format
    gender = Column(String(10))
    country = Column(String(50))
    avatar_url = Column(String(255))
    bio = Column(Text)
    preferences = Column(Text)  # JSON string for user preferences
    email_verified = Column(Boolean, default=False)
    sms_2fa_enabled = Column(Boolean, default=False)
    app_2fa_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="profile")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "full_name": self.full_name,
            "phone": self.phone,
            "date_of_birth": self.date_of_birth,
            "gender": self.gender,
            "country": self.country,
            "avatar_url": self.avatar_url,
            "bio": self.bio,
            "preferences": self.preferences,
            "email_verified": self.email_verified,
            "sms_2fa_enabled": self.sms_2fa_enabled,
            "app_2fa_enabled": self.app_2fa_enabled,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

# Booking model
class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    event_id = Column(Integer, nullable=False)
    booking_reference = Column(String(20), unique=True, nullable=False)
    event_title = Column(String(200), nullable=False)
    event_venue = Column(String(100), nullable=False)
    event_date = Column(String(10), nullable=False)
    event_time = Column(String(10), nullable=False)
    seat_section = Column(String(50))
    seat_row = Column(String(10))
    seat_number = Column(String(10))
    ticket_price = Column(Float, nullable=False)
    booking_fee = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    status = Column(String(20), default='confirmed')  # confirmed, cancelled, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="bookings")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "event_id": self.event_id,
            "booking_reference": self.booking_reference,
            "event_title": self.event_title,
            "event_venue": self.event_venue,
            "event_date": self.event_date,
            "event_time": self.event_time,
            "seat_section": self.seat_section,
            "seat_row": self.seat_row,
            "seat_number": self.seat_number,
            "ticket_price": self.ticket_price,
            "booking_fee": self.booking_fee,
            "total_amount": self.total_amount,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

# Payment model
class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    booking_id = Column(Integer, ForeignKey('bookings.id'))
    payment_reference = Column(String(50), unique=True, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default='USD')
    payment_method = Column(String(50))  # card, paypal, etc.
    card_last_four = Column(String(4))
    card_brand = Column(String(20))  # visa, mastercard, etc.
    status = Column(String(20), default='completed')  # pending, completed, failed, refunded
    transaction_id = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="payments")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "booking_id": self.booking_id,
            "payment_reference": self.payment_reference,
            "amount": self.amount,
            "currency": self.currency,
            "payment_method": self.payment_method,
            "card_last_four": self.card_last_four,
            "card_brand": self.card_brand,
            "status": self.status,
            "transaction_id": self.transaction_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

# Create tables
try:
    Base.metadata.create_all(engine)
    logger.info("Database tables created successfully")
except Exception as e:
    logger.error(f"Failed to create tables: {e}")

# Sample events data
events = [
    {
        "id": 1,
        "title": "NBA Finals Game 1",
        "sport": "Basketball",
        "venue": "Grand Arena",
        "date": "2025-09-15",
        "time": "19:00",
        "price": 125.00,
        "image": "/static/images/basketball.jpg",
        "featured": True
    },
    {
        "id": 2,
        "title": "NHL Stanley Cup Playoffs",
        "sport": "Hockey",
        "venue": "Grand Arena",
        "date": "2025-09-20",
        "time": "20:00",
        "price": 95.00,
        "image": "/static/images/hockey.jpg",
        "featured": False
    },
    {
        "id": 3,
        "title": "England vs Germany",
        "sport": "Football",
        "venue": "Wembley Stadium",
        "date": "2025-10-01",
        "time": "15:00",
        "price": 85.00,
        "image": "/static/images/football.jpg",
        "featured": True
    }
]

# Helper function to generate booking reference
def generate_booking_reference():
    return f"SS{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:6].upper()}"

# Helper function to generate payment reference
def generate_payment_reference():
    return f"PAY{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:8].upper()}"

# Routes for serving HTML files
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/login_new.html")
def login_new_page():
    return send_from_directory('.', 'login_new.html')

@app.route("/register_new.html")
def register_new_page():
    return send_from_directory('.', 'register_new.html')

@app.route("/dashboard.html")
def dashboard_page():
    return send_from_directory('.', 'dashboard.html')

@app.route("/dashboard_enhanced.html")
def dashboard_enhanced_page():
    return send_from_directory('.', 'dashboard_enhanced.html')

# API Routes for User Management
@app.route("/api/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "No data provided"}), 400
            
        email = data.get("email")
        password = data.get("password")
        name = data.get("name", "")

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
            session.flush()  # Get the user ID
            
            # Create default profile
            profile = UserProfile(
                user_id=new_user.id,
                full_name=name if name else "User",
                email_verified=False
            )
            session.add(profile)
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

# User Profile API Routes
@app.route("/api/me", methods=["GET"])
@jwt_required()
def get_current_user():
    try:
        identity = get_jwt_identity()
        user_id = identity["id"]
        
        session = Session()
        try:
            user = session.query(User).filter_by(id=user_id).first()
            if not user:
                return jsonify({"message": "User not found"}), 404



            
            return jsonify({"user": user.to_dict()}), 200
            
        finally:
            session.close()
            
    except Exception as e:
        logger.error(f"Get current user error: {e}")
        return jsonify({"message": "Server error"}), 500

@app.route("/api/me", methods=["PUT"])
@jwt_required()
def update_current_user():
    try:
        identity = get_jwt_identity()
        user_id = identity["id"]
        data = request.get_json()
        
        if not data:
            return jsonify({"message": "No data provided"}), 400
        
        session = Session()
        try:
            user = session.query(User).filter_by(id=user_id).first()
            if not user:
                return jsonify({"message": "User not found"}), 404
            
            # Update profile
            if not user.profile:
                user.profile = UserProfile(user_id=user_id)
                session.add(user.profile)
            
            profile = user.profile
            
            # Update profile fields
            if "full_name" in data:
                profile.full_name = data["full_name"]
            if "phone" in data:
                profile.phone = data["phone"]
            if "date_of_birth" in data:
                profile.date_of_birth = data["date_of_birth"]
            if "gender" in data:
                profile.gender = data["gender"]
            if "country" in data:
                profile.country = data["country"]
            if "bio" in data:
                profile.bio = data["bio"]
            if "preferences" in data:
                profile.preferences = data["preferences"]
            if "sms_2fa_enabled" in data:
                profile.sms_2fa_enabled = data["sms_2fa_enabled"]
            if "app_2fa_enabled" in data:
                profile.app_2fa_enabled = data["app_2fa_enabled"]
            
            profile.updated_at = datetime.utcnow()
            session.commit()
            
            logger.info(f"User profile updated: {user.email}")
            return jsonify({"user": user.to_dict()}), 200
            
        finally:
            session.close()
            
    except Exception as e:
        logger.error(f"Update current user error: {e}")
        return jsonify({"message": "Server error"}), 500

@app.route("/api/me/bookings", methods=["GET"])
@jwt_required()
def get_user_bookings():
    try:
        identity = get_jwt_identity()
        user_id = identity["id"]
        
        session = Session()
        try:
            bookings = session.query(Booking).filter_by(user_id=user_id).order_by(Booking.created_at.desc()).all()
            bookings_data = [booking.to_dict() for booking in bookings]
            
            return jsonify({"bookings": bookings_data}), 200
            
        finally:
            session.close()
            
    except Exception as e:
        logger.error(f"Get user bookings error: {e}")
        return jsonify({"message": "Server error"}), 500

@app.route("/api/me/payments", methods=["GET"])
@jwt_required()
def get_user_payments():
    try:
        identity = get_jwt_identity()
        user_id = identity["id"]
        
        session = Session()
        try:
            payments = session.query(Payment).filter_by(user_id=user_id).order_by(Payment.created_at.desc()).all()
            payments_data = [payment.to_dict() for payment in payments]
            
            return jsonify({"payments": payments_data}), 200
            
        finally:
            session.close()
            
    except Exception as e:
        logger.error(f"Get user payments error: {e}")
        return jsonify({"message": "Server error"}), 500

# Booking API Routes
@app.route("/api/bookings", methods=["POST"])
@jwt_required()
def create_booking():
    try:
        identity = get_jwt_identity()
        user_id = identity["id"]
        data = request.get_json()
        
        if not data:
            return jsonify({"message": "No data provided"}), 400
        
        required_fields = ["event_id", "event_title", "event_venue", "event_date", "event_time", "ticket_price"]
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({"message": f"Missing required fields: {', '.join(missing_fields)}"}), 400
        
        session = Session()
        try:
            booking_fee = data.get("booking_fee", 5.0)
            total_amount = float(data["ticket_price"]) + booking_fee
            
            booking = Booking(
                user_id=user_id,
                event_id=data["event_id"],
                booking_reference=generate_booking_reference(),
                event_title=data["event_title"],
                event_venue=data["event_venue"],
                event_date=data["event_date"],
                event_time=data["event_time"],
                seat_section=data.get("seat_section", "General"),
                seat_row=data.get("seat_row", "A"),
                seat_number=data.get("seat_number", "1"),
                ticket_price=float(data["ticket_price"]),
                booking_fee=booking_fee,
                total_amount=total_amount,
                status="confirmed"
            )
            
            session.add(booking)
            session.flush()
            
            # Create payment record
            payment = Payment(
                user_id=user_id,
                booking_id=booking.id,
                payment_reference=generate_payment_reference(),
                amount=total_amount,
                currency="USD",
                payment_method=data.get("payment_method", "card"),
                card_last_four=data.get("card_last_four", "4242"),
                card_brand=data.get("card_brand", "visa"),
                status="completed",
                transaction_id=f"txn_{str(uuid.uuid4())[:12]}"
            )
            
            session.add(payment)
            session.commit()
            
            logger.info(f"Booking created: {booking.booking_reference}")
            return jsonify({"booking": booking.to_dict()}), 201
            
        finally:
            session.close()
            
    except Exception as e:
        logger.error(f"Create booking error: {e}")
        return jsonify({"message": "Server error"}), 500

# Admin API Routes
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

# Events API Routes
@app.route("/api/events", methods=["GET"])
def get_events():
    return jsonify({"events": events}), 200

@app.route("/api/events", methods=["POST"])
def create_event():
    try:
        data = request.get_json(force=True)
        
        if not data:
            return jsonify({"message": "No data provided"}), 400

        required_fields = ["title", "sport", "venue", "date", "time", "price"]
        missing_fields = [field for field in required_fields if field not in data or not data[field]]
        
        if missing_fields:
            return jsonify({"message": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        try:
            price = float(data["price"])
            if price < 0:
                return jsonify({"message": "Price must be a positive number"}), 400
        except (ValueError, TypeError):
            return jsonify({"message": "Price must be a valid number"}), 400

        event_id = max([e["id"] for e in events], default=0) + 1
        event = {
            "id": event_id,
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
        logger.info(f"New event created: {event['title']}")
        return jsonify(event), 201
        
    except Exception as e:
        logger.error(f"Create event error: {e}")
        return jsonify({"message": f"Failed to create event: {str(e)}"}), 500

# Initialize sample data
def initialize_sample_data():
    session = Session()
    try:
        # Check if admin user exists
        admin_user = session.query(User).filter_by(email="mamishovrasul028@gmail.com").first()
        if not admin_user:
            # Create admin user
            hashed_password = bcrypt.generate_password_hash("admin123").decode("utf-8")
            admin_user = User(
                email="mamishovrasul028@gmail.com",
                password=hashed_password,
                is_admin=True
            )
            session.add(admin_user)
            session.flush()
            
            # Create admin profile
            admin_profile = UserProfile(
                user_id=admin_user.id,
                full_name="Rasul Mamishov",
                email_verified=True,
                country="Azerbaijan"
            )
            session.add(admin_profile)
            
        # Create sample user if doesn't exist
        sample_user = session.query(User).filter_by(email="user@example.com").first()
        if not sample_user:
            hashed_password = bcrypt.generate_password_hash("user123").decode("utf-8")
            sample_user = User(
                email="user@example.com",
                password=hashed_password,
                is_admin=False
            )
            session.add(sample_user)
            session.flush()
            
            # Create sample profile
            sample_profile = UserProfile(
                user_id=sample_user.id,
                full_name="John Doe",
                phone="+1 (555) 123-4567",
                date_of_birth="1995-06-15",
                gender="Male",
                country="United States",
                email_verified=True,
                bio="Sports enthusiast and regular event attendee"
            )
            session.add(sample_profile)
            
            # Create sample bookings
            # sample_bookings = [
            #     Booking(
            #         user_id=sample_user.id,
            #         event_id=1,
            #         booking_reference=generate_booking_reference(),
            #         event_title="NBA Finals Game 1",
            #         event_venue="Grand Arena",
            #         event_date="2025-09-15",
            #         event_time="19:00",
            #         seat_section="Lower Bowl",
            #         seat_row="C",
            #         seat_number="15",
            #         ticket_price=125.00,
            #         booking_fee=5.00,
            #         total_amount=130.00,
            #         status="confirmed"
            #     ),
            #     Booking(
            #         user_id=sample_user.id,
            #         event_id=2,
            #         booking_reference=generate_booking_reference(),
            #         event_title="NHL Stanley Cup Playoffs",
            #         event_venue="Grand Arena",
            #         event_date="2025-09-20",
            #         event_time="20:00",
            #         seat_section="Upper Deck",
            #         seat_row="M",
            #         seat_number="8",
            #         ticket_price=95.00,
            #         booking_fee=5.00,
            #         total_amount=100.00,
            #         status="confirmed"
            #     )
            # ]
            
            for booking in sample_bookings:
                session.add(booking)
                session.flush()
                
                # Create corresponding payment
                payment = Payment(
                    user_id=sample_user.id,
                    booking_id=booking.id,
                    payment_reference=generate_payment_reference(),
                    amount=booking.total_amount,
                    currency="USD",
                    payment_method="card",
                    card_last_four="4242",
                    card_brand="visa",
                    status="completed",
                    transaction_id=f"txn_{str(uuid.uuid4())[:12]}"
                )
                session.add(payment)
        
        session.commit()
        logger.info("Sample data initialized successfully")
        
    except Exception as e:
        session.rollback()
        logger.error(f"Failed to initialize sample data: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    initialize_sample_data()
    app.run(host="0.0.0.0", port=5000, debug=True)

