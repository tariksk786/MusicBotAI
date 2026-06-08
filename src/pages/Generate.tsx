import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import {
  Sparkles, Music, Loader2, Sliders, Clock, Thermometer, Wand2,
  Download, Play, Check, Volume2
} from 'lucide-react';
import { startPlayback, stopPlayback, generateTrackParams, generateTrack } from '../lib/audioEngine';
import type { PlayerTrack } from '../components/Layout';

interface Project {
  id: number;
  name: string;
  genre: string;
}

interface Track {
  id: number;
  project_id: number;
  name: string;
  genre: string;
  duration: number;
  status: string;
  seed?: number;
  created_at: string;
}

export default function Generate() {
  const { setCurrentTrack } = useOutletContext<{ setCurrentTrack: (t: PlayerTrack) => void }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [generating, setGenerating] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [config, setConfig] = useState({
    project_id: '',
    genre: 'Electronic',
    creativity: 0.7,
    temperature: 0.8,
    length: 60,
  });
  const [generationStep, setGenerationStep] = useState(0);

  const fetchData = async () => {
    try {
      const [projectsRes, tracksRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/tracks'),
      ]);
      setProjects(await projectsRes.json());
      setTracks(await tracksRes.json());
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePreview = async () => {
    if (previewing) {
      stopPlayback();
      setPreviewing(false);
      return;
    }
    const params = generateTrackParams(
      config.genre as any,
      config.creativity,
      config.temperature,
      Math.min(config.length, 15),
      Math.floor(Math.random() * 100000)
    );
    await startPlayback(params);
    setPreviewing(true);
    setTimeout(() => setPreviewing(false), 15000);
  };

  const handleGenerate = async () => {
    if (!config.project_id) { alert('Please select a project'); return; }
    setGenerating(true);
    setGenerationStep(0);

    const steps = [
      'Loading model weights...',
      'Preparing latent space...',
      'Generating sequence...',
      'Applying temperature scaling...',
      'Synthesizing audio...',
      'Finalizing track...',
    ];

    const seed = Math.floor(Math.random() * 100000);
    const params = generateTrackParams(
      config.genre as any,
      config.creativity,
      config.temperature,
      config.length,
      seed
    );
    const generated = generateTrack(params);

    for (let i = 0; i < steps.length; i++) {
      setGenerationStep(i);
      await new Promise((r) => setTimeout(r, 500 + Math.random() * 300));
    }

    const trackName = `AI ${config.genre} ${Math.floor(Math.random() * 1000)}`;

    try {
      await fetch('/api/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: parseInt(config.project_id),
          name: trackName,
          genre: config.genre,
          duration: Math.round(generated.duration),
          status: 'generated',
          seed,
        }),
      });
      fetchData();
    } catch (err) {
      console.error('Generate error:', err);
    }

    setGenerating(false);
    setGenerationStep(0);
  };

  const genres = ['Electronic', 'Classical', 'Jazz', 'Pop', 'Rock', 'Ambient', 'Hip Hop', 'Experimental', 'Lo-Fi', 'Orchestral'];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">Generate Music</h1>
        <p className="text-gray-400 text-sm mt-1">Create original compositions with AI synthesis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 p-4 md:p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 space-y-4 md:space-y-6"
        >
          <div className="flex items-center gap-2 mb-2 md:mb-4">
            <Sliders className="w-5 h-5 text-[#8B5CF6]" />
            <h3 className="text-white font-semibold">Configuration</h3>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Project</label>
            <select
              value={config.project_id}
              onChange={(e) => {
                const pid = e.target.value;
                const project = projects.find((p) => p.id === parseInt(pid));
                setConfig({ ...config, project_id: pid, genre: project?.genre || config.genre });
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]/50 transition-all"
            >
              <option value="" className="bg-[#111827]">Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#111827]">{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Genre</label>
            <div className="grid grid-cols-2 gap-2">
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => setConfig({ ...config, genre: g })}
                  className={`px-3 py-2 rounded-lg text-xs md:text-sm transition-all ${
                    config.genre === g
                      ? 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm text-gray-300 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5" />
                Creativity
              </label>
              <span className="text-sm text-[#8B5CF6]">{Math.round(config.creativity * 100)}%</span>
            </div>
            <input
              type="range" min="0" max="1" step="0.01"
              value={config.creativity}
              onChange={(e) => setConfig({ ...config, creativity: parseFloat(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#8B5CF6]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm text-gray-300 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5" />
                Temperature
              </label>
              <span className="text-sm text-[#06B6D4]">{config.temperature.toFixed(2)}</span>
            </div>
            <input
              type="range" min="0.1" max="2" step="0.01"
              value={config.temperature}
              onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#06B6D4]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm text-gray-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Length
              </label>
              <span className="text-sm text-gray-400">{formatTime(config.length)}</span>
            </div>
            <input
              type="range" min="10" max="300" step="5"
              value={config.length}
              onChange={(e) => setConfig({ ...config, length: parseInt(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#8B5CF6]"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePreview}
              className="flex-1 py-2.5 md:py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm"
            >
              {previewing ? <Volume2 className="w-4 h-4 text-green-400" /> : <Play className="w-4 h-4" />}
              {previewing ? 'Stop' : 'Preview'}
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex-[2] py-2.5 md:py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white font-semibold hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate</>}
            </button>
          </div>
        </motion.div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {generating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 md:p-8 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-center"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#8B5CF6]/30 to-[#06B6D4]/30 flex items-center justify-center mx-auto mb-4 md:mb-6 animate-pulse">
                  <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-[#8B5CF6]" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">Generating Your Track</h3>
                <div className="space-y-2 max-w-md mx-auto">
                  {['Loading model weights...', 'Preparing latent space...', 'Generating sequence...', 'Applying temperature scaling...', 'Synthesizing audio...', 'Finalizing track...'].map((step, i) => (
                    <div key={step} className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                      i < generationStep ? 'bg-green-500/10 text-green-400' :
                      i === generationStep ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' : 'text-gray-600'
                    }`}>
                      {i < generationStep ? <Check className="w-4 h-4" /> :
                       i === generationStep ? <Loader2 className="w-4 h-4 animate-spin" /> :
                       <div className="w-4 h-4 rounded-full border border-gray-600" />}
                      <span className="text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm md:text-base">Generated Tracks ({tracks.length})</h3>
            <div className="space-y-3">
              {tracks.length === 0 && !generating && (
                <div className="text-center py-12 rounded-xl bg-white/5 border border-white/10">
                  <Music className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No tracks generated yet.</p>
                </div>
              )}
              {tracks.map((track, i) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all group gap-3"
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <button
                      onClick={() => setCurrentTrack(track)}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center hover:scale-105 transition-transform shrink-0"
                    >
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    </button>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{track.name}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">{track.genre}</span>
                        <span className="text-xs text-gray-500">{formatTime(track.duration)}</span>
                        <span className="text-xs text-gray-500 truncate">{projects.find((p) => p.id === track.project_id)?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
