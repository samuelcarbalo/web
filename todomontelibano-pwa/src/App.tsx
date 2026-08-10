import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layout
import MainLayout from './components/Layout/MainLayout';
import ScrollToTop from './components/UI/ScrollToTop';
// Pages (Core estáticas)
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import NotFoundPage from './pages/NotFoundPage';
import { lazyWithRetry } from './lib/lazyWithRetry';

// Pages (Carga Perezosa / Lazy Loading)
const JobsList = lazyWithRetry(() => import('./pages/Jobs/JobsList'));
const JobDetail = lazyWithRetry(() => import('./pages/Jobs/JobDetail'));
const CreateJob = lazyWithRetry(() => import('./pages/Jobs/CreateJob'));
const EditJob = lazyWithRetry(() => import('./pages/Jobs/EditJob'));
const Profile = lazyWithRetry(() => import('./pages/Profile'));
const MyApplications = lazyWithRetry(() => import('./pages/Applications/MyApplications'));
const ReceivedApplications = lazyWithRetry(() => import('./pages/Applications/ReceivedApplications'));
const MyOffers = lazyWithRetry(() => import('./pages/Jobs/MyOffers'));
const TournamentsList = lazyWithRetry(() => import('./pages/Sports/TournamentsList'));
const TournamentDetail = lazyWithRetry(() => import('./pages/Sports/TournamentDetail'));
const CreateTournament = lazyWithRetry(() => import('./pages/Sports/CreateTournament'));
const EditTournament = lazyWithRetry(() => import('./pages/Sports/EditTournament'));
const TeamRosterPage = lazyWithRetry(() => import('./pages/Sports/TeamRosterPage'));
const TeamDetailPage = lazyWithRetry(() => import('./pages/Sports/TeamDetailPage'));
const PlayerProfilePage = lazyWithRetry(() => import('./pages/Sports/PlayerProfilePage'));
const TournamentSchedulePage = lazyWithRetry(() => import('./pages/Sports/TournamentSchedulePage'));
const MatchDetailPage = lazyWithRetry(() => import('./pages/Sports/MatchDetailPage'));
const TournamentStandingsPage = lazyWithRetry(() => import('./pages/Sports/TournamentStandingsPage'));
const TournamentStructurePage = lazyWithRetry(() => import('./pages/Sports/TournamentStructurePage'));
const PlayerStatsPage = lazyWithRetry(() => import('./pages/Sports/PlayerStatsPage'));
const TournamentPlayerStatsPage = lazyWithRetry(() => import('./pages/Sports/TournamentPlayerStatsPage'));
const PrivacyPolicy = lazyWithRetry(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazyWithRetry(() => import('./pages/TermsOfService'));
const ContactPage = lazyWithRetry(() => import('./pages/ContactPage'));
const ContactMessagesPage = lazyWithRetry(() => import('./pages/ContactMessagesPage'));
const MessagesPage = lazyWithRetry(() => import('./pages/Messages/MessagesPage'));
const ListingsList = lazyWithRetry(() => import('./pages/RealEstate/ListingsList'));
const ListingDetail = lazyWithRetry(() => import('./pages/RealEstate/ListingDetail'));
const CreateListing = lazyWithRetry(() => import('./pages/RealEstate/CreateListing'));
const EditListing = lazyWithRetry(() => import('./pages/RealEstate/EditListing'));
const MyListings = lazyWithRetry(() => import('./pages/RealEstate/MyListings'));
const CreditPackagesPage = lazyWithRetry(() => import('./pages/Credits/CreditPackagesPage'));
const PaymentResultPage = lazyWithRetry(() => import('./pages/Credits/PaymentResultPage'));
const ShopList = lazyWithRetry(() => import('./pages/Shop/ShopList'));
const ProductDetail = lazyWithRetry(() => import('./pages/Shop/ProductDetail'));
const CartPage = lazyWithRetry(() => import('./pages/Shop/CartPage'));
const CheckoutPage = lazyWithRetry(() => import('./pages/Shop/CheckoutPage'));
const ShopPaymentResultPage = lazyWithRetry(() => import('./pages/Shop/ShopPaymentResultPage'));
const EventsList = lazyWithRetry(() => import('./pages/Events/EventsList'));
const EventDetail = lazyWithRetry(() => import('./pages/Events/EventDetail'));
const CreateEvent = lazyWithRetry(() => import('./pages/Events/CreateEvent'));
const MyEvents = lazyWithRetry(() => import('./pages/Events/MyEvents'));

// Hooks & Store
import { useMe } from './hooks/useAuth';
import { useAuthStore } from './store/authStore';
import { hasValidSessionHint } from './lib/session';
import {
  JobsLegacyRedirect,
  SportsLegacyRedirect,
  RealEstateLegacyRedirect,
} from './routes/legacyRedirects';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
  </div>
);

/** Hidrata sesión sin bloquear rutas públicas; siempre libera isLoading. */
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setLoading = useAuthStore((state) => state.setLoading);
  const logout = useAuthStore((state) => state.logout);
  const meQuery = useMe();

  useEffect(() => {
    if (!hasValidSessionHint()) {
      logout();
      setLoading(false);
    }
  }, [logout, setLoading]);

  useEffect(() => {
    if (!hasValidSessionHint()) {
      setLoading(false);
      return;
    }
    // Query terminó (éxito o error) o quedó idle sin fetch pendiente
    if (meQuery.fetchStatus === 'idle' && (meQuery.isSuccess || meQuery.isError || meQuery.isFetched)) {
      setLoading(false);
    }
  }, [
    meQuery.fetchStatus,
    meQuery.isSuccess,
    meQuery.isError,
    meQuery.isFetched,
    setLoading,
  ]);

  // Red de seguridad: nunca dejar ProtectedRoute colgado > 10s
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 10_000);
    return () => window.clearTimeout(timer);
  }, [setLoading]);

  return <>{children}</>;
};

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
  requireSuperuser?: boolean;
}> = ({
  children,
  allowedRoles,
  requireSuperuser,
}) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();
  const sessionActive = isAuthenticated && hasValidSessionHint();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!sessionActive) {
    const next = `${location.pathname}${location.search}`;
    const to =
      next && next !== '/login' && next !== '/register'
        ? `/login?next=${encodeURIComponent(next)}`
        : '/login';
    return <Navigate to={to} replace />;
  }

  if (requireSuperuser && !user?.is_superuser) {
    return <Navigate to="/dashboard" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />
        <AuthInitializer>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Rutas públicas - NO requieren auth */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="privacy" element={<PrivacyPolicy />} />
                <Route path="terms" element={<TermsOfService />} />
                <Route path="contact" element={<ContactPage />} />

                {/* Rutas SEO canónicas (español) */}
                <Route path="empleos" element={<JobsList />} />
                <Route path="empleos/:id" element={<JobDetail />} />
                <Route path="empleos/mis-ofertas" element={<MyOffers />} />
                <Route
                  path="empleos/publicar"
                  element={
                    <ProtectedRoute allowedRoles={['manager', 'admin']}>
                      <CreateJob />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="empleos/editar/:id"
                  element={
                    <ProtectedRoute allowedRoles={['manager', 'admin']}>
                      <EditJob />
                    </ProtectedRoute>
                  }
                />

                <Route path="deportes" element={<TournamentsList />} />
                <Route path="deportes/my_tournaments" element={<TournamentsList />} />
                <Route path="deportes/my_tournaments/active" element={<TournamentsList />} />
                <Route path="deportes/tournaments/:slug" element={<TournamentDetail />} />
                <Route path="deportes/tournaments/create" element={<CreateTournament />} />
                <Route path="deportes/tournaments/:slug/edit" element={<EditTournament />} />
                <Route path="deportes/tournaments/:tournamentSlug/teams/:teamSlug" element={<TeamDetailPage />} />
                <Route path="deportes/tournaments/:tournamentSlug/teams/:teamSlug/roster" element={<TeamRosterPage />} />
                <Route path="deportes/players/:playerId" element={<PlayerProfilePage />} />
                <Route path="deportes/tournaments/:slug/schedule" element={<TournamentSchedulePage />} />
                <Route path="deportes/matches/:id" element={<MatchDetailPage />} />
                <Route path="deportes/tournaments/:slug/standings" element={<TournamentStandingsPage />} />
                <Route path="deportes/tournaments/:slug/structure" element={<TournamentStructurePage />} />
                <Route path="deportes/players/:id/stats" element={<PlayerStatsPage />} />
                <Route path="deportes/tournaments/:slug/player-stats" element={<TournamentPlayerStatsPage />} />

                <Route path="bienes-raices" element={<ListingsList />} />
                <Route path="bienes-raices/mis-publicaciones" element={<MyListings />} />
                <Route path="bienes-raices/:id" element={<ListingDetail />} />
                <Route
                  path="bienes-raices/publicar"
                  element={
                    <ProtectedRoute allowedRoles={['manager', 'admin']}>
                      <CreateListing />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="bienes-raices/editar/:id"
                  element={
                    <ProtectedRoute allowedRoles={['manager', 'admin']}>
                      <EditListing />
                    </ProtectedRoute>
                  }
                />

                {/* Redirecciones legacy (inglés → español) */}
                <Route path="jobs" element={<Navigate to="/empleos" replace />} />
                <Route path="jobs/*" element={<JobsLegacyRedirect />} />
                <Route path="sports" element={<Navigate to="/deportes" replace />} />
                <Route path="sports/*" element={<SportsLegacyRedirect />} />
                <Route path="real-estate" element={<Navigate to="/bienes-raices" replace />} />
                <Route path="real-estate/*" element={<RealEstateLegacyRedirect />} />
                <Route path="trabajos" element={<Navigate to="/empleos" replace />} />
                <Route path="trabajos/*" element={<Navigate to="/empleos" replace />} />
                <Route path="propiedades" element={<Navigate to="/bienes-raices" replace />} />
                <Route path="propiedades/*" element={<Navigate to="/bienes-raices" replace />} />

                <Route path="eventos" element={<EventsList />} />
                <Route path="eventos/:slug" element={<EventDetail />} />
                <Route path="eventos/mis-eventos" element={
                  <ProtectedRoute allowedRoles={['manager', 'admin']}>
                    <MyEvents />
                  </ProtectedRoute>
                } />
                <Route
                  path="eventos/publicar"
                  element={
                    <ProtectedRoute allowedRoles={['manager', 'admin']}>
                      <CreateEvent />
                    </ProtectedRoute>
                  }
                />
                <Route path="events" element={<Navigate to="/eventos" replace />} />
                <Route path="events/*" element={<Navigate to="/eventos" replace />} />

                <Route path="creditos" element={<CreditPackagesPage />} />
                <Route path="creditos/resultado" element={<PaymentResultPage />} />

                <Route path="tienda" element={<ShopList />} />
                <Route path="tienda/carrito" element={<CartPage />} />
                <Route path="tienda/checkout" element={<CheckoutPage />} />
                <Route path="tienda/resultado" element={<ShopPaymentResultPage />} />
                <Route path="tienda/:slug" element={<ProductDetail />} />

                {/* Rutas protegidas adicionales */}
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="dashboard/contacto"
                  element={
                    <ProtectedRoute requireSuperuser>
                      <ContactMessagesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="applications"
                  element={
                    <ProtectedRoute>
                      <MyApplications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="applications/received"
                  element={
                    <ProtectedRoute allowedRoles={['manager', 'admin']}>
                      <ReceivedApplications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="messages"
                  element={
                    <ProtectedRoute>
                      <MessagesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="messages/:conversationId"
                  element={
                    <ProtectedRoute>
                      <MessagesPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Auth routes - públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </AuthInitializer>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
