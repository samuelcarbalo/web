import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import { api } from '../../lib/api';
import ThemeToggle from '../../components/UI/ThemeToggle';
import BrandLogo from '../../components/Brand/BrandLogo';
import SeoHead from '../../components/SEO/SeoHead';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await api.post('/auth/password/reset-request/', { email: email.trim() });
      setSent(true);
    } catch {
      // Evitar filtrar si el correo existe: mostrar éxito genérico
      setSent(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="auth-page">
      <SeoHead title="Recuperar contraseña" path="/forgot-password" noindex />
      <div
        className="pointer-events-none absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"
        aria-hidden
      />
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="flex justify-center">
          <BrandLogo className="h-14 w-auto max-w-[220px]" variant="oficial" />
        </div>
        <h2 className="mt-8 text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Recuperar contraseña
        </h2>
        <p className="mt-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
          Te enviaremos instrucciones si el correo está registrado.
        </p>
      </div>

      <div className="relative z-10 mt-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="auth-card">
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                Si existe una cuenta con <strong>{email}</strong>, recibirás un mensaje con los
                pasos para restablecer tu contraseña. También puedes contactar al administrador
                desde{' '}
                <Link to="/contact" className="text-violet-600 font-bold underline">
                  Contacto
                </Link>
                .
              </p>
              <Link to="/login" className="btn-primary inline-flex items-center justify-center w-full py-3">
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={onSubmit}>
              <div>
                <label htmlFor="email" className="auth-label">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 auth-icon" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-12"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <button type="submit" disabled={pending} className="w-full btn-primary py-4">
                {pending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  <>
                    Enviar instrucciones
                    <ArrowRight className="ml-2 w-4 h-4 inline" />
                  </>
                )}
              </button>

              {error && <div className="auth-error">{error}</div>}

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-violet-600"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
