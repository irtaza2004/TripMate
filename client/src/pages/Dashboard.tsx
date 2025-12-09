import { useState } from 'react';
import { Plus, Plane, DollarSign, Users, ArrowDownRight, Compass, MapPin } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TripCard } from '@/components/TripCard';
import { StatCard } from '@/components/StatCard';
import { BalanceSummary } from '@/components/BalanceSummary';
import { CreateTripModal } from '@/components/CreateTripModal';
import { EmptyState } from '@/components/EmptyState';
import { ContentLayout } from '@/components/layout/content-layout';
import type { Trip } from '@/lib/types';
import { tripImages } from '@/lib/mock-data';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: trips = [] } = useQuery<Trip[]>({
    queryKey: ['/api/trips']
  });

  const [showCreateTrip, setShowCreateTrip] = useState(false);

  const createTripMutation = useMutation({
    mutationFn: async (newTrip: any) => {
      const res = await apiRequest("POST", "/api/trips", newTrip);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
      setShowCreateTrip(false);
    }
  });

  // Calculate totals from real trip data
  const totalSpent = trips.reduce((sum, trip) => {
    const tripTotal = trip.expenses?.reduce((expSum, exp) => expSum + (typeof exp.amount === 'number' ? exp.amount : parseFloat(exp.amount) || 0), 0) || 0;
    return sum + tripTotal;
  }, 0);

  const totalMembers = new Set(trips.flatMap(t => t.members?.map(m => m.id) || [])).size;

  let totalOwedToUser = 0;
  let totalUserOwes = 0;

  if (user) {
    trips.forEach(trip => {
      // Find current user's member ID in this trip
      const myMember = trip.members.find(m => m.userId === user.id);
      if (!myMember) return;

      trip.expenses.forEach(expense => {
        const mySplit = expense.splitAmong?.find(s => s.memberId === myMember.id);
        const myShare = mySplit ? (typeof mySplit.amount === 'number' ? mySplit.amount : parseFloat(mySplit.amount)) : 0;

        if (expense.paidBy.userId === user.id) {
          // I paid.
          // I am owed: (Total Amount) - (My Share)
          // If I am not in split, I am owed everything (e.g. I paid for others)
          const expenseAmount = typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount);
          totalOwedToUser += (expenseAmount - myShare);
        } else {
          // Someone else paid.
          // I owe: My Share
          totalUserOwes += myShare;
        }
      });
    });
  }

  const netBalance = totalOwedToUser - totalUserOwes;

  const handleCreateTrip = (data: {
    name: string;
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
    description: string;
  }) => {
    createTripMutation.mutate({
      ...data,
      budget: data.budget.toString()
    });
  };

  return (
    <div className="space-y-8" data-testid="page-dashboard">
      <div
        className="relative -m-6 mb-2 p-8 overflow-hidden rounded-b-3xl"
        style={{
          backgroundImage: `url(${tripImages.beach2})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
            <Compass className="h-4 w-4" />
            <span>Your Adventure Dashboard</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Welcome back, {user?.username || 'Explorer'}!
          </h1>
          <p className="text-white/90 text-lg mb-6 drop-shadow">
            Ready for your next adventure? Track expenses, split bills, and make memories.
          </p>
          <Button
            onClick={() => setShowCreateTrip(true)}
            size="lg"
            className="gap-2 bg-white text-primary hover:bg-white/90 shadow-xl"
            data-testid="button-new-trip"
          >
            <Plus className="h-5 w-5" />
            Plan New Trip
          </Button>
        </div>
        <div className="absolute top-6 right-6 hidden lg:flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-white">
            <div className="text-sm text-white/80 mb-1">Active Trips</div>
            <div className="text-2xl font-bold">{trips.length}</div>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-white">
            <div className="text-sm text-white/80 mb-1">Total Spent</div>
            <div className="text-2xl font-bold">${totalSpent.toFixed(0)}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Trips" value={trips.length} icon={Plane} />
        <StatCard title="Total Spent" value={`$${totalSpent.toFixed(0)}`} icon={DollarSign} />
        <StatCard title="Trip Members" value={totalMembers} icon={Users} />
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Balance</p>
                <p className={`text-2xl font-bold mt-1 ${netBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {netBalance >= 0 ? '+' : '-'}${Math.abs(netBalance).toFixed(2)}
                </p>
                <p className="text-xs mt-1 text-muted-foreground">
                  {netBalance >= 0 ? 'You are owed' : 'You owe'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-success/10">
                <ArrowDownRight className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Trips</h2>
            <Link href="/trips">
              <Button variant="ghost" size="sm" data-testid="link-view-all-trips">
                View All
              </Button>
            </Link>
          </div>

          {trips.length === 0 ? (
            <EmptyState
              icon={Plane}
              title="No trips yet"
              description="Create your first trip to start tracking expenses with friends."
              actionLabel="Create Trip"
              onAction={() => setShowCreateTrip(true)}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {trips.slice(0, 4).map((trip) => (
                <Link key={trip.id} href={`/trips/${trip.id}`}>
                  <TripCard trip={trip} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <BalanceSummary totalOwed={totalOwedToUser} totalOwing={totalUserOwes} />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity
              </p>
            </CardContent>
          </Card>

          <Card
            className="relative overflow-hidden"
            style={{
              backgroundImage: `url(${tripImages.mountain2})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70" />
            <CardContent className="relative z-10 p-6 text-white">
              <MapPin className="h-8 w-8 mb-3 opacity-90" />
              <h3 className="font-semibold text-lg mb-1">Discover New Places</h3>
              <p className="text-white/80 text-sm mb-4">
                Plan your next adventure and create unforgettable memories.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/20 border-white/40 text-white hover:bg-white/30 backdrop-blur-sm"
                onClick={() => setShowCreateTrip(true)}
              >
                Start Planning
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateTripModal
        open={showCreateTrip}
        onClose={() => setShowCreateTrip(false)}
        onSubmit={handleCreateTrip}
      />
    </div>
  );
}
