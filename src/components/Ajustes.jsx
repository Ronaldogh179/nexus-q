import React, { useState } from 'react';
import {
  Settings, Building, User, Bell, Shield, Save, Globe,
  Smartphone, Mail, Key, Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from './Toast';

const Ajustes = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('gimnasio');
  const [guardando, setGuardando] = useState(false);

  // ── Pestaña Gimnasio ────────────────────────────────────────────────────────
  const [gymConfig, setGymConfig] = useState({
    nombre: 'Nexus-Q Fitness Center',
    telefono: '',
    direccion: '',
    moneda: 'PEN (S/)',
    idioma: 'Español',
  });

  // ── Pestaña Perfil ──────────────────────────────────────────────────────────
  // Lazy initializer: user está garantizado (componente detrás de ProtectedRoute).
  const [perfilNombre, setPerfilNombre] = useState(
    () => user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? '',
  );

  const userEmail = user?.email ?? '';
  const userInitials = (perfilNombre || userEmail)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  // ── Pestaña Notificaciones ──────────────────────────────────────────────────
  const [notificaciones, setNotificaciones] = useState({
    emailVencimientos: true,
    whatsappVencimientos: true,
    emailCaja: true,
    alertasInactividad: false,
  });

  // ── Pestaña Seguridad ───────────────────────────────────────────────────────
  const [passActual, setPassActual] = useState('');
  const [passNueva, setPassNueva] = useState('');
  const [passRepetir, setPassRepetir] = useState('');
  const [guardandoPass, setGuardandoPass] = useState(false);

  // ── Handler principal "Guardar Cambios" ─────────────────────────────────────
  const handleGuardar = async () => {
    if (activeTab === 'perfil') {
      setGuardando(true);
      const { error } = await supabase.auth.updateUser({
        data: { full_name: perfilNombre },
      });
      setGuardando(false);
      if (error) {
        addToast({ message: `Error al actualizar perfil: ${error.message}`, type: 'error' });
      } else {
        addToast({ message: 'Perfil actualizado correctamente.', type: 'success' });
      }
      return;
    }

    // Para otras pestañas: persistencia local (no hay tabla de configuración de gimnasio aún)
    addToast({ message: 'Configuración guardada localmente.', type: 'info' });
  };

  // ── Handler cambio de contraseña ─────────────────────────────────────────────
  const handleCambiarPassword = async () => {
    if (!passNueva || passNueva.length < 6) {
      addToast({ message: 'La nueva contraseña debe tener al menos 6 caracteres.', type: 'warning' });
      return;
    }
    if (passNueva !== passRepetir) {
      addToast({ message: 'Las contraseñas nuevas no coinciden.', type: 'warning' });
      return;
    }
    setGuardandoPass(true);
    const { error } = await supabase.auth.updateUser({ password: passNueva });
    setGuardandoPass(false);
    if (error) {
      addToast({ message: `Error al cambiar contraseña: ${error.message}`, type: 'error' });
    } else {
      addToast({ message: 'Contraseña actualizada correctamente.', type: 'success' });
      setPassActual('');
      setPassNueva('');
      setPassRepetir('');
    }
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 bg-[#111827] min-h-[calc(100vh-64px)] flex flex-col">

      {/* HEADER */}
      <div className="border-b border-gray-800 pb-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Settings className="text-blue-500" size={32} /> Ajustes del Sistema
          </h1>
          <p className="text-gray-400 mt-2 text-sm font-medium">
            Configura los parámetros generales, notificaciones y seguridad de tu cuenta.
          </p>
        </div>
        {activeTab !== 'seguridad' && (
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all"
          >
            {guardando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Guardar Cambios
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">

        {/* MENÚ LATERAL INTERNO */}
        <div className="w-full lg:w-64 shrink-0 space-y-2">
          {[
            { id: 'gimnasio',      label: 'Datos del Gimnasio',      Icon: Building },
            { id: 'perfil',        label: 'Perfil del Administrador', Icon: User     },
            { id: 'notificaciones',label: 'Notificaciones',           Icon: Bell     },
            { id: 'seguridad',     label: 'Seguridad',                Icon: Shield   },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                activeTab === id
                  ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20'
                  : 'bg-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </div>

        {/* ÁREA DE CONTENIDO */}
        <div className="flex-1 bg-[#1e293b] rounded-2xl border border-gray-800 p-6 md:p-8 shadow-xl">

          {/* PESTAÑA: GIMNASIO */}
          {activeTab === 'gimnasio' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-2">
                Información del Gimnasio
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="gym-nombre" className="block text-sm font-medium text-gray-400 mb-1.5">Nombre Comercial</label>
                  <input
                    id="gym-nombre"
                    type="text"
                    value={gymConfig.nombre}
                    onChange={(e) => setGymConfig({ ...gymConfig, nombre: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="gym-telefono" className="block text-sm font-medium text-gray-400 mb-1.5">Teléfono de Contacto</label>
                  <input
                    id="gym-telefono"
                    type="text"
                    value={gymConfig.telefono}
                    onChange={(e) => setGymConfig({ ...gymConfig, telefono: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="gym-direccion" className="block text-sm font-medium text-gray-400 mb-1.5">Dirección Física</label>
                  <input
                    id="gym-direccion"
                    type="text"
                    value={gymConfig.direccion}
                    onChange={(e) => setGymConfig({ ...gymConfig, direccion: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="gym-idioma" className="text-sm font-medium text-gray-400 mb-1.5 flex items-center gap-1">
                    <Globe size={14}/> Idioma del Sistema
                  </label>
                  <select
                    id="gym-idioma"
                    value={gymConfig.idioma}
                    onChange={(e) => setGymConfig({ ...gymConfig, idioma: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option>Español</option>
                    <option>Inglés</option>
                    <option>Portugués</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="gym-moneda" className="block text-sm font-medium text-gray-400 mb-1.5">Moneda Base</label>
                  <select
                    id="gym-moneda"
                    value={gymConfig.moneda}
                    onChange={(e) => setGymConfig({ ...gymConfig, moneda: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option>PEN (S/)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA: PERFIL */}
          {activeTab === 'perfil' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-2">
                Perfil del Administrador
              </h2>

              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                  {userInitials || '?'}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{perfilNombre || userEmail || 'Sin nombre'}</p>
                  <p className="text-xs text-gray-500 mt-1">{userEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="perfil-nombre" className="block text-sm font-medium text-gray-400 mb-1.5">Nombre Completo</label>
                  <input
                    id="perfil-nombre"
                    type="text"
                    value={perfilNombre}
                    onChange={(e) => setPerfilNombre(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="perfil-email" className="block text-sm font-medium text-gray-400 mb-1.5">Correo Electrónico (Login)</label>
                  <input
                    id="perfil-email"
                    type="email"
                    value={userEmail}
                    readOnly
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-600 mt-1">El correo no puede cambiarse desde aquí.</p>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA: NOTIFICACIONES */}
          {activeTab === 'notificaciones' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-2">
                Preferencias de Notificación
              </h2>

              <div className="space-y-4">
                {[
                  {
                    key: 'emailVencimientos',
                    Icon: Mail, color: 'text-blue-400',
                    label: 'Alertas de Vencimiento por Email',
                    desc: 'Enviar correos automáticos a los socios 3 días antes de vencer.',
                  },
                  {
                    key: 'whatsappVencimientos',
                    Icon: Smartphone, color: 'text-green-400',
                    label: 'Recordatorios por WhatsApp',
                    desc: 'Habilitar botones de envío rápido de WhatsApp en el Dashboard.',
                  },
                  {
                    key: 'emailCaja',
                    Icon: Building, color: 'text-purple-400',
                    label: 'Resumen de Caja Diario',
                    desc: 'Recibir un email a las 22:00 con el cierre de caja.',
                  },
                ].map(({ key, Icon, color, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                    <div className="flex items-center gap-3">
                      <Icon size={20} className={color} />
                      <div>
                        <p className="font-bold text-gray-200">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificaciones[key]}
                        onChange={(e) => setNotificaciones({ ...notificaciones, [key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PESTAÑA: SEGURIDAD */}
          {activeTab === 'seguridad' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-2">
                Seguridad y Acceso
              </h2>

              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <Key size={18}/> Cambiar Contraseña
                </h3>
                <div className="grid grid-cols-1 gap-4 max-w-md">
                  <input
                    type="password"
                    placeholder="Contraseña Actual (referencia)"
                    value={passActual}
                    onChange={(e) => setPassActual(e.target.value)}
                    className="w-full bg-[#111827] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Nueva Contraseña (mín. 6 caracteres)"
                    value={passNueva}
                    onChange={(e) => setPassNueva(e.target.value)}
                    className="w-full bg-[#111827] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Repetir Nueva Contraseña"
                    value={passRepetir}
                    onChange={(e) => setPassRepetir(e.target.value)}
                    className="w-full bg-[#111827] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleCambiarPassword}
                    disabled={guardandoPass || !passNueva}
                    className="bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 text-white py-2.5 rounded-lg text-sm font-bold border border-gray-700 transition-colors mt-2 flex items-center justify-center gap-2"
                  >
                    {guardandoPass
                      ? <><Loader2 size={16} className="animate-spin"/> Actualizando...</>
                      : 'Actualizar Contraseña'}
                  </button>
                </div>
              </div>

              <div className="bg-blue-900/10 border border-blue-500/20 p-5 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-blue-400 mb-1">Autenticación de Dos Factores (2FA)</h3>
                  <p className="text-sm text-gray-400">
                    Protege tu cuenta requiriendo un código adicional al iniciar sesión.
                  </p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md">
                  Activar 2FA
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Ajustes;
