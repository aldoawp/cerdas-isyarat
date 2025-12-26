import { createClient } from '@/lib/supabase/client';

/**
 * Warning log data structure matching the database schema
 */
export interface WarningLog {
  warning_id: string;
  warning_code: string | null;
  warning_message: string;
  module: string | null;
  occurred_at: string;
}

/**
 * Input data for creating a new warning log
 */
export interface CreateWarningLogInput {
  warning_code?: string;
  warning_message: string;
  module?: string;
}

/**
 * Inserts a new warning log into the database
 * @param input - The warning log data to insert
 * @returns Promise<WarningLog> - The created warning log with generated warning_id and occurred_at
 * @throws Error if the insert operation fails
 */
export const insertWarningLog = async (
  input: CreateWarningLogInput
): Promise<WarningLog> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('warning_logs')
    .insert({
      warning_code: input.warning_code,
      warning_message: input.warning_message,
      module: input.module,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to insert warning log: ${error.message}`);
  }

  return data;
};

/**
 * Inserts multiple warning logs into the database
 * @param inputs - Array of warning log data to insert
 * @returns Promise<WarningLog[]> - Array of created warning logs
 * @throws Error if the insert operation fails
 */
export const insertWarningLogs = async (
  inputs: CreateWarningLogInput[]
): Promise<WarningLog[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('warning_logs')
    .insert(
      inputs.map(input => ({
        warning_code: input.warning_code,
        warning_message: input.warning_message,
        module: input.module,
      }))
    )
    .select();

  if (error) {
    throw new Error(`Failed to insert warning logs: ${error.message}`);
  }

  return data;
};
