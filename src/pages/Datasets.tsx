import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileAudio, Trash2, Loader2, Music } from 'lucide-react';

interface Dataset {
  id: number;
  project_id: number;
  name: string;
  file_url: string;
  file_size: number;
  status: string;
  created_at: string;
}

interface Project {
  id: number;
  name: string;
}

export default function Datasets() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | ''>('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchData = async () => {
    try {
      const [datasetsRes, projectsRes] = await Promise.all([
        fetch('/api/datasets'),
        fetch('/api/projects'),
      ]);
      setDatasets(await datasetsRes.json());
      setProjects(await projectsRes.json());
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpload = async (file: File) => {
    if (!selectedProject) { alert('Please select a project first'); return; }
    setUploading(true);
    setUploadProgress(0);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: `datasets/${Date.now()}_${file.name}`,
            fileBase64: base64,
            contentType: file.type || 'audio/midi',
          }),
        });
        const uploadData = await uploadRes.json();
        clearInterval(progressInterval);
        setUploadProgress(100);

        await fetch('/api/datasets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: selectedProject,
            name: file.name,
            file_url: uploadData.url,
            file_size: file.size,
            status: 'uploaded',
          }),
        });

        fetchData();
        setTimeout(() => { setUploading(false); setUploadProgress(0); }, 500);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Upload error:', err);
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    Array.from(e.dataTransfer.files).forEach((file) => {
      if (file.name.match(/\.(mid|midi|wav|mp3)$/i)) handleUpload(file);
    });
  }, [selectedProject]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach((file) => handleUpload(file));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this dataset?')) return;
    try {
      await fetch('/api/datasets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">Datasets</h1>
        <p className="text-gray-400 text-sm mt-1">Upload MIDI and audio files for AI training.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <label className="text-sm text-gray-300 shrink-0">Project:</label>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value ? parseInt(e.target.value) : '')}
          className="w-full sm:w-auto bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]/50 transition-all"
        >
          <option value="" className="bg-[#111827]">Select a project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id} className="bg-[#111827]">{p.name}</option>
          ))}
        </select>
      </div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative p-6 md:p-8 rounded-2xl border-2 border-dashed transition-all ${
          dragOver ? 'border-[#8B5CF6] bg-[#8B5CF6]/5' : 'border-white/20 bg-white/5 hover:border-white/40'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#06B6D4]/20 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-7 h-7 md:w-8 md:h-8 text-[#8B5CF6]" />
          </div>
          <p className="text-white font-medium mb-2 text-sm md:text-base">Drag & drop your files here</p>
          <p className="text-gray-400 text-xs md:text-sm mb-4">Support for MIDI, WAV, and MP3 files</p>
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all cursor-pointer">
            <Music className="w-4 h-4" />
            Browse Files
            <input type="file" accept=".mid,.midi,.wav,.mp3" multiple className="hidden" onChange={handleFileInput} />
          </label>
        </div>

        {uploading && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Uploading...</span>
              <span className="text-sm text-gray-300">{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Dataset List */}
      <div className="space-y-3">
        <h3 className="text-white font-semibold text-sm md:text-base">Uploaded Files ({datasets.length})</h3>
        {datasets.length === 0 && (
          <div className="text-center py-12 rounded-xl bg-white/5 border border-white/10">
            <FileAudio className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No datasets uploaded yet.</p>
          </div>
        )}
        {datasets.map((dataset, i) => (
          <motion.div
            key={dataset.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all gap-3"
          >
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-[#8B5CF6]/20 to-[#06B6D4]/20 flex items-center justify-center shrink-0">
                <FileAudio className="w-4 h-4 md:w-5 md:h-5 text-[#8B5CF6]" />
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{dataset.name}</p>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
                  <span className="text-xs text-gray-500">{formatSize(dataset.file_size)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${dataset.status === 'uploaded' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {dataset.status}
                  </span>
                  <span className="text-xs text-gray-500 truncate">{projects.find((p) => p.id === dataset.project_id)?.name || 'Unknown'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {dataset.file_url && (
                <a href={dataset.file_url} download className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                  <Upload className="w-4 h-4" />
                </a>
              )}
              <button onClick={() => handleDelete(dataset.id)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
