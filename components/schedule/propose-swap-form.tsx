'use client';

import * as React from 'react';
import {
  getUserShifts,
  getEligibleSwapEmployees,
  proposeSwap,
} from '@/app/actions/schedule-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface UserShift {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
}

interface EligibleEmployee {
  id: string;
  full_name: string;
}

export function ProposeSwapForm() {
  const { toast } = useToast();
  const [userShifts, setUserShifts] = React.useState<UserShift[]>([]);
  const [eligibleEmployees, setEligibleEmployees] = React.useState<
    EligibleEmployee[]
  >([]);
  const [selectedShiftId, setSelectedShiftId] = React.useState<string | null>(
    null
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<
    string | null
  >(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchShifts = async () => {
      const result = await getUserShifts();
      if (result.success) {
        setUserShifts(result.data || []);
      }
      setLoading(false);
    };
    fetchShifts();
  }, []);

  React.useEffect(() => {
    if (selectedShiftId) {
      const fetchEligible = async () => {
        const result = await getEligibleSwapEmployees(selectedShiftId);
        if (result.success) {
          setEligibleEmployees(result.data || []);
        }
      };
      fetchEligible();
    }
  }, [selectedShiftId]);

  const handleSubmit = async () => {
    if (!selectedShiftId || !selectedEmployeeId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a shift and an employee.',
      });
      return;
    }
    const result = await proposeSwap({
      fromShiftId: selectedShiftId,
      toEmployeeId: selectedEmployeeId,
    });
    if (result.success) {
      toast({ title: 'Success', description: 'Swap proposed.' });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error?.message,
      });
    }
  };

  if (loading) {
    return <div>Loading your shifts...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Propose a Shift Swap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Select one of your shifts to swap:</Label>
            <RadioGroup onValueChange={setSelectedShiftId}>
              {userShifts.map((shift) => (
                <div key={shift.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={shift.id} id={shift.id} />
                  <Label htmlFor={shift.id}>
                    {shift.date} ({shift.start_time} - {shift.end_time})
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {selectedShiftId && (
            <div>
              <Label>Select an employee to swap with:</Label>
              <RadioGroup onValueChange={setSelectedEmployeeId}>
                {eligibleEmployees.map((emp) => (
                  <div key={emp.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={emp.id} id={emp.id} />
                    <Label htmlFor={emp.id}>{emp.full_name}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          <Button onClick={handleSubmit}>Propose Swap</Button>
        </div>
      </CardContent>
    </Card>
  );
}
