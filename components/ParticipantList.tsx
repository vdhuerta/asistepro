

import React, { useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Participant, CourseDetails } from '../types';
import { NeumorphicCard } from './UI';
import { supabase } from '../lib/supabaseClient';
import ConstanciaTemplate, { constanciaStyles } from './ConstanciaTemplate';

interface ParticipantListProps {
  participants: Participant[];
  courseDetails: CourseDetails;
}

const ViewCertificateIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-1 1v1.132l-3.321 1.51a1 1 0 00-.54 1.054l.5 3.5A1 1 0 006 11.236V16a1 1 0 001 1h6a1 1 0 001-1v-4.764a1 1 0 00.362-1.04l.5-3.5a1 1 0 00-.54-1.054L12 4.132V3a1 1 0 00-1-1H9zm2 10a1 1 0 10-2 0v.01a1 1 0 102 0V12z" clipRule="evenodd" />
    <path d="M3 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
  </svg>
);

const LoadingSpinner: React.FC = () => (
  <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const ParticipantList: React.FC<ParticipantListProps> = ({ participants, courseDetails }) => {
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const handleShowConstancia = async (participant: Participant) => {
    if (generatingId) return;
    setGeneratingId(participant.id);

    try {
      // 1. Create verification record in Supabase
      const verificationId = crypto.randomUUID();
      const verificationRecord = {
        id: verificationId,
        curso_id: courseDetails.id,
        asistencia_id: participant.id,
        nombre_participante: `${participant.firstName} ${participant.paternalLastName} ${participant.maternalLastName}`,
        rut_participante: participant.rut,
        nombre_curso: courseDetails.name,
      };

      const { error: insertError } = await supabase
        .from('constancia_verificaciones')
        .insert([verificationRecord]);
      
      if (insertError) {
        throw new Error(`No se pudo crear el registro de verificación. Es posible que la tabla 'constancia_verificaciones' no exista o no tenga los permisos correctos. Detalles: ${insertError.message}`);
      }

      // 2. Generate HTML from React component
      const pageContent = renderToStaticMarkup(
        <ConstanciaTemplate 
          participant={participant} 
          course={courseDetails} 
          verificationId={verificationId} 
        />
      );

      const htmlString = `
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <meta charset="UTF-8" />
            <title>Constancia de Participación - ${participant.firstName} ${participant.paternalLastName}</title>
            <style>${constanciaStyles}</style>
          </head>
          <body>
            ${pageContent}
          </body>
        </html>
      `;

      // 3. Open the HTML in a new tab
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(htmlString);
        newWindow.document.close();
      } else {
        throw new Error("No se pudo abrir una nueva pestaña. Por favor, deshabilite el bloqueador de ventanas emergentes para este sitio.");
      }

    } catch (error: any) {
      console.error("Error generating certificate:", error);
      alert(`Ocurrió un error al generar la constancia: ${error.message}`);
    } finally {
      setGeneratingId(null);
    }
  };


  if (participants.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-10">
      <NeumorphicCard>
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Participantes Registrados ({participants.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase">
              <tr>
                <th scope="col" className="px-6 py-3">Nombre Completo</th>
                <th scope="col" className="px-6 py-3">RUT</th>
                <th scope="col" className="px-6 py-3">Correo</th>
                <th scope="col" className="px-6 py-3">Firma</th>
                <th scope="col" className="px-6 py-3 text-center">Constancia</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id} className="border-t border-slate-200">
                  <td className="px-6 py-4 font-medium whitespace-nowrap">
                    {`${p.firstName} ${p.paternalLastName} ${p.maternalLastName}`}
                  </td>
                  <td className="px-6 py-4">{p.rut}</td>
                  <td className="px-6 py-4">{p.email}</td>
                  <td className="px-6 py-4">
                    <img src={p.signature} alt="Firma" className="h-8 w-auto bg-white rounded shadow-sm" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleShowConstancia(p)}
                      disabled={generatingId !== null}
                      className="p-2 rounded-full text-blue-600 hover:bg-blue-100 disabled:text-gray-400 disabled:cursor-wait disabled:hover:bg-transparent transition-colors duration-200"
                      title="Ver Constancia"
                      aria-label="Ver Constancia"
                    >
                      {generatingId === p.id ? <LoadingSpinner /> : <ViewCertificateIcon />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </NeumorphicCard>
    </div>
  );
};

export default ParticipantList;
