import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApprovalQueueView } from './approval-queue-view'; // Component doesn't exist yet
import * as scheduleActions from '@/app/actions/schedule-actions';

// Mock the actions
vi.mock('@/app/actions/schedule-actions', () => ({
  getPendingTimeOffRequests: vi.fn(),
  approveTimeOffRequest: vi.fn(),
  denyTimeOffRequest: vi.fn(),
}));

const mockPendingRequests = [
  {
    id: 'req1',
    employee_name: 'John Doe',
    start_date: '2025-07-01',
    end_date: '2025-07-05',
    reason: 'Vacation',
  },
  {
    id: 'req2',
    employee_name: 'Jane Smith',
    start_date: '2025-08-10',
    end_date: '2025-08-11',
    reason: 'Conference',
  },
];

describe('ApprovalQueueView Component', () => {
  it('should display a loading state initially', () => {
    vi.mocked(scheduleActions.getPendingTimeOffRequests).mockReturnValue(
      new Promise(() => {})
    );
    render(<ApprovalQueueView />);
    expect(screen.getByText(/loading pending requests/i)).toBeInTheDocument();
  });

  it('should display a message when there are no pending requests', async () => {
    vi.mocked(scheduleActions.getPendingTimeOffRequests).mockResolvedValue({
      success: true,
      data: [],
    });
    render(<ApprovalQueueView />);
    await waitFor(() => {
      expect(screen.getByText(/no pending requests/i)).toBeInTheDocument();
    });
  });

  it('should render a list of pending requests', async () => {
    vi.mocked(scheduleActions.getPendingTimeOffRequests).mockResolvedValue({
      success: true,
      data: mockPendingRequests,
    });
    render(<ApprovalQueueView />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /approve/i })).toHaveLength(
        2
      );
      expect(screen.getAllByRole('button', { name: /deny/i })).toHaveLength(2);
    });
  });

  it('should call the approve action when the approve button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(scheduleActions.getPendingTimeOffRequests).mockResolvedValue({
      success: true,
      data: mockPendingRequests,
    });
    const approveAction = vi
      .mocked(scheduleActions.approveTimeOffRequest)
      .mockResolvedValue({ success: true });

    render(<ApprovalQueueView />);

    await waitFor(async () => {
      const approveButtons = screen.getAllByRole('button', {
        name: /approve/i,
      });
      await user.click(approveButtons[0]);
    });

    await waitFor(() => {
      expect(approveAction).toHaveBeenCalledTimes(1);
      expect(approveAction).toHaveBeenCalledWith('req1');
    });
  });

  it('should call the deny action when the deny button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(scheduleActions.getPendingTimeOffRequests).mockResolvedValue({
      success: true,
      data: mockPendingRequests,
    });
    const denyAction = vi
      .mocked(scheduleActions.denyTimeOffRequest)
      .mockResolvedValue({ success: true });

    render(<ApprovalQueueView />);

    await waitFor(async () => {
      const denyButtons = screen.getAllByRole('button', { name: /deny/i });
      await user.click(denyButtons[1]);
    });

    await waitFor(() => {
      expect(denyAction).toHaveBeenCalledTimes(1);
      expect(denyAction).toHaveBeenCalledWith('req2');
    });
  });
});
