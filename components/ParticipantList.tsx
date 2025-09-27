

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

const DownloadCertificateIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const LoadingSpinner: React.FC = () => (
  <svg className="animate-spin h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
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
        
        {/* Mobile View: Card List */}
        <div className="md:hidden space-y-4">
          {participants.map((p) => (
            <div key={p.id} className="bg-slate-50/80 p-4 rounded-lg shadow-[inset_3px_3px_6px_#c7ced4,inset_-3px_-3px_6px_#ffffff]">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-grow">
                  <p className="font-bold text-gray-800 break-words">
                    {`${p.firstName} ${p.paternalLastName} ${p.maternalLastName}`}
                  </p>
                  <p className="text-sm text-gray-600">{p.rut}</p>
                  <p className="text-xs text-gray-500 break-all mt-1">{p.email}</p>
                </div>
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  <img src={p.signature} alt="Firma" className="h-10 w-auto max-w-[100px] bg-white rounded shadow-sm" />
                  <button
                    onClick={() => handleShowConstancia(p)}
                    disabled={generatingId !== null}
                    className="p-2 rounded-full text-blue-600 hover:bg-blue-100 disabled:text-gray-400 disabled:cursor-wait disabled:hover:bg-transparent transition-colors duration-200"
                    title="Descargar Constancia"
                    aria-label="Descargar Constancia"
                  >
                    {generatingId === p.id ? <LoadingSpinner /> : <DownloadCertificateIcon />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
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
                      title="Descargar Constancia"
                      aria-label="Descargar Constancia"
                    >
                      {generatingId === p.id ? <LoadingSpinner /> : <DownloadCertificateIcon />}
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