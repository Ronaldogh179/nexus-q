import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock, Mail } from 'lucide-react';
import { supabase } from 'src/lib/supabase.js';
import { useAuth } from 'src/context/AuthContext.jsx';

const MAX_ATTEMPTS = 3;
const LOGIN_TIMEOUT_MS = 7000;

const Login = () => {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!authLoading && session) {
      navigate('/', { replace: true });
    }
  }, [authLoading, session, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (blocked || submitting) return;

    setError('');
    setSubmitting(true);

    const loginPromise = supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT')), LOGIN_TIMEOUT_MS);
    });

    try {
      const { error: signInError } = await Promise.race([loginPromise, timeoutPromise]);

      if (signInError) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (nextAttempts >= MAX_ATTEMPTS) {
          setBlocked(true);
          setError('Demasiados intentos. Intente más tarde.');
        } else {
          setError(signInError.message || 'Credenciales incorrectas.');
        }
        return;
      }

      navigate('/', { replace: true });
    } catch (err) {
      if (err.message === 'TIMEOUT') {
        setError('Tiempo de espera agotado, intente de nuevo');
      } else {
        setError('Ocurrió un error inesperado. Intente de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">Nexus-Q</h1>
          <p className="mt-2 text-sm text-slate-500">Sistema de gestión para gimnasios</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-sm"
        >
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={blocked || submitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nexus-q.com"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={blocked || submitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={blocked || submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Iniciando sesión…
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-600">
          Acceso restringido a personal autorizado
        </p>
      </div>
    </div>
  );
};

export default Login;
