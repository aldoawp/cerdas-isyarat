import { createClient } from '@supabase/supabase-js';

type SupabaseClientType = ReturnType<typeof createClient>;

// Singleton instances to prevent multiple client creation
let serverClientInstance: SupabaseClientType | undefined = undefined;
let clientInstance: SupabaseClientType | undefined = undefined;

export const getSupabaseServerClient = (): SupabaseClientType => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase environment variables are not set');
  }

  // Return existing instance if available
  if (serverClientInstance) {
    return serverClientInstance;
  }

  // Create new instance only if none exists
  serverClientInstance = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return serverClientInstance;
};

export const getSupabaseClient = (): SupabaseClientType => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase environment variables are not set');
  }

  // Return existing instance if available
  if (clientInstance) {
    return clientInstance;
  }

  // Create new instance only if none exists
  clientInstance = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return clientInstance;
};

export const getCurrentSession = async () => {
  const supabase = getSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    return undefined;
  }

  return session;
};

export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getCurrentSession();
  return !!session;
};
