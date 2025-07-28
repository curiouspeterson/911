import { createClient } from '@/lib/supabase/server';

interface SwapProposal {
  from_shift_id: string;
  to_employee_id: string;
  status: 'pending';
}

export async function createSwapProposal(proposal: SwapProposal) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('swap_proposals')
    .insert(proposal)
    .select();

  return { data, error };
}
