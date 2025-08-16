import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import HamburgerMenu from '../components/HamburgerMenu';
import { AuthProvider } from '../contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MY재고장부',
  description: '팝업스토어, 행사전시를 위한 임시 매장 재고관리 시스템',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthProvider>
          <HamburgerMenu />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}