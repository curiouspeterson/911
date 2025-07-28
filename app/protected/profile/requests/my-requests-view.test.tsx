import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MyRequestsView } from './my-requests-view'; // Component doesn't exist yet
import * as scheduleActions from '@/app/actions/schedule-actions'; // To mock the data fetching action

// Mock the action that will fetch the user's requests
vi.mock('@/app/actions/schedule-actions', () => ({
  getUserTimeOffRequests: vi.fn(),
}));

const mockRequests = [
  {
    id: 'req1',
    start_date: '2025-05-01',
    end_date: '2025-05-05',
    reason: 'Vacation',
    status: 'approved',
  },
  {
    id: 'req2',
    start_date: '2025-06-10',
    end_date: '2025-06-11',
    reason: 'Sick leave',
    status: 'pending',
  },
];

describe('MyRequestsView Component', () => {
  it('should display a loading state initially', () => {
    vi.mocked(scheduleActions.getUserTimeOffRequests).mockReturnValue(
      new Promise(() => {})
    ); // Never resolves
    render(<MyRequestsView />);
    expect(screen.getByText(/loading your requests/i)).toBeInTheDocument();
  });

  it('should display "no requests found" message when there are no requests', async () => {
    vi.mocked(scheduleActions.getUserTimeOffRequests).mockResolvedValue({
      success: true,
      data: [],
    });
    render(<MyRequestsView />);
    await waitFor(() => {
      expect(
        screen.getByText(/no time-off requests found/i)
      ).toBeInTheDocument();
    });
  });

  it('should render a list of requests when data is returned', async () => {
    vi.mocked(scheduleActions.getUserTimeOffRequests).mockResolvedValue({
      success: true,
      data: mockRequests,
    });
    render(<MyRequestsView />);

    await waitFor(() => {
      expect(screen.getByText('Vacation')).toBeInTheDocument();
      expect(screen.getByText('Sick leave')).toBeInTheDocument();
      // Check for status badges
      expect(screen.getByText(/approved/i)).toBeInTheDocument();
      expect(screen.getByText(/pending/i)).toBeInTheDocument();
    });
  });

  it('should display an error message if fetching data fails', async () => {
    vi.mocked(scheduleActions.getUserTimeOffRequests).mockResolvedValue({
      success: false,
      error: { message: 'Database error' },
    });
    render(<MyRequestsView />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load requests/i)).toBeInTheDocument();
      expect(screen.getByText(/database error/i)).toBeInTheDocument();
    });
  });
});
