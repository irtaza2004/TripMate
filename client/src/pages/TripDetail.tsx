import { useState } from 'react';
import { useRoute, Link } from 'wouter';
import {
  ArrowLeft, Plus, Users, Calendar, MapPin, Receipt,
  CalendarDays, DollarSign
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ExpenseCard } from '@/components/ExpenseCard';
import { MemberCard } from '@/components/MemberCard';
import { ActivityCard } from '@/components/ActivityCard';

import { BudgetTracker } from '@/components/BudgetTracker';
import { ExpenseChart } from '@/components/ExpenseChart';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { AddMemberModal } from '@/components/AddMemberModal';
import { AddActivityModal } from '@/components/AddActivityModal';
import { SettlementModal } from '@/components/SettlementModal';
import { EmptyState } from '@/components/EmptyState';
import type { Trip, Expense, Activity, TripMember as Member } from '@/lib/types';
import { calculateTotalExpenses, tripImages } from '@/lib/mock-data';
import { calculateSettlements } from '@/lib/utils';

const defaultImages = [tripImages.beach1, tripImages.mountain1, tripImages.city1, tripImages.beach2, tripImages.mountain2];

export default function TripDetail() {
  const [, params] = useRoute('/trips/:id');
  const tripId = params?.id;
  const queryClient = useQueryClient();

  const { data: trip, isLoading: isLoadingTrip } = useQuery<Trip>({
    queryKey: [`/api/trips/${tripId}`],
    enabled: !!tripId
  });

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: [`/api/trips/${tripId}/expenses`],
    enabled: !!tripId
  });

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: [`/api/trips/${tripId}/members`],
    enabled: !!tripId
  });

  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: [`/api/trips/${tripId}/activities`],
    enabled: !!tripId
  });



  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const createExpenseMutation = useMutation({
    mutationFn: async (newExpense: any) => {
      const res = await apiRequest("POST", `/api/trips/${tripId}/expenses`, newExpense);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${tripId}/expenses`] });
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
      setShowAddExpense(false);
    }
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async ({ expenseId, data }: { expenseId: string, data: any }) => {
      const res = await apiRequest("PUT", `/api/trips/${tripId}/expenses/${expenseId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${tripId}/expenses`] });
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
      setShowAddExpense(false);
      setEditingExpense(null);
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      await apiRequest("DELETE", `/api/trips/${tripId}/expenses/${expenseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${tripId}/expenses`] });
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
    }
  });

  const createActivityMutation = useMutation({
    mutationFn: async (newActivity: any) => {
      const res = await apiRequest("POST", `/api/trips/${tripId}/activities`, newActivity);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${tripId}/activities`] });
      setShowAddActivity(false);
    }
  });

  const createMemberMutation = useMutation({
    mutationFn: async (newMember: any) => {
      const res = await apiRequest("POST", `/api/trips/${tripId}/members`, newMember);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${tripId}/members`] });
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${tripId}`] });
      setShowAddMember(false);
    }
  });



  if (isLoadingTrip || !trip) {
    return <div>Loading...</div>;
  }

  const totalSpent = calculateTotalExpenses(expenses);
  const budget = trip.budget;
  const budgetPercent = (totalSpent / budget) * 100;

  const coverImage = trip.coverImage || defaultImages[parseInt(trip.id.replace(/\D/g, '')) % defaultImages.length];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleAddExpense = (data: any) => {
    if (editingExpense) {
      updateExpenseMutation.mutate({
        expenseId: editingExpense.id,
        data: {
          ...data,
          amount: data.amount.toString(),
          date: data.date
        }
      });
    } else {
      createExpenseMutation.mutate({
        tripId,
        ...data,
        amount: data.amount.toString(),
        date: data.date
      });
    }
  };

  const handleAddActivity = (data: any) => {
    createActivityMutation.mutate({
      tripId,
      ...data
    });
  };



  const groupActivitiesByDate = () => {
    const grouped: Record<string, Activity[]> = {};
    activities.forEach(activity => {
      if (!grouped[activity.date]) {
        grouped[activity.date] = [];
      }
      grouped[activity.date].push(activity);
    });
    return Object.entries(grouped).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());
  };

  return (
    <div className="space-y-6" data-testid="page-trip-detail">
      <div
        className="relative -m-6 mb-2 overflow-hidden rounded-b-3xl"
        style={{
          backgroundImage: `url(${coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        <div className="relative z-10 p-6 pt-4">
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                data-testid="button-back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettlement(true)}
                className="bg-white/20 border-white/40 text-white hover:bg-white/30 backdrop-blur-sm"
                data-testid="button-settle-up"
              >
                <DollarSign className="h-4 w-4 mr-1" />
                Settle Up
              </Button>
              <Button
                onClick={() => setShowAddExpense(true)}
                size="sm"
                className="gap-2 shadow-lg"
                data-testid="button-add-expense"
              >
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </div>
          </div>

          <div className="pb-6">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2" data-testid="text-trip-title">
              {trip.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
              <span className="flex items-center gap-1.5 drop-shadow">
                <MapPin className="h-4 w-4" />
                {trip.destination}
              </span>
              <span className="flex items-center gap-1.5 drop-shadow">
                <Calendar className="h-4 w-4" />
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </span>
              <span className="flex items-center gap-1.5 drop-shadow">
                <Users className="h-4 w-4" />
                {trip.members.length} members
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-xl font-bold">${totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Budget Left</p>
                <p className={`text-xl font-bold ${trip.budget - totalSpent < 0 ? 'text-destructive' : 'text-success'}`}>
                  ${(trip.budget - totalSpent).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Users className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <p className="text-xl font-bold">{trip.members.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Budget Used</span>
                <span className="font-medium">{Math.min(budgetPercent, 100).toFixed(0)}%</span>
              </div>
              <Progress
                value={Math.min(budgetPercent, 100)}
                className={`h-2 ${budgetPercent > 100 ? '[&>div]:bg-destructive' : budgetPercent > 80 ? '[&>div]:bg-warning' : ''}`}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="expenses" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="expenses" className="gap-2" data-testid="tab-expenses">
            <Receipt className="h-4 w-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2" data-testid="tab-members">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="itinerary" className="gap-2" data-testid="tab-itinerary">
            <CalendarDays className="h-4 w-4" />
            Itinerary
          </TabsTrigger>

        </TabsList>

        <TabsContent value="expenses" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">All Expenses</h3>
                <Badge variant="secondary">{expenses.length} items</Badge>
              </div>

              {expenses.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No expenses yet"
                  description="Add your first expense to start tracking spending."
                  actionLabel="Add Expense"
                  onAction={() => setShowAddExpense(true)}
                />
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      onEdit={() => {
                        setEditingExpense(expense);
                        setShowAddExpense(true);
                      }}
                      onDelete={() => {
                        if (confirm('Are you sure you want to delete this expense?')) {
                          deleteExpenseMutation.mutate(expense.id);
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <BudgetTracker budget={trip.budget} spent={totalSpent} />
              <ExpenseChart expenses={expenses} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Trip Members</h3>
            <Button variant="outline" size="sm" onClick={() => setShowAddMember(true)} data-testid="button-add-member">
              <Plus className="h-4 w-4 mr-1" />
              Add Member
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {trip.members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                showSettleButton
                onSettle={() => setShowSettlement(true)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="itinerary" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Trip Itinerary</h3>
            <Button variant="outline" size="sm" onClick={() => setShowAddActivity(true)} data-testid="button-add-activity">
              <Plus className="h-4 w-4 mr-1" />
              Add Activity
            </Button>
          </div>

          {activities.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No activities planned"
              description="Start planning your trip by adding activities."
              actionLabel="Add Activity"
              onAction={() => setShowAddActivity(true)}
            />
          ) : (
            <div className="space-y-6">
              {groupActivitiesByDate().map(([date, dayActivities]) => (
                <div key={date}>
                  <h4 className="font-medium text-sm text-muted-foreground mb-4">
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h4>
                  <Card>
                    <CardContent className="p-4">
                      {dayActivities.map((activity, index) => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          isFirst={index === 0}
                          isLast={index === dayActivities.length - 1}
                        />
                      ))}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </TabsContent>


      </Tabs>

      <AddExpenseModal
        open={showAddExpense}
        onClose={() => {
          setShowAddExpense(false);
          setEditingExpense(null);
        }}
        members={trip.members}
        onSubmit={handleAddExpense}
        initialData={editingExpense ? {
          id: editingExpense.id,
          description: editingExpense.description,
          amount: editingExpense.amount,
          category: editingExpense.category,
          paidById: editingExpense.paidBy.id,
          splitAmongIds: editingExpense.splitAmong?.map(s => s.memberId) || trip.members.map(m => m.id),
          date: editingExpense.date
        } : undefined}
      />

      <AddMemberModal
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        tripName={trip.name}
        onAddMember={(data) => createMemberMutation.mutate(data)}
      />

      <AddActivityModal
        open={showAddActivity}
        onClose={() => setShowAddActivity(false)}
        onSubmit={handleAddActivity}
      />

      <SettlementModal
        open={showSettlement}
        onClose={() => setShowSettlement(false)}
        settlements={calculateSettlements(trip.members, trip.id)}
        onSettle={(id) => console.log('Settled:', id)}
      />
    </div>
  );
}
