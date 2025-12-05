from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from backend.models import db, User
from backend.services.trip_service import TripService
from backend.services.expense_service import ExpenseService
from backend.services.member_service import MemberService
from backend.services.activity_service import ActivityService
from backend.services.driver_service import DriverService
from backend.services.hotel_service import HotelService

api = Blueprint('api', __name__)

# ============================================
# Authentication Routes
# ============================================

@api.route('/auth/register', methods=['POST'])
def register():
    data = request.json
    try:
        username = data['username']
        password = data['password']
        email = data.get('email')
        
        existing_user = db.session.execute(db.select(User).filter_by(username=username)).scalar()
        if existing_user:
            return jsonify({"message": "Username already exists"}), 400
        
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        login_user(user)
        return jsonify(user.to_dict()), 201
    except KeyError as e:
        return jsonify({"message": f"Missing field: {str(e)}"}), 400

@api.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    try:
        username = data['username']
        password = data['password']
        
        user = db.session.execute(db.select(User).filter_by(username=username)).scalar()
        if not user or not user.check_password(password):
            return jsonify({"message": "Invalid username or password"}), 401
        
        login_user(user)
        return jsonify(user.to_dict()), 200
    except KeyError as e:
        return jsonify({"message": f"Missing field: {str(e)}"}), 400

@api.route('/auth/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200

@api.route('/auth/user', methods=['GET'])
def get_current_user():
    if current_user.is_authenticated:
        return jsonify(current_user.to_dict()), 200
    return jsonify({"message": "Not authenticated"}), 401

@api.route('/auth/user', methods=['PUT'])
@login_required
def update_user():
    try:
        data = request.json
        user = current_user
        
        if 'name' in data:
            user.username = data['name'] # Using username as name
        if 'email' in data:
            user.email = data['email']
        if 'password' in data:
            user.set_password(data['password'])
            
        db.session.commit()
        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@api.route('/auth/user', methods=['DELETE'])
@login_required
def delete_user():
    try:
        user = current_user
        db.session.delete(user)
        db.session.commit()
        logout_user()
        return jsonify({"message": "Account deleted"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400


# ============================================
# Trip Routes (Using Service Layer - OOP)
# ============================================

@api.route('/trips', methods=['GET'])
@login_required # Ensure login
def get_trips():
    # Only get trips for current user
    trips = TripService.get_user_trips(current_user.id)
    return jsonify([trip.to_dict() for trip in trips])

@api.route('/trips/<id>', methods=['GET'])
@login_required 
def get_trip(id):
    trip = TripService.get_trip_by_id(id)
    if not trip:
        return jsonify({"message": "Trip not found"}), 404
    # Optional: Check if trip belongs to user
    # if trip.user_id != current_user.id: return 403
    return jsonify(trip.to_dict())

@api.route('/trips', methods=['POST'])
@login_required
def create_trip():
    try:
        # Pass current_user.id
        trip = TripService.create_trip(request.json, current_user.id)
        
        # Also create a Member for the creator (Owner)
        from backend.services.member_service import MemberService
        MemberService.add_member({
            "tripId": trip.id,
            "name": current_user.username, # Or from request
            "email": current_user.email,
            "userId": current_user.id,
            "avatar": current_user.avatar,
            "isAdmin": "true" 
        })
        
        return jsonify(trip.to_dict()), 201
    except KeyError as e:
        return jsonify({"message": f"Missing field: {str(e)}"}), 400

@api.route('/trips/<id>', methods=['PUT'])
def update_trip(id):
    trip = TripService.update_trip(id, request.json)
    if not trip:
        return jsonify({"message": "Trip not found"}), 404
    return jsonify(trip.to_dict())

@api.route('/trips/<id>', methods=['DELETE'])
def delete_trip(id):
    success = TripService.delete_trip(id)
    if not success:
        return jsonify({"message": "Trip not found"}), 404
    return jsonify({"message": "Trip deleted"}), 200


# ============================================
# Member Routes (Using Service Layer - OOP)
# ============================================

@api.route('/trips/<id>/members', methods=['GET'])
def get_members(id):
    members = MemberService.get_members_by_trip(id)
    return jsonify([member.to_dict() for member in members])

@api.route('/trips/<id>/members', methods=['POST'])
def add_member(id):
    try:
        data = request.json
        data['tripId'] = id
        member = MemberService.add_member(data)
        return jsonify(member.to_dict()), 201
    except KeyError as e:
        return jsonify({"message": f"Missing field: {str(e)}"}), 400

@api.route('/trips/<trip_id>/members/<member_id>', methods=['PUT'])
def update_member(trip_id, member_id):
    member = MemberService.update_member(member_id, request.json)
    if not member:
        return jsonify({"message": "Member not found"}), 404
    return jsonify(member.to_dict())

@api.route('/trips/<trip_id>/members/<member_id>', methods=['DELETE'])
def delete_member(trip_id, member_id):
    success = MemberService.delete_member(member_id)
    if not success:
        return jsonify({"message": "Member not found"}), 404
    return jsonify({"message": "Member removed"}), 200


# ============================================
# Expense Routes (Using Service Layer - OOP)
# ============================================

@api.route('/trips/<id>/expenses', methods=['GET'])
def get_expenses(id):
    expenses = ExpenseService.get_expenses_by_trip(id)
    return jsonify([expense.to_dict() for expense in expenses])

@api.route('/trips/<id>/expenses', methods=['POST'])
def create_expense(id):
    try:
        data = request.json
        data['tripId'] = id
        expense = ExpenseService.create_expense(data)
        return jsonify(expense.to_dict()), 201
    except KeyError as e:
        return jsonify({"message": f"Missing field: {str(e)}"}), 400

@api.route('/trips/<trip_id>/expenses/<expense_id>', methods=['PUT'])
def update_expense(trip_id, expense_id):
    expense = ExpenseService.update_expense(expense_id, request.json)
    if not expense:
        return jsonify({"message": "Expense not found"}), 404
    return jsonify(expense.to_dict())

@api.route('/trips/<trip_id>/expenses/<expense_id>', methods=['DELETE'])
def delete_expense(trip_id, expense_id):
    success = ExpenseService.delete_expense(expense_id)
    if not success:
        return jsonify({"message": "Expense not found"}), 404
    return jsonify({"message": "Expense deleted"}), 200


# ============================================
# Activity Routes (Using Service Layer - OOP)
# ============================================

@api.route('/trips/<id>/activities', methods=['GET'])
def get_activities(id):
    activities = ActivityService.get_activities_by_trip(id)
    return jsonify([activity.to_dict() for activity in activities])

@api.route('/trips/<id>/activities', methods=['POST'])
def create_activity(id):
    try:
        data = request.json
        data['tripId'] = id
        activity = ActivityService.create_activity(data)
        return jsonify(activity.to_dict()), 201
    except KeyError as e:
        return jsonify({"message": f"Missing field: {str(e)}"}), 400

@api.route('/trips/<trip_id>/activities/<activity_id>', methods=['PUT'])
def update_activity(trip_id, activity_id):
    activity = ActivityService.update_activity(activity_id, request.json)
    if not activity:
        return jsonify({"message": "Activity not found"}), 404
    return jsonify(activity.to_dict())

@api.route('/trips/<trip_id>/activities/<activity_id>', methods=['DELETE'])
def delete_activity(trip_id, activity_id):
    success = ActivityService.delete_activity(activity_id)
    if not success:
        return jsonify({"message": "Activity not found"}), 404
    return jsonify({"message": "Activity deleted"}), 200





# ============================================
# Driver Routes (NEW - Using Service Layer)
# ============================================

@api.route('/trips/<id>/drivers', methods=['GET'])
def get_drivers(id):
    drivers = DriverService.get_drivers_by_trip(id)
    return jsonify([driver.to_dict() for driver in drivers])

@api.route('/trips/<id>/drivers', methods=['POST'])
def hire_driver(id):
    try:
        data = request.json
        data['tripId'] = id
        driver = DriverService.hire_driver(data)
        return jsonify(driver.to_dict()), 201
    except KeyError as e:
        return jsonify({"message": f"Missing field: {str(e)}"}), 400

@api.route('/trips/<trip_id>/drivers/<driver_id>', methods=['PUT'])
def update_driver(trip_id, driver_id):
    driver = DriverService.update_driver(driver_id, request.json)
    if not driver:
        return jsonify({"message": "Driver not found"}), 404
    return jsonify(driver.to_dict())

@api.route('/trips/<trip_id>/drivers/<driver_id>', methods=['DELETE'])
def cancel_driver(trip_id, driver_id):
    success = DriverService.cancel_driver(driver_id)
    if not success:
        return jsonify({"message": "Driver not found"}), 404
    return jsonify({"message": "Driver booking cancelled"}), 200


# ============================================
# Hotel Routes (NEW - Using Service Layer)
# ============================================

@api.route('/trips/<id>/hotels', methods=['GET'])
def get_hotels(id):
    hotels = HotelService.get_hotels_by_trip(id)
    return jsonify([hotel.to_dict() for hotel in hotels])

@api.route('/trips/<id>/hotels', methods=['POST'])
def book_hotel(id):
    try:
        data = request.json
        data['tripId'] = id
        hotel = HotelService.book_hotel(data)
        return jsonify(hotel.to_dict()), 201
    except KeyError as e:
        return jsonify({"message": f"Missing field: {str(e)}"}), 400

@api.route('/trips/<trip_id>/hotels/<hotel_id>', methods=['PUT'])
def update_hotel(trip_id, hotel_id):
    hotel = HotelService.update_hotel(hotel_id, request.json)
    if not hotel:
        return jsonify({"message": "Hotel not found"}), 404
    return jsonify(hotel.to_dict())

@api.route('/trips/<trip_id>/hotels/<hotel_id>', methods=['DELETE'])
def cancel_hotel(trip_id, hotel_id):
    success = HotelService.cancel_hotel(hotel_id)
    if not success:
        return jsonify({"message": "Hotel not found"}), 404
    return jsonify({"message": "Hotel booking cancelled"}), 200
