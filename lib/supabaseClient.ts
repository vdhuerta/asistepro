import { createClient } from '@supabase/supabase-js';

// -----------------------------------------------------------------------------
// IMPORTANTE: Reemplaza estos valores con la URL y la clave anónima de tu proyecto de Supabase.
// Puedes encontrarlos en la sección "API" de la configuración de tu proyecto en supabase.com.
// -----------------------------------------------------------------------------
const supabaseUrl = 'https://ahmrgkgukcateadicrhw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobXJna2d1a2NhdGVhZGljcmh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDQ4NDEsImV4cCI6MjA3NDQ4MDg0MX0.yxBYLSbvqT0SzXX2CMOA-uTnTtlpHmlLRpv0T5uYUH8';
// -----------------------------------------------------------------------------

if (supabaseUrl === 'https://ahmrgkgukcateadicrhw.supabase.co' || supabaseAnonKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobXJna2d1a2NhdGVhZGljcmh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDQ4NDEsImV4cCI6MjA3NDQ4MDg0MX0.yxBYLSbvqT0SzXX2CMOA-uTnTtlpHmlLRpv0T5uYUH8') {
    const warningStyle = 'color: red; font-size: 16px; font-weight: bold;';
    console.warn('%c¡ATENCIÓN! Las credenciales de Supabase no están configuradas.', warningStyle);
    console.warn('Por favor, edita el archivo `lib/supabaseClient.ts` y añade la URL y la clave anónima de tu proyecto.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
