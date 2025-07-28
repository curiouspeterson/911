'use client';

import * as React from 'react';
import {
  getPendingTimeOffRequests,
  approveTimeOffRequest,
  denyTimeOffRequest,
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
import { format } from 'date-fns';

interface PendingRequest {
  id: string;
  employee_name: string;
  start_date: string;
  end_date: string;
  reason: string | null;
}

export function ApprovalQueueView() {
  const { toast } = useToast();
  const [requests, setRequests] = React.useState<PendingRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const result = await getPendingTimeOffRequests();
      if (result.success) {
        setRequests(result.data || []);
      } else {
        setError(result.error || 'An unknown error occurred.');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (requestId: string) => {
    const result = await approveTimeOffRequest(requestId);
    if (result.success) {
      toast({ title: 'Success', description: 'Request approved.' });
      fetchRequests(); // Refresh the list
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
  };

  const handleDeny = async (requestId: string) => {
    const result = await denyTimeOffRequest(requestId);
    if (result.success) {
      toast({ title: 'Success', description: 'Request denied.' });
      fetchRequests(); // Refresh the list
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
  };

  if (loading) {
    return <div>Loading pending requests...</div>;
  }

  if (error) {
    return <div>Failed to load requests: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Time-Off Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>{req.employee_name}</TableCell>
                  <TableCell>
                    {format(new Date(req.start_date), 'PPP')}
                  </TableCell>
                  <TableCell>{format(new Date(req.end_date), 'PPP')}</TableCell>
                  <TableCell>{req.reason || 'N/A'}</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" onClick={() => handleApprove(req.id)}>
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeny(req.id)}
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
