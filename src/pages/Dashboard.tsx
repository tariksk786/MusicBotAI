import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FolderOpen, Music, BrainCircuit, TrendingUp, Activity,
  ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface Stats {
  projects: number;
  tracks: number;
  datasets: number;
  training_sessions: number;
}

interface Project {
  id: number;
  name: string;
  genre: string;
  created_at: string;
}

interface TrainingSession {
  id: number;
  model_name: string;
  current_epoch: number;
  epochs: number;
  accuracy: number;
  status: string;
}

const COLORS = ['#8B5CF6', '#06B6D4', '#A78BFA', '#22D3EE', '#6366F1'];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [training, setTraining] = useState<TrainingSession[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, projectsRes, trainingRes, analyticsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/projects'),
        fetch('/api/training'),
        fetch('/api/analytics?category=training'),
      ]);
      setStats(await statsRes.json());
      setProjects((await projectsRes.json()).slice(0, 5));
      setTraining((await trainingRes.json()).slice(0, 5));
      setAnalytics(await analyticsRes.json());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const statCards = [
    { label: 'Projects', value: stats?.projects || 0, icon: FolderOpen, change: '+12%', up: true, color: '#8B5CF6' },
    { label: 'Tracks', value: stats?.tracks || 0, icon: Music, change: '+28%', up: true, color: '#06B6D4' },
    { label: 'Datasets', value: stats?.datasets || 0, icon: BrainCircuit, change: '+5%', up: true, color: '#A78BFA' },
    { label: 'Training', value: stats?.training_sessions || 0, icon: TrendingUp, change: '-2%', up: false, color: '#22D3EE' },
  ];

  const genreData = projects.reduce((acc: any[], p) => {
    const existing = acc.find((a) => a.name === p.genre);
    if (existing) existing.value++;
    else acc.push({ name: p.genre || 'Unknown', value: 1 });
    return acc;
  }, []);

  const activityData = analytics.slice(-7).map((a: any, i: number) => ({
    name: `D${i + 1}`,
    accuracy: a.metric_value || 0,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Overview of your AI music projects.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 md:p-5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}20` }}>
                  <Icon className="w-4 h-4 md:w-5 md:h-5" style={{ color: stat.color }} />
                </div>
                <div className={`flex items-center gap-1 text-xs ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <div className="text-xl md:text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs md:text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 md:p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10"
        >
          <h3 className="text-white font-semibold mb-4 text-sm md:text-base">Training Accuracy</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={activityData.length > 0 ? activityData : [{ name: 'Start', accuracy: 0 }, { name: 'End', accuracy: 85 }]}>
              <defs>
                <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#6B7280" fontSize={11} />
              <YAxis stroke="#6B7280" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="accuracy" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorAcc)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 md:p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10"
        >
          <h3 className="text-white font-semibold mb-4 text-sm md:text-base">Projects by Genre</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={genreData.length > 0 ? genreData : [{ name: 'None', value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {(genreData.length > 0 ? genreData : [{ name: 'None', value: 1 }]).map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 md:gap-3 mt-2">
            {genreData.map((g: any, i: number) => (
              <div key={g.name} className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {g.name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 md:p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10"
        >
          <h3 className="text-white font-semibold mb-4 text-sm md:text-base">Recent Projects</h3>
          <div className="space-y-2 md:space-y-3">
            {projects.length === 0 && (
              <p className="text-gray-500 text-sm">No projects yet.</p>
            )}
            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-[#8B5CF6]/30 to-[#06B6D4]/30 flex items-center justify-center shrink-0">
                    <FolderOpen className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#8B5CF6]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{project.name}</p>
                    <p className="text-gray-500 text-xs">{project.genre}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 shrink-0">{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-4 md:p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10"
        >
          <h3 className="text-white font-semibold mb-4 text-sm md:text-base">Active Training</h3>
          <div className="space-y-2 md:space-y-3">
            {training.length === 0 && (
              <p className="text-gray-500 text-sm">No active training sessions.</p>
            )}
            {training.map((session) => (
              <div key={session.id} className="p-2 md:p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <BrainCircuit className="w-4 h-4 text-[#06B6D4] shrink-0" />
                    <span className="text-white text-sm font-medium truncate">{session.model_name}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    session.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    session.status === 'running' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {session.status}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] rounded-full transition-all"
                    style={{ width: `${(session.current_epoch / session.epochs) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">Epoch {session.current_epoch}/{session.epochs}</span>
                  <span className="text-xs text-gray-500">Acc: {(session.accuracy * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
