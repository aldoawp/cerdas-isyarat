// User domain types

export interface User {
  id: string;
  fullName: string;
  age: string;
  username: string;
  email: string;
  created_at: string;
  updated_at?: string;
}

export interface UserRegistration {
  fullName: string;
  age: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface UserProgress {
  userId: string;
  completedLevelIds: number[];
  learningProgress: Record<number, LevelProgress>;
}

export interface LevelProgress {
  progress: number; // Percentage (0-100)
  lastIndex: number; // Last material index viewed
  completedAt?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export interface UserSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}
