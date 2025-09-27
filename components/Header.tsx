import React from 'react';
import type { CourseDetails } from '../types';
import { NeumorphicCard } from './UI';

interface HeaderProps {
  details: CourseDetails;
}

const Header: React.FC<HeaderProps> = ({ details }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();
    const month = date.toLocaleDateString('es-CL', { month: 'long', timeZone: 'UTC' });
    return `${day}-${month}-${year}`;
  };

  return (
    <header className="w-full mb-12 mt-14 sm:mt-12 relative">
      <NeumorphicCard className="bg-rose-100 p-6 pt-10 text-center">
        <div className="absolute -top-[59px] left-1/2 -translate-x-1/2 w-20 h-20 bg-rose-100 rounded-full p-2 shadow-[5px_5px_10px_#d1c7c8,-5px_-5px_10px_#ffffff] flex items-center justify-center">
            <img
              src="https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Logo%20UAD%20Redondo.png"
              alt="Logo UAD"
              className="w-full h-full rounded-full"
            />
        </div>
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-2">{details.name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-1 text-gray-600">
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