/**
 * 데이터베이스 감사 로그 유틸리티
 * 모든 CRUD 작업을 자동으로 추적하고 기록하는 기능 제공
 *
 * 주요 기능:
 * - 자동 감사 로그 생성
 * - 변경 전후 데이터 비교
 * - 사용자 컨텍스트 추적
 * - 배치 로그 처리
 */

import { db } from './index';
import { auditLogs, type NewAuditLog } from './schema';
import { eq } from 'drizzle-orm';

/**
 * 감사 로그 컨텍스트 인터페이스
 * 각 요청에서 사용자 정보와 메타데이터를 추적
 */
export interface AuditContext {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  sessionId?: string;
  reason?: string;
  source?: 'web' | 'api' | 'system' | 'migration';
}

/**
 * 감사 로그 생성 함수
 * 데이터베이스 변경 작업 시 자동으로 호출되어 이력을 기록
 *
 * @param tableName 변경된 테이블명
 * @param recordId 변경된 레코드 ID
 * @param operation 작업 타입 (INSERT, UPDATE, DELETE)
 * @param context 사용자 컨텍스트 정보
 * @param oldValues 변경 전 데이터 (UPDATE, DELETE 시)
 * @param newValues 변경 후 데이터 (INSERT, UPDATE 시)
 */
export async function createAuditLog(
  tableName: string,
  recordId: string,
  operation: 'INSERT' | 'UPDATE' | 'DELETE',
  context: AuditContext,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>
): Promise<void> {
  try {
    // 변경된 필드 목록 계산 (UPDATE 작업 시)
    let changedFields: string[] | null = null;
    if (operation === 'UPDATE' && oldValues && newValues) {
      changedFields = Object.keys(newValues).filter(
        key => JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])
      );
    }

    // 감사 로그 데이터 생성
    const auditLogData: NewAuditLog = {
      tableName,
      recordId,
      operation,
      userId: context.userId || null,
      userEmail: context.userEmail || null,
      userRole: context.userRole || null,
      oldValues: oldValues || null,
      newValues: newValues || null,
      changedFields: changedFields || null,
      ipAddress: context.ipAddress || null,
      userAgent: context.userAgent || null,
      requestId: context.requestId || null,
      sessionId: context.sessionId || null,
      reason: context.reason || null,
      source: context.source || 'web',
    };

    // 감사 로그 저장
    await db.insert(auditLogs).values(auditLogData);

    console.log(
      `✅ 감사 로그 생성 완료: ${tableName}.${recordId} (${operation})`
    );
  } catch (error) {
    // 감사 로그 생성 실패 시에도 원본 작업은 계속 진행
    console.error('❌ 감사 로그 생성 실패:', error);
    console.error(
      '테이블:',
      tableName,
      '레코드 ID:',
      recordId,
      '작업:',
      operation
    );
  }
}

/**
 * 배치 감사 로그 생성 함수
 * 여러 개의 감사 로그를 한 번에 처리하여 성능 최적화
 *
 * @param logs 생성할 감사 로그 배열
 */
export async function createBatchAuditLogs(logs: NewAuditLog[]): Promise<void> {
  if (logs.length === 0) return;

  try {
    await db.insert(auditLogs).values(logs);
    console.log(`✅ 배치 감사 로그 생성 완료: ${logs.length}개 로그`);
  } catch (error) {
    console.error('❌ 배치 감사 로그 생성 실패:', error);
  }
}

/**
 * 특정 레코드의 변경 이력 조회 함수
 *
 * @param tableName 테이블명
 * @param recordId 레코드 ID
 * @param limit 조회할 로그 수 (기본값: 50)
 * @returns 변경 이력 배열
 */
export async function getRecordHistory(
  tableName: string,
  recordId: string,
  limit: number = 50
) {
  try {
    const history = await db
      .select()
      .from(auditLogs)
      .where(
        eq(auditLogs.tableName, tableName) && eq(auditLogs.recordId, recordId)
      )
      .orderBy(auditLogs.createdAt)
      .limit(limit);

    return history;
  } catch (error) {
    console.error('레코드 이력 조회 실패:', error);
    return [];
  }
}

/**
 * 사용자별 활동 이력 조회 함수
 *
 * @param userId 사용자 ID
 * @param limit 조회할 로그 수 (기본값: 100)
 * @returns 사용자 활동 이력 배열
 */
export async function getUserAuditHistory(userId: string, limit: number = 100) {
  try {
    const history = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(auditLogs.createdAt)
      .limit(limit);

    return history;
  } catch (error) {
    console.error('사용자 감사 이력 조회 실패:', error);
    return [];
  }
}

/**
 * 감사 로그 통계 조회 함수
 *
 * @param startDate 시작 날짜
 * @param endDate 종료 날짜
 * @returns 감사 로그 통계 정보
 */
export async function getAuditStatistics(startDate: Date, endDate: Date) {
  try {
    // 기간별 작업 통계 조회
    const stats = await db
      .select({
        tableName: auditLogs.tableName,
        operation: auditLogs.operation,
        count: 'COUNT(*)',
      })
      .from(auditLogs)
      .where(auditLogs.createdAt >= startDate && auditLogs.createdAt <= endDate)
      .groupBy(auditLogs.tableName, auditLogs.operation);

    return stats;
  } catch (error) {
    console.error('감사 로그 통계 조회 실패:', error);
    return [];
  }
}

/**
 * 감사 로그 정리 함수
 * 오래된 감사 로그를 정리하여 데이터베이스 성능 최적화
 *
 * @param retentionDays 보존 기간 (일)
 * @returns 삭제된 로그 수
 */
export async function cleanupAuditLogs(retentionDays: number): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await db
      .delete(auditLogs)
      .where(auditLogs.createdAt < cutoffDate);

    console.log(`✅ 감사 로그 정리 완료: ${result.rowCount}개 로그 삭제`);
    return result.rowCount || 0;
  } catch (error) {
    console.error('❌ 감사 로그 정리 실패:', error);
    return 0;
  }
}

/**
 * 데이터베이스 작업 래퍼 함수
 * CRUD 작업을 수행하면서 자동으로 감사 로그를 생성
 *
 * @param operation 수행할 작업 함수
 * @param auditInfo 감사 로그 정보
 * @returns 작업 결과
 */
export async function withAudit<T>(
  operation: () => Promise<T>,
  auditInfo: {
    tableName: string;
    recordId: string;
    operationType: 'INSERT' | 'UPDATE' | 'DELETE';
    context: AuditContext;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
  }
): Promise<T> {
  try {
    // 원본 작업 실행
    const result = await operation();

    // 감사 로그 생성 (비동기로 실행하여 성능 영향 최소화)
    setImmediate(() => {
      createAuditLog(
        auditInfo.tableName,
        auditInfo.recordId,
        auditInfo.operationType,
        auditInfo.context,
        auditInfo.oldValues,
        auditInfo.newValues
      );
    });

    return result;
  } catch (error) {
    // 작업 실패 시에도 감사 로그 생성 (실패 기록)
    setImmediate(() => {
      createAuditLog(
        auditInfo.tableName,
        auditInfo.recordId,
        auditInfo.operationType,
        {
          ...auditInfo.context,
          reason: `작업 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        },
        auditInfo.oldValues,
        auditInfo.newValues
      );
    });

    throw error;
  }
}
