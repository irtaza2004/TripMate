export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  description?: string;
  coverImage?: string;
  members: TripMember[];
  expenses: Expense[];
  activities: Activity[];
}

export interface TripMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  balance: number;
  isOwner: boolean;
}

export type ExpenseCategory =
  | 'food'
  | 'transportation'
  | 'accommodation'
  | 'activities'
  | 'shopping'
  | 'other';

export interface ExpenseSplit {
  id: string;
  expenseId: string;
  memberId: string;
  amount: number;
}

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  paidBy: TripMember;
  splitAmong: ExpenseSplit[];
  date: string;
  splitMethod: 'equal' | 'custom';
  customSplits?: { memberId: string; amount: number }[];
}

export interface Activity {
  id: string;
  tripId: string;
  title: string;
  description?: string;
  location?: string;
  date: string;
  time?: string;
  cost?: number;
}

export interface Settlement {
  id: string;
  tripId: string;
  fromMember: TripMember;
  toMember: TripMember;
  amount: number;
  settledAt?: string;
  isSettled: boolean;
}

export interface Notification {
  id: string;
  type: 'expense_added' | 'member_added' | 'settlement' | 'trip_update';
  message: string;
  read: boolean;
  createdAt: string;
}


