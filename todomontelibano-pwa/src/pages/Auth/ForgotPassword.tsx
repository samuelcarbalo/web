import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import { api } from '../../lib/api';
import ThemeToggle from '../../components/UI/ThemeToggle';
import BrandLogo from '../../components/Brand/BrandLogo';
import AuthBackHomeLink from '../../components/Auth/AuthBackHomeLink';
import SeoHead from '../../components/SEO/SeoHead';

const ForgotPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid') || '';
  const token = searchParams.get('token') || '';
  const isConfirm = Boolean(uid && token);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [sent, setSent] = useState(false);
  const [resetOk, setResetOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await api.post('/auth/password/reset-request/', { email: email.trim() });
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setPending(false);
    }
  };

  const onConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== passwordConfirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setPending(true);
    try {
      await api.post('/auth/password/reset-confirm/', {
        uid,
        token,
        new_password: password,
        new_password_confirm: passwordConfirm,
      });
      setResetOk(true);
    } catch (err) {
      const detail =
        (err as { response?: { data?: { token?: string[]; detail?: string } } })?.response?.data;
      const tokenErr = Array.isArray(detail?.token) ? detail?.token[0] : undefined;
      setError(tokenErr || detail?.detail || 'El enlace no es válido o ya expiró.');
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
      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between gap-3">
        <AuthBackHomeLink />
        <ThemeToggle />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="flex justify-center">
          <BrandLogo className="h-14 w-auto max-w-[220px]" variant="oficial" linkToHome />
        </div>
        <h2 className="mt-8 text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {isConfirm ? 'Nueva contraseña' : 'Recuperar contraseña'}
        </h2>
        <p className="mt-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
          {isConfirm
            ? 'Elige una contraseña nueva para tu cuenta.'
            : 'Te enviaremos instrucciones si el correo está registrado.'}
        </p>
      </div>

      <div className="relative z-10 mt-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="auth-card">
          {isConfirm && resetOk ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                Contraseña actualizada. Ya puedes iniciar sesión.
              </p>
              <Link to="/login" className="btn-primary inline-flex items-center justify-center w-full py-3">
                Ir al inicio de sesión
              </Link>
            </div>
          ) : isConfirm ? (
            <form className="space-y-6" onSubmit={onConfirm}>
              <div>
                <label htmlFor="new-password" className="auth-label">
                  Nueva contraseña
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="new-password-confirm" className="auth-label">
                  Confirmar contraseña
                </label>
                <input
                  id="new-password-confirm"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="input-field"
                />
              </div>
              <button type="submit" disabled={pending} className="w-full btn-primary py-4">
                {pending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  <>
                    Guardar contraseña
                    <ArrowRight className="ml-2 w-4 h-4 inline" />
                  </>
                )}
              </button>
              {error && <div className="auth-error">{error}</div>}
            </form>
          ) : sent ? (
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
            <form className="space-y-6" onSubmit={onRequest}>
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
