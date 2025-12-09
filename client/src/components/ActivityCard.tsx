import { Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Activity } from '@/lib/types';

interface ActivityCardProps {
  activity: Activity;
  isFirst?: boolean;
  isLast?: boolean;
}

export function ActivityCard({ activity, isFirst = false, isLast = false }: ActivityCardProps) {
  const formatTime = (time?: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="flex gap-4" data-testid={`card-activity-${activity.id}`}>
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full bg-primary ${isFirst ? '' : ''}`} />
        {!isLast && <div className="w-0.5 flex-1 bg-border my-1" />}
      </div>
      
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-medium" data-testid={`text-activity-title-${activity.id}`}>
              {activity.title}
            </h4>
            {activity.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
            )}
          </div>
          {activity.time && (
            <Badge variant="outline" className="shrink-0">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(activity.time)}
            </Badge>
          )}
        </div>
        
        {activity.location && (
          <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{activity.location}</span>
          </div>
        )}
      </div>
    </div>
  );
}
