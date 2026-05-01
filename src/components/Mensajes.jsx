import React, { useState } from 'react';
import { Search, Send, Paperclip, MoreVertical, Phone, CheckCheck, Mail, MessageCircle, Smartphone } from 'lucide-react';

const Mensajes = () => {
  // Base de datos simulada de chats
  const [chats, setChats] = useState([
    {
      id: 1,
      nombre: 'Martín',
      tipo: 'whatsapp',
      avatar: 'M',
      color: 'bg-blue-600',
      ultimaVez: '10:42 AM',
      mensajes: [
        { id: 1, texto: 'Hola Martín, tu plan vence mañana.', sender: 'gym', hora: '10:30 AM' },
        { id: 2, texto: 'Hola! Sí, hoy paso por la tarde a pagar en efectivo.', sender: 'socio', hora: '10:41 AM' },
        { id: 3, texto: '¡Perfecto! Te esperamos.', sender: 'gym', hora: '10:42 AM' }
      ]
    },
    {
      id: 2,
      nombre: 'Laura Fernández',
      tipo: 'email',
      avatar: 'LF',
      color: 'bg-green-600',
      ultimaVez: 'Ayer',
      mensajes: [
        { id: 1, texto: 'Asunto: Bienvenida a Nexus-Q. Tu rutina ha sido asignada.', sender: 'gym', hora: 'Ayer 15:00' }
      ]
    },
    {
      id: 3,
      nombre: 'Pablo García',
      tipo: 'app',
      avatar: 'PG',
      color: 'bg-purple-600',
      ultimaVez: 'Lunes',
      mensajes: [
        { id: 1, texto: 'Notificación Push: ¡No olvides tu clase de Spinning a las 19hs!', sender: 'gym', hora: 'Lunes 10:00' }
      ]
    }
  ]);

  const [activeChatId, setActiveChatId] = useState(1);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const activeChat = chats.find(c => c.id === activeChatId);

  const chatsFiltrados = chats.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para simular el envío de un mensaje
  const enviarMensaje = (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;

    const chatActualizado = { ...activeChat };
    chatActualizado.mensajes.push({
      id: Date.now(),
      texto: nuevoMensaje,
      sender: 'gym',
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setChats(chats.map(c => c.id === activeChatId ? chatActualizado : c));
    setNuevoMensaje('');
  };

  // Icono dinámico según el canal de comunicación
  const getChannelIcon = (tipo) => {
    switch(tipo) {
      case 'whatsapp': return <MessageCircle size={14} className="text-green-400" />;
      case 'email': return <Mail size={14} className="text-blue-400" />;
      case 'app': return <Smartphone size={14} className="text-purple-400" />;
      default: return null;
    }
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 bg-[#111827] min-h-[calc(100vh-64px)] flex flex-col">
      
      <div className="border-b border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Centro de Mensajes</h1>
        <p className="text-gray-400 mt-1 text-sm font-medium">Gestiona WhatsApp, Emails y Notificaciones en un solo lugar.</p>
      </div>

      {/* CONTENEDOR PRINCIPAL DEL INBOX (Estilo Split Pane) */}
      <div className="flex flex-1 bg-[#1e293b] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl min-h-[500px]">
        
        {/* PANEL IZQUIERDO: Lista de Chats */}
        <div className="w-full md:w-1/3 border-r border-gray-800 flex flex-col bg-[#141b2d]/50">
          
          {/* Buscador de chats */}
          <div className="p-4 border-b border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Buscar conversación..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0f172a] border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 text-sm transition-colors"
              />
            </div>
          </div>

          {/* Lista scrollable de chats */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {chatsFiltrados.map((chat) => (
              <button 
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`w-full flex items-center gap-3 p-4 border-b border-gray-800/50 transition-colors text-left
                  ${activeChatId === chat.id ? 'bg-blue-600/10 border-l-4 border-l-blue-500' : 'hover:bg-gray-800/50 border-l-4 border-l-transparent'}`}
              >
                <div className={`w-12 h-12 rounded-full ${chat.color} flex items-center justify-center text-white font-bold shrink-0 shadow-lg`}>
                  {chat.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-200 truncate">{chat.nombre}</span>
                    <span className="text-[10px] text-gray-500">{chat.ultimaVez}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {getChannelIcon(chat.tipo)}
                    <p className="text-xs text-gray-400 truncate w-full">
                      {chat.mensajes[chat.mensajes.length - 1].texto}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* PANEL DERECHO: Ventana del Chat Activo */}
        <div className="hidden md:flex flex-1 flex-col bg-[#0f172a]/50">
          {activeChat ? (
            <>
              {/* Header del Chat */}
              <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#1e293b]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${activeChat.color} flex items-center justify-center text-white font-bold shadow-md`}>
                    {activeChat.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-white leading-tight">{activeChat.nombre}</h3>
                    <p className="text-xs text-green-400 font-medium flex items-center gap-1">
                      {getChannelIcon(activeChat.tipo)} {activeChat.tipo.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 text-gray-400">
                  <button className="hover:text-blue-400 transition-colors"><Phone size={20} /></button>
                  <button className="hover:text-white transition-colors"><MoreVertical size={20} /></button>
                </div>
              </div>

              {/* Historial de Mensajes */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                <div className="text-center my-4">
                  <span className="bg-gray-800/80 text-gray-400 text-xs px-3 py-1 rounded-full">Hoy</span>
                </div>
                
                {activeChat.mensajes.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'gym' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm relative group
                      ${msg.sender === 'gym' 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-tl-sm'}`}
                    >
                      <p className="text-sm leading-relaxed">{msg.texto}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 
                        ${msg.sender === 'gym' ? 'text-blue-200' : 'text-gray-500'}`}>
                        <span className="text-[10px]">{msg.hora}</span>
                        {msg.sender === 'gym' && <CheckCheck size={14} className="text-blue-300" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area (Footer) */}
              <div className="p-4 bg-[#1e293b] border-t border-gray-800">
                <form onSubmit={enviarMensaje} className="flex items-center gap-3 bg-[#0f172a] p-2 rounded-xl border border-gray-700 focus-within:border-blue-500 transition-colors">
                  <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800">
                    <Paperclip size={20} />
                  </button>
                  <input 
                    type="text" 
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    placeholder={`Escribir mensaje por ${activeChat.tipo}...`}
                    className="flex-1 bg-transparent border-none text-white focus:outline-none text-sm placeholder-gray-500"
                  />
                  <button 
                    type="submit" 
                    disabled={!nuevoMensaje.trim()}
                    className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-all shadow-md flex items-center justify-center"
                  >
                    <Send size={18} className={nuevoMensaje.trim() ? "ml-1" : ""} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <MessageCircle size={64} className="mb-4 opacity-20" />
              <p>Selecciona un chat para ver los mensajes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mensajes;