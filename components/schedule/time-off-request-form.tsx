'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { createTimeOffRequest } from '@/app/actions/schedule-actions';
import { useToast } from '@/components/ui/use-toast';

const timeOffRequestSchema = z.object({
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().min(1, { message: 'End date is required' }),
  reason: z.string().optional(),
});

type TimeOffRequestFormValues = z.infer<typeof timeOffRequestSchema>;

export function TimeOffRequestForm() {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TimeOffRequestFormValues>({
    resolver: zodResolver(timeOffRequestSchema),
  });

  const onSubmit = async (data: TimeOffRequestFormValues) => {
    const result = await createTimeOffRequest({
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      reason: data.reason,
    });

    if (result.success) {
      toast({ title: 'Success', description: 'Time-off request submitted.' });
      reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error?.message || 'An unknown error occurred.',
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Request Time Off</CardTitle>
        <CardDescription>
          Submit a request for time off. It will be reviewed by a supervisor.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" type="date" {...register('startDate')} />
            {errors.startDate && (
              <p className="text-red-500 text-xs">{errors.startDate.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input id="endDate" type="date" {...register('endDate')} />
            {errors.endDate && (
              <p className="text-red-500 text-xs">{errors.endDate.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Input id="reason" {...register('reason')} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Submit Request</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
