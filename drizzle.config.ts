/**
 * Drizzle ORM 설정 파일
 * 데이터베이스 연결 및 마이그레이션 설정
 *
 * 주요 설정:
 * - Neon PostgreSQL 연결
 * - 스키마 파일 위치
 * - 마이그레이션 파일 저장 위치
 * - 개발 환경 설정
 */

import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';

// 환경 변수 로드
config({ path: '.env.local' });

// 환경 변수 검증
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Please check your .env.local file.'
  );
}

export default {
  // 데이터베이스 방언 설정 (PostgreSQL)
  dialect: 'postgresql',

  // 스키마 파일 위치
  schema: './src/lib/db/schema.ts',

  // 마이그레이션 파일 저장 위치
  out: './src/lib/db/migrations',

  // 데이터베이스 연결 정보
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },

  // 개발 환경 설정
  verbose: true, // 상세 로그 출력
  strict: true, // 엄격 모드 (안전한 마이그레이션)

  // 테이블 접두사 (선택적)
  tablesFilter: ['*'], // 모든 테이블 포함
} satisfies Config;
