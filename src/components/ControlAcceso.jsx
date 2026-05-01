import React, { useState } from 'react';
import { useGym } from 'src/context/GymContext.jsx';
import {
  ShieldCheck, Search, UserCheck, UserX, Clock,
  QrCode, AlertTriangle, CheckCircle2, History, ArrowRight, Loader2,
} from 'lucide-react';

const ControlAcceso = () => {
  const { socios, asistencias, realizarCheckIn, theme } = useGym();

  const [ingresoDNI, setIngresoDNI] = useState('');
  const [ultimoEscaneo, setUltimoEscaneo] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const registrarEntrada = async (e) => {
    e.preventDefault();
    if (!ingresoDNI.trim() || procesando) return;

    setProcesando(true);

    const res = await realizarCheckIn(ingresoDNI.trim());
    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (res.success) {
      const dias = res.diasRestantes ?? res.socio?.dias ?? 0;
      const motivoDisplay =
        res.estadoAcceso === 'Permitido'
          ? `Socio activo · ${dias} día${dias !== 1 ? 's' : ''} restante${dias !== 1 ? 's' : ''}`
          : 'Membresía vencida — renovar plan';

      setUltimoEscaneo({
        nombre: res.socio.nombre,
        plan: res.socio.plan,
        avatar: res.socio.iniciales,
        estado: res.estadoAcceso,
        motivo: motivoDisplay,
        hora,
      });
    } else {
      setUltimoEscaneo({
        nombre: 'DNI no registrado',
        plan: 'Verificar en módulo Socios',
        avatar: '?',
        estado: 'Denegado',
        motivo: res.motivo ?? 'DNI no encontrado en el sistema',
        hora,
      });
    }

    setIngresoDNI('');
    setProcesando(false);
  };

  // Historial del contexto (asistencias de la sesión + las persistidas en Supabase)
  const historialAccesos = asistencias.slice(0, 10);

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 bg-[#111827] min-h-[calc(100vh-64px)] flex flex-col">

      {/* HEADER */}
      <div className="border-b border-gray-800 pb-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-blue-500" size={32} /> Control de Acceso
          </h1>
          <p className="text-gray-400 mt-2 text-sm font-medium">
            Terminal de recepción — verifica membresía en tiempo real y registra el acceso en Supabase.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-sm font-medium">
            {socios.length} socios en base
          </span>
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 font-bold text-sm tracking-wider uppercase">Sistema En Línea</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">

        {/* PANEL IZQUIERDO: SCANNER */}
        <div className="lg:col-span-1 flex flex-col gap-6">

          {/* Input de Check-in */}
          <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800 shadow-xl">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2">
              <QrCode className="text-gray-400" size={20} /> Ingreso Manual por DNI
            </h2>
            <form onSubmit={registrarEntrada} className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
                <input
                  type="text"
                  autoFocus
                  placeholder="Escanear QR o ingresar DNI..."
                  value={ingresoDNI}
                  onChange={(e) => setIngresoDNI(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-gray-700 text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-blue-500 text-lg font-bold transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={!ingresoDNI.trim() || procesando}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex justify-center items-center gap-2"
              >
                {procesando
                  ? <><Loader2 size={18} className="animate-spin" /> Verificando...</>
                  : <>Registrar Entrada <ArrowRight size={18} /></>}
              </button>
            </form>
            <p className="text-xs text-gray-500 text-center mt-4">
              El acceso queda registrado en Supabase automáticamente al confirmar.
            </p>
          </div>

          {/* Resultado del último escaneo */}
          <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800 shadow-xl flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[300px]">
            {ultimoEscaneo ? (
              <div className="animate-in zoom-in-95 duration-300 w-full">
                <div
                  className={`w-full py-3 mb-6 rounded-lg font-black uppercase tracking-widest text-lg animate-pulse
                  ${ultimoEscaneo.estado === 'Permitido'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}
                >
                  ACCESO {ultimoEscaneo.estado.toUpperCase()}
                </div>

                <div
                  className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-black mb-4 shadow-xl
                  ${ultimoEscaneo.estado === 'Permitido' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
                >
                  {ultimoEscaneo.avatar}
                </div>

                <h3 className="text-2xl font-bold text-white leading-tight">{ultimoEscaneo.nombre}</h3>
                <p className="text-gray-400 font-medium mb-4">{ultimoEscaneo.plan}</p>

                <div className="inline-flex items-center gap-2 bg-[#0f172a] px-4 py-2 rounded-full border border-gray-700">
                  {ultimoEscaneo.estado === 'Permitido'
                    ? <CheckCircle2 size={16} className="text-green-500" />
                    : <AlertTriangle size={16} className="text-red-500" />}
                  <span className="text-sm text-gray-300 font-medium">{ultimoEscaneo.motivo}</span>
                </div>
              </div>
            ) : (
              <div className="opacity-30">
                <ShieldCheck size={80} className="mx-auto mb-4 text-gray-500" />
                <p className="font-bold text-xl text-gray-400">Esperando escaneo...</p>
              </div>
            )}
          </div>
        </div>

        {/* PANEL DERECHO: HISTORIAL EN VIVO */}
        <div className="lg:col-span-2 bg-[#1e293b] rounded-2xl border border-gray-800 shadow-xl flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-800 bg-[#141b2d]/50 flex justify-between items-center">
            <h2 className="text-white font-bold flex items-center gap-2">
              <History className="text-blue-500" size={20} /> Historial de la Sesión
            </h2>
            <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs font-bold">
              {historialAccesos.length} registros
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {historialAccesos.length === 0 ? (
              <div className="p-12 text-center text-gray-500 opacity-40">
                <History size={48} className="mx-auto mb-4" />
                <p className="text-sm font-medium">Sin accesos registrados en esta sesión.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Hora</th>
                    <th className="p-4 font-semibold">Socio</th>
                    <th className="p-4 font-semibold text-center">Estado</th>
                    <th className="p-4 font-semibold">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {historialAccesos.map((acceso, idx) => (
                    <tr
                      key={acceso.id ?? idx}
                      className={`hover:bg-gray-800/40 transition-colors ${idx === 0 ? 'bg-blue-900/10' : ''}`}
                    >
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 text-sm font-bold text-gray-400">
                          <Clock size={14} /> {acceso.hora}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-300">
                            {acceso.avatar}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{acceso.nombre}</p>
                            <p className="text-xs text-gray-500">{acceso.plan}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border
                          ${acceso.estado === 'Permitido'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
                        >
                          {acceso.estado === 'Permitido' ? <UserCheck size={14} /> : <UserX size={14} />}
                          {acceso.estado}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-300">{acceso.motivo ?? '—'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlAcceso;
