import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from '@/components/SessionContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'i-WMS - Intelligent Warehouse Management System',
  description: 'Advanced warehouse management system with AI-powered analytics and real-time monitoring',
  keywords: 'warehouse, management, AI, analytics, logistics, automation',
  authors: [{ name: 'i-WMS Team' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/unilever-logo.ico" sizes="any" />
        <link rel="icon" href="/unilever-logo.svg" type="image/svg+xml" />
        <link rel="icon" href="/unilever-logo.png" type="image/png" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {children}
          </div>
        </SessionProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
} 