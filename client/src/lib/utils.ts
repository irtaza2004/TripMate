import { TripMember, Settlement } from './types';

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function calculateSettlements(members: TripMember[], tripId: string): Settlement[] {
  // Simple algorithm to match debtors to creditors
  const debtors = members.filter(m => m.balance < 0).sort((a, b) => a.balance - b.balance); // Most negative first
  const creditors = members.filter(m => m.balance > 0).sort((a, b) => b.balance - a.balance); // Most positive first

  const settlements: Settlement[] = [];

  let d = 0;
  let c = 0;

  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];

    const debtAmount = Math.abs(debtor.balance);
    const creditAmount = creditor.balance;

    const amount = Math.min(debtAmount, creditAmount);

    if (amount > 0.01) {
      settlements.push({
        id: `settle-${debtor.id}-${creditor.id}-${Date.now()}`,
        tripId: tripId,
        fromMember: debtor,
        toMember: creditor,
        amount: Number(amount.toFixed(2)),
        isSettled: false
      });
    }

    // Update balances for next iteration (virtual update)
    debtor.balance += amount;
    creditor.balance -= amount;

    if (Math.abs(debtor.balance) < 0.01) d++;
    if (Math.abs(creditor.balance) < 0.01) c++;
  }

  return settlements;
}
