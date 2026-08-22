'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sparkles, Eye, Zap, Layers, Maximize2, CheckCircle2 } from 'lucide-react';

export default function InteractiveComparison() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [activePreset, setActivePreset] = useState<'cyberpunk' | 'nature' | 'portrait'>('cyberpunk');
  const containerRef = useRef<HTMLDivElement>(null);

  const presets = {
    cyberpunk: {
      title: 'Cinematic Neon Cityscape (Night)',
      beforeLabel: 'Raw 1080p (24 FPS • Compression Artifacts)',
      afterLabel: '4K Ultra HD (60 FPS • Real-ESRGAN Sharpened)',
      beforeBg: 'from-slate-800 to-slate-950',
      afterBg: 'from-cyan-950 via-teal-900 to-[#1e484c]',
      badge: '4X Neural Pixel Density',
    },
    nature: {
      title: 'Wildlife High-Speed Drone 4K',
      beforeLabel: 'Raw 720p Mobile Capture',
      afterLabel: '3840x2160 AI Upscaled & Denoised',
      beforeBg: 'from-amber-950 to-slate-900',
      afterBg: 'from-emerald-950 via-teal-900 to-[#1e484c]',
      badge: 'Zero Artifact Recovery',
    },
    portrait: {
      title: 'Studio Lighting Creator Vlog',
      beforeLabel: 'Standard 1080p Webcam Feed',
      afterLabel: '4K Cinema Grade Color & Clarity',
      beforeBg: 'from-purple-950 to-slate-900',
      afterBg: 'from-[#1e484c] via-[#5ab5bb] to-[#71C9CE]',
      badge: 'Facial Texture Reconstruction',
    },
  };

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(5, Math.min(95, (x / width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const currentPreset = presets[activePreset];

  return (
    <div className="w-full space-y-6">
      {/* Preset Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-[#CBF1F5] text-[#1e484c] border border-[#A6E3E9]">
            <Eye className="w-4 h-4 text-[#71C9CE]" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Interactive 4K Neural Magnifier</h3>
            <p className="text-xs text-slate-500 font-medium">Drag slider to compare raw ingest vs Modal T4 GPU inference</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-white/80 p-1.5 rounded-2xl border border-[#A6E3E9] shadow-sm">
          {(['cyberpunk', 'nature', 'portrait'] as const).map((presetKey) => (
            <button
              key={presetKey}
              onClick={() => setActivePreset(presetKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize btn-interactive transition-all ${
                activePreset === presetKey
                  ? 'bg-[#71C9CE] text-white shadow-md shadow-[#71C9CE]/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#CBF1F5]/40'
              }`}
            >
              {presetKey}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Split Frame Container */}
      <div
        ref={containerRef}
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          handleMove(e.touches[0].clientX);
        }}
        className="relative w-full h-[360px] sm:h-[420px] md:h-[480px] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#A6E3E9] cursor-ew-resize select-none group glow-border"
      >
        {/* Right Side: Enhanced 4K Output (Full Background) */}
        <div
          className={`absolute inset-0 bg-gradient-to-tr ${currentPreset.afterBg} flex items-center justify-center p-8 text-white overflow-hidden`}
        >
          {/* Animated 4K Grid Texture */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#71C9CE_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Simulated 4K Cinematic Scene Graphic */}
          <div className="relative z-10 text-center space-y-4 max-w-md">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md text-xs font-mono font-bold animate-pulse-slow">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>3840 x 2160 Ultra HD • 60.00 FPS</span>
            </div>
            <h4 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
              {currentPreset.title}
            </h4>
            <p className="text-xs text-cyan-100/80 leading-relaxed">
              Synthesized through Real-ESRGAN T4 TensorRT weights with automated contrast refinement and noise suppression.
            </p>
            <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-cyan-200">
              <span className="flex items-center space-x-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span>H.265/NVENC</span></span>
              <span className="flex items-center space-x-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span>Rec.709 Wide Gamut</span></span>
              <span className="flex items-center space-x-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span>45 Mbps Bitrate</span></span>
            </div>
          </div>

          {/* Right Floating Badge */}
          <div className="absolute bottom-6 right-6 px-4 py-2 rounded-2xl bg-[#1e484c]/85 border border-[#71C9CE] text-white text-xs font-extrabold backdrop-blur-md shadow-lg flex items-center space-x-2 pointer-events-none">
            <Zap className="w-4 h-4 text-[#71C9CE]" />
            <span>AI ENHANCED 4K</span>
          </div>
        </div>

        {/* Left Side: Raw 1080p / 720p Source (Clipped by sliderPosition) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
        >
          <div className={`w-full h-full bg-gradient-to-tr ${currentPreset.beforeBg} flex items-center justify-center p-8 text-slate-300 relative`}>
            {/* Blurry / Pixelated Simulated Overlay */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
            
            {/* Simulated Raw Ingest Details */}
            <div className="relative z-10 text-center space-y-4 max-w-md opacity-75">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-mono font-bold">
                <span>1920 x 1080 • 24.00 FPS • Raw Ingest</span>
              </div>
              <h4 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-300">
                {currentPreset.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Raw source asset with visible edge ringing, blur, and standard dynamic range bitrate constraints.
              </p>
            </div>

            {/* Left Floating Badge */}
            <div className="absolute bottom-6 left-6 px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-700 text-slate-300 text-xs font-extrabold backdrop-blur-md shadow-lg flex items-center space-x-2 pointer-events-none">
              <Layers className="w-4 h-4 text-slate-400" />
              <span>ORIGINAL 1080p</span>
            </div>
          </div>
        </div>

        {/* Draggable Vertical Divider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(113,201,206,0.8)] z-30 pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Circular Handle Knob */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white border-2 border-[#71C9CE] shadow-2xl flex items-center justify-center text-[#1e484c] group-hover:scale-110 transition-transform">
            <Maximize2 className="w-4 h-4 rotate-45 text-[#71C9CE]" />
          </div>
        </div>

        {/* Top Floating Telemetry Bar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-950/70 border border-[#A6E3E9]/40 backdrop-blur-md text-white text-[11px] font-mono flex items-center space-x-3 pointer-events-none z-30">
          <span className="text-[#71C9CE] font-bold">SPLIT: {sliderPosition.toFixed(0)}%</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">INFERENCE: 3.2s</span>
          <span className="text-slate-500">•</span>
          <span className="text-emerald-400 font-bold">PSNR: +8.4 dB</span>
        </div>
      </div>
    </div>
  );
}
