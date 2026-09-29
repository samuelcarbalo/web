import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Shuffle, Users } from 'lucide-react';
import { useGenerateSecondPhase, useSecondPhasePreview } from '../../hooks/useSports';
import type { Tournament } from '../../types/sports';

interface Props {
  tournament: Tournament;
}

const SecondPhasePanel: React.FC<Props> = ({ tournament }) => {
  const slug = tournament.slug;
  const { data, isLoading, isError, error } = useSecondPhasePreview(slug, true);
  const generate = useGenerateSecondPhase(slug);
  const [placement, setPlacement] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!data) return;
    const next: Record<string, string> = {};
    data.qualifiers.forEach((qualifier, index) => {
      const current = data.groups.find((group) => group.team_ids.includes(qualifier.team_id));
      next[qualifier.team_id] = current?.slug || data.groups[index % Math.max(data.groups.length, 1)]?.slug || '';
    });
    setPlacement(next);
  }, [data]);

  const alreadyAssigned = (data?.groups || []).some((group) => group.team_ids.length > 0);
  const method = data?.assignment_method || tournament.second_phase_assignment_method || 'RANDOM';

  const run = (groups?: { slug: string; team_ids: string[] }[]) => {
    setMessage('');
    generate.mutate(groups, {
      onSuccess: () => setMessage('Segunda fase generada. Ya puedes armar el fixture de esos grupos.'),
      onError: (err: unknown) => {
        const apiError = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
        setMessage(apiError || 'No se pudo generar la segunda fase.');
      },
    });
  };

  const submitManual = () => {
    if (!data) return;
    const groups = data.groups.map((group) => ({
      slug: group.slug,
      team_ids: data.qualifiers
        .filter((qualifier) => placement[qualifier.team_id] === group.slug)
        .map((qualifier) => qualifier.team_id),
    }));
    run(groups);
  };

  return (
    <div className="card border border-violet-200 dark:border-violet-900">
      <h2 className="font-bold text-gray-900 dark:text-white">Segunda fase de grupos</h2>
      <p className="text-sm text-gray-500 mt-1 mb-4">
        {method === 'MANUAL'
          ? 'Asigna cada clasificado de la primera fase a un grupo y luego genera el fixture.'
          : 'Los clasificados de la primera fase se reparten de forma equilibrada entre los grupos nuevos.'}
      </p>

      {isLoading && (
        <p className="text-sm text-gray-500 inline-flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando clasificados…
        </p>
      )}

      {isError && (
        <p className="text-sm text-red-600">
          {(error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
            'No se pudo leer la segunda fase.'}
        </p>
      )}

      {data && data.qualifiers.length === 0 && (
        <p className="text-sm text-gray-500">
          Todavía no hay clasificados. Asigna equipos a los grupos de la primera fase.
        </p>
      )}

      {data && method === 'MANUAL' && data.qualifiers.length > 0 && (
        <div className="space-y-2 mb-4">
          {data.qualifiers.map((qualifier) => (
            <div key={qualifier.team_id} className="flex items-center gap-3">
              <div className="flex-1 text-sm text-gray-800 dark:text-gray-100">
                <span className="font-medium">{qualifier.team_name}</span>
                <span className="text-gray-500"> · {qualifier.rank}° {qualifier.from_group}</span>
              </div>
              <select
                className="input-field max-w-[180px]"
                value={placement[qualifier.team_id] || ''}
                onChange={(event) =>
                  setPlacement((prev) => ({ ...prev, [qualifier.team_id]: event.target.value }))
                }
              >
                {data.groups.map((group) => (
                  <option key={group.slug} value={group.slug}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <button
            type="button"
            onClick={submitManual}
            disabled={generate.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-violet-600 text-white rounded-full hover:bg-violet-700 disabled:opacity-60"
          >
            <Users className="w-3.5 h-3.5" />
            {generate.isPending ? 'Generando…' : 'Generar segunda fase'}
          </button>
        </div>
      )}

      {data && method === 'RANDOM' && data.qualifiers.length > 0 && (
        <button
          type="button"
          onClick={() => run()}
          disabled={generate.isPending || alreadyAssigned}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-violet-600 text-white rounded-full hover:bg-violet-700 disabled:opacity-60 mb-4"
        >
          <Shuffle className="w-3.5 h-3.5" />
          {alreadyAssigned ? 'Clasificados ya repartidos' : generate.isPending ? 'Repartiendo…' : 'Repartir clasificados'}
        </button>
      )}

      {message && <p className="text-sm text-gray-700 dark:text-gray-200 mb-3">{message}</p>}

      {data && data.groups.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {data.groups.map((group) => (
            <Link
              key={group.slug}
              to={`/deportes/tournaments/${slug}/standings?phase=segunda-fase&group=${group.slug}`}
              className="text-xs text-green-600 hover:underline"
            >
              Tabla de {group.name}
              {group.team_ids.length ? ` (${group.team_ids.length})` : ''}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SecondPhasePanel;
