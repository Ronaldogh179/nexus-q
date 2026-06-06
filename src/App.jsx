import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { GymProvider, useGym } from './context/GymContext';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import { supabase } from './lib/supabase';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Socios from './components/Socios';
import Metricas from './components/Metricas';
import AlertasInactividad from './components/AlertasInactividad';
import Reactivacion from './components/Reactivacion';
import Mensajes from './components/Mensajes';
import Planes from './components/Planes';
import Caja from './components/Caja';
import ControlAcceso from './components/ControlAcceso';
import Ajustes from './components/Ajustes';
import NexusAI from './components/NexusAI';
import { Menu, Bell, Sun, Moon, Globe, LogOut } from 'lucide-react';

const getUserDisplayName = (user) => {
  const meta = user?.user_metadata ?? {};
  return meta.full_name || meta.name || user?.email?.split('@')[0] || 'Usuario';
};

const getUserInitials = (user) => {
  const name = getUserDisplayName(user);
  return name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U';
};

function AppContent() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const {
    theme,
    language,
    notificaciones,
    toggleTheme,
    toggleLanguage,
    limpiarNotificaciones,
    t
  } = useGym();

  const displayName = useMemo(() => getUserDisplayName(user), [user]);
  const initials = useMemo(() => getUserInitials(user), [user]);

  useEffect(() => {
    const testSupabaseConnection = async () => {
      const tables = ['socios', 'ventas', 'asistencias'];
      const checks = await Promise.all(
        tables.map(async (table) => {
          const { error } = await supabase.from(table).select('id', { head: true, count: 'exact' });
          return {
            table,
            ok: !error,
            error: error?.message ?? null,
          };
        })
      );

      console.log('[Nexus-Q] Supabase connection check:', checks);
    };

    void testSupabaseConnection();
  }, []);

  const handleSignOut = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('[Nexus-Q] Error al cerrar sesión:', err.message);
    } finally {
      setLoggingOut(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'socios': return <Socios />;
      case 'metricas': return <Metricas />;
      case 'alertas': return <AlertasInactividad />;
      case 'reactivacion': return <Reactivacion />;
      case 'mensajes': return <Mensajes />;
      case 'planes': return <Planes />;
      case 'caja': return <Caja />;
      case 'controlacceso': return <ControlAcceso />;
      case 'ajustes': return <Ajustes />;
      case 'nexusai': return <NexusAI />;
      default: return <Dashboard />;
    }
  };

  return (
    <div
      className={`flex h-screen font-sans overflow-hidden ${
        theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'
      }`}
    >
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} border-b h-16 flex items-center justify-between px-6 shrink-0 z-10`}>
          <div className="flex items-center gap-4">
            {sidebarCollapsed && <button onClick={() => setSidebarCollapsed(false)} className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}><Menu size={20} /></button>}
            <button onClick={toggleLanguage} className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} flex items-center gap-2`}>
              <Globe size={16} />
              <span className="text-sm font-medium">{language}</span>
            </button>
            <button onClick={toggleTheme} className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} ml-2`}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button onClick={() => setShowNotifications(prev => !prev)} className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} relative`}>
                <Bell size={20} />
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {notificaciones.length}
                </span>
              </button>
              {showNotifications && (
                <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-md'} absolute right-0 mt-2 w-72 rounded-xl border shadow-2xl z-50 p-4`}>
                  <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-3`}>{t('notifications')}</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {notificaciones.length > 0 ? (
                      notificaciones.map((msg, idx) => (
                        <p key={`${msg}-${idx}`} className={`${theme === 'dark' ? 'text-slate-300 bg-slate-700/40' : 'text-slate-700 bg-slate-100'} text-sm rounded-lg px-3 py-2`}>
                          {msg}
                        </p>
                      ))
                    ) : (
                      <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} text-sm`}>{t('noNotifications')}</p>
                    )}
                  </div>
                  <button
                    onClick={limpiarNotificaciones}
                    className="mt-3 w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                  >
                    {t('clear')}
                  </button>
                </div>
              )}
            </div>
            <div className={`flex items-center gap-3 pl-4 border-l ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold shadow-md shrink-0">{initials}</div>
              <span className={`text-sm font-medium truncate max-w-[140px] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} title={user?.email ?? displayName}>
                {displayName}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={loggingOut}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                  theme === 'dark'
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>
        <main className={`flex-1 overflow-y-auto custom-scrollbar ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function AppLayout() {
  return (
    <ToastProvider>
      <GymProvider>
        <AppContent />
      </GymProvider>
    </ToastProvider>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
