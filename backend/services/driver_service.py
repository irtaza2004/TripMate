from backend.models import db, Driver
from typing import Optional, List, Dict, Any

class DriverService:
    """Service class for Driver business logic (OOP)"""
    
    @staticmethod
    def hire_driver(driver_data: Dict[str, Any]) -> Driver:
        """Hire a new driver"""
        driver = Driver(
            trip_id=driver_data['tripId'],
            name=driver_data['name'],
            contact=driver_data['contact'],
            vehicle_type=driver_data['vehicleType'],
            pickup_location=driver_data['pickupLocation'],
            dropoff_location=driver_data['dropoffLocation'],
            date=driver_data['date'],
            time=driver_data.get('time'),
            cost=str(driver_data['cost']),
            status=driver_data.get('status', 'pending')
        )
        db.session.add(driver)
        db.session.commit()
        return driver
    
    @staticmethod
    def get_drivers_by_trip(trip_id: str) -> List[Driver]:
        """Get all drivers for a trip"""
        return db.session.execute(
            db.select(Driver).filter_by(trip_id=trip_id)
        ).scalars().all()
    
    @staticmethod
    def get_driver_by_id(driver_id: str) -> Optional[Driver]:
        """Get driver by ID"""
        return db.session.get(Driver, driver_id)
    
    @staticmethod
    def update_driver(driver_id: str, driver_data: Dict[str, Any]) -> Optional[Driver]:
        """Update driver information"""
        driver = db.session.get(Driver, driver_id)
        if not driver:
            return None
        
        # Update fields
        if 'name' in driver_data:
            driver.name = driver_data['name']
        if 'contact' in driver_data:
            driver.contact = driver_data['contact']
        if 'vehicleType' in driver_data:
            driver.vehicle_type = driver_data['vehicleType']
        if 'pickupLocation' in driver_data:
            driver.pickup_location = driver_data['pickupLocation']
        if 'dropoffLocation' in driver_data:
            driver.dropoff_location = driver_data['dropoffLocation']
        if 'date' in driver_data:
            driver.date = driver_data['date']
        if 'time' in driver_data:
            driver.time = driver_data['time']
        if 'cost' in driver_data:
            driver.cost = str(driver_data['cost'])
        if 'status' in driver_data:
            driver.status = driver_data['status']
        
        db.session.commit()
        return driver
    
    @staticmethod
    def cancel_driver(driver_id: str) -> bool:
        """Cancel/delete a driver booking"""
        driver = db.session.get(Driver, driver_id)
        if not driver:
            return False
        
        db.session.delete(driver)
        db.session.commit()
        return True
