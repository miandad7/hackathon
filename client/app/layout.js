import { Public_Sans, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public-sans',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata = {
  title: 'Citizen Complaint Portal | Municipal Operations',
  description: 'Report local infrastructure issues and track resolution with real-time government officer triage.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${publicSans.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen flex flex-col font-body bg-[var(--paper)] text-[var(--ink)] antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <footer className="bg-[#080E21] text-slate-400 border-t border-[var(--line-hairline)] py-6 text-xs font-display">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[var(--route-blue)] shadow-[0_0_8px_#00D2FF]" />
                <span className="text-slate-200 font-semibold uppercase tracking-wider">
                  Municipal Operations Cyber-Portal &bull; Live Transparency Engine
                </span>
              </div>
              <p className="text-slate-400 text-center sm:text-right">
                Infrastructure Triage & Public Resolution System
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
