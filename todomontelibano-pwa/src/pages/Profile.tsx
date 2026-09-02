import React, { useState, useEffect } from 'react';
import { useProfile, useUpdateProfile } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import {
  normalizeBirthDateForInput,
  parseApiFieldErrors,
  parseApiErrorMessage,
} from '../lib/apiErrors';
import {
  User,
  Mail,
  Building2,
  Camera,
  Save,
  MapPin,
  Briefcase,
  Calendar,
  Edit3,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

type ProfileFormData = {
  user_name: string;
  bio: string;
  location: string;
  department: string;
  job_title: string;
  birth_date: string;
};

const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const { data: profile, isLoading, isError } = useProfile();
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    user_name: '',
    bio: '',
    location: '',
    department: '',
    job_title: '',
    birth_date: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetFeedback = () => {
    setFieldErrors({});
    setFormError(null);
    setSuccessMessage(null);
  };

  const loadFormFromProfile = () => {
    if (!profile) return;
    setFormData({
      user_name: profile.user_name || '',
      bio: profile.bio || '',
      location: profile.location || '',
      department: profile.department || '',
      job_title: profile.job_title || '',
      birth_date: normalizeBirthDateForInput(profile.birth_date),
    });
  };

  useEffect(() => {
    loadFormFromProfile();
  }, [profile]);

  const handleCancelEdit = () => {
    loadFormFromProfile();
    resetFeedback();
    setIsEditing(false);
  };

  const fieldErrorClass = (field: string) =>
    fieldErrors[field] ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    updateProfile.mutate(formData, {
      onSuccess: () => {
        setIsEditing(false);
        setSuccessMessage('Perfil actualizado correctamente.');
      },
      onError: (error) => {
        const mapped = parseApiFieldErrors(error);
        if (Object.keys(mapped).length > 0) {
          setFieldErrors(mapped);
          if (mapped._form) {
            setFormError(mapped._form);
          }
        }
        setFormError((prev) =>
          prev ??
          parseApiErrorMessage(error, 'Error al actualizar perfil. Verifica los datos e intenta de nuevo.'),
        );
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 dark:text-violet-400" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error cargando el perfil</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 text-violet-600 dark:text-violet-400 hover:underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Mi Perfil</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar - Info básica */}
          <div className="lg:col-span-1">
            <div className="card text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt={profile.user_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-violet-100 dark:bg-violet-950/40 rounded-full flex items-center justify-center">
                    <User className="w-16 h-16 text-violet-600 dark:text-violet-400" />
                  </div>
                )}
                <button className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full hover:from-violet-500 hover:to-indigo-500 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {profile.user_name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">{user?.email}</p>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="px-3 py-1 bg-violet-100 dark:bg-violet-950/40 text-blue-700 rounded-full text-sm font-medium">
                  {profile.organization_name}
                </span>
              </div>

              {/* Barra de completitud */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Perfil completado</span>
                  <span className="font-medium text-violet-600 dark:text-violet-400">{profile.completion_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${profile.completion_percentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-6 text-left space-y-3 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{profile.organization_name}</span>
                </div>
                {profile.location && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.job_title && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{profile.job_title}</span>
                  </div>
                )}
                {profile.department && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{profile.department}</span>
                  </div>
                )}
                {profile.birth_date && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>
                      {(() => {
                        const iso = normalizeBirthDateForInput(profile.birth_date);
                        const [y, m, d] = iso.split('-').map(Number);
                        if (!y || !m || !d) return iso;
                        return new Date(y, m - 1, d).toLocaleDateString('es-CO');
                      })()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 mt-1">
                  Última actualización: {new Date(profile.created_at || '').toLocaleDateString('es-CO')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Última actualización: {new Date(profile.updated_at || '').toLocaleDateString('es-CO')}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content - Formulario editable */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Información personal */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <User className="w-5 h-5 mr-2 text-violet-600 dark:text-violet-400" />
                  Información personal
                </h3>
                <button
                  onClick={() => (isEditing ? handleCancelEdit() : setIsEditing(true))}
                  className="flex items-center text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium"
                  type="button"
                >
                  {isEditing ? (
                    'Cancelar'
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-1" />
                      Editar
                    </>
                  )}
                </button>
              </div>

              {successMessage && !isEditing && (
                <div
                  role="status"
                  className="mb-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {formError && isEditing && (
                <div
                  role="alert"
                  className="mb-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.user_name}
                    onChange={(e) => {
                      setFormData({ ...formData, user_name: e.target.value });
                      if (fieldErrors.user_name) {
                        setFieldErrors((prev) => {
                          const next = { ...prev };
                          delete next.user_name;
                          return next;
                        });
                      }
                    }}
                    className={`input-field disabled:bg-gray-50 dark:bg-gray-900/50 disabled:text-gray-500 ${fieldErrorClass('user_name')}`}
                  />
                  {fieldErrors.user_name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.user_name}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    El nombre visible se gestiona desde tu cuenta de usuario.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Cargo / Título profesional
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.job_title}
                      onChange={(e) => {
                        setFormData({ ...formData, job_title: e.target.value });
                        if (fieldErrors.job_title) {
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.job_title;
                            return next;
                          });
                        }
                      }}
                      className={`input-field disabled:bg-gray-50 dark:bg-gray-900/50 disabled:text-gray-500 ${fieldErrorClass('job_title')}`}
                      placeholder="Ej: Desarrollador Full Stack"
                    />
                    {fieldErrors.job_title && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.job_title}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Departamento / Área
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.department}
                      onChange={(e) => {
                        setFormData({ ...formData, department: e.target.value });
                        if (fieldErrors.department) {
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.department;
                            return next;
                          });
                        }
                      }}
                      className={`input-field disabled:bg-gray-50 dark:bg-gray-900/50 disabled:text-gray-500 ${fieldErrorClass('department')}`}
                      placeholder="Ej: Tecnología"
                    />
                    {fieldErrors.department && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.department}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Ubicación
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={formData.location}
                        onChange={(e) => {
                          setFormData({ ...formData, location: e.target.value });
                          if (fieldErrors.location) {
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              delete next.location;
                              return next;
                            });
                          }
                        }}
                        className={`input-field pl-10 disabled:bg-gray-50 dark:bg-gray-900/50 disabled:text-gray-500 ${fieldErrorClass('location')}`}
                        placeholder="Ej: Chever, Córdoba"
                      />
                    </div>
                    {fieldErrors.location && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.location}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Fecha de nacimiento
                    </label>
                    <input
                      type="date"
                      disabled={!isEditing}
                      value={formData.birth_date}
                      onChange={(e) => {
                        setFormData({ ...formData, birth_date: e.target.value });
                        if (fieldErrors.birth_date) {
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.birth_date;
                            return next;
                          });
                        }
                      }}
                      className={`input-field disabled:bg-gray-50 dark:bg-gray-900/50 disabled:text-gray-500 ${fieldErrorClass('birth_date')}`}
                    />
                    {fieldErrors.birth_date && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.birth_date}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Biografía
                  </label>
                  <textarea
                    rows={4}
                    disabled={!isEditing}
                    value={formData.bio}
                    onChange={(e) => {
                      setFormData({ ...formData, bio: e.target.value });
                      if (fieldErrors.bio) {
                        setFieldErrors((prev) => {
                          const next = { ...prev };
                          delete next.bio;
                          return next;
                        });
                      }
                    }}
                    className={`input-field disabled:bg-gray-50 dark:bg-gray-900/50 disabled:text-gray-500 resize-none ${fieldErrorClass('bio')}`}
                    placeholder="Cuéntanos sobre ti, tu experiencia y habilidades..."
                  />
                  {fieldErrors.bio && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.bio}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Esta información será visible para las empresas cuando apliques a empleos
                  </p>
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={updateProfile.isPending}
                      className="flex-1 btn-secondary disabled:opacity-60"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={updateProfile.isPending}
                      aria-busy={updateProfile.isPending}
                      className="flex-1 btn-primary flex items-center justify-center disabled:opacity-60"
                    >
                      {updateProfile.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Guardar cambios
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Email (solo lectura) */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-violet-600 dark:text-violet-400" />
                Información de contacto
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email}
                  className="input-field disabled:bg-gray-50 dark:bg-gray-900/50 text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  El email no se puede cambiar. Contacta soporte si necesitas actualizarlo.
                </p>
              </div>
            </div>

            {/* Preferencias (si quieres expandir) */}
            {profile.preferences && Object.keys(profile.preferences).length > 0 && (
              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Preferencias</h3>
                <pre className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-3xl text-sm overflow-auto">
                  {JSON.stringify(profile.preferences, null, 2)}
                </pre>
              </div>
            )}

            {/* Cambiar contraseña */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Seguridad</h3>
              <button className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium">
                Cambiar contraseña →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;