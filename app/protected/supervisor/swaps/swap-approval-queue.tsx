'use client';

import * as React from 'react';
import {
  getPendingSwaps,
  approveSwap,
  denySwap,
} from '@/app/actions/schedule-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface PendingSwap {
  id: string;
  from_employee: string;
  to_employee: string;
  from_shift: string;
  to_shift: string;
}

export function SwapApprovalQueue() {
  const { toast } = useToast();
  const [swaps, setSwaps] = React.useState<PendingSwap[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchSwaps = async () => {
    setLoading(true);
    try {
      const result = await getPendingSwaps();
      if (result.success) {
        setSwaps(result.data || []);
      } else {
        setError(result.error?.message || 'An unknown error occurred.');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSwaps();
  }, []);

  const handleApprove = async (swapId: string) => {
    const result = await approveSwap(swapId);
    if (result.success) {
      toast({ title: 'Success', description: 'Swap approved.' });
      fetchSwaps(); // Refresh the list
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error?.message,
      });
    }
  };

  const handleDeny = async (swapId: string) => {
    const result = await denySwap(swapId);
    if (result.success) {
      toast({ title: 'Success', description: 'Swap denied.' });
      fetchSwaps(); // Refresh the list
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error?.message,
      });
    }
  };

  if (loading) {
    return <div>Loading pending swaps...</div>;
  }

  if (error) {
    return <div>Failed to load swaps: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Swap Proposals</CardTitle>
      </CardHeader>
      <CardContent>
        {swaps.length === 0 ? (
          <p>No pending swaps.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From Employee</TableHead>
                <TableHead>To Employee</TableHead>
                <TableHead>From Shift</TableHead>
                <TableHead>To Shift</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {swaps.map((swap) => (
                <TableRow key={swap.id}>
                  <TableCell>{swap.from_employee}</TableCell>
                  <TableCell>{swap.to_employee}</TableCell>
                  <TableCell>{swap.from_shift}</TableCell>
                  <TableCell>{swap.to_shift}</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" onClick={() => handleApprove(swap.id)}>
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeny(swap.id)}
                    >
                      Deny
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
