import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  ChevronLeft,
  Share2,
  Edit,
  Trash2,
  Plus,
  Trophy,
  BarChart3,
  MapPin,
  Clock,
  Shield,
  Target,
  TrendingUp,
  AlertCircle,
  Layers,
} from 'lucide-react';

import { 
  useTournament, 
  useDeleteTournament,
  useTeams,
  useDeleteTeam,
  useTournamentStructure,
} from '../../hooks/useSports';

import { usePermissions } from '../../hooks/usePermissions';
import { sportTypeLabels, sportTypeColors } from '../../types/sports';
import ReportPublicationButton from '../../components/Moderation/ReportPublicationButton';
import CreateTeamModal from './CreateTeamModal';
import TournamentAdSlot from '../../components/Advertising/TournamentAdSlot';
import SponsorshipAvailabilityBanner from '../../components/Advertising/SponsorshipAvailabilityBanner';
import PurchaseSponsorshipModal from '../../components/Advertising/PurchaseSponsorshipModal';
import { useSponsorshipAvailability } from '../../hooks/useAdvertising';
import { useQueryClient } from '@tanstack/react-query';


const TournamentDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, isOwner: checkIsOwner } = usePermissions();
  const queryClient = useQueryClient();

  const { data: tournament, isLoading } = useTournament(slug || '');
  const { data: structure } = useTournamentStructure(slug || '');
  const deleteMutation = useDeleteTournament();

  const { data: teams } = useTeams(slug || '');
  const deleteTeamMutation = useDeleteTeam();

  // Patrocinio exclusivo del torneo
  const { data: sponsorshipAvailability } = useSponsorshipAvailability(slug || '');

  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isPurchaseSponsorshipOpen, setIsPurchaseSponsorshipOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOwner = checkIsOwner(tournament);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isRegistrationStillOpen = () => {
    if (!tournament?.registration_deadline) return false;
    return new Date(tournament.registration_deadline) > new Date();
  };

  const handleDelete = () => {
    if (confirm('¿Estás seguro de eliminar este torneo? Esta acción no se puede deshacer.')) {
      deleteMutation.mutate(slug || '');
    }
  };

  const handleDeleteTeam = (teamSlug: string) => {
    if (confirm('¿Eliminar este equipo?')) {
      deleteTeamMutation.mutate(teamSlug);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: tournament?.name,
        text: tournament?.description,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const myTeam = teams?.results?.find((team: any) => team.coach_email === user?.email);

  // Calcular progreso de inscripción
  const registrationProgress = tournament 
    ? Math.min(100, (tournament.teams_count / tournament.max_teams) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-green-600 border-t-transparent" />
          <p className="text-sm text-gray-500">Cargando torneo...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Torneo no encontrado</h2>
          <p className="text-gray-500 mt-2 mb-6">El torneo que buscas no existe o ha sido eliminado.</p>
          <Link 
            to="/sports" 
            className="inline-flex items-center px-5 py-2.5 bg-green-600 text-white rounded-3xl font-medium hover:bg-green-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Ver todos los torneos
          </Link>
        </div>
      </div>
    );
  }

  const registrationOpen = isRegistrationStillOpen();

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950/50">
        {/* Banner Hero */}
        <div className="relative h-72 md:h-80 bg-gray-900 overflow-hidden">
          {tournament.banner ? (
            <img 
              src={tournament.banner} 
              alt={tournament.name}
              className="w-full h-full object-cover opacity-50"
              crossOrigin="anonymous"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className={`w-full h-full ${sportTypeColors[tournament.sport_type]} opacity-80`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 page-container pb-8 pt-20">
            <Link 
              to="/sports" 
              className="inline-flex items-center text-white/70 hover:text-white mb-3 transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Volver a torneos
            </Link>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                <span className={`
                  px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide
                  ${tournament.status === 'active' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : ''}
                  ${tournament.status === 'finished' || tournament.status === 'completed' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' : ''}
                  ${tournament.status === 'registration' || tournament.status === 'draft' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : ''}
                  ${tournament.status === 'cancelled' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : ''}
                `}>
                  {tournament.status}
                </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/70 border border-white/10">
                    {sportTypeLabels[tournament.sport_type]}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                  {tournament.name}
                </h1>
                <p className="text-white/60 mt-2 text-sm md:text-base flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {tournament.organization_name || 'Organización'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <ReportPublicationButton
                  contentType="tournament"
                  objectId={tournament.id}
                  className="text-white/70 hover:text-red-300"
                />
                <button 
                  onClick={handleShare}
                  className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-3xl text-white transition-colors"
                  title="Compartir"
                >
                  {copied ? (
                    <span className="text-xs font-medium">¡Copiado!</span>
                  ) : (
                    <Share2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="page-container">
            <div className="flex items-center gap-6 md:gap-10 py-4 overflow-x-auto">
              <div className="flex items-center gap-2.5 min-w-fit">
                <div className="w-9 h-9 rounded-3xl bg-green-50 dark:bg-green-950/40 flex items-center justify-center">
                  <Calendar className="w-4.5 h-4.5 text-green-600" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Inicio</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(tournament.start_date)}</p>
                </div>
              </div>

              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 hidden md:block" />

              <div className="flex items-center gap-2.5 min-w-fit">
                <div className="w-9 h-9 rounded-3xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                  <Clock className="w-4.5 h-4.5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Fin</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(tournament.end_date)}</p>
                </div>
              </div>

              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 hidden md:block" />

              <div className="flex items-center gap-2.5 min-w-fit">
                <div className="w-9 h-9 rounded-3xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center">
                  <Shield className="w-4.5 h-4.5 text-purple-600" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Equipos</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {teams?.count || 0} <span className="text-gray-400 font-normal">/ {tournament.max_teams}</span>
                  </p>
                </div>
              </div>

              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 hidden md:block" />

              <div className="flex items-center gap-2.5 min-w-fit">
                <div className="w-9 h-9 rounded-3xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
                  <Target className="w-4.5 h-4.5 text-orange-600" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Jugadores</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {tournament.min_players_per_team}-{tournament.max_players_per_team} <span className="text-gray-400 font-normal">por equipo</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="page-container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Patrocinio / banner publicitario */}
              <div className="space-y-3">
                <SponsorshipAvailabilityBanner
                  availability={sponsorshipAvailability}
                  onPurchaseClick={() => setIsPurchaseSponsorshipOpen(true)}
                />
                <TournamentAdSlot
                  position="tournament_detail"
                  tournamentId={tournament?.id}
                  variant="horizontal"
                />
              </div>

              {/* Sobre el torneo */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sobre el torneo</h2>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed">
                  {tournament.description ? (
                    <p className="whitespace-pre-line">{tournament.description}</p>
                  ) : (
                    <p className="text-gray-400 italic">No hay descripción disponible para este torneo.</p>
                  )}
                  {tournament.rules_url && (
                    <p className="mt-4">
                      <a
                        href={tournament.rules_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 font-semibold hover:underline"
                      >
                        Ver reglamento oficial del torneo ↗
                      </a>
                    </p>
                  )}
                  {tournament.sport_type === 'softball' && (
                    <p className="mt-3 text-sm text-gray-500">
                      Alineación:{' '}
                      <strong>
                        {(tournament.lineup_size ?? 9) === 10
                          ? '9 en campo + bateador designado (10 titulares)'
                          : '9 jugadores en campo'}
                      </strong>
                    </p>
                  )}
                </div>
              </div>

              {/* Información general - Rediseñado */}
              <div className="card">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Información general</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50/70 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700/80">
                    <div className="w-10 h-10 rounded-3xl bg-green-100 dark:bg-green-950/40 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Fecha de inicio</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatDate(tournament.start_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50/70 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700/80">
                    <div className="w-10 h-10 rounded-3xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Fecha de finalización</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatDate(tournament.end_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50/70 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700/80">
                    <div className="w-10 h-10 rounded-3xl bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Equipos inscritos</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {teams?.count} <span className="text-gray-400 font-normal">de {tournament.teams_count} cupos</span>
                      </p>
                      {/* Barra de progreso */}
                      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-violet-600 dark:bg-violet-500 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${registrationProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50/70 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700/80">
                    <div className="w-10 h-10 rounded-3xl bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Jugadores por equipo</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {tournament.min_players_per_team} - {tournament.max_players_per_team} jugadores
                      </p>
                    </div>
                  </div>
                </div>

                {registrationOpen && tournament.registration_deadline && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-3xl flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Inscripciones abiertas</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">Cierran el {formatDate(tournament.registration_deadline)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Equipos inscritos - Rediseñado */}
              <div className="card overflow-hidden p-0">
                <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-3xl bg-green-100 dark:bg-green-950/40 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Equipos inscritos</h3>
                        <p className="text-sm text-gray-500">{teams?.count || 0} equipos registrados</p>
                      </div>
                    </div>

                    {isOwner && registrationOpen && (
                      <button 
                        onClick={() => setIsCreateTeamModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-3xl hover:bg-green-700 transition-colors shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar
                      </button>
                    )}
                  </div>
                </div>

                {teams?.results && teams.results.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {teams.results.map((team: any) => (
                      <div
                        key={team.id}
                        className="group flex items-center justify-between p-4 md:px-8 hover:bg-gray-50 dark:hover:bg-gray-800/50/80 transition-colors"
                      >
                        <Link
                          to={`/sports/tournaments/${tournament.slug}/teams/${team.slug}`}
                          className="flex items-center flex-1 min-w-0 gap-4"
                        >
                          {team.logo ? (
                            <img 
                              src={team.logo} 
                              alt="" 
                              className="w-12 h-12 rounded-3xl object-cover shadow-sm flex-shrink-0 bg-white"
                              crossOrigin="anonymous"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div 
                              className="w-12 h-12 rounded-3xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
                              style={{ backgroundColor: team.primary_color || '#3B82F6' }}
                            >
                              {team.abbreviation || team.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-green-700 transition-colors">
                              {team.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-500">
                                {team.coach_name || 'Sin entrenador'}
                              </span>
                              <span className="text-gray-300">·</span>
                              <span className="text-xs text-gray-500">
                                {team.players_count || 0} jugadores
                              </span>
                            </div>
                          </div>
                        </Link>

                        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                          {/* Stats rápidas del equipo */}
                          <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md font-medium">
                              {team.played || 0} PJ
                            </span>
                            <span className="px-2 py-1 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 rounded-md font-medium">
                              {team.points || 0} PTS
                            </span>
                          </div>

                          {isOwner && (
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteTeam(team.slug);
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-3xl transition-colors"
                              title="Eliminar equipo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">No hay equipos inscritos aún</p>
                    <p className="text-sm text-gray-400 mt-1">Los equipos aparecerán aquí una vez registrados</p>
                  </div>
                )}
              </div>

            </div>

            {/* Sidebar */}
            <div className="space-y-6">

              {/* Inscripción */}
              <div className={`
                rounded-3xl shadow-sm border p-6
                ${registrationOpen 
                  ? 'bg-green-50/60 dark:bg-green-950/25 border-green-200/60 dark:border-green-800/50' 
                  : 'bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800/80'
                }
              `}>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${registrationOpen ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                  Inscripción
                </h3>

                {registrationOpen ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Cupos disponibles</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {tournament.max_teams - (teams?.count || 0)} <span className="text-gray-400 font-normal">/ {tournament.max_teams}</span>
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${registrationProgress}%` }}
                      />
                    </div>

                    <p className="text-xs text-gray-500">
                      Cierra el <span className="font-medium text-gray-700 dark:text-gray-200">{formatDate(tournament.registration_deadline)}</span>
                    </p>

                    {isOwner ? (
                      <button 
                        onClick={() => setIsCreateTeamModalOpen(true)}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-3xl text-white bg-green-600 hover:bg-green-700 shadow-sm shadow-green-200 transition-all hover:shadow-2xl"
                      >
                        <Plus className="w-4 h-4" />
                        Inscribir equipo
                      </button>
                    ) : myTeam ? (
                      <Link
                        to={`/sports/tournaments/${tournament.slug}/teams/${myTeam.id}/roster`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-3xl text-white bg-green-600 hover:bg-green-700 shadow-sm shadow-green-200 transition-all"
                      >
                        <Users className="w-4 h-4" />
                        Gestionar plantilla
                      </Link>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-sm text-gray-500">Inscripciones abiertas para entrenadores</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Inscripciones cerradas</p>
                    <p className="text-xs text-gray-400 mt-1">El período de registro ha finalizado</p>
                  </div>
                )}
              </div>

              {/* Estadísticas / Acciones */}
              <div className="card">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Acciones rápidas</h3>
                <div className="space-y-2.5">
                  <Link
                    to={`/deportes/tournaments/${tournament.slug}/standings`}
                    className="flex items-center gap-3 px-4 py-3 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-700 hover:bg-yellow-50/50 dark:hover:bg-yellow-950/20 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-3xl bg-yellow-100 dark:bg-yellow-950/40 flex items-center justify-center group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/50 transition-colors">
                      <Trophy className="w-4.5 h-4.5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Tabla de posiciones</p>
                      <p className="text-xs text-gray-500">Ver clasificación</p>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                  </Link>

                  {structure?.structure_mode === 'structured' && (
                    <Link
                      to={`/deportes/tournaments/${tournament.slug}/structure`}
                      className="flex items-center gap-3 px-4 py-3 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-3xl bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center group-hover:bg-violet-200 dark:group-hover:bg-violet-900/50 transition-colors">
                        <Layers className="w-4.5 h-4.5 text-violet-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Estructura</p>
                        <p className="text-xs text-gray-500">Cuadrangulares y fixture</p>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                    </Link>
                  )}

                  <Link
                    to={`/sports/tournaments/${tournament.slug}/player-stats`}
                    className="flex items-center gap-3 px-4 py-3 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-3xl bg-green-100 dark:bg-green-950/40 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                      <BarChart3 className="w-4.5 h-4.5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Estadísticas</p>
                      <p className="text-xs text-gray-500">Jugadores y equipos</p>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                  </Link>

                  <Link
                    to={`/sports/tournaments/${tournament.slug}/schedule`}
                    className="flex items-center gap-3 px-4 py-3 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-3xl bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center group-hover:bg-violet-200 dark:group-hover:bg-violet-900/50 transition-colors">
                      <Calendar className="w-4.5 h-4.5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Calendario</p>
                      <p className="text-xs text-gray-500">Partidos y resultados</p>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                  </Link>
                </div>
              </div>

              {/* Gestión (solo owner) */}
              {isOwner && (
                <div className="card">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Gestión del torneo</h3>
                  <div className="space-y-2.5">
                    <Link 
                      to={`/sports/tournaments/${tournament.slug}/edit`}
                      className="flex items-center gap-3 px-4 py-3 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <Edit className="w-4.5 h-4.5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Editar torneo</span>
                    </Link>

                    <button 
                      onClick={handleDelete}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-3xl border border-red-200 dark:border-red-900/50 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-3xl bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                        <Trash2 className="w-4.5 h-4.5 text-red-600" />
                      </div>
                      <span className="text-sm font-medium text-red-600">Eliminar torneo</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Compartir */}
              <button 
                onClick={handleShare}
                className="w-full card py-4 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
              >
                <Share2 className="w-4.5 h-4.5" />
                <span className="text-sm font-medium">{copied ? '¡Enlace copiado!' : 'Compartir torneo'}</span>
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* Modal: Crear equipo */}
      <CreateTeamModal
        isOpen={isCreateTeamModalOpen}
        onClose={() => setIsCreateTeamModalOpen(false)}
        tournamentId={tournament?.id || ''}
        tournamentName={tournament?.name || ''}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['teams', slug] })}
      />

      <PurchaseSponsorshipModal
        isOpen={isPurchaseSponsorshipOpen}
        onClose={() => setIsPurchaseSponsorshipOpen(false)}
        tournamentId={tournament?.id || ''}
        tournamentName={tournament?.name || ''}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['sponsorship'] });
          queryClient.invalidateQueries({ queryKey: ['banners'] });
        }}
      />
    </>
  );
};

export default TournamentDetail;