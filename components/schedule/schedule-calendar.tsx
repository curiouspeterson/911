'use client';

import * as React from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import {
  format,
  parse,
  startOfWeek,
  getDay,
  eachDayOfInterval,
  isSameDay,
} from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  getScheduleData,
  ScheduleEvent,
} from '@/lib/supabase/queries/get-schedule-data';
import {
  getStaffingRequirements,
  StaffingRequirement,
} from '@/lib/supabase/queries/get-staffing-requirements';
import { useToast } from '@/components/ui/use-toast';
import { ScheduleFiltersState } from './schedule-filters';
import { cn } from '@/lib/utils';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CustomEvent = ({
  event,
}: {
  event: ScheduleEvent & { isGap?: boolean };
}) => (
  <div className={cn(event.isGap && 'bg-red-200 border-red-500 text-red-800')}>
    <div title={event.title}>
      {event.isGap && <span className="font-bold">[GAP] </span>}
      {event.title}
    </div>
  </div>
);

interface ScheduleCalendarProps {
  filters: ScheduleFiltersState;
}

export function ScheduleCalendar({ filters }: ScheduleCalendarProps) {
  const [events, setEvents] = React.useState<
    (ScheduleEvent & { isGap?: boolean })[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dateRange, setDateRange] = React.useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });
  const { toast } = useToast();

  const fetchAndProcessData = React.useCallback(
    async (start: Date, end: Date, currentFilters: ScheduleFiltersState) => {
      setIsLoading(true);
      setError(null);
      try {
        const [
          { data: eventData, error: eventError },
          { data: reqData, error: reqError },
        ] = await Promise.all([
          getScheduleData(start, end, currentFilters),
          getStaffingRequirements(),
        ]);

        if (eventError || reqError) throw new Error(eventError || reqError);

        const events = eventData || [];
        const requirements = reqData || [];

        const daysInView = eachDayOfInterval({ start, end });
        const gaps = new Set<string>();

        daysInView.forEach((day) => {
          const dateStr = day.toISOString().split('T')[0];
          const shiftsOnThisDay = events.filter((e) =>
            isSameDay(new Date(e.start), day)
          );

          requirements.forEach((req) => {
            const shiftsInPeriod = shiftsOnThisDay.filter((e) => {
              const eventStartHour = new Date(e.start).getHours();
              const reqStartHour = parseInt(req.start_time.split(':')[0]);
              const reqEndHour = parseInt(req.end_time.split(':')[0]);
              return (
                eventStartHour >= reqStartHour &&
                (reqEndHour > reqStartHour ? eventStartHour < reqEndHour : true)
              );
            });

            if (shiftsInPeriod.length < req.min_employees) {
              gaps.add(`${dateStr}:${req.period_name}`);
            }
          });
        });

        const highlightedEvents = events.map((e) => {
          const eventStartDate = new Date(e.start);
          const dateStr = eventStartDate.toISOString().split('T')[0];
          const startHour = eventStartDate.getHours();
          const period = requirements.find(
            (r) =>
              startHour >= parseInt(r.start_time.split(':')[0]) &&
              startHour < parseInt(r.end_time.split(':')[0])
          );
          const isGap = !!(
            period && gaps.has(`${dateStr}:${period.period_name}`)
          );
          return { ...e, isGap };
        });

        setEvents(highlightedEvents);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  React.useEffect(() => {
    fetchAndProcessData(dateRange.start, dateRange.end, filters);
  }, [dateRange, filters, fetchAndProcessData]);

  const handleNavigate = (newDate: Date) => {
    const newStartDate = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
    const newEndDate = new Date(
      newDate.getFullYear(),
      newDate.getMonth() + 1,
      0
    );
    setDateRange({ start: newStartDate, end: newEndDate });
  };

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="h-[80vh] bg-white p-4 rounded-lg shadow-md">
      {isLoading && <div className="text-center">Loading schedule...</div>}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        date={dateRange.start}
        onNavigate={handleNavigate}
        components={{
          event: CustomEvent,
        }}
      />
    </div>
  );
}
