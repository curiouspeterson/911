'use client';

import * as React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ScheduleCalendar } from './schedule-calendar';
import { ScheduleFiltersState } from './schedule-filters';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

export function DraggableScheduleCalendar({
  filters,
}: {
  filters: ScheduleFiltersState;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );
  const { toast } = useToast();

  React.useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('assigned_shifts_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assigned_shifts' },
        (payload) => {
          console.log('Change received!', payload);
          toast({
            title: 'Schedule Updated',
            description: 'The schedule has been modified by another user.',
            action: (
              <Button onClick={() => window.location.reload()}>Refresh</Button>
            ),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      console.log(`Dragged event ${active.id} over ${over.id}`);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={[]} strategy={verticalListSortingStrategy}>
        <ScheduleCalendar filters={filters} />
      </SortableContext>
    </DndContext>
  );
}
