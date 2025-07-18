from flask import Blueprint, request, jsonify
from src.models.user import db, User # Assuming User model is defined in src/models/user.py

user_bp = Blueprint("user", __name__)

@user_bp.route("/register", methods=["POST"])
def register_user():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password") # In a real app, you'd hash this

    if not username or not email or not password:
        return jsonify({"message": "Missing username, email, or password"}), 400

    # Basic check for existing user (you'd add proper hashing and validation)
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"message": "Username already exists"}), 409

    new_user = User(username=username, email=email) # Password handling omitted for brevity
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully", "user": new_user.to_dict()}), 201

@user_bp.route("/login", methods=["POST"])
def login_user():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    # In a real app, you'd verify hashed password
    user = User.query.filter_by(username=username).first()

    if user and password == "password": # Placeholder password check
        return jsonify({"message": "Login successful", "user": user.to_dict()}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

@user_bp.route("/users", methods=["GET"])
def get_all_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200


