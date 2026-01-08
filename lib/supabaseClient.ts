
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '../config';

// Fix: Cast supabaseUrl and supabaseAnonKey to string to allow comparison with placeholder strings and avoid literal type overlap errors.
const isConfigured = (supabaseUrl as string) !== 'YOUR_SUPABASE_URL' && (supabaseAnonKey as string) !== 'YOUR_SUPABASE_ANON_KEY';

let supabase: SupabaseClient | null = null;

if (isConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("Error al inicializar el cliente de Supabase. Por favor, verifique sus credenciales en config.ts.", error);
  }
} else {
    // Este mensaje solo aparecerá en la consola del desarrollador si la app no está configurada.
    console.warn("Supabase no está configurado. Por favor, agregue sus credenciales al archivo config.ts.");
}

export { supabase, isConfigured };
