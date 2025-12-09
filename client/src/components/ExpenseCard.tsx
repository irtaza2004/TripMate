import { MoreHorizontal, Utensils, Car, Home, Ticket, ShoppingBag, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Expense, ExpenseCategory } from '@/lib/types';
import { getCategoryColor } from '@/lib/mock-data';

interface ExpenseCardProps {
  expense: Expense;
  onEdit?: () => void;
  onDelete?: () => void;
}

const categoryIcons: Record<ExpenseCategory, React.ReactNode> = {
  food: <Utensils className="h-4 w-4" />,
  transportation: <Car className="h-4 w-4" />,
  accommodation: <Home className="h-4 w-4" />,
  activities: <Ticket className="h-4 w-4" />,
  shopping: <ShoppingBag className="h-4 w-4" />,
  other: <HelpCircle className="h-4 w-4" />,
};

const categoryLabels: Record<ExpenseCategory, string> = {
  food: 'Food',
  transportation: 'Transport',
  accommodation: 'Lodging',
  activities: 'Activities',
  shopping: 'Shopping',
  other: 'Other',
};

export function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="overflow-visible hover-elevate" data-testid={`card-expense-${expense.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-md ${getCategoryColor(expense.category)}`}>
            {categoryIcons[expense.category]}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-medium truncate" data-testid={`text-expense-desc-${expense.id}`}>
                  {expense.description}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {categoryLabels[expense.category]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(expense.date)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold whitespace-nowrap" data-testid={`text-expense-amount-${expense.id}`}>
                  ${expense.amount.toFixed(2)}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-expense-menu-${expense.id}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit} data-testid={`button-expense-edit-${expense.id}`}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={onDelete} 
                      className="text-destructive focus:text-destructive"
                      data-testid={`button-expense-delete-${expense.id}`}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getInitials(expense.paidBy.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  Paid by <span className="text-foreground font-medium">{expense.paidBy.name}</span>
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                Split {expense.splitAmong.length} ways
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
