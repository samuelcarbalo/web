import { api } from './api';

export type AdminImportModule =
  | 'schedule'
  | 'players'
  | 'jobs'
  | 'products'
  | 'discounts';

export type AdminImportResult = {
  success: boolean;
  module: string;
  created: number;
  updated: number;
  error_count: number;
  errors: Array<{ row: number; field?: string | null; message: string }>;
};

export async function listAdminImportModules() {
  const { data } = await api.get<{
    modules: Array<{ key: AdminImportModule; headers: string[] }>;
  }>('/admin/import/modules/');
  return data;
}

export async function downloadAdminImportTemplate(module: AdminImportModule) {
  const response = await api.get(`/admin/templates/${module}/`, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chever_plantilla_${module}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function uploadAdminImportExcel(module: AdminImportModule, file: File) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post<AdminImportResult>(`/admin/import/${module}/`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
