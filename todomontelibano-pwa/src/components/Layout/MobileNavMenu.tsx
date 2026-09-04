import React, { memo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { LogOut } from 'lucide-react';
import type { User } from '../../types';
import { ROUTES } from '../../config/seo';
import { canManageContent } from '../../hooks/usePermissions';
import CreditBalanceBadge from '../Credits/CreditBalanceBadge';
import BuyCreditsButton from '../Credits/BuyCreditsButton';

export interface MobileNavService {
  name: string;
  icon: LucideIcon;
  path: string;
  active: boolean;
  comingSoon?: boolean;
  description?: string;
}

interface MobileNavMenuProps {
  services: MobileNavService[];
  sessionActive: boolean;
  user: User | null;
  onClose: () => void;
  onLogout: () => void;
  panelRef?: React.RefObject<HTMLDivElement | null>;
}

const MobileNavMenu: React.FC<MobileNavMenuProps> = ({
  services,
  sessionActive,
  user,
  onClose,
  onLogout,
  panelRef,
}) => {
  const menu = (
    <div ref={panelRef} className="md:hidden" role="presentation">
      <button
        type="button"
        className="mobile-nav-overlay"
        aria-label="Cerrar menú de navegación"
        onClick={onClose}
      />
      <nav
        id="mobile-nav-panel"
        className="mobile-nav-panel border-b border-gray-200 dark:border-gray-800"
        aria-label="Menú móvil"
      >
        <div className="px-4 py-5 space-y-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <Link
            to="/"
            className="block py-3 text-base font-bold text-gray-700 dark:text-gray-200"
            onClick={onClose}
          >
            Inicio
          </Link>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Servicios</p>
            {services.map((service) => (
              <Link
                key={service.name}
                to={service.active ? service.path : '#'}
                onClick={(e) => {
                  if (!service.active) e.preventDefault();
                  onClose();
                }}
                className={`flex items-center py-3 font-bold ${
                  service.active ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400'
                }`}
              >
                <service.icon className="w-5 h-5 mr-3 shrink-0" aria-hidden="true" />
                {service.name}
                {service.comingSoon && (
                  <span className="ml-auto badge text-[10px]">Pronto</span>
                )}
              </Link>
            ))}
          </div>

          {sessionActive ? (
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-2">
              <div className="flex flex-col gap-2 mb-3">
                <CreditBalanceBadge className="w-full justify-center" />
                <BuyCreditsButton compact label="Comprar créditos" />
              </div>
              <Link
                to="/profile"
                className="block py-3 text-base font-bold text-gray-700 dark:text-gray-200"
                onClick={onClose}
              >
                Mi Perfil
              </Link>
              <Link
                to="/dashboard"
                className="block py-3 text-base font-bold text-gray-700 dark:text-gray-200"
                onClick={onClose}
              >
                Dashboard
              </Link>
              {(user?.is_superuser || user?.is_staff) && (
                <Link
                  to="/dashboard/admin"
                  className="block py-3 text-base font-bold text-indigo-700 dark:text-indigo-300"
                  onClick={onClose}
                >
                  Panel de administración
                </Link>
              )}
              <Link
                to={ROUTES.tiendaPedidos}
                className="block py-3 text-base font-bold text-gray-700 dark:text-gray-200"
                onClick={onClose}
              >
                Mis pedidos
              </Link>
              <Link
                to={ROUTES.facturas}
                className="block py-3 text-base font-bold text-gray-700 dark:text-gray-200"
                onClick={onClose}
              >
                Mis facturas
              </Link>
              {canManageContent(user) && (
                <Link
                  to={ROUTES.facturacion}
                  className="block py-3 text-base font-bold text-gray-700 dark:text-gray-200"
                  onClick={onClose}
                >
                  Facturación y ventas
                </Link>
              )}
              <Link
                to="/messages"
                className="block py-3 text-base font-bold text-gray-700 dark:text-gray-200"
                onClick={onClose}
              >
                Mensajes
              </Link>
              {canManageContent(user) && (
                <Link
                  to="/real-estate/my_listings"
                  className="block py-3 text-base font-bold text-gray-700 dark:text-gray-200"
                  onClick={onClose}
                >
                  Mis Propiedades
                </Link>
              )}
              {canManageContent(user) && (
                <Link
                  to="/jobs/offers/"
                  className="block py-3 text-base font-bold text-gray-700 dark:text-gray-200"
                  onClick={onClose}
                >
                  Gestionar Empleos
                </Link>
              )}
              {canManageContent(user) && (
                <Link
                  to="/eventos/mis-eventos"
                  className="block py-3 text-base font-bold text-gray-700 dark:text-gray-200"
                  onClick={onClose}
                >
                  Mis Eventos
                </Link>
              )}
              {canManageContent(user) && (
                <Link
                  to="/tienda/publicar"
                  className="block py-3 text-base font-bold text-gray-700 dark:text-gray-200"
                  onClick={onClose}
                >
                  Crear producto
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full text-left py-3 text-base font-bold text-red-600 dark:text-red-400 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-3">
              <Link
                to="/creditos"
                className="block py-3 text-base font-bold text-violet-600 dark:text-violet-400"
                onClick={onClose}
              >
                Ver planes de créditos
              </Link>
              <Link
                to="/login"
                className="block py-3 text-base font-bold text-violet-600 dark:text-violet-400"
                onClick={onClose}
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="btn-primary w-full text-center"
                onClick={onClose}
              >
                Crear Cuenta
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(menu, document.body);
};

export default memo(MobileNavMenu);
