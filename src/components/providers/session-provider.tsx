/**
 * 세션 프로바이더 컴포넌트
 * NextAuth SessionProvider를 래핑하여 전역 세션 상태 관리
 *
 * 주요 기능:
 * - 클라이언트 사이드 세션 상태 관리
 * - 자동 세션 갱신
 * - 세션 변경 이벤트 처리
 */

'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface SessionProviderWrapperProps {
  children: ReactNode;
}

/**
 * 세션 프로바이더 래퍼 컴포넌트
 * 애플리케이션 전체에 세션 컨텍스트를 제공
 *
 * @param children 자식 컴포넌트들
 */
export function SessionProviderWrapper({
  children,
}: SessionProviderWrapperProps) {
  return (
    <SessionProvider
      // 세션 갱신 간격 (5분)
      refetchInterval={5 * 60}
      // 윈도우 포커스 시 세션 갱신
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}
