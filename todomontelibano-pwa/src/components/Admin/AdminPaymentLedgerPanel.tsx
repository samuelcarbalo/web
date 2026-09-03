import React, { useState } from 'react';
import { Download, History } from 'lucide-react';
import { usePaymentLedger } from '../../hooks/usePayments';
import { paymentsApi } from '../../lib/paymentsApi';

const TABS = [
  { id: 'all', label: 'Todos' },
  { id: 'tienda', label: 'Tienda' },
  { id: 'deportes', label: 'Deportes' },
  { id: 'eventos', label: 'Eventos' },
];

const AdminPaymentLedgerPanel: React.FC = () => {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const params = {
    category,
    search: search.trim() || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  };
  const { data, isLoading, isError } = usePaymentLedger(params);
  const rows = data?.results ?? [];

  const exportCsv = async () => {
    const { data: blob } = await paymentsApi.downloadLedgerCsv(params);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historial-pagos-chever.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3">
        <History className="w-6 h-6 text-violet-600 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-lg font-extrabold">Historial de pagos global</h2>
          <p className="text-sm text-gray-500">
            Consolida compras de tienda (Mercado Pago), renovaciones del módulo deportivo y
            publicaciones de eventos cobradas con créditos.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCategory(tab.id)}
            className={`px-4 py-2 rounded-2xl text-sm font-bold ${
              category === tab.id
                ? 'bg-violet-600 text-white'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card-static grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          className="input-field md:col-span-2"
          placeholder="Usuario, correo o referencia"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input type="date" className="input-field" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <input type="date" className="input-field" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </div>

      <div className="flex justify-end">
        <button type="button" className="btn-secondary inline-flex items-center gap-2" onClick={() => void exportCsv()}>
          <Download className="w-4 h-4" /> Exportar CSV / Excel
        </button>
      </div>

      {isError && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          No se pudo cargar el historial. Verifica permisos de administrador.
        </p>
      )}

      <div className="overflow-x-auto card-static !p-0">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Categoría</th>
              <th className="px-4 py-3 text-left">Usuario</th>
              <th className="px-4 py-3 text-left">Monto</th>
              <th className="px-4 py-3 text-left">Método</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-gray-500">
                  Cargando…
                </td>
              </tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-gray-500">
                  No hay transacciones en esta categoría.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={`${row.category}-${row.id}`} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-4 py-3 font-mono text-xs">{row.id.slice(0, 8)}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-800 dark:text-violet-200 px-2 py-0.5 text-xs font-bold">
                    {row.category_label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-bold">{row.payer_name}</p>
                  <p className="text-xs text-gray-500">{row.payer_email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{row.reference}</p>
                </td>
                <td className="px-4 py-3 font-bold">{row.amount_label}</td>
                <td className="px-4 py-3">{row.payment_method}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {row.created_at ? new Date(row.created_at).toLocaleString('es-CO') : '—'}
                </td>
                <td className="px-4 py-3">{row.status_label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminPaymentLedgerPanel;
