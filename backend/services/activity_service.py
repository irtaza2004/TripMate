from backend.models import db, Activity
from typing import Optional, List, Dict, Any

class ActivityService:
    """Service class for Activity business logic (OOP)"""
    
    @staticmethod
    def create_activity(activity_data: Dict[str, Any]) -> Activity:
        """Create a new activity"""
        activity = Activity(
            trip_id=activity_data['tripId'],
            title=activity_data['title'],
            location=activity_data['location'],
            date=activity_data['date'],
            time=activity_data.get('time'),
            description=activity_data.get('description'),
            cost=activity_data.get('cost')
        )
        db.session.add(activity)
        db.session.commit()
        return activity
    
    @staticmethod
    def get_activities_by_trip(trip_id: str) -> List[Activity]:
        """Get all activities for a trip"""
        return db.session.execute(
            db.select(Activity).filter_by(trip_id=trip_id)
        ).scalars().all()
    
    @staticmethod
    def get_activity_by_id(activity_id: str) -> Optional[Activity]:
        """Get activity by ID"""
        return db.session.get(Activity, activity_id)
    
    @staticmethod
    def update_activity(activity_id: str, activity_data: Dict[str, Any]) -> Optional[Activity]:
        """Update an existing activity"""
        activity = db.session.get(Activity, activity_id)
        if not activity:
            return None
        
        # Update fields
        if 'title' in activity_data:
            activity.title = activity_data['title']
        if 'location' in activity_data:
            activity.location = activity_data['location']
        if 'date' in activity_data:
            activity.date = activity_data['date']
        if 'time' in activity_data:
            activity.time = activity_data['time']
        if 'description' in activity_data:
            activity.description = activity_data['description']
        if 'cost' in activity_data:
            activity.cost = activity_data['cost']
        
        db.session.commit()
        return activity
    
    @staticmethod
    def delete_activity(activity_id: str) -> bool:
        """Delete an activity"""
        activity = db.session.get(Activity, activity_id)
        if not activity:
            return False
        
        db.session.delete(activity)
        db.session.commit()
        return True
