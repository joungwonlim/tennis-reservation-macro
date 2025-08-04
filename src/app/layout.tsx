import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '테니스 예약 매크로 - 유니버시아드테니스장 자동 예약 시스템',
  description:
    '유니버시아드테니스장의 테니스 코트를 자동으로 예약하는 매크로 시스템입니다. 실시간 모니터링과 통계 분석 기능을 제공합니다.',
  keywords: [
    '테니스',
    '예약',
    '매크로',
    '유니버시아드테니스장',
    '자동예약',
    '테니스코트',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white text-gray-900 transition-colors duration-300 dark:bg-gray-900 dark:text-white`}
      >
        <ThemeProvider defaultTheme='dark' storageKey='tennis-macro-theme'>
          {/* 전역 배경 효과 */}
          <div className='fixed inset-0 -z-10'>
            <div className='absolute inset-0 bg-gradient-to-br from-white via-purple-50/20 to-white dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900'></div>
          </div>

          {/* 메인 컨텐츠 */}
          <main className='relative z-10'>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
