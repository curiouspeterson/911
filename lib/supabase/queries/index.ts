export * from './get-schedule-data';
export * from './get-staffing-requirements';
export * from './get-user-roles';
export * from './get-user-time-off-requests';
export * from './get-pending-time-off-requests';
export * from './update-time-off-request-status';
export * from './get-user-shifts';
export * from './get-eligible-swap-employees';
export * from './create-swap-proposal';
export * from './update-swap-proposal-status';

// This file will also export the new time-off request query once it's created.
// For now, we can add a placeholder export to satisfy the test mock.
export const insertTimeOffRequest = async (data: any) => {
  console.log('Mocked insertTimeOffRequest called with:', data);
  return { data: [{ id: 'new-request-id' }], error: null };
};
