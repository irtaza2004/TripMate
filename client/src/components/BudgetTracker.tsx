import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface BudgetTrackerProps {
  budget: number;
  spent: number;
}

export function BudgetTracker({ budget, spent }: BudgetTrackerProps) {
  const remaining = budget - spent;
  const percentage = Math.min((spent / budget) * 100, 100);
  const isOverBudget = spent > budget;
  const isNearBudget = percentage >= 80 && !isOverBudget;

  return (
    <Card data-testid="card-budget-tracker">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          Budget Tracker
          {isOverBudget && <AlertTriangle className="h-4 w-4 text-destructive" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Spent</span>
            <span className={`font-medium ${isOverBudget ? 'text-destructive' : ''}`}>
              ${spent.toFixed(2)}
            </span>
          </div>
          <Progress 
            value={percentage} 
            className={`h-3 ${isOverBudget ? '[&>div]:bg-destructive' : isNearBudget ? '[&>div]:bg-warning' : ''}`}
          />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Budget</span>
            <span className="font-medium">${budget.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {isOverBudget ? 'Over budget' : 'Remaining'}
            </span>
            <div className="flex items-center gap-1">
              {isOverBudget ? (
                <TrendingUp className="h-4 w-4 text-destructive" />
              ) : (
                <TrendingDown className="h-4 w-4 text-success" />
              )}
              <span 
                className={`text-lg font-semibold ${isOverBudget ? 'text-destructive' : 'text-success'}`}
                data-testid="text-budget-remaining"
              >
                ${Math.abs(remaining).toFixed(2)}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {percentage.toFixed(0)}% of budget used
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
