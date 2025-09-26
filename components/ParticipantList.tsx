
import React from 'react';
import type { Participant } from '../types';
import { NeumorphicCard } from './UI';

interface ParticipantListProps {
  participants: Participant[];
}

const ParticipantList: React.FC<ParticipantListProps> = ({ participants }) => {
  if (participants.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-10">
      <NeumorphicCard>
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Participantes Registrados ({participants.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase">
              <tr>
                <th scope="col" className="px-6 py-3">Nombre Completo</th>
                <th scope="col" className="px-6 py-3">RUT</th>
                <th scope="col" className="px-6 py-3">Correo</th>
                <th scope="col" className="px-6 py-3">Firma</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id} className="border-t border-slate-200">
                  <td className="px-6 py-4 font-medium whitespace-nowrap">
                    {`${p.firstName} ${p.paternalLastName} ${p.maternalLastName}`}
                  </td>
                  <td className="px-6 py-4">{p.rut}</td>
                  <td className="px-6 py-4">{p.email}</td>
                  <td className="px-6 py-4">
                    <img src={p.signature} alt="Firma" className="h-8 w-auto bg-white rounded shadow-sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </NeumorphicCard>
    </div>
  );
};

export default ParticipantList;
