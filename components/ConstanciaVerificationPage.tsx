import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { NeumorphicCard, NeumorphicButton } from './UI';
import type { ConstanciaVerificationRecord } from '../types';

interface ConstanciaVerificationPageProps {
  verificationId: string;
}

const ConstanciaVerificationPage: React.FC<ConstanciaVerificationPageProps> = ({ verificationId }) => {
  const [record, setRecord] = useState<ConstanciaVerificationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVerificationRecord = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('constancia_verificaciones')
          .select('*')
          .eq('id', verificationId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new Error('El código de verificación no es válido o la constancia no fue encontrada.');
          }
           throw new Error(`Error al contactar la base de datos: ${error.message}`);
        }
        
        if (data) {
          setRecord(data);
        } else {
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
      return <p className="text-xl font-semibold text-gray-700 animate-pulse">Verificando constancia...</p>;
    }

    if (error) {
      return (
        <NeumorphicCard className="w-full max-w-lg text-center bg-red-50 p-8">
            <div className="w-16 h-16 bg-red-200 rounded-full mx-auto flex items-center justify-center mb-4 shadow-[inset_3px_3px_6px_#d1c7c8,inset_-3px_-3px_6px_#ffffff]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
          <h2 className="text-2xl font-bold text-red-700 mb-2">Constancia Inválida</h2>
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
          <h2 className="text-2xl font-bold text-green-800 mb-4 text-center">✅ Constancia Válida</h2>
          <div className="space-y-3 text-center text-gray-700">
            <p><strong className="font-semibold text-gray-800">Participante:</strong> {record.nombre_participante}</p>
            <p><strong className="font-semibold text-gray-800">RUT:</strong> {record.rut_participante}</p>
            <p><strong className="font-semibold text-gray-800">Curso:</strong> {record.nombre_curso}</p>
            <p><strong className="font-semibold text-gray-800">Fecha de Generación:</strong> {formatDate(record.fecha_generacion)}</p>
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

export default ConstanciaVerificationPage;