import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, TrendingUp, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  useClassifiedAdPlans,
  useClassifiedPositions,
  usePurchaseAdCampaign,
} from '../../hooks/useAdvertising';
import { useAuthStore } from '../../store/authStore';
import { FALLBACK_CLASSIFIED_AD_PLANS } from '../../config/credits';
import InsufficientCreditsAlert from '../Credits/InsufficientCreditsAlert';
import type { PurchaseCampaignData } from '../../lib/advertisingApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contentType: PurchaseCampaignData['content_type'];
  objectId: string;
  defaultTitle?: string;
  defaultImage?: string;
  defaultLinkUrl?: string;
  onSuccess?: () => void;
}

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

const PurchaseAdCampaignModal: React.FC<Props> = ({
  isOpen,
  onClose,
  contentType,
  objectId,
  defaultTitle = '',
  defaultImage = '',
  defaultLinkUrl = '',
  onSuccess,
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const { data: plansFromApi } = useClassifiedAdPlans();
  const { data: positions } = useClassifiedPositions(contentType);
  const purchase = usePurchaseAdCampaign();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const plans = plansFromApi?.length ? plansFromApi : [...FALLBACK_CLASSIFIED_AD_PLANS];

  const [plan, setPlan] = useState('standard');
  const [position, setPosition] = useState('');
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(defaultImage);
  const [linkUrl, setLinkUrl] = useState(defaultLinkUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (positions?.length && !position) {
      setPosition(positions[0].value);
    }
  }, [positions, position]);

  React.useEffect(() => {
    if (isOpen) {
      setTitle(defaultTitle);
      setImage(defaultImage);
      setLinkUrl(defaultLinkUrl);
    }
  }, [isOpen, defaultTitle, defaultImage, defaultLinkUrl]);

  const selectedPlan = plans.find((p) => p.id === plan);
  const userCredits = user?.credits ?? 0;
  const hasEnough = selectedPlan ? userCredits >= selectedPlan.credits : false;

  React.useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const uploadImage = async (file: File) => {
    const data = new FormData();
    data.append('image', file);
    data.append('key', IMGBB_API_KEY);
    const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: data });
    const json = await res.json();
    if (json.success && json.data?.url) return json.data.url as string;
    throw new Error('No se pudo subir la imagen');
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      setImage(await uploadImage(file));
    } catch {
      setError('Error al subir imagen. Usa una URL.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !image.trim() || !position) {
      setError('Título, imagen y ubicación son obligatorios.');
      return;
    }
    if (!hasEnough) return;

    purchase.mutate(
      {
        content_type: contentType,
        object_id: objectId,
        plan,
        position,
        title: title.trim(),
        description: description.trim(),
        image: image.trim(),
        link_url: linkUrl.trim() || undefined,
      },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
        onError: (err: unknown) => {
          const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail;
          setError(detail || 'No se pudo completar la compra.');
        },
      }
    );
  };

  const contentLabels = {
    job: 'empleo',
    real_estate: 'propiedad',
    event: 'evento',
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-indigo-600 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-semibold">Campaña publicitaria</h3>
            </div>
            <button type="button" onClick={onClose} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form id="campaign-form" onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Promociona tu {contentLabels[contentType]} con alcance medido: personas distintas que
              verán tu anuncio en la plataforma.
            </p>

            {!isAuthenticated && (
              <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-2xl">
                <Link to="/login" className="font-semibold underline">
                  Inicia sesión
                </Link>{' '}
                para comprar con créditos.
              </p>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Plan de visibilidad</label>
              <div className="grid gap-2">
                {plans.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-colors ${
                      plan === p.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={p.id}
                      checked={plan === p.id}
                      onChange={() => setPlan(p.id)}
                      className="mt-1"
                    />
                    <div>
                      <span className="font-semibold">{p.label}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 ml-2">
                        {p.credits} créditos
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {'target_reach' in p
                          ? `${p.target_reach} personas · máx. ${p.frequency_cap}x c/u · ${p.days} días`
                          : ''}
                      </p>
                      {'description' in p && p.description && (
                        <p className="text-xs text-gray-500">{p.description}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {positions && positions.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">¿Dónde mostrar?</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900"
                >
                  {positions.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isAuthenticated && selectedPlan && !hasEnough && (
              <InsufficientCreditsAlert
                required={selectedPlan.credits}
                available={userCredits}
                actionLabel="campaña publicitaria"
              />
            )}

            <input
              type="text"
              placeholder="Título del anuncio *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900"
            />
            <textarea
              placeholder="Descripción (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900"
            />
            <input
              type="url"
              placeholder="URL de imagen *"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900"
            />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-sm text-indigo-600 flex items-center gap-1"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Subir imagen
            </button>
            <input
              type="url"
              placeholder="Link de destino (opcional)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900"
            />

            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>

          <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-2xl text-sm border dark:border-gray-700">
              Cancelar
            </button>
            <button
              type="submit"
              form="campaign-form"
              disabled={!isAuthenticated || !hasEnough || purchase.isPending || uploading}
              className="px-4 py-2 rounded-2xl text-sm bg-indigo-600 text-white disabled:opacity-50 flex items-center gap-2"
            >
              {purchase.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Pagar {selectedPlan?.credits ?? '—'} créditos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseAdCampaignModal;
