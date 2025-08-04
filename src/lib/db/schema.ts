/**
 * 테니스 예약 매크로 시스템 데이터베이스 스키마
 * Drizzle ORM을 사용한 PostgreSQL 테이블 정의
 *
 * 주요 테이블:
 * - users: 사용자 정보
 * - tennisAccounts: 테니스장 계정 정보 (암호화)
 * - reservations: 예약 설정
 * - reservationLogs: 예약 실행 로그
 * - notificationSettings: 알림 설정
 * - systemSettings: 시스템 설정
 * - dailyStats: 일일 통계 집계
 * - userActivityLogs: 사용자 활동 로그
 * - systemNotifications: 시스템 알림
 */

import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

/**
 * PostgreSQL Enum 타입 정의
 * 데이터 무결성과 타입 안전성을 위한 열거형 타입들
 */

// 사용자 역할 enum
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

// 예약 상태 enum
export const reservationStatusEnum = pgEnum('reservation_status', [
  'pending',
  'success',
  'failed',
  'cancelled',
  'timeout',
]);

// 시스템 설정 카테고리 enum
export const systemSettingsCategoryEnum = pgEnum('system_settings_category', [
  'general',
  'macro',
  'notification',
  'security',
]);

// 감사 로그 작업 타입 enum
export const auditOperationEnum = pgEnum('audit_operation', [
  'INSERT',
  'UPDATE',
  'DELETE',
]);

// 알림 타입 enum
export const notificationTypeEnum = pgEnum('notification_type', [
  'info',
  'warning',
  'error',
  'success',
]);

// 감사 로그 소스 enum
export const auditSourceEnum = pgEnum('audit_source', [
  'web',
  'api',
  'system',
  'migration',
]);

/**
 * 사용자 테이블
 * 시스템 사용자 정보 및 권한 관리
 */
export const users = pgTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    email: text('email').notNull().unique(),
    name: text('name'),
    password: text('password').notNull(), // bcrypt 해시된 비밀번호
    role: userRoleEnum('role').notNull().default('user'), // 'user' | 'admin'
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  table => ({
    // 이메일 기반 고유 인덱스 (로그인용)
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
    // 역할별 조회 최적화
    roleIdx: index('users_role_idx').on(table.role),
  })
);

/**
 * 테니스장 계정 정보 테이블
 * 유니버시아드테니스장 사이트 로그인 정보 (암호화 저장)
 */
export const tennisAccounts = pgTable(
  'tennis_accounts',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    username: text('username').notNull(), // AES-256-GCM 암호화된 사용자명
    password: text('password').notNull(), // AES-256-GCM 암호화된 비밀번호
    isActive: boolean('is_active').notNull().default(true),
    lastLoginAt: timestamp('last_login_at'), // 마지막 로그인 시간
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  table => ({
    // 사용자당 하나의 테니스장 계정만 허용
    userIdIdx: uniqueIndex('tennis_accounts_user_id_idx').on(table.userId),
  })
);

/**
 * 예약 설정 테이블
 * 사용자가 설정한 자동 예약 정보
 */
export const reservations = pgTable(
  'reservations',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: timestamp('date').notNull(), // 예약 날짜
    timeSlot: text('time_slot').notNull(), // "09:00-10:00" 형태
    courtNumber: integer('court_number').notNull(), // 코트 번호 (1-10)
    isRecurring: boolean('is_recurring').notNull().default(false), // 반복 예약 여부
    recurringDays: jsonb('recurring_days'), // ["MON", "WED", "FRI"] 형태
    isActive: boolean('is_active').notNull().default(true), // 활성화 상태
    priority: integer('priority').notNull().default(1), // 우선순위 (1-10)
    maxRetries: integer('max_retries').notNull().default(3), // 최대 재시도 횟수
    retryInterval: integer('retry_interval').notNull().default(5), // 재시도 간격 (분)
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  table => ({
    // 사용자별 예약 조회 최적화
    userIdIdx: index('reservations_user_id_idx').on(table.userId),
    // 날짜별 예약 조회 최적화
    dateIdx: index('reservations_date_idx').on(table.date),
    // 활성화된 예약만 조회 최적화
    activeIdx: index('reservations_active_idx').on(table.isActive),
    // 사용자별 날짜별 복합 인덱스
    userDateIdx: index('reservations_user_date_idx').on(
      table.userId,
      table.date
    ),
  })
);

/**
 * 예약 실행 로그 테이블
 * 매크로 실행 결과 및 상세 로그 저장
 */
export const reservationLogs = pgTable(
  'reservation_logs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    reservationId: text('reservation_id')
      .notNull()
      .references(() => reservations.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    executedAt: timestamp('executed_at').notNull().defaultNow(), // 실행 시간
    status: reservationStatusEnum('status').notNull(), // "pending", "success", "failed", "cancelled", "timeout"
    message: text('message'), // 성공/실패 메시지
    errorDetails: jsonb('error_details'), // 오류 상세 정보 (스택 트레이스 등)
    executionTime: integer('execution_time'), // 실행 시간 (밀리초)
    retryCount: integer('retry_count').notNull().default(0), // 재시도 횟수
    ipAddress: text('ip_address'), // 실행 IP 주소
    userAgent: text('user_agent'), // 브라우저 정보
  },
  table => ({
    // 예약별 로그 조회 최적화
    reservationIdIdx: index('reservation_logs_reservation_id_idx').on(
      table.reservationId
    ),
    // 상태별 로그 조회 최적화
    statusIdx: index('reservation_logs_status_idx').on(table.status),
    // 실행 시간별 로그 조회 최적화
    executedAtIdx: index('reservation_logs_executed_at_idx').on(
      table.executedAt
    ),
    // 사용자별 로그 조회 최적화
    userIdIdx: index('reservation_logs_user_id_idx').on(table.userId),
    // 상태별 날짜별 복합 인덱스 (통계용)
    statusDateIdx: index('reservation_logs_status_date_idx').on(
      table.status,
      table.executedAt
    ),
  })
);

/**
 * 알림 설정 테이블
 * 사용자별 알림 선호도 설정
 */
export const notificationSettings = pgTable(
  'notification_settings',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    emailNotifications: boolean('email_notifications').notNull().default(true), // 이메일 알림
    webPushNotifications: boolean('web_push_notifications')
      .notNull()
      .default(false), // 웹 푸시 알림
    smsNotifications: boolean('sms_notifications').notNull().default(false), // SMS 알림
    notifyOnSuccess: boolean('notify_on_success').notNull().default(true), // 성공 시 알림
    notifyOnFailure: boolean('notify_on_failure').notNull().default(true), // 실패 시 알림
    notifyOnError: boolean('notify_on_error').notNull().default(true), // 오류 시 알림
    notifyOnSchedule: boolean('notify_on_schedule').notNull().default(false), // 예약 시간 전 알림
    scheduleNotifyMinutes: integer('schedule_notify_minutes').default(30), // 몇 분 전에 알림
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  table => ({
    // 사용자당 하나의 알림 설정만 허용
    userIdIdx: uniqueIndex('notification_settings_user_id_idx').on(
      table.userId
    ),
  })
);

/**
 * 시스템 설정 테이블
 * 전역 시스템 설정 및 구성 관리
 */
export const systemSettings = pgTable(
  'system_settings',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    key: text('key').notNull().unique(), // 설정 키
    value: text('value').notNull(), // 설정 값
    description: text('description'), // 설정 설명
    category: systemSettingsCategoryEnum('category')
      .notNull()
      .default('general'), // 'general', 'macro', 'notification', 'security'
    isPublic: boolean('is_public').notNull().default(false), // 클라이언트에서 접근 가능한지
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  table => ({
    // 설정 키 기반 고유 인덱스
    keyIdx: uniqueIndex('system_settings_key_idx').on(table.key),
    // 카테고리별 조회 최적화
    categoryIdx: index('system_settings_category_idx').on(table.category),
  })
);

/**
 * 통계 집계 테이블 (성능 최적화용)
 * 일일 통계를 미리 계산하여 저장
 */
export const dailyStats = pgTable(
  'daily_stats',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    date: timestamp('date').notNull(), // 통계 날짜
    totalAttempts: integer('total_attempts').notNull().default(0), // 총 시도 횟수
    successfulReservations: integer('successful_reservations')
      .notNull()
      .default(0), // 성공한 예약
    failedReservations: integer('failed_reservations').notNull().default(0), // 실패한 예약
    cancelledReservations: integer('cancelled_reservations')
      .notNull()
      .default(0), // 취소된 예약
    timeoutReservations: integer('timeout_reservations').notNull().default(0), // 타임아웃된 예약
    uniqueUsers: integer('unique_users').notNull().default(0), // 고유 사용자 수
    averageExecutionTime: integer('average_execution_time'), // 평균 실행 시간 (밀리초)
    peakHour: integer('peak_hour'), // 피크 시간대 (0-23)
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  table => ({
    // 날짜별 고유 인덱스 (하루에 하나의 통계만)
    dateIdx: uniqueIndex('daily_stats_date_idx').on(table.date),
  })
);

/**
 * 사용자 활동 로그 테이블
 * 사용자 행동 추적 및 감사 로그
 */
export const userActivityLogs = pgTable(
  'user_activity_logs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'set null',
    }), // 사용자 삭제 시 null로 설정
    action: text('action').notNull(), // 'login', 'logout', 'create_reservation', 'delete_reservation', etc.
    resource: text('resource'), // 영향받은 리소스 ID
    details: jsonb('details'), // 추가 정보 (JSON 형태)
    ipAddress: text('ip_address'), // IP 주소
    userAgent: text('user_agent'), // 브라우저 정보
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  table => ({
    // 사용자별 활동 조회 최적화
    userIdIdx: index('user_activity_logs_user_id_idx').on(table.userId),
    // 액션별 조회 최적화
    actionIdx: index('user_activity_logs_action_idx').on(table.action),
    // 시간별 조회 최적화
    createdAtIdx: index('user_activity_logs_created_at_idx').on(
      table.createdAt
    ),
  })
);

/**
 * 시스템 알림 테이블
 * 관리자가 발송하는 시스템 공지사항
 */
export const systemNotifications = pgTable(
  'system_notifications',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    title: text('title').notNull(), // 알림 제목
    message: text('message').notNull(), // 알림 내용
    type: notificationTypeEnum('type').notNull(), // 'info', 'warning', 'error', 'success'
    targetUsers: jsonb('target_users'), // 특정 사용자 대상 (null이면 전체)
    isRead: boolean('is_read').notNull().default(false), // 읽음 여부
    isActive: boolean('is_active').notNull().default(true), // 활성화 상태
    expiresAt: timestamp('expires_at'), // 만료 시간
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  table => ({
    // 알림 타입별 조회 최적화
    typeIdx: index('system_notifications_type_idx').on(table.type),
    // 활성화된 알림만 조회 최적화
    activeIdx: index('system_notifications_active_idx').on(table.isActive),
    // 생성 시간별 조회 최적화
    createdAtIdx: index('system_notifications_created_at_idx').on(
      table.createdAt
    ),
  })
);

/**
 * 데이터베이스 변경 이력 테이블 (감사 로그)
 * 모든 테이블의 CRUD 작업을 추적하여 누가 언제 무엇을 변경했는지 기록
 *
 * 주요 기능:
 * - 모든 테이블의 INSERT, UPDATE, DELETE 작업 추적
 * - 변경 전후 데이터 비교 가능
 * - 사용자별, 테이블별, 작업별 필터링 지원
 * - 규정 준수 및 보안 감사를 위한 완전한 추적 기록
 */
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),

    // 작업 정보
    tableName: text('table_name').notNull(), // 변경된 테이블명 (예: 'users', 'reservations')
    recordId: text('record_id').notNull(), // 변경된 레코드의 ID
    operation: auditOperationEnum('operation').notNull(), // 'INSERT', 'UPDATE', 'DELETE'

    // 사용자 정보
    userId: text('user_id').references(() => users.id, {
      onDelete: 'set null',
    }), // 작업을 수행한 사용자
    userEmail: text('user_email'), // 사용자 이메일 (사용자 삭제 시에도 기록 유지)
    userRole: text('user_role'), // 작업 당시 사용자 역할

    // 변경 데이터
    oldValues: jsonb('old_values'), // 변경 전 데이터 (UPDATE, DELETE 시)
    newValues: jsonb('new_values'), // 변경 후 데이터 (INSERT, UPDATE 시)
    changedFields: jsonb('changed_fields'), // 변경된 필드 목록 (UPDATE 시)

    // 메타데이터
    ipAddress: text('ip_address'), // 요청 IP 주소
    userAgent: text('user_agent'), // 브라우저 정보
    requestId: text('request_id'), // 요청 추적 ID
    sessionId: text('session_id'), // 세션 ID

    // 추가 정보
    reason: text('reason'), // 변경 사유 (선택적)
    source: auditSourceEnum('source').notNull().default('web'), // 'web', 'api', 'system', 'migration'

    // 시간 정보
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  table => ({
    // 테이블별 조회 최적화
    tableNameIdx: index('audit_logs_table_name_idx').on(table.tableName),
    // 레코드별 조회 최적화 (특정 레코드의 변경 이력)
    recordIdIdx: index('audit_logs_record_id_idx').on(table.recordId),
    // 사용자별 조회 최적화
    userIdIdx: index('audit_logs_user_id_idx').on(table.userId),
    // 작업 타입별 조회 최적화
    operationIdx: index('audit_logs_operation_idx').on(table.operation),
    // 시간별 조회 최적화 (최근 변경 사항)
    createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt),
    // 테이블별 레코드별 복합 인덱스 (특정 테이블의 특정 레코드 이력)
    tableRecordIdx: index('audit_logs_table_record_idx').on(
      table.tableName,
      table.recordId
    ),
    // 사용자별 시간별 복합 인덱스 (사용자 활동 추적)
    userTimeIdx: index('audit_logs_user_time_idx').on(
      table.userId,
      table.createdAt
    ),
  })
);

/**
 * 데이터 보존 정책 테이블
 * 각 테이블별 데이터 보존 기간 및 정책 관리
 */
export const dataRetentionPolicies = pgTable(
  'data_retention_policies',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    tableName: text('table_name').notNull().unique(), // 대상 테이블명
    retentionDays: integer('retention_days').notNull(), // 보존 기간 (일)
    archiveBeforeDelete: boolean('archive_before_delete')
      .notNull()
      .default(true), // 삭제 전 아카이브 여부
    isActive: boolean('is_active').notNull().default(true), // 정책 활성화 상태
    lastCleanupAt: timestamp('last_cleanup_at'), // 마지막 정리 실행 시간
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  table => ({
    // 테이블명 기반 고유 인덱스
    tableNameIdx: uniqueIndex('data_retention_policies_table_name_idx').on(
      table.tableName
    ),
    // 활성화된 정책만 조회 최적화
    activeIdx: index('data_retention_policies_active_idx').on(table.isActive),
  })
);

// 타입 추출 (TypeScript 타입 안전성을 위해)
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type TennisAccount = typeof tennisAccounts.$inferSelect;
export type NewTennisAccount = typeof tennisAccounts.$inferInsert;

export type Reservation = typeof reservations.$inferSelect;
export type NewReservation = typeof reservations.$inferInsert;

export type ReservationLog = typeof reservationLogs.$inferSelect;
export type NewReservationLog = typeof reservationLogs.$inferInsert;

export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type NewNotificationSettings = typeof notificationSettings.$inferInsert;

export type SystemSettings = typeof systemSettings.$inferSelect;
export type NewSystemSettings = typeof systemSettings.$inferInsert;

export type DailyStats = typeof dailyStats.$inferSelect;
export type NewDailyStats = typeof dailyStats.$inferInsert;

export type UserActivityLog = typeof userActivityLogs.$inferSelect;
export type NewUserActivityLog = typeof userActivityLogs.$inferInsert;

export type SystemNotification = typeof systemNotifications.$inferSelect;
export type NewSystemNotification = typeof systemNotifications.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

export type DataRetentionPolicy = typeof dataRetentionPolicies.$inferSelect;
export type NewDataRetentionPolicy = typeof dataRetentionPolicies.$inferInsert;
