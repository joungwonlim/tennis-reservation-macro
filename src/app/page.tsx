/**
 * 메인 홈페이지 컴포넌트
 *
 * 테니스 예약 매크로 시스템의 랜딩 페이지입니다.
 * Dark 테마와 Purple 강조색을 사용한 모던한 디자인을 적용합니다.
 */

import { ThemeToggle } from '@/components/theme-toggle';

export default function HomePage() {
  return (
    <div className='min-h-screen relative overflow-hidden'>
      {/* 배경 그라데이션 효과 */}
      <div className='absolute inset-0'>
        <div className='absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl'></div>
        <div className='absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl'></div>
      </div>

      {/* 헤더 네비게이션 */}
      <nav className='relative z-20 flex items-center justify-between p-6'>
        <div className='flex items-center space-x-2'>
          <div className='w-8 h-8 bg-gradient-to-r from-primary to-blue-500 rounded-lg flex items-center justify-center'>
            <span className='text-primary-foreground font-bold text-sm'>T</span>
          </div>
          <span className='text-foreground font-semibold text-lg'>
            Tennis Macro
          </span>
        </div>
        <div className='flex items-center space-x-4'>
          <button className='px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors'>
            로그인
          </button>
          <button className='px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all hover:scale-105'>
            회원가입
          </button>
          <ThemeToggle />
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <div className='relative z-10 flex flex-col items-center justify-center px-6 py-20'>
        {/* 메인 타이틀 섹션 */}
        <div className='text-center mb-16 max-w-4xl'>
          <div className='inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6'>
            <div className='w-2 h-2 bg-primary rounded-full mr-2 pulse-purple'></div>
            <span className='text-primary text-sm font-medium'>
              AI 기반 자동 예약 시스템
            </span>
          </div>

          <h1 className='text-5xl md:text-7xl font-bold mb-6'>
            <span className='text-gradient-purple'>테니스 예약</span>
            <br />
            <span className='text-gradient-cyber'>매크로 시스템</span>
          </h1>

          <p className='text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed'>
            유니버시아드테니스장의 코트를 자동으로 예약하고, 실시간 모니터링과
            통계 분석을 통해 최적의 예약 경험을 제공합니다.
          </p>

          <div className='flex flex-col sm:flex-row items-center justify-center gap-4 mb-12'>
            <button className='btn-primary hover-scale'>
              <span className='flex items-center'>
                시작하기
                <svg
                  className='w-5 h-5 ml-2 transition-transform group-hover:translate-x-1'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 7l5 5m0 0l-5 5m5-5H6'
                  />
                </svg>
              </span>
            </button>

            <button className='btn-secondary'>데모 보기</button>
          </div>
        </div>

        {/* 통계 카드들 */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-5xl w-full'>
          {/* 성공률 카드 */}
          <div className='card-modern hover-lift'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-gradient-to-r from-primary to-blue-500 rounded-xl flex items-center justify-center'>
                <svg
                  className='w-6 h-6 text-primary-foreground'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <span className='text-green-400 text-sm font-medium'>+12%</span>
            </div>
            <h3 className='text-3xl font-bold text-foreground mb-2'>98.5%</h3>
            <p className='text-muted-foreground'>예약 성공률</p>
          </div>

          {/* 활성 사용자 카드 */}
          <div className='card-modern hover-lift'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center'>
                <svg
                  className='w-6 h-6 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                  />
                </svg>
              </div>
              <span className='text-blue-400 text-sm font-medium'>+8%</span>
            </div>
            <h3 className='text-3xl font-bold text-foreground mb-2'>1,247</h3>
            <p className='text-muted-foreground'>활성 사용자</p>
          </div>

          {/* 총 예약 수 카드 */}
          <div className='card-modern hover-lift'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-gradient-to-r from-cyan-500 to-primary rounded-xl flex items-center justify-center'>
                <svg
                  className='w-6 h-6 text-primary-foreground'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                  />
                </svg>
              </div>
              <span className='text-primary text-sm font-medium'>+24%</span>
            </div>
            <h3 className='text-3xl font-bold text-foreground mb-2'>15.2K</h3>
            <p className='text-muted-foreground'>총 예약 수</p>
          </div>
        </div>

        {/* 상태 표시 */}
        <div className='mt-16 flex items-center justify-center space-x-8'>
          <div className='flex items-center space-x-2'>
            <div className='w-3 h-3 bg-green-400 rounded-full pulse-purple'></div>
            <span className='text-green-400 font-medium'>시스템 정상 작동</span>
          </div>
          <div className='flex items-center space-x-2'>
            <div className='w-3 h-3 bg-blue-400 rounded-full pulse-purple'></div>
            <span className='text-blue-400 font-medium'>실시간 모니터링</span>
          </div>
          <div className='flex items-center space-x-2'>
            <div className='w-3 h-3 bg-primary rounded-full pulse-purple'></div>
            <span className='text-primary font-medium'>AI 최적화</span>
          </div>
        </div>
      </div>
    </div>
  );
}
