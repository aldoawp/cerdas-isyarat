import { createClient as createServerClient } from '@/lib/supabase/server';

export interface CreateAuthUserParams {
  email: string;
  password: string;
}

export interface InsertUserProfileParams {
  userId: string;
  email: string;
  username: string;
  fullName?: string;
  age: string;
}

export const createAuthUser = async ({
  email,
  password,
}: CreateAuthUserParams) => {
  const supabase = await createServerClient();
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
  const supabase = await createServerClient();
  const { error } = await supabase.from('users').insert({
    user_id: userId,
    email,
    username,
    full_name: fullName ?? undefined,
    age,
  } as any);
  if (error) throw error;
};
