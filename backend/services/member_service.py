from backend.models import db, Member
from typing import Optional, List, Dict, Any

class MemberService:
    """Service class for Member business logic (OOP)"""
    
    @staticmethod
    def add_member(member_data: Dict[str, Any]) -> Member:
        """Add a new member to a trip"""
        member = Member(
            trip_id=member_data['tripId'],
            name=member_data['name'],
            email=member_data.get('email'),
            avatar=member_data.get('avatar'),
            is_admin=member_data.get('isAdmin', 'false')
        )
        db.session.add(member)
        db.session.commit()
        return member
    
    @staticmethod
    def get_members_by_trip(trip_id: str) -> List[Member]:
        """Get all members for a trip"""
        return db.session.execute(
            db.select(Member).filter_by(trip_id=trip_id)
        ).scalars().all()
    
    @staticmethod
    def get_member_by_id(member_id: str) -> Optional[Member]:
        """Get member by ID"""
        return db.session.get(Member, member_id)
    
    @staticmethod
    def update_member(member_id: str, member_data: Dict[str, Any]) -> Optional[Member]:
        """Update an existing member"""
        member = db.session.get(Member, member_id)
        if not member:
            return None
        
        # Update fields
        if 'name' in member_data:
            member.name = member_data['name']
        if 'email' in member_data:
            member.email = member_data['email']
        if 'avatar' in member_data:
            member.avatar = member_data['avatar']
        if 'isAdmin' in member_data:
            member.is_admin = member_data['isAdmin']
        
        db.session.commit()
        return member
    
    @staticmethod
    def delete_member(member_id: str) -> bool:
        """Remove a member from a trip"""
        member = db.session.get(Member, member_id)
        if not member:
            return False
        
        db.session.delete(member)
        db.session.commit()
        return True
