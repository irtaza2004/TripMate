import { useState, useEffect } from 'react';
import { X, Utensils, Car, Home, Ticket, ShoppingBag, HelpCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { TripMember, ExpenseCategory } from '@/lib/types';

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  members: TripMember[];
  onSubmit: (data: {
    description: string;
    amount: number;
    category: ExpenseCategory;
    paidById: string;
    splitAmongIds: string[];
    date: string;
  }) => void;
  initialData?: {
    id: string;
    description: string;
    amount: number;
    category: ExpenseCategory;
    paidById: string;
    splitAmongIds: string[];
    date: string;
  };
}

const categories: { value: ExpenseCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'food', label: 'Food', icon: <Utensils className="h-4 w-4" /> },
  { value: 'transportation', label: 'Transport', icon: <Car className="h-4 w-4" /> },
  { value: 'accommodation', label: 'Lodging', icon: <Home className="h-4 w-4" /> },
  { value: 'activities', label: 'Activities', icon: <Ticket className="h-4 w-4" /> },
  { value: 'shopping', label: 'Shopping', icon: <ShoppingBag className="h-4 w-4" /> },
  { value: 'other', label: 'Other', icon: <HelpCircle className="h-4 w-4" /> },
];

export function AddExpenseModal({ open, onClose, members, onSubmit, initialData }: AddExpenseModalProps) {
  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [category, setCategory] = useState<ExpenseCategory>(initialData?.category || 'food');
  const [paidById, setPaidById] = useState(initialData?.paidById || members[0]?.id || '');
  const [splitAmongIds, setSplitAmongIds] = useState<string[]>(initialData?.splitAmongIds || members.map(m => m.id));
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);

  // Update state when initialData changes (fix for edit mode)
  // Update state when initialData changes (fix for edit mode)
  useEffect(() => {
    if (open) {
      if (initialData) {
        setDescription(initialData.description);
        setAmount(initialData.amount.toString());
        setCategory(initialData.category);
        setPaidById(initialData.paidById);
        setSplitAmongIds(initialData.splitAmongIds);
        setDate(initialData.date);
      } else {
        // Reset for "Add" mode
        setDescription('');
        setAmount('');
        setCategory('food');
        setPaidById(members[0]?.id || '');
        setSplitAmongIds(members.map(m => m.id));
        setDate(new Date().toISOString().split('T')[0]);
      }
    }
  }, [initialData, open, members]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const toggleMember = (memberId: string) => {
    setSplitAmongIds(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || splitAmongIds.length === 0) return;

    onSubmit({
      description,
      amount: parseFloat(amount),
      category,
      paidById,
      splitAmongIds,
      date,
    });

    setDescription('');
    setAmount('');
    setCategory('food');
    setSplitAmongIds(members.map(m => m.id));
    onClose();
  };

  const splitAmount = splitAmongIds.length > 0 && amount
    ? (parseFloat(amount) / splitAmongIds.length).toFixed(2)
    : '0.00';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-2xl font-semibold h-14"
                data-testid="input-expense-amount"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What was this expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              data-testid="input-expense-description"
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  type="button"
                  variant={category === cat.value ? 'default' : 'outline'}
                  className="flex flex-col gap-1 h-auto py-3"
                  onClick={() => setCategory(cat.value)}
                  data-testid={`button-category-${cat.value}`}
                >
                  {cat.icon}
                  <span className="text-xs">{cat.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              data-testid="input-expense-date"
            />
          </div>

          <div className="space-y-2">
            <Label>Paid by</Label>
            <div className="flex flex-wrap gap-2">
              {members.map((member) => (
                <Button
                  key={member.id}
                  type="button"
                  variant={paidById === member.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPaidById(member.id)}
                  className="gap-2"
                  data-testid={`button-paidby-${member.id}`}
                >
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  {member.name.split(' ')[0]}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Split among</Label>
              <span className="text-sm text-muted-foreground">
                ${splitAmount} each
              </span>
            </div>
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50"
                >
                  <Checkbox
                    id={`split-${member.id}`}
                    checked={splitAmongIds.includes(member.id)}
                    onCheckedChange={() => toggleMember(member.id)}
                    data-testid={`checkbox-split-${member.id}`}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor={`split-${member.id}`}
                    className="flex-1 cursor-pointer text-sm font-medium"
                  >
                    {member.name}
                  </label>
                  {splitAmongIds.includes(member.id) && (
                    <span className="text-sm text-muted-foreground">
                      ${splitAmount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!description || !amount || splitAmongIds.length === 0}
              data-testid="button-submit-expense"
            >
              {initialData ? 'Update Expense' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
