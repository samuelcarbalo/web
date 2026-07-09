import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, Megaphone, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  usePurchaseSponsorship,
  useSponsorshipPlans,
} from '../../hooks/useAdvertising';
import { useAuthStore } from '../../store/authStore';
import {
  FALLBACK_SPONSORSHIP_PLANS,
} from '../../config/credits';
import InsufficientCreditsAlert from '../Credits/InsufficientCreditsAlert';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  tournamentName: string;
  onSuccess?: () => void;
}

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

const PurchaseSponsorshipModal: React.FC<Props> = ({
  isOpen,
  onClose,
  tournamentId,
  tournamentName,
  onSuccess,
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const { data: plansFromApi } = useSponsorshipPlans();
  const purchase = usePurchaseSponsorship();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const plans = plansFromApi?.length ? plansFromApi : [...FALLBACK_SPONSORSHIP_PLANS];

  const [plan, setPlan] = useState('month');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

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
    if (!title.trim() || !image.trim()) {
      setError('Título e imagen son obligatorios.');
      return;
    }
    if (!hasEnough) return;

    purchase.mutate(
      {
        tournament: tournamentId,
        plan,
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
        onError: (err: any) => {
          setError(err?.response?.data?.detail || 'No se pudo completar la compra.');
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-violet-600 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Megaphone className="w-5 h-5" />
              <h3 className="font-semibold">Patrocinio exclusivo</h3>
            </div>
            <button type="button" onClick={onClose} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form id="sponsorship-form" onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Torneo: <strong>{tournamentName}</strong>. Tu anuncio aparecerá en detalle, tabla,
              partidos y estadísticas.
            </p>

            {!isAuthenticated && (
              <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-2xl">
                <Link to="/login" className="font-semibold underline">
                  Inicia sesión
                </Link>{' '}
                para comprar con créditos.
              </p>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Plan de exclusividad</label>
              <div className="grid gap-2">
                {plans.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-colors ${
                      plan === p.id
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
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
                      <span className="text-violet-600 dark:text-violet-400 ml-2">
                        {p.credits} créditos
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {isAuthenticated && selectedPlan && !hasEnough && (
              <InsufficientCreditsAlert
                required={selectedPlan.credits}
                available={userCredits}
                actionLabel="patrocinio exclusivo"
              />
            )}

            <input
              type="text"
              placeholder="Título del anuncio *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm"
            />
            <textarea
              placeholder="Descripción (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm"
            />
            <input
              type="url"
              placeholder="URL de imagen *"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm"
            />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-sm text-violet-600 flex items-center gap-1"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Subir imagen
            </button>
            <input
              type="url"
              placeholder="Link de destino (opcional)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm"
            />

            {error && <p className="text-sm text-red-600">{error}</p>}
            {purchase.isError && (
              <p className="text-sm text-red-600">Error al procesar. Verifica créditos y datos.</p>
            )}
          </form>

          <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-2xl text-sm border">
              Cancelar
            </button>
            <button
              type="submit"
              form="sponsorship-form"
              disabled={!isAuthenticated || !hasEnough || purchase.isPending || uploading}
              className="px-4 py-2 rounded-2xl text-sm bg-violet-600 text-white disabled:opacity-50 flex items-center gap-2"
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

export default PurchaseSponsorshipModal;
