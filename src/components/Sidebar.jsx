import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { 
  LayoutDashboard, Users, Tags,
  Package, ShoppingCart, Wallet, FileText, ShieldCheck,
  CreditCard, Settings, ChevronDown, ChevronRight,
  UserCheck, Activity, BellRing, RotateCcw, MessageSquare, ChevronLeft, Bot
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const [sociosMenuOpen, setSociosMenuOpen] = useState(true);
  const { theme, t } = useGym();

  if (collapsed) return null; // Si requieres la versión colapsada (solo íconos), dímelo y la implementamos. Por ahora se oculta.

  // Helper para generar las clases de los botones principales
  const navBtnClasses = (tabName) => `
    w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2
    ${activeTab === tabName 
      ? 'bg-blue-600/10 text-blue-500 border-blue-500'
      : `${theme === 'dark' ? 'border-transparent text-slate-400 hover:bg-slate-800/70 hover:text-white' : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
  `;

  // Helper para los sub-botones de Socios
  const subNavBtnClasses = (tabName) => `
    w-full flex items-center gap-3 px-4 py-2.5 pl-11 text-sm transition-colors border-l-2 border-transparent
    ${activeTab === tabName 
      ? 'text-blue-400 bg-blue-500/10'
      : `${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
  `;

  return (
    <aside className={`w-64 flex flex-col h-screen border-r shrink-0 custom-scrollbar overflow-y-auto ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
      
      {/* Header Sidebar (Logo y Botón colapsar) */}
      <div className={`flex items-center justify-between px-6 py-5 border-b sticky top-0 z-10 ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <h1 className="text-xl font-bold text-blue-500 tracking-wide">Nexus-Q</h1>
        <button onClick={() => setCollapsed(true)} className={`${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'} transition-colors`}>
          <ChevronLeft size={20} />
        </button>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1">
        
        {/* DASHBOARD */}
        <button onClick={() => setActiveTab('dashboard')} className={navBtnClasses('dashboard')}>
          <LayoutDashboard size={18} />
          <span>{t('dashboard')}</span>
        </button>

        {/* MÓDULO SOCIOS (Desplegable) */}
        <div className="flex flex-col">
          <button 
            onClick={() => setSociosMenuOpen(!sociosMenuOpen)} 
            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors border-l-2 ${['socios', 'metricas', 'alertas', 'reactivacion', 'mensajes', 'nexusai'].includes(activeTab) || sociosMenuOpen ? `${theme === 'dark' ? 'border-transparent text-white bg-slate-800/60' : 'border-transparent text-slate-800 bg-slate-100'}` : `${theme === 'dark' ? 'border-transparent text-slate-400 hover:bg-slate-800/70' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}`}
          >
            <div className="flex items-center gap-3">
              <Users size={18} />
              <span>{t('members')}</span>
            </div>
            {sociosMenuOpen ? <ChevronDown size={16} className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}/> : <ChevronRight size={16} className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}/>}
          </button>

          {/* Sub-menú Socios */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${sociosMenuOpen ? 'max-h-[500px] py-1' : 'max-h-0'}`}>
            <button onClick={() => setActiveTab('socios')} className={subNavBtnClasses('socios')}>
              <UserCheck size={16} /> {t('members')}
            </button>
            <button onClick={() => setActiveTab('metricas')} className={subNavBtnClasses('metricas')}>
              <Activity size={16} /> Métricas
            </button>
            <button onClick={() => setActiveTab('alertas')} className={subNavBtnClasses('alertas')}>
              <BellRing size={16} /> Alertas de Inactividad
            </button>
            <button onClick={() => setActiveTab('reactivacion')} className={subNavBtnClasses('reactivacion')}>
              <RotateCcw size={16} /> Reactivación
            </button>
            <button onClick={() => setActiveTab('mensajes')} className={subNavBtnClasses('mensajes')}>
              <MessageSquare size={16} /> Mensajes
            </button>
            <button onClick={() => setActiveTab('nexusai')} className={subNavBtnClasses('nexusai')}>
              <Bot size={16} className={activeTab === 'nexusai' ? 'text-blue-400' : ''} />
              <span className={activeTab === 'nexusai' ? 'text-blue-400 font-bold' : ''}>Nexus-AI</span>
            </button>
          </div>
        </div>

        {/* RESTO DE SECCIONES PRINCIPALES */}
        <div className={`pt-2 mt-2 border-t ${theme === 'dark' ? 'border-slate-700/60' : 'border-slate-200'}`}>
          <button onClick={() => setActiveTab('planes')} className={navBtnClasses('planes')}><Tags size={18} /><span>Planes</span><ChevronRight size={14} className={`ml-auto ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}/></button>
          <button onClick={() => setActiveTab('productos')} className={navBtnClasses('productos')}><Package size={18} /><span>Productos</span></button>
          <button onClick={() => setActiveTab('puntoventa')} className={navBtnClasses('puntoventa')}><ShoppingCart size={18} /><span>Punto de Venta</span></button>
          <button onClick={() => setActiveTab('caja')} className={navBtnClasses('caja')}><Wallet size={18} /><span>Caja</span></button>
          <button onClick={() => setActiveTab('facturacion')} className={navBtnClasses('facturacion')}><FileText size={18} /><span>Facturación</span></button>
          <button onClick={() => setActiveTab('controlacceso')} className={navBtnClasses('controlacceso')}><ShieldCheck size={18} /><span>Control de Acceso</span><ChevronRight size={14} className={`ml-auto ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}/></button>
        </div>
      </nav>

      {/* FOOTER SIDEBAR */}
      <div className={`border-t py-2 ${theme === 'dark' ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
        <button onClick={() => setActiveTab('pagos')} className={navBtnClasses('pagos')}><CreditCard size={18} className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}/><span>Pagos</span></button>
        <button onClick={() => setActiveTab('ajustes')} className={navBtnClasses('ajustes')}><Settings size={18} className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}/><span>Ajustes</span><ChevronRight size={14} className={`ml-auto ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}/></button>
      </div>

    </aside>
  );
};

export default Sidebar;