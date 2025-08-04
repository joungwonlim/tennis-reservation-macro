/**
 * 비밀번호 해싱 유틸리티
 * bcrypt를 사용한 안전한 비밀번호 처리
 *
 * 주요 기능:
 * - 비밀번호 해싱 (salt rounds: 12)
 * - 비밀번호 검증
 * - 비밀번호 강도 검사
 */

import bcrypt from 'bcryptjs';

/**
 * 비밀번호 해싱 함수
 * bcrypt를 사용하여 비밀번호를 안전하게 해싱
 *
 * @param password 원본 비밀번호
 * @returns 해싱된 비밀번호
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // 보안 강도 (높을수록 안전하지만 느림)
  return await bcrypt.hash(password, saltRounds);
}

/**
 * 비밀번호 검증 함수
 * 입력된 비밀번호와 해싱된 비밀번호를 비교
 *
 * @param password 입력된 비밀번호
 * @param hashedPassword 데이터베이스에 저장된 해싱된 비밀번호
 * @returns 비밀번호 일치 여부
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * 비밀번호 강도 검사 함수
 * 비밀번호가 보안 요구사항을 만족하는지 확인
 *
 * 요구사항:
 * - 최소 8자 이상
 * - 대문자, 소문자, 숫자, 특수문자 각각 최소 1개 포함
 *
 * @param password 검사할 비밀번호
 * @returns 검사 결과 객체
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 최소 길이 검사
  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다.');
  }

  // 대문자 포함 검사
  if (!/[A-Z]/.test(password)) {
    errors.push('비밀번호에 대문자가 포함되어야 합니다.');
  }

  // 소문자 포함 검사
  if (!/[a-z]/.test(password)) {
    errors.push('비밀번호에 소문자가 포함되어야 합니다.');
  }

  // 숫자 포함 검사
  if (!/\d/.test(password)) {
    errors.push('비밀번호에 숫자가 포함되어야 합니다.');
  }

  // 특수문자 포함 검사
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('비밀번호에 특수문자가 포함되어야 합니다.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 안전한 비밀번호 생성 함수
 * 요구사항을 만족하는 랜덤 비밀번호 생성
 *
 * @param length 비밀번호 길이 (기본값: 12)
 * @returns 생성된 비밀번호
 */
export function generateSecurePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*(),.?":{}|<>';

  const allChars = uppercase + lowercase + numbers + symbols;

  let password = '';

  // 각 카테고리에서 최소 1개씩 포함
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // 나머지 길이만큼 랜덤 문자 추가
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // 문자 순서 섞기
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}
