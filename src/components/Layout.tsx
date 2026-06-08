import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import MusicPlayer from './MusicPlayer';

export interface PlayerTrack {
  id: number;
  name: string;
  genre: string;
  duration: number;
  audio_url?: string;
  seed?: number;
}

export default function Layout() {
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="md:ml-64">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-6 pb-32">
          <Outlet context={{ setCurrentTrack }} />
        </main>
      </div>
      <MusicPlayer track={currentTrack} onClose={() => setCurrentTrack(null)} />
    </div>
  );
}
