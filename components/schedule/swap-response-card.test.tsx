import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SwapResponseCard } from './swap-response-card'; // Component doesn't exist yet
import * as scheduleActions from '@/app/actions/schedule-actions';

vi.mock('@/app/actions/schedule-actions', () => ({
  acceptSwap: vi.fn(),
  rejectSwap: vi.fn(),
}));

const mockProposal = {
  id: 'prop1',
  from_employee_name: 'John Doe',
  from_shift_date: '2025-10-01',
  from_shift_start_time: '08:00',
  from_shift_end_time: '16:00',
};

describe('SwapResponseCard Component', () => {
  it('should display the swap proposal details', () => {
    render(<SwapResponseCard proposal={mockProposal} />);
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/2025-10-01/)).toBeInTheDocument();
  });

  it('should call the acceptSwap action when the accept button is clicked', async () => {
    const user = userEvent.setup();
    const acceptAction = vi
      .mocked(scheduleActions.acceptSwap)
      .mockResolvedValue({ success: true });
    render(<SwapResponseCard proposal={mockProposal} />);

    const acceptButton = screen.getByRole('button', { name: /accept/i });
    await user.click(acceptButton);

    expect(acceptAction).toHaveBeenCalledTimes(1);
    expect(acceptAction).toHaveBeenCalledWith('prop1');
  });

  it('should call the rejectSwap action when the reject button is clicked', async () => {
    const user = userEvent.setup();
    const rejectAction = vi
      .mocked(scheduleActions.rejectSwap)
      .mockResolvedValue({ success: true });
    render(<SwapResponseCard proposal={mockProposal} />);

    const rejectButton = screen.getByRole('button', { name: /reject/i });
    await user.click(rejectButton);

    expect(rejectAction).toHaveBeenCalledTimes(1);
    expect(rejectAction).toHaveBeenCalledWith('prop1');
  });
});
