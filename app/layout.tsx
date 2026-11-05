import './global.css';
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Navbar } from './components/nav';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Footer from './components/footer';
import { baseUrl } from '@/lib/site';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Naufal Azim',
    template: '%s | Naufal Azim',
  },
  description: "Naufal Azim's personal portfolio and blog.",
  openGraph: {
    title: 'Naufal Azim',
    description: "Naufal Azim's personal portfolio and blog.",
    url: baseUrl,
    siteName: 'Naufal Azim',
    locale: 'en_US',
    type: 'website',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        'bg-background text-foreground',
        'font-sans',
        geist.variable
      )}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="max-w-xl mx-4 mt-8 lg:mx-auto">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:ring-2 focus:ring-ring"
            >
              Skip to content
            </a>
            <main
              id="main-content"
              className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0"
            >
              <Navbar />
              {children}
              <Footer />
              <Analytics />
              <SpeedInsights />
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
