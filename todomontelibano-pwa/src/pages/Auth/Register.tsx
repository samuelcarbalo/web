import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building2,
  ArrowRight,
  Check,
  Loader2,
} from "lucide-react";
import { useRegister } from "../../hooks/useAuth";
import ThemeToggle from "../../components/UI/ThemeToggle";
import BrandLogo from "../../components/Brand/BrandLogo";
import AuthBackHomeLink from "../../components/Auth/AuthBackHomeLink";
import AuthSubmitStatus from "../../components/Auth/AuthSubmitStatus";
import SeoHead from "../../components/SEO/SeoHead";
import { buildLoginUrl, isSafeInternalPath, setAuthRedirect } from "../../lib/authRedirect";

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<"person" | "company">("person");
  const [searchParams] = useSearchParams();
  const nextParam = searchParams.get("next");
  const loginHref = isSafeInternalPath(nextParam) ? buildLoginUrl(nextParam) : "/login";

  React.useEffect(() => {
    if (isSafeInternalPath(nextParam)) setAuthRedirect(nextParam);
  }, [nextParam]);

  const [formData, setFormData] = useState({
    username: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirm: "",
    company_name: "",
  });

  const register = useRegister();
  const isSubmitting = register.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.reset();
    register.mutate({
      ...formData,
      user_type: userType,
      organization_slug: "conectando-empleo",
    });
  };

  const steps = [
    { number: 1, title: "Tipo de cuenta" },
    { number: 2, title: "Tus datos" },
    { number: 3, title: "Seguridad" },
  ];

  return (
    <div className="auth-page">
      <SeoHead title="Crear Cuenta" path="/register" noindex />
      <div
        className="pointer-events-none absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"
        aria-hidden
      />
      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between gap-3">
        <AuthBackHomeLink />
        <ThemeToggle />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="flex justify-center">
          <BrandLogo
            className="h-14 w-auto max-w-[220px]"
            variant="oficial"
            linkToHome
            title="Ir al inicio"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Crea tu cuenta
        </h2>
        <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
          ¿Ya tienes cuenta?{" "}
          <Link
            to={loginHref}
            className="relative z-10 inline-flex items-center font-bold text-secondary-600 dark:text-secondary-400 underline underline-offset-2 hover:text-secondary-500 dark:hover:text-secondary-300 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 rounded-sm px-0.5"
          >
            Inicia sesión
          </Link>
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((s, idx) => (
              <div key={s.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  ${step >= s.number ? "auth-step-active" : "auth-step-inactive"}`}
                >
                  {step > s.number ? <Check className="w-4 h-4" /> : s.number}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${step >= s.number ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
                >
                  {s.title}
                </span>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-4 ${step > s.number ? "auth-step-line-active" : "auth-step-line-inactive"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="auth-card">
          <div className="mb-4">
            <AuthBackHomeLink />
          </div>
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="auth-label mb-4">
                    ¿Cómo vas a usar Chever?
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setUserType("person")}
                      disabled={isSubmitting}
                      className={`auth-type-card ${userType === "person" ? "auth-type-card-selected" : ""} disabled:opacity-60`}
                    >
                      <div className="flex flex-col items-center">
                        <User
                          className={`w-8 h-8 mb-2 ${userType === "person" ? "text-violet-600 dark:text-violet-400" : "text-gray-400"}`}
                        />
                        <span className="block text-sm font-medium text-gray-900 dark:text-white">
                          Persona
                        </span>
                        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Busco empleos o servicios
                        </span>
                      </div>
                      {userType === "person" && (
                        <div className="absolute top-2 right-2">
                          <div className="w-5 h-5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setUserType("company")}
                      disabled={isSubmitting}
                      className={`auth-type-card ${userType === "company" ? "auth-type-card-selected" : ""} disabled:opacity-60`}
                    >
                      <div className="flex flex-col items-center">
                        <Building2
                          className={`w-8 h-8 mb-2 ${userType === "company" ? "text-violet-600 dark:text-violet-400" : "text-gray-400"}`}
                        />
                        <span className="block text-sm font-medium text-gray-900 dark:text-white">
                          Empresa
                        </span>
                        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Publico empleos o servicios
                        </span>
                      </div>
                      {userType === "company" && (
                        <div className="absolute top-2 right-2">
                          <div className="w-5 h-5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={isSubmitting}
                  className="w-full btn-primary flex justify-center items-center py-3 disabled:opacity-60"
                >
                  Continuar
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="username"
                      className="auth-label"
                    >
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="username"
                      required
                      disabled={isSubmitting}
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="input-field mt-1"
                      placeholder="Juan"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="last_name"
                      className="auth-label"
                    >
                      Apellido
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      required
                      disabled={isSubmitting}
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      className="input-field mt-1"
                      placeholder="Pérez"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Correo electrónico
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 auth-icon" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      required
                      disabled={isSubmitting}
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="input-field pl-10"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    disabled={isSubmitting}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="input-field mt-1"
                    placeholder="+57 300 123 4567"
                  />
                </div>

                {userType === "company" && (
                  <div>
                    <label
                      htmlFor="company_name"
                      className="auth-label"
                    >
                      Nombre de la empresa
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 auth-icon" />
                      </div>
                      <input
                        type="text"
                        id="company_name"
                        required={userType === "company"}
                        disabled={isSubmitting}
                        value={formData.company_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            company_name: e.target.value,
                          })
                        }
                        className="input-field pl-10"
                        placeholder="Mi Empresa S.A.S."
                      />
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                    className="flex-1 btn-secondary py-3 disabled:opacity-60"
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={isSubmitting}
                    className="flex-1 btn-primary py-3 disabled:opacity-60"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Contraseña
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 auth-icon" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      required
                      minLength={8}
                      disabled={isSubmitting}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="input-field pl-10 pr-10"
                      placeholder="Mínimo 8 caracteres"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 auth-icon-btn" />
                      ) : (
                        <Eye className="h-5 w-5 auth-icon-btn" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password_confirm"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Confirmar contraseña
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 auth-icon" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password_confirm"
                      required
                      disabled={isSubmitting}
                      value={formData.password_confirm}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password_confirm: e.target.value,
                        })
                      }
                      className="input-field pl-10"
                      placeholder="Repite tu contraseña"
                    />
                  </div>
                  {formData.password !== formData.password_confirm &&
                    formData.password_confirm && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        Las contraseñas no coinciden
                      </p>
                    )}
                </div>

                <div className="flex items-start">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="auth-checkbox"
                  />
                  <label
                    htmlFor="terms"
                    className="auth-checkbox-label"
                  >
                    Acepto los{" "}
                    <Link
                      to="/terms"
                      className="text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:text-violet-400"
                    >
                      Términos de servicio
                    </Link>{" "}
                    y la{" "}
                    <Link
                      to="/privacy"
                      className="text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:text-violet-400"
                    >
                      Política de privacidad
                    </Link>
                  </label>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={isSubmitting}
                    className="flex-1 btn-secondary py-3 disabled:opacity-60"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      formData.password !== formData.password_confirm
                    }
                    aria-busy={isSubmitting}
                    className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                        Creando cuenta...
                      </>
                    ) : (
                      "Registrarse"
                    )}
                  </button>
                </div>

                <AuthSubmitStatus
                  isPending={isSubmitting}
                  isError={register.isError}
                  error={register.error}
                  variant="register"
                  fallbackError="No pudimos crear tu cuenta. Verifica que el correo no esté registrado e intenta de nuevo."
                />
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
