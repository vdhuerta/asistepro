import { createClient } from '@supabase/supabase-js';

// -----------------------------------------------------------------------------
// IMPORTANTE: Reemplaza estos valores con la URL y la clave anónima de tu proyecto de Supabase.
// Puedes encontrarlos en la sección "API" de la configuración de tu proyecto en supabase.com.
// -----------------------------------------------------------------------------
const supabaseUrl = 'https://aqxemlmtzobiuesqokmy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxeGVtbG10em9iaXVlc3Fva215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0Mjk4MjQsImV4cCI6MjA3NjAwNTgyNH0.qONWXtkGGxZPSeGUIC1u3On_YY0kjRUZH12aZVnYkxA';
// -----------------------------------------------------------------------------

if (supabaseUrl === 'https://aqxemlmtzobiuesqokmy.supabase.co' || supabaseAnonKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxeGVtbG10em9iaXVlc3Fva215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0Mjk4MjQsImV4cCI6MjA3NjAwNTgyNH0.qONWXtkGGxZPSeGUIC1u3On_YY0kjRUZH12aZVnYkxA') {
    const warningStyle = 'color: red; font-size: 16px; font-weight: bold;';
    console.warn('%c¡ATENCIÓN! Las credenciales de Supabase no están configuradas.', warningStyle);
    console.warn('Por favor, edita el archivo `lib/supabaseClient.ts` y añade la URL y la clave anónima de tu proyecto.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
