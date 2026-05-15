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
  ImagePlus,
} from 'lucide-react';

import { 
  useTournament, 
  useDeleteTournament,
  useTeams,
  useDeleteTeam,
  useBannersByPosition,
} from '../../hooks/useSports';

import { useAuthStore } from '../../store/authStore';
import { sportTypeLabels, sportTypeColors } from '../../types/sports';
import CreateTeamModal from './CreateTeamModal';
import CreateBannerModal from '../../components/CreateBannerModal';
import BannerAd from '../../components/BannerAd';
import { useQueryClient } from '@tanstack/react-query';


const TournamentDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const handleTeamCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['teams', slug] });
  };

  const { data: tournament, isLoading } = useTournament(slug || '');
  const deleteMutation = useDeleteTournament();

  const { data: teams } = useTeams(slug || '');
  const deleteTeamMutation = useDeleteTeam();

  // Banners publicitarios para esta posición
  const { data: banners } = useBannersByPosition('tournament_detail', tournament?.id);

  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isCreateBannerModalOpen, setIsCreateBannerModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isManager = user?.role === 'manager';
  const isOwner = isManager && user?.id === tournament?.posted_by;

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-green-600 border-t-transparent" />
          <p className="text-sm text-gray-500">Cargando torneo...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Torneo no encontrado</h2>
          <p className="text-gray-500 mt-2 mb-6">El torneo que buscas no existe o ha sido eliminado.</p>
          <Link 
            to="/sports" 
            className="inline-flex items-center px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
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
      <div className="min-h-screen bg-gray-50/50">
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

          <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-20">
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
                  ${tournament.status === 'completed' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' : ''}
                  ${tournament.status === 'upcoming' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : ''}
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

              <button 
                onClick={handleShare}
                className="flex-shrink-0 p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-white transition-colors"
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

        {/* Stats Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6 md:gap-10 py-4 overflow-x-auto">
              <div className="flex items-center gap-2.5 min-w-fit">
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                  <Calendar className="w-4.5 h-4.5 text-green-600" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Inicio</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(tournament.start_date)}</p>
                </div>
              </div>

              <div className="w-px h-8 bg-gray-200 hidden md:block" />

              <div className="flex items-center gap-2.5 min-w-fit">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Clock className="w-4.5 h-4.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Fin</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(tournament.end_date)}</p>
                </div>
              </div>

              <div className="w-px h-8 bg-gray-200 hidden md:block" />

              <div className="flex items-center gap-2.5 min-w-fit">
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Shield className="w-4.5 h-4.5 text-purple-600" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Equipos</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {teams?.count || 0} <span className="text-gray-400 font-normal">/ {tournament.max_teams}</span>
                  </p>
                </div>
              </div>

              <div className="w-px h-8 bg-gray-200 hidden md:block" />

              <div className="flex items-center gap-2.5 min-w-fit">
                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Target className="w-4.5 h-4.5 text-orange-600" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Jugadores</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {tournament.min_players_per_team}-{tournament.max_players_per_team} <span className="text-gray-400 font-normal">por equipo</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Banner Publicitario - ARRIBA DE "Sobre el torneo" */}
              <div className="space-y-3">
                {banners && banners.length > 0 && (
                  <div className="space-y-3">
                    {banners.map((banner: any) => (
                      <BannerAd
                        key={banner.id}
                        id={banner.id}
                        image={banner.image}
                        title={banner.title}
                        link_url={banner.link_url}
                        description={banner.description}
                        variant="horizontal"
                      />
                    ))}
                  </div>
                )}

                {/* Botón para agregar banner - SOLO OWNER */}
                {isOwner && (
                  <button
                    onClick={() => setIsCreateBannerModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-green-600 hover:border-green-400 hover:bg-green-50/50 transition-all group"
                  >
                    <ImagePlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Agregar banner publicitario</span>
                  </button>
                )}
              </div>

              {/* Sobre el torneo */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-gray-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Sobre el torneo</h2>
                </div>
                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                  {tournament.description ? (
                    <p className="whitespace-pre-line">{tournament.description}</p>
                  ) : (
                    <p className="text-gray-400 italic">No hay descripción disponible para este torneo.</p>
                  )}
                </div>
              </div>

              {/* Información general - Rediseñado */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-gray-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Información general</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Fecha de inicio</p>
                      <p className="font-semibold text-gray-900">{formatDate(tournament.start_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Fecha de finalización</p>
                      <p className="font-semibold text-gray-900">{formatDate(tournament.end_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Equipos inscritos</p>
                      <p className="font-semibold text-gray-900">
                        {tournament.teams_count} <span className="text-gray-400 font-normal">de {tournament.max_teams} cupos</span>
                      </p>
                      {/* Barra de progreso */}
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${registrationProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Jugadores por equipo</p>
                      <p className="font-semibold text-gray-900">
                        {tournament.min_players_per_team} - {tournament.max_players_per_team} jugadores
                      </p>
                    </div>
                  </div>
                </div>

                {registrationOpen && tournament.registration_deadline && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Inscripciones abiertas</p>
                      <p className="text-xs text-amber-600">Cierran el {formatDate(tournament.registration_deadline)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Equipos inscritos - Rediseñado */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Equipos inscritos</h3>
                        <p className="text-sm text-gray-500">{teams?.count || 0} equipos registrados</p>
                      </div>
                    </div>

                    {isOwner && registrationOpen && (
                      <button 
                        onClick={() => setIsCreateTeamModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar
                      </button>
                    )}
                  </div>
                </div>

                {teams?.results && teams.results.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {teams.results.map((team: any) => (
                      <div
                        key={team.id}
                        className="group flex items-center justify-between p-4 md:px-8 hover:bg-gray-50/80 transition-colors"
                      >
                        <Link
                          to={`/sports/tournaments/${tournament.slug}/teams/${team.slug}`}
                          className="flex items-center flex-1 min-w-0 gap-4"
                        >
                          {team.logo ? (
                            <img 
                              src={team.logo} 
                              alt="" 
                              className="w-12 h-12 rounded-xl object-cover shadow-sm flex-shrink-0 bg-white"
                              crossOrigin="anonymous"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div 
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
                              style={{ backgroundColor: team.primary_color || '#3B82F6' }}
                            >
                              {team.abbreviation || team.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate group-hover:text-green-700 transition-colors">
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
                            <span className="px-2 py-1 bg-gray-100 rounded-md font-medium">
                              {team.played || 0} PJ
                            </span>
                            <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md font-medium">
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
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
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
                rounded-2xl shadow-sm border p-6
                ${registrationOpen 
                  ? 'bg-green-50/60 border-green-200/60' 
                  : 'bg-white border-gray-200/80'
                }
              `}>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${registrationOpen ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                  Inscripción
                </h3>

                {registrationOpen ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Cupos disponibles</span>
                      <span className="font-bold text-gray-900">
                        {tournament.max_teams - (teams?.count || 0)} <span className="text-gray-400 font-normal">/ {tournament.max_teams}</span>
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${registrationProgress}%` }}
                      />
                    </div>

                    <p className="text-xs text-gray-500">
                      Cierra el <span className="font-medium text-gray-700">{formatDate(tournament.registration_deadline)}</span>
                    </p>

                    {isOwner ? (
                      <button 
                        onClick={() => setIsCreateTeamModalOpen(true)}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl text-white bg-green-600 hover:bg-green-700 shadow-sm shadow-green-200 transition-all hover:shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        Inscribir equipo
                      </button>
                    ) : myTeam ? (
                      <Link
                        to={`/sports/tournaments/${tournament.slug}/teams/${myTeam.id}/roster`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl text-white bg-green-600 hover:bg-green-700 shadow-sm shadow-green-200 transition-all"
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
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">Inscripciones cerradas</p>
                    <p className="text-xs text-gray-400 mt-1">El período de registro ha finalizado</p>
                  </div>
                )}
              </div>

              {/* Estadísticas / Acciones */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Acciones rápidas</h3>
                <div className="space-y-2.5">
                  <Link
                    to={`/sports/tournaments/${tournament.slug}/standings`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50/50 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                      <Trophy className="w-4.5 h-4.5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Tabla de posiciones</p>
                      <p className="text-xs text-gray-500">Ver clasificación</p>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                  </Link>

                  <Link
                    to={`/sports/tournaments/${tournament.slug}/player-stats`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50/50 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <BarChart3 className="w-4.5 h-4.5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Estadísticas</p>
                      <p className="text-xs text-gray-500">Jugadores y equipos</p>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                  </Link>

                  <Link
                    to={`/sports/tournaments/${tournament.slug}/schedule`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Calendar className="w-4.5 h-4.5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Calendario</p>
                      <p className="text-xs text-gray-500">Partidos y resultados</p>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                  </Link>
                </div>
              </div>

              {/* Gestión (solo owner) */}
              {isOwner && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Gestión del torneo</h3>
                  <div className="space-y-2.5">
                    <Link 
                      to={`/sports/tournaments/${tournament.slug}/edit`}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <Edit className="w-4.5 h-4.5 text-gray-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Editar torneo</span>
                    </Link>

                    <button 
                      onClick={handleDelete}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 hover:border-red-300 hover:bg-red-50 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
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
                className="w-full bg-white rounded-2xl shadow-sm border border-gray-200/80 p-4 flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
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

      {/* Modal: Crear banner publicitario */}
      <CreateBannerModal
        isOpen={isCreateBannerModalOpen}
        onClose={() => setIsCreateBannerModalOpen(false)}
        position="tournament_detail"
        tournamentId={tournament?.id}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['banners', 'by-position', 'tournament_detail'] })}
      />
    </>
  );
};

export default TournamentDetail;