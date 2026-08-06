'use client';

import React from 'react';
import { UploadCloud, Cpu, CalendarClock, Lock, PlayCircle, CheckCircle2 } from 'lucide-react';

export default function Features() {
  const steps = [
    {
      icon: UploadCloud,
      title: 'Direct-to-R2 Upload',
      description: 'Presigned S3 URLs allow raw high-bitrate video binaries to upload straight to Cloudflare R2 without burdening the Express API server.',
      color: 'text-cyan-400',
    },
    {
      icon: Cpu,
      title: 'Serverless Modal GPU Upscaling',
      description: 'NVIDIA T4 GPUs execute Real-ESRGAN & FFmpeg filter chains to scale video up to 3840x2160 4K resolution on demand.',
      color: 'text-violet-400',
    },
    {
      icon: CalendarClock,
      title: 'Autonomous Cron Scheduler',
      description: 'Background cron continuously monitors job completion status and triggers automated uploads at scheduled publishing times.',
      color: 'text-amber-400',
    },
    {
      icon: Lock,
      title: 'AES-256 Token Encryption',
      description: 'YouTube OAuth refresh tokens are encrypted at rest in Supabase PostgreSQL, ensuring enterprise-grade credentials security.',
      color: 'text-emerald-400',
    },
  ];

  return (
    <section id="features" className="py-20 relative bg-slate-950/60 border-t border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            Production-Grade End-to-End Pipeline
          </h2>
          <p className="text-slate-400 text-base md:text-lg">
            Engineered to operate on a $0-budget stack with serverless components, streaming pass-through, and zero persistent server overhead.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-slate-800/80 ${step.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400">
                    Step 0{idx + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>

        {/* Live Code Architecture Card */}
        <div className="mt-16 p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                <PlayCircle className="w-4 h-4" />
                <span>Zero Memory Overhead Stream</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Direct Pass-Through Video Streaming</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                When a scheduled publication fires, PuffiFlow streams the 4K MP4 payload from Cloudflare R2 directly into YouTube API v3 chunked uploads without intermediate disk writes or server buffer limits.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Node.js `Readable` stream pass-through</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Cloudflare R2 S3 zero-egress bandwidth charges</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Supabase timestamptz automated CRON triggers</span>
                </li>
              </ul>
            </div>

            <div className="w-full md:w-auto flex-1 bg-slate-950 p-6 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
              <div className="text-violet-400 mb-2">// Express API Cron Publisher Stream</div>
              <div className="text-slate-500">const response = await fetch(r2VideoUrl);</div>
              <div className="text-slate-300">const videoStream = response.body as Readable;</div>
              <div className="text-slate-500 mt-2">// YouTube v3 Insert Stream</div>
              <div className="text-cyan-400">await youtube.videos.insert({`{`}</div>
              <div className="pl-4 text-slate-300">part: ['snippet', 'status'],</div>
              <div className="pl-4 text-slate-300">media: {`{`} mimeType: 'video/mp4', body: videoStream {`}`}</div>
              <div className="text-cyan-400">{`}`});</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
