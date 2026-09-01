import { api } from './api';

export type AdminImportModule =
  | 'schedule'
  | 'players'
  | 'jobs'
  | 'products'
  | 'discounts';

/** Encabezados exactos por módulo (alineados con el backend). */
export const IMPORT_MODULE_HEADERS: Record<AdminImportModule, readonly string[]> = {
  schedule: [
    'tournament_slug',
    'home_team',
    'away_team',
    'match_date',
    'venue',
    'round_number',
    'match_week',
    'phase',
    'status',
    'notes',
  ],
  players: [
    'tournament_slug',
    'team_name',
    'first_name',
    'last_name',
    'id_number',
    'email',
    'jersey_number',
    'position',
    'birth_date',
    'is_captain',
  ],
  jobs: [
    'title',
    'company_name',
    'description',
    'requirements',
    'location',
    'remote',
    'category',
    'job_type',
    'salary_min',
    'salary_max',
    'expires_at',
    'is_external',
    'external_apply_url',
  ],
  products: [
    'name',
    'sku',
    'description',
    'short_description',
    'category',
    'subcategory',
    'price_cop',
    'compare_at_price_cop',
    'stock',
    'image_url',
    'is_featured',
    'is_published',
  ],
  discounts: [
    'name',
    'product_sku',
    'product_id',
    'discount_type',
    'discount_percentage',
    'discount_amount_cop',
    'discount_price',
    'start_date',
    'end_date',
    'is_flash_sale',
    'is_active',
  ],
};

/** Columnas clave para detectar si la plantilla es del módulo correcto. */
export const IMPORT_MODULE_SIGNATURES: Record<AdminImportModule, readonly string[]> = {
  schedule: ['tournament_slug', 'home_team', 'away_team'],
  players: ['team_name', 'first_name', 'last_name'],
  jobs: ['title', 'company_name'],
  products: ['name', 'sku', 'price_cop'],
  discounts: ['discount_type', 'start_date', 'end_date'],
};

export const WRONG_TEMPLATE_MESSAGE =
  'La plantilla subida no corresponde a la categoría seleccionada.';

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
