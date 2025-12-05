from backend.models import db, Trip
from typing import Optional, List, Dict, Any

class TripService:
    """Service class for Trip business logic (OOP)"""
    
    @staticmethod
    def create_trip(trip_data: Dict[str, Any], user_id: str) -> Trip:
        """Create a new trip"""
        trip = Trip(
            user_id=user_id,
            name=trip_data['name'],
            destination=trip_data['destination'],
            start_date=trip_data['startDate'],
            end_date=trip_data['endDate'],
            budget=str(trip_data['budget']),
            cover_image=trip_data.get('coverImage'),
            description=trip_data.get('description')
        )
        db.session.add(trip)
        db.session.commit()
        return trip
    
    @staticmethod
    def get_user_trips(user_id: str) -> List[Trip]:
        """Get trips for a specific user"""
        return db.session.execute(db.select(Trip).filter_by(user_id=user_id)).scalars().all()

    @staticmethod
    def get_all_trips() -> List[Trip]:
        """Get all trips (Admin override or fallback)"""
        return db.session.execute(db.select(Trip)).scalars().all()
    
    @staticmethod
    def get_trip_by_id(trip_id: str) -> Optional[Trip]:
        """Get trip by ID"""
        return db.session.get(Trip, trip_id)
    
    @staticmethod
    def update_trip(trip_id: str, trip_data: Dict[str, Any]) -> Optional[Trip]:
        """Update an existing trip"""
        trip = db.session.get(Trip, trip_id)
        if not trip:
            return None
        
        # Update fields
        if 'name' in trip_data:
            trip.name = trip_data['name']
        if 'destination' in trip_data:
            trip.destination = trip_data['destination']
        if 'startDate' in trip_data:
            trip.start_date = trip_data['startDate']
        if 'endDate' in trip_data:
            trip.end_date = trip_data['endDate']
        if 'budget' in trip_data:
            trip.budget = str(trip_data['budget'])
        if 'coverImage' in trip_data:
            trip.cover_image = trip_data['coverImage']
        if 'description' in trip_data:
            trip.description = trip_data['description']
        
        db.session.commit()
        return trip
    
    @staticmethod
    def delete_trip(trip_id: str) -> bool:
        """Delete a trip"""
        trip = db.session.get(Trip, trip_id)
        if not trip:
            return False
        
        db.session.delete(trip)
        db.session.commit()
        return True
