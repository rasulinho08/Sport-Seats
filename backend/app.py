from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Float
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all domains for testing
bcrypt = Bcrypt(app)
app.config['JWT_SECRET_KEY'] = os.urandom(32).hex()  # Generate random secret key
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)

# PostgreSQL configuration
# Update with your actual PostgreSQL credentials
DATABASE_URL = "postgresql://postgres:postgres2025@localhost:5432/sport-seat"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
Base = declarative_base()

# User model
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    email = Column(String(120), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False)

# Event model
class Event(Base):
    __tablename__ = 'events'
    id = Column(Integer, primary_key=True)
    title = Column(String(100), nullable=False)
    description = Column(String(500))
    date = Column(DateTime, nullable=False)
    location = Column(String(200), nullable=False)
    available_seats = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    photo = Column(String(255))  # New column for photo filename

Base.metadata.create_all(engine)

# Directory for event images
EVENT_IMAGE_DIR = os.path.join(os.path.dirname(__file__), '../assets/images/events')
os.makedirs(EVENT_IMAGE_DIR, exist_ok=True)

# Register endpoint
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    session = Session()
    try:
        if session.query(User).filter_by(email=email).first():
            return jsonify({'message': 'Email already exists'}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        # Automatically set is_admin=True for the specified admin email
        is_admin = (email == 'mamishovrasul028@gmail.com')
        new_user = User(email=email, password=hashed_password, is_admin=is_admin)
        session.add(new_user)
        session.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        session.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        session.close()

# Login endpoint
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    session = Session()
    try:
        user = session.query(User).filter_by(email=email).first()
        if user and bcrypt.check_password_hash(user.password, password):
            access_token = create_access_token(identity={'id': user.id, 'email': user.email, 'is_admin': user.is_admin})
            return jsonify({
                'access_token': access_token,
                'user': {'id': user.id, 'email': user.email, 'is_admin': user.is_admin}
            }), 200
        return jsonify({'message': 'Invalid credentials'}), 401
    finally:
        session.close()

# Logout endpoint (client-side token removal)
@app.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'message': 'Logout successful'}), 200

# Admin: Create event endpoint
@app.route('/api/admin/events', methods=['POST'])
@jwt_required()
def create_event():
    identity = get_jwt_identity()
    if not identity['is_admin']:
        return jsonify({'message': 'Admin access required'}), 403

    if request.content_type and request.content_type.startswith('multipart/form-data'):
        data = request.form
        photo_file = request.files.get('photo')
    else:
        data = request.get_json()
        photo_file = None

    required_fields = ['title', 'description', 'date', 'location', 'available_seats', 'price']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400

    session = Session()
    try:
        photo_filename = None
        if photo_file:
            filename = secure_filename(photo_file.filename)
            photo_path = os.path.join(EVENT_IMAGE_DIR, filename)
            photo_file.save(photo_path)
            photo_filename = filename
        new_event = Event(
            title=data['title'],
            description=data['description'],
            date=data['date'],
            location=data['location'],
            available_seats=data['available_seats'],
            price=data['price'],
            photo=photo_filename
        )
        session.add(new_event)
        session.commit()
        return jsonify({'message': 'Event created successfully'}), 201
    except Exception as e:
        session.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        session.close()

# Admin: Get all events endpoint
@app.route('/api/admin/events', methods=['GET'])
@jwt_required()
def get_events():
    identity = get_jwt_identity()
    if not identity['is_admin']:
        return jsonify({'message': 'Admin access required'}), 403

    session = Session()
    try:
        events = session.query(Event).all()
        events_list = [{
            'id': event.id,
            'title': event.title,
            'description': event.description,
            'date': event.date.isoformat(),
            'location': event.location,
            'available_seats': event.available_seats,
            'price': event.price
        } for event in events]
        return jsonify(events_list), 200
    finally:
        session.close()

# Admin: Update event endpoint
@app.route('/api/admin/events/<int:event_id>', methods=['PUT'])
@jwt_required()
def update_event(event_id):
    identity = get_jwt_identity()
    if not identity['is_admin']:
        return jsonify({'message': 'Admin access required'}), 403

    session = Session()
    try:
        event = session.query(Event).filter_by(id=event_id).first()
        if not event:
            return jsonify({'message': 'Event not found'}), 404
        if request.content_type and request.content_type.startswith('multipart/form-data'):
            data = request.form
            photo_file = request.files.get('photo')
        else:
            data = request.get_json()
            photo_file = None
        for key in ['title', 'description', 'date', 'location', 'available_seats', 'price']:
            if key in data:
                setattr(event, key, data[key])
        if photo_file:
            filename = secure_filename(photo_file.filename)
            photo_path = os.path.join(EVENT_IMAGE_DIR, filename)
            photo_file.save(photo_path)
            event.photo = filename
        session.commit()
        return jsonify({'message': 'Event updated successfully'}), 200
    except Exception as e:
        session.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        session.close()

# Admin: Delete event endpoint
@app.route('/api/admin/events/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    identity = get_jwt_identity()
    if not identity['is_admin']:
        return jsonify({'message': 'Admin access required'}), 403

    session = Session()
    try:
        event = session.query(Event).filter_by(id=event_id).first()
        if not event:
            return jsonify({'message': 'Event not found'}), 404

        session.delete(event)
        session.commit()
        return jsonify({'message': 'Event deleted successfully'}), 200
    except Exception as e:
        session.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        session.close()

@app.route('/assets/images/events/<filename>')
def serve_event_image(filename):
    return app.send_static_file(os.path.join('..', 'assets', 'images', 'events', filename))

if __name__ == '__main__':
    app.run(debug=True)