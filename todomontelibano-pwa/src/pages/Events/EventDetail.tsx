import React from 'react';

import { Link, useParams } from 'react-router-dom';

import {

  Calendar,

  ChevronLeft,

  Globe,

  Mail,

  MapPin,

  ExternalLink,

  Phone,

} from 'lucide-react';

import { useEvent } from '../../hooks/useEvents';

import { usePermissions } from '../../hooks/usePermissions';

import ReportPublicationButton from '../../components/Moderation/ReportPublicationButton';

import AdVisibilityUpsell from '../../components/Advertising/AdVisibilityUpsell';

import ClassifiedAdSlot from '../../components/Advertising/ClassifiedAdSlot';
import SeoHead from '../../components/SEO/SeoHead';
import JsonLd from '../../components/SEO/JsonLd';
import { buildEventSchema } from '../../components/SEO/schemas/seoSchemas';
import { ROUTES } from '../../config/seo';



const EventDetail: React.FC = () => {

  const { slug } = useParams<{ slug: string }>();

  const { data: event, isLoading } = useEvent(slug || '');

  const { isOwner: checkIsOwner } = usePermissions();

  const isOwner = checkIsOwner(event as any);



  if (isLoading) {

    return (

      <div className="min-h-[50vh] flex items-center justify-center">

        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" />

      </div>

    );

  }



  if (!event) {

    return (

      <div className="page-container page-section text-center">

        <p className="text-gray-500">Evento no encontrado.</p>

        <Link to="/eventos" className="text-violet-600 mt-4 inline-block">

          Volver al listado

        </Link>

      </div>

    );

  }



  const formatDate = (iso: string) =>

    new Date(iso).toLocaleString('es-CO', {

      dateStyle: 'full',

      timeStyle: 'short',

    });



  return (

    <div className="page-container page-section pb-12">

      <SeoHead
        title={event.title}
        description={
          event.description?.slice(0, 160) ||
          `${event.title} — evento publicitario en CordobaTech. ${event.location || 'Agenda local'}.`
        }
        path={ROUTES.eventosDetail(event.slug)}
        ogType="website"
        ogImage={event.cover_image}
      />
      <JsonLd data={buildEventSchema(event)} />

      <Link

        to="/eventos"

        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-violet-600 mb-6"

      >

        <ChevronLeft className="w-4 h-4" /> Eventos

      </Link>



      {event.cover_image && (

        <img

          src={event.cover_image}

          alt={event.title}

          className="w-full max-h-80 object-cover rounded-3xl mb-6"

        />

      )}



      <ClassifiedAdSlot

        position="event_detail"

        objectId={event.id}

        variant="horizontal"

        className="mb-6"

      />



      <div className="flex flex-col lg:flex-row gap-8">

        <div className="flex-1">

          <span className="text-xs font-semibold text-violet-600 uppercase">

            {event.category_label || event.event_category}

          </span>

          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">

            {event.title}

          </h1>

          {event.organizer_name && (

            <p className="text-gray-500 mt-2">Organiza: {event.organizer_name}</p>

          )}



          <div className="prose dark:prose-invert max-w-none mt-6 text-gray-600 dark:text-gray-400 whitespace-pre-line">

            {event.description}

          </div>



          <div className="mt-6">

            <ReportPublicationButton contentType="event" objectId={event.id} />

          </div>

        </div>



        <aside className="lg:w-80 space-y-4">

          {isOwner && (

            <AdVisibilityUpsell

              contentType="event"

              objectId={event.id}

              isOwner={isOwner}

              defaultTitle={event.title}

              defaultImage={event.cover_image || ''}

              defaultLinkUrl={event.external_link || window.location.href}

            />

          )}



          <div className="card-static p-5 space-y-4">

            <div className="flex items-start gap-3">

              <Calendar className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />

              <div>

                <p className="text-xs text-gray-500 uppercase font-medium">Inicio</p>

                <p className="font-semibold">{formatDate(event.start_datetime)}</p>

                {event.end_datetime && (

                  <>

                    <p className="text-xs text-gray-500 uppercase font-medium mt-3">Fin</p>

                    <p className="font-semibold">{formatDate(event.end_datetime)}</p>

                  </>

                )}

              </div>

            </div>



            {event.is_online ? (

              <div className="flex items-start gap-3">

                <Globe className="w-5 h-5 text-violet-600 shrink-0" />

                <div>

                  <p className="text-xs text-gray-500 uppercase">En línea</p>

                  {event.online_url && (

                    <a

                      href={event.online_url}

                      target="_blank"

                      rel="noopener noreferrer"

                      className="text-violet-600 text-sm break-all"

                    >

                      {event.online_url}

                    </a>

                  )}

                </div>

              </div>

            ) : (

              <div className="flex items-start gap-3">

                <MapPin className="w-5 h-5 text-violet-600 shrink-0" />

                <div>

                  <p className="text-xs text-gray-500 uppercase">Ubicación</p>

                  <p className="font-semibold">{event.location || 'Por confirmar'}</p>

                  {event.address && <p className="text-sm text-gray-500">{event.address}</p>}

                </div>

              </div>

            )}



            {event.price_info && (

              <p className="text-lg font-bold text-gray-900 dark:text-white">{event.price_info}</p>

            )}



            {event.contact_phone && (

              <a

                href={`tel:${event.contact_phone}`}

                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"

              >

                <Phone className="w-4 h-4" /> {event.contact_phone}

              </a>

            )}

            {event.contact_email && (

              <a

                href={`mailto:${event.contact_email}`}

                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"

              >

                <Mail className="w-4 h-4" /> {event.contact_email}

              </a>

            )}

            {event.external_link && (

              <a

                href={event.external_link}

                target="_blank"

                rel="noopener noreferrer"

                className="inline-flex items-center gap-2 w-full justify-center py-2.5 rounded-2xl bg-violet-600 text-white text-sm font-semibold"

              >

                <ExternalLink className="w-4 h-4" /> Más información

              </a>

            )}

          </div>

        </aside>

      </div>

    </div>

  );

};



export default EventDetail;

