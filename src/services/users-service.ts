import {
  createAuthUser,
  insertUserProfile,
  checkUserExists,
  checkUserExistsClient,
} from '@/repositories/users-repository';
import { createUserProgressServer } from '@/repositories/users-progress-repository-server';
import { insertEventLog } from '@/repositories/event-log-repository';
import { UserRegistration } from '@/types';
import { logServiceError, logCriticalError } from '@/lib/utils/error-logger';

// Imports dari Code 2 (Untuk Logic Avatar & Direct Supabase)
import { createClient } from '@/lib/supabase/client';

export interface RegisterResult {
  userId: string;
  email: string;
  username: string;
}

export interface DuplicateCheckResult {
  emailExists: boolean;
  usernameExists: boolean;
  existingEmail?: string;
  existingUsername?: string;
}

export interface UserAvatar {
  avatar_id: string;
  name: string;
  image_url: string;
  is_default: boolean;
  display_order: number;
}

export const checkUserDuplicates = async (
  email: string,
  username: string
): Promise<DuplicateCheckResult> => {
  try {
    const result = await checkUserExists(email, username);
    return result;
  } catch (error) {
    console.error('Error checking user duplicates:', error);
    await logServiceError(error, 'users-service');
    throw new Error('Failed to check user duplicates');
  }
};

export const checkUserDuplicatesClient = async (
  email: string,
  username: string
): Promise<DuplicateCheckResult> => {
  try {
    const result = await checkUserExistsClient(email, username);
    return result;
  } catch (error) {
    console.error('Error checking user duplicates:', error);
    await logServiceError(error, 'users-service');
    throw new Error('Failed to check user duplicates');
  }
};

export const registerUser = async (
  payload: UserRegistration
): Promise<RegisterResult> => {
  try {
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

    const userProgress = await createUserProgressServer({
      userId,
      explorationLevel: 1,
      explorationProgress: 0,
      guessingChallengeScore: 0,
    });

    if (!userProgress) {
      throw new Error('Failed to initialize user progress');
    }

    console.log('User registration completed successfully:', {
      userId,
      email: payload.email,
      username: payload.username,
      progressId: userProgress.progress_id,
    });

    // Log registration event
    try {
      await insertEventLog({
        event_type: 'authentication',
        event_name: 'user_registration',
        description: 'New user registered successfully',
        actor_type: 'user',
        actor_id: userId,
      });
    } catch (logError) {
      // Don't block registration if event logging fails
      console.error('Failed to log registration event:', logError);
    }

    return { userId, email: payload.email, username: payload.username };
  } catch (error) {
    console.error('Registration error:', error);
    // Log critical registration error
    await logCriticalError(error, {
      module: 'users-service',
      errorCode: 'REGISTRATION_FAILED',
      additionalContext: { email: payload.email, username: payload.username },
    });
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Registration failed. Please try again.');
  }
};

export const getAllAvatars = async (): Promise<UserAvatar[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('avatars')
    .select(
      `
      avatar_id,
      name,
      is_default,
      display_order,
      image_asset_id,
      assets ( url )
    `
    )
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Failed to fetch avatars:', error);
    return [];
  }

  return data.map((item: any) => ({
    avatar_id: item.avatar_id,
    name: item.name,
    is_default: item.is_default,
    display_order: item.display_order,
    image_url: item.assets?.url || '',
  }));
};

export const updateUserAvatar = async (
  userId: string,
  avatarId: string
): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from('users')
    .update({ avatar_id: avatarId })
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to update user avatar: ${error.message}`);
  }
};

export const getUserAvatar = async (
  userId: string
): Promise<UserAvatar | undefined> => {
  const supabase = createClient();

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('avatar_id')
    .eq('user_id', userId)
    .single();

  if (userError) return undefined;

  let targetAvatarId = userData?.avatar_id;

  if (!targetAvatarId) {
    const { data: defaultAvatar } = await supabase
      .from('avatars')
      .select('avatar_id')
      .eq('is_default', true)
      .limit(1)
      .single();

    if (defaultAvatar) {
      targetAvatarId = defaultAvatar.avatar_id;
    } else {
      return undefined;
    }
  }

  // 3. Ambil detail avatar
  const { data: avatarData, error: avatarError } = await supabase
    .from('avatars')
    .select(
      `
      avatar_id,
      name,
      is_default,
      display_order,
      assets ( url )
    `
    )
    .eq('avatar_id', targetAvatarId)
    .single();

  if (avatarError || !avatarData) {
    return undefined;
  }

  return {
    avatar_id: avatarData.avatar_id,
    name: avatarData.name,
    is_default: avatarData.is_default,
    display_order: avatarData.display_order,
    image_url: (avatarData.assets as any)?.url || '',
  };
};
