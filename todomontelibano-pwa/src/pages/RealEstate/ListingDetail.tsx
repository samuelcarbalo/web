import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, ChevronLeft, Share2, DollarSign, Calendar, Phone, Mail, User, Key, RefreshCw, Trash2,
} from 'lucide-react';
import { useListing, useDeleteListing, useRenewListing } from '../../hooks/useRealEstate';
import { useAuthStore } from '../../store/authStore';
import { usePermissions } from '../../hooks/usePermissions';
import { getMediaUrl } from '../../lib/api';
import ContactOwnerButton from '../../components/RealEstate/ContactOwnerButton';
import ReportPublicationButton from '../../components/Moderation/ReportPublicationButton';
import AdVisibilityUpsell from '../../components/Advertising/AdVisibilityUpsell';
import ClassifiedAdSlot from '../../components/Advertising/ClassifiedAdSlot';

const CATEGORY_LABELS: Record<string, string> = { sale: 'En venta', rent: 'En alquiler' };
const PROPERTY_LABELS: Record<string, string> = {
  house: 'Casa', apartment: 'Apartamento', lot: 'Lote/Terreno',
  commercial: 'Local Comercial', farm: 'Finca',
};

const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const listingId = id || '';
  const { isAuthenticated } = useAuthStore();
  const { isOwner: checkIsOwner } = usePermissions();

  const { data: listing, isLoading } = useListing(listingId);
  const deleteMutation = useDeleteListing();
  const renewMutation = useRenewListing();

  const isOwner = checkIsOwner(listing);

  React.useEffect(() => {
    if (listing) {
      document.title = `${listing.title} | Bienes Raíces | CordobaTech`;
    }
  }, [listing]);

  const handleDelete = () => {
    if (confirm('¿Eliminar esta publicación?')) {
      deleteMutation.mutate(listingId, { onSuccess: () => navigate('/real-estate/my_listings') });
    }
  };

  const handleRenew = () => {
    renewMutation.mutate(listingId, {
      onSuccess: () => alert('Publicación renovada por 30 días.'),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold">Propiedad no encontrada</h2>
          <Link to="/real-estate" className="text-rose-600 mt-2 inline-block">← Volver</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950/50 pb-20">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link to="/real-estate" className="inline-flex items-center text-gray-500 hover:text-rose-600 text-sm font-semibold mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" /> Volver a propiedades
          </Link>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-2.5 py-1 text-xs font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-full">
                  {CATEGORY_LABELS[listing.category]}
                </span>
                <span className="px-2.5 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-800 rounded-full">
                  {PROPERTY_LABELS[listing.property_type]}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                {listing.title}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-gray-500">
                <MapPin className="w-4 h-4 text-rose-400" />
                {listing.location || 'Ubicación no especificada'}
              </div>
            </div>
            <div className="flex items-center gap-2 self-start">
              <ReportPublicationButton contentType="real_estate" objectId={String(listing.id)} />
              <button className="p-2.5 border rounded-3xl hover:bg-gray-50 dark:hover:bg-gray-800">
              <Share2 className="w-5 h-5 text-gray-500" />
            </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <ClassifiedAdSlot
          position="listing_detail"
          objectId={listingId}
          variant="horizontal"
          className="mb-6"
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800">
              {listing.image ? (
                <img src={getMediaUrl(listing.image)} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Sin imagen</div>
              )}
            </div>

            <div className="card-static">
              <h2 className="text-lg font-bold mb-4">Descripción</h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                {listing.description}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-static bg-gradient-to-br from-orange-50/60 to-rose-50/60 dark:from-rose-950/20 dark:to-orange-950/20 border-rose-100 dark:border-rose-900/50">
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                ${Number(listing.price).toLocaleString('es-CO')}
                <span className="text-base font-medium text-gray-500 ml-1">{listing.currency}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <Key className="w-4 h-4" /> {CATEGORY_LABELS[listing.category]}
              </p>

              {isAuthenticated ? (
                isOwner ? (
                  <div className="space-y-2 mt-4">
                    <AdVisibilityUpsell
                      contentType="real_estate"
                      objectId={String(listing.id)}
                      isOwner={isOwner}
                      defaultTitle={listing.title}
                      defaultImage={listing.image ? getMediaUrl(listing.image) : ''}
                      defaultLinkUrl={window.location.href}
                    />
                    <Link to={`/real-estate/edit/${listing.id}`} className="w-full btn-secondary block text-center py-2.5 text-sm font-bold">
                      Editar publicación
                    </Link>
                    {(listing.is_expired || (listing.days_remaining !== undefined && listing.days_remaining <= 5)) && (
                      <button onClick={handleRenew} disabled={renewMutation.isPending} className="w-full btn-primary py-2.5 text-sm">
                        <RefreshCw className="w-4 h-4 mr-1 inline" />
                        {renewMutation.isPending ? 'Renovando...' : 'Renovar 30 días'}
                      </button>
                    )}
                    <button onClick={handleDelete} className="w-full py-2.5 border border-rose-200 text-rose-600 rounded-3xl text-sm font-bold hover:bg-rose-50">
                      <Trash2 className="w-4 h-4 mr-1 inline" /> Eliminar
                    </button>
                  </div>
                ) : (
                  <div className="mt-4">
                    <ContactOwnerButton
                      offerId={listing.id}
                      ownerName={listing.contact_name || listing.posted_by_name}
                    />
                  </div>
                )
              ) : (
                <Link to="/login" className="w-full btn-primary block text-center mt-4 py-3 text-sm font-bold">
                  Inicia sesión para contactar
                </Link>
              )}
            </div>

            <div className="card-static">
              <h3 className="font-bold mb-4">Detalles</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 flex items-center"><DollarSign className="w-4 h-4 mr-1" /> Precio</span>
                  <span className="font-bold">${Number(listing.price).toLocaleString()} {listing.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 flex items-center"><MapPin className="w-4 h-4 mr-1" /> Ubicación</span>
                  <span className="font-bold">{listing.location || '—'}</span>
                </div>
                {listing.expires_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center"><Calendar className="w-4 h-4 mr-1" /> Vigencia</span>
                    <span className="font-bold">
                      {listing.days_remaining !== undefined ? `${listing.days_remaining} días` : new Date(listing.expires_at).toLocaleDateString('es-CO')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {(listing.contact_name || listing.contact_phone || listing.contact_email) && (
              <div className="card-static">
                <h3 className="font-bold mb-4">Contacto</h3>
                <div className="space-y-2 text-sm">
                  {listing.contact_name && (
                    <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <User className="w-4 h-4" /> {listing.contact_name}
                    </p>
                  )}
                  {listing.contact_phone && (
                    <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4" /> {listing.contact_phone}
                    </p>
                  )}
                  {listing.contact_email && (
                    <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" /> {listing.contact_email}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
