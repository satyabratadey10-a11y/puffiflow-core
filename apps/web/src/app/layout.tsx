import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'PuffiFlow | Autonomous 4K Video Upscaling & Scheduled YouTube Publisher',
  description: '100% server-side 4K video upscaling using Modal T4 GPU clusters, Cloudflare R2 direct S3 upload, and automated YouTube publishing.',
  keywords: ['4K upscaling', 'video AI', 'Modal GPU', 'YouTube API', 'Cloudflare R2', 'Supabase'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-slate-950 text-slate-100 flex flex-col min-h-screen selection:bg-violet-500 selection:text-white">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
