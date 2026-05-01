import React, { useState } from 'react';
import { useGym } from 'src/context/GymContext.jsx';
import { 
  UserPlus, ShoppingCart, CheckSquare, MessageCircle, 
  Download, Users, CalendarDays, Clock, 
  AlertTriangle, CheckCircle, XCircle, X, CreditCard, UserCheck
} from 'lucide-react';

const Dashboard = () => {
  const PRODUCT_PRICES = {
    'Proteína Iso Whey 1kg (S/ 80)': 80,
    'Proteína Iso Whey 3kg (S/ 200)': 200,
    'Whey Pro 1kg (S/ 70)': 70,
    'Creatina Universe Nutrition 500g (S/ 60)': 60
  };

  const PLANES_MEMBRESIA = [
    'Mensual (S/ 100)',
    '3 Meses Promo (S/ 250)',
    '6 Meses Promo (S/ 450)',
    'Anual (S/ 720)',
  ];

  const getDiasByPlan = (planStr) => {
    const p = String(planStr || '').toLowerCase();
    if (p.includes('anual')) return 360;
    if (p.includes('6 meses')) return 180;
    if (p.includes('3 meses')) return 90;
    return 30;
  };

  const PRODUCTOS_VENTA = Object.keys(PRODUCT_PRICES);

  // --- CONEXIÓN AL CEREBRO GLOBAL ---
  const { socios, agregarSocio, registrarVenta, realizarCheckIn, asistencias, ventas, dashboardMetrics, theme, t } = useGym();

  // --- ESTADOS DE NAVEGACIÓN INTERNA ---
  const [activeHealthTab, setActiveHealthTab] = useState('vencidas');
  
  // --- ESTADOS PARA MODALES ---
  const [showModalSocio, setShowModalSocio] = useState(false);
  const [showModalVenta, setShowModalVenta] = useState(false);
  const [showModalCheckIn, setShowModalCheckIn] = useState(false);

  // --- ESTADOS PARA FORMULARIOS ---
  const [formData, setFormData] = useState({ nombre: '', dni: '', tel: '', plan: PLANES_MEMBRESIA[0] });
  const [ventaData, setVentaData] = useState({ producto: PRODUCTOS_VENTA[0], monto: PRODUCT_PRICES[PRODUCTOS_VENTA[0]], metodo: 'Efectivo', cantidad: 1 });
  const [checkInDni, setCheckInDni] = useState('');
  const [checkInResult, setCheckInResult] = useState(null);

  // --- LÓGICA DE FILTRADO (Diferenciando por días como pide el video) ---
  const sociosVencidos = socios.filter(s => s.estado === 'Vencida');
  const socios0a7 = socios.filter(s => s.dias > 0 && s.dias <= 7);
  const socios8a15 = socios.filter(s => s.dias > 7 && s.dias <= 15);
  const socios15Plus = socios.filter(s => s.dias > 15);

  const getActiveData = () => {
    switch(activeHealthTab) {
      case 'vencidas': return { data: sociosVencidos, color: 'red', label: 'SEGUIMIENTO REQUERIDO' };
      case '0-7': return { data: socios0a7, color: 'orange', label: 'PRÓXIMOS A VENCER' };
      case '8-15': return { data: socios8a15, color: 'yellow', label: 'ALERTA PREVENTIVA' };
      case '15+': return { data: socios15Plus, color: 'green', label: 'SOCIOS AL DÍA' };
      default: return { data: [], color: 'gray', label: '' };
    }
  };

  const currentView = getActiveData();

  const sociosActivos = socios.filter(s => s.estado === 'Activo');

  // --- ACCIONES ---
  const handleWhatsApp = (socio) => {
    let mensaje = socio.estado === 'Vencida' 
      ? `¡Hola ${socio.nombre}! Tu membresía venció el ${socio.fechaVenc}. ¡Vuelve a entrenar con nosotros! 💪`
      : `¡Hola ${socio.nombre}! Te recordamos que tu plan vence pronto (${socio.fechaVenc}). ¡No pierdas el ritmo!`;
    window.open(`https://wa.me/${socio.tel}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const submitSocio = (e) => {
    e.preventDefault();
    agregarSocio({
      ...formData,
      dias: getDiasByPlan(formData.plan),
      estado: 'Activo',
      apto: true,
      mail: `${formData.dni.trim()}@socio.local`,
    });
    setShowModalSocio(false);
    setFormData({ nombre: '', dni: '', tel: '', plan: PLANES_MEMBRESIA[0] });
  };

  const submitVenta = (e) => {
    e.preventDefault();
    registrarVenta({
      concepto: `Venta: ${ventaData.cantidad}x ${ventaData.producto}`,
      monto: ventaData.monto * ventaData.cantidad,
      metodo: ventaData.metodo,
      tipo: 'ingreso',
    });
    setShowModalVenta(false);
  };

  const submitCheckIn = async (e) => {
    e.preventDefault();
    const res = await realizarCheckIn(checkInDni.trim());
    setCheckInResult(res.success ? 'success' : 'error');
    setTimeout(() => {
      setCheckInResult(null);
      setCheckInDni('');
      if (res.success) setShowModalCheckIn(false);
    }, 2500);
  };

  const onChangeProducto = (value) => {
    setVentaData(prev => ({
      ...prev,
      producto: value,
      monto: PRODUCT_PRICES[value] ?? 0
    }));
  };

  return (
    <div className={`p-6 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      
      {/* HEADER */}
      <div className={`border-b pb-5 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
        <h1 className={`text-3xl font-extrabold mb-1.5 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{t('dashboard')}</h1>
        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t('dashboardDescription')}</p>
      </div>
      
      {/* TARJETAS KPI — datos en vivo desde dashboardMetrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          theme={theme}
          title={t('activeMembers')}
          value={dashboardMetrics.sociosActivos}
          sub={`${dashboardMetrics.totalSocios} total · ${dashboardMetrics.nuevosEsteMes} nuevos este mes`}
          icon={Users}
          color="green"
        />
        <StatCard
          theme={theme}
          title="Ingresos del Mes"
          value={`S/ ${dashboardMetrics.ingresosEsteMes.toLocaleString('es-PE')}`}
          sub={`Total acumulado: S/ ${dashboardMetrics.totalIngresos.toLocaleString('es-PE')} · ${dashboardMetrics.totalVentas} transacciones`}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          theme={theme}
          title={t('attendancesToday')}
          value={asistencias.length}
          sub="Check-ins de esta sesión"
          icon={CalendarDays}
          color="purple"
        />
      </div>

      {/* ACCIONES RÁPIDAS */}
      <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-md'} p-6 rounded-2xl border`}>
        <h2 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{t('quickActions')}</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <ActionButton theme={theme} onClick={() => setShowModalSocio(true)} label={t('newMember')} icon={UserPlus} iconColor="blue" />
          <ActionButton theme={theme} onClick={() => setShowModalVenta(true)} label={t('registerSale')} icon={ShoppingCart} iconColor="green" />
          <ActionButton theme={theme} onClick={() => setShowModalCheckIn(true)} label={t('register')} icon={CheckSquare} iconColor="purple" />
        </div>
      </div>

      {/* SALUD DE MEMBRESÍAS */}
      <div>
        <h2 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{t('membershipHealth')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <HealthTab theme={theme} title={t('expired')} count={sociosVencidos.length} color="red" icon={XCircle} active={activeHealthTab === 'vencidas'} onClick={() => setActiveHealthTab('vencidas')} />
          <HealthTab theme={theme} title={t('nextToExpire')} count={socios0a7.length} color="orange" icon={AlertTriangle} active={activeHealthTab === '0-7'} onClick={() => setActiveHealthTab('0-7')} />
          <HealthTab theme={theme} title={t('preventiveAlert')} count={socios8a15.length} color="yellow" icon={Clock} active={activeHealthTab === '8-15'} onClick={() => setActiveHealthTab('8-15')} />
          <HealthTab theme={theme} title={t('upToDate')} count={socios15Plus.length} color="green" icon={CheckCircle} active={activeHealthTab === '15+'} onClick={() => setActiveHealthTab('15+')} />
        </div>

        <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-md'} rounded-2xl border overflow-hidden min-h-[200px]`}>
          <div className={`p-4 border-b flex justify-between items-center ${theme === 'dark' ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
             <h4 className={`font-bold text-xs uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>MOSTRANDO: {currentView.label}</h4>
             {activeHealthTab === '15+' && currentView.data.length > 0 && (
               <button onClick={() => alert("Descargando CSV...")} className="flex items-center gap-2 text-xs text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg font-bold hover:bg-green-500/10 transition-all"><Download size={14} /> Exportar CSV</button>
             )}
          </div>

          <div className="p-2">
            {currentView.data.length === 0 ? (
              <div className={`p-12 text-center text-sm font-medium italic ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>No hay socios en esta categoría actualmente.</div>
            ) : (
              currentView.data.map((socio) => (
                <div key={socio.id} className={`flex flex-col md:flex-row items-center justify-between p-4 rounded-xl transition-colors border-b last:border-0 gap-4 ${theme === 'dark' ? 'hover:bg-slate-700/40 border-slate-700/50' : 'hover:bg-slate-100 border-slate-200'}`}>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-black border ${theme === 'dark' ? 'bg-slate-700 text-slate-400 border-slate-600' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{socio.iniciales}</div>
                    <div>
                      <p className={`font-bold text-base ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{socio.nombre}</p>
                      <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{socio.plan}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full md:w-auto md:gap-8">
                    <div className="text-left md:text-right">
                        <p className={`text-sm font-bold text-${currentView.color}-400 uppercase`}>
                            {socio.estado === 'Vencida' ? 'Vencida' : `Vence en ${socio.dias} días`}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Fecha: {socio.fechaVenc}</p>
                    </div>
                    {socio.estado !== 'Activo' || socio.dias <= 7 ? (
                      <button onClick={() => handleWhatsApp(socio)} className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all"><MessageCircle size={18} /> Recordatorio</button>
                    ) : <div className="w-[140px]"></div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL: NUEVO SOCIO */}
      {showModalSocio && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-md'} rounded-2xl w-full max-w-lg border animate-in zoom-in-95`}>
            <div className={`flex justify-between items-center p-5 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
              <h2 className={`text-xl font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}><UserPlus className="text-blue-500" size={20}/> {t('quickMemberSignup')}</h2>
              <button onClick={() => setShowModalSocio(false)} className={`${theme === 'dark' ? 'text-slate-400 hover:text-white bg-slate-700' : 'text-slate-500 hover:text-slate-800 bg-slate-100'} p-1.5 rounded-lg`}><X size={20}/></button>
            </div>
            <form onSubmit={submitSocio} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t('fullName')}</label><input type="text" required placeholder="Ej. Juan Pérez" className={`w-full border rounded-lg p-3 mt-1 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} value={formData.nombre} onChange={e=>setFormData({...formData, nombre:e.target.value})} /></div>
                <div><label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>DNI</label><input type="text" required placeholder="12345678" className={`w-full border rounded-lg p-3 mt-1 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} value={formData.dni} onChange={e=>setFormData({...formData, dni:e.target.value})} /></div>
                <div><label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t('phone')}</label><input type="text" required placeholder="11 2233 4455" className={`w-full border rounded-lg p-3 mt-1 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} value={formData.tel} onChange={e=>setFormData({...formData, tel:e.target.value})} /></div>
                <div className="col-span-2"><label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t('selectedPlan')}</label><select className={`w-full border rounded-lg p-3 mt-1 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} value={formData.plan} onChange={e=>setFormData({...formData, plan:e.target.value})}>{PLANES_MEMBRESIA.map((plan) => <option key={plan}>{plan}</option>)}</select></div>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold text-white mt-4 transition-all">{t('saveAndEnroll')}</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR VENTA */}
      {showModalVenta && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-md'} rounded-2xl w-full max-w-md border animate-in zoom-in-95`}>
            <div className={`flex justify-between items-center p-5 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
              <h2 className={`text-xl font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}><ShoppingCart className="text-green-500" size={20}/> {t('quickSale')}</h2>
              <button onClick={() => setShowModalVenta(false)} className={`${theme === 'dark' ? 'text-slate-400 hover:text-white bg-slate-700' : 'text-slate-500 hover:text-slate-800 bg-slate-100'} p-1.5 rounded-lg`}><X size={20}/></button>
            </div>
            <form onSubmit={submitVenta} className="p-6 space-y-4">
              <div><label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t('product')}</label><select className={`w-full border rounded-lg p-3 mt-1 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} value={ventaData.producto} onChange={e => onChangeProducto(e.target.value)}>{PRODUCTOS_VENTA.map((producto) => <option key={producto}>{producto}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t('amount')}</label><input type="number" min="1" className={`w-full border rounded-lg p-3 mt-1 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} value={ventaData.cantidad} onChange={e=>setVentaData({...ventaData, cantidad: parseInt(e.target.value, 10) || 1})}/></div>
                <div><label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t('method')}</label><select className={`w-full border rounded-lg p-3 mt-1 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} value={ventaData.metodo} onChange={e=>setVentaData({...ventaData, metodo: e.target.value})}><option>Efectivo</option><option>MercadoPago</option></select></div>
              </div>
              <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'} p-4 rounded-xl border flex justify-between items-center`}><span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-bold`}>{t('totalToCharge')}</span><span className="text-2xl font-black text-green-500">S/ {(ventaData.monto * ventaData.cantidad).toLocaleString()}</span></div>
              <button type="submit" className="w-full bg-green-600 hover:bg-green-500 py-4 rounded-xl font-bold text-white mt-2 flex items-center justify-center gap-2"><CreditCard size={20}/> {t('processPayment')}</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHECK-IN */}
      {showModalCheckIn && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-md'} rounded-2xl w-full max-w-sm border p-6 animate-in zoom-in-95`}>
            <h2 className={`text-xl font-bold mb-4 text-center flex items-center justify-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}><CheckSquare className="text-purple-500" size={24}/> {t('accessCheckin')}</h2>
            {!checkInResult ? (
              <form onSubmit={submitCheckIn} className="space-y-4">
                <p className={`text-sm text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Ingresa el DNI del socio para validar su ingreso.</p>
                <input type="text" autoFocus placeholder="DNI del socio..." required className={`w-full border-2 rounded-xl p-4 text-center font-bold text-2xl outline-none focus:border-purple-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} value={checkInDni} onChange={e=>setCheckInDni(e.target.value)} />
                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-xl font-bold text-white transition-all">{t('verifyAccess')}</button>
                <button type="button" onClick={()=>setShowModalCheckIn(false)} className={`w-full font-bold py-2 ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>{t('cancel')}</button>
              </form>
            ) : (
              <div className="text-center py-6 animate-in zoom-in">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 border-4 ${checkInResult === 'success' ? 'bg-green-500/10 text-green-500 border-green-500' : 'bg-red-500/10 text-red-500 border-red-500'}`}>
                  {checkInResult === 'success' ? <UserCheck size={48}/> : <AlertTriangle size={48}/>}
                </div>
                <h3 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{checkInResult === 'success' ? 'BIENVENIDO' : 'DENEGADO'}</h3>
                <p className={`font-bold mt-2 ${checkInResult === 'success' ? 'text-green-400' : 'text-red-400'}`}>{checkInResult === 'success' ? 'Socio con plan activo' : 'Verificar estado del socio'}</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

// --- COMPONENTES AUXILIARES ---
const ActionButton = ({ theme, onClick, label, icon: Icon, iconColor }) => (
  <button onClick={onClick} className={`flex-1 border p-5 rounded-xl flex items-center justify-center gap-3 transition-all font-bold group ${theme === 'dark' ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'}`}>
    <Icon size={22} className={`text-${iconColor}-500 group-hover:scale-110 transition-transform`} /> {label}
  </button>
);

const StatCard = ({ theme, title, value, sub, icon: Icon, color }) => (
  <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-md'} p-6 rounded-2xl border flex justify-between items-center group transition-all`}>
    <div>
      <h3 className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{title}</h3>
      <p className={`text-4xl font-extrabold tracking-tight leading-none mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{value}</p>
      <p className={`text-[11px] font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>{sub}</p>
    </div>
    <div className={`w-14 h-14 rounded-full bg-${color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform`}><Icon className={`text-${color}-500`} size={28} /></div>
  </div>
);

const HealthTab = ({ theme, title, count, color, icon: Icon, active, onClick }) => (
  <button onClick={onClick} className={`p-5 rounded-2xl border text-left transition-all relative ${active ? `${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'} border-${color}-500/60 shadow-2xl` : `${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300 shadow-md'}`}`}>
    <div className="flex justify-between items-center mb-3"><span className={`${active ? `text-${color}-400` : `${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} font-black text-xs uppercase tracking-widest`}>{title}</span><Icon size={18} className={active ? `text-${color}-400` : `${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} /></div>
    <p className={`text-3xl font-black leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{count}</p>
    {active && <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-${color}-500 rounded-t-full`}></div>}
  </button>
);

export default Dashboard;