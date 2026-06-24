import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ─── Contexto ────────────────────────────────────────────────────────────────

const ToastContext = createContext(null);

// ─── Estilos por variante ────────────────────────────────────────────────────

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    bar: 'bg-emerald-500',
    border: 'border-emerald-500/30',
    iconClass: 'text-emerald-400',
    textClass: 'text-emerald-300',
  },
  error: {
    icon: XCircle,
    bar: 'bg-red-500',
    border: 'border-red-500/30',
    iconClass: 'text-red-400',
    textClass: 'text-red-300',
  },
  warning: {
    icon: AlertTriangle,
    bar: 'bg-amber-500',
    border: 'border-amber-500/30',
    iconClass: 'text-amber-400',
    textClass: 'text-amber-300',
  },
  info: {
    icon: Info,
    bar: 'bg-blue-500',
    border: 'border-blue-500/30',
    iconClass: 'text-blue-400',
    textClass: 'text-blue-300',
  },
};

// ─── Provider ────────────────────────────────────────────────────────────────

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ message, type = 'success', duration = 4000 }) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// ─── Hook público ─────────────────────────────────────────────────────────────

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('[Nexus-Q] useToast debe usarse dentro de <ToastProvider>');
  return ctx;
};

// ─── Contenedor de toasts ────────────────────────────────────────────────────

const ToastContainer = ({ toasts, onRemove }) => (
  <div
    aria-live="polite"
    className="fixed bottom-6 right-6 z-9999 flex flex-col gap-3 pointer-events-none"
  >
    {toasts.map((toast) => (
      <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
    ))}
  </div>
);

// ─── Ítem de toast individual ────────────────────────────────────────────────

const ToastItem = ({ toast, onRemove }) => {
  const variant = VARIANTS[toast.type] ?? VARIANTS.info;
  const Icon = variant.icon;

  return (
    <div
      role="alert"
      className={`
        relative flex items-start gap-3 pl-4 pr-10 py-3.5 rounded-xl border
        bg-slate-900/95 backdrop-blur-sm shadow-2xl pointer-events-auto
        min-w-[280px] max-w-[380px]
        animate-in slide-in-from-right-4 duration-300
        ${variant.border}
      `}
    >
      {/* Barra lateral de color */}
      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${variant.bar}`} />

      <Icon size={18} className={`shrink-0 mt-0.5 ${variant.iconClass}`} />

      <p className={`text-sm font-semibold leading-snug flex-1 ${variant.textClass}`}>
        {toast.message}
      </p>

      <button
        onClick={() => onRemove(toast.id)}
        className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors"
        aria-label="Cerrar notificación"
      >
        <X size={14} />
      </button>
    </div>
  );
};
