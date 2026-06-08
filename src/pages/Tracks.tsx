import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import {
  Music, Play, Download, Trash2, Filter, Search, Loader2,
  Heart, Clock, FolderOpen
} from 'lucide-react';
import type { PlayerTrack } from '../components/Layout';

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

interface Project {
  id: number;
  name: string;
}

export default function Tracks() {
  const { setCurrentTrack } = useOutletContext<{ setCurrentTrack: (t: PlayerTrack) => void }>();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [likedTracks, setLikedTracks] = useState<Set<number>>(new Set());

  const fetchData = async () => {
    try {
      const [tracksRes, projectsRes] = await Promise.all([
        fetch('/api/tracks'),
        fetch('/api/projects'),
      ]);
      setTracks(await tracksRes.json());
      setProjects(await projectsRes.json());
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this track?')) return;
    try {
      await fetch('/api/tracks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const toggleLike = (id: number) => {
    setLikedTracks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredTracks = tracks.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                          t.genre.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = !genreFilter || t.genre === genreFilter;
    return matchesSearch && matchesGenre;
  });

  const allGenres = Array.from(new Set(tracks.map((t) => t.genre)));

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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
          <h1 className="text-xl md:text-2xl font-bold text-white">Library</h1>
          <p className="text-gray-400 text-sm mt-1">Browse and manage your generated tracks.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search tracks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6]/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]/50 transition-all"
          >
            <option value="" className="bg-[#111827]">All Genres</option>
            {allGenres.map((g) => (
              <option key={g} value={g} className="bg-[#111827]">{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tracks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {filteredTracks.map((track, i) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#8B5CF6]/30 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6]/30 to-[#06B6D4]/30 flex items-center justify-center">
                <Music className="w-5 h-5 md:w-6 md:h-6 text-[#8B5CF6]" />
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggleLike(track.id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <Heart className={`w-4 h-4 ${likedTracks.has(track.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
                <button onClick={() => handleDelete(track.id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-white font-semibold text-sm md:text-base mb-1 truncate">{track.name}</h3>
            <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-4">
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">{track.genre}</span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(track.duration)}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <FolderOpen className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500 truncate">{projects.find((p) => p.id === track.project_id)?.name || 'Unknown'}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentTrack(track)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all"
              >
                <Play className="w-4 h-4" />
                Play
              </button>
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTracks.length === 0 && (
        <div className="text-center py-16">
          <Music className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No tracks found. Generate your first track to get started.</p>
        </div>
      )}
    </div>
  );
}
