import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProposeSwapForm } from './propose-swap-form'; // Component doesn't exist yet
import * as scheduleActions from '@/app/actions/schedule-actions';

vi.mock('@/app/actions/schedule-actions', () => ({
  getUserShifts: vi.fn(),
  getEligibleSwapEmployees: vi.fn(),
  proposeSwap: vi.fn(),
}));

const mockUserShifts = [
  { id: 'shift1', date: '2025-09-01', start_time: '08:00', end_time: '16:00' },
  { id: 'shift2', date: '2025-09-02', start_time: '08:00', end_time: '16:00' },
];

const mockEligibleEmployees = [
  { id: 'emp1', full_name: 'John Doe' },
  { id: 'emp2', full_name: 'Jane Smith' },
];

describe('ProposeSwapForm Component', () => {
  it("should render a list of the user's shifts", async () => {
    vi.mocked(scheduleActions.getUserShifts).mockResolvedValue({
      success: true,
      data: mockUserShifts,
    });
    vi.mocked(scheduleActions.getEligibleSwapEmployees).mockResolvedValue({
      success: true,
      data: [],
    });
    render(<ProposeSwapForm />);
    await waitFor(() => {
      expect(screen.getByText(/2025-09-01/)).toBeInTheDocument();
      expect(screen.getByText(/2025-09-02/)).toBeInTheDocument();
    });
  });

  it('should show a list of eligible employees when a shift is selected', async () => {
    const user = userEvent.setup();
    vi.mocked(scheduleActions.getUserShifts).mockResolvedValue({
      success: true,
      data: mockUserShifts,
    });
    vi.mocked(scheduleActions.getEligibleSwapEmployees).mockResolvedValue({
      success: true,
      data: mockEligibleEmployees,
    });
    render(<ProposeSwapForm />);

    await waitFor(async () => {
      const shiftRadio = screen.getByLabelText(/2025-09-01/);
      await user.click(shiftRadio);
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should call the proposeSwap action on submit', async () => {
    const user = userEvent.setup();
    vi.mocked(scheduleActions.getUserShifts).mockResolvedValue({
      success: true,
      data: mockUserShifts,
    });
    vi.mocked(scheduleActions.getEligibleSwapEmployees).mockResolvedValue({
      success: true,
      data: mockEligibleEmployees,
    });
    const proposeAction = vi
      .mocked(scheduleActions.proposeSwap)
      .mockResolvedValue({ success: true });

    render(<ProposeSwapForm />);

    await waitFor(async () => {
      const shiftRadio = screen.getByLabelText(/2025-09-01/);
      await user.click(shiftRadio);
    });

    await waitFor(async () => {
      const employeeRadio = screen.getByLabelText('John Doe');
      await user.click(employeeRadio);
    });

    const submitButton = screen.getByRole('button', { name: /propose swap/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(proposeAction).toHaveBeenCalledTimes(1);
      expect(proposeAction).toHaveBeenCalledWith({
        fromShiftId: 'shift1',
        toEmployeeId: 'emp1',
      });
    });
  });
});
