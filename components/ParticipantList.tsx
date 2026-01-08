

import React, { useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Participant, CourseDetails } from '../types';
import { NeumorphicCard, NeumorphicInput, NeumorphicButton } from './UI';
import { supabase } from '../lib/supabaseClient';
import ConstanciaTemplate, { constanciaStyles } from './ConstanciaTemplate';

interface ParticipantListProps {
  participants: Participant[];
  courseDetails: CourseDetails;
  onDeleteParticipant: (participantId: string) => Promise<void>;
}

const DownloadCertificateIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const TrashIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.71c-1.123 0-2.033.954-2.033 2.134v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);


const LoadingSpinner: React.FC = () => (
  <svg className="animate-spin h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const maskRut = (rut: string): string => {
  if (!rut || rut.length < 3) {
    return rut;
  }
  const cleanRut = rut.replace(/\./g, '').toUpperCase();
  const parts = cleanRut.split('-');
  if (parts.length !== 2) {
    return rut; // Invalid format, return as is
  }
  const [body, dv] = parts;

  if (body.length <= 4) {
    return `${'*'.repeat(body.length)}-${dv}`;
  }
  
  const start = body.slice(0, 2);
  const end = body.slice(-2);
  const maskedLength = body.length - start.length - end.length;
  const masked = '*'.repeat(maskedLength);
  
  return `${start}${masked}${end}-${dv}`;
};


const ParticipantList: React.FC<ParticipantListProps> = ({ participants, courseDetails, onDeleteParticipant }) => {
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // State for delete modal
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // State for certificate modal
  const [participantForCertificate, setParticipantForCertificate] = useState<Participant | null>(null);
  const [certificatePassword, setCertificatePassword] = useState('');
  const [certificatePasswordError, setCertificatePasswordError] = useState('');

  const ADMIN_PASSWORD = '070670'; // Same password as in AdminModal

  const handleShowConstancia = async (participant: Participant) => {
    if (generatingId || deletingId) return;
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

      const { error: insertError } = await supabase!
        .from('constancia_verificaciones')
        .insert([verificationRecord]);
      
      if (insertError) {
        let userMessage = `No se pudo crear el registro de verificación. Detalles: ${insertError.message}`;
        if (insertError.message.includes("relation \"public.constancia_verificaciones\" does not exist")) {
            userMessage = "La tabla 'constancia_verificaciones' necesaria para generar constancias no existe en la base de datos. " +
                        "Para solucionarlo, ejecute el siguiente script SQL en el editor de SQL de Supabase y vuelva a intentarlo.\n\n" +
                        "--- COPIAR DESDE AQUÍ ---\n\n" +
                        "-- 1. Crear la tabla para verificar constancias\n" +
                        "CREATE TABLE public.constancia_verificaciones (\n" +
                        "  id UUID NOT NULL PRIMARY KEY,\n" +
                        "  curso_id UUID REFERENCES public.cursos(id) ON DELETE SET NULL,\n" +
                        "  asistencia_id UUID REFERENCES public.asistencias(id) ON DELETE CASCADE,\n" +
                        "  nombre_participante TEXT NOT NULL,\n" +
                        "  rut_participante TEXT NOT NULL,\n" +
                        "  nombre_curso TEXT NOT NULL,\n" +
                        "  fecha_generacion TIMESTAMPTZ NOT NULL DEFAULT now()\n" +
                        ");\n\n" +
                        "-- 2. Habilitar Seguridad a Nivel de Fila (RLS)\n" +
                        "ALTER TABLE public.constancia_verificaciones ENABLE ROW LEVEL SECURITY;\n\n" +
                        "-- 3. Política para permitir LECTURA pública\n" +
                        "CREATE POLICY \"Enable public read for constancia verification\" ON public.constancia_verificaciones FOR SELECT USING (true);\n\n" +
                        "-- 4. Política para permitir INSERCIÓN al generar constancias\n" +
                        "CREATE POLICY \"Enable insert for generating constancias\" ON public.constancia_verificaciones FOR INSERT WITH CHECK (true);\n\n" +
                        "--- COPIAR HASTA AQUÍ ---";
        } else if (insertError.message.includes("security policy") || insertError.message.includes("permission denied")) {
            userMessage = `La creación del registro de verificación fue bloqueada por las políticas de seguridad de la base de datos (RLS).\n\n` +
                          `Asegúrese de que existan las políticas correctas en la tabla "constancia_verificaciones". Puede usar el script de creación de tabla (que incluye las políticas) si la tabla es nueva.`;
        }
        throw new Error(userMessage);
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
  
  const handleInitiateDelete = (participant: Participant) => {
    if (deletingId || generatingId) return;
    setPassword('');
    setPasswordError('');
    setParticipantToDelete(participant);
  };

  const handleCancelDelete = () => {
    setParticipantToDelete(null);
  };
  
  const handleConfirmDelete = async () => {
    if (!participantToDelete) return;
    
    if (password !== ADMIN_PASSWORD) {
      setPasswordError('Contraseña incorrecta.');
      return;
    }

    setDeletingId(participantToDelete.id);
    setParticipantToDelete(null); // Close modal immediately
    try {
      await onDeleteParticipant(participantToDelete.id);
    } catch (error) {
      console.error("Deletion failed:", error);
      // The parent component (App.tsx) already shows an alert.
    } finally {
      setDeletingId(null);
    }
  };
  
  const handleInitiateCertificateDownload = (participant: Participant) => {
    if (generatingId || deletingId) return;
    setCertificatePassword('');
    setCertificatePasswordError('');
    setParticipantForCertificate(participant);
  };

  const handleCancelCertificateDownload = () => {
    setParticipantForCertificate(null);
  };

  const handleConfirmCertificateDownload = async () => {
    if (!participantForCertificate) return;

    const rutBody = participantForCertificate.rut.split('-')[0].replace(/\./g, '');
    const correctKey = rutBody.slice(-4);
    
    if (certificatePassword === correctKey) {
        // Correct password, proceed to generate
        handleCancelCertificateDownload(); // Close modal
        await handleShowConstancia(participantForCertificate);
    } else {
        setCertificatePasswordError('Clave incorrecta. Intente de nuevo.');
    }
  };


  if (participants.length === 0) {
    return null;
  }

  return (
    <>
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
                    <p className="text-sm text-gray-600">{maskRut(p.rut)}</p>
                    <p className="text-xs text-gray-500 break-all mt-1">{p.email}</p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <img src={p.signature} alt="Firma" className="h-10 w-auto max-w-[100px] bg-white rounded shadow-sm" />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleInitiateCertificateDownload(p)}
                        disabled={generatingId !== null || deletingId !== null}
                        className="p-2 rounded-full text-blue-600 hover:bg-blue-100 disabled:text-gray-400 disabled:cursor-wait disabled:hover:bg-transparent transition-colors duration-200"
                        title="Descargar Constancia"
                        aria-label="Descargar Constancia"
                      >
                        {generatingId === p.id ? <LoadingSpinner /> : <DownloadCertificateIcon />}
                      </button>
                      <button
                        onClick={() => handleInitiateDelete(p)}
                        disabled={deletingId !== null || generatingId !== null}
                        className="p-2 rounded-full text-red-600 hover:bg-red-100 disabled:text-gray-400 disabled:cursor-wait disabled:hover:bg-transparent transition-colors duration-200"
                        title="Eliminar Participante"
                        aria-label="Eliminar Participante"
                      >
                        {deletingId === p.id ? <LoadingSpinner /> : <TrashIcon />}
                      </button>
                    </div>
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
                  <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.id} className="border-t border-slate-200">
                    <td className="px-6 py-4 font-medium whitespace-nowrap">
                      {`${p.firstName} ${p.paternalLastName} ${p.maternalLastName}`}
                    </td>
                    <td className="px-6 py-4">{maskRut(p.rut)}</td>
                    <td className="px-6 py-4">{p.email}</td>
                    <td className="px-6 py-4">
                      <img src={p.signature} alt="Firma" className="h-8 w-auto bg-white rounded shadow-sm" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleInitiateCertificateDownload(p)}
                          disabled={generatingId !== null || deletingId !== null}
                          className="p-2 rounded-full text-blue-600 hover:bg-blue-100 disabled:text-gray-400 disabled:cursor-wait disabled:hover:bg-transparent transition-colors duration-200"
                          title="Descargar Constancia"
                          aria-label="Descargar Constancia"
                        >
                          {generatingId === p.id ? <LoadingSpinner /> : <DownloadCertificateIcon />}
                        </button>
                        <button
                          onClick={() => handleInitiateDelete(p)}
                          disabled={deletingId !== null || generatingId !== null}
                          className="p-2 rounded-full text-red-600 hover:bg-red-100 disabled:text-gray-400 disabled:cursor-wait disabled:hover:bg-transparent transition-colors duration-200"
                          title="Eliminar Participante"
                          aria-label="Eliminar Participante"
                        >
                          {deletingId === p.id ? <LoadingSpinner /> : <TrashIcon />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NeumorphicCard>
      </div>

      {/* Delete Confirmation Modal */}
      {participantToDelete && (
        <div 
          className="fixed inset-0 bg-slate-800 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
          onClick={handleCancelDelete}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <NeumorphicCard className="w-full max-w-md bg-rose-50">
              <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Confirmar Eliminación</h2>
              <p className="text-center text-gray-600 mb-4">
                ¿Seguro que quieres eliminar a <strong className="font-semibold">{`${participantToDelete.firstName} ${participantToDelete.paternalLastName}`}</strong>?
              </p>
              <p className="text-center text-red-600 text-sm mb-6">Esta acción es irreversible.</p>
              
              <div className="space-y-4">
                <NeumorphicInput
                  label="Contraseña de Administrador"
                  id="delete-password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  required
                />
                {passwordError && <p className="text-red-500 text-sm text-center">{passwordError}</p>}
                <div className="pt-2 flex justify-center gap-4">
                   <NeumorphicButton type="button" onClick={handleCancelDelete} className="!py-2 !px-6">
                      Cancelar
                   </NeumorphicButton>
                   <NeumorphicButton 
                     type="button" 
                     onClick={handleConfirmDelete} 
                     className="!py-2 !px-6 !bg-red-200 !text-red-800 hover:!text-red-900 active:!shadow-[inset_1px_1px_2px_#d9b8b8,inset_-1px_-1px_2px_#ffffff]"
                   >
                      Eliminar
                   </NeumorphicButton>
                </div>
              </div>
            </NeumorphicCard>
          </div>
        </div>
      )}
      
      {/* Certificate Password Modal */}
      {participantForCertificate && (
        <div 
          className="fixed inset-0 bg-slate-800 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
          onClick={handleCancelCertificateDownload}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <NeumorphicCard className="w-full max-w-md bg-sky-50">
              <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Descargar Constancia</h2>
              <p className="text-center text-gray-600 mb-4">
                Para proteger la privacidad, ingrese la clave de <strong className="font-semibold">{`${participantForCertificate.firstName} ${participantForCertificate.paternalLastName}`}</strong>.
              </p>
              <p className="text-center text-sky-700 text-sm mb-6">
                <strong>Pista:</strong> La clave son los últimos 4 dígitos del RUT, antes del guion.
              </p>
              
              <div className="space-y-4">
                <NeumorphicInput
                  label="Clave de 4 dígitos"
                  id="certificate-password"
                  name="password"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={certificatePassword}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    if (val.length <= 4) {
                      setCertificatePassword(val);
                      setCertificatePasswordError('');
                    }
                  }}
                  maxLength={4}
                  required
                  autoComplete="off"
                  onKeyPress={(e) => { if (e.key === 'Enter') handleConfirmCertificateDownload(); }}
                />
                {certificatePasswordError && <p className="text-red-500 text-sm text-center">{certificatePasswordError}</p>}
                <div className="pt-2 flex justify-center gap-4">
                   <NeumorphicButton type="button" onClick={handleCancelCertificateDownload} className="!py-2 !px-6">
                      Cancelar
                   </NeumorphicButton>
                   <NeumorphicButton 
                     type="button" 
                     onClick={handleConfirmCertificateDownload} 
                     className="!py-2 !px-6 !bg-sky-200 !text-sky-800 hover:!text-sky-900 active:!shadow-[inset_1px_1px_2px_#c3dbe3,inset_-1px_-1px_2px_#ffffff]"
                   >
                      Descargar
                   </NeumorphicButton>
                </div>
              </div>
            </NeumorphicCard>
          </div>
        </div>
      )}
    </>
  );
};

export default ParticipantList;