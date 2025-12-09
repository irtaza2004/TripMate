import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CreateTripModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
    description: string;
  }) => void;
}

export function CreateTripModal({ open, onClose, onSubmit }: CreateTripModalProps) {
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !destination || !startDate || !endDate) return;
    
    onSubmit({
      name,
      destination,
      startDate,
      endDate,
      budget: parseFloat(budget) || 0,
      description,
    });
    
    setName('');
    setDestination('');
    setStartDate('');
    setEndDate('');
    setBudget('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Trip</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trip-name">Trip Name</Label>
            <Input
              id="trip-name"
              placeholder="e.g., Summer Vacation 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-trip-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              placeholder="e.g., Bali, Indonesia"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              data-testid="input-trip-destination"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="input-trip-start-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-testid="input-trip-end-date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget (optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="budget"
                type="number"
                min="0"
                step="100"
                placeholder="2000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="pl-8"
                data-testid="input-trip-budget"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trip-description">Description (optional)</Label>
            <Textarea
              id="trip-description"
              placeholder="Tell us about your trip..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              data-testid="input-trip-description"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={!name || !destination || !startDate || !endDate}
              data-testid="button-create-trip"
            >
              Create Trip
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
