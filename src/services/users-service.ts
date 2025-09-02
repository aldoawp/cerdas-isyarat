import {
  createAuthUser,
  insertUserProfile,
} from '@/repositories/users-repository';
import { FormDataState } from '@/types/forms';

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
