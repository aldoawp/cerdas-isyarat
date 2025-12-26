import { createClient } from '@/lib/supabase/client';

/**
 * Error log data structure matching the database schema
 */
export interface ErrorLog {
  error_id: string;
  error_code: string | null;
  error_message: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | null;
  stack_trace: string | null;
  module: string | null;
  line_number: number | null;
  actor_id: string | null;
  occurred_at: string;
}

/**
 * Input data for creating a new error log
 */
export interface CreateErrorLogInput {
  error_code?: string;
  error_message: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  stack_trace?: string;
  module?: string;
  line_number?: number;
  actor_id?: string;
}

/**
 * Inserts a new error log into the database
 * @param input - The error log data to insert
 * @returns Promise<ErrorLog> - The created error log with generated error_id and occurred_at
 * @throws Error if the insert operation fails
 */
export const insertErrorLog = async (
  input: CreateErrorLogInput
): Promise<ErrorLog> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('error_logs')
    .insert({
      error_code: input.error_code,
      error_message: input.error_message,
      severity: input.severity,
      stack_trace: input.stack_trace,
      module: input.module,
      line_number: input.line_number,
      actor_id: input.actor_id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to insert error log: ${error.message}`);
  }

  return data;
};

/**
 * Inserts multiple error logs into the database
 * @param inputs - Array of error log data to insert
 * @returns Promise<ErrorLog[]> - Array of created error logs
 * @throws Error if the insert operation fails
 */
export const insertErrorLogs = async (
  inputs: CreateErrorLogInput[]
): Promise<ErrorLog[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('error_logs')
    .insert(
      inputs.map(input => ({
        error_code: input.error_code,
        error_message: input.error_message,
        severity: input.severity,
        stack_trace: input.stack_trace,
        module: input.module,
        line_number: input.line_number,
        actor_id: input.actor_id,
      }))
    )
    .select();

  if (error) {
    throw new Error(`Failed to insert error logs: ${error.message}`);
  }

  return data;
};
