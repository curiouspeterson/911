/**
 * @vitest-environment jsdom
 * Updated to use global Vitest functions - removed explicit imports
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { ScheduleFilters } from './schedule-filters';

const mockUsers = [
  { id: 'uuid-1', full_name: 'Alice' },
  { id: 'uuid-2', full_name: 'Bob' },
];

const mockRoles = [
  { id: 1, name: 'dispatcher' },
  { id: 2, name: 'supervisor' },
];

describe('ScheduleFilters Component', () => {
  it('should render select dropdowns for users and roles', () => {
    render(
      <ScheduleFilters
        users={mockUsers}
        roles={mockRoles}
        onFilterChange={vi.fn()}
      />
    );

    // The placeholder is rendered inside a span within the button
    expect(screen.getByText('All Employees')).toBeInTheDocument();
    expect(screen.getByText('All Roles')).toBeInTheDocument();
  });

  it('should call onFilterChange with the correct user ID when an employee is selected', async () => {
    const onFilterChange = vi.fn();
    render(
      <ScheduleFilters
        users={mockUsers}
        roles={mockRoles}
        onFilterChange={onFilterChange}
      />
    );

    // Click the employee filter dropdown
    fireEvent.click(screen.getByText('All Employees'));

    // Click the 'Alice' option
    const aliceOption = await screen.findByText('Alice');
    fireEvent.click(aliceOption);

    // Expect the callback to have been called with the new filter state
    expect(onFilterChange).toHaveBeenCalledWith({
      userId: 'uuid-1',
      roleId: null,
    });
  });

  it('should call onFilterChange with the correct role ID when a role is selected', async () => {
    const onFilterChange = vi.fn();
    render(
      <ScheduleFilters
        users={mockUsers}
        roles={mockRoles}
        onFilterChange={onFilterChange}
      />
    );

    // Click the role filter dropdown
    fireEvent.click(screen.getByText('All Roles'));

    // Click the 'supervisor' option
    const supervisorOption = await screen.findByText('supervisor');
    fireEvent.click(supervisorOption);

    expect(onFilterChange).toHaveBeenCalledWith({ userId: null, roleId: 2 });
  });
});
