import React, { useState } from 'react';
import { NeumorphicCard, NeumorphicInput, NeumorphicButton } from './UI';
import { supabase } from '../lib/supabaseClient';

interface AdminModalProps {
  onClose: () => void;
  onCourseCreated: () => void;
}

const ADMIN_PASSWORD = '070670';

const AdminModal: React.FC<AdminModalProps> = ({ onClose, onCourseCreated }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [courseData, setCourseData] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    provider: '',
    person_in_charge: '',
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Contraseña incorrecta.');
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCourseData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const { data, error } = await supabase
      .from('cursos')
      .insert([courseData]);
      
    if (error) {
      console.error('Error creating course:', error);
      alert(`Hubo un error al crear el curso: ${error.message}`);
    } else {
      alert('Curso creado exitosamente.');
      onCourseCreated();
    }
    
    setIsSubmitting(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-800 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>
        {!isAuthenticated ? (
          <NeumorphicCard className="w-full max-w-sm">
            <h2 className="text-xl font-bold text-center text-gray-800 mb-4">Acceso de Administrador</h2>
            <p className="text-center text-gray-600 mb-6">Ingrese la contraseña para continuar.</p>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <NeumorphicInput
                label="Contraseña"
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <div className="pt-2 flex justify-center gap-4">
                 <NeumorphicButton type="button" onClick={onClose} className="!py-2 !px-6">
                    Cancelar
                 </NeumorphicButton>
                 <NeumorphicButton type="submit" className="!py-2 !px-6">
                    Ingresar
                 </NeumorphicButton>
              </div>
            </form>
          </NeumorphicCard>
        ) : (
          <NeumorphicCard className="w-full max-w-lg">
             <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Crear Nuevo Curso</h2>
             <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <NeumorphicInput label="Nombre del Curso" name="name" value={courseData.name} onChange={handleInputChange} required />
                    <NeumorphicInput label="Ofertante" name="provider" value={courseData.provider} onChange={handleInputChange} required />
                    <NeumorphicInput label="Lugar" name="location" value={courseData.location} onChange={handleInputChange} required />
                    <NeumorphicInput label="Encargado" name="person_in_charge" value={courseData.person_in_charge} onChange={handleInputChange} />
                    <NeumorphicInput label="Fecha" name="date" type="date" value={courseData.date} onChange={handleInputChange} required />
                    <NeumorphicInput label="Hora" name="time" type="time" value={courseData.time} onChange={handleInputChange} />
                </div>
                <div className="pt-4 flex justify-center gap-4">
                    <NeumorphicButton type="button" onClick={onClose} className="!py-2 !px-6">
                        Cerrar
                    </NeumorphicButton>
                    <NeumorphicButton type="submit" disabled={isSubmitting} className="!py-2 !px-6">
                        {isSubmitting ? 'Creando...' : 'Crear Curso'}
                    </NeumorphicButton>
                </div>
             </form>
          </NeumorphicCard>
        )}
      </div>
    </div>
  );
};

export default AdminModal;