import React, { useState, useEffect } from 'react';
import type { CourseDetails, Participant } from './types';
import CourseSetup from './components/CourseSetup';
import Header from './components/Header';
import RegistrationForm from './components/RegistrationForm';
import ParticipantList from './components/ParticipantList';
import VerificationPage from './components/VerificationPage';
import ConstanciaVerificationPage from './components/ConstanciaVerificationPage';
import { supabase, isConfigured } from './lib/supabaseClient';
import ConfigurationError from './components/ConfigurationError';
import { NeumorphicButton, NeumorphicCard } from './components/UI';

function App() {
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [lastParticipantName, setLastParticipantName] = useState<string>('');
  
  const [reportVerificationId] = useState<string | null>(() => 
    new URLSearchParams(window.location.search).get('verificacion')
  );
  const [constanciaVerificationId] = useState<string | null>(() => 
    new URLSearchParams(window.location.search).get('constancia')
  );

  // Si la configuración no está presente en config.ts, muestra una pantalla de error.
  // Esto previene que la aplicación intente ejecutarse sin conexión a la base de datos.
  if (!isConfigured) {
    return <ConfigurationError />;
  }
  
  useEffect(() => {
    if (courseDetails) {
      const fetchParticipants = async () => {
        setIsLoading(true);
        const { data, error } = await supabase!
          .from('asistencias')
          .select('*')
          .eq('curso_id', courseDetails.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching participants:', error);
          alert(`Error al cargar la lista de participantes: ${error.message}`);
        } else {
          const fetchedParticipants = data.map((p: any) => ({
            id: p.id,
            firstName: p.nombres,
            paternalLastName: p.apellido_paterno,
            maternalLastName: p.apellido_materno,
            rut: p.rut,
            email: p.email,
            phone: p.telefono,
            role: p.rol,
            faculty: p.facultad,
            department: p.departamento,
            major: p.carrera,
            contractType: p.tipo_contrato,
            teachingSemester: p.semestre_docencia,
            campus: p.sede,
            signature: p.firma,
            created_at: p.created_at,
          }));
          setParticipants(fetchedParticipants);
        }
        setIsLoading(false);
      };
      fetchParticipants();
    }
  }, [courseDetails]);

  const handleSetupComplete = (details: CourseDetails) => {
    setCourseDetails(details);
  };

  const handleAddParticipant = (participant: Participant) => {
    setParticipants(prev => [...prev, participant]);
    setLastParticipantName(`${participant.firstName} ${participant.paternalLastName}`);
    setShowSuccessModal(true);
  };

  const handleDeleteParticipant = async (participantId: string) => {
    const { error } = await supabase!
      .from('asistencias')
      .delete()
      .eq('id', participantId);

    if (error) {
      console.error('Error deleting participant:', error);
      let userMessage = `Error al eliminar al participante: ${error.message}`;

      // Check for common RLS-related errors
      if (error.message.includes('security policy') || error.message.includes('permission denied')) {
          userMessage = 'La eliminación fue bloqueada por las políticas de seguridad de la base de datos (RLS). ' +
                        'Por favor, asegúrese de que exista una política que permita la eliminación (DELETE) en la tabla "asistencias". ' +
                        'Consulte las instrucciones para agregarla desde el editor SQL de Supabase.';
      }

      alert(userMessage);
      throw error;
    } else {
      setParticipants(prevParticipants => 
        prevParticipants.filter(p => p.id !== participantId)
      );
    }
  };

  const handleGoBack = () => {
    setCourseDetails(null);
    setParticipants([]); // Clear participants when going back
  };

  const handleRegisterNext = () => {
    setShowSuccessModal(false);
    // The form now resets itself, so we just close the modal.
  };

  if (reportVerificationId) {
    return <VerificationPage verificationId={reportVerificationId} />;
  }

  if (constanciaVerificationId) {
    return <ConstanciaVerificationPage verificationId={constanciaVerificationId} />;
  }

  if (!courseDetails) {
    return <CourseSetup onSetupComplete={handleSetupComplete} />;
  }

  if (isLoading) {
    return (
       <div className="fixed inset-0 bg-slate-100 flex items-center justify-center">
           <p className="text-xl font-semibold text-gray-700 animate-pulse">Cargando participantes...</p>
       </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-slate-100 text-gray-800 p-4 sm:p-6 lg:p-8 flex flex-col">
        <div className="max-w-5xl mx-auto w-full flex-grow">
          <Header details={courseDetails} />
          <main className="space-y-10">
            <RegistrationForm 
              onAddParticipant={handleAddParticipant}
              courseDetails={courseDetails}
              onGoBack={handleGoBack}
            />
            <ParticipantList 
              participants={participants} 
              courseDetails={courseDetails} 
              onDeleteParticipant={handleDeleteParticipant}
            />
          </main>
        </div>
        <footer className="w-full text-center text-gray-600 text-[8px] py-4 mt-8">
          <p>Desarrollado por UAD © 2025 | UPLA</p>
        </footer>
      </div>
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-800 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div onClick={(e) => e.stopPropagation()}>
            <NeumorphicCard className="w-full max-w-sm text-center">
              <h2 className="text-xl font-bold text-green-600 mb-4">¡Registro Exitoso!</h2>
              <p className="text-gray-700 mb-6">
                La asistencia de <strong className="font-semibold">{lastParticipantName}</strong> se ha guardado correctamente.
              </p>
              <NeumorphicButton onClick={handleRegisterNext}>
                Registrar Siguiente
              </NeumorphicButton>
            </NeumorphicCard>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
