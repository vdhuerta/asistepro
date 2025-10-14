import React, { useState, useRef, useEffect } from 'react';
import type { Participant, CourseDetails } from '../types';
import { NeumorphicCard, NeumorphicInput, NeumorphicButton, NeumorphicSelect } from './UI';
import SignaturePad from './SignaturePad';
import type { SignaturePadHandle } from './SignaturePad';
import { supabase } from '../lib/supabaseClient';

interface RegistrationFormProps {
  onAddParticipant: (participant: Participant) => void;
  courseDetails: CourseDetails;
  onGoBack: () => void;
}

const initialFormState = {
  firstName: '',
  paternalLastName: '',
  maternalLastName: '',
  rut: '',
  email: '',
  phone: '',
  role: '',
  faculty: '',
  department: '',
  major: '',
  contractType: '',
  teachingSemester: '',
  campus: '',
};

const roles = [
  "Decano/(a)",
  "Secretario /(a) Académico/(a)",
  "Director/(a) de Departamento",
  "Director/(a) de Carrera",
  "Director/a de Dirección",
  "Académico/(a) Planta",
  "Académico/(a) Honorarios",
  "Académico/(a) Contrata",
  "Académico/(a) Contrata Excepcional",
  "Académico/(a) Media Jornada",
  "Académico/(a) Jornada Completa",
  "Académico/(a) CFT",
  "Coordinación de Direcciones",
  "Coordinación de Unidades",
  "Coordinación de Carrera",
  "Coordinación de Práctica",
  "Coordinación de Doctorado",
  "Mentor /(a) Académico/(a)",
  "Asesor/(a) Pedagógico",
  "Asesor/(a) Curricular",
  "Encargado/(a) de Laboratorio",
  "Bibliotecólogo/(a)",
  "Funcionario/(a)",
  "Externo"
];

const faculties = [
  "Facultad de Humanidades",
  "Facultad de Ciencias Naturales y Exactas",
  "Facultad de Ciencias de la Educación",
  "Facultad de Arte",
  "Facultad de Ciencias de la Actividad Física y del Deporte",
  "Facultad de Ciencias Sociales",
  "Facultad de Ciencias de la Salud",
  "Facultad de Ingeniería",
  "Instituto Tecnológico Ignacio Domeyko (ITEC)",
  "Centro de Formación Técnica Estatal (CFT Estatal)",
  "Profesionales- Académicos UPLA",
  "Unidad de Acompañamiento Estudiantil",
  "Unidad de Acompañamiento Docente",
  "Vicerrectoría Académica",
  "Otro"
];

const departments = [
    "Artes Integradas",
    "Ciencias de Datos e Informática",
    "Ciencias de la Actividad Física",
    "Ciencias de la Educación",
    "Ciencias de la Ingeniería para la Sostenibilidad",
    "Ciencias del Deporte",
    "Ciencias y Geografía",
    "Educación Artística",
    "Estrategias Innovadoras para la Formación en Ciencias de la Salud",
    "Estudios Territoriales y Diálogos Interculturales",
    "Filosofía, Historia y Turismo",
    "Género, Política y Cultura",
    "Ingeniería Industrial y Gestión Organizacional",
    "Lenguas Extranjeras",
    "Literatura y Lingüística",
    "Matemática, Física y Computación",
    "Mediaciones y Subjetividades",
    "Pedagogía",
    "Rehabilitación, Intervención y Abordajes Terapéuticos",
    "Salud, Comunidad y Gestión",
    "Sin Departamento"
];

const majors = [
    "Administración Turística Multilingüe",
    "Bibliotecología",
    "Derecho Licenciatura En Ciencias Juridicas Y Sociales Bachillerato En Ciencias Sociales",
    "Dibujante Proyectista",
    "Diseño",
    "Educación Parvularia",
    "Enfermería, Licenciatura En Enfermería",
    "Fonoaudiología",
    "Geografía",
    "Ingeniería Civil Ambiental",
    "Ingeniería Civil Industrial",
    "Ingeniería Civil Informatica Licenciatura En Ciencias De La Ingeniería Bachillerato En Ingenieria",
    "Ingeniería Comercial Licenciatura En Ciencias De La Administración Bachillerato En Administracion",
    "Ingeniería En Informática",
    "Instituto Tecnológico",
    "Kinesiología",
    "Licenciatura En Arte",
    "Nutrición Dietética",
    "Pedagogía En Artes Plásticas",
    "Pedagogía En Biología Y Ciencias",
    "Pedagogía En Castellano",
    "Pedagogía En Educación Básica",
    "Pedagogía En Educación Diferencial",
    "Pedagogía En Educación Física Damas",
    "Pedagogía En Educación Física Varones",
    "Pedagogía En Educación Musical",
    "Pedagogía En Filosofía",
    "Pedagogía En Física",
    "Pedagogía En Historia Y Geografía",
    "Pedagogía En Inglés",
    "Pedagogía En Matemática",
    "Pedagogía En Química Y Ciencias",
    "Periodismo",
    "Postgrado/ Magíster En Lingüística Con Mención Dialecto Gia Hispanoam Y Chilena O Ling. Apl. E.I",
    "Postgrado/Diplomado En Gestión Cultural",
    "Postgrado/Doctorado En Literatura Hispanoamericana Contemporánea",
    "Postgrado/Doctorado Interdisciplinario En Ciencias Ambientales",
    "Postgrado/Magíster En Arte Mención Patrimonio",
    "Postgrado/Magíster En Bibliotecología E Información",
    "Postgrado/Magíster En Educación De Adultos Y Procesos Formativos",
    "Postgrado/Magíster En Enseñanza De Las Ciencias",
    "Postgrado/Magíster En Evaluación Educacional",
    "Postgrado/Magíster En Gestión Cultural",
    "Postgrado/Magíster En Liderazgo Y Gestión De Organizaciones Educativas",
    "Postgrado/Magíster En Literatura Con Mención En",
    "Postgrado/Postítulo En Orientación Educacional",
    "Psicología",
    "Sociología",
    "Teatro",
    "Técnico En Administración En Recursos Humanos",
    "Técnico En Administración Logística",
    "Técnico En Construcción",
    "Técnico en Interpretación en Lengua de Señas",
    "Técnico En Minería",
    "Tecnología En Deporte Y Recreación",
    "Terapia Ocupacional",
    "Traducción E Interpretación Inglés-Español",
    "Vicerrectoría Académica",
    "Otro"
];

const contractTypes = [
    "Planta Media Jornada",
    "Planta Jornada Completa",
    "Contrata Media Jornada",
    "Contrata Jornada Completa",
    "Contrata Excepcional",
    "Otro"
];

const teachingSemesters = [
    "Semestre 1",
    "Semestre 2",
    "Semestre 3",
    "Semestre 4",
    "Semestre 5",
    "Semestre 6",
    "Semestre 7",
    "Semestre 8",
    "Semestre 9",
    "Semestre 10",
    "No Aplica"
];

const campusOptions = [
    "Valparaíso",
    "San Felipe",
    "No Aplica"
];

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onAddParticipant, courseDetails, onGoBack }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isRutValid, setIsRutValid] = useState(true);
  const [isRutDuplicate, setIsRutDuplicate] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  
  const [suggestions, setSuggestions] = useState<Participant[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const signaturePadRef = useRef<SignaturePadHandle>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const rutRegex = /^\d{7,8}-[0-9kK]$/i;

  useEffect(() => {
    const { 
        firstName, paternalLastName, maternalLastName, rut, email, phone, role, faculty, 
        department, major, contractType, teachingSemester, campus 
    } = formData;
    const requiredFields = [
        firstName, paternalLastName, maternalLastName, rut, email, phone, role, faculty, 
        department, major, contractType, teachingSemester, campus
    ];
    const allFieldsFilled = requiredFields.every(field => field.trim() !== '');
    const isRutFormatValid = rutRegex.test(rut);
    setIsFormValid(allFieldsFilled && hasSigned && isRutFormatValid && !isRutDuplicate);
  }, [formData, hasSigned, isRutDuplicate, rutRegex]);
  
  // Real-time check for duplicate RUT
  useEffect(() => {
      if (!isRutValid || !formData.rut) {
          setIsRutDuplicate(false);
          return;
      }

      const checkDuplicate = async () => {
          const { data, error } = await supabase
              .from('asistencias')
              .select('id')
              .eq('rut', formData.rut.trim().toUpperCase())
              .eq('curso_id', courseDetails.id)
              .limit(1);

          if (error) {
              console.error('Error checking for duplicate RUT:', error);
              setIsRutDuplicate(false); // Fail safely
              return;
          }

          setIsRutDuplicate(data && data.length > 0);
      };

      const handler = setTimeout(() => {
          checkDuplicate();
      }, 500);

      return () => {
          clearTimeout(handler);
      };
  }, [formData.rut, courseDetails.id, isRutValid]);


  useEffect(() => {
    const search = async () => {
      if (formData.rut.trim().length < 4) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      setShowSuggestions(true);

      const { data, error } = await supabase
        .from('participantes') // Search in the master table
        .select('*')
        .ilike('rut', `${formData.rut}%`)
        .order('nombres', { ascending: true }) // FIX: Order by a reliable field like name.
        .limit(10);
      
      if (error) {
        console.error('Error searching participants:', error);
        setSuggestions([]);
      } else if (data) {
        const uniqueParticipantsMap = new Map<string, Participant>();
        data.forEach((p: any) => {
          if (!uniqueParticipantsMap.has(p.rut)) {
            uniqueParticipantsMap.set(p.rut, {
              id: p.rut, // Use RUT as a key for suggestions
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
              signature: '', // Don't autofill signature
              // FIX: created_at is not used for suggestions and might not exist, so it's removed.
            });
          }
        });
        setSuggestions(Array.from(uniqueParticipantsMap.values()));
      }
      setIsSearching(false);
    };

    const handler = setTimeout(() => {
      if(showSuggestions) {
          search();
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [formData.rut, showSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
     if (name === 'rut') {
      const formattedValue = value.replace(/\./g, '').toUpperCase();
      setIsRutValid(rutRegex.test(formattedValue) || formattedValue === '');
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
      setShowSuggestions(true);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectParticipant = (participant: Participant) => {
    setFormData({
      firstName: participant.firstName,
      paternalLastName: participant.paternalLastName,
      maternalLastName: participant.maternalLastName,
      rut: participant.rut,
      email: participant.email,
      phone: participant.phone,
      role: participant.role,
      faculty: participant.faculty,
      department: participant.department,
      major: participant.major,
      contractType: participant.contractType,
      teachingSemester: participant.teachingSemester,
      campus: participant.campus,
    });
    setShowSuggestions(false);
    setSuggestions([]);
    setIsRutValid(true); // The selected RUT is valid
    signaturePadRef.current?.clear();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!isFormValid) {
      alert('Por favor, complete todos los campos obligatorios y verifique el formato del RUT para registrarse.');
      return;
    }

    setIsSubmitting(true);

    const signature = signaturePadRef.current?.getSignatureAsDataURL() || '';

    const newParticipantData = {
      curso_id: courseDetails.id,
      nombres: formData.firstName,
      apellido_paterno: formData.paternalLastName,
      apellido_materno: formData.maternalLastName,
      rut: formData.rut.trim().toUpperCase(),
      email: formData.email,
      telefono: formData.phone,
      rol: formData.role,
      facultad: formData.faculty,
      departamento: formData.department,
      carrera: formData.major,
      tipo_contrato: formData.contractType,
      semestre_docencia: formData.teachingSemester,
      sede: formData.campus,
      firma: signature,
    };

    const { data, error } = await supabase
      .from('asistencias')
      .insert([newParticipantData])
      .select()
      .single();

    if (error) {
      console.error("Error inserting participant:", error);
      alert(`Hubo un error al registrar la asistencia: ${error.message}`);
      setIsSubmitting(false);
      return;
    }

    if (data) {
      // Also, create or update the record in the master participants table.
      // This runs in the background and doesn't block the user.
      const participantMasterData = {
        rut: formData.rut.trim().toUpperCase(), // This is the primary key
        nombres: formData.firstName,
        apellido_paterno: formData.paternalLastName,
        apellido_materno: formData.maternalLastName,
        email: formData.email,
        telefono: formData.phone,
        rol: formData.role,
        facultad: formData.faculty,
        departamento: formData.department,
        carrera: formData.major,
        tipo_contrato: formData.contractType,
        semestre_docencia: formData.teachingSemester,
        sede: formData.campus,
      };

      // Use upsert: if RUT exists, update; otherwise, insert.
      // This requires 'rut' to be a PRIMARY KEY or have a UNIQUE constraint in the 'participantes' table.
      const { error: upsertError } = await supabase
        .from('participantes')
        .upsert(participantMasterData, { onConflict: 'rut' });

      if (upsertError) {
        // Log the error but don't bother the user, as the main registration was successful.
        console.error('Error upserting participant to master list:', upsertError);
        // Optionally, you could show a non-blocking warning to the admin/user.
      }
      
      const participantForState: Participant = {
        id: data.id,
        firstName: data.nombres,
        paternalLastName: data.apellido_paterno,
        maternalLastName: data.apellido_materno,
        rut: data.rut,
        email: data.email,
        phone: data.telefono,
        role: data.rol,
        faculty: data.facultad,
        department: data.departamento,
        major: data.carrera,
        contractType: data.tipo_contrato,
        teachingSemester: data.semestre_docencia,
        campus: data.sede,
        signature: data.firma,
        created_at: data.created_at,
      };
      onAddParticipant(participantForState);
      
      // Reset form for next participant
      setFormData(initialFormState);
      signaturePadRef.current?.clear();
    }

    setIsSubmitting(false);
  };
  
  if (!courseDetails.is_registration_open) {
    return (
      <NeumorphicCard className="w-full bg-amber-50 text-center p-8">
        <h2 className="text-xl font-bold text-amber-800 mb-4">Registro Cerrado</h2>
        <p className="text-amber-700">El período de registro para este curso ha finalizado. No se aceptan nuevas inscripciones.</p>
        <div className="mt-8 flex justify-center">
          <NeumorphicButton type="button" onClick={onGoBack}>
            Volver
          </NeumorphicButton>
        </div>
      </NeumorphicCard>
    );
  }

  return (
    <NeumorphicCard className="w-full bg-teal-50">
      <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Registro de Participante</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="relative" ref={suggestionsRef}>
            <NeumorphicInput 
              label="RUT (ej: 12345678-9)" 
              id="rut" 
              name="rut" 
              value={formData.rut} 
              onChange={handleInputChange} 
              required 
              maxLength={10}
              className={(!isRutValid && formData.rut.length > 0) || isRutDuplicate ? 'ring-2 ring-red-400 shadow-[inset_2px_2px_5px_#fbdada,inset_-2px_-2px_5px_#ffffff]' : ''}
              autoComplete="off"
            />
            {(!isRutValid && formData.rut.length > 0) && (
              <p className="text-xs text-red-600 mt-1">Formato de RUT inválido. Use: 12345678-K, sin puntos.</p>
            )}
             {isRutDuplicate && (
              <p className="text-xs text-red-600 mt-1">RUT ya registrado en este curso.</p>
            )}
            {showSuggestions && formData.rut.length >= 4 && (
              <div className="absolute top-full left-0 right-0 mt-2 z-20">
                <NeumorphicCard className="max-h-60 overflow-y-auto p-2">
                  {isSearching ? (
                    <div className="p-2 text-center text-gray-500">Buscando...</div>
                  ) : suggestions.length > 0 ? (
                    <ul>
                      {suggestions.map(p => (
                        <li key={p.id} 
                          className="p-3 text-sm text-gray-700 rounded-lg cursor-pointer hover:bg-slate-200/50"
                          onMouseDown={() => handleSelectParticipant(p)}
                        >
                          <p className="font-semibold">{`${p.firstName} ${p.paternalLastName}`}</p>
                          <p className="text-xs text-gray-500">{p.rut}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-2 text-center text-gray-500">No se encontraron coincidencias.</div>
                  )}
                </NeumorphicCard>
              </div>
            )}
          </div>
          <NeumorphicInput label="Nombres" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
          <NeumorphicInput label="Apellido Paterno" id="paternalLastName" name="paternalLastName" value={formData.paternalLastName} onChange={handleInputChange} required />
          <NeumorphicInput label="Apellido Materno" id="maternalLastName" name="maternalLastName" value={formData.maternalLastName} onChange={handleInputChange} required />
          <NeumorphicInput label="Correo Electrónico" id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
          <NeumorphicInput label="Teléfono" id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
          <NeumorphicSelect label="Rol" id="role" name="role" value={formData.role} onChange={handleInputChange} required>
            <option value="" disabled>Seleccione un rol</option>
            {roles.map(role => <option key={role} value={role}>{role}</option>)}
          </NeumorphicSelect>
          <NeumorphicSelect label="Facultad" id="faculty" name="faculty" value={formData.faculty} onChange={handleInputChange} required>
            <option value="" disabled>Seleccione una facultad</option>
            {faculties.map(faculty => <option key={faculty} value={faculty}>{faculty}</option>)}
          </NeumorphicSelect>
          <NeumorphicSelect label="Departamento" id="department" name="department" value={formData.department} onChange={handleInputChange} required>
             <option value="" disabled>Seleccione un departamento</option>
             {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </NeumorphicSelect>
          <NeumorphicSelect label="Carrera" id="major" name="major" value={formData.major} onChange={handleInputChange} required>
            <option value="" disabled>Seleccione una carrera</option>
            {majors.map(major => <option key={major} value={major}>{major}</option>)}
          </NeumorphicSelect>
          <NeumorphicSelect label="Tipo Contrato" id="contractType" name="contractType" value={formData.contractType} onChange={handleInputChange} required>
            <option value="" disabled>Seleccione un tipo</option>
            {contractTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </NeumorphicSelect>
          <NeumorphicSelect label="Semestre Docencia" id="teachingSemester" name="teachingSemester" value={formData.teachingSemester} onChange={handleInputChange} required>
            <option value="" disabled>Seleccione un semestre</option>
            {teachingSemesters.map(semester => <option key={semester} value={semester}>{semester}</option>)}
          </NeumorphicSelect>
          <NeumorphicSelect label="Sede" id="campus" name="campus" value={formData.campus} onChange={handleInputChange} required>
            <option value="" disabled>Seleccione una sede</option>
            {campusOptions.map(campus => <option key={campus} value={campus}>{campus}</option>)}
          </NeumorphicSelect>
          
          <div className="md:col-span-2 lg:col-span-3">
            <SignaturePad ref={signaturePadRef} label="Firma" onSignatureStateChange={setHasSigned} required />
          </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row-reverse justify-center items-center gap-4">
          <NeumorphicButton type="submit" disabled={isSubmitting || !isFormValid} className="w-full sm:w-auto">
            {isSubmitting ? 'Registrando...' : 'Registrar Asistencia'}
          </NeumorphicButton>
          <NeumorphicButton type="button" onClick={onGoBack} className="w-full sm:w-auto">
            Volver
          </NeumorphicButton>
        </div>
      </form>
    </NeumorphicCard>
  );
};

export default RegistrationForm;