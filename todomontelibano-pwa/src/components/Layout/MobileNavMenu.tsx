import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { LogOut } from 'lucide-react';
import type { User } from '../../types';
import { ROUTES } from '../../config/seo';
import { canManageContent } from '../../hooks/usePermissions';

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
}

const MobileNavMenu: React.FC<MobileNavMenuProps> = ({
  services,
  sessionActive,
  user,
  onClose,
  onLogout,
}) => (
  <>
    <button
      type="button"
      className="md:hidden fixed inset-0 top-[4.5rem] z-40 bg-black/25 backdrop-blur-[1px]"
      aria-label="Cerrar menú de navegación"
      onClick={onClose}
    />
    <nav
      id="mobile-nav-panel"
      className="mobile-nav-panel md:hidden border-t border-gray-200/60 dark:border-gray-800/60 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl"
      aria-label="Menú móvil"
    >
      <div className="px-4 py-6 space-y-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
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
            {canManageContent(user) && (
              <div className="px-4 py-3 text-sm font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-3xl flex items-center gap-1.5 mb-3">
                🪙 {user?.credits ?? 0} Créditos disponibles
              </div>
            )}
            <Link
              to="/creditos"
              className="block py-3 text-base font-bold text-violet-600 dark:text-violet-400"
              onClick={onClose}
            >
              Comprar créditos
            </Link>
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
              to="/messages"
              className="block py-3 text-base font-bold text-gray-700 dark:text-gray-200"
              onClick={onClose}
            >
              Mensajes
            </Link>
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
  </>
);

export default memo(MobileNavMenu);
