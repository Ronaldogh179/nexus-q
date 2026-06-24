import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { useRole } from '../context/RoleContext';
import {
  LayoutDashboard, Users, Tags,
  Wallet, ShieldCheck,
  Settings, ChevronDown, ChevronRight,
  UserCheck, Activity, BellRing, RotateCcw, ChevronLeft, Bot,
  ShoppingCart, FileText, CreditCard,
  HeartPulse, Dumbbell,
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const [sociosMenuOpen, setSociosMenuOpen] = useState(true);
  const [ventasMenuOpen, setVentasMenuOpen]   = useState(false);
  const [fitnessMenuOpen, setFitnessMenuOpen] = useState(false);
  const { theme, t } = useGym();
  const { puedeVer } = useRole();

  if (collapsed) return null;

  // ── Clases de botones ────────────────────────────────────────────────────
  const navBtnClasses = (tabName) => `
    w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2
    ${activeTab === tabName
      ? 'bg-blue-600/10 text-blue-500 border-blue-500'
      : `${theme === 'dark'
          ? 'border-transparent text-slate-400 hover:bg-slate-800/70 hover:text-white'
          : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
  `;

  const subNavBtnClasses = (tabName) => `
    w-full flex items-center gap-3 px-4 py-2.5 pl-11 text-sm transition-colors border-l-2 border-transparent
    ${activeTab === tabName
      ? 'text-blue-400 bg-blue-500/10'
      : `${theme === 'dark'
          ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
  `;

  const groupHeaderClasses = (tabs, menuOpen) => `
    w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors border-l-2
    ${tabs.some((t) => activeTab === t) || menuOpen
      ? `${theme === 'dark'
          ? 'border-transparent text-white bg-slate-800/60'
          : 'border-transparent text-slate-800 bg-slate-100'}`
      : `${theme === 'dark'
          ? 'border-transparent text-slate-400 hover:bg-slate-800/70'
          : 'border-transparent text-slate-500 hover:bg-slate-100'}`}
  `;

  const chevronClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  // ── Sub-ítems del módulo Socios filtrados por rol ────────────────────────
  const sociosSubItems = [
    { tab: 'socios',       label: t('members'),           Icon: UserCheck },
    { tab: 'metricas',     label: 'Métricas',             Icon: Activity  },
    { tab: 'alertas',      label: 'Alertas de Inactividad', Icon: BellRing },
    { tab: 'reactivacion', label: 'Reactivación',         Icon: RotateCcw },
    { tab: 'nexusai',      label: 'Nexus-AI',             Icon: Bot       },
  ].filter((item) => puedeVer(item.tab));

  // ── Sub-ítems de Ventas filtrados ────────────────────────────────────────
  const ventasSubItems = [
    { tab: 'facturacion', label: 'Facturación',       Icon: FileText  },
    { tab: 'pagos',       label: 'Métodos de Pago',   Icon: CreditCard },
  ].filter((item) => puedeVer(item.tab));

  // ── Sub-ítems de Fitness filtrados ───────────────────────────────────────
  const fitnessSubItems = [
    { tab: 'diagnosticos',  label: 'Diagnósticos',   Icon: HeartPulse },
    { tab: 'entrenamiento', label: 'Entrenamiento',  Icon: Dumbbell   },
  ].filter((item) => puedeVer(item.tab));

  return (
    <aside className={`w-64 flex flex-col h-screen border-r shrink-0 custom-scrollbar overflow-y-auto ${
      theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
    }`}>

      {/* Header */}
      <div className={`flex items-center justify-between px-6 py-5 border-b sticky top-0 z-10 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
      }`}>
        <h1 className="text-xl font-bold text-blue-500 tracking-wide">Nexus-Q</h1>
        <button
          onClick={() => setCollapsed(true)}
          className={`${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'} transition-colors`}
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1">

        {/* DASHBOARD — siempre visible */}
        <button onClick={() => setActiveTab('dashboard')} className={navBtnClasses('dashboard')}>
          <LayoutDashboard size={18} /><span>{t('dashboard')}</span>
        </button>

        {/* MÓDULO SOCIOS */}
        {sociosSubItems.length > 0 && (
          sociosSubItems.length === 1 ? (
            // Si solo se ve el ítem principal, mostrar como link directo (sin collapsible)
            <button onClick={() => setActiveTab('socios')} className={navBtnClasses('socios')}>
              <Users size={18} /><span>{t('members')}</span>
            </button>
          ) : (
            <div className="flex flex-col">
              <button
                onClick={() => setSociosMenuOpen(!sociosMenuOpen)}
                className={groupHeaderClasses(
                  sociosSubItems.map((i) => i.tab),
                  sociosMenuOpen
                )}
              >
                <div className="flex items-center gap-3"><Users size={18} /><span>{t('members')}</span></div>
                {sociosMenuOpen
                  ? <ChevronDown size={16} className={chevronClass} />
                  : <ChevronRight size={16} className={chevronClass} />}
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${sociosMenuOpen ? 'max-h-[400px] py-1' : 'max-h-0'}`}>
                {sociosSubItems.map(({ tab, label, Icon }) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={subNavBtnClasses(tab)}>
                    <Icon size={16} className={tab === 'nexusai' && activeTab === 'nexusai' ? 'text-blue-400' : ''} />
                    <span className={tab === 'nexusai' && activeTab === 'nexusai' ? 'text-blue-400 font-bold' : ''}>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )
        )}

        {/* SECCIÓN SECUNDARIA */}
        <div className={`pt-2 mt-2 border-t ${theme === 'dark' ? 'border-slate-700/60' : 'border-slate-200'}`}>

          {/* PLANES */}
          {puedeVer('planes') && (
            <button onClick={() => setActiveTab('planes')} className={navBtnClasses('planes')}>
              <Tags size={18} /><span>Planes</span>
              <ChevronRight size={14} className={`ml-auto ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
            </button>
          )}

          {/* CAJA */}
          {puedeVer('caja') && (
            <button onClick={() => setActiveTab('caja')} className={navBtnClasses('caja')}>
              <Wallet size={18} /><span>Caja</span>
            </button>
          )}

          {/* MÓDULO VENTAS */}
          {ventasSubItems.length > 0 && (
            <div className="flex flex-col">
              <button
                onClick={() => setVentasMenuOpen(!ventasMenuOpen)}
                className={groupHeaderClasses(ventasSubItems.map((i) => i.tab), ventasMenuOpen)}
              >
                <div className="flex items-center gap-3"><ShoppingCart size={18} /><span>Ventas</span></div>
                {ventasMenuOpen
                  ? <ChevronDown size={16} className={chevronClass} />
                  : <ChevronRight size={16} className={chevronClass} />}
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${ventasMenuOpen ? 'max-h-[200px] py-1' : 'max-h-0'}`}>
                {ventasSubItems.map(({ tab, label, Icon }) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={subNavBtnClasses(tab)}>
                    <Icon size={16} /> {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MÓDULO FITNESS */}
          {fitnessSubItems.length > 0 && (
            <div className="flex flex-col">
              <button
                onClick={() => setFitnessMenuOpen(!fitnessMenuOpen)}
                className={groupHeaderClasses(fitnessSubItems.map((i) => i.tab), fitnessMenuOpen)}
              >
                <div className="flex items-center gap-3"><Dumbbell size={18} /><span>Fitness</span></div>
                {fitnessMenuOpen
                  ? <ChevronDown size={16} className={chevronClass} />
                  : <ChevronRight size={16} className={chevronClass} />}
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${fitnessMenuOpen ? 'max-h-[140px] py-1' : 'max-h-0'}`}>
                {fitnessSubItems.map(({ tab, label, Icon }) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={subNavBtnClasses(tab)}>
                    <Icon size={16} /> {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CONTROL DE ACCESO */}
          {puedeVer('controlacceso') && (
            <button onClick={() => setActiveTab('controlacceso')} className={navBtnClasses('controlacceso')}>
              <ShieldCheck size={18} /><span>Control de Acceso</span>
              <ChevronRight size={14} className={`ml-auto ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
            </button>
          )}
        </div>
      </nav>

      {/* FOOTER */}
      <div className={`border-t py-2 ${theme === 'dark' ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
        <button onClick={() => setActiveTab('ajustes')} className={navBtnClasses('ajustes')}>
          <Settings size={18} className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} />
          <span>Ajustes</span>
          <ChevronRight size={14} className={`ml-auto ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
