import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const [projectsRes, tracksRes, datasetsRes, trainingRes] = await Promise.all([
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      supabase.from('tracks').select('id', { count: 'exact', head: true }),
      supabase.from('datasets').select('id', { count: 'exact', head: true }),
      supabase.from('training_sessions').select('id', { count: 'exact', head: true }),
    ]);

    return res.status(200).json({
      projects: projectsRes.count || 0,
      tracks: tracksRes.count || 0,
      datasets: datasetsRes.count || 0,
      training_sessions: trainingRes.count || 0,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: err.message });
  }
}
