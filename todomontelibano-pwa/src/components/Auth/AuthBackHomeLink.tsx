import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/** Acceso visible al home público desde login / registro / recuperación. */
const AuthBackHomeLink: React.FC = () => (
  <Link
    to="/"
    className="inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-sm font-bold bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100 shadow-sm hover:bg-secondary-50 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
  >
    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
    Volver al inicio
  </Link>
);

export default AuthBackHomeLink;
