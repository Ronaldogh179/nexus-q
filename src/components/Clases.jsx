import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Plus, MapPin, User, Search, Edit, Trash2, X, Check } from 'lucide-react';

const Clases = () => {
  const [filtroDia, setFiltroDia] = useState('Hoy');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModalNueva, setShowModalNueva] = useState(false);

  // Base de datos simulada de Clases
  const [clases, setClases] = useState([
    {
      id: 1,
      nombre: 'Spinning Extremo',
      profesor: 'Carlos Ruiz',
      sala: 'Sala Bicis (Piso 2)',
      horaInicio: '18:00',
      horaFin: '19:00',
      dia: 'Hoy',
      cupoActual: 20,
      cupoMaximo: 20,
      color: 'blue'
    },
    {
      id: 2,
      nombre: 'Yoga Vinyasa',
      profesor: 'Ana López',
      sala: 'Sala Zen (Piso 1)',
      horaInicio: '19:30',
      horaFin: '20:30',
      dia: 'Hoy',
      cupoActual: 12,
      cupoMaximo: 15,
      color: 'green'
    },
    {
      id: 3,
      nombre: 'CrossFit WOD',
      profesor: 'Marcos Díaz',
      sala: 'Box Principal',
      horaInicio: '08:00',
      horaFin: '09:00',
      dia: 'Mañana',
      cupoActual: 18,
      cupoMaximo: 25,
      color: 'red'
    },
    {
      id: 4,
      nombre: 'Zumba Fitness',
      profesor: 'Valeria Gómez',
      sala: 'Salón Principal',
      horaInicio: '10:00',
      horaFin: '11:00',
      dia: 'Mañana',
      cupoActual: 8,
      cupoMaximo: 30,
      color: 'purple'
    },
    {
      id: 5,
      nombre: 'Funcional Core',
      profesor: 'Carlos Ruiz',
      sala: 'Zona Funcional',
      horaInicio: '20:00',
      horaFin: '21:00',
      dia: 'Hoy',
      cupoActual: 15,
      cupoMaximo: 15,
      color: 'orange'
    }
  ]);

  const diasDisponibles = ['Hoy', 'Mañana', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  const clasesFiltradas = clases.filter(c => 
    (filtroDia === 'Todos' || c.dia === filtroDia) &&
    (c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || c.profesor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 bg-[#111827] min-h-screen">
      
      {/* HEADER */}
      <div className="border-b border-gray-800 pb-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-blue-500" size={32} /> Calendario de Clases
          </h1>
          <p className="text-gray-400 mt-2 text-sm font-medium">Administra los horarios, profesores y cupos de las actividades grupales.</p>
        </div>
        <button 
          onClick={() => setShowModalNueva(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all"
        >
          <Plus size={20} /> Programar Clase
        </button>
      </div>

      {/* FILTROS Y BUSCADOR */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por clase o profesor..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1e293b] border border-gray-800 text-white rounded-xl pl-11 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm shadow-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          <button 
            onClick={() => setFiltroDia('Todos')}
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${filtroDia === 'Todos' ? 'bg-gray-700 text-white' : 'bg-[#1e293b] border border-gray-800 text-gray-400 hover:text-gray-200'}`}
          >
            Todos
          </button>
          {diasDisponibles.map(dia => (
            <button 
              key={dia}
              onClick={() => setFiltroDia(dia)}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${filtroDia === dia ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' : 'bg-[#1e293b] border border-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
            >
              {dia}
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE CLASES PROGRAMADAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {clasesFiltradas.length > 0 ? (
          clasesFiltradas.map((clase) => {
            const porcentajeCupo = (clase.cupoActual / clase.cupoMaximo) * 100;
            const estaLleno = clase.cupoActual >= clase.cupoMaximo;

            return (
              <div key={clase.id} className="bg-[#1e293b] rounded-2xl border border-gray-800 overflow-hidden hover:border-gray-600 transition-all hover:shadow-xl group">
                
                {/* Cabecera de la Clase */}
                <div className="p-5 border-b border-gray-800/50 flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-${clase.color}-500/10 border border-${clase.color}-500/20 flex flex-col items-center justify-center text-${clase.color}-500`}>
                      <span className="text-xs font-bold uppercase">{clase.dia}</span>
                      <span className="text-sm font-black">{clase.horaInicio}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">{clase.nombre}</h3>
                      <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1"><User size={14}/> {clase.profesor}</p>
                    </div>
                  </div>
                  
                  {/* Acciones Hover */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-gray-500 hover:text-blue-400 rounded-md hover:bg-gray-800"><Edit size={16}/></button>
                    <button className="p-1.5 text-gray-500 hover:text-red-400 rounded-md hover:bg-gray-800"><Trash2 size={16}/></button>
                  </div>
                </div>

                {/* Detalles y Cupo */}
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center text-sm text-gray-300">
                    <div className="flex items-center gap-1.5"><Clock size={16} className="text-gray-500"/> {clase.horaInicio} - {clase.horaFin}</div>
                    <div className="flex items-center gap-1.5"><MapPin size={16} className="text-gray-500"/> {clase.sala}</div>
                  </div>

                  {/* Barra de progreso de cupo */}
                  <div>
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                        <Users size={14}/> Ocupación
                      </span>
                      <span className={`text-sm font-bold ${estaLleno ? 'text-red-400' : 'text-green-400'}`}>
                        {clase.cupoActual} / {clase.cupoMaximo} {estaLleno ? '(Lleno)' : ''}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${estaLleno ? 'bg-red-500' : porcentajeCupo > 75 ? 'bg-orange-500' : 'bg-green-500'}`}
                        style={{ width: `${porcentajeCupo}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Footer del Card */}
                <div className="p-4 bg-gray-900/30 border-t border-gray-800">
                  <button 
                    disabled={estaLleno}
                    onClick={() => alert(`Añadiendo alumno a ${clase.nombre}...`)}
                    className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2
                      ${estaLleno 
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
                        : 'bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-500/20'}`}
                  >
                    {estaLleno ? <X size={16} /> : <Plus size={16} />}
                    {estaLleno ? 'Clase Llena' : 'Inscribir Socio'}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-10 bg-[#1e293b] rounded-2xl border border-gray-800 text-center flex flex-col items-center">
            <CalendarIcon size={48} className="text-gray-600 mb-3" />
            <p className="text-gray-400 font-medium">No hay clases programadas para este filtro.</p>
          </div>
        )}
      </div>

      {/* MODAL PROGRAMAR CLASE */}
      {showModalNueva && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-800 bg-gray-900/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><CalendarIcon size={20} className="text-blue-500"/> Programar Nueva Clase</h2>
              <button onClick={() => setShowModalNueva(false)} className="text-gray-500 hover:text-white transition-colors bg-gray-800 p-1.5 rounded-lg"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Nombre de la Actividad</label>
                  <input type="text" placeholder="Ej. Zumba Fitness" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Profesor/a</label>
                  <select className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500">
                    <option>Carlos Ruiz</option>
                    <option>Ana López</option>
                    <option>Marcos Díaz</option>
                    <option>Valeria Gómez</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Sala / Ubicación</label>
                  <select className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500">
                    <option>Salón Principal</option>
                    <option>Sala Bicis</option>
                    <option>Box Principal</option>
                    <option>Sala Zen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Día</label>
                  <input type="date" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-300 focus:outline-none focus:border-blue-500 color-scheme-dark" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Horario</label>
                  <div className="flex items-center gap-2">
                    <input type="time" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-300 focus:outline-none focus:border-blue-500 color-scheme-dark" />
                    <span className="text-gray-500">-</span>
                    <input type="time" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-300 focus:outline-none focus:border-blue-500 color-scheme-dark" />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Cupo Máximo de Asistentes</label>
                  <input type="number" defaultValue={20} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
              <button onClick={() => setShowModalNueva(false)} className="px-5 py-2.5 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">Cancelar</button>
              <button onClick={() => { alert("Clase programada en el calendario."); setShowModalNueva(false); }} className="px-6 py-2.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2">
                <Check size={18} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clases;