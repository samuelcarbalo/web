import React, { useMemo, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Shield, Coins, Target } from 'lucide-react';
import CreditPackageCard from '../../components/Credits/CreditPackageCard';
import MercadoPagoCheckout from '../../components/Credits/MercadoPagoCheckout';
import CreditBalanceBadge from '../../components/Credits/CreditBalanceBadge';
import { FALLBACK_PACKAGES } from '../../config/credits';
import { useAuthStore } from '../../store/authStore';
import { useCreatePreference, useCreditPackages } from '../../hooks/usePayments';

const CreditPackagesPage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { data: packages, isError, isFetching } = useCreditPackages();
  const createPreference = useCreatePreference();
  const [searchParams] = useSearchParams();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  const displayPackages = packages ?? FALLBACK_PACKAGES;

  const neededParam = parseInt(searchParams.get('needed') || '', 10);
  const needed = Number.isFinite(neededParam) && neededParam > 0 ? neededParam : 0;
  const reason = searchParams.get('reason') || '';
  const currentCredits = user?.credits ?? 0;
  const missing = Math.max(0, needed - currentCredits);

  /** Paquete más pequeño que cubre el faltante (para resaltarlo). */
  const recommendedId = useMemo(() => {
    if (!missing) return null;
    const covering = [...displayPackages]
      .filter((p) => p.credits >= missing)
      .sort((a, b) => a.credits - b.credits);
    return covering[0]?.id ?? null;
  }, [displayPackages, missing]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSelect = async (packageId: string) => {
    setSelectedId(packageId);
    setPreferenceId(null);
    try {
      const result = await createPreference.mutateAsync(packageId);
      setPreferenceId(result.preference_id);
    } catch {
      setSelectedId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-800 text-white">
        <div className="page-container py-14 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-sm font-bold mb-4">
                <Coins className="w-4 h-4" />
                Cartera interna
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Compra créditos CordobaTech
              </h1>
              <p className="mt-3 text-violet-100 max-w-xl text-lg">
                Publica empleos, propiedades y torneos con nuestra moneda interna.
                Cada crédito equivale a <strong>$1.000 COP</strong>.
              </p>
            </div>
            <CreditBalanceBadge className="self-start bg-white/10 border-white/20 text-white hover:bg-white/20" />
          </div>
        </div>
      </div>

      <div className="page-container -mt-8 relative z-10">
        {missing > 0 && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border-2 border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/40 px-5 py-4">
            <Target className="w-6 h-6 text-violet-600 dark:text-violet-300 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-bold text-violet-900 dark:text-violet-100">
                Necesitas {needed} créditos{reason ? ` para ${reason}` : ''}
              </p>
              <p className="text-sm text-violet-800 dark:text-violet-200 mt-0.5">
                Saldo actual: <strong>{currentCredits}</strong> · Te faltan{' '}
                <strong>{missing}</strong> créditos.
                {recommendedId && ' Resaltamos el paquete recomendado que los cubre.'}
              </p>
            </div>
          </div>
        )}

        {isError && !isFetching && (
          <p className="mb-4 text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl px-4 py-3">
            No pudimos cargar los precios desde el servidor. Mostramos el catálogo local.
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayPackages.map((pkg) => (
            <CreditPackageCard
              key={pkg.id}
              pkg={pkg}
              isSelected={selectedId === pkg.id}
              isPopular={recommendedId ? recommendedId === pkg.id : pkg.id === 'oro'}
              onSelect={() => handleSelect(pkg.id)}
              isProcessing={createPreference.isPending && selectedId === pkg.id}
            />
          ))}
        </div>

        {/* Checkout Mercado Pago — logo MP en primera posición (Wallet SDK) */}
        <div className="mt-10 card-static max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="https://http2.mlstatic.com/frontend-assets/ui-navigation/5.19.1/mercadopago/logo__large.png"
              alt="Mercado Pago"
              className="h-8 object-contain"
              width={120}
              height={32}
            />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Pago seguro con Checkout Pro
            </span>
          </div>

          {createPreference.isError && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              No se pudo iniciar el pago. Verifica las credenciales de Mercado Pago en el servidor.
            </p>
          )}

          <MercadoPagoCheckout
            preferenceId={preferenceId}
            isLoading={createPreference.isPending}
          />

          <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Los pagos son procesados por Mercado Pago. Al aprobarse, los créditos se acreditan
              automáticamente en tu cuenta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditPackagesPage;
