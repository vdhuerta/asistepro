import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { NeumorphicCard, NeumorphicButton } from './UI';

interface VerificationPageProps {
  verificationId: string;
}

interface VerificationRecord {
  nombre_curso: string;
  lugar_curso: string;
  ofertante_curso: string;
  encargado_curso: string | null;
  fecha_generacion_reporte: string;
  participantes_registrados: number;
}

const VerificationPage: React.FC<VerificationPageProps> = ({ verificationId }) => {
  const [record, setRecord] = useState<VerificationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVerificationRecord = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('reporte_verificaciones')
          .select('*')
          .eq('id', verificationId)
          .single();

        if (error) {
            if (error.message && (error.message.includes("Could not find the table 'public.reporte_verificaciones'") || error.message.includes("relation \"public.reporte_verificaciones\" does not exist"))) {
                throw new Error("La funcionalidad de verificación no está configurada correctamente. Por favor, contacte al administrador del sistema.");
            }
            if (error.code === 'PGRST116') {
                throw new Error('El código de verificación no es válido o el reporte no fue encontrado.');
            }
            throw new Error('Error al contactar la base de datos.');
        }
        
        if (data) {
          setRecord(data);
        } else {
            // This case is usually covered by PGRST116, but serves as a fallback.
            throw new Error('No se encontró un registro con el ID proporcionado.');
        }

      } catch (err: any) {
        setError(err.message || 'Ocurrió un error inesperado durante la verificación.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVerificationRecord();
  }, [verificationId]);

  const handleGoHome = () => {
    window.location.href = window.location.origin + window.location.pathname;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderContent = () => {
    if (loading) {
      return <p className="text-xl font-semibold text-gray-700 animate-pulse">Verificando reporte...</p>;
    }

    if (error) {
      return (
        <NeumorphicCard className="w-full max-w-lg text-center bg-red-50 p-8">
            <div className="w-16 h-16 bg-red-200 rounded-full mx-auto flex items-center justify-center mb-4 shadow-[inset_3px_3px_6px_#d1c7c8,inset_-3px_-3px_6px_#ffffff]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
          <h2 className="text-2xl font-bold text-red-700 mb-2">Reporte Inválido</h2>
          <p className="text-red-600">{error}</p>
        </NeumorphicCard>
      );
    }

    if (record) {
      return (
        <NeumorphicCard className="w-full max-w-lg bg-green-50 p-8 pt-16 relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-green-50 rounded-full p-2 shadow-[5px_5px_10px_#c7d4c8,-5px_-5px_10px_#ffffff] flex items-center justify-center">
            <img
              src="https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Logo%20UAD%20Redondo.png"
              alt="Logo UAD"
              className="w-full h-full rounded-full"
            />
          </div>
          <div className="w-16 h-16 bg-green-200 rounded-full mx-auto flex items-center justify-center mb-4 shadow-[inset_3px_3px_6px_#c7d4c8,inset_-3px_-3px_6px_#ffffff]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-4 text-center">✅ Reporte Válido</h2>
          <div className="space-y-3 text-left text-gray-700">
            <p><strong className="font-semibold text-gray-800">Curso:</strong> {record.nombre_curso}</p>
            <p><strong className="font-semibold text-gray-800">Lugar:</strong> {record.lugar_curso}</p>
            <p><strong className="font-semibold text-gray-800">Ofertante:</strong> {record.ofertante_curso}</p>
            {record.encargado_curso && <p><strong className="font-semibold text-gray-800">Encargado:</strong> {record.encargado_curso}</p>}
            <p><strong className="font-semibold text-gray-800">Fecha de Generación:</strong> {formatDate(record.fecha_generacion_reporte)}</p>
            <p><strong className="font-semibold text-gray-800">Participantes Registrados:</strong> {record.participantes_registrados}</p>
          </div>
        </NeumorphicCard>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-slate-100 flex flex-col items-center justify-center p-4">
      {renderContent()}
      <div className="mt-8">
        <NeumorphicButton onClick={handleGoHome}>
          Volver al Inicio
        </NeumorphicButton>
      </div>
    </div>
  );
};

export default VerificationPage;