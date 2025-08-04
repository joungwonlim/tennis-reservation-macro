/**
 * NextAuth.js 인증 설정
 * 이메일/비밀번호 기반 인증 시스템 구현
 *
 * 주요 기능:
 * - Credentials Provider를 사용한 이메일/비밀번호 인증
 * - Drizzle ORM과 연동된 사용자 관리
 * - bcrypt를 사용한 비밀번호 해싱
 * - JWT 토큰 기반 세션 관리
 */

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

/**
 * NextAuth 설정 객체
 * 인증 프로바이더, 어댑터, 콜백 함수 등을 정의
 */
export const authOptions = {
  // Drizzle ORM 어댑터 설정
  adapter: DrizzleAdapter(db),

  // 인증 프로바이더 설정
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: '이메일',
          type: 'email',
          placeholder: 'example@email.com',
        },
        password: {
          label: '비밀번호',
          type: 'password',
          placeholder: '비밀번호를 입력하세요',
        },
      },

      /**
       * 사용자 인증 함수
       * 이메일과 비밀번호를 검증하여 사용자 정보를 반환
       *
       * @param credentials 사용자가 입력한 인증 정보
       * @returns 인증된 사용자 정보 또는 null
       */
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ 인증 실패: 이메일 또는 비밀번호가 제공되지 않음');
          return null;
        }

        try {
          // 데이터베이스에서 사용자 조회
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email))
            .limit(1);

          if (user.length === 0) {
            console.log(
              `❌ 인증 실패: 사용자를 찾을 수 없음 (${credentials.email})`
            );
            return null;
          }

          const foundUser = user[0];

          // 계정 활성화 상태 확인
          if (!foundUser.isActive) {
            console.log(`❌ 인증 실패: 비활성화된 계정 (${credentials.email})`);
            return null;
          }

          // 비밀번호 검증
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            foundUser.password
          );

          if (!isPasswordValid) {
            console.log(`❌ 인증 실패: 잘못된 비밀번호 (${credentials.email})`);
            return null;
          }

          console.log(`✅ 인증 성공: ${foundUser.email} (${foundUser.role})`);

          // 인증 성공 시 사용자 정보 반환
          return {
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.name,
            role: foundUser.role,
          };
        } catch (error) {
          console.error('❌ 인증 중 오류 발생:', error);
          return null;
        }
      },
    }),
  ],

  // 세션 전략 설정 (JWT 사용)
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30일
  },

  // JWT 설정
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30일
  },

  // 콜백 함수들
  callbacks: {
    /**
     * JWT 토큰 생성/업데이트 시 호출되는 콜백
     * 사용자 정보를 토큰에 포함시킴
     */
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },

    /**
     * 세션 객체 생성 시 호출되는 콜백
     * 클라이언트에서 접근할 수 있는 세션 정보를 정의
     */
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  // 커스텀 페이지 설정
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },

  // 보안 설정
  secret: process.env.NEXTAUTH_SECRET,

  // 디버그 모드 (개발 환경에서만)
  debug: process.env.NODE_ENV === 'development',
};

/**
 * NextAuth 핸들러 생성
 * API 라우트에서 사용할 GET, POST 핸들러를 생성
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

/**
 * 서버 사이드에서 세션 정보를 가져오는 함수
 */
export { getServerSession } from 'next-auth';
