/**
 * HarmoniAI Audio Engine
 * Web Audio API-based synthesizer for procedural music generation
 */

export type Genre = 'Electronic' | 'Classical' | 'Jazz' | 'Pop' | 'Rock' | 'Ambient' | 'Hip Hop' | 'Experimental' | 'Lo-Fi' | 'Orchestral';

interface Note {
  freq: number;
  start: number;
  duration: number;
  velocity: number;
  type: OscillatorType;
}

interface DrumHit {
  time: number;
  type: 'kick' | 'snare' | 'hihat';
  velocity: number;
}

interface GeneratedTrack {
  notes: Note[];
  drums: DrumHit[];
  duration: number;
}

export interface TrackParams {
  genre: Genre;
  creativity: number;
  temperature: number;
  length: number;
  seed: number;
}

const SCALES: Record<string, number[]> = {
  'C Major': [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25],
  'A Minor': [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00, 440.00],
  'D Minor': [293.66, 329.63, 349.23, 392.00, 440.00, 466.16, 523.25, 587.33],
  'G Major': [196.00, 220.00, 246.94, 261.63, 293.66, 329.63, 369.99, 392.00],
  'E Minor': [164.81, 185.00, 196.00, 220.00, 246.94, 261.63, 293.66, 329.63],
  'F Major': [174.61, 196.00, 220.00, 233.08, 261.63, 293.66, 329.63, 349.23],
  'B Minor': [246.94, 277.18, 293.66, 329.63, 369.99, 392.00, 440.00, 493.88],
  'C Minor': [261.63, 277.18, 311.13, 349.23, 369.99, 415.30, 466.16, 523.25],
};

const GENRE_CONFIG: Record<Genre, {
  scales: string[];
  tempoRange: [number, number];
  oscillatorTypes: OscillatorType[];
  drumDensity: number;
  useArpeggio: boolean;
  bassOctave: number;
}> = {
  'Electronic': {
    scales: ['C Minor', 'A Minor', 'D Minor'],
    tempoRange: [120, 140],
    oscillatorTypes: ['sawtooth', 'square'],
    drumDensity: 0.9,
    useArpeggio: true,
    bassOctave: -1,
  },
  'Classical': {
    scales: ['C Major', 'G Major', 'F Major'],
    tempoRange: [70, 100],
    oscillatorTypes: ['sine', 'triangle'],
    drumDensity: 0.0,
    useArpeggio: false,
    bassOctave: -1,
  },
  'Jazz': {
    scales: ['D Minor', 'G Major', 'B Minor'],
    tempoRange: [100, 140],
    oscillatorTypes: ['sine', 'triangle'],
    drumDensity: 0.6,
    useArpeggio: false,
    bassOctave: -1,
  },
  'Pop': {
    scales: ['C Major', 'G Major', 'A Minor'],
    tempoRange: [110, 130],
    oscillatorTypes: ['sine', 'triangle', 'sawtooth'],
    drumDensity: 0.8,
    useArpeggio: false,
    bassOctave: -1,
  },
  'Rock': {
    scales: ['E Minor', 'A Minor', 'D Minor'],
    tempoRange: [120, 150],
    oscillatorTypes: ['sawtooth', 'square'],
    drumDensity: 0.85,
    useArpeggio: false,
    bassOctave: -1,
  },
  'Ambient': {
    scales: ['C Major', 'F Major', 'A Minor'],
    tempoRange: [60, 80],
    oscillatorTypes: ['sine', 'triangle'],
    drumDensity: 0.1,
    useArpeggio: true,
    bassOctave: -2,
  },
  'Hip Hop': {
    scales: ['C Minor', 'A Minor', 'D Minor'],
    tempoRange: [80, 100],
    oscillatorTypes: ['sine', 'triangle'],
    drumDensity: 0.75,
    useArpeggio: false,
    bassOctave: -1,
  },
  'Experimental': {
    scales: ['C Minor', 'B Minor', 'C Major'],
    tempoRange: [90, 130],
    oscillatorTypes: ['sawtooth', 'square', 'sine'],
    drumDensity: 0.5,
    useArpeggio: true,
    bassOctave: -1,
  },
  'Lo-Fi': {
    scales: ['C Major', 'A Minor', 'F Major'],
    tempoRange: [70, 90],
    oscillatorTypes: ['sine', 'triangle'],
    drumDensity: 0.4,
    useArpeggio: false,
    bassOctave: -1,
  },
  'Orchestral': {
    scales: ['C Major', 'G Major', 'D Minor'],
    tempoRange: [60, 100],
    oscillatorTypes: ['sine', 'triangle'],
    drumDensity: 0.2,
    useArpeggio: false,
    bassOctave: -2,
  },
};

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getScale(genre: Genre, seed: number): number[] {
  const config = GENRE_CONFIG[genre];
  const rand = seededRandom(seed);
  const scaleName = config.scales[Math.floor(rand() * config.scales.length)];
  return SCALES[scaleName] || SCALES['C Major'];
}

function getTempo(genre: Genre, seed: number): number {
  const config = GENRE_CONFIG[genre];
  const rand = seededRandom(seed + 1);
  return config.tempoRange[0] + rand() * (config.tempoRange[1] - config.tempoRange[0]);
}

export function generateTrack(params: TrackParams): GeneratedTrack {
  const { genre, length, seed, creativity, temperature } = params;
  const rand = seededRandom(seed);
  const scale = getScale(genre, seed);
  const tempo = getTempo(genre, seed);
  const config = GENRE_CONFIG[genre];
  const beatDuration = 60 / tempo;
  const totalBeats = Math.max(4, Math.floor((length / 60) * tempo));
  const notes: Note[] = [];
  const drums: DrumHit[] = [];

  const progressionLength = config.useArpeggio ? 4 : 8;
  const progression: number[][] = [];
  for (let i = 0; i < progressionLength; i++) {
    const rootIdx = Math.floor(rand() * Math.max(1, scale.length - 3));
    const chord = [scale[rootIdx], scale[(rootIdx + 2) % scale.length], scale[(rootIdx + 4) % scale.length]];
    progression.push(chord);
  }

  let currentBeat = 0;
  const melodyDensity = 0.4 + creativity * 0.4;
  const noteTypes = config.oscillatorTypes;

  while (currentBeat < totalBeats) {
    const chordIdx = Math.floor(currentBeat / 4) % progression.length;
    const chord = progression[chordIdx];

    if (rand() < melodyDensity) {
      const noteIdx = Math.floor(rand() * scale.length);
      const freq = scale[noteIdx];
      const noteDuration = beatDuration * (0.5 + rand() * 1.5 * temperature);
      const velocity = 0.4 + rand() * 0.4;
      const type = noteTypes[Math.floor(rand() * noteTypes.length)];

      notes.push({
        freq,
        start: currentBeat * beatDuration,
        duration: Math.min(noteDuration, beatDuration * 2),
        velocity,
        type,
      });
    }

    if ((genre === 'Classical' || genre === 'Orchestral' || genre === 'Ambient') && rand() < 0.5) {
      chord.forEach((freq, ci) => {
        notes.push({
          freq: freq * (1 + ci * 0.001),
          start: currentBeat * beatDuration,
          duration: beatDuration * 2,
          velocity: 0.15 + rand() * 0.15,
          type: 'sine',
        });
      });
    }

    if (config.useArpeggio && rand() < 0.4) {
      const arpNotes = chord.slice(0, 3);
      arpNotes.forEach((freq, ai) => {
        notes.push({
          freq: freq * 2,
          start: currentBeat * beatDuration + ai * beatDuration * 0.25,
          duration: beatDuration * 0.3,
          velocity: 0.2 + rand() * 0.25,
          type: 'sawtooth',
        });
      });
    }

    currentBeat += 0.5 + rand() * 0.5;
  }

  currentBeat = 0;
  while (currentBeat < totalBeats) {
    const chordIdx = Math.floor(currentBeat / 4) % progression.length;
    const rootFreq = progression[chordIdx][0];
    notes.push({
      freq: rootFreq * Math.pow(2, config.bassOctave),
      start: currentBeat * beatDuration,
      duration: beatDuration * (genre === 'Hip Hop' ? 1.5 : 1),
      velocity: 0.5 + rand() * 0.3,
      type: genre === 'Electronic' || genre === 'Rock' ? 'sawtooth' : 'sine',
    });
    currentBeat += genre === 'Hip Hop' ? 1.5 : 1;
  }

  if (config.drumDensity > 0) {
    for (let beat = 0; beat < totalBeats; beat++) {
      const barBeat = beat % 4;

      if ((barBeat === 0 || barBeat === 2) && rand() < config.drumDensity) {
        drums.push({ time: beat * beatDuration, type: 'kick', velocity: 0.8 + rand() * 0.2 });
      }
      if (barBeat === 2 && rand() < config.drumDensity * 0.8) {
        drums.push({ time: beat * beatDuration, type: 'snare', velocity: 0.6 + rand() * 0.3 });
      }
      if (rand() < config.drumDensity * 0.9) {
        drums.push({ time: beat * beatDuration, type: 'hihat', velocity: 0.2 + rand() * 0.2 });
        if (genre === 'Electronic' || genre === 'Pop') {
          drums.push({ time: beat * beatDuration + beatDuration * 0.5, type: 'hihat', velocity: 0.15 + rand() * 0.15 });
        }
      }
    }
  }

  return { notes, drums, duration: totalBeats * beatDuration };
}

// ========== SINGLE SHARED AUDIO CONTEXT ==========
let sharedCtx: AudioContext | null = null;
let sharedMasterGain: GainNode | null = null;
let sharedAnalyser: AnalyserNode | null = null;
let activeNodes: AudioScheduledSourceNode[] = [];
let isPlaying = false;
let startTime = 0;
let pauseTime = 0;
let currentDuration = 0;

function getSharedContext(): AudioContext {
  if (!sharedCtx) {
    sharedCtx = new AudioContext();
    sharedMasterGain = sharedCtx.createGain();
    sharedMasterGain.gain.value = 0.5;
    sharedAnalyser = sharedCtx.createAnalyser();
    sharedAnalyser.fftSize = 256;
    sharedMasterGain.connect(sharedAnalyser);
    sharedAnalyser.connect(sharedCtx.destination);
  }
  return sharedCtx;
}

async function ensureContextRunning(): Promise<boolean> {
  const ctx = getSharedContext();
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
      return true;
    } catch {
      return false;
    }
  }
  return true;
}

function clearActiveNodes() {
  for (const node of activeNodes) {
    try {
      node.stop();
      node.disconnect();
    } catch {}
  }
  activeNodes = [];
}

function scheduleNote(ctx: AudioContext, master: GainNode, note: Note, time: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = note.type;
  osc.frequency.setValueAtTime(note.freq, time);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2500 + note.freq * 1.5, time);
  filter.Q.value = 0.5;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(master);

  const attack = 0.02;
  const decay = 0.06;
  const sustain = note.velocity * 0.5;
  const release = 0.15;
  const total = note.duration;

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(note.velocity, time + attack);
  gain.gain.linearRampToValueAtTime(sustain, time + attack + decay);
  if (total > attack + decay + release) {
    gain.gain.setValueAtTime(sustain, time + total - release);
  }
  gain.gain.linearRampToValueAtTime(0.001, time + total + release);

  osc.start(time);
  osc.stop(time + total + release + 0.05);
  activeNodes.push(osc);
}

function scheduleKick(ctx: AudioContext, master: GainNode, time: number, velocity: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(master);

  osc.frequency.setValueAtTime(160, time);
  osc.frequency.exponentialRampToValueAtTime(50, time + 0.12);
  gain.gain.setValueAtTime(velocity, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

  osc.start(time);
  osc.stop(time + 0.35);
  activeNodes.push(osc);
}

function scheduleSnare(ctx: AudioContext, master: GainNode, time: number, velocity: number) {
  const noise = ctx.createBufferSource();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1000;

  const gain = ctx.createGain();
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(master);

  gain.gain.setValueAtTime(velocity * 0.7, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

  noise.start(time);
  noise.stop(time + 0.12);
  activeNodes.push(noise);
}

function scheduleHiHat(ctx: AudioContext, master: GainNode, time: number, velocity: number) {
  const noise = ctx.createBufferSource();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 6000;

  const gain = ctx.createGain();
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(master);

  gain.gain.setValueAtTime(velocity * 0.5, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

  noise.start(time);
  noise.stop(time + 0.04);
  activeNodes.push(noise);
}

// ========== PUBLIC API ==========

export async function startPlayback(params: TrackParams) {
  stopPlayback();

  const ok = await ensureContextRunning();
  if (!ok) {
    console.warn('[AudioEngine] Could not resume AudioContext');
    return;
  }

  const ctx = getSharedContext();
  const master = sharedMasterGain!;
  const track = generateTrack(params);
  currentDuration = track.duration;
  pauseTime = 0;

  const now = ctx.currentTime + 0.02;

  for (const note of track.notes) {
    scheduleNote(ctx, master, note, now + note.start);
  }

  for (const drum of track.drums) {
    const t = now + drum.time;
    switch (drum.type) {
      case 'kick': scheduleKick(ctx, master, t, drum.velocity); break;
      case 'snare': scheduleSnare(ctx, master, t, drum.velocity); break;
      case 'hihat': scheduleHiHat(ctx, master, t, drum.velocity); break;
    }
  }

  startTime = now;
  isPlaying = true;

  setTimeout(() => {
    if (isPlaying) stopPlayback();
  }, track.duration * 1000 + 600);
}

export function pausePlayback() {
  if (!isPlaying || !sharedCtx) return;
  pauseTime = sharedCtx.currentTime - startTime;
  clearActiveNodes();
  isPlaying = false;
}

export function stopPlayback() {
  clearActiveNodes();
  isPlaying = false;
  pauseTime = 0;
}

export function seekPlayback(time: number) {
  pauseTime = Math.max(0, Math.min(time, currentDuration));
}

export function setPlaybackVolume(vol: number) {
  if (sharedMasterGain) {
    sharedMasterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), getSharedContext().currentTime, 0.05);
  }
}

export function getPlaybackCurrentTime(): number {
  if (!isPlaying || !sharedCtx) return pauseTime;
  return Math.max(0, sharedCtx.currentTime - startTime);
}

export function getPlaybackDuration(): number {
  return currentDuration;
}

export function isPlaybackPlaying(): boolean {
  return isPlaying;
}

export function getPlaybackAnalyser(): AnalyserNode | null {
  return sharedAnalyser;
}

export function generateTrackParams(
  genre: Genre,
  creativity: number,
  temperature: number,
  length: number,
  seed?: number
): TrackParams {
  return {
    genre,
    creativity,
    temperature,
    length,
    seed: seed ?? Math.floor(Math.random() * 100000),
  };
}
