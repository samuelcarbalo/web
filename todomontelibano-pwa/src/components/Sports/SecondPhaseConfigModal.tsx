import React, { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';
import type { ConfigureSecondPhaseData } from '../../types/sports';

interface Props {
  open: boolean;
  initial?: Partial<ConfigureSecondPhaseData>;
  pending?: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: (data: ConfigureSecondPhaseData) => void;
}

const SecondPhaseConfigModal: React.FC<Props> = ({
  open,
  initial,
  pending,
  error,
  onClose,
  onConfirm,
}) => {
  const [groups, setGroups] = useState<1 | 2>(2);
  const [qualifiers, setQualifiers] = useState(2);
  const [playoffQualifiers, setPlayoffQualifiers] = useState(2);
  const [method, setMethod] = useState<'RANDOM' | 'MANUAL'>('RANDOM');

  useEffect(() => {
    if (!open) return;
    const count = initial?.second_phase_groups_count === 1 ? 1 : 2;
    setGroups(count);
    setQualifiers(initial?.first_phase_qualified_per_group || 2);
    setPlayoffQualifiers(initial?.second_phase_qualified_per_group || 2);
    setMethod(initial?.second_phase_assignment_method === 'MANUAL' ? 'MANUAL' : 'RANDOM');
    // Solo al abrir: `initial` cambia de identidad en cada render del padre.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const submit = () => {
    onConfirm({
      second_phase_groups_count: groups,
      first_phase_qualified_per_group: qualifiers,
      second_phase_qualified_per_group: playoffQualifiers,
      second_phase_assignment_method: method,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md">
        <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
          <Layers className="w-5 h-5 text-violet-600" />
          Configurar 2.ª fase de grupos
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Se inserta entre la primera fase y los playoffs. Si la dejas sin activar, los clasificados pasan directo a la eliminatoria.
        </p>

        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Grupos de la 2.ª fase</label>
            <select
              className="input-field w-full"
              value={groups}
              onChange={(event) => setGroups(event.target.value === '1' ? 1 : 2)}
            >
              <option value={1}>1 grupo</option>
              <option value={2}>2 grupos</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Equipos que avanzan de cada grupo de la 1.ª fase
            </label>
            <input
              type="number"
              min={1}
              max={4}
              value={qualifiers}
              onChange={(event) => setQualifiers(Number(event.target.value) || 1)}
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Clasifican a playoffs por grupo de la 2.ª fase
            </label>
            <input
              type="number"
              min={1}
              max={4}
              value={playoffQualifiers}
              onChange={(event) => setPlayoffQualifiers(Number(event.target.value) || 1)}
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Distribución de equipos</label>
            <select
              className="input-field w-full"
              value={method}
              onChange={(event) => setMethod(event.target.value === 'MANUAL' ? 'MANUAL' : 'RANDOM')}
            >
              <option value="RANDOM">Aleatorio</option>
              <option value="MANUAL">Manual por posiciones</option>
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="flex-1 btn-primary py-2.5 disabled:opacity-50"
          >
            {pending ? 'Guardando...' : 'Guardar segunda fase'}
          </button>
          <button type="button" onClick={onClose} className="flex-1 btn-secondary py-2.5">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecondPhaseConfigModal;
