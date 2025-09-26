import React, { useState, useEffect } from 'react';
import type { CourseDetails, Participant } from './types';
import CourseSetup from './components/CourseSetup';
import Header from './components/Header';
import RegistrationForm from './components/RegistrationForm';
import ParticipantList from './components/ParticipantList';
import { supabase } from './lib/supabaseClient';

function App() {
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
  };

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
    <div className="min-h-screen bg-slate-100 text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <Header details={courseDetails} />
        <main className="space-y-10">
          <RegistrationForm 
            onAddParticipant={handleAddParticipant}
            courseDetails={courseDetails}
          />
          <ParticipantList participants={participants} />
        </main>
      </div>
    </div>
  );
}

export default App;