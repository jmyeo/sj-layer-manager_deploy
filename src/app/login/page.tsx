'use client';

import { useState } from 'react';
import { login, signup } from './actions';

const ROLE_OPTIONS = [
  {
    value: 'Admin',
    label: '관리자',
    description: '거래처 등록, 사용자 관리, 전체 데이터 조회',
  },
  {
    value: 'Farm User',
    label: '필리핀 현장 담당자',
    description: '일별 사육/생산 데이터 입력',
  },
  {
    value: 'Consultant',
    label: '컨설턴트/영업 담당자',
    description: '거래처별 생산성 리포트 조회',
  },
  {
    value: 'Manager',
    label: '경영진/관리자',
    description: '전체 사업장 성과 모니터링',
  },
] as const;

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Farm User');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      if (isSignUp) {
        const result = await signup(formData);
        if (result?.error) {
          setError(result.error);
        } else if (result?.success) {
          setSuccess(result.success);
        }
      } else {
        const result = await login(formData);
        if (result?.error) {
          setError(result.error);
        }
      }
    } catch {
      // redirect throws, which is expected on successful login
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sunjin Layer PM</h1>
          <p className="text-sm text-muted mt-1">Layer Farm Performance Manager</p>
        </div>

        {/* Email domain notice */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 mb-4">
          @sunjin.com 이메일 주소만 사용 가능합니다.
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={isSignUp}
                  className="w-full px-4 py-3 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="이름을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  권한 선택
                </label>
                <input type="hidden" name="role" value={selectedRole} />
                <div className="space-y-2">
                  {ROLE_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                        selectedRole === option.value
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role_radio"
                        value={option.value}
                        checked={selectedRole === option.value}
                        onChange={() => setSelectedRole(option.value)}
                        className="mt-0.5 accent-primary"
                      />
                      <div>
                        <span className="text-sm font-semibold text-gray-900">
                          {option.label}
                        </span>
                        <p className="text-xs text-muted mt-0.5">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="example@sunjin.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full px-4 py-3 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="6자리 이상"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setSuccess('');
            }}
            className="text-sm text-primary font-medium hover:underline"
          >
            {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
          </button>
        </div>
      </div>
    </div>
  );
}
