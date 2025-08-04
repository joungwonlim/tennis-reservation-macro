/**
 * 데이터베이스 연결 설정 파일
 * Neon PostgreSQL과 Drizzle ORM을 사용한 데이터베이스 연결 관리
 *
 * 주요 기능:
 * - Neon 서버리스 PostgreSQL 연결
 * - Drizzle ORM 인스턴스 생성
 * - 연결 풀 관리 및 최적화
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Neon 데이터베이스 연결 URL 환경 변수 확인
if (!process.env.DATABASE_URL) {
  throw new Error(
    '데이터베이스 연결 URL이 설정되지 않았습니다. DATABASE_URL 환경 변수를 확인해주세요.'
  );
}

/**
 * Neon HTTP 클라이언트 생성
 * - 서버리스 환경에 최적화된 HTTP 기반 연결
 * - 자동 연결 풀링 및 관리
 */
const sql = neon(process.env.DATABASE_URL!);

/**
 * Drizzle ORM 데이터베이스 인스턴스
 * - 타입 안전한 쿼리 빌더
 * - 스키마 기반 자동 완성
 * - 마이그레이션 지원
 */
export const db = drizzle(sql, { schema });

/**
 * 데이터베이스 연결 상태 확인 함수
 * 헬스체크 및 모니터링에 사용
 *
 * @returns Promise<boolean> 연결 성공 여부
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // 간단한 쿼리로 연결 상태 확인
    await sql`SELECT 1`;
    console.log('✅ 데이터베이스 연결 성공');
    return true;
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error);
    return false;
  }
}

/**
 * 데이터베이스 연결 정보 조회 함수
 * 개발 및 디버깅 목적으로 사용
 *
 * @returns Promise<object> 데이터베이스 정보
 */
export async function getDatabaseInfo() {
  try {
    const result = await sql`
      SELECT 
        version() as version,
        current_database() as database_name,
        current_user as user_name,
        inet_server_addr() as server_address,
        inet_server_port() as server_port
    `;
    return result[0];
  } catch (error) {
    console.error('데이터베이스 정보 조회 실패:', error);
    throw error;
  }
}

// 개발 환경에서 연결 상태 확인
if (process.env.NODE_ENV === 'development') {
  checkDatabaseConnection();
}
