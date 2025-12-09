import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { TripMember } from '@/lib/types';

interface MemberCardProps {
  member: TripMember;
  showSettleButton?: boolean;
  onSettle?: () => void;
}

export function MemberCard({ member, showSettleButton = false, onSettle }: MemberCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getBalanceColor = () => {
    if (member.balance > 0) return 'text-success';
    if (member.balance < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getBalanceText = () => {
    if (member.balance > 0) return `gets back $${member.balance.toFixed(2)}`;
    if (member.balance < 0) return `owes $${Math.abs(member.balance).toFixed(2)}`;
    return 'settled up';
  };

  return (
    <div 
      className="flex items-center justify-between p-3 rounded-lg bg-card border"
      data-testid={`card-member-${member.id}`}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(member.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium" data-testid={`text-member-name-${member.id}`}>
              {member.name}
            </span>
            {member.isOwner && (
              <Badge variant="secondary" className="text-xs">Owner</Badge>
            )}
          </div>
          <span className={`text-sm ${getBalanceColor()}`} data-testid={`text-member-balance-${member.id}`}>
            {getBalanceText()}
          </span>
        </div>
      </div>
      
      {showSettleButton && member.balance !== 0 && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={onSettle}
          data-testid={`button-settle-${member.id}`}
        >
          Settle
        </Button>
      )}
    </div>
  );
}
