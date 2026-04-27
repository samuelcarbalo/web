import React, { useState, useRef } from 'react';
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
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTournament, usePlayers, useCreatePlayer, useUpdatePlayer, useDeletePlayer } from '../../hooks/useSports';
import type { Player, CreatePlayerData } from '../../types/sports';

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || '';

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

const TeamRosterPage: React.FC = () => {
  const { tournamentSlug, teamSlug } = useParams<{ tournamentSlug: string; teamSlug: string }>();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: tournament } = useTournament(tournamentSlug || '');
  
  const teamId = teamSlug;
  
  const { data: playersData, isLoading: loadingPlayers } = usePlayers(teamId);
  const createMutation = useCreatePlayer();
  const updateMutation = useUpdatePlayer();
  const deleteMutation = useDeletePlayer();

  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreatePlayerData>({
    first_name: '',
    last_name: '',
    nickname: '',
    jersey_number: 1,
    position: '',
    team: teamId || player.team,
    birth_date: '',
    // nationality: '',
    photo: '',
    is_captain: false,
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const positions = tournament?.sport_type === 'softball' ? SOFTBALL_POSITIONS : SOCCER_POSITIONS;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'El nombre es requerido';
    if (!formData.last_name.trim()) newErrors.last_name = 'El apellido es requerido';
    if (!formData.position) newErrors.position = 'La posición es requerida';
    if (formData.jersey_number === undefined || formData.jersey_number === null || formData.jersey_number < 0 || formData.jersey_number > 99) {
      newErrors.jersey_number = 'Número inválido (0-99)';
    }
    if (!formData.team) newErrors.team = 'Error: no se encontró el equipo';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, photo: 'El archivo debe ser una imagen' }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, photo: 'Máximo 2MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreviewPhoto(reader.result as string);
    reader.readAsDataURL(file);

    setUploadingPhoto(true);
    setErrors(prev => ({ ...prev, photo: '' }));

    try {
      const url = await uploadImageToImgBB(file);
      setFormData(prev => ({ ...prev, photo: url }));
      setPreviewPhoto(null);
    } catch {
      setErrors(prev => ({ ...prev, photo: 'Error al subir. Usa URL.' }));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingPlayer) {
      updateMutation.mutate(
        { id: editingPlayer, data: formData },
        { onSuccess: () => resetForm() }
      );
    } else {
      createMutation.mutate(formData, {
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
      // nationality: '',
      photo: '',
      is_captain: false,
      is_active: true,
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
      birth_date: player.birth_date || '',
      // nationality: player.nationality || '',
      photo: player.photo || '',
      is_captain: player.is_captain,
      is_active: player.is_active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (playerId: string) => {
    if (confirm('¿Eliminar este jugador?')) {
      deleteMutation.mutate(playerId);
    }
  };

  const handleChange = (field: keyof CreatePlayerData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // CORREGIDO: Extraer players del objeto paginado correctamente
  const players: Player[] = playersData?.results || [];
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              to={`/sports/tournaments/${tournamentSlug}`}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Volver
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Inscribir Plantilla</h1>
              <p className="text-sm text-gray-500">{tournament?.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulario */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                {editingPlayer ? (
                  <><Edit3 className="w-5 h-5 mr-2 text-blue-600" />Editar Jugador</>
                ) : (
                  <><UserPlus className="w-5 h-5 mr-2 text-green-600" />Agregar Jugador</>
                )}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Foto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Foto</label>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                  
                  {(formData.photo || previewPhoto) && (
                    <div className="mb-3 relative inline-block">
                      <img src={previewPhoto || formData.photo} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                      <button type="button" onClick={() => { setFormData(p => ({ ...p, photo: '' })); setPreviewPhoto(null); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}
                    className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                    {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Camera className="w-4 h-4 mr-1" />}
                    {uploadingPhoto ? 'Subiendo...' : 'Subir foto'}
                  </button>
                  
                  <input type="url" value={formData.photo} onChange={(e) => handleChange('photo', e.target.value)}
                    className="mt-2 w-full rounded-lg border-gray-300 text-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="O pegar URL de foto" />
                  {errors.photo && <p className="mt-1 text-xs text-red-600">{errors.photo}</p>}
                </div>

                {/* Nombre y Apellido */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <input type="text" value={formData.first_name} onChange={(e) => handleChange('first_name', e.target.value)}
                      className={`w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500 ${errors.first_name ? 'border-red-500' : ''}`}
                      placeholder="Juan" />
                    {errors.first_name && <p className="mt-1 text-xs text-red-600">{errors.first_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                    <input type="text" value={formData.last_name} onChange={(e) => handleChange('last_name', e.target.value)}
                      className={`w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500 ${errors.last_name ? 'border-red-500' : ''}`}
                      placeholder="Pérez" />
                    {errors.last_name && <p className="mt-1 text-xs text-red-600">{errors.last_name}</p>}
                  </div>
                </div>

                {/* Apodo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apodo</label>
                  <input type="text" value={formData.nickname} onChange={(e) => handleChange('nickname', e.target.value)}
                    className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500" placeholder="El Rápido" />
                </div>

                {/* Número y Posición */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <Shirt className="w-4 h-4 mr-1" />Número *
                    </label>
                    <input type="number" min={0} max={99} value={formData.jersey_number}
                      onChange={(e) => handleChange('jersey_number', parseInt(e.target.value) || 0)}
                      className={`w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500 ${errors.jersey_number ? 'border-red-500' : ''}`} />
                    {errors.jersey_number && <p className="mt-1 text-xs text-red-600">{errors.jersey_number}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Posición *</label>
                    <select value={formData.position} onChange={(e) => handleChange('position', e.target.value)}
                      className={`w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500 ${errors.position ? 'border-red-500' : ''}`}>
                      <option value="">Seleccionar...</option>
                      {positions.map(pos => <option key={pos.value} value={pos.value}>{pos.label}</option>)}
                    </select>
                    {errors.position && <p className="mt-1 text-xs text-red-600">{errors.position}</p>}
                  </div>
                </div>

                {/* Nacionalidad y Fecha */}
                <div className="grid grid-cols-2 gap-3">
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidad</label>
                    <input type="text" value={formData.nationality} onChange={(e) => handleChange('nationality', e.target.value)}
                      className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500" placeholder="Venezolana" />
                  </div> */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha nac.</label>
                    <input type="date" value={formData.birth_date} onChange={(e) => handleChange('birth_date', e.target.value)}
                      className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500" />
                  </div>
                </div>

                {/* Capitán y Activo */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.is_captain} onChange={(e) => handleChange('is_captain', e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span className="ml-2 text-sm text-gray-700 flex items-center">
                      <Crown className="w-4 h-4 mr-1 text-yellow-500" />Capitán
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.is_active} onChange={(e) => handleChange('is_active', e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span className="ml-2 text-sm text-gray-700">Activo</span>
                  </label>
                </div>

                {/* Botones */}
                <div className="flex gap-2 pt-2">
                  {editingPlayer ? (
                    <>
                      <button type="submit" disabled={isSubmitting}
                        className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Guardar
                      </button>
                      <button type="button" onClick={resetForm}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">Cancelar</button>
                    </>
                  ) : (
                    <button type="submit" disabled={isSubmitting}
                      className="w-full inline-flex justify-center items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium text-sm">
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                      Agregar jugador
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Tabla */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-600" />
                  Jugadores inscritos
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">{players.length}</span>
                </h2>
              </div>

              {loadingPlayers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
              ) : players.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay jugadores inscritos aún</p>
                  <p className="text-sm text-gray-400 mt-1">Usa el formulario para agregar el primero</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Foto</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Jugador</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">#</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Posición</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {players.map((player) => (
                        <tr key={player.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            {player.photo ? (
                              <img src={player.photo} alt="" className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                                {player.full_name?.[0]}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900 text-sm">
                                {player.full_name}
                                {player.is_captain && <Crown className="inline w-3.5 h-3.5 ml-1 text-yellow-500" />}
                            </p>
                            {player.nickname && <p className="text-xs text-gray-500">"{player.nickname}"</p>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-sm">
                              {player.jersey_number}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{player.position_display || player.position}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => handleEdit(player)}
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Editar">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(player.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Stats */}
            {players.length > 0 && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{players.length}</p>
                  <p className="text-xs text-gray-500 uppercase">Jugadores</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{players.filter(p => p.is_active).length}</p>
                  <p className="text-xs text-gray-500 uppercase">Activos</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{players.filter(p => p.is_captain).length}</p>
                  <p className="text-xs text-gray-500 uppercase">Capitanes</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{players.reduce((sum, p) => sum + (p.goals || 0), 0)}</p>
                  <p className="text-xs text-gray-500 uppercase">Goles</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamRosterPage;