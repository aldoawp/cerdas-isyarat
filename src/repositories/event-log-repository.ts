import { createClient } from '@/lib/supabase/client';

/**
 * Event log data structure matching the database schema
 */
export interface EventLog {
  event_id: string;
  event_type: string;
  event_name: string;
  description: string | null;
  actor_type: 'user' | 'system' | 'service' | null;
  actor_id: string | null;
  created_at: string;
}

/**
 * Input data for creating a new event log
 */
export interface CreateEventLogInput {
  event_type: string;
  event_name: string;
  description?: string;
  actor_type?: 'user' | 'system' | 'service';
  actor_id?: string;
}

/**
 * Inserts a new event log into the database
 * @param input - The event log data to insert
 * @returns Promise<EventLog> - The created event log with generated event_id and created_at
 * @throws Error if the insert operation fails
 */
export const insertEventLog = async (
  input: CreateEventLogInput
): Promise<EventLog> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('event_logs')
    .insert({
      event_type: input.event_type,
      event_name: input.event_name,
      description: input.description,
      actor_type: input.actor_type,
      actor_id: input.actor_id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to insert event log: ${error.message}`);
  }

  return data;
};

/**
 * Inserts multiple event logs into the database
 * @param inputs - Array of event log data to insert
 * @returns Promise<EventLog[]> - Array of created event logs
 * @throws Error if the insert operation fails
 */
export const insertEventLogs = async (
  inputs: CreateEventLogInput[]
): Promise<EventLog[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('event_logs')
    .insert(
      inputs.map(input => ({
        event_type: input.event_type,
        event_name: input.event_name,
        description: input.description,
        actor_type: input.actor_type,
        actor_id: input.actor_id,
      }))
    )
    .select();

  if (error) {
    throw new Error(`Failed to insert event logs: ${error.message}`);
  }

  return data;
};
