import { getSupabaseServerClient } from '@/lib/utils/auth-util';

export interface CreateAuthUserParams {
  email: string;
  password: string;
}

export interface InsertUserProfileParams {
  userId: string;
  email: string;
  username: string;
  fullName?: string;
  age?: string;
}

export interface LoginUserParams {
  emailOrUsername: string;
  password: string;
}

export const createAuthUser = async ({
  email,
  password,
}: CreateAuthUserParams) => {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
};

export const insertUserProfile = async ({
  userId,
  email,
  username,
  fullName,
  age,
}: InsertUserProfileParams) => {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from('users').insert([
    {
      user_id: userId,
      email,
      username,
      full_name: fullName ?? undefined,
      age,
      password: 'encrypted-by-auth',
    },
  ] as any);
  if (error) throw error;
};
