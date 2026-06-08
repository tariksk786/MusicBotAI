import { useEffect, useRef } from 'react';
import { getPlaybackAnalyser } from '../lib/audioEngine';

interface AudioVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  color?: string;
  height?: number;
}

export default function AudioVisualizer({ isPlaying, barCount = 64, color = '#8B5CF6', height = 120 }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    let time = 0;
    const bars = Array.from({ length: barCount }, () => ({
      height: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.05 + 0.02,
      offset: Math.random() * Math.PI * 2,
    }));

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.offsetWidth;
      const h = height;
      ctx.clearRect(0, 0, w, h);

      const barWidth = (w - (barCount - 1) * 2) / barCount;

      let freqData: number[] | null = null;
      if (isPlaying) {
        const analyser = getPlaybackAnalyser();
        if (analyser) {
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
          freqData = Array.from(dataArray);
        }
      }

      bars.forEach((bar, i) => {
        let barHeight: number;

        if (isPlaying && freqData) {
          const freqIndex = Math.floor((i / barCount) * (freqData.length * 0.5));
          const freqValue = freqData[freqIndex] || 0;
          barHeight = (freqValue / 255) * h * 0.9 + h * 0.05;
        } else if (isPlaying) {
          barHeight = Math.abs(Math.sin(time * bar.speed + bar.offset)) * h * 0.8 + h * 0.1;
        } else {
          barHeight = bar.height * h * 0.3;
        }

        const x = i * (barWidth + 2);
        const y = h - barHeight;

        const gradient = ctx.createLinearGradient(0, y, 0, h);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.1)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      });

      time += 0.1;
      animationRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, barCount, color, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: `${height}px` }}
      className="block"
    />
  );
}
