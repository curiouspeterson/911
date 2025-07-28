'use client';

import * as React from 'react';
import { getUserTimeOffRequests } from '@/app/actions/schedule-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

// Define the shape of a request, assuming this comes from the database
interface TimeOffRequest {
  id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'denied';
}

export function MyRequestsView() {
  const [requests, setRequests] = React.useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getUserTimeOffRequests();
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

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading your requests...</div>;
  }

  if (error) {
    return <div>Failed to load requests: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Time-Off Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p>No time-off requests found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    {format(new Date(req.start_date), 'PPP')}
                  </TableCell>
                  <TableCell>{format(new Date(req.end_date), 'PPP')}</TableCell>
                  <TableCell>{req.reason || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        req.status === 'approved'
                          ? 'default'
                          : req.status === 'denied'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {req.status}
                    </Badge>
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
