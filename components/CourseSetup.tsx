
import React, { useState, useEffect } from 'react';
import type { CourseDetails } from '../types';
import { NeumorphicCard, NeumorphicButton, NeumorphicSelect } from './UI';
import AdminModal from './AdminModal';
import { supabase } from '../lib/supabaseClient';

interface CourseSetupProps {
  onSetupComplete: (details: CourseDetails) => void;
}

const CourseSetup: React.FC<CourseSetupProps> = ({ onSetupComplete }) => {
  const [courses, setCourses] = useState<CourseDetails[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchCourses = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .eq('is_visible', true)
        .order('date', { ascending: false });

      if (error) throw error;

      setCourses(data || []);
      if (data && data.length > 0) {
        setSelectedCourseId(data[0].id);
      } else {
        setSelectedCourseId('');
      }
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      const errorMessage = `No se pudieron cargar los cursos. Causa: ${err.message || 'Error desconocido.'}. Verifique la conexión y la configuración de la base de datos.`;
      setFetchError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleCourseCreated = () => {
    fetchCourses();
    // No cerramos el modal para que el admin pueda seguir gestionando
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCourse = courses.find(c => c.id === selectedCourseId);
    if (selectedCourse) {
      onSetupComplete(selectedCourse);
    } else {
      alert('Por favor, seleccione un curso válido.');
    }
  };

  const formatDateForSelect = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url('https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Intro_DiarioDeCampo.png')` }}
      />
      <div className="fixed inset-0 bg-slate-100/90 backdrop-blur-sm flex items-center justify-center p-4 z-10">
        <NeumorphicCard className="w-full max-w-md relative bg-sky-100 p-6 pt-10">
          <div className="absolute -top-[64px] left-1/2 -translate-x-1/2 w-20 h-20 bg-sky-100 rounded-full p-2 shadow-[5px_5px_10px_#c7ced4,-5px_-5px_10px_#ffffff] flex items-center justify-center">
            <img
              src="https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Logo%20UAD%20Redondo.png"
              alt="Logo UAD"
              className="w-full h-full rounded-full"
            />
          </div>
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="p-2 rounded-full text-gray-600 hover:bg-slate-200 active:shadow-[inset_2px_2px_5px_#c7ced4,inset_-2px_-2px_5px_#ffffff] transition-all duration-200"
              aria-label="Panel de Administrador"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.424.35.534.954.26 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.075.124a6.57 6.57 0 01-.22.127c-.332.183-.582.495-.645.87l-.213 1.281c-.09.543-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.003-.827c.293-.24.438.613-.438-.995s-.145-.755-.438-.995l-1.003-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.075-.124.073-.044.146-.087.22-.127.332-.183.582-.495.645-.87l.213-1.281Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0Z" />
              </svg>
            </button>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">AsistePRO</h2>
          </div>
          {isLoading ? (
            <p className="text-center text-gray-600">Cargando cursos...</p>
          ) : fetchError ? (
            <div className="text-center space-y-4">
              <p className="text-red-600 bg-red-100 p-3 rounded-lg">{fetchError}</p>
              <NeumorphicButton onClick={fetchCourses}>
                  Reintentar
              </NeumorphicButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <NeumorphicSelect
                label="Cursos Disponibles"
                id="course"
                name="course"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                required
                disabled={courses.length === 0}
              >
                {courses.length > 0 ? (
                  courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {`${formatDateForSelect(course.date)} - ${course.name}`}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No hay cursos visibles</option>
                )}
              </NeumorphicSelect>
              
              <div className="pt-4 flex justify-center">
                <NeumorphicButton type="submit" disabled={!selectedCourseId}>
                  Comenzar Registro
                </NeumorphicButton>
              </div>
            </form>
          )}
        </NeumorphicCard>
      </div>
      {isAdminModalOpen && <AdminModal onClose={() => setIsAdminModalOpen(false)} onCourseCreated={handleCourseCreated} />}
    </>
  );
};

export default CourseSetup;
