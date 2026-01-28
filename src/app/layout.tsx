import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SearchCommand } from '@/components/search/search-command';
import { StructuredDataScript } from '@/components/seo/structured-data';
import { generateWebsiteStructuredData } from '@/lib/structured-data';
import { ErrorBoundary } from '@/components/error-boundary';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Subagents.sh',
    default: 'Subagents.sh - Discover Claude Code Subagents',
  },
  description:
    'Discover and install Claude Code subagents to enhance your development workflow. Browse the leaderboard of top subagents sorted by downloads.',
  keywords: [
    'Claude Code',
    'subagents',
    'AI development',
    'automation',
    'programming tools',
    'developer tools',
    'AI assistant',
    'workflow automation',
  ],
  authors: [{ name: 'Subagents.sh Team' }],
  creator: 'Subagents.sh Team',
  publisher: 'Subagents.sh',
  openGraph: {
    title: 'Subagents.sh - Discover Claude Code Subagents',
    description:
      'Discover and install Claude Code subagents to enhance your development workflow.',
    url: 'https://subagents.sh',
    siteName: 'Subagents.sh',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'subagents.sh - Discover and install Claude Code subagents',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Subagents.sh - Discover Claude Code Subagents',
    description:
      'Discover and install Claude Code subagents to enhance your development workflow.',
    creator: '@subagentssh',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <StructuredDataScript data={generateWebsiteStructuredData()} />
      </head>
      <body
        className={`${inter.variable} ${jetBrainsMono.variable} font-sans antialiased`}
      >
        <ErrorBoundary>
          <div className="relative flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <SearchCommand />
        </ErrorBoundary>
      </body>
    </html>
  );
}
