import React, { useMemo } from 'react';

import { useParams, Link, useSearchParams } from 'react-router-dom';

import { useTournament, useTournamentStandings, useTournamentStructure } from '../../hooks/useSports';

import { Trophy, Loader2, Crown } from 'lucide-react';

import TournamentAdSlot from '../../components/Advertising/TournamentAdSlot';

import SponsorshipAvailabilityBanner from '../../components/Advertising/SponsorshipAvailabilityBanner';

import { useSponsorshipAvailability } from '../../hooks/useAdvertising';

import { isScopeLeader, resolveTournamentChampion } from '../../lib/tournamentChampion';



import type { TeamStanding } from '../../types/sports';

const PositionBadge: React.FC<{ position: number; isChampion?: boolean }> = ({ position, isChampion }) => {

  if (isChampion) {

    return (

      <div

        className="w-9 h-9 rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-100 to-yellow-200 flex items-center justify-center text-lg shadow-sm"

        title="Campeón"

      >

        🏆

      </div>

    );

  }



  const styles: Record<number, string> = {

    1: 'bg-yellow-100 text-yellow-800 border-yellow-200',

    2: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700',

    3: 'bg-orange-100 text-orange-800 border-orange-200',

  };



  const style =

    styles[position] ||

    'bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800';



  return (

    <div className={`w-8 h-8 rounded-2xl border flex items-center justify-center font-bold text-sm shrink-0 ${style}`}>

      {position}

    </div>

  );

};



const StatCell: React.FC<{ value: number | string; highlight?: boolean; color?: string }> = ({

  value,

  highlight = false,

  color = 'text-gray-600 dark:text-gray-400',

}) => (

  <div

    className={`text-center text-xs tabular-nums shrink-0 ${highlight ? 'font-bold text-gray-900 dark:text-white' : color}`}

  >

    {value}

  </div>

);



const TeamAvatar: React.FC<{ team: TeamStanding['team'] }> = ({ team }) =>

  team.logo ? (

    <img

      src={team.logo}

      alt=""

      className="w-9 h-9 rounded-xl object-cover shadow-sm shrink-0"

      loading="lazy"

    />

  ) : (

    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">

      {team.abbreviation || team.name.slice(0, 2).toUpperCase()}

    </div>

  );



const TournamentStandingsPage: React.FC = () => {

  const { slug } = useParams<{ slug: string }>();

  const [searchParams, setSearchParams] = useSearchParams();

  const phaseSlug = searchParams.get('phase') || undefined;

  const groupSlug = searchParams.get('group') || undefined;



  const { data: tournament, isLoading: tournamentLoading } = useTournament(slug || '');

  const { data: structure } = useTournamentStructure(slug || '');

  const { data: standings, isLoading: standingsLoading } = useTournamentStandings(slug || '', {

    phase: phaseSlug,

    group: groupSlug,

  });

  const { data: sponsorshipAvailability } = useSponsorshipAvailability(slug || '');



  const isSoftball = tournament?.sport_type === 'softball';

  const isStructured = structure?.structure_mode === 'structured';



  const champion = useMemo(

    () =>

      resolveTournamentChampion(structure, standings, {

        isSoftball,

        tournamentStatus: tournament?.status,

        isStructured,

      }),

    [structure, standings, isSoftball, tournament?.status, isStructured]

  );



  const scopeLabel = useMemo(() => {

    if (!structure || !phaseSlug) return null;

    const phase = structure.phases.find((p) => p.slug === phaseSlug);

    if (!phase) return null;

    if (groupSlug) {

      const group = phase.groups.find((g) => g.slug === groupSlug);

      return group ? `${phase.name} — ${group.name}` : phase.name;

    }

    return phase.name;

  }, [structure, phaseSlug, groupSlug]);



  const handleScopeChange = (phase?: string, group?: string) => {

    const next = new URLSearchParams();

    if (phase) next.set('phase', phase);

    if (group) next.set('group', group);

    setSearchParams(next);

  };



  const statCols = isSoftball ? 6 : 7;



  if (tournamentLoading || standingsLoading) {

    return (

      <div className="max-w-5xl mx-auto px-4 py-12">

        <div className="animate-pulse space-y-4">

          <div className="h-8 bg-gray-200 rounded w-1/3" />

          <div className="h-4 bg-gray-200 rounded w-1/4" />

          <div className="space-y-3 mt-8">

            {[...Array(8)].map((_, i) => (

              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-3xl" />

            ))}

          </div>

        </div>

      </div>

    );

  }



  if (!standings || standings.length === 0) {

    return (

      <div className="max-w-5xl mx-auto px-4 py-12">

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">

          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mx-auto mb-4">

            <Trophy className="w-10 h-10 text-gray-300" />

          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No hay datos disponibles</h3>

          <p className="text-gray-500 max-w-sm mx-auto">

            {scopeLabel

              ? `No hay resultados registrados para ${scopeLabel}.`

              : 'Las posiciones del torneo aún no han sido generadas o no hay suficientes partidos jugados.'}

          </p>

        </div>

      </div>

    );

  }



  return (

    <div className="max-w-5xl mx-auto px-4 py-8">

      <div className="mb-6">

        <div className="flex items-center gap-3 mb-2">

          <div className="p-2 bg-green-50 dark:bg-green-950/40 rounded-2xl">

            <Trophy className="w-6 h-6 text-green-600" />

          </div>

          <div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tabla de Posiciones</h1>

            <p className="text-gray-500">{tournament?.name}</p>

            {scopeLabel && <p className="text-sm text-green-600 font-medium mt-0.5">{scopeLabel}</p>}

          </div>

        </div>

      </div>



      {champion && (

        <div className="mb-6 flex items-center gap-4 rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-amber-950/40 dark:border-amber-700 px-5 py-4 shadow-sm">

          <span className="text-3xl leading-none" aria-hidden>

            🏆

          </span>

          <div className="min-w-0 flex-1">

            <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">

              Campeón del torneo

            </p>

            <p className="text-xl font-bold text-amber-950 dark:text-amber-100 truncate">{champion.teamName}</p>

          </div>

          {champion.logo && (

            <img src={champion.logo} alt="" className="w-12 h-12 rounded-xl object-cover border border-amber-200 shrink-0" />

          )}

        </div>

      )}



      {isStructured && structure && structure.phases.length > 0 && (

        <div className="mb-6 flex flex-wrap gap-2">

          <button

            type="button"

            onClick={() => handleScopeChange()}

            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${

              !phaseSlug

                ? 'bg-green-600 text-white border-green-600'

                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'

            }`}

          >

            General

          </button>

          {structure.phases.map((phase) =>

            phase.phase_type === 'knockout' || phase.groups.length === 0 ? (

              <button

                key={phase.id}

                type="button"

                onClick={() => handleScopeChange(phase.slug)}

                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${

                  phaseSlug === phase.slug && !groupSlug

                    ? 'bg-green-600 text-white border-green-600'

                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'

                }`}

              >

                {phase.name}

              </button>

            ) : (

              phase.groups.map((group) => (

                <button

                  key={group.id}

                  type="button"

                  onClick={() => handleScopeChange(phase.slug, group.slug)}

                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${

                    phaseSlug === phase.slug && groupSlug === group.slug

                      ? 'bg-green-600 text-white border-green-600'

                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'

                  }`}

                >

                  {group.name}

                </button>

              ))

            )

          )}

        </div>

      )}



      <div className="space-y-4 mb-6">

        <SponsorshipAvailabilityBanner availability={sponsorshipAvailability} showPurchaseButton={false} />

        <TournamentAdSlot position="standings_top" tournamentId={tournament?.id} variant="horizontal" />

      </div>



      {/* Desktop: nombre con prioridad */}

      <div className="hidden md:block bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-x-auto">

        <div

          className="grid gap-x-2 gap-y-0 px-3 py-3 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-[10px] font-semibold text-gray-500 uppercase tracking-wide items-center min-w-[520px]"

          style={{

            gridTemplateColumns: `2.5rem minmax(9rem, 1fr) repeat(${statCols}, 2.25rem) 2.5rem`,

          }}

        >

          <div className="text-center">#</div>

          <div>Equipo</div>

          <div className="text-center">PJ</div>

          <div className="text-center">G</div>

          {!isSoftball && <div className="text-center">E</div>}

          <div className="text-center">P</div>

          {isSoftball ? (

            <>

              <div className="text-center">CR</div>

              <div className="text-center">CC</div>

              <div className="text-center">AVG</div>

            </>

          ) : (

            <>

              <div className="text-center">GF</div>

              <div className="text-center">GC</div>

              <div className="text-center">DG</div>

            </>

          )}

          <div className="text-center">Pts</div>

        </div>



        {standings.map((team: TeamStanding) => {

          const isChampion = champion?.teamId === team.team.id;

          const isLeader = isScopeLeader(team.team.id, standings, champion?.teamId ?? null);



          return (

            <Link

              key={team.team.id}

              to={`/sports/tournaments/${tournament?.slug}/teams/${team.team.slug}`}

              className={`grid gap-x-2 px-3 py-3 border-b border-gray-100 dark:border-gray-800 items-center min-w-[520px] transition-colors group ${

                isChampion

                  ? 'bg-amber-50/80 dark:bg-amber-950/25 hover:bg-amber-50 dark:hover:bg-amber-950/35 ring-1 ring-inset ring-amber-200/60 dark:ring-amber-800/50'

                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'

              }`}

              style={{

                gridTemplateColumns: `2.5rem minmax(9rem, 1fr) repeat(${statCols}, 2.25rem) 2.5rem`,

              }}

            >

              <div className="flex justify-center">

                <PositionBadge position={team.position} isChampion={isChampion} />

              </div>



              <div className="flex items-center gap-2.5 min-w-0 pr-1">

                <TeamAvatar team={team.team} />

                <div className="min-w-0 flex-1">

                  <div className="flex items-center gap-1.5 flex-wrap">

                    <span

                      className={`font-semibold text-sm leading-snug break-words ${

                        isChampion

                          ? 'text-amber-950 dark:text-amber-100'

                          : 'text-gray-900 dark:text-white'

                      }`}

                      title={team.team.name}

                    >

                      {team.team.name}

                    </span>

                    {isChampion && (

                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-amber-200/80 text-amber-900 dark:bg-amber-800 dark:text-amber-100 shrink-0">

                        <Crown className="w-3 h-3" />

                        Campeón

                      </span>

                    )}

                    {!isChampion && isLeader && (

                      <span className="text-[10px] font-semibold text-yellow-700 dark:text-yellow-400 shrink-0">

                        🥇 Líder

                      </span>

                    )}

                  </div>

                </div>

              </div>



              <StatCell value={team.played} />

              <StatCell value={team.won} color="text-green-600" />

              {!isSoftball && <StatCell value={team.drawn} color="text-yellow-600" />}

              <StatCell value={team.lost} color="text-red-500" />

              {isSoftball ? (

                <>

                  <StatCell value={team.runs ?? 0} />

                  <StatCell value={team.runs_against ?? 0} />

                  <StatCell value={team.average?.toFixed(3) ?? '-'} highlight />

                </>

              ) : (

                <>

                  <StatCell value={team.goals_for} />

                  <StatCell value={team.goals_against} />

                  <StatCell

                    value={team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}

                    highlight

                  />

                </>

              )}

              <div className="text-center">

                <span

                  className={`inline-flex items-center justify-center min-w-[2rem] h-7 px-1 rounded-lg font-bold text-xs tabular-nums ${

                    isChampion

                      ? 'bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100'

                      : team.position <= 3

                      ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'

                      : 'text-gray-900 dark:text-white'

                  }`}

                >

                  {team.points}

                </span>

              </div>

            </Link>

          );

        })}

      </div>



      {/* Mobile */}

      <div className="md:hidden space-y-3">

        {standings.map((team: TeamStanding) => {

          const isChampion = champion?.teamId === team.team.id;

          const isLeader = isScopeLeader(team.team.id, standings, champion?.teamId ?? null);



          return (

            <Link

              key={team.team.id}

              to={`/sports/tournaments/${tournament?.slug}/teams/${team.team.slug}`}

              className={`block rounded-2xl shadow-sm border p-4 transition-shadow ${

                isChampion

                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700'

                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'

              }`}

            >

              <div className="flex items-start gap-3 mb-3">

                <PositionBadge position={team.position} isChampion={isChampion} />

                <TeamAvatar team={team.team} />

                <div className="min-w-0 flex-1">

                  <p

                    className={`font-bold text-base leading-tight break-words ${

                      isChampion ? 'text-amber-950 dark:text-amber-100' : 'text-gray-900 dark:text-white'

                    }`}

                  >

                    {team.team.name}

                  </p>

                  {isChampion && (

                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mt-1 flex items-center gap-1">

                      🏆 Campeón del torneo

                    </p>

                  )}

                  {!isChampion && isLeader && (

                    <p className="text-xs font-semibold text-yellow-700 mt-1">🥇 Líder de la tabla</p>

                  )}

                </div>

                <span

                  className={`text-lg font-bold tabular-nums shrink-0 ${

                    isChampion ? 'text-amber-800' : 'text-gray-900 dark:text-white'

                  }`}

                >

                  {team.points}

                  <span className="text-xs font-normal text-gray-500 block text-center">pts</span>

                </span>

              </div>



              <div className={`grid gap-2 text-center ${isSoftball ? 'grid-cols-3' : 'grid-cols-4'}`}>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-2">

                  <p className="text-[10px] text-gray-500">PJ</p>

                  <p className="font-semibold text-sm">{team.played}</p>

                </div>

                <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-2">

                  <p className="text-[10px] text-green-600">G</p>

                  <p className="font-semibold text-sm text-green-700">{team.won}</p>

                </div>

                {!isSoftball && (

                  <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-xl p-2">

                    <p className="text-[10px] text-yellow-600">E</p>

                    <p className="font-semibold text-sm text-yellow-700">{team.drawn}</p>

                  </div>

                )}

                <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-2">

                  <p className="text-[10px] text-red-500">P</p>

                  <p className="font-semibold text-sm text-red-600">{team.lost}</p>

                </div>

              </div>



              {isSoftball && (

                <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs">

                  <div>

                    <span className="text-gray-500">CR </span>

                    <span className="font-semibold">{team.runs ?? 0}</span>

                  </div>

                  <div>

                    <span className="text-gray-500">CC </span>

                    <span className="font-semibold">{team.runs_against ?? 0}</span>

                  </div>

                  <div>

                    <span className="text-gray-500">AVG </span>

                    <span className="font-semibold">{team.average?.toFixed(3) ?? '-'}</span>

                  </div>

                </div>

              )}

            </Link>

          );

        })}

      </div>



      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 text-center">

          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Equipos</p>

          <p className="text-2xl font-bold text-gray-900 dark:text-white">{standings.length}</p>

        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 text-center">

          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Partidos</p>

          <p className="text-2xl font-bold text-gray-900 dark:text-white">

            {standings.reduce((acc: number, t: TeamStanding) => acc + t.played, 0) / 2}

          </p>

        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 text-center col-span-2 md:col-span-2">

          {champion ? (

            <>

              <p className="text-xs text-amber-700 uppercase tracking-wider mb-1">🏆 Campeón</p>

              <p className="text-lg font-bold text-amber-950 dark:text-amber-100 truncate">{champion.teamName}</p>

            </>

          ) : (

            <>

              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Estado</p>

              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Torneo en curso</p>

            </>

          )}

        </div>

      </div>



      <div className="mt-8">

        <TournamentAdSlot position="standings_bottom" tournamentId={tournament?.id} variant="compact" />

      </div>

    </div>

  );

};



export default TournamentStandingsPage;


