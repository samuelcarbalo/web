import React, { useState, useRef } from 'react';
import { X, ImageIcon, Upload, Loader2, Link2, Type, FileText, ExternalLink, Calendar } from 'lucide-react';
import { useCreateBanner } from '../hooks/useSports';

interface CreateBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: string;
  tournamentId?: string; 
  onSuccess?: () => void;
}

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

// Helper para obtener fecha de hoy en formato YYYY-MM-DD
const getTodayString = () => new Date().toISOString().split('T')[0];

const CreateBannerModal: React.FC<CreateBannerModalProps> = ({
  isOpen,
  onClose,
  position,
  tournamentId,
  onSuccess,
}) => {
  const createBannerMutation = useCreateBanner();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    link_url: '',
    position: position,
    tournament: tournamentId || null,
    is_active: true,
    display_order: 0,
    start_date: getTodayString(),  // ← Fecha de hoy por defecto
    end_date: '',                  // ← Vacío por defecto (sin fecha fin)
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Cerrar con Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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
    if (!formData.title.trim()) newErrors.title = 'El título es requerido';
    if (!formData.image.trim()) newErrors.image = 'La imagen del banner es requerida';
    if (!formData.start_date) newErrors.start_date = 'La fecha de inicio es requerida';
    if (formData.link_url && !/^https?:\/\//.test(formData.link_url)) {
      newErrors.link_url = 'Debe ser una URL válida (https://...)';
    }
    // Validar que end_date >= start_date si ambos existen
    if (formData.end_date && formData.start_date && formData.end_date < formData.start_date) {
      newErrors.end_date = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImageToImgBB = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append('image', file);
    data.append('key', IMGBB_API_KEY);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: data,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    if (result.success && result.data?.url) {
      return result.data.url;
    }
    
    throw new Error(result.error?.message || 'Error desconocido al subir imagen');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'El archivo debe ser una imagen' }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'La imagen debe ser menor a 2MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);

    setUploadingImage(true);
    setErrors(prev => ({ ...prev, image: '' }));

    try {
      const imageUrl = await uploadImageToImgBB(file);
      setFormData(prev => ({ ...prev, image: imageUrl }));
      setPreviewImage(null);
    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        image: `Error al subir: ${error.message}. Intenta con una URL manual.`,
      }));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Preparar datos: convertir strings vacíos a null para el backend
    const submitData = {
      ...formData,
      end_date: formData.end_date || null,
      description: formData.description || undefined,
      link_url: formData.link_url || undefined,
    };

    createBannerMutation.mutate(submitData, {
      onSuccess: () => {
        if (onSuccess) onSuccess();
        onClose();
        // Reset form
        setFormData({
          title: '',
          description: '',
          image: '',
          link_url: '',
          tournament: tournamentId || null,
          position: position,
          is_active: true,
          display_order: 0,
          start_date: getTodayString(),
          end_date: '',
        });
        setPreviewImage(null);
      },
    });
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div
            className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-green-600 px-4 py-4 sm:px-6 flex items-center justify-between">
              <div className="flex items-center">
                <ImageIcon className="w-6 h-6 text-white mr-3" />
                <h3 className="text-lg font-medium text-white">Agregar Banner Publicitario</h3>
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
              <form id="create-banner-form" onSubmit={handleSubmit} className="space-y-4">
                
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-gray-400" />
                    Título del banner *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${errors.title ? 'border-red-500' : ''}`}
                    placeholder="Ej: Patrocinador Oficial"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-gray-400" />
                    Descripción
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="Breve descripción del anuncio..."
                  />
                </div>

                {/* Fechas de publicación */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      Fecha inicio *
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleChange('start_date', e.target.value)}
                      className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${errors.start_date ? 'border-red-500' : ''}`}
                    />
                    {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      Fecha fin <span className="text-gray-400 font-normal text-xs">(opcional)</span>
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      min={formData.start_date}
                      onChange={(e) => handleChange('end_date', e.target.value)}
                      className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${errors.end_date ? 'border-red-500' : ''}`}
                    />
                    {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
                  </div>
                </div>

                {/* Imagen del banner */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                    Imagen del banner *
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Preview */}
                  {(formData.image || previewImage) && (
                    <div className="mb-3 relative inline-block w-full">
                      <img
                        src={previewImage || formData.image}
                        alt="Preview"
                        className="w-full h-32 rounded-lg object-cover border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, image: '' }));
                          setPreviewImage(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Botón subir */}
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

                  {/* URL manual */}
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">O ingresa una URL:</p>
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => handleChange('image', e.target.value)}
                        className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                        placeholder="https://ejemplo.com/banner.jpg"
                        disabled={uploadingImage}
                      />
                    </div>
                  </div>

                  {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                  <p className="mt-1 text-xs text-gray-500">
                    Máximo 2MB. Formatos: JPG, PNG, GIF, WEBP. Recomendado: 1200x400px
                  </p>
                </div>

                {/* Link URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <Link2 className="w-4 h-4 text-gray-400" />
                    URL de destino <span className="text-gray-400 font-normal text-xs">(opcional)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={formData.link_url}
                      onChange={(e) => handleChange('link_url', e.target.value)}
                      className={`flex-1 rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm ${errors.link_url ? 'border-red-500' : ''}`}
                      placeholder="https://ejemplo.com"
                    />
                  </div>
                  {errors.link_url && <p className="mt-1 text-sm text-red-600">{errors.link_url}</p>}
                </div>

                {/* Error general del mutation */}
                {createBannerMutation.isError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">
                      Error al crear el banner. Verifica los datos.
                    </p>
                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
              <button
                type="submit"
                form="create-banner-form"
                disabled={createBannerMutation.isPending || uploadingImage}
                className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createBannerMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creando...
                  </>
                ) : (
                  'Publicar banner'
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

export default CreateBannerModal;