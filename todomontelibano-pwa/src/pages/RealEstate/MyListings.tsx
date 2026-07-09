import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { House, Plus, Eye, Edit, Trash2, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useMyListings, useDeleteListing, useRenewListing } from '../../hooks/useRealEstate';
import { getMediaUrl } from '../../lib/api';
import type { RealEstateOffer } from '../../types';

const CATEGORY_LABELS: Record<string, string> = { sale: 'Venta', rent: 'Alquiler' };

const MyListings: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isManager = user?.role === 'manager' || user?.role === 'admin';

  const { data, isLoading, error } = useMyListings({ enabled: isManager });
  const deleteMutation = useDeleteListing();
  const renewMutation = useRenewListing();

  const listings = data?.results ?? [];

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta publicación?')) {
      deleteMutation.mutate(id);
    }
  };

  if (!isManager) {
    return (
      <div className="page-container page-section">
        <div className="card-static text-center py-12 max-w-lg mx-auto">
          <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-bold mb-2">Acceso restringido</h2>
          <p className="text-gray-500 mb-4">Esta sección es solo para cuentas de empresa.</p>
          <Link to="/dashboard" className="text-rose-600 font-medium">Volver al dashboard →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mis propiedades</h1>
            <p className="text-gray-500 mt-1">{data?.count ?? 0} publicaciones</p>
          </div>
          <Link to="/real-estate/create" className="mt-4 sm:mt-0 btn-primary inline-flex items-center">
            <Plus className="w-5 h-5 mr-2" /> Publicar propiedad
          </Link>
        </div>

        {isLoading && (
          <div className="card animate-pulse h-32 rounded-3xl" />
        )}

        {error && (
          <div className="card bg-red-50 text-red-700">Error al cargar las propiedades.</div>
        )}

        {!isLoading && listings.length === 0 && (
          <div className="card-static text-center py-12">
            <House className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold mb-2">No tienes propiedades publicadas</h2>
            <Link to="/real-estate/create" className="btn-primary inline-flex items-center mt-4">
              <Plus className="w-5 h-5 mr-2" /> Publicar mi primera propiedad
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {listings.map((listing: RealEstateOffer) => (
            <div key={listing.id} className="card hover:shadow-2xl transition-shadow">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-40 h-28 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                  {listing.image ? (
                    <img src={getMediaUrl(listing.image)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <House className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg truncate">{listing.title}</h3>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-rose-100 text-rose-700">
                      {CATEGORY_LABELS[listing.category]}
                    </span>
                    {listing.is_expired && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">Expirada</span>
                    )}
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    ${Number(listing.price).toLocaleString()} {listing.currency}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" /> {listing.location}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{listing.views_count} vistas</p>
                </div>
                <div className="flex md:flex-col gap-2 shrink-0">
                  <button onClick={() => navigate(`/real-estate/${listing.id}`)} className="btn-secondary text-sm py-2 px-3 flex items-center">
                    <Eye className="w-4 h-4 mr-1" /> Ver
                  </button>
                  <button onClick={() => navigate(`/real-estate/edit/${listing.id}`)} className="btn-secondary text-sm py-2 px-3 flex items-center">
                    <Edit className="w-4 h-4 mr-1" /> Editar
                  </button>
                  {(listing.is_expired || (listing.days_remaining !== undefined && listing.days_remaining <= 5)) && (
                    <button onClick={() => renewMutation.mutate(listing.id)} className="btn-primary text-sm py-2 px-3 flex items-center">
                      <RefreshCw className="w-4 h-4 mr-1" /> Renovar
                    </button>
                  )}
                  <button onClick={() => handleDelete(listing.id)} className="text-sm py-2 px-3 text-red-600 hover:bg-red-50 rounded-3xl flex items-center">
                    <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyListings;
