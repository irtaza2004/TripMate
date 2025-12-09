// todo: remove mock functionality
import type { Trip, TripMember, Expense, Activity, Notification, ChatMessage, Settlement } from './types';

import beachImage1 from '@assets/stock_images/tropical_beach_sunse_8ca4af3b.jpg';
import beachImage2 from '@assets/stock_images/tropical_beach_sunse_17ceeb1b.jpg';
import mountainImage1 from '@assets/stock_images/beautiful_mountain_l_b169310e.jpg';
import mountainImage2 from '@assets/stock_images/beautiful_mountain_l_c1321001.jpg';
import cityImage1 from '@assets/stock_images/city_skyline_night_u_74cb8728.jpg';

export const tripImages = {
  beach1: beachImage1,
  beach2: beachImage2,
  mountain1: mountainImage1,
  mountain2: mountainImage2,
  city1: cityImage1,
};

export const mockMembers: TripMember[] = [
  { id: '1', userId: 'u1', name: 'Alex Chen', email: 'alex@example.com', balance: 125.50, isOwner: true },
  { id: '2', userId: 'u2', name: 'Sarah Kim', email: 'sarah@example.com', balance: -45.00, isOwner: false },
  { id: '3', userId: 'u3', name: 'Mike Johnson', email: 'mike@example.com', balance: -80.50, isOwner: false },
  { id: '4', userId: 'u4', name: 'Emma Wilson', email: 'emma@example.com', balance: 0, isOwner: false },
];

export const mockExpenses: Expense[] = [
  {
    id: 'e1',
    tripId: 't1',
    description: 'Hotel Booking - 3 nights',
    amount: 450.00,
    category: 'accommodation',
    paidBy: mockMembers[0],
    splitAmong: mockMembers,
    date: '2024-12-15',
    splitMethod: 'equal',
  },
  {
    id: 'e2',
    tripId: 't1',
    description: 'Dinner at Beach Restaurant',
    amount: 120.00,
    category: 'food',
    paidBy: mockMembers[1],
    splitAmong: mockMembers,
    date: '2024-12-16',
    splitMethod: 'equal',
  },
  {
    id: 'e3',
    tripId: 't1',
    description: 'Snorkeling Tour',
    amount: 200.00,
    category: 'activities',
    paidBy: mockMembers[0],
    splitAmong: [mockMembers[0], mockMembers[1], mockMembers[2]],
    date: '2024-12-17',
    splitMethod: 'equal',
  },
  {
    id: 'e4',
    tripId: 't1',
    description: 'Airport Transfer',
    amount: 80.00,
    category: 'transportation',
    paidBy: mockMembers[2],
    splitAmong: mockMembers,
    date: '2024-12-15',
    splitMethod: 'equal',
  },
  {
    id: 'e5',
    tripId: 't1',
    description: 'Souvenirs',
    amount: 65.00,
    category: 'shopping',
    paidBy: mockMembers[3],
    splitAmong: [mockMembers[2], mockMembers[3]],
    date: '2024-12-18',
    splitMethod: 'equal',
  },
];

export const mockActivities: Activity[] = [
  { id: 'a1', tripId: 't1', title: 'Arrive at Bali Airport', location: 'Ngurah Rai Airport', date: '2024-12-15', time: '10:00' },
  { id: 'a2', tripId: 't1', title: 'Check-in at Hotel', location: 'Sunset Beach Resort', date: '2024-12-15', time: '14:00' },
  { id: 'a3', tripId: 't1', title: 'Beach Sunset Walk', location: 'Kuta Beach', date: '2024-12-15', time: '17:30' },
  { id: 'a4', tripId: 't1', title: 'Snorkeling Tour', description: 'Half-day tour to Blue Lagoon', location: 'Padang Bai', date: '2024-12-16', time: '08:00' },
  { id: 'a5', tripId: 't1', title: 'Ubud Rice Terraces', description: 'Visit Tegallalang', location: 'Ubud', date: '2024-12-17', time: '09:00' },
  { id: 'a6', tripId: 't1', title: 'Temple Visit', location: 'Tanah Lot Temple', date: '2024-12-17', time: '16:00' },
];

export const mockTrips: Trip[] = [
  {
    id: 't1',
    name: 'Bali Adventure',
    destination: 'Bali, Indonesia',
    startDate: '2024-12-15',
    endDate: '2024-12-20',
    budget: 2000,
    description: 'A tropical getaway with friends',
    coverImage: beachImage1,
    members: mockMembers,
    expenses: mockExpenses,
    activities: mockActivities,
  },
  {
    id: 't2',
    name: 'Swiss Alps Expedition',
    destination: 'Zermatt, Switzerland',
    startDate: '2025-01-10',
    endDate: '2025-01-18',
    budget: 3500,
    description: 'Skiing and mountain adventures',
    coverImage: mountainImage1,
    members: mockMembers.slice(0, 3),
    expenses: [],
    activities: [],
  },
  {
    id: 't3',
    name: 'NYC Weekend',
    destination: 'New York, USA',
    startDate: '2025-02-14',
    endDate: '2025-02-17',
    budget: 1500,
    coverImage: cityImage1,
    members: mockMembers.slice(0, 2),
    expenses: [],
    activities: [],
  },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'expense_added', message: 'Sarah added "Dinner at Beach Restaurant" - $120.00', read: false, createdAt: '2024-12-16T19:30:00Z' },
  { id: 'n2', type: 'member_added', message: 'Emma joined "Bali Adventure"', read: false, createdAt: '2024-12-14T10:00:00Z' },
  { id: 'n3', type: 'settlement', message: 'Mike settled $45.00 with you', read: true, createdAt: '2024-12-13T15:00:00Z' },
];

export const mockChatMessages: ChatMessage[] = [
  { id: 'c1', tripId: 't1', senderId: 'u1', senderName: 'Alex Chen', message: 'Hey everyone! Excited for the trip!', timestamp: '2024-12-14T10:00:00Z' },
  { id: 'c2', tripId: 't1', senderId: 'u2', senderName: 'Sarah Kim', message: 'Me too! Has everyone packed?', timestamp: '2024-12-14T10:05:00Z' },
  { id: 'c3', tripId: 't1', senderId: 'u3', senderName: 'Mike Johnson', message: 'Almost done. What time should we meet at the airport?', timestamp: '2024-12-14T10:10:00Z' },
  { id: 'c4', tripId: 't1', senderId: 'u1', senderName: 'Alex Chen', message: 'Let\'s meet at 7 AM at Terminal 2', timestamp: '2024-12-14T10:15:00Z' },
];

export const mockSettlements: Settlement[] = [
  { id: 's1', tripId: 't1', fromMember: mockMembers[1], toMember: mockMembers[0], amount: 45.00, isSettled: false },
  { id: 's2', tripId: 't1', fromMember: mockMembers[2], toMember: mockMembers[0], amount: 80.50, isSettled: false },
];

export function calculateTotalExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    food: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    transportation: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    accommodation: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    activities: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    shopping: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    other: 'bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400',
  };
  return colors[category] || colors.other;
}
