import React, { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import Modal from '../UI/Modal';
import ImageUploader from '../UI/ImageUploader';
import { useUpdateTeam } from '../../hooks/useSports';
import type { Team } from '../../types/sports';

type Props = {
  team: Team;
  onClose: () => void;
};

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const inputClass =
  'w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500';
const labelClass = 'block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5';

const ColorField: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ id, label, value, onChange }) => (
  <div>
    <label htmlFor={id} className={labelClass}>
      {label}
    </label>
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="color"
        value={HEX_RE.test(value) ? value : '#000000'}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        className="h-10 w-12 cursor-pointer rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent"
      />
      <input
        type="text"
        value={value}
        maxLength={7}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        className={inputClass}
        aria-label={`${label} (hex)`}
      />
    </div>
  </div>
);

/** Edición de datos del equipo. Montar solo cuando está abierto para reiniciar el formulario. */
const EditTeamModal: React.FC<Props> = ({ team, onClose }) => {
  const updateMutation = useUpdateTeam();
  const [form, setForm] = useState({
    logo: team.logo || '',
    name: team.name,
    abbreviation: team.abbreviation || '',
    coach_name: team.coach_name || '',
    primary_color: (team.primary_color || '#000000').toUpperCase(),
    secondary_color: (team.secondary_color || '#FFFFFF').toUpperCase(),
  });
  const [error, setError] = useState('');

  const set = (field: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('El nombre del equipo es obligatorio.');
      return;
    }
    if (!HEX_RE.test(form.primary_color) || !HEX_RE.test(form.secondary_color)) {
      setError('Los colores deben tener formato hexadecimal, por ejemplo #1E40AF.');
      return;
    }
    updateMutation.mutate(
      {
        slug: team.id,
        data: {
          logo: form.logo.trim(),
          name: form.name.trim(),
          abbreviation: form.abbreviation.trim() || team.abbreviation,
          coach_name: form.coach_name.trim(),
          primary_color: form.primary_color,
          secondary_color: form.secondary_color,
        },
      },
      {
        onSuccess: onClose,
        onError: (err) => {
          console.error('Error al editar el equipo:', err);
          const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
          const detail =
            (typeof data?.detail === 'string' && data.detail) ||
            (typeof data?.message === 'string' && data.message) ||
            'No se pudo guardar el equipo. Revisa los datos e inténtalo de nuevo.';
          setError(detail);
        },
      }
    );
  };

  const saving = updateMutation.isPending;

  return (
    <Modal isOpen onClose={saving ? () => undefined : onClose} title={`Editar equipo — ${team.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ImageUploader
          id="team-logo"
          label="Logo del equipo"
          value={form.logo}
          onChange={set('logo')}
          preview="avatar"
        />
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label htmlFor="team-name" className={labelClass}>
              Nombre *
            </label>
            <input
              id="team-name"
              type="text"
              value={form.name}
              onChange={(e) => set('name')(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="team-abbr" className={labelClass}>
              Abreviatura
            </label>
            <input
              id="team-abbr"
              type="text"
              maxLength={10}
              value={form.abbreviation}
              onChange={(e) => set('abbreviation')(e.target.value.toUpperCase())}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor="team-coach" className={labelClass}>
            Delegado / Entrenador
          </label>
          <input
            id="team-coach"
            type="text"
            value={form.coach_name}
            onChange={(e) => set('coach_name')(e.target.value)}
            className={inputClass}
            placeholder="Nombre del delegado o entrenador"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ColorField id="team-primary" label="Color primario" value={form.primary_color} onChange={set('primary_color')} />
          <ColorField id="team-secondary" label="Color secundario" value={form.secondary_color} onChange={set('secondary_color')} />
        </div>

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-3 bg-violet-600 text-white rounded-2xl hover:bg-violet-700 disabled:opacity-50 font-semibold text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar cambios
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-3 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold text-sm"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditTeamModal;
