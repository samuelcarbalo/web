import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
//   Trophy, 
  Calendar, 
  Users, 
//   MapPin, 
  ChevronLeft,
  Share2,
  Edit,
  Trash2
} from 'lucide-react';
import { useTournament, useDeleteTournament } from '../../hooks/useSports';
import { useAuthStore } from '../../store/authStore';
import { sportTypeLabels, sportTypeColors } from '../../types/sports';


const TournamentDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();
  const { data: tournament, isLoading } = useTournament(slug || '');
  const deleteMutation = useDeleteTournament();
  const isManager = user?.role === 'manager';
  if (isManager){
    console.log(user?.id)
  }
  const isOwner = isManager && user?.id === tournament?.posted_by;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDelete = () => {
    if (confirm('¿Estás seguro de eliminar este torneo?')) {
      deleteMutation.mutate(slug || '');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Torneo no encontrado</h2>
          <Link to="/sports" className="text-green-600 mt-4 inline-block">
            ← Ver todos los torneos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="h-64 bg-gray-900 relative overflow-hidden">
        {tournament.banner ? (
          <img 
            src={tournament.banner} 
            alt={tournament.name}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className={`w-full h-full ${sportTypeColors[tournament.sport_type]}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link 
            to="/sports" 
            className="inline-flex items-center text-white/80 hover:text-white mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Volver a torneos
          </Link>
          <h1 className="text-4xl font-bold text-white">{tournament.name}</h1>
          <p className="text-white/80 mt-2 text-lg">{sportTypeLabels[tournament.sport_type]}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sobre el torneo</h2>
              <p className="text-gray-600 whitespace-pre-line">
                {tournament.description}
              </p>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Información general</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Inicio</p>
                    <p className="font-medium">{formatDate(tournament.start_date)}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Finalización</p>
                    <p className="font-medium">{formatDate(tournament.end_date)}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Equipos</p>
                    <p className="font-medium">{tournament.teams_count} / {tournament.max_teams}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Jugadores por equipo</p>
                    <p className="font-medium">{tournament.min_players_per_team} - {tournament.max_players_per_team}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <div className="card bg-green-50 border-green-200">
              <h3 className="font-bold text-gray-900 mb-4">Inscripción</h3>
              
              {tournament.is_registration_open ? (
                <>
                  <div className="flex items-center text-green-700 mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                    Inscripciones abiertas
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Cierra el {formatDate(tournament.registration_deadline)}
                  </p>
                  <button className="w-full btn-primary">
                    Inscribir mi equipo
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600">Inscripciones cerradas</p>
                </div>
              )}
            </div>

            {/* Admin Actions */}
            {isOwner && (
              <div className="card">
                <h3 className="font-bold text-gray-900 mb-4">Gestión</h3>
                <div className="space-y-2">
                  <Link 
                    to={`/sports/tournaments/${tournament.slug}/edit`}
                    className="w-full btn-secondary flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar torneo
                  </Link>
                  <button 
                    onClick={handleDelete}
                    className="w-full py-2 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </button>
                </div>
              </div>
            )}

            {/* Share */}
            <button className="w-full card flex items-center justify-center text-gray-600 hover:text-gray-900">
              <Share2 className="w-5 h-5 mr-2" />
              Compartir torneo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetail;