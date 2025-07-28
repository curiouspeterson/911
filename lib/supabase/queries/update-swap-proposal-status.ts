import { createClient } from '@/lib/supabase/server';

export async function updateSwapProposalStatus(
  proposalId: string,
  status: 'accepted' | 'rejected'
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('swap_proposals')
    .update({ status })
    .eq('id', proposalId)
    .select();

  return { data, error };
}
