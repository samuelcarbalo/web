import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Calendar, Loader2 } from 'lucide-react';
import { useCreateEvent } from '../../hooks/useEvents';
import { useAuthStore } from '../../store/authStore';
import InsufficientCreditsAlert from '../../components/Credits/InsufficientCreditsAlert';
import { CREDIT_COSTS } from '../../config/credits';

const categories = [
  { value: 'feria', label: 'Feria' },
  { value: 'concierto', label: 'Concierto' },
  { value: 'negocios', label: 'Negocios' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'gastronomico', label: 'Gastronómico' },
  { value: 'deportivo', label: 'Deportivo' },
  { value: 'otro', label: 'Otro' },
];

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const createEvent = useCreateEvent();
  const { user } = useAuthStore();
  const userCredits = user?.credits ?? 0;
  const hasEnough = userCredits >= CREDIT_COSTS.event;

  const [form, setForm] = useState({
    title: '',
    description: '',
    event_category: 'otro',
    start_datetime: '',
    end_datetime: '',
    location: '',
    address: '',
    is_online: false,
    online_url: '',
    cover_image: '',
    organizer_name: '',
    contact_phone: '',
    contact_email: '',
    external_link: '',
    price_info: 'Gratis',
  });

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasEnough) return;
    createEvent.mutate(form, {
      onSuccess: (data: { slug: string }) => navigate(`/eventos/${data.slug}`),
    });
  };

  return (
    <div className="page-container page-section max-w-2xl mx-auto pb-12">
      <Link
        to="/eventos"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-violet-600 mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> Eventos
      </Link>

      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
        <Calendar className="w-7 h-7 text-violet-600" />
        Publicar evento
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Costo: {CREDIT_COSTS.event} créditos · vigencia 30 días
      </p>

      {!hasEnough && (
        <InsufficientCreditsAlert
          required={CREDIT_COSTS.event}
          available={userCredits}
          actionLabel="publicar evento"
        />
      )}

      <form onSubmit={handleSubmit} className="card-static p-6 space-y-4">
        <input
          required
          placeholder="Título del evento *"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          className="w-full rounded-2xl border px-3 py-2"
        />
        <textarea
          required
          rows={4}
          placeholder="Descripción *"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          className="w-full rounded-2xl border px-3 py-2"
        />
        <select
          value={form.event_category}
          onChange={(e) => set('event_category', e.target.value)}
          className="w-full rounded-2xl border px-3 py-2"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">Inicio *</label>
            <input
              required
              type="datetime-local"
              value={form.start_datetime}
              onChange={(e) => set('start_datetime', e.target.value)}
              className="w-full rounded-2xl border px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Fin (opcional)</label>
            <input
              type="datetime-local"
              value={form.end_datetime}
              onChange={(e) => set('end_datetime', e.target.value)}
              className="w-full rounded-2xl border px-3 py-2 mt-1"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_online}
            onChange={(e) => set('is_online', e.target.checked)}
          />
          Evento en línea
        </label>
        {form.is_online ? (
          <input
            placeholder="URL del evento en línea"
            value={form.online_url}
            onChange={(e) => set('online_url', e.target.value)}
            className="w-full rounded-2xl border px-3 py-2"
          />
        ) : (
          <>
            <input
              placeholder="Ciudad / lugar"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              className="w-full rounded-2xl border px-3 py-2"
            />
            <input
              placeholder="Dirección"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              className="w-full rounded-2xl border px-3 py-2"
            />
          </>
        )}
        <input
          placeholder="URL imagen de portada"
          value={form.cover_image}
          onChange={(e) => set('cover_image', e.target.value)}
          className="w-full rounded-2xl border px-3 py-2"
        />
        <input
          placeholder="Organizador"
          value={form.organizer_name}
          onChange={(e) => set('organizer_name', e.target.value)}
          className="w-full rounded-2xl border px-3 py-2"
        />
        <input
          placeholder="Precio / entrada (ej: Gratis, Desde $20.000)"
          value={form.price_info}
          onChange={(e) => set('price_info', e.target.value)}
          className="w-full rounded-2xl border px-3 py-2"
        />
        <input
          placeholder="Teléfono de contacto"
          value={form.contact_phone}
          onChange={(e) => set('contact_phone', e.target.value)}
          className="w-full rounded-2xl border px-3 py-2"
        />
        <input
          type="email"
          placeholder="Email de contacto"
          value={form.contact_email}
          onChange={(e) => set('contact_email', e.target.value)}
          className="w-full rounded-2xl border px-3 py-2"
        />
        <input
          placeholder="Link externo (tickets, web)"
          value={form.external_link}
          onChange={(e) => set('external_link', e.target.value)}
          className="w-full rounded-2xl border px-3 py-2"
        />

        <button
          type="submit"
          disabled={!hasEnough || createEvent.isPending}
          className="w-full py-3 rounded-2xl bg-violet-600 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {createEvent.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Publicar ({CREDIT_COSTS.event} créditos)
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
