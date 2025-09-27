import React, { useState } from 'react';
import { NeumorphicCard, NeumorphicButton, SegmentedControl } from './UI';

interface InstallHelpModalProps {
  onClose: () => void;
}

// SVG Icons for instructions
const IosShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 inline-block mx-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const IosAddToHomeScreenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 inline-block mx-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const AndroidMenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 inline-block mx-2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
);

const AndroidInstallIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 inline-block mx-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);


const InstallHelpModal: React.FC<InstallHelpModalProps> = ({ onClose }) => {
  const [os, setOs] = useState<'ios' | 'android'>('ios');

  const iosInstructions = (
    <ol className="list-decimal list-inside space-y-4 text-gray-700">
      <li>Abre esta página en el navegador <strong>Safari</strong>.</li>
      <li>
        Toca el ícono de <strong>Compartir</strong>
        <IosShareIcon />
        en la barra de navegación.
      </li>
      <li>
        Desliza hacia arriba y selecciona la opción <strong>"Agregar a la pantalla de inicio"</strong>
        <IosAddToHomeScreenIcon />
      </li>
      <li>Confirma el nombre y toca <strong>"Agregar"</strong> en la esquina superior derecha.</li>
    </ol>
  );

  const androidInstructions = (
    <ol className="list-decimal list-inside space-y-4 text-gray-700">
      <li>Abre esta página en el navegador <strong>Chrome</strong>.</li>
      <li>
        Toca el menú de los tres puntos
        <AndroidMenuIcon />
        en la esquina superior derecha.
      </li>
      <li>
        Busca y selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a pantalla principal"</strong>.
        <AndroidInstallIcon />
      </li>
      <li>Sigue las instrucciones que aparecen para confirmar la instalación.</li>
    </ol>
  );

  return (
    <div
      className="fixed inset-0 bg-slate-800 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <NeumorphicCard className="w-full max-w-lg">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-4">Instalar AsistePRO</h2>
          <p className="text-center text-gray-600 mb-6">
            Sigue estos pasos para agregar un acceso directo en tu dispositivo.
          </p>

          <div className="flex justify-center mb-6">
             <SegmentedControl
                options={[
                  { label: 'iPhone / iPad', value: 'ios' },
                  { label: 'Android', value: 'android' },
                ]}
                value={os}
                onChange={(newOs) => setOs(newOs as 'ios' | 'android')}
            />
          </div>

          <div className="bg-slate-50/80 p-4 rounded-lg shadow-[inset_3px_3px_6px_#c7ced4,inset_-3px_-3px_6px_#ffffff]">
             {os === 'ios' ? iosInstructions : androidInstructions}
          </div>

          <div className="mt-8 flex justify-center">
            <NeumorphicButton onClick={onClose}>
              Entendido
            </NeumorphicButton>
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
};

export default InstallHelpModal;
