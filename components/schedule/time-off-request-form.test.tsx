import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimeOffRequestForm } from './time-off-request-form'; // This component doesn't exist yet
import * as scheduleActions from '@/app/actions/schedule-actions';

// Mock the server action
vi.mock('@/app/actions/schedule-actions', () => ({
  createTimeOffRequest: vi.fn(),
}));

describe('TimeOffRequestForm', () => {
  it('should render the form with all fields', () => {
    render(<TimeOffRequestForm />);

    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /submit request/i })
    ).toBeInTheDocument();
  });

  it('should display validation errors for empty fields on submit', async () => {
    const user = userEvent.setup();
    render(<TimeOffRequestForm />);

    const submitButton = screen.getByRole('button', {
      name: /submit request/i,
    });
    await user.click(submitButton);

    // Using waitFor to handle async validation feedback
    await waitFor(() => {
      expect(screen.getByText(/start date is required/i)).toBeInTheDocument();
      expect(screen.getByText(/end date is required/i)).toBeInTheDocument();
    });
  });

  it('should call the createTimeOffRequest server action with correct data on successful submission', async () => {
    const user = userEvent.setup();
    // Cast the mock to be able to check calls
    const mockedCreateTimeOffRequest = vi.mocked(
      scheduleActions.createTimeOffRequest
    );
    mockedCreateTimeOffRequest.mockResolvedValue({ success: true });

    render(<TimeOffRequestForm />);

    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);
    const reasonInput = screen.getByLabelText(/reason/i);
    const submitButton = screen.getByRole('button', {
      name: /submit request/i,
    });

    // Fill out the form
    await user.type(startDateInput, '2025-02-01');
    await user.type(endDateInput, '2025-02-03');
    await user.type(reasonInput, 'Family vacation');

    // Submit the form
    await user.click(submitButton);

    // Check if the server action was called correctly
    await waitFor(() => {
      expect(mockedCreateTimeOffRequest).toHaveBeenCalledTimes(1);
      expect(mockedCreateTimeOffRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: new Date('2025-02-01'),
          endDate: new Date('2025-02-03'),
          reason: 'Family vacation',
        })
      );
    });
  });

  it.todo('should display a success message after successful submission');
  it.todo('should display an error message if the server action fails');
});
