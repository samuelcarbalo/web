import React, { useState, useEffect } from 'react';
import { useProfile, useUpdateProfile } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
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
  Loader2
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuthStore();
  // console.log(user)
  const { data: profile, isLoading, isError } = useProfile();
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    user_name: '',
    bio: '',
    location: '',
    department: '',
    job_title: '',
    birth_date: '',
  });

  // Cargar datos del perfil cuando estén disponibles
  useEffect(() => {
    if (profile) {
      setFormData({
        user_name: profile.user_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        department: profile.department || '',
        job_title: profile.job_title || '',
        birth_date: profile.birth_date || '',
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData, {
      onSuccess: () => setIsEditing(false),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error cargando el perfil</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 text-blue-600 hover:underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

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
                  <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-16 h-16 text-blue-600" />
                  </div>
                )}
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900">
                {profile.user_name}
              </h2>
              <p className="text-gray-600 mb-2">{user?.email}</p>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {profile.organization_name}
                </span>
              </div>

              {/* Barra de completitud */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Perfil completado</span>
                  <span className="font-medium text-blue-600">{profile.completion_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${profile.completion_percentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-6 text-left space-y-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{profile.organization_name}</span>
                </div>
                {profile.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.job_title && (
                  <div className="flex items-center text-gray-600">
                    <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{profile.job_title}</span>
                  </div>
                )}
                {profile.department && (
                  <div className="flex items-center text-gray-600">
                    <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{profile.department}</span>
                  </div>
                )}
                {profile.birth_date && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{new Date(profile.birth_date).toLocaleDateString('es-CO')}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
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
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Información personal
                </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
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

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.user_name}
                    onChange={(e) => setFormData({...formData, user_name: e.target.value})}
                    className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cargo / Título profesional
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.job_title}
                      onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                      className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Ej: Desarrollador Full Stack"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departamento / Área
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Ej: Tecnología"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ubicación
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="input-field pl-10 disabled:bg-gray-50 disabled:text-gray-500"
                        placeholder="Ej: Montelibano, Córdoba"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de nacimiento
                    </label>
                    <input
                      type="date"
                      disabled={!isEditing}
                      value={formData.birth_date}
                      onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                      className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biografía
                  </label>
                  <textarea
                    rows={4}
                    disabled={!isEditing}
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="input-field disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                    placeholder="Cuéntanos sobre ti, tu experiencia y habilidades..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Esta información será visible para las empresas cuando apliques a empleos
                  </p>
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={updateProfile.isPending}
                      className="flex-1 btn-primary flex items-center justify-center"
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
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-blue-600" />
                Información de contacto
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email}
                  className="input-field disabled:bg-gray-50 text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  El email no se puede cambiar. Contacta soporte si necesitas actualizarlo.
                </p>
              </div>
            </div>

            {/* Preferencias (si quieres expandir) */}
            {profile.preferences && Object.keys(profile.preferences).length > 0 && (
              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Preferencias</h3>
                <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(profile.preferences, null, 2)}
                </pre>
              </div>
            )}

            {/* Cambiar contraseña */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Seguridad</h3>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
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