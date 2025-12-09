import { ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BalanceSummaryProps {
  totalOwed: number;
  totalOwing: number;
}

export function BalanceSummary({ totalOwed, totalOwing }: BalanceSummaryProps) {
  const netBalance = totalOwed - totalOwing;

  return (
    <Card data-testid="card-balance-summary">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Your Balance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-success/10">
              <ArrowDownRight className="h-4 w-4 text-success" />
            </div>
            <span className="text-sm text-muted-foreground">You are owed</span>
          </div>
          <span className="text-lg font-semibold text-success" data-testid="text-total-owed">
            ${totalOwed.toFixed(2)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-destructive/10">
              <ArrowUpRight className="h-4 w-4 text-destructive" />
            </div>
            <span className="text-sm text-muted-foreground">You owe</span>
          </div>
          <span className="text-lg font-semibold text-destructive" data-testid="text-total-owing">
            ${totalOwing.toFixed(2)}
          </span>
        </div>
        
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Net Balance</span>
            </div>
            <span 
              className={`text-xl font-bold ${netBalance >= 0 ? 'text-success' : 'text-destructive'}`}
              data-testid="text-net-balance"
            >
              {netBalance >= 0 ? '+' : '-'}${Math.abs(netBalance).toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
