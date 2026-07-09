import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, House, MapPin, DollarSign, FileText, ImagePlus } from 'lucide-react';
import { useCreateListing } from '../../hooks/useRealEstate';
import { useAuthStore } from '../../store/authStore';
import InsufficientCreditsAlert from '../../components/Credits/InsufficientCreditsAlert';
import { CREDIT_COSTS, ROUTES_CREDITS } from '../../config/credits';

const CreateListing: React.FC = () => {
  const navigate = useNavigate();
  const createListing = useCreateListing();
  const { user } = useAuthStore();
  const userCredits = user?.credits ?? 0;
  const hasEnoughCredits = userCredits >= CREDIT_COSTS.realEstate;

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'COP',
    location: '',
    category: 'sale' as 'sale' | 'rent',
    property_type: 'apartment' as 'house' | 'apartment' | 'lot' | 'commercial' | 'farm',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
  });
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasEnoughCredits) {
      navigate(ROUTES_CREDITS.packages);
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append('image', image);

    createListing.mutate(fd, {
      onSuccess: (data) => navigate(`/real-estate/${data.id}`),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <div className="bg-white dark:bg-gray-900 border-b">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button onClick={() => navigate(-1)} className="inline-flex items-center text-gray-500 mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" /> Volver
          </button>
          <h1 className="text-2xl font-bold">Publicar propiedad</h1>
          <p className="text-gray-500 mt-1">Publica tu inmueble en el portal de CordobaTech</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <InsufficientCreditsAlert
          required={CREDIT_COSTS.realEstate}
          available={userCredits}
          actionLabel="publicación de propiedad"
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <House className="w-5 h-5 text-rose-600" />
              <h2 className="font-bold">Información básica</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título *</label>
                <input required className="input-field" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej: Apartamento en el centro" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Operación *</label>
                  <select required className="input-field" value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as 'sale' | 'rent' })}>
                    <option value="sale">Venta</option>
                    <option value="rent">Alquiler</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de propiedad *</label>
                  <select required className="input-field" value={form.property_type}
                    onChange={(e) => setForm({ ...form, property_type: e.target.value as typeof form.property_type })}>
                    <option value="house">Casa</option>
                    <option value="apartment">Apartamento</option>
                    <option value="lot">Lote/Terreno</option>
                    <option value="commercial">Local Comercial</option>
                    <option value="farm">Finca</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ubicación *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input required className="input-field pl-10" value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Ciudad, barrio o dirección" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h2 className="font-bold">Precio</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Precio *</label>
                <input required type="number" min="1" className="input-field" value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Moneda</label>
                <select className="input-field" value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                  <option value="COP">COP</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-5 h-5 text-violet-600" />
              <h2 className="font-bold">Descripción</h2>
            </div>
            <textarea required rows={5} className="input-field" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe la propiedad, amenidades, estado, etc." />
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <ImagePlus className="w-5 h-5 text-orange-600" />
              <h2 className="font-bold">Imagen principal</h2>
            </div>
            <input type="file" accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="input-field" />
            {image && <p className="text-sm text-gray-500 mt-2">{image.name}</p>}
          </div>

          <div className="card">
            <h2 className="font-bold mb-4">Datos de contacto</h2>
            <div className="space-y-4">
              <input className="input-field" placeholder="Nombre de contacto" value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
              <input className="input-field" placeholder="Teléfono" value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
              <input type="email" className="input-field" placeholder="Email" value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
            </div>
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 btn-secondary py-3">Cancelar</button>
            <button type="submit" disabled={createListing.isPending || !hasEnoughCredits}
              className="flex-1 btn-primary py-3 disabled:opacity-50">
              {createListing.isPending ? 'Publicando...' : hasEnoughCredits ? 'Publicar (5 🪙)' : 'Créditos insuficientes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;
