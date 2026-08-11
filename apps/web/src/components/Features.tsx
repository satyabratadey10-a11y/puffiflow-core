import React from 'react';
import { Zap, Shield, Layers, Workflow, Database, PlayCircle } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Autonomous Modal T4 GPU Cluster',
    description: 'Serverless Real-ESRGAN and FFmpeg 4K acceleration pipeline executing on-demand without managing server instances.',
  },
  {
    icon: Database,
    title: 'Universal Multi-Cloud BYOS',
    description: 'Direct zero-egress presigned upload support across Supabase Storage, Cloudflare R2, AWS S3, Backblaze B2, and Wasabi.',
  },
  {
    icon: PlayCircle,
    title: 'Automated YouTube v3 Publishing',
    description: 'Background CRON scheduler using AES-256 encrypted offline refresh tokens to stream processed 4K MP4s directly into your channel.',
  },
  {
    icon: Shield,
    title: 'Production Security & RLS',
    description: 'Supabase PostgreSQL state management with strict Row-Level Security, IDOR prevention, and Bearer JWT authentication.',
  },
  {
    icon: Layers,
    title: 'Dual Resolution & Thumbnail Attachments',
    description: 'Flexible 1080p and 4K upscaling targets with automated custom thumbnail streaming and related video metadata linking.',
  },
  {
    icon: Workflow,
    title: 'Zero Local Disk Footprint',
    description: 'Binary streams pass directly between object storage and YouTube Data API endpoints without local disk caching.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-slate-50/50 relative z-10">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>High-Energy System Architecture</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Engineered for High-Scale 4K Automation
          </h2>
          <p className="text-slate-600 text-base md:text-lg">
            A production-ready serverless stack combining high-performance GPU compute, multi-cloud object storage, and automated social publishing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const IconComponent = feat.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl liquid-glass-card hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white w-fit mb-5 shadow-md shadow-emerald-500/20">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
