from backend.models import db, Hotel
from typing import Optional, List, Dict, Any

class HotelService:
    """Service class for Hotel business logic (OOP)"""
    
    @staticmethod
    def book_hotel(hotel_data: Dict[str, Any]) -> Hotel:
        """Book a new hotel"""
        hotel = Hotel(
            trip_id=hotel_data['tripId'],
            hotel_name=hotel_data['hotelName'],
            location=hotel_data['location'],
            check_in_date=hotel_data['checkInDate'],
            check_out_date=hotel_data['checkOutDate'],
            room_type=hotel_data['roomType'],
            guests=str(hotel_data['guests']),
            cost=str(hotel_data['cost']),
            status=hotel_data.get('status', 'pending')
        )
        db.session.add(hotel)
        db.session.commit()
        return hotel
    
    @staticmethod
    def get_hotels_by_trip(trip_id: str) -> List[Hotel]:
        """Get all hotels for a trip"""
        return db.session.execute(
            db.select(Hotel).filter_by(trip_id=trip_id)
        ).scalars().all()
    
    @staticmethod
    def get_hotel_by_id(hotel_id: str) -> Optional[Hotel]:
        """Get hotel by ID"""
        return db.session.get(Hotel, hotel_id)
    
    @staticmethod
    def update_hotel(hotel_id: str, hotel_data: Dict[str, Any]) -> Optional[Hotel]:
        """Update hotel booking"""
        hotel = db.session.get(Hotel, hotel_id)
        if not hotel:
            return None
        
        # Update fields
        if 'hotelName' in hotel_data:
            hotel.hotel_name = hotel_data['hotelName']
        if 'location' in hotel_data:
            hotel.location = hotel_data['location']
        if 'checkInDate' in hotel_data:
            hotel.check_in_date = hotel_data['checkInDate']
        if 'checkOutDate' in hotel_data:
            hotel.check_out_date = hotel_data['checkOutDate']
        if 'roomType' in hotel_data:
            hotel.room_type = hotel_data['roomType']
        if 'guests' in hotel_data:
            hotel.guests = str(hotel_data['guests'])
        if 'cost' in hotel_data:
            hotel.cost = str(hotel_data['cost'])
        if 'status' in hotel_data:
            hotel.status = hotel_data['status']
        
        db.session.commit()
        return hotel
    
    @staticmethod
    def cancel_hotel(hotel_id: str) -> bool:
        """Cancel/delete a hotel booking"""
        hotel = db.session.get(Hotel, hotel_id)
        if not hotel:
            return False
        
        db.session.delete(hotel)
        db.session.commit()
        return True
