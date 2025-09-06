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

export const checkUserExists = async (email: string, username: string) => {
  const supabase = await createServerClient();

  // Check if email or username already exists
  const { data, error } = await supabase
    .from('users')
    .select('email, username')
    .or(`email.eq.${email},username.eq.${username}`)
    .limit(2);

  if (error) throw error;

  const existingEmail = data?.find(user => user.email === email);
  const existingUsername = data?.find(user => user.username === username);

  return {
    emailExists: !!existingEmail,
    usernameExists: !!existingUsername,
    existingEmail: existingEmail?.email,
    existingUsername: existingUsername?.username,
  };
};

// Client-side version for use in client components
export const checkUserExistsClient = async (
  email: string,
  username: string
) => {
  const { createClient } = await import('@/lib/supabase/client');
  const supabase = createClient();

  // Check if email or username already exists
  const { data, error } = await supabase
    .from('users')
    .select('email, username')
    .or(`email.eq.${email},username.eq.${username}`)
    .limit(2);

  if (error) throw error;

  const existingEmail = data?.find(user => user.email === email);
  const existingUsername = data?.find(user => user.username === username);

  return {
    emailExists: !!existingEmail,
    usernameExists: !!existingUsername,
    existingEmail: existingEmail?.email,
    existingUsername: existingUsername?.username,
  };
};
