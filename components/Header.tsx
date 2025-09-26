import React from 'react';
import type { CourseDetails } from '../types';
import { NeumorphicCard } from './UI';

interface HeaderProps {
  details: CourseDetails;
}

const Header: React.FC<HeaderProps> = ({ details }) => {
  const formatDate = (dateString: string) => {
    // Asegura que la fecha se interprete como UTC para evitar problemas de zona horaria
    const date = new Date(dateString + 'T00:00:00'); 
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };

  return (
    <header className="w-full mb-8">
      <NeumorphicCard className="bg-rose-100">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-2">{details.name}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-gray-600">
            <p><span className="font-semibold">Lugar:</span> {details.location}</p>
            <p><span className="font-semibold">Ofertante:</span> {details.provider}</p>
            <p><span className="font-semibold">Fecha:</span> {formatDate(details.date)}</p>
          </div>
        </div>
      </NeumorphicCard>
    </header>
  );
};

export default Header;