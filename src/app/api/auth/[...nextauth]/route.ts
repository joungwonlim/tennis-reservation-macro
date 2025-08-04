/**
 * NextAuth.js API 라우트
 * 모든 인증 관련 API 엔드포인트를 처리
 *
 * 지원하는 엔드포인트:
 * - GET/POST /api/auth/signin - 로그인
 * - GET/POST /api/auth/signout - 로그아웃
 * - GET/POST /api/auth/session - 세션 정보 조회
 * - GET/POST /api/auth/csrf - CSRF 토큰
 * - GET/POST /api/auth/providers - 인증 프로바이더 목록
 */

import { GET, POST } from '@/lib/auth';

// NextAuth 핸들러를 API 라우트로 내보내기
export { GET, POST };
