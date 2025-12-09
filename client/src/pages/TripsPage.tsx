import { useState } from 'react';
import { Plus, Search, Filter, Map, Plane } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TripCard } from '@/components/TripCard';
import { CreateTripModal } from '@/components/CreateTripModal';
import { EmptyState } from '@/components/EmptyState';
import type { Trip } from '@shared/schema';
import { tripImages } from '@/lib/mock-data';

export default function TripsPage() {
  const queryClient = useQueryClient();
  const { data: trips = [] } = useQuery<Trip[]>({
    queryKey: ['/api/trips']
  });

  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

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

  const filteredTrips = trips.filter(trip =>
    trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedTrips = [...filteredTrips].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      case 'recent':
      default:
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    }
  });

  return (
    <div className="space-y-6" data-testid="page-trips">
      <div
        className="relative -m-6 mb-2 p-8 overflow-hidden rounded-b-3xl"
        style={{
          backgroundImage: `url(${tripImages.mountain1})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
              <Map className="h-4 w-4" />
              <span>Explore Your Adventures</span>
            </div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">My Trips</h1>
            <p className="text-white/80 mt-1">Manage all your trips in one place.</p>
          </div>
          <Button
            onClick={() => setShowCreateTrip(true)}
            className="gap-2 bg-white text-primary hover:bg-white/90 shadow-lg"
            data-testid="button-new-trip"
          >
            <Plus className="h-4 w-4" />
            New Trip
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-trips"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-sort-trips">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="date">Start Date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sortedTrips.length === 0 ? (
        searchQuery ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No trips found matching "{searchQuery}"</p>
          </div>
        ) : (
          <EmptyState
            icon={Plane}
            title="No trips yet"
            description="Create your first trip to start tracking expenses with friends."
            actionLabel="Create Trip"
            onAction={() => setShowCreateTrip(true)}
          />
        )
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedTrips.map((trip) => (
            <Link key={trip.id} href={`/trips/${trip.id}`}>
              <TripCard trip={trip} />
            </Link>
          ))}
        </div>
      )}

      <CreateTripModal
        open={showCreateTrip}
        onClose={() => setShowCreateTrip(false)}
        onSubmit={handleCreateTrip}
      />
    </div>
  );
}
