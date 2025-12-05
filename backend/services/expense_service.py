from backend.models import db, Expense, ExpenseSplit
from typing import Optional, List, Dict, Any

class ExpenseService:
    """Service class for Expense business logic (OOP)"""
    
    @staticmethod
    def create_expense(expense_data: Dict[str, Any]) -> Expense:
        """Create a new expense"""
        expense = Expense(
            trip_id=expense_data['tripId'],
            description=expense_data['description'],
            amount=str(expense_data['amount']),
            category=expense_data['category'],
            paid_by_id=expense_data['paidById'],
            date=expense_data['date'],
            split_method=expense_data.get('splitMethod', 'equal')
        )
        db.session.add(expense)
        
        # Handle splits
        split_among_ids = expense_data.get('splitAmongIds', [])
        amount_float = float(expense.amount)
        
        if split_among_ids:
            split_amount = amount_float / len(split_among_ids)
            for member_id in split_among_ids:
                split = ExpenseSplit(
                    expense=expense, # Relationship handles ID
                    member_id=member_id,
                    amount=str(split_amount)
                )
                db.session.add(split)
        
        db.session.commit()
        return expense
    
    @staticmethod
    def get_expenses_by_trip(trip_id: str) -> List[Expense]:
        """Get all expenses for a trip"""
        return db.session.execute(
            db.select(Expense).filter_by(trip_id=trip_id)
        ).scalars().all()
    
    @staticmethod
    def get_expense_by_id(expense_id: str) -> Optional[Expense]:
        """Get expense by ID"""
        return db.session.get(Expense, expense_id)
    
    @staticmethod
    def update_expense(expense_id: str, expense_data: Dict[str, Any]) -> Optional[Expense]:
        """Update an existing expense"""
        expense = db.session.get(Expense, expense_id)
        if not expense:
            return None
        
        # Update fields
        # Update fields
        if 'description' in expense_data:
            expense.description = expense_data['description']
        if 'category' in expense_data:
            expense.category = expense_data['category']
        if 'paidById' in expense_data:
            expense.paid_by_id = expense_data['paidById']
        if 'date' in expense_data:
            expense.date = expense_data['date']
        if 'splitMethod' in expense_data:
            expense.split_method = expense_data['splitMethod']
        
        # Handle Amount Change and Split Recalculation
        if 'amount' in expense_data:
            expense.amount = str(expense_data['amount'])
            
            # Recalculate splits if method is equal (simplest case for now)
            # We assume equal split among existing split members if 'splitAmongIds' isn't provided in update
            # If 'splitAmongIds' IS provided, we should use that.
            
            # Re-fetch or use provided split IDs
            split_among_ids = expense_data.get('splitAmongIds')
            
            if split_among_ids is not None:
                # Full replacement of splits
                # Delete old splits
                for split in expense.splits:
                    db.session.delete(split)
                expense.splits = [] # Clear relationship
                
                # Create new splits
                amount_float = float(expense.amount)
                if len(split_among_ids) > 0:
                    split_amount = amount_float / len(split_among_ids)
                    for member_id in split_among_ids:
                        split = ExpenseSplit(
                            expense=expense,
                            member_id=member_id,
                            amount=str(split_amount)
                        )
                        db.session.add(split)
            
            elif expense.split_method == 'equal' and expense.splits:
                # If IDs not provided but amount changed, update existing splits proportionally
                # For 'equal', just re-divide new amount by number of splits
                count = len(expense.splits)
                if count > 0:
                    new_split_amount = float(expense.amount) / count
                    for split in expense.splits:
                        split.amount = str(new_split_amount)

        db.session.commit()
        return expense
    
    @staticmethod
    def delete_expense(expense_id: str) -> bool:
        """Delete an expense"""
        expense = db.session.get(Expense, expense_id)
        if not expense:
            return False
        
        db.session.delete(expense)
        db.session.commit()
        return True
    
    @staticmethod
    def calculate_balances(trip_id: str) -> Dict[str, float]:
        """Calculate balances for all members (Business logic - OOP benefit)"""
        expenses = ExpenseService.get_expenses_by_trip(trip_id)
        balances = {}
        
        for expense in expenses:
            paid_by = expense.paid_by_id
            amount = float(expense.amount) if expense.amount else 0
            
            # Payer gets positive balance (they paid, so they are owed money initially)
            # Wait, if I pay 100, I am +100.
            # If I am in the split, I owe 50. So -50.
            # Net +50.
            balances[paid_by] = balances.get(paid_by, 0) + amount
            
            # Deduct from those who owe
            for split in expense.splits:
                member_id = split.member_id
                split_amount = float(split.amount)
                balances[member_id] = balances.get(member_id, 0) - split_amount
            
        return balances
