from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, Text, ForeignKey
from typing import Optional, List
import uuid

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

def generate_uuid():
    return str(uuid.uuid4())

from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(UserMixin, db.Model):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    username: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    avatar: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id, 
            "username": self.username,
            "email": self.email,
            "avatar": self.avatar
        }

class Trip(db.Model):
    __tablename__ = "trips"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id"), nullable=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    destination: Mapped[str] = mapped_column(String, nullable=False)
    start_date: Mapped[str] = mapped_column(String, nullable=False)
    end_date: Mapped[str] = mapped_column(String, nullable=False)
    budget: Mapped[str] = mapped_column(String, nullable=False)
    cover_image: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship("User", backref=db.backref("trips", cascade="all, delete-orphan"))
    members: Mapped[List["Member"]] = relationship(back_populates="trip", cascade="all, delete-orphan")
    expenses: Mapped[List["Expense"]] = relationship(back_populates="trip", cascade="all, delete-orphan")
    activities: Mapped[List["Activity"]] = relationship(back_populates="trip", cascade="all, delete-orphan")

    drivers: Mapped[List["Driver"]] = relationship(back_populates="trip", cascade="all, delete-orphan")
    hotels: Mapped[List["Hotel"]] = relationship(back_populates="trip", cascade="all, delete-orphan")

    def to_dict(self):
        # Calculate balances
        balances = {member.id: 0.0 for member in self.members}
        
        for expense in self.expenses:
            try:
                expense_amount = float(expense.amount) if expense.amount else 0.0
                
                # Creditor (Paid By) gets positive balance (money owed TO them)
                if expense.paid_by_id in balances:
                    balances[expense.paid_by_id] += expense_amount
                
                # Debtors (Split Among) get negative balance (money they OWE)
                if expense.splits:
                    for split in expense.splits:
                        if split.member_id in balances:
                            split_amount = float(split.amount) if split.amount else 0.0
                            balances[split.member_id] -= split_amount
            except (ValueError, TypeError):
                continue
        
        return {
            "id": self.id,
            "userId": self.user_id,
            "name": self.name,
            "destination": self.destination,
            "startDate": self.start_date,
            "endDate": self.end_date,
            "budget": float(self.budget) if self.budget else 0,
            "coverImage": self.cover_image,
            "description": self.description,
            "members": [{**member.to_dict(), "balance": balances.get(member.id, 0.0)} for member in self.members],
            "expenses": [expense.to_dict() for expense in self.expenses],
            "activities": [activity.to_dict() for activity in self.activities],
        }

class Member(db.Model):
    __tablename__ = "members"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    trip_id: Mapped[str] = mapped_column(ForeignKey("trips.id"), nullable=False)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id"), nullable=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    avatar: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_admin: Mapped[Optional[str]] = mapped_column(String, default="false")

    trip: Mapped["Trip"] = relationship(back_populates="members")
    user: Mapped["User"] = relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "tripId": self.trip_id,
            "userId": self.user_id,
            "name": self.name,
            "email": self.email,
            "avatar": self.avatar,
            "isAdmin": self.is_admin == "true",
            "balance": 0,
            "isOwner": self.is_admin == "true"
        }

class Expense(db.Model):
    __tablename__ = "expenses"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    trip_id: Mapped[str] = mapped_column(ForeignKey("trips.id"), nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    amount: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=False)
    paid_by_id: Mapped[str] = mapped_column(ForeignKey("members.id"), nullable=False)
    date: Mapped[str] = mapped_column(String, nullable=False)
    split_method: Mapped[Optional[str]] = mapped_column(String, default="equal")

    trip: Mapped["Trip"] = relationship(back_populates="expenses")
    splits: Mapped[List["ExpenseSplit"]] = relationship(back_populates="expense", cascade="all, delete-orphan")
    paid_by: Mapped["Member"] = relationship("Member", foreign_keys=[paid_by_id])

    def to_dict(self):
        return {
            "id": self.id,
            "tripId": self.trip_id,
            "description": self.description,
            "amount": float(self.amount) if self.amount else 0,
            "category": self.category,
            "paidById": self.paid_by_id,
            "date": self.date,
            "splitMethod": self.split_method,
            "paidBy": self.paid_by.to_dict() if self.paid_by else {"id": "unknown", "name": "Unknown"},
            "splitAmong": [split.to_dict() for split in self.splits] 
        }

class Activity(db.Model):
    __tablename__ = "activities"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    trip_id: Mapped[str] = mapped_column(ForeignKey("trips.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    location: Mapped[str] = mapped_column(String, nullable=False)
    date: Mapped[str] = mapped_column(String, nullable=False)
    time: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    cost: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    trip: Mapped["Trip"] = relationship(back_populates="activities")

    def to_dict(self):
        return {
            "id": self.id,
            "tripId": self.trip_id,
            "title": self.title,
            "location": self.location,
            "date": self.date,
            "time": self.time,
            "description": self.description,
            "cost": float(self.cost) if self.cost else 0,
        }

class ExpenseSplit(db.Model):
    __tablename__ = "expense_splits"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    expense_id: Mapped[str] = mapped_column(ForeignKey("expenses.id"), nullable=False)
    member_id: Mapped[str] = mapped_column(String, nullable=False) # We store ID directly to avoid circular dependency issues if not strictly needed, or we can use ForeignKey. Let's use ID for simplicity as Member is in same file but defined before? No defined after? Member is defined BEFORE Expense.
    # Actually Member is defined at line 73. Expense is at 98. So we can use ForeignKey("members.id").
    amount: Mapped[str] = mapped_column(String, nullable=False)

    expense: Mapped["Expense"] = relationship(back_populates="splits")

    def to_dict(self):
        return {
            "id": self.id,
            "expenseId": self.expense_id,
            "memberId": self.member_id,
            "amount": float(self.amount)
        }

class Driver(db.Model):
    __tablename__ = "drivers"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    trip_id: Mapped[str] = mapped_column(ForeignKey("trips.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    contact: Mapped[str] = mapped_column(String, nullable=False)
    vehicle_type: Mapped[str] = mapped_column(String, nullable=False)
    pickup_location: Mapped[str] = mapped_column(String, nullable=False)
    dropoff_location: Mapped[str] = mapped_column(String, nullable=False)
    date: Mapped[str] = mapped_column(String, nullable=False)
    time: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    cost: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, default="pending")  # pending, confirmed, cancelled

    trip: Mapped["Trip"] = relationship(back_populates="drivers")

    def to_dict(self):
        return {
            "id": self.id,
            "tripId": self.trip_id,
            "name": self.name,
            "contact": self.contact,
            "vehicleType": self.vehicle_type,
            "pickupLocation": self.pickup_location,
            "dropoffLocation": self.dropoff_location,
            "date": self.date,
            "time": self.time,
            "cost": float(self.cost) if self.cost else 0,
            "status": self.status,
        }

class Hotel(db.Model):
    __tablename__ = "hotels"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    trip_id: Mapped[str] = mapped_column(ForeignKey("trips.id"), nullable=False)
    hotel_name: Mapped[str] = mapped_column(String, nullable=False)
    location: Mapped[str] = mapped_column(String, nullable=False)
    check_in_date: Mapped[str] = mapped_column(String, nullable=False)
    check_out_date: Mapped[str] = mapped_column(String, nullable=False)
    room_type: Mapped[str] = mapped_column(String, nullable=False)
    guests: Mapped[str] = mapped_column(String, nullable=False)
    cost: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, default="pending")  # pending, confirmed, cancelled

    trip: Mapped["Trip"] = relationship(back_populates="hotels")

    def to_dict(self):
        return {
            "id": self.id,
            "tripId": self.trip_id,
            "hotelName": self.hotel_name,
            "location": self.location,
            "checkInDate": self.check_in_date,
            "checkOutDate": self.check_out_date,
            "roomType": self.room_type,
            "guests": int(self.guests) if self.guests else 1,
            "cost": float(self.cost) if self.cost else 0,
            "status": self.status,
        }
