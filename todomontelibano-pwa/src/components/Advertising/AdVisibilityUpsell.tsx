import React, { useMemo, useState } from 'react';
import { Megaphone, TrendingUp, Users } from 'lucide-react';
import { useMyAdCampaigns } from '../../hooks/useAdvertising';
import PurchaseAdCampaignModal from './PurchaseAdCampaignModal';
import type { PurchaseCampaignData } from '../../lib/advertisingApi';

interface Props {
  contentType: PurchaseCampaignData['content_type'];
  objectId: string;
  isOwner: boolean;
  defaultTitle?: string;
  defaultImage?: string;
  defaultLinkUrl?: string;
}

const AdVisibilityUpsell: React.FC<Props> = ({
  contentType,
  objectId,
  isOwner,
  defaultTitle = '',
  defaultImage = '',
  defaultLinkUrl = '',
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: campaigns, refetch } = useMyAdCampaigns(isOwner);

  const activeCampaign = useMemo(
    () =>
      campaigns?.find(
        (c) =>
          c.object_id === objectId &&
          c.content_type === contentType &&
          (c.status === 'active' || c.is_active_now)
      ),
    [campaigns, objectId, contentType]
  );

  if (!isOwner) return null;

  const reachPct = activeCampaign
    ? Math.min(100, Math.round((activeCampaign.unique_views / activeCampaign.target_reach) * 100))
    : 0;

  return (
    <>
      <div className="rounded-3xl border border-indigo-200/80 dark:border-indigo-800/50 bg-indigo-50/50 dark:bg-indigo-950/20 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-2xl bg-indigo-600 shrink-0">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {activeCampaign ? 'Campaña publicitaria activa' : 'Amplía tu visibilidad'}
            </p>

            {activeCampaign ? (
              <>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {activeCampaign.unique_views} / {activeCampaign.target_reach} personas distintas
                </p>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all"
                    style={{ width: `${reachPct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {activeCampaign.days_remaining} día(s) restantes ·{' '}
                  {activeCampaign.total_impressions} impresiones totales
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Llega a 100+ personas con planes desde 15 créditos. Tú eliges dónde aparece el
                anuncio.
              </p>
            )}

            {!activeCampaign && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Comprar visibilidad
              </button>
            )}
          </div>
        </div>
      </div>

      <PurchaseAdCampaignModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        contentType={contentType}
        objectId={objectId}
        defaultTitle={defaultTitle}
        defaultImage={defaultImage}
        defaultLinkUrl={defaultLinkUrl}
        onSuccess={() => refetch()}
      />
    </>
  );
};

export default AdVisibilityUpsell;
