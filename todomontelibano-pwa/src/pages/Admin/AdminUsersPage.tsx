import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Shield, Coins, Ban, CheckCircle2, Trash2, Pencil, X } from 'lucide-react';
import {
  useAdminUsers,
  useDeleteAdminUser,
  useSetAdminActive,
  useSetAdminCredits,
  useUpdateAdminUser,
} from '../../hooks/useAdminUsers';
import type { AdminUser } from '../../lib/adminApi';
import AdminExcelImportPanel from '../../components/Admin/AdminExcelImportPanel';

const AdminUsersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const focusCredits = searchParams.get('focus') === 'credits';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [creditValue, setCreditValue] = useState('');
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', phone: '', role: 'user' });

  const { data, isLoading, isError } = useAdminUsers({
    search: search.trim() || undefined,
    page,
  });
  const setCredits = useSetAdminCredits();
  const setActive = useSetAdminActive();
  const deleteUser = useDeleteAdminUser();
  const updateUser = useUpdateAdminUser();

  const users = data?.results ?? [];

  const openEdit = (u: AdminUser) => {
    setEditing(u);
    setCreditValue(String(u.credits));
    setEditForm({
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      phone: u.phone || '',
      role: u.role || 'user',
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    await updateUser.mutateAsync({ id: editing.id, data: editForm });
    await setCredits.mutateAsync({
      id: editing.id,
      payload: {
        credits: Number(creditValue) || 0,
        is_unlimited_credits: editing.is_unlimited_credits,
      },
    });
    setEditing(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950/50 pb-16">
      <div className="bg-gradient-to-r from-violet-700 via-indigo-700 to-slate-900 text-white shadow-md">
        <div className="page-container py-10 sm:py-14">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-white/20 rounded-full">
            Superadmin
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8" /> Panel de administración
          </h1>
          <p className="mt-2 text-violet-100 max-w-2xl font-light">
            Gestiona usuarios, créditos y estado de cuentas. Solo visible para staff / superusuario.
          </p>
          {focusCredits && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-amber-400/20 border border-amber-200/50 px-4 py-2 text-sm font-bold text-amber-50">
              <Coins className="w-4 h-4" />
              Modo ajuste de créditos: abre un usuario con el lápiz y edita el saldo.
            </div>
          )}
        </div>
      </div>

      <div className="page-container mt-8">
        <form
          className="card-static mb-6 flex flex-col sm:flex-row gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
              placeholder="Buscar por email, nombre o usuario..."
            />
          </div>
          <button type="submit" className="btn-primary">
            Buscar
          </button>
        </form>

        {isLoading && <p className="text-sm text-gray-500">Cargando usuarios…</p>}
        {isError && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            No se pudo cargar el listado. Verifica que tu cuenta sea staff/superusuario.
          </p>
        )}

        <div className="overflow-x-auto card-static !p-0">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Créditos</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-900 dark:text-white">{u.email}</p>
                    <p className="text-xs text-gray-500">
                      {u.full_name || u.username} {u.organization_name ? `· ${u.organization_name}` : ''}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {u.role}
                    {u.is_superuser ? ' · super' : ''}
                  </td>
                  <td className="px-4 py-3">
                    {u.has_unlimited_credits ? 'Ilimitado' : u.credits}
                  </td>
                  <td className="px-4 py-3">
                    {u.is_active ? (
                      <span className="text-emerald-600 font-bold">Activo</span>
                    ) : (
                      <span className="text-red-500 font-bold">Bloqueado</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="btn-secondary !py-1.5 !px-3 text-xs" onClick={() => openEdit(u)}>
                        <Pencil className="w-3 h-3 mr-1" /> Editar
                      </button>
                      <button
                        type="button"
                        className="btn-secondary !py-1.5 !px-3 text-xs"
                        onClick={() =>
                          setActive.mutate({ id: u.id, is_active: !u.is_active })
                        }
                      >
                        {u.is_active ? (
                          <>
                            <Ban className="w-3 h-3 mr-1" /> Bloquear
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Activar
                          </>
                        )}
                      </button>
                      {!u.is_superuser && (
                        <button
                          type="button"
                          className="btn-secondary !py-1.5 !px-3 text-xs text-red-600"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar a ${u.email}? Esta acción no se puede deshacer.`)) {
                              deleteUser.mutate(u.id);
                            }
                          }}
                        >
                          <Trash2 className="w-3 h-3 mr-1" /> Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.total_pages > 1 && (
          <div className="mt-4 flex justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              className="btn-secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            <span className="text-sm text-gray-500 self-center">
              Página {data.current_page} de {data.total_pages}
            </span>
            <button
              type="button"
              disabled={page >= data.total_pages}
              className="btn-secondary"
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="card-static max-w-md w-full relative">
            <button
              type="button"
              className="absolute right-3 top-3 p-1"
              onClick={() => setEditing(null)}
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-extrabold mb-4">Editar {editing.email}</h2>
            <div className="space-y-3">
              <input
                className="input-field"
                placeholder="Nombre"
                value={editForm.first_name}
                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
              />
              <input
                className="input-field"
                placeholder="Apellido"
                value={editForm.last_name}
                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
              />
              <input
                className="input-field"
                placeholder="Teléfono"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
              <select
                className="input-field"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              >
                <option value="user">user</option>
                <option value="manager">manager</option>
                <option value="admin">admin</option>
              </select>
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500" />
                <input
                  className="input-field"
                  type="number"
                  min={0}
                  value={creditValue}
                  onChange={(e) => setCreditValue(e.target.value)}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.is_unlimited_credits}
                  onChange={(e) =>
                    setEditing({ ...editing, is_unlimited_credits: e.target.checked })
                  }
                />
                Créditos ilimitados
              </label>
              <button type="button" className="btn-primary w-full justify-center" onClick={saveEdit}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminExcelImportPanel />
    </div>
  );
};

export default AdminUsersPage;
