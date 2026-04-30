import React, { useState, useRef } from 'react';
import { X, Users, Palette, UserCircle, Upload, Loader2, ImageIcon } from 'lucide-react';
import { useCreateTeam } from '../../hooks/useSports';
import { useAuthStore } from '../../store/authStore';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  tournamentName: string;
  onSuccess?: () => void;  // ← agrega esto
}

// ImgBB API Key - Obtén una gratis en https://api.imgbb.com/
// O usa variables de entorno: import.meta.env.VITE_IMGBB_API_KEY
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY; // Reemplaza con tu API key

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ 
  isOpen, 
  onClose, 
  tournamentId,
  tournamentName,
  onSuccess, 
}) => {
  const { user } = useAuthStore();
  const createMutation = useCreateTeam();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    description: '',
    primary_color: '#3B82F6',
    secondary_color: '#FFFFFF',
    logo: '',
    coach_name: '',
    coach_email: '',
    coach_phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Cerrar con Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'El nombre del equipo es requerido';
    if (!formData.abbreviation.trim()) newErrors.abbreviation = 'La abreviatura es requerida';
    if (formData.abbreviation.length > 5) newErrors.abbreviation = 'Máximo 5 caracteres';
    if (!formData.primary_color) newErrors.primary_color = 'El color primario es requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImageToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', IMGBB_API_KEY);
    console.log(IMGBB_API_KEY);
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error al subir imagen');
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.error?.message || 'Error al subir imagen');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, logo: 'El archivo debe ser una imagen' }));
      return;
    }

    // Validar tamaño (máximo 2MB para ImgBB gratuito)
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logo: 'La imagen debe ser menor a 2MB' }));
      return;
    }

    // Crear preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Subir imagen
    setUploadingImage(true);
    setErrors(prev => ({ ...prev, logo: '' }));

    try {
      const imageUrl = await uploadImageToImgBB(file);
      setFormData(prev => ({ ...prev, logo: imageUrl }));
      setPreviewImage(null); // Usar la URL remota en lugar del preview local
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        logo: 'Error al subir la imagen. Intenta con una URL o usa otro servicio.' 
      }));
      // Mantener el preview local si falla la subida
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    createMutation.mutate({
      ...formData,
      slug,
      tournament: tournamentId,
      organization: user?.organization || '',
    }, {
      onSuccess: () => {
        if (onSuccess) onSuccess();
        onClose();
        // Reset form
        setFormData({
          name: '',
          abbreviation: '',
          description: '',
          primary_color: '#3B82F6',
          secondary_color: '#FFFFFF',
          logo: '',
          coach_name: '',
          coach_email: '',
          coach_phone: '',
        });
        setPreviewImage(null);
      },
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Contenedor centrado */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          
          {/* Modal content */}
          <div 
            className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
            onClick={handleModalClick}
          >
            {/* Header */}
            <div className="bg-green-600 px-4 py-4 sm:px-6 flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-6 h-6 text-white mr-3" />
                <h3 className="text-lg font-medium text-white">Inscribir Equipo</h3>
              </div>
              <button 
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 py-5 sm:p-6 max-h-[70vh] overflow-y-auto">
              <p className="text-sm text-gray-600 mb-4">
                Torneo: <span className="font-medium text-gray-900">{tournamentName}</span>
              </p>

              <form id="create-team-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre del equipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del equipo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Ej: Los Halcones"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Abreviatura */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Abreviatura * (máx. 5 caracteres)
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={formData.abbreviation}
                    onChange={(e) => handleChange('abbreviation', e.target.value.toUpperCase())}
                    className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${errors.abbreviation ? 'border-red-500' : ''}`}
                    placeholder="Ej: HAL"
                  />
                  {errors.abbreviation && <p className="mt-1 text-sm text-red-600">{errors.abbreviation}</p>}
                </div>

                {/* Descripción */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="Historia del equipo, logros, etc."
                  />
                </div> */}

                {/* Logo - Subida de archivo o URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo del equipo
                  </label>
                  
                  {/* Input de archivo oculto */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Preview de imagen */}
                  {(formData.logo || previewImage) && (
                    <div className="mb-3 relative inline-block">
                      <img 
                        src={previewImage || formData.logo} 
                        alt="Preview" 
                        className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, logo: '' }));
                          setPreviewImage(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Botones de subida */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      disabled={uploadingImage}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Subir imagen
                        </>
                      )}
                    </button>
                  </div>

                  {/* O ingresar URL manualmente */}
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">O ingresa una URL:</p>
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        value={formData.logo}
                        onChange={(e) => handleChange('logo', e.target.value)}
                        className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                        placeholder="https:ejemplo.com/logo.png"
                        disabled={uploadingImage}
                      />
                    </div>
                  </div>

                  {errors.logo && <p className="mt-1 text-sm text-red-600">{errors.logo}</p>}
                  
                  <p className="mt-1 text-xs text-gray-500">
                    Máximo 2MB. Formatos: JPG, PNG, GIF, WEBP
                  </p>
                </div>


                {/* Datos del entrenador */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <UserCircle className="w-4 h-4 mr-1" />
                    Información del entrenador
                  </h4>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.coach_name}
                      onChange={(e) => handleChange('coach_name', e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="Nombre del entrenador"
                    />
                    <input
                      type="email"
                      value={formData.coach_email}
                      onChange={(e) => handleChange('coach_email', e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="Email del entrenador"
                    />
                    <input
                      type="tel"
                      value={formData.coach_phone}
                      onChange={(e) => handleChange('coach_phone', e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="Teléfono del entrenador"
                    />
                  </div>
                </div>
                
                {/* Colores */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <Palette className="w-4 h-4 mr-1" />
                      Color primario *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => handleChange('primary_color', e.target.value)}
                        className="h-10 w-16 rounded cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={formData.primary_color}
                        onChange={(e) => handleChange('primary_color', e.target.value)}
                        className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <Palette className="w-4 h-4 mr-1" />
                      Color secundario
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) => handleChange('secondary_color', e.target.value)}
                        className="h-10 w-16 rounded cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={formData.secondary_color}
                        onChange={(e) => handleChange('secondary_color', e.target.value)}
                        className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>

                {/* Error general */}
                {createMutation.isError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">
                      Error al crear el equipo. Verifica los datos.
                    </p>
                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
              <button
                type="submit"
                form="create-team-form"
                disabled={createMutation.isPending || uploadingImage}
                className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creando...
                  </>
                ) : (
                  'Inscribir equipo'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={uploadingImage}
                className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTeamModal;