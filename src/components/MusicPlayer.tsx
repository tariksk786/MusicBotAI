import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Download, Heart, X } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';
import {
  startPlayback, pausePlayback, stopPlayback, seekPlayback,
  setPlaybackVolume, getPlaybackCurrentTime, getPlaybackDuration,
  isPlaybackPlaying, generateTrackParams
} from '../lib/audioEngine';

interface Track {
  id: number;
  name: string;
  genre: string;
  duration: number;
  audio_url?: string;
  seed?: number;
}

interface MusicPlayerProps {
  track: Track | null;
  onClose?: () => void;
}

export default function MusicPlayer({ track, onClose }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(0.5);
  const [liked, setLiked] = useState(false);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (track) {
      setIsPlaying(false);
      setCurrentTime(0);
      setLiked(false);
      setDuration(track.duration || 180);
    }
  }, [track]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const t = getPlaybackCurrentTime();
        const dur = getPlaybackDuration();
        setCurrentTime(t);
        if (dur > 0) setDuration(dur);
        if (!isPlaybackPlaying()) {
          setIsPlaying(false);
        }
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  const togglePlay = async () => {
    if (!track) return;

    if (isPlaying) {
      pausePlayback();
      setIsPlaying(false);
    } else {
      const params = generateTrackParams(
        track.genre as any,
        0.7,
        0.8,
        track.duration,
        track.seed ?? track.id * 12345
      );
      await startPlayback(params);
      setPlaybackVolume(volume);
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    const dur = duration || track?.duration || 180;
    const newTime = pct * dur;
    seekPlayback(newTime);
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (v: number) => {
    setVolumeState(v);
    setPlaybackVolume(v);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!track) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#111827]/95 backdrop-blur-xl border-t border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-2 md:py-3">
        {/* Mobile: stacked layout */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 w-full md:w-64">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">{track.name.charAt(0)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate">{track.name}</p>
              <p className="text-gray-400 text-xs truncate">{track.genre}</p>
            </div>
            <button onClick={() => setLiked(!liked)} className="text-gray-400 hover:text-red-500 transition-colors md:hidden">
              <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            {onClose && (
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors md:hidden">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="flex-1 flex flex-col items-center">
            <div className="flex items-center gap-3 md:gap-4 mb-1">
              <button className="text-gray-400 hover:text-white transition-colors">
                <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={togglePlay}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause className="w-4 h-4 md:w-5 md:h-5 text-white" /> : <Play className="w-4 h-4 md:w-5 md:h-5 text-white ml-0.5" />}
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
            <div className="w-full flex items-center gap-2">
              <span className="text-xs text-gray-400 w-8 md:w-10 text-right">{formatTime(currentTime)}</span>
              <div
                className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8 md:w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume & Actions - desktop only */}
          <div className="hidden md:flex items-center gap-3 w-64 justify-end">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#8B5CF6]"
              />
            </div>
            {track.audio_url && (
              <a href={track.audio_url} download className="text-gray-400 hover:text-white transition-colors">
                <Download className="w-4 h-4" />
              </a>
            )}
            {onClose && (
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-sm">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Visualizer */}
        <div className="mt-1 md:mt-2">
          <AudioVisualizer isPlaying={isPlaying} barCount={32} height={24} />
        </div>
      </div>
    </div>
  );
}
