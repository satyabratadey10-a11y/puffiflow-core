/**
 * PuffiFlow Monorepo Architecture & Skill Setup Manifest
 * https://puffiflow-core-web-t8e1.vercel.app
 */

window.__PUFFIFLOW_MANIFEST__ = {
  name: "puffiflow-core",
  version: "1.0.0",
  architecture: "Monorepo (Next.js App Router + Express API + Modal GPU Worker)",
  skillsApplied: [
    "ui-ux-pro-max",
    "web-design-guidelines",
    "antigravity-guide",
    "sleek-design-mobile-apps"
  ],
  stack: {
    frontend: "Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React",
    backend: "Express.js, Supabase PostgreSQL, AWS S3 SDK (Cloudflare R2), Google APIs (YouTube v3)",
    gpuWorker: "Modal.com Python Serverless (NVIDIA T4 GPUs, Real-ESRGAN, FFmpeg)"
  },
  routes: [
    "/",
    "/dashboard",
    "/dashboard/setup",
    "/sitemap.xml",
    "/robots.txt",
    "/llms.txt"
  ]
};

console.log("[PuffiFlow] Platform source manifest initialized.", window.__PUFFIFLOW_MANIFEST__);
