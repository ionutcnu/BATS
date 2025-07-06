import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'BATS - Beat ATS Systems',
  description:
    'Transform your resume with AI-powered keyword optimization to pass ATS filters and get more interviews.',
  keywords: [
    'ATS',
    'resume optimization',
    'job applications',
    'keyword optimization',
    'resume scanner',
    'applicant tracking system',
    'resume builder',
    'job search',
    'career tools',
    'CV optimization',
    'interview preparation',
    'employment',
    'PDF optimization',
    'job matching',
    'resume parser',
  ],
  authors: [{ name: 'BATS Team' }],
  creator: 'BATS',
  publisher: 'BATS',
  robots: 'index, follow',
  openGraph: {
    title: 'BATS - Beat ATS Systems',
    description:
      'Transform your resume with AI-powered keyword optimization to pass ATS filters and get more interviews.',
    type: 'website',
    locale: 'en_US',
    url: 'https://bats-resume.com',
    siteName: 'BATS',
    images: [
      {
        url: '/icon.svg',
        width: 180,
        height: 180,
        alt: 'BATS - Beat ATS Systems',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BATS - Beat ATS Systems',
    description:
      'Transform your resume with AI-powered keyword optimization to pass ATS filters and get more interviews.',
    images: ['/icon.svg'],
    creator: '@BATSResume',
    site: '@BATSResume',
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider defaultTheme="system" storageKey="bats-ui-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
