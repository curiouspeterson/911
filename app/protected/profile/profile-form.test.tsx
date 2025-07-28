/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileForm from './profile-form'; // Component doesn't exist yet
import { updateUserProfile } from '@/app/actions/user-actions';

// Mock the server action
vi.mock('@/app/actions/user-actions', () => ({
  updateUserProfile: vi.fn(),
}));

const mockProfile = {
  full_name: 'John Doe',
};

describe('ProfileForm Component', () => {
  it('should render the form with initial data', () => {
    render(<ProfileForm profile={mockProfile} />);

    expect(screen.getByLabelText(/full name/i)).toHaveValue('John Doe');
    expect(
      screen.getByRole('button', { name: /save changes/i })
    ).toBeInTheDocument();
  });

  it('should call the updateUserProfile server action on form submission', async () => {
    (updateUserProfile as vi.Mock).mockResolvedValue({ success: true });
    render(<ProfileForm profile={mockProfile} />);

    // Change the input value
    const nameInput = screen.getByLabelText(/full name/i);
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    expect(nameInput).toHaveValue('Jane Doe');

    // Submit the form
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    // Wait for the server action to be called
    await waitFor(() => {
      expect(updateUserProfile).toHaveBeenCalledTimes(1);
      const formData = (updateUserProfile as vi.Mock).mock.calls[0][0];
      expect(formData.get('full_name')).toBe('Jane Doe');
    });
  });

  it('should display an error message if the server action fails', async () => {
    (updateUserProfile as vi.Mock).mockResolvedValue({
      success: false,
      error: { message: 'Update failed' },
    });
    render(<ProfileForm profile={mockProfile} />);

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    // Wait for the error message to appear
    expect(await screen.findByText(/Update failed/i)).toBeInTheDocument();
  });
});
