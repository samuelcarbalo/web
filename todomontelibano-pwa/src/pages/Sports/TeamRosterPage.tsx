import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  UserPlus,
  Shirt,
  Crown,
  Loader2,
  Camera,
  Users,
  CreditCard,
  Mail,
  Shield,
  Calendar,
  Hash,
  Trophy,
  Activity,
  UserX,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import {
  useTournament,
  usePlayers,
  useCreatePlayer,
  useUpdatePlayer,
  useDeletePlayer,
  useTeams,
} from '../../hooks/useSports';
import type { Player, CreatePlayerData } from '../../types/sports';

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || '';

/* ═══════════════════════════════════════════
   POSITIONS CONFIG
   ═══════════════════════════════════════════ */
const SOFTBALL_POSITIONS = [
  { value: 'pitcher', label: 'Pitcher' },
  { value: 'catcher', label: 'Catcher' },
  { value: 'first_base', label: '1B' },
  { value: 'second_base', label: '2B' },
  { value: 'third_base', label: '3B' },
  { value: 'shortstop', label: 'SS' },
  { value: 'left_field', label: 'LF' },
  { value: 'center_field', label: 'CF' },
  { value: 'right_field', label: 'RF' },
  { value: 'designated_hitter', label: 'DH' },
  { value: 'utility', label: 'UT' },
];

const SOCCER_POSITIONS = [
  { value: 'goalkeeper', label: 'Portero' },
  { value: 'defender', label: 'Defensa' },
  { value: 'midfielder', label: 'Mediocampista' },
  { value: 'forward', label: 'Delantero' },
];

/* ═══════════════════════════════════════════
   JERSEY COLOR MAP - Dynamic number badges
   ═══════════════════════════════════════════ */
const JERSEY_COLORS = [
  { bg: 'bg-rose-500', text: 'text-white', ring: 'ring-rose-200' },
  { bg: 'bg-sky-500', text: 'text-white', ring: 'ring-sky-200' },
  { bg: 'bg-emerald-500', text: 'text-white', ring: 'ring-emerald-200' },
  { bg: 'bg-amber-500', text: 'text-white', ring: 'ring-amber-200' },
  { bg: 'bg-violet-500', text: 'text-white', ring: 'ring-violet-200' },
  { bg: 'bg-cyan-500', text: 'text-white', ring: 'ring-cyan-200' },
  { bg: 'bg-orange-500', text: 'text-white', ring: 'ring-orange-200' },
  { bg: 'bg-pink-500', text: 'text-white', ring: 'ring-pink-200' },
  { bg: 'bg-indigo-500', text: 'text-white', ring: 'ring-indigo-200' },
  { bg: 'bg-teal-500', text: 'text-white', ring: 'ring-teal-200' },
];

function getJerseyColor(number: number) {
  return JERSEY_COLORS[number % JERSEY_COLORS.length];
}

/* ═══════════════════════════════════════════
   POSITION BADGE COMPONENT
   ═══════════════════════════════════════════ */
const PositionBadge: React.FC<{ position: string }> = ({ position }) => {
  const positionStyles: Record<string, string> = {
    pitcher: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    catcher: 'bg-amber-100 text-amber-700 border-amber-200',
    goalkeeper: 'bg-amber-100 text-amber-700 border-amber-200',
    first_base: 'bg-sky-100 text-sky-700 border-sky-200',
    second_base: 'bg-sky-100 text-sky-700 border-sky-200',
    third_base: 'bg-sky-100 text-sky-700 border-sky-200',
    shortstop: 'bg-violet-100 text-violet-700 border-violet-200',
    left_field: 'bg-teal-100 text-teal-700 border-teal-200',
    center_field: 'bg-teal-100 text-teal-700 border-teal-200',
    right_field: 'bg-teal-100 text-teal-700 border-teal-200',
    designated_hitter: 'bg-rose-100 text-rose-700 border-rose-200',
    forward: 'bg-rose-100 text-rose-700 border-rose-200',
    midfielder: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    defender: 'bg-sky-100 text-sky-700 border-sky-200',
    utility: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const style = positionStyles[position] || 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${style}`}>
      {position?.toUpperCase()}
    </span>
  );
};

/* ═══════════════════════════════════════════
   STAT CARD COMPONENT
   ═══════════════════════════════════════════ */
const StatCard: React.FC<{
  icon: React.ReactNode;
  value: string | number;
  label: string;
  accent: string;
  accentBg: string;
}> = ({ icon, value, label, accent, accentBg }) => (
  <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-5 group hover:shadow-lg hover:border-slate-300 transition-all duration-300">
    <div className={`absolute top-0 right-0 w-20 h-20 ${accentBg} rounded-bl-full opacity-60 group-hover:scale-110 transition-transform duration-300`} />
    <div className={`w-10 h-10 rounded-xl ${accentBg} flex items-center justify-center mb-3`}>
      <span className={accent}>{icon}</span>
    </div>
    <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
  </div>
);

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
const TeamRosterPage: React.FC = () => {
  const { tournamentSlug, teamSlug } = useParams<{
    tournamentSlug: string;
    teamSlug: string;
  }>();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Data hooks ── */
  const { data: tournament } = useTournament(tournamentSlug || '');
  const { data: teams } = useTeams(tournamentSlug || '');
  const myTeam = teams?.results?.find((team: any) => team.coach_email === user?.email);
  const teamId = teamSlug || myTeam?.id;

  const { data: playersData, isLoading: loadingPlayers } = usePlayers(teamId);
  const createMutation = useCreatePlayer();
  const updateMutation = useUpdatePlayer();
  const deleteMutation = useDeletePlayer();

  /* ── Local state ── */
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState<CreatePlayerData>({
    first_name: '',
    last_name: '',
    nickname: '',
    jersey_number: 1,
    position: '',
    team: teamId || '',
    birth_date: '',
    id_number: '',
    email: '',
    tournament: tournament?.id,
    photo: '',
    is_captain: false,
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const positions =
    tournament?.sport_type === 'softball' ? SOFTBALL_POSITIONS : SOCCER_POSITIONS;

  /* ── Sync tournament/team refs ── */
  useEffect(() => {
    if (tournament?.id && teamId) {
      setFormData((prev) => ({
        ...prev,
        tournament: tournament.id,
        team: teamId,
      }));
    }
  }, [tournament?.id, teamId]);

  /* ── Validation ── */
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name.trim())
      newErrors.first_name = 'El nombre es requerido';
    if (!formData.last_name.trim())
      newErrors.last_name = 'El apellido es requerido';
    if (!formData.position) newErrors.position = 'La posición es requerida';
    if (
      formData.jersey_number === undefined ||
      formData.jersey_number === null ||
      formData.jersey_number < 0 ||
      formData.jersey_number > 99
    ) {
      newErrors.jersey_number = 'Número inválido (0-99)';
    }
    if (!formData.team) newErrors.team = 'Error: no se encontró el equipo';
    if (
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = 'Correo electrónico inválido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ── Photo upload ── */
  const uploadImageToImgBB = async (file: File): Promise<string> => {
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);
    formDataUpload.append('key', IMGBB_API_KEY);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formDataUpload,
    });

    if (!response.ok) throw new Error('Error al subir imagen');
    const data = await response.json();
    if (data.success) return data.data.url;
    throw new Error(data.error?.message || 'Error al subir imagen');
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processPhotoFile(file);
  };

  const processPhotoFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, photo: 'El archivo debe ser una imagen' }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: 'Máximo 2MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreviewPhoto(reader.result as string);
    reader.readAsDataURL(file);

    setUploadingPhoto(true);
    setErrors((prev) => ({ ...prev, photo: '' }));

    try {
      const url = await uploadImageToImgBB(file);
      setFormData((prev) => ({ ...prev, photo: url }));
      setPreviewPhoto(null);
    } catch {
      setErrors((prev) => ({ ...prev, photo: 'Error al subir. Usa URL.' }));
    } finally {
      setUploadingPhoto(false);
    }
  };

  /* ── Drag & drop handlers ── */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processPhotoFile(file);
  };

  /* ── Form submit ── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const dataToSend: CreatePlayerData = {
      ...formData,
      id_number: formData.id_number?.trim() || undefined,
      email: formData.email?.trim() || undefined,
    };
    if (editingPlayer) {
      updateMutation.mutate(
        { id: editingPlayer, data: dataToSend },
        { onSuccess: () => resetForm() }
      );
    } else {
      createMutation.mutate(dataToSend, {
        onSuccess: () => resetForm(),
      });
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      nickname: '',
      jersey_number: 1,
      position: '',
      team: teamId || '',
      birth_date: '',
      tournament: tournament?.id || '',
      photo: '',
      is_captain: false,
      is_active: true,
      id_number: '',
      email: '',
    });
    setPreviewPhoto(null);
    setErrors({});
    setEditingPlayer(null);
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player.id);
    setFormData({
      first_name: player.first_name,
      last_name: player.last_name,
      nickname: player.nickname || '',
      jersey_number: player.jersey_number,
      position: player.position,
      team: player.team,
      tournament: tournament?.id || '',
      birth_date: player.birth_date || '',
      photo: player.photo || '',
      is_captain: player.is_captain,
      is_active: player.is_active,
      id_number: player.id_number || '',
      email: player.email || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (playerId: string) => {
    if (confirm('¿Eliminar este jugador?')) {
      deleteMutation.mutate(playerId);
    }
  };

  const handleChange = (field: keyof CreatePlayerData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  /* ── Derived state ── */
  const players: Player[] = playersData?.results || [];
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const activePlayers = players.filter((p) => p.is_active).length;
  const captains = players.filter((p) => p.is_captain).length;
  const totalGoals = players.reduce((sum, p) => sum + (p.goals || 0), 0);
  const inactivePlayers = players.length - activePlayers;

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ═══════════ HEADER ═══════════ */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 backdrop-blur-xl bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link
            to={`/sports/tournaments/${tournamentSlug}`}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="h-8 w-px bg-slate-200" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                {myTeam?.name || 'Plantilla del Equipo'}
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                {tournament?.name}
              </p>
            </div>
          </div>
          {myTeam && (
            <div className="ml-auto hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <Sparkles className="w-3 h-3" />
                Entrenador
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ═══════════ SIDEBAR FORM ═══════════ */}
          {myTeam ? (
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="sticky top-24 space-y-6">
                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                  {/* Form Header */}
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      {editingPlayer ? (
                        <>
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Edit3 className="w-4 h-4 text-blue-400" />
                          </div>
                          Editar Jugador
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <UserPlus className="w-4 h-4 text-emerald-400" />
                          </div>
                          Nuevo Jugador
                        </>
                      )}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {editingPlayer
                        ? 'Modifica los datos del jugador'
                        : 'Completa los datos para inscribir'}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* ── Photo Upload Zone ── */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Foto del Jugador
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />

                      {(formData.photo || previewPhoto) ? (
                        <div className="flex items-center gap-4 mb-3">
                          <div className="relative">
                            <img
                              src={previewPhoto || formData.photo}
                              alt="Preview"
                              className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((p) => ({ ...p, photo: '' }));
                                setPreviewPhoto(null);
                              }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            {uploadingPhoto && (
                              <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-700">
                              {uploadingPhoto ? 'Subiendo...' : 'Foto lista'}
                            </p>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1"
                            >
                              Cambiar foto
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                            dragActive
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-2">
                            <Camera className="w-5 h-5 text-slate-400" />
                          </div>
                          <p className="text-sm font-medium text-slate-600">
                            {dragActive
                              ? 'Suelta la imagen aquí'
                              : 'Arrastra o haz clic'}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            JPG, PNG hasta 2MB
                          </p>
                        </div>
                      )}
                      {errors.photo && (
                        <p className="mt-2 text-xs text-red-600 font-medium">
                          {errors.photo}
                        </p>
                      )}

                      {/* URL Fallback */}
                      {!formData.photo && !previewPhoto && (
                        <div className="mt-3 relative">
                          <input
                            type="url"
                            value={formData.photo}
                            onChange={(e) =>
                              handleChange('photo', e.target.value)
                            }
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            placeholder="O pegar URL de imagen"
                          />
                          <Camera className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* ── Name Fields ── */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Nombre *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.first_name}
                            onChange={(e) =>
                              handleChange('first_name', e.target.value)
                            }
                            className={`w-full px-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                              errors.first_name
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                : 'border-slate-200'
                            }`}
                            placeholder="Juan"
                          />
                          <UserPlus className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                        </div>
                        {errors.first_name && (
                          <p className="mt-1.5 text-xs text-red-600 font-medium">
                            {errors.first_name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Apellido *
                        </label>
                        <input
                          type="text"
                          value={formData.last_name}
                          onChange={(e) =>
                            handleChange('last_name', e.target.value)
                          }
                          className={`w-full px-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                            errors.last_name
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                              : 'border-slate-200'
                          }`}
                          placeholder="Pérez"
                        />
                        {errors.last_name && (
                          <p className="mt-1.5 text-xs text-red-600 font-medium">
                            {errors.last_name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ── Nickname ── */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Apodo
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.nickname}
                          onChange={(e) =>
                            handleChange('nickname', e.target.value)
                          }
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          placeholder='Ej: "El Comandante"'
                        />
                        <Sparkles className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    {/* ── ID & Email ── */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Cédula
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.id_number}
                            onChange={(e) =>
                              handleChange('id_number', e.target.value)
                            }
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            placeholder="12345678"
                          />
                          <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        </div>
                        <p className="mt-1 text-[10px] text-slate-400 font-medium">
                          Opcional
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Correo
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              handleChange('email', e.target.value)
                            }
                            className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                              errors.email
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                : 'border-slate-200'
                            }`}
                            placeholder="jugador@email.com"
                          />
                          <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        </div>
                        {errors.email ? (
                          <p className="mt-1 text-xs text-red-600 font-medium">
                            {errors.email}
                          </p>
                        ) : (
                          <p className="mt-1 text-[10px] text-slate-400 font-medium">
                            Opcional
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ── Jersey Number & Position ── */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Número *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            max={99}
                            value={formData.jersey_number}
                            onChange={(e) =>
                              handleChange(
                                'jersey_number',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                              errors.jersey_number
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                : 'border-slate-200'
                            }`}
                          />
                          <Hash className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        </div>
                        {errors.jersey_number && (
                          <p className="mt-1 text-xs text-red-600 font-medium">
                            {errors.jersey_number}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Posición *
                        </label>
                        <div className="relative">
                          <select
                            value={formData.position}
                            onChange={(e) =>
                              handleChange('position', e.target.value)
                            }
                            className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none ${
                              errors.position
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                : 'border-slate-200'
                            }`}
                          >
                            <option value="">Seleccionar...</option>
                            {positions.map((pos) => (
                              <option key={pos.value} value={pos.value}>
                                {pos.label}
                              </option>
                            ))}
                          </select>
                          <Shield className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                          <ChevronLeft className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 rotate-[-90deg]" />
                        </div>
                        {errors.position && (
                          <p className="mt-1 text-xs text-red-600 font-medium">
                            {errors.position}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ── Birth Date ── */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Fecha de Nacimiento
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={formData.birth_date}
                          onChange={(e) =>
                            handleChange('birth_date', e.target.value)
                          }
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                        <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    {/* ── Toggles ── */}
                    <div className="flex items-center gap-6 pt-1">
                      <label className="flex items-center gap-2.5 cursor-pointer group">
                        <div
                          className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
                            formData.is_captain ? 'bg-amber-400' : 'bg-slate-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.is_captain}
                            onChange={(e) =>
                              handleChange('is_captain', e.target.checked)
                            }
                            className="sr-only"
                          />
                          <div
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                              formData.is_captain
                                ? 'translate-x-4'
                                : 'translate-x-0'
                            }`}
                          >
                            {formData.is_captain && (
                              <Crown className="w-3 h-3 text-amber-500 absolute top-1 left-1" />
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                          Capitán
                        </span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer group">
                        <div
                          className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
                            formData.is_active ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) =>
                              handleChange('is_active', e.target.checked)
                            }
                            className="sr-only"
                          />
                          <div
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                              formData.is_active
                                ? 'translate-x-4'
                                : 'translate-x-0'
                            }`}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                          Activo
                        </span>
                      </label>
                    </div>

                    {/* ── Buttons ── */}
                    <div className="pt-3 space-y-2">
                      {editingPlayer ? (
                        <>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full inline-flex justify-center items-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-semibold text-sm shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                          >
                            {isSubmitting ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Save className="w-4 h-4 mr-2" />
                            )}
                            Guardar Cambios
                          </button>
                          <button
                            type="button"
                            onClick={resetForm}
                            className="w-full px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold text-sm transition-all active:scale-[0.98]"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full inline-flex justify-center items-center px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 font-semibold text-sm shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Plus className="w-4 h-4 mr-2" />
                          )}
                          Agregar Jugador
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="sticky top-24">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    Acceso Restringido
                  </h3>
                  <p className="text-sm text-slate-500 mb-1">
                    No eres entrenador de ningún equipo
                  </p>
                  <p className="text-xs text-slate-400">
                    Contacta al administrador para gestionar jugadores
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ MAIN CONTENT ═══════════ */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Players Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              {/* Card Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Jugadores Inscritos
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">
                      {players.length} {players.length === 1 ? 'jugador' : 'jugadores'} en plantilla
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-black rounded-lg border border-emerald-200">
                  {players.length}
                </span>
              </div>

              {/* Loading State */}
              {loadingPlayers ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">
                    Cargando plantilla...
                  </p>
                </div>
              ) : players.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-4 shadow-inner">
                    <UserPlus className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-base font-bold text-slate-700 mb-1">
                    Plantilla vacía
                  </h3>
                  <p className="text-sm text-slate-400 text-center max-w-xs">
                    Aún no hay jugadores inscritos. Usa el formulario para
                    agregar el primero a tu equipo.
                  </p>
                </div>
              ) : (
                /* Players Table */
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/80">
                        <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Jugador
                        </th>
                        <th className="px-5 py-3.5 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider w-20">
                          Dorsal
                        </th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Posición
                        </th>
                        <th className="px-5 py-3.5 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider w-28">
                          Estado
                        </th>
                        <th className="px-5 py-3.5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider w-24">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {players.map((player) => {
                        const jerseyColor = getJerseyColor(player.jersey_number);
                        return (
                          <tr
                            key={player.id}
                            className="group hover:bg-slate-50/60 transition-all duration-150"
                          >
                            {/* Player Info */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3.5">
                                {player.photo ? (
                                  <div className="relative">
                                    <img
                                      src={player.photo}
                                      alt={player.full_name}
                                      className="w-11 h-11 rounded-xl object-cover ring-2 ring-slate-100 group-hover:ring-indigo-200 transition-all"
                                      onError={(e) => {
                                        (
                                          e.target as HTMLImageElement
                                        ).style.display = 'none';
                                      }}
                                    />
                                    {player.is_captain && (
                                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
                                        <Crown className="w-3 h-3 text-white" />
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div
                                    className={`w-11 h-11 rounded-xl ${jerseyColor.bg} flex items-center justify-center text-white font-black text-sm shadow-sm`}
                                  >
                                    {player.full_name?.[0]?.toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                                    {player.full_name}
                                    {player.is_captain && (
                                      <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                    )}
                                  </p>
                                  {player.nickname && (
                                    <p className="text-xs text-slate-400 font-medium truncate">
                                      &ldquo;{player.nickname}&rdquo;
                                    </p>
                                  )}
                                  {player.email && (
                                    <p className="text-[10px] text-slate-400 truncate">
                                      {player.email}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Jersey Number */}
                            <td className="px-5 py-4 text-center">
                              <span
                                className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${jerseyColor.bg} ${jerseyColor.text} font-black text-sm shadow-sm ring-2 ${jerseyColor.ring}`}
                              >
                                {player.jersey_number}
                              </span>
                            </td>

                            {/* Position */}
                            <td className="px-5 py-4">
                              <PositionBadge position={player.position} />
                            </td>

                            {/* Status */}
                            <td className="px-5 py-4 text-center">
                              {player.is_active ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                                  <Activity className="w-3 h-3" />
                                  Activo
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200">
                                  <UserX className="w-3 h-3" />
                                  Inactivo
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEdit(player)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                  title="Editar"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(player.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ═══════════ STATS GRID ═══════════ */}
            {players.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                  icon={<Users className="w-5 h-5" />}
                  value={players.length}
                  label="Jugadores"
                  accent="text-indigo-600"
                  accentBg="bg-indigo-100"
                />
                <StatCard
                  icon={<Activity className="w-5 h-5" />}
                  value={activePlayers}
                  label="Activos"
                  accent="text-emerald-600"
                  accentBg="bg-emerald-100"
                />
                <StatCard
                  icon={<Crown className="w-5 h-5" />}
                  value={captains}
                  label="Capitanes"
                  accent="text-amber-600"
                  accentBg="bg-amber-100"
                />
                <StatCard
                  icon={<Trophy className="w-5 h-5" />}
                  value={totalGoals}
                  label="Goles"
                  accent="text-rose-600"
                  accentBg="bg-rose-100"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamRosterPage;