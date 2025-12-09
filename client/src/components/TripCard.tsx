import { Calendar, MapPin, Users, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import type { Trip } from '@/lib/types';
import { calculateTotalExpenses, tripImages } from '@/lib/mock-data';

interface TripCardProps {
  trip: Trip;
  onClick?: () => void;
}

const defaultImages = [tripImages.beach1, tripImages.mountain1, tripImages.city1, tripImages.beach2, tripImages.mountain2];

export function TripCard({ trip, onClick }: TripCardProps) {
  const totalSpent = calculateTotalExpenses(trip.expenses);
  const budgetPercent = Math.min((totalSpent / trip.budget) * 100, 100);
  const isOverBudget = totalSpent > trip.budget;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const coverImage = trip.coverImage || defaultImages[parseInt(trip.id.replace(/\D/g, '')) % defaultImages.length];

  return (
    <Card
      className="overflow-hidden cursor-pointer hover-elevate active-elevate-2 transition-all duration-300 group"
      onClick={onClick}
      data-testid={`card-trip-${trip.id}`}
    >
      <div className="relative h-36 overflow-hidden">
        <img
          src={coverImage}
          alt={trip.destination}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-bold text-lg text-white drop-shadow-lg truncate" data-testid={`text-trip-name-${trip.id}`}>
            {trip.name}
          </h3>
          <div className="flex items-center gap-1 text-white/90 text-sm mt-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate drop-shadow">{trip.destination}</span>
          </div>
        </div>
        <Badge 
          variant="secondary" 
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-foreground"
        >
          {trip.expenses.length} expenses
        </Badge>
      </div>

      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Budget</span>
            </div>
            <span className={isOverBudget ? 'text-destructive font-medium' : 'font-medium'}>
              ${totalSpent.toFixed(0)} / ${trip.budget}
            </span>
          </div>
          <Progress 
            value={budgetPercent} 
            className={`h-2 ${isOverBudget ? '[&>div]:bg-destructive' : ''}`}
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{trip.members.length} members</span>
          </div>
          <div className="flex -space-x-2">
            {trip.members.slice(0, 4).map((member) => (
              <Avatar key={member.id} className="h-7 w-7 border-2 border-background">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
            ))}
            {trip.members.length > 4 && (
              <Avatar className="h-7 w-7 border-2 border-background">
                <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                  +{trip.members.length - 4}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
