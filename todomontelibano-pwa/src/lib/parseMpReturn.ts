export type MpUiStatus = 'success' | 'pending' | 'failure';

export interface MpReturnParams {
  uiStatus: MpUiStatus;
  paymentId: string;
  preferenceId: string;
  externalReference: string;
  rawStatus: string;
}

function pathStatusHint(pathname: string): MpUiStatus | null {
  const path = pathname.toLowerCase();
  if (path.includes('/success')) return 'success';
  if (path.includes('/failure') || path.includes('/error')) return 'failure';
  if (path.includes('/pending')) return 'pending';
  return null;
}

export function parseMpReturnParams(
  params: URLSearchParams,
  pathname = '',
): MpReturnParams {
  const paymentId = (
    params.get('payment_id')
    || params.get('collection_id')
    || params.get('paymentId')
    || ''
  ).trim();
  const preferenceId = (params.get('preference_id') || params.get('preferenceId') || '').trim();
  const externalReference = (
    params.get('external_reference')
    || params.get('externalReference')
    || params.get('order_id')
    || ''
  ).trim();
  const rawStatus = (
    params.get('collection_status')
    || params.get('status')
    || ''
  ).trim().toLowerCase();

  let uiStatus: MpUiStatus = 'pending';
  if (['success', 'approved'].includes(rawStatus)) uiStatus = 'success';
  else if (['failure', 'rejected', 'cancelled', 'canceled'].includes(rawStatus)) uiStatus = 'failure';
  else if (['pending', 'in_process', 'in_mediation'].includes(rawStatus)) uiStatus = 'pending';
  else {
    const hint = pathStatusHint(pathname);
    if (hint) uiStatus = hint;
  }

  return {
    uiStatus,
    paymentId,
    preferenceId,
    externalReference,
    rawStatus,
  };
}

export function isTerminalPaymentStatus(status?: string | null, applied?: boolean): boolean {
  if (applied) return true;
  const value = (status || '').toLowerCase();
  return ['approved', 'rejected', 'cancelled', 'canceled', 'refunded'].includes(value);
}
