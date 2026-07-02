import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, House, Clock, Filter, ChevronDown, Plus, Sparkles, Key, Building,
} from 'lucide-react';
import { useListings } from '../../hooks/useRealEstate';
import { useAuthStore } from '../../store/authStore';
import { getMediaUrl } from '../../lib/api';
import type { RealEstateOffer } from '../../types';

const CATEGORY_LABELS: Record<string, string> = {
  sale: 'Venta',
  rent: 'Alquiler',
};

const PROPERTY_LABELS: Record<string, string> = {
  house: 'Casa',
  apartment: 'Apartamento',
  lot: 'Lote/Terreno',
  commercial: 'Local Comercial',
  farm: 'Finca',
};

const ListingsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { user, isAuthenticated } = useAuthStore();
  const { data, isLoading } = useListings({
    search: searchTerm || undefined,
    category: category || undefined,
    property_type: propertyType || undefined,
  });

  const listings = data?.results ?? [];

  const formatPrice = (listing: RealEstateOffer) =>
    `$${Number(listing.price).toLocaleString('es-CO')} ${listing.currency}`;

  const formatDate = (dateString: string) => {
    const diffDays = Math.ceil(
      Math.abs(new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 1) return 'Publicado hoy';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return new Date(dateString).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950/50 pb-16">
      <div className="bg-gradient-to-r from-orange-500/90 via-rose-500/90 to-rose-600 text-white shadow-md">
        <div className="page-container py-10 sm:py-14">
          <div className="md:flex md:items-center md:justify-between gap-6">
            <div>
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-white/20 rounded-full backdrop-blur-md">
                Inmobiliaria
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight">
                Bienes Raíces
              </h1>
              <p className="mt-2 text-orange-100 text-base sm:text-lg max-w-2xl font-light">
                Encuentra casas, apartamentos, locales y terrenos en venta y alquiler.
              </p>
            </div>
            {isAuthenticated && user?.user_type === 'company' && (
              <Link
                to="/real-estate/create"
                className="mt-6 md:mt-0 inline-flex items-center px-5 py-3 bg-white text-rose-600 font-bold rounded-3xl shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02]"
              >
                <Plus className="w-5 h-5 mr-2" />
                Publicar propiedad
              </Link>
            )}
          </div>

          <div className="mt-10 search-bar">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-300" />
                <input
                  type="text"
                  placeholder="Buscar por título, ubicación o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-12"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary py-3.5 px-6 text-sm"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="">Todas las operaciones</option>
                  <option value="sale">Venta</option>
                  <option value="rent">Alquiler</option>
                </select>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="input-field"
                >
                  <option value="">Todos los tipos</option>
                  {Object.entries(PROPERTY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="page-container mt-10">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse h-48 rounded-3xl" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 card-static max-w-xl mx-auto">
            <House className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold">No hay propiedades disponibles</h3>
            <p className="text-gray-500 mt-2">Intenta ajustar los filtros o vuelve más tarde.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                to={`/real-estate/${listing.id}`}
                className="group card-static overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all !p-0"
              >
                <div className="aspect-[16/10] bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                  {listing.image ? (
                    <img
                      src={getMediaUrl(listing.image)}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  {listing.is_featured && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold bg-amber-400 text-amber-900 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Destacado
                    </span>
                  )}
                  <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-bold bg-white/90 dark:bg-gray-900/90 rounded-full">
                    {CATEGORY_LABELS[listing.category]}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                      {PROPERTY_LABELS[listing.property_type]}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-rose-600 transition-colors line-clamp-1">
                    {listing.title}
                  </h3>
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-2">
                    {formatPrice(listing)}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-rose-400" />
                      {listing.location || 'Sin ubicación'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <span className="flex items-center text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {formatDate(listing.posted_at)}
                    </span>
                    <span className="text-rose-600 font-bold text-sm">Ver detalles →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingsList;
