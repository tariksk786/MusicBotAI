import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { project_id } = req.query;
      let query = supabase.from('training_sessions').select('*').order('created_at', { ascending: false });
      if (project_id) query = query.eq('project_id', project_id);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { project_id, model_name, epochs, current_epoch, accuracy, loss, status, logs } = req.body;
      const { data, error } = await supabase.from('training_sessions').insert({
        project_id, model_name, epochs: epochs || 100, current_epoch: current_epoch || 0,
        accuracy: accuracy || 0, loss: loss || 0, status: status || 'pending', logs: logs || ''
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, current_epoch, accuracy, loss, status, logs } = req.body;
      const updateData = { updated_at: new Date().toISOString() };
      if (current_epoch !== undefined) updateData.current_epoch = current_epoch;
      if (accuracy !== undefined) updateData.accuracy = accuracy;
      if (loss !== undefined) updateData.loss = loss;
      if (status) updateData.status = status;
      if (logs !== undefined) updateData.logs = logs;
      const { data, error } = await supabase.from('training_sessions').update(updateData).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('training_sessions').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
