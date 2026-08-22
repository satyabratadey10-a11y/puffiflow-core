'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Zap, Cloud, Youtube } from 'lucide-react';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How does PuffiFlow achieve $0 bandwidth and zero server disk caching?',
      answer:
        'PuffiFlow uses client-side presigned PUT URLs directly to your S3/R2 storage. Uploads never transit through the Node.js API server. During inference, the Modal T4 GPU worker streams raw frames from S3 into VRAM, processes 4K frames, and streams the finished 4K MP4 back to your storage. When scheduled, the background worker streams directly from your storage to YouTube Data API endpoints.',
    },
    {
      question: 'Is Cloudflare R2 really free with zero egress fees?',
      answer:
        'Yes. Cloudflare R2 charges $0.00 for egress bandwidth and includes 10 GB of storage and 10 million Class B operations per month for free. This allows you to upscale and distribute 4K videos without incurring high bandwidth bills.',
    },
    {
      question: 'How are YouTube OAuth refresh tokens and S3 keys secured?',
      answer:
        'All credentials, API secrets, S3 access keys, and YouTube OAuth2 refresh tokens are encrypted at rest in Supabase PostgreSQL using authenticated AES-256-GCM encryption with unique initialization vectors (IV) and cryptographic authentication tags.',
    },
    {
      question: 'Can I link multiple YouTube channels and schedule custom release dates?',
      answer:
        'Yes. You can authenticate your channel via Google OAuth v3, attach custom thumbnails, link YouTube Shorts to Long-form videos via Related Video IDs, and select exact UTC timestamps for autonomous publication.',
    },
    {
      question: 'What GPU hardware is used for Real-ESRGAN upscaling?',
      answer:
        'Modal provisions serverless NVIDIA Tesla T4 GPU instances with 16GB of GDDR6 VRAM and TensorRT INT8/FP16 acceleration, achieving sub-4-second inference for typical video clips.',
    },
  ];

  return (
    <section className="py-20 px-6 max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#CBF1F5] text-[#1e484c] border border-[#A6E3E9] text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-[#71C9CE]" />
          <span>Frequently Asked Questions</span>
        </div>
        <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Architecture, Privacy & BYOS
        </h3>
        <p className="text-slate-600 text-sm">
          Everything you need to know about the 100% serverless 4K automation stack.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl liquid-glass-card border border-[#A6E3E9] overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-6 text-left flex items-center justify-between space-x-4 btn-interactive"
              >
                <span className="font-extrabold text-base text-slate-900">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#71C9CE] flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#5ab5bb]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-[#A6E3E9]/40 pt-4 bg-[#E3FDFD]/20">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
