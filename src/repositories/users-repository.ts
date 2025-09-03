import {
  getSupabaseServerClient,
  getSupabaseClient,
} from '@/lib/utils/auth-util';

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
  const { error } = await supabase.from('users').insert({
    user_id: userId,
    email,
    username,
    full_name: fullName ?? undefined,
    age,
  } as any);
  if (error) throw error;
};

export const loginUser = async ({
  emailOrUsername,
  password,
}: LoginUserParams) => {
  const supabase = getSupabaseClient();

  // First, try to find user by email or username in the users table
  const { data: userData, error: userError } = (await supabase
    .from('users')
    .select('email, username')
    .or(`email.eq.${emailOrUsername},username.eq.${emailOrUsername}`)
    .single()) as {
    data: { email: string; username: string } | null;
    error: any;
  };

  if (userError || !userData) {
    throw new Error('User not found');
  }

  // Use the email for Supabase Auth login
  const { data, error } = await supabase.auth.signInWithPassword({
    email: userData.email,
    password,
  });

  if (error) throw error;
  return data;
};

export const logoutUser = async () => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
