// API and service types

import { PaginatedResponse } from '../shared';
import { DictionaryWord, DictionaryCategory } from '../dictionary';

export interface RegisterUserRequest {
  fullName: string;
  age: string;
  email: string;
  username: string;
  password: string;
}

export interface RegisterUserResponse {
  user: {
    id: string;
    username: string;
    email: string;
  };
  message: string;
}

export interface LoginUserRequest {
  username: string;
  password: string;
}

export interface LoginUserResponse {
  user: {
    id: string;
    username: string;
    email: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface DuplicateCheckRequest {
  field: 'username' | 'email';
  value: string;
}

export interface DuplicateCheckResponse {
  isDuplicate: boolean;
  message?: string;
}

export interface GetUserProgressRequest {
  userId: string;
}

export interface UpdateUserProgressRequest {
  userId: string;
  levelId: number;
  progress: number;
  lastIndex: number;
}

export interface GetDictionaryDataRequest {
  categoryId?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export interface GetDictionaryDataResponse
  extends PaginatedResponse<DictionaryWord> {
  categories: DictionaryCategory[];
}

// Re-export for convenience
export type { DictionaryWord, DictionaryCategory } from '../dictionary';
