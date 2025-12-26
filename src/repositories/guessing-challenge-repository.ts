import { createClient } from '@/lib/supabase/client';
import { Movement } from '@/types';

/**
 * Database movement structure matching the Supabase schema
 */
export interface DbMovement {
  id: number;
  name: string;
  image_url: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches all movements from the database
 * @returns Promise<Movement[]> - Array of movements for the guessing game
 * @throws Error if the fetch operation fails
 */
export const getAllMovements = async (): Promise<Movement[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('guessing_challenge_questions')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch movements: ${error.message}`);
  }

  // Transform database structure to Movement type
  return (data || []).map((movement: DbMovement) => ({
    id: movement.id,
    name: movement.name,
    imageUrl: movement.image_url,
    description: movement.description || undefined,
  }));
};

/**
 * Fetches a single movement by ID
 * @param id - The movement ID
 * @returns Promise<Movement | undefined> - The movement or undefined if not found
 * @throws Error if the fetch operation fails
 */
export const getMovementById = async (
  id: number
): Promise<Movement | undefined> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('guessing_challenge_questions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return undefined;
    }
    throw new Error(`Failed to fetch movement: ${error.message}`);
  }

  if (!data) return undefined;

  return {
    id: data.id,
    name: data.name,
    imageUrl: data.image_url,
    description: data.description || undefined,
  };
};

/**
 * Fetches movements by category (if you add category column later)
 * @param category - The category name
 * @returns Promise<Movement[]> - Array of movements in the category
 * @throws Error if the fetch operation fails
 */
export const getMovementsByCategory = async (
  category: string
): Promise<Movement[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('guessing_challenge_questions')
    .select('*')
    .eq('category', category)
    .order('id', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch movements by category: ${error.message}`);
  }

  return (data || []).map((movement: DbMovement) => ({
    id: movement.id,
    name: movement.name,
    imageUrl: movement.image_url,
    description: movement.description || undefined,
  }));
};
