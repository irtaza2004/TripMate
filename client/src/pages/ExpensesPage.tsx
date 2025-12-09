import { useState } from 'react';
import { Search, Filter, Receipt } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ExpenseCard } from '@/components/ExpenseCard';
import { ExpenseChart } from '@/components/ExpenseChart';
import { EmptyState } from '@/components/EmptyState';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import type { Trip, Expense, ExpenseCategory } from '@/lib/types';
import { calculateTotalExpenses } from '@/lib/mock-data';

const categoryLabels: Record<ExpenseCategory | 'all', string> = {
  all: 'All Categories',
  food: 'Food',
  transportation: 'Transport',
  accommodation: 'Lodging',
  activities: 'Activities',
  shopping: 'Shopping',
  other: 'Other',
};

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const { data: trips = [] } = useQuery<Trip[]>({
    queryKey: ['/api/trips']
  });

  const allExpenses = trips.flatMap(trip =>
    trip.expenses.map(expense => ({ ...expense, tripName: trip.name }))
  );

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const deleteExpenseMutation = useMutation({
    mutationFn: async ({ tripId, expenseId }: { tripId: string, expenseId: string }) => {
      await apiRequest("DELETE", `/api/trips/${tripId}/expenses/${expenseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
    }
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async ({ tripId, expenseId, data }: { tripId: string, expenseId: string, data: any }) => {
      const res = await apiRequest("PUT", `/api/trips/${tripId}/expenses/${expenseId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
      setShowEditModal(false);
      setEditingExpense(null);
    }
  });

  const handleUpdateExpense = (data: any) => {
    if (!editingExpense) return;
    updateExpenseMutation.mutate({
      tripId: editingExpense.tripId,
      expenseId: editingExpense.id,
      data: {
        ...data,
        amount: data.amount.toString(),
        date: data.date
      }
    });
  };

  const activeTrip = editingExpense ? trips.find(t => t.id === editingExpense.tripId) : null;

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all');
  const [tripFilter, setTripFilter] = useState('all');

  const filteredExpenses = allExpenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesTrip = tripFilter === 'all' || expense.tripId === tripFilter;
    return matchesSearch && matchesCategory && matchesTrip;
  });

  const totalAmount = calculateTotalExpenses(filteredExpenses);

  return (
    <div className="space-y-6" data-testid="page-expenses">
      <div>
        <h1 className="text-3xl font-bold">All Expenses</h1>
        <p className="text-muted-foreground mt-1">View and manage expenses across all trips.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-expenses"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as ExpenseCategory | 'all')}>
          <SelectTrigger className="w-full md:w-48" data-testid="select-category-filter">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={tripFilter} onValueChange={setTripFilter}>
          <SelectTrigger className="w-full md:w-48" data-testid="select-trip-filter">
            <SelectValue placeholder="Trip" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trips</SelectItem>
            {trips.map((trip) => (
              <SelectItem key={trip.id} value={trip.id}>{trip.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">
          Showing {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
        </span>
        <Badge variant="secondary" className="text-base font-semibold">
          Total: ${totalAmount.toFixed(2)}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {filteredExpenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No expenses found"
              description={searchQuery || categoryFilter !== 'all' || tripFilter !== 'all'
                ? "Try adjusting your filters to see more expenses."
                : "Add expenses to your trips to see them here."
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map((expense) => (
                <div key={expense.id} className="relative">
                  <ExpenseCard
                    expense={expense}
                    onEdit={() => {
                      setEditingExpense(expense);
                      setShowEditModal(true);
                    }}
                    onDelete={() => {
                      if (confirm('Are you sure you want to delete this expense?')) {
                        deleteExpenseMutation.mutate({ tripId: expense.tripId, expenseId: expense.id });
                      }
                    }}
                  />
                  <Badge
                    variant="outline"
                    className="absolute top-4 right-14 text-xs"
                  >
                    {(expense as any).tripName}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <ExpenseChart expenses={filteredExpenses} />
        </div>
      </div>

      {activeTrip && (
        <AddExpenseModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingExpense(null);
          }}
          members={activeTrip.members}
          onSubmit={handleUpdateExpense}
          initialData={editingExpense ? {
            id: editingExpense.id,
            description: editingExpense.description,
            amount: editingExpense.amount,
            category: editingExpense.category,
            paidById: editingExpense.paidBy.id,
            splitAmongIds: editingExpense.splitAmong?.map(s => s.memberId) || activeTrip.members.map(m => m.id),
            date: editingExpense.date
          } : undefined}
        />
      )}
    </div>
  );
}
