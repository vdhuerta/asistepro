import React, { useState, useEffect } from 'react';
import type { CourseDetails, Participant } from './types';
import CourseSetup from './components/CourseSetup';
import Header from './components/Header';
import RegistrationForm from './components/RegistrationForm';
import ParticipantList from './components/ParticipantList';
import VerificationPage from './components/VerificationPage';
import ConstanciaVerificationPage from './components/ConstanciaVerificationPage';
import { supabase } from './lib/supabaseClient';
import { NeumorphicButton, NeumorphicCard } from './components/UI';

function App() {
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  
  const [reportVerificationId] = useState<string | null>(() => 
    new URLSearchParams(window.location.search).get('verificacion')
  );
  const [constanciaVerificationId] = useState<string | null>(() => 
    new URLSearchParams(window.location.search).get('constancia')
  );

  useEffect(() => {
    if (courseDetails) {
      const fetchParticipants = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
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
    setShowSuccessModal(true);
  };

  const handleGoBack = () => {
    setCourseDetails(null);
  };

  const handleSuccessAndExit = () => {
    setShowSuccessModal(false);
    handleGoBack();
  }

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
            <ParticipantList participants={participants} courseDetails={courseDetails} />
          </main>
        </div>
        <footer className="w-full text-center text-gray-600 text-[8px] py-4 mt-8">
          <p>Desarrollado por Víctor Huerta © 2025 | UAD</p>
        </footer>
      </div>
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-800 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div onClick={(e) => e.stopPropagation()}>
            <NeumorphicCard className="w-full max-w-sm text-center">
              <h2 className="text-xl font-bold text-green-600 mb-4">¡Éxito!</h2>
              <p className="text-gray-700 mb-6">La asistencia se ha registrado con éxito.</p>
              <NeumorphicButton onClick={handleSuccessAndExit}>
                Salir
              </NeumorphicButton>
            </NeumorphicCard>
          </div>
        </div>
      )}
    </>
  );
}

export default App;