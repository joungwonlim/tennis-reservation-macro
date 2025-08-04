/**
 * NextAuth.js 타입 확장
 * 기본 NextAuth 타입에 커스텀 필드를 추가
 *
 * 확장된 필드:
 * - User.role: 사용자 역할 ('user' | 'admin')
 * - Session.user.id: 사용자 ID
 * - Session.user.role: 사용자 역할
 * - JWT.role: JWT 토큰에 포함된 사용자 역할
 * - JWT.id: JWT 토큰에 포함된 사용자 ID
 */

import NextAuth from 'next-auth';

declare module 'next-auth' {
  /**
   * User 인터페이스 확장
   * 인증 시 반환되는 사용자 객체에 role 필드 추가
   */
  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: string;
  }

  /**
   * Session 인터페이스 확장
   * 클라이언트에서 접근할 수 있는 세션 객체에 사용자 ID와 역할 추가
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
    };
  }
}

declare module 'next-auth/jwt' {
  /**
   * JWT 인터페이스 확장
   * JWT 토큰에 사용자 ID와 역할 정보 추가
   */
  interface JWT {
    id: string;
    role: string;
  }
}
