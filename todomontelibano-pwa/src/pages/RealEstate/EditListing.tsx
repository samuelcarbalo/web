import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, House, MapPin, DollarSign, FileText, ImagePlus } from 'lucide-react';
import { useListing, useUpdateListing } from '../../hooks/useRealEstate';
import { usePermissions } from '../../hooks/usePermissions';
import { getMediaUrl } from '../../lib/api';

const EditListing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const listingId = id || '';
  const { isOwner: checkIsOwner } = usePermissions();
  const { data: listing, isLoading } = useListing(listingId);
  const updateListing = useUpdateListing();

  const [form, setForm] = useState({
    title: '', description: '', price: '', currency: 'COP', location: '',
    category: 'sale' as 'sale' | 'rent',
    property_type: 'apartment' as 'house' | 'apartment' | 'lot' | 'commercial' | 'farm',
    contact_name: '', contact_phone: '', contact_email: '',
  });
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    if (listing) {
      if (!checkIsOwner(listing)) {
        navigate(`/real-estate/${listingId}`);
        return;
      }
      setForm({
        title: listing.title,
        description: listing.description,
        price: String(listing.price),
        currency: listing.currency,
        location: listing.location,
        category: listing.category,
        property_type: listing.property_type,
        contact_name: listing.contact_name || '',
        contact_phone: listing.contact_phone || '',
        contact_email: listing.contact_email || '',
      });
    }
  }, [listing, checkIsOwner, listingId, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append('image', image);

    updateListing.mutate(
      { id: listingId, data: image ? fd : { ...form, price: Number(form.price) } },
      { onSuccess: () => navigate(`/real-estate/${listingId}`) }
    );
  };

  if (isLoading || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <div className="bg-white dark:bg-gray-900 border-b">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button onClick={() => navigate(-1)} className="inline-flex items-center text-gray-500 mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" /> Volver
          </button>
          <h1 className="text-2xl font-bold">Editar propiedad</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <House className="w-5 h-5 text-rose-600" />
              <h2 className="font-bold">Información básica</h2>
            </div>
            <div className="space-y-4">
              <input required className="input-field" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <select className="input-field" value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as 'sale' | 'rent' })}>
                  <option value="sale">Venta</option>
                  <option value="rent">Alquiler</option>
                </select>
                <select className="input-field" value={form.property_type}
                  onChange={(e) => setForm({ ...form, property_type: e.target.value as typeof form.property_type })}>
                  <option value="house">Casa</option>
                  <option value="apartment">Apartamento</option>
                  <option value="lot">Lote</option>
                  <option value="commercial">Local</option>
                  <option value="farm">Finca</option>
                </select>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input required className="input-field pl-10" value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h2 className="font-bold">Precio</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input required type="number" min="1" className="input-field" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <select className="input-field" value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                <option value="COP">COP</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div className="card">
            <FileText className="w-5 h-5 text-violet-600 mb-4" />
            <textarea required rows={5} className="input-field" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="card">
            <h2 className="font-bold mb-4 flex items-center gap-2"><ImagePlus className="w-5 h-5" /> Imagen</h2>
            {listing.image && !image && (
              <img src={getMediaUrl(listing.image)} alt="" className="w-full max-h-48 object-cover rounded-2xl mb-4" />
            )}
            <input type="file" accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setImage(e.target.files?.[0] || null)} className="input-field" />
          </div>

          <div className="card space-y-4">
            <input className="input-field" placeholder="Contacto" value={form.contact_name}
              onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
            <input className="input-field" placeholder="Teléfono" value={form.contact_phone}
              onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
            <input className="input-field" placeholder="Email" value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 btn-secondary py-3">Cancelar</button>
            <button type="submit" disabled={updateListing.isPending} className="flex-1 btn-primary py-3 disabled:opacity-50">
              {updateListing.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListing;
