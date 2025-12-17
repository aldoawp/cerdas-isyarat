/**
 * Utility functions untuk handle Supabase queries dengan safe error handling
 */

import { PostgrestError } from '@supabase/supabase-js';

/**
 * Check if error is "no rows found" error
 */
export const isNoRowsError = (error: PostgrestError | null): boolean => {
  return error?.code === 'PGRST116';
};

/**
 * Check if error is a real error (not just "no rows found")
 */
export const isRealError = (error: PostgrestError | null): boolean => {
  return error !== null && !isNoRowsError(error);
};

/**
 * Safe wrapper untuk .single() queries
 * Returns null if no rows found, throws only for real errors
 */
export const safeSingle = <T>(result: {
  data: T | null;
  error: PostgrestError | null;
}): T | null => {
  if (isRealError(result.error)) {
    throw result.error;
  }
  return result.data;
};

/**
 * Safe wrapper untuk .maybeSingle() queries
 * Same as safeSingle but more explicit
 */
export const safeMaybeSingle = <T>(result: {
  data: T | null;
  error: PostgrestError | null;
}): T | null => {
  if (isRealError(result.error)) {
    throw result.error;
  }
  return result.data;
};

/**
 * Safe wrapper untuk array queries
 * Returns empty array if error, throws only for real errors
 */
export const safeArray = <T>(result: {
  data: T[] | null;
  error: PostgrestError | null;
}): T[] => {
  if (isRealError(result.error)) {
    throw result.error;
  }
  return result.data || [];
};

/**
 * Type-safe error logger
 */
export const logSupabaseError = (
  operation: string,
  error: PostgrestError | null
): void => {
  if (error && !isNoRowsError(error)) {
    console.error(`Supabase ${operation} error:`, {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
  }
};

/**
 * Example usage:
 *
 * // Instead of:
 * const { data, error } = await supabase
 *   .from('table')
 *   .select('*')
 *   .eq('id', id)
 *   .single();
 *
 * if (error) {
 *   if (error.code === 'PGRST116') return null;
 *   throw error;
 * }
 *
 * // Use:
 * const result = await supabase
 *   .from('table')
 *   .select('*')
 *   .eq('id', id)
 *   .maybeSingle();
 *
 * return safeMaybeSingle(result);
 */
