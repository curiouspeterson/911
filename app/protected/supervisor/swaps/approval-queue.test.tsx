import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SwapApprovalQueue } from './swap-approval-queue'; // Component doesn't exist yet
import * as scheduleActions from '@/app/actions/schedule-actions';

vi.mock('@/app/actions/schedule-actions', () => ({
  getPendingSwaps: vi.fn(),
  approveSwap: vi.fn(),
  denySwap: vi.fn(),
}));

const mockPendingSwaps = [
  {
    id: 'swap1',
    from_employee: 'John Doe',
    to_employee: 'Jane Smith',
    from_shift: '2025-11-01',
    to_shift: '2025-11-03',
  },
  {
    id: 'swap2',
    from_employee: 'Peter Pan',
    to_employee: 'Wendy Darling',
    from_shift: '2025-11-02',
    to_shift: '2025-11-04',
  },
];

describe('SwapApprovalQueue Component', () => {
  it('should display a loading state initially', () => {
    vi.mocked(scheduleActions.getPendingSwaps).mockReturnValue(
      new Promise(() => {})
    );
    render(<SwapApprovalQueue />);
    expect(screen.getByText(/loading pending swaps/i)).toBeInTheDocument();
  });

  it('should display a message when there are no pending swaps', async () => {
    vi.mocked(scheduleActions.getPendingSwaps).mockResolvedValue({
      success: true,
      data: [],
    });
    render(<SwapApprovalQueue />);
    await waitFor(() => {
      expect(screen.getByText(/no pending swaps/i)).toBeInTheDocument();
    });
  });

  it('should render a list of pending swaps', async () => {
    vi.mocked(scheduleActions.getPendingSwaps).mockResolvedValue({
      success: true,
      data: mockPendingSwaps,
    });
    render(<SwapApprovalQueue />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Peter Pan')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /approve/i })).toHaveLength(
        2
      );
      expect(screen.getAllByRole('button', { name: /deny/i })).toHaveLength(2);
    });
  });

  it('should call the approve action when the approve button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(scheduleActions.getPendingSwaps).mockResolvedValue({
      success: true,
      data: mockPendingSwaps,
    });
    const approveAction = vi
      .mocked(scheduleActions.approveSwap)
      .mockResolvedValue({ success: true });

    render(<SwapApprovalQueue />);

    await waitFor(async () => {
      const approveButtons = screen.getAllByRole('button', {
        name: /approve/i,
      });
      await user.click(approveButtons[0]);
    });

    await waitFor(() => {
      expect(approveAction).toHaveBeenCalledTimes(1);
      expect(approveAction).toHaveBeenCalledWith('swap1');
    });
  });

  it('should call the deny action when the deny button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(scheduleActions.getPendingSwaps).mockResolvedValue({
      success: true,
      data: mockPendingSwaps,
    });
    const denyAction = vi
      .mocked(scheduleActions.denySwap)
      .mockResolvedValue({ success: true });

    render(<SwapApprovalQueue />);

    await waitFor(async () => {
      const denyButtons = screen.getAllByRole('button', { name: /deny/i });
      await user.click(denyButtons[1]);
    });

    await waitFor(() => {
      expect(denyAction).toHaveBeenCalledTimes(1);
      expect(denyAction).toHaveBeenCalledWith('swap2');
    });
  });
});
