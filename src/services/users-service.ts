import {
  createAuthUser,
  insertUserProfile,
  checkUserExists,
  checkUserExistsClient,
} from '@/repositories/users-repository';
import { createUserProgressServer } from '@/repositories/users-progress-repository-server';
import { UserRegistration } from '@/types';

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

export const checkUserDuplicates = async (
  email: string,
  username: string
): Promise<DuplicateCheckResult> => {
  try {
    const result = await checkUserExists(email, username);
    return result;
  } catch (error) {
    console.error('Error checking user duplicates:', error);
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
    throw new Error('Failed to check user duplicates');
  }
};

export const registerUser = async (
  payload: UserRegistration
): Promise<RegisterResult> => {
  try {
    // Create authentication user
    const auth = await createAuthUser({
      email: payload.email,
      password: payload.password,
    });
    const userId = auth.user?.id;
    if (!userId) {
      throw new Error('Failed to create auth user: missing user id');
    }

    // Insert user profile into users table
    await insertUserProfile({
      userId,
      email: payload.email,
      username: payload.username,
      fullName: payload.fullName,
      age: payload.age,
    });

    // Initialize user progress with default values
    const userProgress = await createUserProgressServer({
      userId,
      explorationLevel: 1,
      explorationProgress: 0,
      guessingChallengeScore: 0,
    });

    // Verify that user progress was created successfully
    if (!userProgress) {
      throw new Error('Failed to initialize user progress');
    }

    console.log('User registration completed successfully:', {
      userId,
      email: payload.email,
      username: payload.username,
      progressId: userProgress.progress_id,
    });

    return { userId, email: payload.email, username: payload.username };
  } catch (error) {
    // Log the error for debugging
    console.error('Registration error:', error);

    // Re-throw with a more user-friendly message if needed
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Registration failed. Please try again.');
  }
};
