# Sunjin Layer PM 시스템 개발 보고서

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| **프로젝트명** | Sunjin Layer PM (산란계 농장 성적 관리 시스템) |
| **기술 스택** | Next.js 15, TypeScript, Supabase, Tailwind CSS, Recharts |
| **배포 환경** | Vercel (https://sunjin-layer-manager.vercel.app) |
| **DB** | Supabase PostgreSQL (RLS 적용) |
| **다국어** | 한국어 / 영어 지원 |

---

## 2. 작업 내용

### 2-1. 회원가입/로그인 시스템 개선

**권한별 회원가입**
- 회원가입 시 4가지 권한을 선택하여 가입 가능
  - 관리자 (Admin): 거래처 등록, 사용자 관리, 전체 데이터 조회
  - 필리핀 현장 담당자 (Farm User): 일별 사육/생산 데이터 입력
  - 컨설턴트/영업 담당자 (Consultant): 거래처별 생산성 리포트 조회
  - 경영진/관리자 (Manager): 전체 사업장 성과 모니터링

**이메일 제한**
- @sunjin.com 이메일만 가입/로그인 가능 (서버 측 검증)
- 로그인/회원가입 화면에 안내 문구 표시

**다국어 표시**
- 회원가입 페이지 전체 한국어/영어 병기

**DB 트리거 수정**
- `handle_new_user()` 함수가 가입 시 선택한 권한을 프로필에 자동 반영
- 유효하지 않은 권한값은 기본값(Farm User)으로 fallback

### 2-2. 대시보드 - 폐사 증가 알림

- 네비게이션 첫 번째 탭: "대시보드" → "폐사 증가 알림" (경고 아이콘)
- 대시보드 최상단에 **전일 대비 폐사 증가 계군** 목록 표시
  - 계군명, 거래처명, 전일 폐사수, 당일 폐사수, 증가량
  - 증가량 기준 내림차순 정렬
  - 빨간 테두리 카드로 시각적 경고
- 알림 없을 시 "모든 계군의 폐사가 정상 범위입니다" 메시지 표시
- 기존 KPI 카드 및 빠른 기록 입력 영역 유지

### 2-3. 거래처 목록 화면 개선

기존 항목에 추가로 표시:

| 표시 항목 | 설명 |
|---|---|
| 거래처명 | 기존 |
| 농장명 | 기존 |
| 지역 | 기존 |
| 담당자 | 기존 |
| **운영 계군 수** | 신규 - Active 상태 계군 수 |
| **최근 입력일** | 신규 - 해당 거래처의 가장 최근 daily_records 날짜 |
| 상태 | 기존 (Active/Inactive 뱃지) |

### 2-4. 거래처 상세 화면 개선

기존 거래처 기본 정보 + 계군 목록에 추가:

| 섹션 | 내용 |
|---|---|
| **거래처 기본 정보** | 기존 유지 (지역, 담당자, 연락처, 상태, 계군 수) |
| **최근 7일 주요 지표** | 평균 HD%, 평균 HH%, 총 폐사수, 총 산란수 (4개 카드) |
| **최근 일별 기록** | 날짜, 계군, 폐사, 산란수, HD% 테이블 (최근 10건) |
| **리포트 보기 버튼** | `/reports/{customerId}`로 이동 |
| **계군 목록** | 기존 유지 |

---

## 3. 수정된 파일 목록

| 파일 | 변경 내용 |
|---|---|
| `src/app/login/page.tsx` | 권한 선택 UI, @sunjin.com 안내, 한/영 병기 |
| `src/app/login/actions.ts` | @sunjin.com 검증, 권한 전달 |
| `src/components/Navbar.tsx` | 대시보드 → 폐사 증가 알림 탭 변경 |
| `src/app/page.tsx` | 폐사 증가 데이터 조회 로직 추가 |
| `src/app/DashboardContent.tsx` | 폐사 증가 알림 섹션 UI 추가 |
| `src/app/customers/page.tsx` | 운영 계군 수, 최근 입력일 데이터 조회 |
| `src/app/customers/CustomersContent.tsx` | 운영 계군 수, 최근 입력일 표시 |
| `src/app/customers/[id]/page.tsx` | 최근 7일 기록 조회 |
| `src/app/customers/[id]/CustomerDetailContent.tsx` | 7일 지표, 일별 기록 테이블, 리포트 버튼 추가 |
| `src/lib/i18n/en.ts` | 영어 번역 키 추가 |
| `src/lib/i18n/ko.ts` | 한국어 번역 키 추가 |
| `supabase/schema.sql` | handle_new_user() 트리거 수정 |

---

## 4. 배포 후 필요 작업

| 작업 | 상태 |
|---|---|
| Supabase SQL Editor에서 `handle_new_user()` 트리거 업데이트 실행 | 필요 |
| Supabase Authentication > URL Configuration에서 Site URL을 배포 URL로 변경 | 필요 |
| Supabase Authentication > Users에서 `jmyeo@sunjin.com` 계정 삭제 | 필요 |
