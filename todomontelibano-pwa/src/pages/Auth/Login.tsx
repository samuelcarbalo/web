import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { useLogin } from '../../hooks/useAuth';
import ThemeToggle from '../../components/UI/ThemeToggle';
import { TENANT_CONFIG } from '../../config/tenant';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    organization_slug: TENANT_CONFIG.slug,
  });

  const login = useLogin();

  return (
    <div className="auth-page">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute top-6 right-6"><ThemeToggle /></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-violet-500/30">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
        </div>
        <h2 className="mt-8 text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Bienvenido de vuelta
        </h2>
        <p className="mt-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-bold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors">
            Regístrate gratis
          </Link>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative">
        <div className="auth-card">
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); login.mutate(formData); }}>
            <div>
              <label htmlFor="email" className="auth-label">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 auth-icon" />
                <input id="email" type="email" required autoComplete="email"
                  value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field pl-12" placeholder="tu@email.com" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="auth-label">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 auth-icon" />
                <input id="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password"
                  value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field pl-12 pr-12" placeholder="••••••••" />
                <button type="button" className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-5 w-5 auth-icon-btn" /> : <Eye className="h-5 w-5 auth-icon-btn" />}
                </button>
              </div>
            </div>

            {/* <div>
              <label htmlFor="organization_slug" className="auth-label">Organización (slug)</label>
              <input id="organization_slug" type="text" value={formData.organization_slug}
                onChange={(e) => setFormData({ ...formData, organization_slug: e.target.value })}
                className="input-field" placeholder={TENANT_CONFIG.slug} />
              <p className="auth-hint">Superusuarios: deje vacío.</p>
            </div> */}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="auth-checkbox" />
                <label htmlFor="remember-me" className="auth-checkbox-label">Recordarme</label>
              </div>
              <Link to="/forgot-password" className="text-sm font-bold text-violet-600 dark:text-violet-400 hover:text-violet-500">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" disabled={login.isPending} className="w-full btn-primary py-4">
              {login.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                <>Iniciar Sesión<ArrowRight className="ml-2 w-4 h-4 inline" /></>
              )}
            </button>
          </form>

          {login.isError && (
            <div className="auth-error mt-6">Error al iniciar sesión. Verifica tus credenciales.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
