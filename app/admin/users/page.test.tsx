/**
 * @vitest-environment jsdom
 * Updated to use global Vitest functions - removed explicit imports
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserManagementPage from './page';

// Mock the server actions module
vi.mock('@/app/actions/admin-actions', () => {
  const mockUsers = [
    {
      id: 'uuid-1',
      full_name: 'Alice',
      email: 'alice@example.com',
      role: { id: 1, name: 'dispatcher' },
    },
    {
      id: 'uuid-2',
      full_name: 'Bob',
      email: 'bob@example.com',
      role: { id: 2, name: 'supervisor' },
    },
  ];

  const mockRoles = [
    { id: 1, name: 'dispatcher' },
    { id: 2, name: 'supervisor' },
    { id: 3, name: 'admin' },
  ];

  return {
    getUsersWithRoles: vi
      .fn()
      .mockResolvedValue({ data: { users: mockUsers, roles: mockRoles } }),
    updateUserRole: vi.fn().mockResolvedValue({ success: true }),
  };
});

describe('Admin - User Management Page', () => {
  it('should render a table with users and their roles', async () => {
    const PageComponent = await UserManagementPage();
    render(PageComponent);

    expect(
      screen.getByRole('columnheader', { name: /name/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: /email/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: /role/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    expect(screen.getByText('dispatcher')).toBeInTheDocument();
  });

  it('should call the updateUserRole server action when a role is changed and saved', async () => {
    const { updateUserRole } = await import('@/app/actions/admin-actions');

    const PageComponent = await UserManagementPage();
    render(PageComponent);

    // Get all save buttons; they should be disabled initially
    const saveButtons = screen.getAllByRole('button', { name: /save/i });
    expect(saveButtons[0]).toBeDisabled();

    // Find the select trigger for the first user (Alice)
    const selectTrigger = screen.getAllByRole('combobox')[0];
    fireEvent.click(selectTrigger);

    // Find and click the 'admin' option in the dropdown
    const adminOption = await screen.findByText('admin');
    fireEvent.click(adminOption);

    // Wait for the button to become enabled after the state update
    await waitFor(() => {
      expect(saveButtons[0]).not.toBeDisabled();
    });

    // Click the now-enabled save button
    fireEvent.click(saveButtons[0]);

    // Check if the server action was called with the correct arguments
    await waitFor(() => {
      expect(updateUserRole).toHaveBeenCalledWith('uuid-1', 3); // 'admin' role has id 3
    });
  });
});
