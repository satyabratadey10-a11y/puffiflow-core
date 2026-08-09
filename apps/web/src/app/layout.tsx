import "./globals.css";
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://puffiflow-core-web-t8e1.vercel.app'),
  title: {
    template: '%s | PuffiFlow 4K',
    default: 'PuffiFlow - Autonomous 4K Video Upscaling & Scheduled YouTube Publishing',
  },
  description: 'Transform raw video assets into crystal-clear 4K using Modal T4 GPU clusters, Cloudflare R2 presigned uploads, and automated YouTube Data API publishing.',
  keywords: ['4K Video Upscaling', 'Modal GPU', 'Cloudflare R2', 'YouTube API v3', 'Video Automation', 'Vercel', 'Next.js'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'PuffiFlow - Autonomous 4K Video Upscaling & Scheduled YouTube Publishing',
    description: 'Transform raw video assets into crystal-clear 4K using Modal T4 GPU clusters, Cloudflare R2 presigned uploads, and automated YouTube Data API publishing.',
    url: 'https://puffiflow-core-web-t8e1.vercel.app',
    siteName: 'PuffiFlow 4K Core',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PuffiFlow 4K Platform Preview',
      },
    ],
    type: 'website',
  },
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#090d16] text-gray-100 flex flex-col min-h-screen selection:bg-violet-500 selection:text-white">
        <Toaster position="top-right" richColors theme="dark" />
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
