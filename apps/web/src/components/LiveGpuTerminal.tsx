'use client';

import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Terminal, CheckCircle2, Loader2, RefreshCw, Sliders, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function LiveGpuTerminal() {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([
    '[INIT] System ready. Modal T4 GPU cluster on standby (warm pool).',
    '[BYOS] Cloudflare R2 bucket: puffiflow-videos connected.',
    '[QUEUE] Ready to receive 1080p source video streams.',
  ]);
  const [progress, setProgress] = useState<number>(0);

  // Settings
  const [enhanceFaces, setEnhanceFaces] = useState<boolean>(true);
  const [hdrDenoise, setHdrDenoise] = useState<boolean>(true);
  const [fpsInterpolation, setFpsInterpolation] = useState<boolean>(true);

  const simulateUpscale = () => {
    if (isRunning) return;
    setIsRunning(true);
    setProgress(0);
    setLogs(['[SPAWN] Modal GPU Worker container initialized (Tesla T4 - 16GB VRAM)']);

    toast.info('Modal GPU inference started: Ingesting raw stream...');

    const logSequence = [
      { p: 15, msg: '[INGEST] Reading presigned R2 video stream: sample_1080p_raw.mp4 (420 MB)' },
      { p: 35, msg: '[REAL-ESRGAN] Running 4x super-resolution inference on 3,420 video frames...' },
      { p: 60, msg: `[FILTERS] Face Texture Recovery: ${enhanceFaces ? 'ACTIVE' : 'OFF'} | HDR Denoise: ${hdrDenoise ? 'ACTIVE' : 'OFF'}` },
      { p: 80, msg: `[FFMPEG] Encoding 3840x2160 NVENC H.265 MP4 at ${fpsInterpolation ? '60 FPS' : '24 FPS'}...` },
      { p: 95, msg: '[UPLOAD] Streaming 4K processed asset to R2 bucket: /processed/4k_job_9921.mp4' },
      { p: 100, msg: '[COMPLETE] Job finished in 3.42s! Ready for scheduled YouTube v3 release.' },
    ];

    logSequence.forEach((item, index) => {
      setTimeout(() => {
        setProgress(item.p);
        setLogs((prev) => [...prev, item.msg]);

        if (index === logSequence.length - 1) {
          setIsRunning(false);
          toast.success('4K Upscaling complete! Video ready for scheduled release.');
        }
      }, (index + 1) * 650);
    });
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#CBF1F5] text-[#1e484c] border border-[#A6E3E9] text-xs font-bold uppercase tracking-wider">
          <Terminal className="w-4 h-4 text-[#71C9CE]" />
          <span>Interactive GPU Inference Sandbox</span>
        </div>
        <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Test Modal T4 GPU Processing Live
        </h3>
        <p className="text-slate-600 text-sm">
          Toggle neural enhancement parameters and trigger a simulated serverless upscaling run in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
        {/* Controls Card */}
        <div className="lg:col-span-5 p-7 rounded-3xl liquid-glass-card shadow-xl border border-[#A6E3E9] space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-[#CBF1F5] text-[#1e484c] border border-[#A6E3E9]">
              <Sliders className="w-5 h-5 text-[#71C9CE]" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-900">Neural Filter Controls</h4>
              <p className="text-xs text-slate-500">Real-ESRGAN TensorRT parameters</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#E3FDFD]/40 border border-[#A6E3E9]">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Facial Detail Recovery</span>
                <span className="text-[11px] text-slate-500">Reconstruct subtle skin textures</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enhanceFaces}
                  onChange={(e) => setEnhanceFaces(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#71C9CE]"></div>
              </label>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#E3FDFD]/40 border border-[#A6E3E9]">
              <div>
                <span className="text-xs font-bold text-slate-800 block">HDR Noise Suppression</span>
                <span className="text-[11px] text-slate-500">Eliminate compression banding</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hdrDenoise}
                  onChange={(e) => setHdrDenoise(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#71C9CE]"></div>
              </label>
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#E3FDFD]/40 border border-[#A6E3E9]">
              <div>
                <span className="text-xs font-bold text-slate-800 block">60 FPS Interpolation</span>
                <span className="text-[11px] text-slate-500">Fluid motion frame synthesis</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={fpsInterpolation}
                  onChange={(e) => setFpsInterpolation(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#71C9CE]"></div>
              </label>
            </div>
          </div>

          <button
            onClick={simulateUpscale}
            disabled={isRunning}
            className="w-full py-3.5 px-5 rounded-2xl font-bold text-sm text-white bg-[#71C9CE] hover:bg-[#5ab5bb] shadow-lg shadow-[#71C9CE]/25 btn-interactive flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Upscaling Live ({progress}%)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Simulate 4K GPU Upscale</span>
              </>
            )}
          </button>
        </div>

        {/* Terminal Output */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl p-6 font-mono text-xs text-slate-300 space-y-4 relative overflow-hidden">
          {/* Scanline Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#71C9CE]/5 to-transparent h-10 w-full animate-scanline pointer-events-none" />

          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-bold text-slate-200">modal-gpu-worker-t4-prod</span>
            </div>
            <span className="text-[#71C9CE]">{progress}% COMPLETED</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#A6E3E9] to-[#71C9CE] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Console Log Area */}
          <div className="h-56 overflow-y-auto space-y-2 text-[11px] leading-relaxed pt-2">
            {logs.map((log, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-2 ${
                  log.includes('[COMPLETE]')
                    ? 'text-emerald-400 font-bold'
                    : log.includes('[REAL-ESRGAN]')
                    ? 'text-cyan-300'
                    : log.includes('[FILTERS]')
                    ? 'text-[#A6E3E9]'
                    : 'text-slate-300'
                }`}
              >
                <span className="text-slate-600 select-none">&gt;</span>
                <span>{log}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
            <span>Hardware: NVIDIA T4 (16GB)</span>
            <span className="text-emerald-400">LATENCY: 3.42s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
