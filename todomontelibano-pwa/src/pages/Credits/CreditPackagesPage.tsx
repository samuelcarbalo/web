import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Coins, Target, History } from 'lucide-react';
import CreditPackageCard from '../../components/Credits/CreditPackageCard';
import MercadoPagoCheckout from '../../components/Credits/MercadoPagoCheckout';
import CreditBalanceBadge from '../../components/Credits/CreditBalanceBadge';
import BuyCreditsButton from '../../components/Credits/BuyCreditsButton';
import { FALLBACK_PACKAGES } from '../../config/credits';
import { useAuthStore } from '../../store/authStore';
import {
  useCreatePreference,
  useCreditPackages,
  useMyPaymentOrders,
} from '../../hooks/usePayments';
import {
  buildCreditsIntentPath,
  buildLoginUrl,
} from '../../lib/authRedirect';

const statusLabel: Record<string, string> = {
  approved: 'Aprobado',
  pending: 'Pendiente',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

const CreditPackagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { data: packages, isError, isFetching } = useCreditPackages();
  const createPreference = useCreatePreference();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'historial' ? 'historial' : 'comprar';
  const packageIntent = searchParams.get('package');
  const { data: orders = [], isLoading: ordersLoading } = useMyPaymentOrders(
    isAuthenticated && tab === 'historial',
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [initPoint, setInitPoint] = useState<string | null>(null);
  const checkoutRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const resumedPackageRef = useRef<string | null>(null);

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

  useEffect(() => {
    if (tab === 'historial') {
      if (!isAuthenticated) {
        navigate(buildLoginUrl('/creditos?tab=historial'), { replace: true });
        return;
      }
      requestAnimationFrame(() => {
        historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [tab, isAuthenticated, navigate]);

  const startCheckout = async (packageId: string) => {
    setSelectedId(packageId);
    setPreferenceId(null);
    setInitPoint(null);
    try {
      const result = await createPreference.mutateAsync(packageId);
      setPreferenceId(result.preference_id);
      setInitPoint(result.init_point || result.sandbox_init_point || null);
      requestAnimationFrame(() => {
        checkoutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    } catch {
      setSelectedId(null);
    }
  };

  const handleSelect = (packageId: string) => {
    if (!isAuthenticated) {
      navigate(buildLoginUrl(buildCreditsIntentPath(packageId)));
      return;
    }
    void startCheckout(packageId);
  };

  // Tras login/registro, reanudar el paquete elegido
  useEffect(() => {
    if (!isAuthenticated || !packageIntent) return;
    if (resumedPackageRef.current === packageIntent) return;
    const exists = displayPackages.some((p) => p.id === packageIntent);
    if (!exists) return;
    resumedPackageRef.current = packageIntent;
    void startCheckout(packageIntent);
    const params = new URLSearchParams(searchParams);
    params.delete('package');
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only resume once per package intent
  }, [isAuthenticated, packageIntent, displayPackages]);

  const setTab = (next: 'comprar' | 'historial') => {
    if (next === 'historial' && !isAuthenticated) {
      navigate(buildLoginUrl('/creditos?tab=historial'));
      return;
    }
    const params = new URLSearchParams(searchParams);
    if (next === 'historial') params.set('tab', 'historial');
    else params.delete('tab');
    setSearchParams(params, { replace: true });
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
                Planes de créditos CAPISJ DIGITAL
              </h1>
              <p className="mt-3 text-violet-100 max-w-xl text-lg">
                Publica empleos, propiedades y torneos con nuestra moneda interna.
                Cada crédito equivale a <strong>$1.000 COP</strong>.
                {!isAuthenticated && (
                  <span className="block mt-2 text-violet-100/90 text-base">
                    Explora los planes libremente. Para comprar, inicia sesión o crea tu cuenta.
                  </span>
                )}
              </p>
            </div>
            {isAuthenticated ? (
              <div className="flex flex-col sm:items-end gap-3 self-start">
                <CreditBalanceBadge className="bg-white/10 border-white/20 text-white hover:bg-white/20" />
                <BuyCreditsButton
                  compact
                  label="Obtener más créditos"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-900 bg-white hover:bg-violet-50 px-4 py-2 rounded-3xl transition-colors"
                />
              </div>
            ) : (
              <BuyCreditsButton
                label="Ver planes"
                className="self-start inline-flex items-center gap-1.5 text-sm font-bold text-indigo-900 bg-white hover:bg-violet-50 px-4 py-2 rounded-3xl transition-colors"
              />
            )}
          </div>

          <div className="mt-8 inline-flex rounded-2xl bg-white/10 p-1">
            <button
              type="button"
              onClick={() => setTab('comprar')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                tab === 'comprar' ? 'bg-white text-indigo-800' : 'text-white/85 hover:bg-white/10'
              }`}
            >
              Planes
            </button>
            <button
              type="button"
              onClick={() => setTab('historial')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors inline-flex items-center gap-1.5 ${
                tab === 'historial' ? 'bg-white text-indigo-800' : 'text-white/85 hover:bg-white/10'
              }`}
            >
              <History className="w-4 h-4" />
              Historial
            </button>
          </div>
        </div>
      </div>

      <div className="page-container -mt-8 relative z-10">
        {tab === 'historial' && isAuthenticated ? (
          <div ref={historyRef} className="card-static">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Historial de compras
            </h2>
            {ordersLoading ? (
              <p className="text-sm text-gray-500">Cargando…</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Aún no tienes compras de créditos.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.map((order) => (
                  <li
                    key={order.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                        {order.package_id} · +{order.credits_amount} créditos
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleString('es-CO')}
                      </p>
                    </div>
                    <div className="text-sm text-right">
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          maximumFractionDigits: 0,
                        }).format(Number(order.amount_cop))}
                      </p>
                      <p className="text-xs text-gray-500">
                        {statusLabel[order.status] || order.status}
                        {order.credits_applied ? ' · acreditado' : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <>
            {isAuthenticated && missing > 0 && (
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

            {isAuthenticated ? (
              <div ref={checkoutRef} className="mt-10 card-static max-w-lg mx-auto">
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
                  initPoint={initPoint}
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
            ) : (
              <div className="mt-10 card-static max-w-lg mx-auto text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Elige un plan para continuar. Te pediremos iniciar sesión o registrarte antes de
                  pagar con Mercado Pago.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CreditPackagesPage;
