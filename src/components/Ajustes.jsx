import React, { useState } from 'react';
import { Settings, Building, User, Bell, Shield, Save, Globe, Smartphone, Mail, Key } from 'lucide-react';

const Ajustes = () => {
  const [activeTab, setActiveTab] = useState('gimnasio');

  // Estados para simular los inputs
  const [gymConfig, setGymConfig] = useState({
    nombre: 'Nexus-Q Fitness Center',
    telefono: '+54 9 11 4444-5555',
    direccion: 'Av. Libertador 1234, CABA',
    moneda: 'ARS ($)',
    idioma: 'Español'
  });

  const [notificaciones, setNotificaciones] = useState({
    emailVencimientos: true,
    whatsappVencimientos: true,
    emailCaja: true,
    alertasInactividad: false
  });

  const handleGuardar = () => {
    alert('Configuración guardada exitosamente.');
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 bg-[#111827] min-h-[calc(100vh-64px)] flex flex-col">
      
      {/* HEADER */}
      <div className="border-b border-gray-800 pb-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Settings className="text-blue-500" size={32} /> Ajustes del Sistema
          </h1>
          <p className="text-gray-400 mt-2 text-sm font-medium">Configura los parámetros generales, notificaciones y seguridad de tu cuenta.</p>
        </div>
        <button 
          onClick={handleGuardar}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all"
        >
          <Save size={18} /> Guardar Cambios
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        
        {/* MENÚ LATERAL INTERNO */}
        <div className="w-full lg:w-64 shrink-0 space-y-2">
          <button 
            onClick={() => setActiveTab('gimnasio')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'gimnasio' ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'bg-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
          >
            <Building size={18} /> Datos del Gimnasio
          </button>
          <button 
            onClick={() => setActiveTab('perfil')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'perfil' ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'bg-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
          >
            <User size={18} /> Perfil del Administrador
          </button>
          <button 
            onClick={() => setActiveTab('notificaciones')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'notificaciones' ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'bg-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
          >
            <Bell size={18} /> Notificaciones
          </button>
          <button 
            onClick={() => setActiveTab('seguridad')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'seguridad' ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'bg-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
          >
            <Shield size={18} /> Seguridad
          </button>
        </div>

        {/* ÁREA DE CONTENIDO */}
        <div className="flex-1 bg-[#1e293b] rounded-2xl border border-gray-800 p-6 md:p-8 shadow-xl">
          
          {/* PESTAÑA: GIMNASIO */}
          {activeTab === 'gimnasio' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-2">Información del Gimnasio</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Nombre Comercial</label>
                  <input type="text" value={gymConfig.nombre} onChange={(e)=>setGymConfig({...gymConfig, nombre: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Teléfono de Contacto</label>
                  <input type="text" value={gymConfig.telefono} onChange={(e)=>setGymConfig({...gymConfig, telefono: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Dirección Física</label>
                  <input type="text" value={gymConfig.direccion} onChange={(e)=>setGymConfig({...gymConfig, direccion: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5 flex items-center gap-1"><Globe size={14}/> Idioma del Sistema</label>
                  <select value={gymConfig.idioma} onChange={(e)=>setGymConfig({...gymConfig, idioma: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500">
                    <option>Español</option>
                    <option>Inglés</option>
                    <option>Portugués</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Moneda Base</label>
                  <select value={gymConfig.moneda} onChange={(e)=>setGymConfig({...gymConfig, moneda: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500">
                    <option>ARS ($)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA: PERFIL */}
          {activeTab === 'perfil' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-2">Perfil del Administrador</h2>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg">MA</div>
                <div>
                  <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-bold border border-gray-700 transition-colors mb-2">Cambiar Avatar</button>
                  <p className="text-xs text-gray-500">Formato JPG o PNG. Tamaño máximo 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Nombre Completo</label>
                  <input type="text" defaultValue="Miguel Angel" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Correo Electrónico (Login)</label>
                  <input type="email" defaultValue="admin@nexus-q.com" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-400 focus:outline-none focus:border-blue-500 cursor-not-allowed" disabled />
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA: NOTIFICACIONES */}
          {activeTab === 'notificaciones' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-2">Preferencias de Notificación</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-3">
                    <Mail size={20} className="text-blue-400"/>
                    <div>
                      <p className="font-bold text-gray-200">Alertas de Vencimiento por Email</p>
                      <p className="text-xs text-gray-500">Enviar correos automáticos a los socios 3 días antes de vencer.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={notificaciones.emailVencimientos} onChange={(e) => setNotificaciones({...notificaciones, emailVencimientos: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-3">
                    <Smartphone size={20} className="text-green-400"/>
                    <div>
                      <p className="font-bold text-gray-200">Recordatorios por WhatsApp</p>
                      <p className="text-xs text-gray-500">Habilitar botones de envío rápido de WhatsApp en el Dashboard.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={notificaciones.whatsappVencimientos} onChange={(e) => setNotificaciones({...notificaciones, whatsappVencimientos: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-3">
                    <Building size={20} className="text-purple-400"/>
                    <div>
                      <p className="font-bold text-gray-200">Resumen de Caja Diario</p>
                      <p className="text-xs text-gray-500">Recibir un email a las 22:00hs con el cierre de caja de recepción.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={notificaciones.emailCaja} onChange={(e) => setNotificaciones({...notificaciones, emailCaja: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA: SEGURIDAD */}
          {activeTab === 'seguridad' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-2">Seguridad y Acceso</h2>
              
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><Key size={18}/> Cambiar Contraseña</h3>
                <div className="grid grid-cols-1 gap-4 max-w-md">
                  <input type="password" placeholder="Contraseña Actual" className="w-full bg-[#111827] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" />
                  <input type="password" placeholder="Nueva Contraseña" className="w-full bg-[#111827] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" />
                  <input type="password" placeholder="Repetir Nueva Contraseña" className="w-full bg-[#111827] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" />
                  <button className="bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg text-sm font-bold border border-gray-700 transition-colors mt-2">Actualizar Contraseña</button>
                </div>
              </div>

              <div className="bg-blue-900/10 border border-blue-500/20 p-5 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-blue-400 mb-1">Autenticación de Dos Factores (2FA)</h3>
                  <p className="text-sm text-gray-400">Protege tu cuenta requiriendo un código adicional al iniciar sesión.</p>
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