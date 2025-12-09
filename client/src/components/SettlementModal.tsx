import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Settlement } from '@/lib/types';

interface SettlementModalProps {
  open: boolean;
  onClose: () => void;
  settlements: Settlement[];
  onSettle: (settlementId: string) => void;
}

export function SettlementModal({ open, onClose, settlements, onSettle }: SettlementModalProps) {
  const [settledIds, setSettledIds] = useState<string[]>([]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleSettle = (id: string) => {
    setSettledIds(prev => [...prev, id]);
    onSettle(id);
  };

  const pendingSettlements = settlements.filter(s => !s.isSettled && !settledIds.includes(s.id));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settle Up</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {pendingSettlements.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
              <h3 className="font-medium">All Settled!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Everyone is squared up on this trip.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                These are the simplest transactions to settle all debts:
              </p>
              
              {pendingSettlements.map((settlement) => (
                <div 
                  key={settlement.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  data-testid={`settlement-${settlement.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-destructive/10 text-destructive">
                        {getInitials(settlement.fromMember.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex flex-col items-center px-2">
                      <span className="text-lg font-semibold">${settlement.amount.toFixed(2)}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-success/10 text-success">
                        {getInitials(settlement.toMember.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <Button 
                    size="sm"
                    onClick={() => handleSettle(settlement.id)}
                    data-testid={`button-settle-${settlement.id}`}
                  >
                    Mark Paid
                  </Button>
                </div>
              ))}
              
              <p className="text-xs text-muted-foreground pt-2">
                Tap "Mark Paid" when payment is complete
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
