/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ScheduleCalendar } from './schedule-calendar';

// Mock the data fetching functions
vi.mock('@/lib/supabase/queries/get-schedule-data', () => ({
  getScheduleData: vi.fn(),
}));

vi.mock('@/lib/supabase/queries/get-staffing-requirements', () => ({
  getStaffingRequirements: vi.fn(),
}));

describe('ScheduleCalendar Component', () => {
  const defaultFilters = { userId: null, roleId: null };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', async () => {
    const mockGetScheduleData = vi
      .fn()
      .mockImplementation(() => new Promise(() => {}));
    const mockGetStaffingRequirements = vi
      .fn()
      .mockImplementation(() => new Promise(() => {}));

    const { getScheduleData } = await import(
      '@/lib/supabase/queries/get-schedule-data'
    );
    const { getStaffingRequirements } = await import(
      '@/lib/supabase/queries/get-staffing-requirements'
    );

    vi.mocked(getScheduleData).mockImplementation(mockGetScheduleData);
    vi.mocked(getStaffingRequirements).mockImplementation(
      mockGetStaffingRequirements
    );

    render(<ScheduleCalendar filters={defaultFilters} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render error state when data fetching fails', async () => {
    const mockGetScheduleData = vi
      .fn()
      .mockResolvedValue({ error: 'Database connection failed' });
    const mockGetStaffingRequirements = vi.fn().mockResolvedValue({ data: [] });

    const { getScheduleData } = await import(
      '@/lib/supabase/queries/get-schedule-data'
    );
    const { getStaffingRequirements } = await import(
      '@/lib/supabase/queries/get-staffing-requirements'
    );

    vi.mocked(getScheduleData).mockImplementation(mockGetScheduleData);
    vi.mocked(getStaffingRequirements).mockImplementation(
      mockGetStaffingRequirements
    );

    render(<ScheduleCalendar filters={defaultFilters} />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('should render calendar with schedule data', async () => {
    const mockGetScheduleData = vi.fn().mockResolvedValue({
      data: {
        employees: [{ id: '1', full_name: 'John Doe' }],
        shifts: [{ id: '1', name: 'Morning Shift' }],
        requirements: [{ id: '1', role: 'dispatcher', count: 2 }],
      },
    });
    const mockGetStaffingRequirements = vi.fn().mockResolvedValue({
      data: [{ id: '1', role: 'dispatcher', count: 2 }],
    });

    const { getScheduleData } = await import(
      '@/lib/supabase/queries/get-schedule-data'
    );
    const { getStaffingRequirements } = await import(
      '@/lib/supabase/queries/get-staffing-requirements'
    );

    vi.mocked(getScheduleData).mockImplementation(mockGetScheduleData);
    vi.mocked(getStaffingRequirements).mockImplementation(
      mockGetStaffingRequirements
    );

    render(<ScheduleCalendar filters={defaultFilters} />);

    await waitFor(() => {
      expect(screen.getByText(/schedule/i)).toBeInTheDocument();
    });
  });
});
