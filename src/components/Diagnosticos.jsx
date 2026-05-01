import React, { useState } from 'react';
import { HeartPulse, Search, Plus, User, Activity, Scale, Ruler, FileText, Calendar, X, Save, TrendingDown, TrendingUp } from 'lucide-react';

const Diagnosticos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [socioActivo, setSocioActivo] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Base de datos simulada de socios y sus diagnósticos físicos
  const [sociosDB] = useState([
    {
      id: 1, nombre: 'Fernando Villelli', edad: 53, sexo: 'Masculino', avatar: 'FV',
      diagnosticos: [
        { id: 1, fecha: '15/03/2026', peso: 82.5, altura: 175, imc: 26.9, grasa: 22, notas: 'Inicia rutina hipertrofia. Leve molestia en rodilla derecha.' },
        { id: 2, fecha: '15/04/2026', peso: 81.0, altura: 175, imc: 26.4, grasa: 20, notas: 'Mejora en fuerza base. Bajó % de grasa.' }
      ]
    },
    {
      id: 2, nombre: 'Laura Fernández', edad: 29, sexo: 'Femenino', avatar: 'LF',
      diagnosticos: [
        { id: 3, fecha: '10/01/2026', peso: 65.0, altura: 168, imc: 23.0, grasa: 24, notas: 'Objetivo: Tonificación y CrossFit.' },
        { id: 4, fecha: '10/04/2026', peso: 63.5, altura: 168, imc: 22.5, grasa: 21, notas: 'Excelente progreso en resistencia cardiovascular.' }
      ]
    },
    {
      id: 3, nombre: 'Pablo García', edad: 35, sexo: 'Masculino', avatar: 'PG',
      diagnosticos: [] // Sin diagnósticos aún
    }
  ]);

  const sociosFiltrados = sociosDB.filter(s => 
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para abrir modal solo si hay socio seleccionado
  const handleNuevoDiagnostico = () => {
    if (!socioActivo) {
      alert("Por favor, selecciona un socio de la lista primero.");
      return;
    }
    setShowModal(true);
  };

  // Obtener el último diagnóstico del socio activo para los KPIs
  const ultimoDiag = socioActivo && socioActivo.diagnosticos.length > 0 
    ? socioActivo.diagnosticos[socioActivo.diagnosticos.length - 1] 
    : null;

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 bg-[#111827] min-h-[calc(100vh-64px)] flex flex-col">
      
      {/* HEADER */}
      <div className="border-b border-gray-800 pb-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <HeartPulse className="text-red-500" size={32} /> Diagnósticos y Evolución
          </h1>
          <p className="text-gray-400 mt-2 text-sm font-medium">Registra mediciones corporales, IMC y seguimiento físico de los socios.</p>
        </div>
        <button 
          onClick={handleNuevoDiagnostico}
          className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-red-600/20 flex items-center gap-2 transition-all"
        >
          <Plus size={20} /> Nuevo Registro
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* PANEL IZQUIERDO: BUSCADOR DE SOCIOS */}
        <div className="w-full lg:w-1/3 flex flex-col bg-[#1e293b] rounded-2xl border border-gray-800 shadow-xl overflow-hidden shrink-0">
          <div className="p-4 border-b border-gray-800 bg-[#141b2d]/50">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Buscar paciente/socio..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0f172a] border border-gray-700 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-red-500 text-sm transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {sociosFiltrados.map(socio => (
              <button 
                key={socio.id}
                onClick={() => setSocioActivo(socio)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left border
                  ${socioActivo?.id === socio.id ? 'bg-red-500/10 border-red-500/30' : 'bg-transparent border-transparent hover:bg-gray-800'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                  ${socioActivo?.id === socio.id ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                  {socio.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold truncate ${socioActivo?.id === socio.id ? 'text-white' : 'text-gray-300'}`}>{socio.nombre}</p>
                  <p className="text-xs text-gray-500">{socio.diagnosticos.length} registros previos</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* PANEL DERECHO: FICHA MÉDICA / EVOLUCIÓN */}
        <div className="flex-1 flex flex-col bg-[#1e293b] rounded-2xl border border-gray-800 shadow-xl overflow-hidden min-h-[500px]">
          {socioActivo ? (
            <>
              {/* Cabecera del Paciente */}
              <div className="p-6 border-b border-gray-800 bg-[#141b2d]/50 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-red-500/30 flex items-center justify-center text-gray-300">
                  <User size={32}/>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{socioActivo.nombre}</h2>
                  <p className="text-sm text-gray-400 font-medium">{socioActivo.edad} años • {socioActivo.sexo}</p>
                </div>
              </div>

              {/* KPIs del Último Diagnóstico */}
              <div className="p-6 border-b border-gray-800">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Activity size={18} className="text-red-400"/> Resumen Físico Actual</h3>
                
                {ultimoDiag ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#0f172a] p-4 rounded-xl border border-gray-700">
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Scale size={14}/> Peso</p>
                      <p className="text-2xl font-black text-white">{ultimoDiag.peso} <span className="text-sm font-medium text-gray-400">kg</span></p>
                    </div>
                    <div className="bg-[#0f172a] p-4 rounded-xl border border-gray-700">
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Ruler size={14}/> Altura</p>
                      <p className="text-2xl font-black text-white">{ultimoDiag.altura} <span className="text-sm font-medium text-gray-400">cm</span></p>
                    </div>
                    <div className="bg-[#0f172a] p-4 rounded-xl border border-gray-700">
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Activity size={14}/> IMC</p>
                      <p className={`text-2xl font-black ${ultimoDiag.imc > 25 ? 'text-orange-400' : 'text-green-400'}`}>{ultimoDiag.imc}</p>
                    </div>
                    <div className="bg-[#0f172a] p-4 rounded-xl border border-gray-700">
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><TrendingDown size={14}/> % Grasa</p>
                      <p className="text-2xl font-black text-blue-400">{ultimoDiag.grasa}%</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl text-orange-400 text-sm font-medium">
                    El socio no tiene evaluaciones físicas registradas.
                  </div>
                )}
              </div>

              {/* Historial de Evolución */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><History size={18} className="text-gray-400"/> Historial de Evaluaciones</h3>
                
                {socioActivo.diagnosticos.length > 0 ? (
                  <div className="space-y-4">
                    {/* Invertimos el array para ver el más reciente primero */}
                    {[...socioActivo.diagnosticos].reverse().map((diag, idx) => (
                      <div key={diag.id} className="bg-[#0f172a] p-5 rounded-xl border border-gray-800 relative">
                        {idx === 0 && <span className="absolute top-4 right-4 bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded-full border border-green-500/30">MÁS RECIENTE</span>}
                        
                        <div className="flex items-center gap-2 text-sm text-gray-400 font-bold mb-3">
                          <Calendar size={16} /> {diag.fecha}
                        </div>
                        <div className="flex gap-6 mb-3 text-sm text-gray-300">
                          <span><strong className="text-white">Peso:</strong> {diag.peso}kg</span>
                          <span><strong className="text-white">IMC:</strong> {diag.imc}</span>
                          <span><strong className="text-white">Grasa:</strong> {diag.grasa}%</span>
                        </div>
                        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                          <p className="text-xs text-gray-400 font-bold uppercase mb-1 flex items-center gap-1"><FileText size={12}/> Notas del Entrenador</p>
                          <p className="text-sm text-gray-300">{diag.notas}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 mt-10">
                    <FileText size={48} className="mx-auto mb-3 opacity-20" />
                    <p>Historial vacío.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-50">
              <HeartPulse size={80} className="mb-6" />
              <p className="text-lg font-bold text-gray-400">Selecciona un socio</p>
              <p className="text-sm">Para ver y registrar su evolución física.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL NUEVO DIAGNÓSTICO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-800 bg-gray-900/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><HeartPulse size={20} className="text-red-500"/> Registrar Medición</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors bg-gray-800 p-1.5 rounded-lg"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-[#0f172a] p-3 rounded-lg border border-gray-700 flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">{socioActivo.avatar}</div>
                <span className="text-sm font-bold text-white">Evaluando a {socioActivo.nombre}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Peso (kg)</label>
                  <input type="number" step="0.1" placeholder="Ej. 75.5" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Altura (cm)</label>
                  <input type="number" placeholder="Ej. 175" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Porcentaje Grasa (%)</label>
                  <input type="number" placeholder="Ej. 18" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Fecha de Evaluación</label>
                  <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-300 focus:outline-none focus:border-red-500 color-scheme-dark" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Notas Médicas / Observaciones</label>
                <textarea rows="3" placeholder="Ej. Presenta dolor articular, se recomienda bajar carga..." className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 resize-none"></textarea>
              </div>
            </div>

            <div className="p-5 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">Cancelar</button>
              <button onClick={() => { alert("Evaluación registrada con éxito."); setShowModal(false); }} className="px-6 py-2.5 rounded-lg font-bold bg-red-600 hover:bg-red-500 text-white transition-colors shadow-lg shadow-red-600/20 flex items-center gap-2">
                <Save size={18}/> Guardar Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagnosticos;