import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  tripName: string;
  onAddMember: (data: { name: string }) => void;
}

export function AddMemberModal({ open, onClose, tripName, onAddMember }: AddMemberModalProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddMember({ name });
    setName('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Member to {tripName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Enter the name of the new member to add them to the trip.
          </p>
          <div className="space-y-2">
            <Label htmlFor="member-name">Name</Label>
            <Input
              id="member-name"
              placeholder="e.g. Alice"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-member-name"
            />
          </div>
          <Button
            type="submit"
            className="w-full gap-2"
            disabled={!name.trim()}
            data-testid="button-add-member-submit"
          >
            <UserPlus className="h-4 w-4" />
            Add Member
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
