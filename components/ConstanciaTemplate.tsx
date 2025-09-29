import React from 'react';
import type { Participant, CourseDetails } from '../types';

interface ConstanciaTemplateProps {
  participant: Participant;
  course: CourseDetails;
  verificationId: string;
}

// Exportamos los estilos para que puedan ser inyectados por el componente que genera el PDF.
export const constanciaStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');

  body {
    margin: 0;
    padding: 2rem;
    font-family: 'Poppins', sans-serif;
    background-color: #e0e5ec;
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }
  .page {
    width: 11in;
    height: 8.5in;
    box-sizing: border-box;
    border: 10px solid #003366;
    background: #fff;
    padding: 0.5in;
    margin: 0;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  }
  
  .layout-table {
    width: 100%;
    height: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  
  /* Header */
  .header-cell {
    height: 1.2in;
    vertical-align: top;
    padding-bottom: 0.4in;
    border-bottom: 2px solid #003366;
  }
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .header-content img {
    width: 1in;
    height: auto;
  }
  .header-text {
    text-align: right;
    color: #0055a4;
  }
  .header-text h1 {
    font-family: 'Playfair Display', serif;
    font-size: 20pt;
    margin: 0;
  }
  .header-text p {
    font-size: 9pt;
    margin: 0;
  }

  /* Content */
  .content-cell {
    vertical-align: middle;
    text-align: center;
    padding: 0.2in 0;
  }
  .content-cell h2 {
    font-family: 'Playfair Display', serif;
    font-size: 28pt;
    color: #003366;
    margin: 0 0 0.3in 0;
  }
  .content-cell p {
    font-size: 12pt;
    color: #333;
    line-height: 1.6;
    margin: 0.2in 0;
  }
  .participant-name {
    font-weight: 700;
    font-size: 18pt;
    color: #0055a4;
    margin-top: 0.3in;
    margin-bottom: 0.1in;
  }
  .participant-rut {
    font-size: 11pt;
    color: #444;
    margin-bottom: 0.3in;
  }
  .course-name {
    font-weight: 600;
    font-style: italic;
  }
  .course-duration {
    font-size: 11pt;
    color: #555;
    margin-top: 0.5rem;
  }

  /* Footer */
  .footer-cell {
    height: 0.8in;
    vertical-align: bottom;
    padding-top: 0.4in;
    border-top: 2px solid #003366;
  }
  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .verification {
    display: flex;
    align-items: center;
    gap: 0.15in;
  }
  .verification-text {
    font-size: 6pt;
    color: #555;
  }
  .verification-text p { margin: 0; }
  .verification-text code {
    font-size: 5.5pt;
    word-break: break-all;
  }
  .date-location {
    text-align: right;
    font-size: 10pt;
    font-weight: 500;
    color: #003366;
  }

  .print-button-container {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
    padding-bottom: 2rem;
    z-index: 1000;
  }

  .print-button {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #e0e5ec;
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 16px;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    color: #003366;
    cursor: pointer;
    box-shadow: 5px 5px 10px #c7ced4, -5px -5px 10px #ffffff;
    transition: all 0.2s ease-in-out;
  }

  .print-button:active:not(:disabled) {
    box-shadow: inset 2px 2px 5px #c7ced4, inset -2px -2px 5px #ffffff;
    color: #0055a4;
  }
  
  .print-button:disabled {
    opacity: 0.7;
    cursor: wait;
  }

  .print-button svg {
    width: 20px;
    height: 20px;
  }


  @media print {
    body {
      padding: 0;
      background-color: #fff;
    }
    .page {
      margin: 0;
      box-shadow: none;
      width: 100%;
      height: 100%;
    }
    .print-button-container {
      display: none !important;
    }
  }
`;


const ConstanciaTemplate: React.FC<ConstanciaTemplateProps> = ({ participant, course, verificationId }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();
    const month = date.toLocaleDateString('es-CL', { month: 'long', timeZone: 'UTC' });
    return `${day} de ${month} de ${year}`;
  };

  const verificationUrl = `${window.location.origin}/?constancia=${verificationId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(verificationUrl)}`;
  
  const fullName = participant ? `${participant.firstName} ${participant.paternalLastName} ${participant.maternalLastName}` : 'Nombre no disponible';
  const rut = participant ? participant.rut : 'RUT no disponible';
  const courseName = course ? course.name : 'Curso no disponible';
  const courseLocation = course ? course.location : 'Lugar no disponible';
  const courseDate = course ? formatDate(course.date) : 'Fecha no disponible';
  
  // Lógica de duración mejorada: por defecto a 0 si es nulo, indefinido o negativo.
  const durationInMinutes = (course?.duration && course.duration > 0) ? course.duration : 0;
  const durationInHours = Number((durationInMinutes / 60).toFixed(1)).toString().replace('.', ',');


  const participantNameForFile = `${participant.firstName}_${participant.paternalLastName}`.replace(/\s+/g, '_');
  
  // Script de JavaScript puro para la generación de PDF. Se inyecta en el HTML estático.
  const pdfGenerationScript = `
    document.addEventListener('DOMContentLoaded', function() {
      const btn = document.getElementById('pdfBtn');
      const backBtn = document.getElementById('backBtn');

      if (backBtn) {
        backBtn.addEventListener('click', function() {
          window.close();
        });
      }

      if (!btn) return;

      const originalContent = btn.innerHTML;

      btn.addEventListener('click', function() {
        if (btn.disabled) return;
        
        btn.disabled = true;
        btn.innerHTML = 'Generando PDF...';

        const element = document.getElementById('constancia-page');
        
        const opt = {
          margin: 0,
          filename: 'Constancia_${participantNameForFile}.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 3, useCORS: true, letterRendering: true },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
        };

        if (typeof html2pdf === 'undefined') {
          alert('Error: La librería de generación de PDF no se pudo cargar. Verifique su conexión a internet.');
          btn.disabled = false;
          btn.innerHTML = originalContent;
          return;
        }

        html2pdf().from(element).set(opt).save()
          .catch((err) => {
            console.error("Error al generar el PDF:", err);
            alert("Ocurrió un error al generar el PDF.");
          })
          .finally(() => {
            btn.disabled = false;
            btn.innerHTML = originalContent;
          });
      });
    });
  `;

  return (
    <>
      <div className="page" id="constancia-page">
        <table className="layout-table">
          <tbody>
            <tr className="header-row">
              <td className="header-cell">
                <div className="header-content">
                  <img src="https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Logo%20UAD%20Redondo.png" alt="Logo UAD" />
                  <div className="header-text">
                    <h1>Unidad de Acompañamiento Docente</h1>
                    <p>Vicerrectoría Académica</p>
                  </div>
                </div>
              </td>
            </tr>
            
            <tr className="content-row">
              <td className="content-cell">
                <h2>Constancia de Participación</h2>
                <p>La Unidad de Acompañamiento Docente (UAD) otorga la presente constancia a:</p>
                <p className="participant-name">{fullName}</p>
                <p className="participant-rut">RUT: {rut}</p>
                <p>
                  Por su destacada participación en el curso: 
                  <br/>
                  <span className="course-name">"{courseName}"</span>.
                </p>
                <p className="course-duration">
                  Duración: {durationInHours} Horas
                </p>
              </td>
            </tr>

            <tr className="footer-row">
              <td className="footer-cell">
                <div className="footer-content">
                  <div className="verification">
                    <img src={qrCodeUrl} alt="Código QR de Verificación" />
                    <div className="verification-text">
                      <p><strong>Verificar Constancia:</strong></p>
                      <p>Escanee el código QR para validar este documento.</p>
                      {/* FIX: Corrected a malformed `<code>` tag that was causing a parsing error. */}
                      <p>ID: <code>{verificationId}</code></p>
                    </div>
                  </div>
                  <div className="date-location">
                    <p>{courseLocation}, {courseDate}</p>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="print-button-container">
        <button id="backBtn" className="print-button">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
          </svg>
          Volver
        </button>
        <button id="pdfBtn" className="print-button">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6 3.125A2.25 2.25 0 0 1 8.25 1h7.5A2.25 2.25 0 0 1 18 3.125l.001 10.704M18 13.828c-.24.03-.48.062-.72.096m.72-.096A42.417 42.417 0 0 0 12 13.5m0 0a42.417 42.417 0 0 0-6.72 3.329m6.72-3.329a42.417 42.417 0 0 1 6.72 3.329M3 19.5a1.5 1.5 0 0 1 1.5-1.5h15a1.5 1.5 0 0 1 1.5 1.5v.625a1.5 1.5 0 0 1-1.5 1.5h-15a1.5 1.5 0 0 1-1.5-1.5v-.625Z" />
          </svg>
          Convertir a PDF
        </button>
      </div>
      <script dangerouslySetInnerHTML={{ __html: pdfGenerationScript }} />
    </>
  );
};

export default ConstanciaTemplate;