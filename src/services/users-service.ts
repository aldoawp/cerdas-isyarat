import {
  createAuthUser,
  insertUserProfile,
  loginUser,
  logoutUser,
} from '@/repositories/users-repository';
import { FormDataState } from '@/types/forms';
import { getSupabaseClient } from '@/lib/utils/auth-util';

export interface RegisterResult {
  userId: string;
  email: string;
  username: string;
}

export interface LoginUserResult {
  id: string;
  email: string;
  username: string;
}

export const registerUser = async (
  payload: FormDataState
): Promise<RegisterResult> => {
  const auth = await createAuthUser({
    email: payload.email,
    password: payload.password,
  });
  const userId = auth.user?.id;
  if (!userId) {
    throw new Error('Failed to create auth user: missing user id');
  }

  await insertUserProfile({
    userId,
    email: payload.email,
    username: payload.username,
    fullName: payload.fullName,
    age: payload.age,
  });

  return { userId, email: payload.email, username: payload.username };
};

export const authenticateUser = async (
  emailOrUsername: string,
  password: string
): Promise<LoginUserResult> => {
  const authData = await loginUser({ emailOrUsername, password });

  if (!authData.user) {
    throw new Error('Authentication failed: no user data returned');
  }

  // Get user profile from users table
  const supabase = getSupabaseClient();
  const { data: userProfile, error } = (await supabase
    .from('users')
    .select('username, email')
    .eq('user_id', authData.user.id)
    .single()) as {
    data: { username: string; email: string } | null;
    error: any;
  };

  if (error || !userProfile) {
    throw new Error('Failed to fetch user profile');
  }

  return {
    id: authData.user.id,
    email: userProfile.email,
    username: userProfile.username,
  };
};

export const logoutUserService = async (): Promise<void> => {
  await logoutUser();
};
