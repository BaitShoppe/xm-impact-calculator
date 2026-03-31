export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, adminId } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Check admin
  const { data: profile } = await sb.from('profiles').select('role').eq('id', adminId).single();
  if (!profile || profile.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });

  // Generate token
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

  // Save invite
  const { error } = await sb.from('invites').insert({ email, token, created_by: adminId });
  if (error) return res.status(500).json({ error: error.message });

  const inviteUrl = `${process.env.SITE_URL}/invite.html?token=${token}`;
  return res.status(200).json({ inviteUrl });
}