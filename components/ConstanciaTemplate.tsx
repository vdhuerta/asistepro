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
    justify-content: center;
    align-items: flex-start;
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

  return (
    <div className="page">
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
              <p>Por su destacada participación en el curso:</p>
              <p className="course-name">"{courseName}"</p>
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
  );
};

export default ConstanciaTemplate;