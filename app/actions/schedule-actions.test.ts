import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createTimeOffRequest,
  getUserTimeOffRequests,
  getPendingTimeOffRequests,
  approveTimeOffRequest,
  denyTimeOffRequest,
  getUserShifts,
  getEligibleSwapEmployees,
  proposeSwap,
  acceptSwap,
  rejectSwap,
} from './schedule-actions';
import * as supabaseQueries from '@/lib/supabase/queries';
import { ZodError } from 'zod';

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/actions/with-role-check', () => ({
  withRoleCheck: vi.fn((roles, action) => action),
}));

// Mock the database query function
vi.mock('@/lib/supabase/queries', () => ({
  insertTimeOffRequest: vi.fn(),
  getUserTimeOffRequests: vi.fn(),
  getPendingTimeOffRequests: vi.fn(),
  updateTimeOffRequestStatus: vi.fn(),
  getUserShifts: vi.fn(),
  getEligibleSwapEmployees: vi.fn(),
  createSwapProposal: vi.fn(),
  updateSwapProposalStatus: vi.fn(),
  getPendingSwaps: vi.fn(),
}));

// Mock Supabase server client to get user
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      }),
    },
  })),
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
    })),
  })),
}));

describe('Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTimeOffRequest', () => {
    it('should return a validation error for invalid data', async () => {
      const invalidData = {
        startDate: new Date(),
        // endDate is missing
      };

      const response = await createTimeOffRequest(invalidData as any);

      expect(response.success).toBe(false);
      expect(response.error?.zod).toBeInstanceOf(Array);
    });

    it.todo('should return an error if the user is not authenticated');

    it('should call the database insert function with correct data', async () => {
      const mockedInsert = vi.mocked(supabaseQueries.insertTimeOffRequest);
      mockedInsert.mockResolvedValue({
        data: [{ id: 'req-abc' }],
        error: null,
      });

      const validData = {
        startDate: new Date('2025-03-10'),
        endDate: new Date('2025-03-12'),
        reason: 'Conference',
      };

      await createTimeOffRequest(validData);

      expect(mockedInsert).toHaveBeenCalledTimes(1);
      expect(mockedInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          employee_id: 'user-123',
          start_date: validData.startDate,
          end_date: validData.endDate,
          reason: validData.reason,
          status: 'pending',
        })
      );
    });

    it('should return a success response when data is valid', async () => {
      const mockedInsert = vi.mocked(supabaseQueries.insertTimeOffRequest);
      mockedInsert.mockResolvedValue({
        data: [{ id: 'req-abc' }],
        error: null,
      });

      const validData = {
        startDate: new Date('2025-03-10'),
        endDate: new Date('2025-03-12'),
        reason: 'Conference',
      };

      const response = await createTimeOffRequest(validData);

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
    });

    it.todo('should return an error if the database insert fails');
  });

  describe('getUserTimeOffRequests', () => {
    it('should return an error if the user is not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({
              data: { user: null },
              error: { message: 'Not logged in' },
            }),
        },
      };

      const response = await getUserTimeOffRequests(mockSupabase);
      expect(response.success).toBe(false);
      expect(response.error?.message).toBe('Not authenticated');
    });

    it('should call the database query function with the current user ID', async () => {
      const mockedGetRequests = vi.mocked(
        supabaseQueries.getUserTimeOffRequests
      );
      mockedGetRequests.mockResolvedValue({ data: [], error: null });

      await getUserTimeOffRequests();

      expect(mockedGetRequests).toHaveBeenCalledTimes(1);
      expect(mockedGetRequests).toHaveBeenCalledWith('user-123');
    });

    it('should return the requests on success', async () => {
      const mockData = [{ id: 'req-1', status: 'approved' }];
      const mockedGetRequests = vi.mocked(
        supabaseQueries.getUserTimeOffRequests
      );
      mockedGetRequests.mockResolvedValue({ data: mockData, error: null });

      const response = await getUserTimeOffRequests();

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockData);
    });

    it('should return an error if the database query fails', async () => {
      const mockedGetRequests = vi.mocked(
        supabaseQueries.getUserTimeOffRequests
      );
      mockedGetRequests.mockResolvedValue({
        data: null,
        error: { message: 'DB Error' },
      });

      const response = await getUserTimeOffRequests();

      expect(response.success).toBe(false);
      expect(response.error?.message).toBe('DB Error');
    });
  });

  describe('getPendingTimeOffRequests', () => {
    it.todo('should only be accessible by supervisors and admins');

    it('should call the correct database query', async () => {
      const mockedGetPending = vi.mocked(
        supabaseQueries.getPendingTimeOffRequests
      );
      mockedGetPending.mockResolvedValue({ data: [], error: null });

      await getPendingTimeOffRequests();

      expect(mockedGetPending).toHaveBeenCalledTimes(1);
    });
  });

  describe('approveTimeOffRequest', () => {
    it('should call the database update function with "approved"', async () => {
      const mockedUpdate = vi.mocked(
        supabaseQueries.updateTimeOffRequestStatus
      );
      mockedUpdate.mockResolvedValue({ data: [{ id: 'req-1' }], error: null });

      await approveTimeOffRequest('req-1');

      expect(mockedUpdate).toHaveBeenCalledTimes(1);
      expect(mockedUpdate).toHaveBeenCalledWith('req-1', 'approved');
    });
  });

  describe('denyTimeOffRequest', () => {
    it('should call the database update function with "denied"', async () => {
      const mockedUpdate = vi.mocked(
        supabaseQueries.updateTimeOffRequestStatus
      );
      mockedUpdate.mockResolvedValue({ data: [{ id: 'req-1' }], error: null });

      await denyTimeOffRequest('req-1');

      expect(mockedUpdate).toHaveBeenCalledTimes(1);
      expect(mockedUpdate).toHaveBeenCalledWith('req-1', 'denied');
    });
  });

  describe('getUserShifts', () => {
    it('should call the correct database query', async () => {
      const mockedGetShifts = vi.mocked(supabaseQueries.getUserShifts);
      mockedGetShifts.mockResolvedValue({ data: [], error: null });

      await getUserShifts();

      expect(mockedGetShifts).toHaveBeenCalledTimes(1);
    });
  });

  describe('getEligibleSwapEmployees', () => {
    it('should call the correct database query', async () => {
      const mockedGetEligible = vi.mocked(
        supabaseQueries.getEligibleSwapEmployees
      );
      mockedGetEligible.mockResolvedValue({ data: [], error: null });

      await getEligibleSwapEmployees('shift-1');

      expect(mockedGetEligible).toHaveBeenCalledTimes(1);
      expect(mockedGetEligible).toHaveBeenCalledWith('shift-1');
    });
  });

  describe('proposeSwap', () => {
    it('should call the correct database query', async () => {
      const mockedPropose = vi.mocked(supabaseQueries.createSwapProposal);
      mockedPropose.mockResolvedValue({ data: [], error: null });

      await proposeSwap({ fromShiftId: 'shift-1', toEmployeeId: 'emp-2' });

      expect(mockedPropose).toHaveBeenCalledTimes(1);
      expect(mockedPropose).toHaveBeenCalledWith({
        from_shift_id: 'shift-1',
        to_employee_id: 'emp-2',
        status: 'pending',
      });
    });
  });

  describe('acceptSwap', () => {
    it('should call the correct database query', async () => {
      const mockedUpdate = vi.mocked(supabaseQueries.updateSwapProposalStatus);
      mockedUpdate.mockResolvedValue({ data: [], error: null });

      await acceptSwap('prop-1');

      expect(mockedUpdate).toHaveBeenCalledTimes(1);
      expect(mockedUpdate).toHaveBeenCalledWith('prop-1', 'accepted');
    });
  });

  describe('rejectSwap', () => {
    it('should call the correct database query', async () => {
      const mockedUpdate = vi.mocked(supabaseQueries.updateSwapProposalStatus);
      mockedUpdate.mockResolvedValue({ data: [], error: null });

      await rejectSwap('prop-1');

      expect(mockedUpdate).toHaveBeenCalledTimes(1);
      expect(mockedUpdate).toHaveBeenCalledWith('prop-1', 'rejected');
    });
  });
});

describe('Server Action: getPendingSwaps', () => {
  it('should call the correct database query', async () => {
    const mockedGetPending = vi.mocked(supabaseQueries.getPendingSwaps);
    mockedGetPending.mockResolvedValue({ data: [], error: null });

    await getPendingSwaps();

    expect(mockedGetPending).toHaveBeenCalledTimes(1);
  });
});

describe('Server Action: approveSwap', () => {
  it('should call the correct database query', async () => {
    const mockedUpdate = vi.mocked(supabaseQueries.updateSwapProposalStatus);
    mockedUpdate.mockResolvedValue({ data: [], error: null });

    await approveSwap('swap-1');

    expect(mockedUpdate).toHaveBeenCalledTimes(1);
    expect(mockedUpdate).toHaveBeenCalledWith('swap-1', 'approved');
  });
});

describe('Server Action: denySwap', () => {
  it('should call the correct database query', async () => {
    const mockedUpdate = vi.mocked(supabaseQueries.updateSwapProposalStatus);
    mockedUpdate.mockResolvedValue({ data: [], error: null });

    await denySwap('swap-1');

    expect(mockedUpdate).toHaveBeenCalledTimes(1);
    expect(mockedUpdate).toHaveBeenCalledWith('swap-1', 'denied');
  });
});
