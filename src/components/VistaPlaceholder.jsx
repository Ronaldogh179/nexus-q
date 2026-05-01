import React from 'react';

const VistaPlaceholder = ({ titulo, icono: Icon }) => {
  return (
    <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[80vh] text-center animate-in fade-in duration-500">
      <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 max-w-md w-full shadow-lg">
        {Icon && <Icon size={48} className="text-gray-500 mx-auto mb-4 opacity-50" />}
        <h1 className="text-2xl font-bold text-white mb-2">{titulo}</h1>
        <p className="text-gray-400 text-sm">
          Esta sección está en desarrollo. Pronto podrás gestionar la información correspondiente a {titulo.toLowerCase()} aquí.
        </p>
      </div>
    </div>
  );
};

export default VistaPlaceholder;