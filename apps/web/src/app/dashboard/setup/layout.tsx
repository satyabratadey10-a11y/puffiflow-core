import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Storage Setup',
  description: 'Configure Cloudflare R2 credentials for zero-egress direct S3 storage in PuffiFlow.',
};

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
