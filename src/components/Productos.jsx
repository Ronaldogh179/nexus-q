import React, { useState } from 'react';
import { Package, Search, Plus, Edit, Trash2, AlertTriangle, Tag, Filter, CheckCircle2, X } from 'lucide-react';

const Productos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [showModalNuevo, setShowModalNuevo] = useState(false);

  // Base de datos simulada de inventario
  const [productos, setProductos] = useState([
    { id: 1, nombre: 'Agua Mineral 500ml', categoria: 'Bebidas', precio: 1500, stock: 120, stockMinimo: 20, estado: 'Disponible' },
    { id: 2, nombre: 'Gatorade Manzana', categoria: 'Bebidas', precio: 2200, stock: 15, stockMinimo: 20, estado: 'Bajo Stock' },
    { id: 3, nombre: 'Proteína Whey 1kg (Vainilla)', categoria: 'Suplementos', precio: 45000, stock: 5, stockMinimo: 10, estado: 'Bajo Stock' },
    { id: 4, nombre: 'Barra de Proteína', categoria: 'Snacks', precio: 2500, stock: 45, stockMinimo: 15, estado: 'Disponible' },
    { id: 5, nombre: 'Toalla Microfibra Gym', categoria: 'Accesorios', precio: 8500, stock: 0, stockMinimo: 5, estado: 'Agotado' },
    { id: 6, nombre: 'Creatina Monohidratada 300g', categoria: 'Suplementos', precio: 32000, stock: 22, stockMinimo: 10, estado: 'Disponible' },
    { id: 7, nombre: 'Remera Entrenamiento Nexus', categoria: 'Indumentaria', precio: 15000, stock: 30, stockMinimo: 10, estado: 'Disponible' },
  ]);

  const categorias = ['Todas', 'Bebidas', 'Snacks', 'Suplementos', 'Accesorios', 'Indumentaria'];

  // Lógica de filtrado
  const productosFiltrados = productos.filter(p => {
    const coincideTexto = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const coincideCat = categoriaFiltro === 'Todas' || p.categoria === categoriaFiltro;
    return coincideTexto && coincideCat;
  });

  // Cálculos rápidos para los KPIs
  const totalStock = productos.reduce((acc, curr) => acc + curr.stock, 0);
  const bajoStockCount = productos.filter(p => p.stock > 0 && p.stock <= p.stockMinimo).length;
  const agotadosCount = productos.filter(p => p.stock === 0).length;

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 bg-[#111827] min-h-screen">
      
      {/* HEADER */}
      <div className="border-b border-gray-800 pb-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Package className="text-blue-500" size={32} /> Inventario de Productos
          </h1>
          <p className="text-gray-400 mt-2 text-sm font-medium">Controla el stock y los precios de los artículos a la venta en tu gimnasio.</p>
        </div>
        <button 
          onClick={() => setShowModalNuevo(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all"
        >
          <Plus size={20} /> Nuevo Producto
        </button>
      </div>

      {/* KPIs DE INVENTARIO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-800 shadow-md flex justify-between items-center group">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Artículos en Stock</p>
            <p className="text-3xl font-black text-white">{totalStock}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Package size={24} className="text-blue-500"/>
          </div>
        </div>
        
        <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-800 shadow-md flex justify-between items-center group">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Bajo Stock (Reponer)</p>
            <p className="text-3xl font-black text-orange-400">{bajoStockCount}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <AlertTriangle size={24} className="text-orange-500"/>
          </div>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-800 shadow-md flex justify-between items-center group">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Agotados</p>
            <p className="text-3xl font-black text-red-500">{agotadosCount}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <X size={24} className="text-red-500"/>
          </div>
        </div>
      </div>

      {/* BUSCADOR Y FILTROS */}
      <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar producto por nombre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111827] border border-gray-700 text-white rounded-lg pl-11 pr-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          <span className="text-sm text-gray-400 whitespace-nowrap px-2 flex items-center gap-2">
            <Filter size={14}/> Categoría:
          </span>
          {categorias.map(cat => (
            <button 
              key={cat}
              onClick={() => setCategoriaFiltro(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${categoriaFiltro === cat ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA DE INVENTARIO */}
      <div className="bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider bg-gray-900/30">
                <th className="p-4 pl-6 font-medium">Producto</th>
                <th className="p-4 font-medium">Categoría</th>
                <th className="p-4 font-medium">Precio Venta</th>
                <th className="p-4 font-medium text-center">Stock Actual</th>
                <th className="p-4 font-medium text-center">Estado</th>
                <th className="p-4 font-medium text-right pr-6">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {productosFiltrados.length > 0 ? (
                productosFiltrados.map(prod => (
                  <tr key={prod.id} className="hover:bg-gray-800/40 transition-colors">
                    
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400">
                          <Package size={18} />
                        </div>
                        <p className="font-bold text-white text-sm">{prod.nombre}</p>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="flex items-center gap-1.5 text-sm text-gray-300">
                        <Tag size={14} className="text-blue-400"/> {prod.categoria}
                      </span>
                    </td>

                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-200">S/ {prod.precio.toLocaleString('es-PE')}</p>
                    </td>

                    <td className="p-4 text-center">
                      <p className={`text-base font-black ${prod.stock === 0 ? 'text-red-500' : prod.stock <= prod.stockMinimo ? 'text-orange-400' : 'text-green-400'}`}>
                        {prod.stock}
                      </p>
                    </td>

                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border
                        ${prod.estado === 'Disponible' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                          prod.estado === 'Bajo Stock' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                          'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {prod.estado === 'Disponible' && <CheckCircle2 size={12} />}
                        {prod.estado === 'Bajo Stock' && <AlertTriangle size={12} />}
                        {prod.estado === 'Agotado' && <X size={12} />}
                        {prod.estado}
                      </span>
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-500 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-all" title="Editar Producto">
                          <Edit size={16} />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-all" title="Eliminar Producto">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-500 text-sm">
                    No se encontraron productos con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR NUEVO PRODUCTO */}
      {showModalNuevo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-800 bg-gray-900/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Package size={20} className="text-blue-500"/> Nuevo Producto</h2>
              <button onClick={() => setShowModalNuevo(false)} className="text-gray-500 hover:text-white transition-colors bg-gray-800 p-1.5 rounded-lg"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Nombre del Producto</label>
                <input type="text" placeholder="Ej. Agua Mineral 1L" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Categoría</label>
                  <select className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500">
                    <option>Bebidas</option>
                    <option>Snacks</option>
                    <option>Suplementos</option>
                    <option>Accesorios</option>
                    <option>Indumentaria</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Precio de Venta (S/)</label>
                  <input type="number" placeholder="0" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Stock Inicial</label>
                  <input type="number" placeholder="0" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Alerta Stock Mínimo</label>
                  <input type="number" defaultValue="5" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
              <button onClick={() => setShowModalNuevo(false)} className="px-5 py-2.5 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">Cancelar</button>
              <button onClick={() => { alert("Producto agregado al inventario."); setShowModalNuevo(false); }} className="px-6 py-2.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2">
                Guardar Producto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Productos;