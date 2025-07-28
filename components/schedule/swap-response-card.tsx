'use client';

import * as React from 'react';
import { acceptSwap, rejectSwap } from '@/app/actions/schedule-actions';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface SwapProposal {
  id: string;
  from_employee_name: string;
  from_shift_date: string;
  from_shift_start_time: string;
  from_shift_end_time: string;
}

interface SwapResponseCardProps {
  proposal: SwapProposal;
}

export function SwapResponseCard({ proposal }: SwapResponseCardProps) {
  const { toast } = useToast();

  const handleAccept = async () => {
    const result = await acceptSwap(proposal.id);
    if (result.success) {
      toast({ title: 'Success', description: 'Swap accepted.' });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error?.message,
      });
    }
  };

  const handleReject = async () => {
    const result = await rejectSwap(proposal.id);
    if (result.success) {
      toast({ title: 'Success', description: 'Swap rejected.' });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error?.message,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shift Swap Proposal</CardTitle>
        <CardDescription>
          {proposal.from_employee_name} has proposed a shift swap with you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          Their shift: {proposal.from_shift_date} from{' '}
          {proposal.from_shift_start_time} to {proposal.from_shift_end_time}
        </p>
      </CardContent>
      <CardFooter className="space-x-2">
        <Button onClick={handleAccept}>Accept</Button>
        <Button variant="destructive" onClick={handleReject}>
          Reject
        </Button>
      </CardFooter>
    </Card>
  );
}
