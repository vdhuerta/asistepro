// Fix: Removed duplicated and malformed code block from the top of the file.
import React, { useState, useEffect } from 'react';
import { NeumorphicCard, NeumorphicInput, NeumorphicButton, SegmentedControl } from './UI';
import { supabase } from '../lib/supabaseClient';
import type { CourseDetails } from '../types';

interface AdminModalProps {
  onClose: () => void;
  onCourseCreated: () => void;
}

const ADMIN_PASSWORD = '070670';
const initialCourseState = {
    name: '',
    date: '',
    time: '',
    location: '',
    provider: '',
    person_in_charge: '',
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
    return (error as any).message;
  }
  if (typeof error === 'string' && error.length > 0) {
    return error;
  }
  try {
    return `Detalle técnico: ${JSON.stringify(error)}`;
  } catch {
    return 'Ocurrió un error desconocido y no se pudo mostrar el detalle.';
  }
};

const DownloadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);


const AdminModal: React.FC<AdminModalProps> = ({ onClose, onCourseCreated }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [courseData, setCourseData] = useState(initialCourseState);
  
  const [adminCourses, setAdminCourses] = useState<CourseDetails[]>([]);
  const [isFetchingCourses, setIsFetchingCourses] = useState(false);
  
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [downloading, setDownloading] = useState<{ id: string | null; type: 'csv' | 'html' | null }>({ id: null, type: null });

  
  const fetchAdminCourses = async () => {
    setIsFetchingCourses(true);
    try {
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      
      if (data === null) {
          setAdminCourses([]);
          return;
      }

      const courses = (data as CourseDetails[]).map(course => ({
        ...course,
        is_visible: course.is_visible ?? true,
      }));
      setAdminCourses(courses);
      setPendingChanges({}); // Reset pending changes on fetch
    } catch (err: any) {
      console.error('Error fetching courses for admin:', err);
      alert(`No se pudieron cargar los cursos para administrar: ${getErrorMessage(err)}`);
    } finally {
      setIsFetchingCourses(false);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminCourses();
    }
  }, [isAuthenticated]);


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
    
    const newCourse = { ...courseData, is_visible: true };

    const { error } = await supabase
      .from('cursos')
      .insert([newCourse]);
      
    if (error) {
      console.error('Error creating course:', error);
      alert(`Hubo un error al crear el curso: ${getErrorMessage(error)}`);
    } else {
      alert('Curso creado exitosamente.');
      onCourseCreated();
      fetchAdminCourses();
      setCourseData(initialCourseState);
    }
    
    setIsSubmitting(false);
  };
  
  const handleVisibilityToggle = (courseId: string, newVisibility: boolean) => {
    setAdminCourses(currentCourses =>
      currentCourses.map(c =>
        c.id === courseId ? { ...c, is_visible: newVisibility } : c
      )
    );
    setPendingChanges(prev => ({
      ...prev,
      [courseId]: newVisibility,
    }));
  };

  const handleSaveChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) return;

    setIsSaving(true);
    setError('');

    const updatePromises = Object.entries(pendingChanges).map(([courseId, newVisibility]) => 
      supabase
        .from('cursos')
        .update({ is_visible: newVisibility })
        .eq('id', courseId)
    );

    try {
      const results = await Promise.all(updatePromises);
      const firstError = results.find(result => result.error);

      if (firstError) {
        throw firstError.error;
      }

      alert('Cambios guardados exitosamente.');
      setPendingChanges({});
      onCourseCreated();

    } catch (err) {
      console.error('Error saving changes:', err);
      const errorMessage = getErrorMessage(err);
      alert(
        `ERROR: No se pudieron guardar todos los cambios.\n\n` +
        `Motivo probable: Permisos insuficientes en la base de datos (RLS).\n\n` +
        `Detalle técnico: ${errorMessage}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadCsv = async (courseId: string, courseName: string, courseDate: string) => {
    setDownloading({ id: courseId, type: 'csv' });
    try {
      const { data, error } = await supabase
        .from('asistencias')
        .select('*')
        .eq('curso_id', courseId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      if (!data || data.length === 0) {
        alert('No hay participantes registrados para descargar en este curso.');
        return;
      }

      const headers = [
        "Nombres", "Apellido Paterno", "Apellido Materno", "RUT", "Email", "Teléfono",
        "Rol", "Facultad", "Departamento", "Carrera", "Tipo Contrato", "Semestre Docencia", "Sede", "Fecha de Registro"
      ];
      
      const rows = data.map(p => [
        p.nombres, p.apellido_paterno, p.apellido_materno, p.rut, p.email, p.telefono,
        p.rol, p.facultad, p.departamento, p.carrera, p.tipo_contrato, p.semestre_docencia, p.sede, p.created_at
      ]);
      
      const escapeCsvValue = (value: any): string => {
        const stringValue = String(value ?? '');
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      const csvContent = "data:text/csv;charset=utf-8," 
        + headers.map(escapeCsvValue).join(',') + '\n'
        + rows.map(row => row.map(escapeCsvValue).join(',')).join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      
      const safeCourseName = courseName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const formattedDate = courseDate.split('-').reverse().join('-');
      link.setAttribute("download", `asistencia_${safeCourseName}_${formattedDate}.csv`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err: any) {
      console.error('Error downloading CSV data:', err);
      alert(`No se pudo descargar la lista de asistencia (CSV): ${getErrorMessage(err)}`);
    } finally {
      setDownloading({ id: null, type: null });
    }
  };

  const generateHtmlReport = (course: CourseDetails, participants: any[], verificationId: string): string => {
    const formatDateForReport = (dateString: string) => {
        const date = new Date(dateString + 'T00:00:00');
        const day = date.getUTCDate();
        const year = date.getUTCFullYear();
        const month = date.toLocaleDateString('es-CL', { month: 'long', timeZone: 'UTC' });
        return `${day} de ${month} de ${year}`;
    };
    
    const participantRows = participants.map(p => `
        <tr>
            <td>${p.nombres || ''} ${p.apellido_paterno || ''} ${p.apellido_materno || ''}</td>
            <td>${p.rut || ''}</td>
            <td>${p.email || ''}</td>
            <td>${p.facultad || ''}</td>
            <td>${p.departamento || ''}</td>
            <td>${p.carrera || ''}</td>
            <td>${p.sede || ''}</td>
            <td>${p.firma ? `<img src="${p.firma}" alt="Firma" />` : 'Sin firma'}</td>
        </tr>
    `).join('');

    const verificationUrl = `${window.location.origin}/?verificacion=${verificationId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verificationUrl)}`;

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte de Asistencia - ${course.name}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            body { font-family: 'Poppins', sans-serif; background-color: #f8fafc; color: #334155; margin: 0; padding: 2rem; }
            .container { max-width: 1600px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
            header { background-color: #fecaca; padding: 2rem; text-align: center; }
            header h1 { font-size: 2rem; color: #1e3a8a; margin: 0; }
            .course-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem 1rem; margin-top: 1rem; color: #4b5563; }
            .course-details p { margin: 0; }
            .course-details strong { font-weight: 600; color: #1e3a8a; }
            main { padding: 2rem; overflow-x: auto; }
            main h2 { text-align: center; color: #334155; margin-bottom: 1.5rem; }
            table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
            th, td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; white-space: nowrap; }
            th { background-color: #f1f5f9; font-weight: 600; text-transform: uppercase; font-size: 0.7rem; color: #475569; }
            tr:nth-child(even) { background-color: #f8fafc; }
            td img { max-height: 25px; vertical-align: middle; background: #fff; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
            footer { text-align: center; padding: 1.5rem; font-size: 0.75rem; color: #64748b; background-color: #f1f5f9; }
            .verification-section { display: flex; align-items: center; justify-content: center; gap: 2rem; }
            .verification-text { text-align: left; }
            .verification-text p { margin: 0.2rem 0; font-size: 0.7rem; }
            .verification-text code { background-color: #e2e8f0; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
            
            @media print {
                body { padding: 0; margin: 0; background-color: #fff; }
                .container { width: 100%; max-width: 100%; margin: 0; box-shadow: none; border-radius: 0; }
                main { overflow-x: visible; }
                header, footer, tr:nth-child(even) { background-color: #fff !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
                table { font-size: 9pt; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>${course.name}</h1>
                <div class="course-details">
                    <p><strong>Lugar:</strong> ${course.location}</p>
                    <p><strong>Ofertante:</strong> ${course.provider}</p>
                    <p><strong>Fecha:</strong> ${formatDateForReport(course.date)}</p>
                </div>
            </header>
            <main>
                <h2>Participantes Registrados (${participants.length})</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Nombre Completo</th>
                            <th>RUT</th>
                            <th>Correo Electrónico</th>
                            <th>Facultad</th>
                            <th>Departamento</th>
                            <th>Carrera</th>
                            <th>Sede</th>
                            <th>Firma</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${participantRows}
                    </tbody>
                </table>
            </main>
            <footer>
                <div class="verification-section">
                    <img src="${qrCodeUrl}" alt="Código QR de Verificación">
                    <div class="verification-text">
                        <p><strong>Verificar Documento</strong></p>
                        <p>Escanee el código QR para validar la autenticidad de este reporte.</p>
                        <p>ID de Verificación: <code>${verificationId}</code></p>
                    </div>
                </div>
                <p style="margin-top: 1.5rem;">Reporte generado por AsistePRO © 2025 | UAD</p>
            </footer>
        </div>
    </body>
    </html>`;
  };

  const handleDownloadHtml = async (course: CourseDetails) => {
    setDownloading({ id: course.id, type: 'html' });
    try {
      const { data: participants, error: participantsError } = await supabase
        .from('asistencias')
        .select('*')
        .eq('curso_id', course.id)
        .order('created_at', { ascending: true });
      
      if (participantsError) throw participantsError;
      if (!participants || participants.length === 0) {
        alert('No hay participantes para generar el reporte HTML.');
        return;
      }
      
      const verificationId = crypto.randomUUID();
      const verificationRecord = {
        id: verificationId,
        curso_id: course.id,
        nombre_curso: course.name,
        lugar_curso: course.location,
        ofertante_curso: course.provider,
        encargado_curso: course.person_in_charge,
        participantes_registrados: participants.length,
        fecha_generacion_reporte: new Date().toISOString(),
      };
      
      const { error: insertError } = await supabase
        .from('reporte_verificaciones')
        .insert([verificationRecord]);
        
      if (insertError) {
         throw new Error(`No se pudo crear el registro de verificación. Es posible que la tabla 'reporte_verificaciones' no exista. Detalles: ${insertError.message}`);
      }
      
      const htmlContent = generateHtmlReport(course, participants, verificationId);
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", href);

      const safeCourseName = course.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const formattedDate = course.date.split('-').reverse().join('-');
      link.setAttribute("download", `asistencia_${safeCourseName}_${formattedDate}.html`);
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(href);

    } catch (err: any) {
      console.error('Error downloading HTML data:', err);
      let errorMessage = getErrorMessage(err);

      if (err.message && (err.message.includes("Could not find the table 'public.reporte_verificaciones'") || err.message.includes("relation \"public.reporte_verificaciones\" does not exist"))) {
        errorMessage = "La tabla 'reporte_verificaciones' no existe en la base de datos. " +
                       "Para solucionar este problema, por favor, ejecute el siguiente script SQL en su editor de SQL de Supabase (en la sección 'SQL Editor') y vuelva a intentarlo.\n\n" +
                       "--- COPIAR DESDE AQUÍ ---\n\n" +
                       "-- 1. Crear la tabla para almacenar los datos de verificación\n" +
                       "CREATE TABLE public.reporte_verificaciones (\n" +
                       "  id UUID NOT NULL PRIMARY KEY,\n" +
                       "  curso_id UUID REFERENCES public.cursos(id) ON DELETE SET NULL,\n" +
                       "  nombre_curso TEXT NOT NULL,\n" +
                       "  lugar_curso TEXT,\n" +
                       "  ofertante_curso TEXT,\n" +
                       "  encargado_curso TEXT,\n" +
                       "  participantes_registrados INT NOT NULL,\n" +
                       "  fecha_generacion_reporte TIMESTAMPTZ NOT NULL DEFAULT now()\n" +
                       ");\n\n" +
                       "-- 2. Habilitar la Seguridad a Nivel de Fila (RLS) para la nueva tabla\n" +
                       "ALTER TABLE public.reporte_verificaciones ENABLE ROW LEVEL SECURITY;\n\n" +
                       "-- 3. Crear política para permitir la LECTURA pública de los reportes\n" +
                       "-- Esto es necesario para que la página de verificación funcione para cualquiera.\n" +
                       "CREATE POLICY \"Enable public read access for verification\" \n" +
                       "ON public.reporte_verificaciones FOR SELECT \n" +
                       "USING (true);\n\n" +
                       "-- 4. Crear política para permitir la INSERCIÓN de nuevos registros de verificación\n" +
                       "-- Esto es necesario para que el panel de administrador pueda generar nuevos reportes.\n" +
                       "CREATE POLICY \"Enable insert for admin actions\" \n" +
                       "ON public.reporte_verificaciones FOR INSERT \n" +
                       "WITH CHECK (true);\n\n" +
                       "--- COPIAR HASTA AQUÍ ---";
      }
      
      alert(`No se pudo generar el reporte HTML: ${errorMessage}`);
    } finally {
      setDownloading({ id: null, type: null });
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no definida';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
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
          <NeumorphicCard className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
             <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Crear Nuevo Curso</h2>
             <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <NeumorphicInput label="Nombre del Curso" name="name" value={courseData.name} onChange={handleInputChange} required />
                    <NeumorphicInput label="Ofertante" name="provider" value={courseData.provider} onChange={handleInputChange} required />
                    <NeumorphicInput label="Lugar" name="location" value={courseData.location} onChange={handleInputChange} required />
                    <NeumorphicInput label="Encargado" name="person_in_charge" value={courseData.person_in_charge} onChange={handleInputChange} />
                    <NeumorphicInput label="Fecha" name="date" type="date" value={courseData.date} onChange={handleInputChange} required className="block min-w-0" />
                    <NeumorphicInput label="Hora" name="time" type="time" value={courseData.time} onChange={handleInputChange} className="block min-w-0" />
                </div>
                <div className="pt-4 flex justify-center gap-4">
                    <NeumorphicButton type="submit" disabled={isSubmitting} className="!py-2 !px-6">
                        {isSubmitting ? 'Creando...' : 'Crear Curso'}
                    </NeumorphicButton>
                </div>
             </form>

             <div className="mt-8 pt-6 border-t border-slate-300/50">
                <h3 className="text-xl font-bold text-center text-gray-800 mb-4">Gestionar Cursos Existentes</h3>
                {isFetchingCourses ? (
                    <p className="text-center text-gray-600">Cargando cursos...</p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-60 overflow-y-auto p-1 pr-3">
                        {adminCourses.map(course => (
                            <div key={course.id} className="flex flex-wrap items-center justify-between gap-y-2 bg-slate-50/80 p-3 rounded-lg shadow-[inset_3px_3px_6px_#c7ced4,inset_-3px_-3px_6px_#ffffff]">
                                <div className="flex-grow pr-4">
                                    <p className="font-semibold text-gray-800 text-sm truncate" title={course.name}>{course.name}</p>
                                    <p className="text-xs text-gray-500">{formatDate(course.date)}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <SegmentedControl
                                    options={[
                                      { label: 'Visible', value: true, activeClassName: 'bg-green-200 text-green-800' },
                                      { label: 'Oculto', value: false, activeClassName: 'bg-red-200 text-red-800' },
                                    ]}
                                    value={course.is_visible}
                                    onChange={(newValue) => handleVisibilityToggle(course.id, newValue)}
                                    disabled={isSaving || downloading.id !== null}
                                  />
                                  <NeumorphicButton
                                    onClick={() => handleDownloadCsv(course.id, course.name, course.date)}
                                    disabled={downloading.id !== null}
                                    className="!py-1 !px-3 text-xs whitespace-nowrap flex items-center gap-1.5"
                                  >
                                    {downloading.id === course.id && downloading.type === 'csv' ? '...' : <><DownloadIcon /> CSV</>}
                                  </NeumorphicButton>
                                  <NeumorphicButton
                                    onClick={() => handleDownloadHtml(course)}
                                    disabled={downloading.id !== null}
                                    className="!py-1 !px-3 text-xs whitespace-nowrap flex items-center gap-1.5"
                                  >
                                    {downloading.id === course.id && downloading.type === 'html' ? '...' : <><DownloadIcon /> HTML</>}
                                  </NeumorphicButton>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-center">
                      <NeumorphicButton
                        onClick={handleSaveChanges}
                        disabled={Object.keys(pendingChanges).length === 0 || isSaving || downloading.id !== null}
                      >
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                      </NeumorphicButton>
                    </div>
                  </>
                )}
             </div>

             <div className="mt-8 flex justify-center">
                <NeumorphicButton type="button" onClick={onClose} className="!py-2 !px-6">
                    Cerrar Panel
                </NeumorphicButton>
             </div>
          </NeumorphicCard>
        )}
      </div>
    </div>
  );
};

export default AdminModal;