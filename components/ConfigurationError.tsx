import React from 'react';
import { NeumorphicCard } from './UI';

const ConfigurationError: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-slate-100 flex items-center justify-center p-4 z-[200]">
      <NeumorphicCard className="w-full max-w-lg bg-red-50 p-8">
         <div className="w-16 h-16 bg-red-200 rounded-full mx-auto flex items-center justify-center mb-4 shadow-[inset_3px_3px_6px_#d1c7c8,inset_-3px_-3px_6px_#ffffff]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
        <h2 className="text-2xl font-bold text-red-800 mb-2 text-center">Configuración Requerida</h2>
        <p className="text-gray-700 text-center mb-6">
          La aplicación no se puede iniciar porque no se han proporcionado las credenciales de Supabase.
        </p>
        <div className="bg-slate-50/80 p-4 rounded-lg shadow-[inset_3px_3px_6px_#c7ced4,inset_-3px_-3px_6px_#ffffff]">
            <p className="text-sm text-gray-800">
                Por favor, edite el archivo <code className="font-mono bg-slate-200 p-1 rounded">config.ts</code> y reemplace los valores de ejemplo con su URL y clave anónima (anon key) de Supabase.
            </p>
            <pre className="mt-4 text-xs bg-slate-800 text-white p-3 rounded-lg overflow-x-auto">
{`// En el archivo config.ts

export const supabaseUrl = 'URL_DE_TU_PROYECTO';
export const supabaseAnonKey = 'TU_ANON_KEY';
`}
            </pre>
        </div>
         <div className="text-center mt-6 text-xs text-gray-500">
            <p>Encontrará estas credenciales en su proyecto de Supabase, en la sección:</p>
            <p className="font-semibold">Project Settings &gt; API</p>
         </div>
      </NeumorphicCard>
    </div>
  );
};

export default ConfigurationError;
