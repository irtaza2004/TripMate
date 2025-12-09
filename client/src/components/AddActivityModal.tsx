import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AddActivityModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    location: string;
    date: string;
    time: string;
    cost: string;
  }) => void;
}

export function AddActivityModal({ open, onClose, onSubmit }: AddActivityModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [cost, setCost] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    onSubmit({ title, description, location, date, time, cost });

    setTitle('');
    setDescription('');
    setLocation('');
    setDate('');
    setTime('');
    setCost('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Activity</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activity-title">Activity Name</Label>
            <Input
              id="activity-title"
              placeholder="e.g., Visit the museum"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="input-activity-title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activity-date">Date</Label>
              <Input
                id="activity-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                data-testid="input-activity-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity-time">Time (optional)</Label>
              <Input
                id="activity-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                data-testid="input-activity-time"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-cost">Cost (optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="activity-cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="pl-7"
                data-testid="input-activity-cost"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-location">Location (optional)</Label>
            <Input
              id="activity-location"
              placeholder="e.g., Downtown Art Museum"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              data-testid="input-activity-location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-description">Notes (optional)</Label>
            <Textarea
              id="activity-description"
              placeholder="Any additional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              data-testid="input-activity-description"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!title || !date}
              data-testid="button-add-activity"
            >
              Add Activity
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
