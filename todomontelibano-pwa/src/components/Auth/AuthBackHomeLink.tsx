import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/** Acceso visible al home público desde login / registro / recuperación. */
const AuthBackHomeLink: React.FC = () => (
  <Link
    to="/"
    title="Ir al inicio"
    className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors py-2 px-3 rounded-lg hover:bg-slate-800/50"
  >
    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
    Volver al Inicio
  </Link>
);

export default AuthBackHomeLink;
