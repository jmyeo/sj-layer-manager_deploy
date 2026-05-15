'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const VALID_ROLES = ['Admin', 'Manager', 'Consultant', 'Farm User'] as const;

function isValidSunjinEmail(email: string): boolean {
  return email.toLowerCase().endsWith('@sunjin.com');
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!isValidSunjinEmail(email)) {
    return { error: '@sunjin.com 이메일 주소만 로그인할 수 있습니다.' };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  const role = formData.get('role') as string;

  if (!isValidSunjinEmail(email)) {
    return { error: '@sunjin.com 이메일 주소만 회원가입할 수 있습니다.' };
  }

  if (!VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
    return { error: '유효하지 않은 권한입니다.' };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password: formData.get('password') as string,
    options: {
      data: {
        name,
        role,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: '이메일을 확인하여 계정을 인증해 주세요.' };
}
