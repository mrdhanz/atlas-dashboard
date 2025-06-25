// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from '@/components/query-provider';
import { CommandMenu } from '@/components/CommandMenu';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { WebSocketInitializer } from '@/components/websocket-initializer';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Atlas - Developer Command Center',
  description: 'Centralize your development workflow.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <div className="flex min-h-screen">
              {/* Sidebar is a Client Component */}
              <Sidebar />

              <div className="flex flex-1 flex-col">
                {/* Header is a Server Component */}
                <Header />

                {/* The page content is rendered here */}
                <main className="flex-1">{children}</main>
              </div>
            </div>

            {/* Client Components rendered outside the main view */}
            <CommandMenu />
            <WebSocketInitializer />
            
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}