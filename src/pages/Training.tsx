import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  BrainCircuit, Square, Trash2, Loader2, Terminal,
  TrendingUp, Activity, Zap
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface TrainingSession {
  id: number;
  project_id: number;
  model_name: string;
  epochs: number;
  current_epoch: number;
  accuracy: number;
  loss: number;
  status: string;
  logs: string;
  created_at: string;
}

interface Project {
  id: number;
  name: string;
}

export default function Training() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ project_id: '', model_name: 'LSTM-Music', epochs: 100 });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = async () => {
    try {
      const [sessionsRes, projectsRes] = await Promise.all([
        fetch('/api/training'),
        fetch('/api/projects'),
      ]);
      setSessions(await sessionsRes.json());
      setProjects(await projectsRes.json());
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const startTraining = async () => {
    if (!formData.project_id) return;
    try {
      const res = await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: parseInt(formData.project_id),
          model_name: formData.model_name,
          epochs: formData.epochs,
          status: 'running',
        }),
      });
      const data = await res.json();
      setShowForm(false);
      setSelectedSession(data);
      simulateTraining(data.id, formData.epochs);
      fetchData();
    } catch (err) {
      console.error('Start training error:', err);
    }
  };

  const simulateTraining = (sessionId: number, totalEpochs: number) => {
    setIsSimulating(true);
    let epoch = 0;
    let accuracy = 0.1;
    let loss = 2.5;
    const logs: string[] = [];

    intervalRef.current = setInterval(async () => {
      epoch++;
      accuracy = Math.min(0.98, accuracy + Math.random() * 0.02);
      loss = Math.max(0.01, loss * 0.95 + Math.random() * 0.05);
      logs.push(`[Epoch ${epoch}/${totalEpochs}] loss: ${loss.toFixed(4)} - accuracy: ${accuracy.toFixed(4)}`);

      try {
        await fetch('/api/training', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: sessionId,
            current_epoch: epoch,
            accuracy,
            loss,
            status: epoch >= totalEpochs ? 'completed' : 'running',
            logs: logs.slice(-20).join('\n'),
          }),
        });
        fetchData();
      } catch (err) {
        console.error('Simulation error:', err);
      }

      if (epoch >= totalEpochs) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsSimulating(false);
      }
    }, 800);
  };

  const stopTraining = async (id: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    try {
      await fetch('/api/training', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'stopped' }),
      });
      setIsSimulating(false);
      fetchData();
    } catch (err) {
      console.error('Stop error:', err);
    }
  };

  const deleteSession = async (id: number) => {
    if (!confirm('Delete this training session?')) return;
    try {
      await fetch('/api/training', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (selectedSession?.id === id) setSelectedSession(null);
      fetchData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const chartData = selectedSession
    ? Array.from({ length: Math.max(1, selectedSession.current_epoch) }, (_, i) => ({
        epoch: i + 1,
        accuracy: Math.min(0.98, 0.1 + (i / selectedSession.epochs) * 0.88 + Math.random() * 0.02),
        loss: Math.max(0.01, 2.5 * Math.pow(0.95, i) + Math.random() * 0.05),
      }))
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">AI Training</h1>
          <p className="text-gray-400 text-sm mt-1">Monitor and manage model training sessions.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={isSimulating}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all disabled:opacity-50"
        >
          <BrainCircuit className="w-4 h-4" />
          New Training
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 md:p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 space-y-4"
        >
          <h3 className="text-white font-semibold text-sm md:text-base">Start New Training</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Project</label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]/50 transition-all"
              >
                <option value="" className="bg-[#111827]">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#111827]">{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Model Name</label>
              <input
                type="text"
                value={formData.model_name}
                onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Epochs</label>
              <input
                type="number"
                value={formData.epochs}
                onChange={(e) => setFormData({ ...formData, epochs: parseInt(e.target.value) || 100 })}
                min={10}
                max={1000}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]/50 transition-all"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all text-sm">Cancel</button>
            <button onClick={startTraining} className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all">Start Training</button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-white font-semibold text-sm md:text-base">Sessions</h3>
          {sessions.length === 0 && (
            <div className="text-center py-8 rounded-xl bg-white/5 border border-white/10">
              <BrainCircuit className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No training sessions yet.</p>
            </div>
          )}
          {sessions.map((session) => (
            <motion.div
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className={`p-3 md:p-4 rounded-xl cursor-pointer transition-all ${
                selectedSession?.id === session.id
                  ? 'bg-gradient-to-r from-[#8B5CF6]/20 to-[#06B6D4]/20 border border-[#8B5CF6]/30'
                  : 'bg-white/5 border border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium truncate">{session.model_name}</span>
                <div className="flex items-center gap-1 shrink-0">
                  {session.status === 'running' && (
                    <button onClick={(e) => { e.stopPropagation(); stopTraining(session.id); }} className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                      <Square className="w-3 h-3" />
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }} className="p-1 rounded bg-white/5 text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] rounded-full transition-all"
                  style={{ width: `${(session.current_epoch / session.epochs) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Epoch {session.current_epoch}/{session.epochs}</span>
                <span className={`px-2 py-0.5 rounded-full ${
                  session.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  session.status === 'running' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>{session.status}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2 space-y-4">
          {selectedSession ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                  { label: 'Epoch', value: `${selectedSession.current_epoch}/${selectedSession.epochs}`, icon: Activity, color: '#8B5CF6' },
                  { label: 'Accuracy', value: `${(selectedSession.accuracy * 100).toFixed(2)}%`, icon: TrendingUp, color: '#06B6D4' },
                  { label: 'Loss', value: selectedSession.loss.toFixed(4), icon: Zap, color: '#A78BFA' },
                  { label: 'Status', value: selectedSession.status, icon: BrainCircuit, color: '#22D3EE' },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="p-3 md:p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
                      <Icon className="w-4 h-4 md:w-5 md:h-5 mb-2" style={{ color: stat.color }} />
                      <div className="text-base md:text-lg font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-gray-400">{stat.label}</div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 md:p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
                <h4 className="text-white font-semibold mb-4 text-sm md:text-base">Training Metrics</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="epoch" stroke="#6B7280" fontSize={11} />
                    <YAxis stroke="#6B7280" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} />
                    <Area type="monotone" dataKey="accuracy" stroke="#8B5CF6" fill="url(#colorAccuracy)" name="Accuracy" />
                    <Area type="monotone" dataKey="loss" stroke="#06B6D4" fill="url(#colorLoss)" name="Loss" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 rounded-xl bg-black/50 border border-white/10 font-mono text-xs">
                <div className="flex items-center gap-2 mb-2">
                  <Terminal className="w-4 h-4 text-[#8B5CF6]" />
                  <span className="text-white font-semibold">Training Logs</span>
                </div>
                <div className="h-32 md:h-40 overflow-y-auto space-y-1 text-gray-400">
                  {selectedSession.logs ? selectedSession.logs.split('\n').map((log, i) => (
                    <div key={i} className="text-gray-500">{log}</div>
                  )) : <div className="text-gray-600">No logs available...</div>}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 md:h-96 rounded-xl bg-white/5 border border-white/10">
              <div className="text-center">
                <BrainCircuit className="w-10 h-10 md:w-12 md:h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Select a training session to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
