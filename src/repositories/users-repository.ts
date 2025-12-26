import { createClient as createServerClient } from '@/lib/supabase/server';
import { logCriticalError, logDatabaseError } from '@/lib/utils/error-logger';

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
  if (error) {
    await logCriticalError(error, {
      module: 'users-repository',
      errorCode: 'AUTH_USER_CREATION_FAILED',
      additionalContext: { email },
    });
    throw error;
  }
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
  if (error) {
    await logCriticalError(error, {
      module: 'users-repository',
      errorCode: 'USER_PROFILE_INSERT_FAILED',
      userId,
      additionalContext: { email, username },
    });
    throw error;
  }
};

export const checkUserExists = async (email: string, username: string) => {
  const supabase = await createServerClient();

  // Check if email or username already exists
  const { data, error } = await supabase
    .from('users')
    .select('email, username')
    .or(`email.eq.${email},username.eq.${username}`)
    .limit(2);

  if (error) {
    await logDatabaseError(error, {
      module: 'users-repository',
      errorCode: 'USER_EXISTS_CHECK_FAILED',
    });
    throw error;
  }

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

  if (error) {
    await logDatabaseError(error, {
      module: 'users-repository',
      errorCode: 'USER_EXISTS_CHECK_FAILED',
    });
    throw error;
  }

  const existingEmail = data?.find(user => user.email === email);
  const existingUsername = data?.find(user => user.username === username);

  return {
    emailExists: !!existingEmail,
    usernameExists: !!existingUsername,
    existingEmail: existingEmail?.email,
    existingUsername: existingUsername?.username,
  };
};
