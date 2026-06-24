import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useGym } from 'src/context/GymContext.jsx';
import { useToast } from 'src/components/Toast.jsx';
import { supabase } from 'src/lib/supabase.js';
import {
  ShieldCheck, ShieldX, Search, UserCheck, UserX, Clock,
  IdCard, AlertTriangle, CheckCircle2, History, ArrowRight,
  Loader2, RotateCcw, CalendarCheck, Zap,
} from 'lucide-react';
import MembershipModal from './MembershipModal';

// ─── Calcula días restantes hasta fecha_venc ──────────────────────────────────
const diasRestantes = (fechaVenc) => {
  if (!fechaVenc || fechaVenc === '—') return null;
  const fv = new Date(fechaVenc);
  if (Number.isNaN(fv.getTime())) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.ceil((fv.getTime() - hoy.getTime()) / 86_400_000);
};

// ─────────────────────────────────────────────────────────────────────────────

const ControlAcceso = () => {
  const { socios } = useGym();
  const { addToast } = useToast();

  const inputRef                = useRef(null);
  const [ingresoDNI, setIngresoDNI]       = useState('');
  const [ultimoEscaneo, setUltimoEscaneo] = useState(null); // { socio, estado, motivo, hora }
  const [procesando, setProcesando]       = useState(false);
  const [historialAccesos, setHistorialAccesos] = useState([]);
  const [showRenovarModal, setShowRenovarModal] = useState(false);

  // Auto-focus siempre que el componente se monte o se limpie el input
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Carga historial reciente desde Supabase al montar
  useEffect(() => {
    const fetchHistorial = async () => {
      const { data, error } = await supabase
        .from('asistencias')
        .select('*')
        .order('id', { ascending: false })
        .limit(20);
      if (!error) setHistorialAccesos(data ?? []);
    };
    void fetchHistorial();
  }, []);

  const historialSesion = useMemo(() => historialAccesos.slice(0, 10), [historialAccesos]);

  // ─── Registrar entrada ─────────────────────────────────────────────────────
  const registrarEntrada = async (e) => {
    e.preventDefault();
    if (!ingresoDNI.trim() || procesando) return;

    setProcesando(true);
    const hora  = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const socio = socios.find((s) => String(s.dni ?? '').trim() === ingresoDNI.trim());

    if (!socio) {
      setUltimoEscaneo({ nombre: 'DNI no registrado', plan: 'Verificar en módulo Socios', avatar: '?', estado: 'Denegado', motivo: 'DNI no encontrado en el sistema', hora, dias: null });
      addToast({ message: 'DNI no encontrado en la base de socios.', type: 'error' });
      setIngresoDNI('');
      setProcesando(false);
      inputRef.current?.focus();
      return;
    }

    // Verificar membresía vencida
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fv = socio.fecha_venc ?? socio.fechaVenc;
    const fechaVencida = fv && fv !== '—' && !Number.isNaN(new Date(fv).getTime()) && new Date(fv) < hoy;
    const membresiaVencida = socio.estado === 'Vencida' || socio.estado === 'Vencido' || fechaVencida;

    const estadoAcceso = membresiaVencida ? 'Denegado' : 'Permitido';
    const motivoAcceso = membresiaVencida ? 'Membresía vencida — renovación requerida' : 'Membresía vigente';
    const dias = diasRestantes(fv);

    const payload = { socio_id: socio.id, nombre: socio.nombre, plan: socio.plan, estado_acceso: estadoAcceso };
    const { data, error } = await supabase.from('asistencias').insert([payload]).select('*').single();

    if (error) {
      addToast({ message: `Error al registrar acceso: ${error.message}`, type: 'error' });
      setIngresoDNI('');
      setProcesando(false);
      inputRef.current?.focus();
      return;
    }

    setHistorialAccesos((prev) => [data, ...prev.filter((x) => x.id !== data.id)]);
    membresiaVencida
      ? addToast({ message: `Acceso DENEGADO — ${socio.nombre}: membresía vencida.`, type: 'error' })
      : addToast({ message: `Acceso permitido para ${socio.nombre}.`, type: 'success' });

    setUltimoEscaneo({ nombre: socio.nombre, plan: socio.plan, avatar: socio.iniciales, estado: estadoAcceso, motivo: motivoAcceso, hora, dias });
    setIngresoDNI('');
    setProcesando(false);
    inputRef.current?.focus();
  };

  const permitido = ultimoEscaneo?.estado === 'Permitido';

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 bg-[#111827] min-h-[calc(100vh-64px)] flex flex-col gap-6">

      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-blue-500" size={32} /> Control de Acceso
          </h1>
          <p className="text-gray-400 mt-1 text-sm font-medium">
            Terminal de recepción · verificación de membresía en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-sm">{socios.length} socios</span>
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 font-bold text-sm uppercase tracking-wider">En Línea</span>
          </div>
        </div>
      </div>

      {/* ── INPUT ESCÁNER (protagonista) ──────────────────────────────────────── */}
      <form onSubmit={registrarEntrada} className="w-full">
        <div className="relative">
          <IdCard className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={28} />
          <input
            ref={inputRef}
            type="text"
            autoFocus
            autoComplete="off"
            placeholder="Ingresar DNI del socio..."
            value={ingresoDNI}
            onChange={(e) => setIngresoDNI(e.target.value)}
            className="w-full bg-[#1e293b] border-2 border-gray-700 focus:border-blue-500 text-white rounded-2xl pl-16 pr-44 py-5 text-2xl font-bold tracking-wider placeholder-gray-600 focus:outline-none transition-colors shadow-xl"
          />
          <button
            type="submit"
            disabled={!ingresoDNI.trim() || procesando}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            {procesando
              ? <><Loader2 size={16} className="animate-spin" /> Verificando...</>
              : <>Registrar <ArrowRight size={16} /></>}
          </button>
        </div>
      </form>

      {/* ── TARJETA DE RESULTADO ─────────────────────────────────────────────── */}
      <div className="w-full">
        {ultimoEscaneo ? (
          <div
            key={ultimoEscaneo.hora + ultimoEscaneo.nombre}
            className={`rounded-3xl border-2 p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden ${
              permitido
                ? 'bg-green-950/60 border-green-500/60'
                : 'bg-red-950/60 border-red-500/60'
            }`}
          >
            {/* Glow de fondo */}
            <div className={`absolute inset-0 pointer-events-none ${
              permitido
                ? 'bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.08)_0%,transparent_70%)]'
                : 'bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.12)_0%,transparent_70%)]'
            }`} />

            <div className="relative flex flex-col md:flex-row items-center gap-8">

              {/* Avatar + icono de estado */}
              <div className="relative shrink-0">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl font-black shadow-2xl border-4 ${
                  permitido
                    ? 'bg-green-600 border-green-400 text-white'
                    : 'bg-red-600 border-red-400 text-white'
                }`}>
                  {ultimoEscaneo.avatar ?? '?'}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-10 h-10 rounded-full border-4 border-[#111827] flex items-center justify-center ${
                  permitido ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {permitido
                    ? <CheckCircle2 size={20} className="text-white" />
                    : <AlertTriangle size={20} className="text-white" />}
                </div>
              </div>

              {/* Info central */}
              <div className="flex-1 text-center md:text-left">
                {/* Banner de estado */}
                <div className={`inline-flex items-center gap-3 px-6 py-2.5 rounded-full font-black text-lg tracking-widest uppercase mb-4 ${
                  permitido
                    ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                    : 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                }`}>
                  {permitido
                    ? <><ShieldCheck size={22} /> ACCESO PERMITIDO</>
                    : <><ShieldX size={22} /> ACCESO DENEGADO</>}
                </div>

                <h2 className="text-4xl font-black text-white mb-1">{ultimoEscaneo.nombre}</h2>
                <p className={`text-lg font-semibold mb-3 ${permitido ? 'text-green-300/80' : 'text-red-300/80'}`}>
                  {ultimoEscaneo.plan}
                </p>

                {/* Motivo / Días restantes */}
                <div className="flex flex-wrap items-center gap-3">
                  {permitido && ultimoEscaneo.dias != null && (
                    <span className="inline-flex items-center gap-2 bg-green-500/15 text-green-300 border border-green-500/30 px-4 py-1.5 rounded-full text-sm font-bold">
                      <CalendarCheck size={15} />
                      {ultimoEscaneo.dias === 0
                        ? 'Vence hoy'
                        : `${ultimoEscaneo.dias} día${ultimoEscaneo.dias !== 1 ? 's' : ''} restante${ultimoEscaneo.dias !== 1 ? 's' : ''}`}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border ${
                    permitido
                      ? 'bg-gray-800/60 text-gray-300 border-gray-700'
                      : 'bg-red-900/40 text-red-300 border-red-700/50'
                  }`}>
                    {permitido ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                    {ultimoEscaneo.motivo}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-gray-500 text-sm">
                    <Clock size={13} /> {ultimoEscaneo.hora}
                  </span>
                </div>
              </div>

              {/* Botón Renovar (solo si denegado) */}
              {!permitido && (
                <div className="shrink-0">
                  <button
                    onClick={() => setShowRenovarModal(true)}
                    className="flex flex-col items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-5 rounded-2xl font-black text-base shadow-xl shadow-red-600/30 transition-all active:scale-95 border border-red-400/30"
                  >
                    <RotateCcw size={24} />
                    Renovar Ahora
                  </button>
                  <p className="text-xs text-red-400/60 text-center mt-2 font-medium">Abre el cobro</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Estado de espera */
          <div className="bg-[#1e293b]/50 border-2 border-dashed border-gray-700/50 rounded-3xl p-12 flex flex-col items-center justify-center text-center min-h-[220px]">
            <Zap size={56} className="text-gray-700 mb-4" />
            <p className="text-xl font-bold text-gray-600">Esperando escaneo...</p>
            <p className="text-sm text-gray-700 mt-1">Ingresa el DNI en el campo de arriba o usa la lectora de códigos</p>
          </div>
        )}
      </div>

      {/* ── HISTORIAL DE ACCESOS ─────────────────────────────────────────────── */}
      <div className="bg-[#1e293b] rounded-2xl border border-gray-800 shadow-xl flex flex-col overflow-hidden flex-1 min-h-0">
        <div className="p-4 border-b border-gray-800 bg-[#141b2d]/50 flex justify-between items-center shrink-0">
          <h2 className="text-white font-bold flex items-center gap-2">
            <History className="text-blue-500" size={18} /> Historial de la Sesión
          </h2>
          <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs font-bold">
            {historialSesion.length} registros
          </span>
        </div>

        <div className="overflow-x-auto flex-1">
          {historialSesion.length === 0 ? (
            <div className="p-12 text-center text-gray-600 opacity-50">
              <History size={40} className="mx-auto mb-3" />
              <p className="text-sm">Sin accesos registrados en esta sesión.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                  <th className="p-4 pl-6 font-semibold">Hora</th>
                  <th className="p-4 font-semibold">Socio</th>
                  <th className="p-4 font-semibold">Plan</th>
                  <th className="p-4 font-semibold text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {historialSesion.map((acceso, idx) => {
                  const esPermitido = (acceso.estado_acceso ?? acceso.estado) === 'Permitido';
                  const iniciales = (acceso.nombre ?? '?').split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <tr key={acceso.id ?? idx} className={`hover:bg-gray-800/40 transition-colors ${idx === 0 ? 'bg-blue-900/10' : ''}`}>
                      <td className="p-4 pl-6">
                        <span className="flex items-center gap-1.5 text-sm font-bold text-gray-400">
                          <Clock size={13} />
                          {acceso.created_at
                            ? new Date(acceso.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            esPermitido ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                          }`}>
                            {iniciales}
                          </div>
                          <p className="font-bold text-white text-sm">{acceso.nombre ?? '—'}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-400">{acceso.plan ?? '—'}</p>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          esPermitido
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {esPermitido ? <UserCheck size={12} /> : <UserX size={12} />}
                          {acceso.estado_acceso ?? acceso.estado ?? '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── MODAL RENOVAR ──────────────────────────────────────────────────────── */}
      {showRenovarModal && <MembershipModal closeModal={() => { setShowRenovarModal(false); inputRef.current?.focus(); }} />}
    </div>
  );
};

export default ControlAcceso;
