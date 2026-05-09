import React, { useEffect, useMemo, useState } from 'react';
import { useGym } from 'src/context/GymContext.jsx';
import { supabase } from 'src/lib/supabase.js';
import { ShoppingCart, Search, Plus, Minus, Trash2, CreditCard, Banknote, User, Tag, ChevronRight } from 'lucide-react';

const PuntoVenta = () => {
  const { registrarVenta } = useGym();
  const [productosDb, setProductosDb] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const formatSoles = (value) =>
    Number(value ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  useEffect(() => {
    const fetchProductos = async () => {
      const { data, error } = await supabase.from('productos').select('*').order('id', { ascending: false });
      if (error) {
        console.error('[POS] Error cargando productos:', error.message);
        return;
      }
      setProductosDb(data ?? []);
    };

    void fetchProductos();
  }, []);

  const catalogo = useMemo(
    () =>
      (productosDb ?? []).map((p) => ({
        id: p.id,
        nombre: p.nombre ?? 'Producto',
        categoria: p.categoria ?? 'General',
        precio: Number(p.precio ?? 0),
        stock: Number(p.stock ?? 0),
        color: 'blue',
      })),
    [productosDb]
  );

  const categorias = useMemo(
    () => ['Todas', ...new Set(catalogo.map((p) => p.categoria).filter(Boolean))],
    [catalogo]
  );

  // Filtrado del catálogo
  const productosFiltrados = catalogo.filter(p => {
    const coincideTexto = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const coincideCat = categoriaFiltro === 'Todas' || p.categoria === categoriaFiltro;
    return coincideTexto && coincideCat;
  });

  // Funciones del Carrito
  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === producto.id);
      if (existe) {
        return prev.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const restarDelCarrito = (id) => {
    setCarrito(prev => {
      const existente = prev.find(item => item.id === id);
      if (existente.cantidad === 1) {
        return prev.filter(item => item.id !== id);
      }
      return prev.map(item => item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item);
    });
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(prev => prev.filter(item => item.id !== id));
  };

  // Cálculos
  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  const procesarVenta = async () => {
    if (carrito.length === 0) return;
    await registrarVenta({
      concepto: carrito.map((item) => `${item.cantidad}x ${item.nombre}`).join(' · '),
      monto: total,
      metodo: metodoPago,
      tipo: 'ingreso',
    });
    alert(`¡Venta registrada con éxito!\nTotal cobrado: S/ ${formatSoles(total)} en ${metodoPago}`);
    setCarrito([]); // Limpiar carrito
  };

  return (
    <div className="p-4 md:p-6 animate-in fade-in duration-500 bg-[#111827] min-h-[calc(100vh-64px)] flex flex-col">
      
      {/* HEADER */}
      <div className="border-b border-gray-800 pb-4 mb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <ShoppingCart className="text-blue-500" size={28} /> Punto de Venta (POS)
        </h1>
      </div>

      {/* CONTENEDOR PRINCIPAL: Catálogo (Izq) y Ticket (Der) */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* ================= PANEL IZQUIERDO: CATÁLOGO ================= */}
        <div className="flex-1 flex flex-col min-h-[500px] bg-[#1e293b] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
          
          {/* Buscador y Filtros */}
          <div className="p-4 border-b border-gray-800 bg-[#141b2d]/50">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Buscar producto por nombre o código de barras..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0f172a] border border-gray-700 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
              {categorias.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategoriaFiltro(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${categoriaFiltro === cat ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Productos Interactivos */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {productosFiltrados.map(prod => (
                <button 
                  key={prod.id} 
                  onClick={() => agregarAlCarrito(prod)}
                  className="bg-[#0f172a] border border-gray-800 hover:border-blue-500/50 rounded-xl p-4 flex flex-col items-center text-center transition-all hover:shadow-lg hover:-translate-y-1 group relative overflow-hidden"
                >
                  <div className={`w-16 h-16 rounded-full bg-${prod.color}-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Tag size={24} className={`text-${prod.color}-500`}/>
                  </div>
                  <h3 className="text-sm font-bold text-gray-200 leading-tight mb-1">{prod.nombre}</h3>
                  <p className="text-xs text-gray-500 mb-2">{prod.categoria}</p>
                  <p className="text-lg font-black text-white mt-auto">S/ {formatSoles(prod.precio)}</p>
                  
                  {/* Overlay de agregar */}
                  <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-blue-600 text-white rounded-full p-2 shadow-lg scale-0 group-hover:scale-100 transition-transform">
                      <Plus size={20} />
                    </div>
                  </div>
                </button>
              ))}
              {productosFiltrados.length === 0 && (
                <div className="col-span-full p-8 text-center text-sm text-gray-500">
                  No hay productos disponibles en Supabase para este filtro.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= PANEL DERECHO: TICKET / CARRITO ================= */}
        <div className="w-full lg:w-[400px] flex flex-col bg-[#1e293b] rounded-2xl border border-gray-800 shadow-xl overflow-hidden shrink-0">
          
          {/* Header Ticket (Cliente) */}
          <div className="p-4 border-b border-gray-800 bg-[#141b2d]/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-300 bg-gray-800 px-3 py-1.5 rounded-lg w-full cursor-pointer hover:bg-gray-700 transition-colors">
              <User size={16} className="text-blue-400"/>
              <span className="text-sm font-medium">Consumidor Final (Clic para asignar socio)</span>
              <ChevronRight size={16} className="ml-auto text-gray-500" />
            </div>
          </div>

          {/* Lista de Items (El Ticket) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[#0f172a]/30">
            {carrito.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                <ShoppingCart size={48} className="mb-4" />
                <p className="text-sm font-medium">El carrito está vacío</p>
                <p className="text-xs">Selecciona productos del catálogo</p>
              </div>
            ) : (
              carrito.map(item => (
                <div key={item.id} className="bg-[#1e293b] p-3 rounded-xl border border-gray-800 flex items-center justify-between shadow-sm">
                  <div className="flex-1 pr-3">
                    <p className="text-sm font-bold text-gray-200 leading-tight">{item.nombre}</p>
                    <p className="text-xs text-blue-400 font-bold mt-0.5">S/ {formatSoles(item.precio * item.cantidad)}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-[#0f172a] rounded-lg p-1 border border-gray-700">
                    <button onClick={() => restarDelCarrito(item.id)} className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"><Minus size={14}/></button>
                    <span className="w-6 text-center text-sm font-bold">{item.cantidad}</span>
                    <button onClick={() => agregarAlCarrito(item)} className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"><Plus size={14}/></button>
                  </div>
                  <button onClick={() => eliminarDelCarrito(item.id)} className="ml-2 p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 size={16}/>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Totales y Cobro (Footer del Ticket) */}
          <div className="bg-[#141b2d] border-t border-gray-800 p-5">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal ({totalItems} items)</span>
                <span>S/ {formatSoles(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Descuento</span>
                <span>S/ 0</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-800 mt-2">
                <span className="text-lg font-bold text-white">Total a Pagar</span>
                <span className="text-3xl font-black text-green-400">S/ {formatSoles(total)}</span>
              </div>
            </div>

            {/* Selector de Método de Pago */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button 
                onClick={() => setMetodoPago('Efectivo')}
                className={`py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors border ${metodoPago === 'Efectivo' ? 'bg-green-600/20 text-green-400 border-green-500/50' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}`}
              >
                <Banknote size={16}/> Efectivo
              </button>
              <button 
                onClick={() => setMetodoPago('Mercado Pago')}
                className={`py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors border ${metodoPago === 'Mercado Pago' ? 'bg-blue-600/20 text-blue-400 border-blue-500/50' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}`}
              >
                <CreditCard size={16}/> Mercado Pago
              </button>
            </div>

            <button 
              onClick={procesarVenta}
              disabled={carrito.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all text-lg flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              Cobrar S/ {formatSoles(total)}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PuntoVenta;