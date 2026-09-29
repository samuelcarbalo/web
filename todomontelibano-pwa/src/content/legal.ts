export const TERMS_VERSION = '2026-09-29';
export const TERMS_UPDATED_LABEL = '29 de septiembre de 2026';

export interface LegalSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: '1. Aceptación',
    paragraphs: [
      'Al crear una cuenta, publicar, inscribirte o pagar en Chéver aceptas estos Términos y Condiciones y la Política de Privacidad. Si no estás de acuerdo, no uses la plataforma.',
      `Versión vigente: ${TERMS_VERSION}. Última actualización: ${TERMS_UPDATED_LABEL}.`,
    ],
  },
  {
    title: '2. Qué es Chéver',
    paragraphs: [
      'Chéver es una plataforma tecnológica para publicar empleos, inmuebles, eventos y gestionar torneos en la comunidad. No es empleador, no es inmobiliaria, no organiza físicamente los eventos y no dirige los partidos.',
    ],
  },
  {
    title: '3. Pagos, comisiones y reembolsos',
    paragraphs: [
      'Las compras de créditos, suscripciones, entradas y productos se cobran a través de Mercado Pago. El valor que pagas incluye el precio del servicio y las comisiones de procesamiento de la pasarela.',
      'Chéver no almacena números de tarjeta, CVV ni claves bancarias. Esos datos los procesa únicamente Mercado Pago.',
    ],
    bullets: [
      'Las compras de créditos y servicios no son reembolsables una vez procesadas.',
      'Si el pago queda pendiente, rechazado o anulado, el crédito o el pedido no se acredita hasta que Mercado Pago confirme el estado aprobado.',
      'Al realizar el pago aceptas estos términos y las políticas de procesamiento de Mercado Pago.',
    ],
  },
  {
    title: '4. Deportes y eventos',
    paragraphs: [
      'Chéver actúa solo como herramienta de gestión: calendarios, equipos, inscripciones y resultados. No se hace responsable por imprevistos físicos, lesiones, accidentes, cancelaciones ni disputas entre organizadores y participantes.',
      'Cada organizador define el reglamento de su torneo o evento y responde por las condiciones en las que se desarrolla.',
    ],
  },
  {
    title: '5. Veracidad de empleos e inmuebles',
    paragraphs: [
      'Quien publica una oferta de trabajo o un inmueble es el único responsable de que la información sea cierta, lícita y esté actualizada: salario, requisitos, precio, ubicación, disponibilidad y datos de contacto.',
      'Chéver no verifica cada aviso y puede retirar publicaciones falsas, engañosas o que infrinjan la ley.',
    ],
  },
  {
    title: '6. Cuentas',
    paragraphs: [
      'Debes dar datos reales y cuidar tu contraseña. El uso de la cuenta es personal. Chéver puede suspender cuentas que publiquen fraude, suplantación o contenido ilícito.',
    ],
  },
  {
    title: '7. Cambios',
    paragraphs: [
      'Podemos actualizar estos términos. La nueva versión queda identificada por su fecha. Para seguir usando funciones de registro, pago o publicación debes aceptar la versión vigente.',
    ],
  },
];

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: '1. Responsable y Habeas Data',
    paragraphs: [
      'Chéver trata datos personales conforme a la Ley 1581 de 2012 y demás normas de Habeas Data en Colombia. Puedes conocer, actualizar, rectificar y solicitar la supresión de tus datos, y revocar la autorización cuando la ley lo permita.',
    ],
  },
  {
    title: '2. Datos que recopilamos',
    paragraphs: [
      'Recopilamos los datos que nos das al registrarte, publicar o pagar: nombre, correo, teléfono, tipo de cuenta y el contenido de tus avisos.',
    ],
    bullets: [
      'Empleos: hoja de vida y datos que el candidato decide enviar a una oferta.',
      'Inmuebles: datos de contacto que el anunciante publica en el aviso.',
      'Deportes: nombres de equipos y jugadores, estadísticas y datos de contacto del cuerpo técnico.',
      'Pagos: identificador, monto, fecha y estado que reporta Mercado Pago. No guardamos la tarjeta.',
    ],
  },
  {
    title: '3. Datos de contacto en deportes',
    paragraphs: [
      'El teléfono del cuerpo técnico no se muestra en la ficha pública del equipo ni se envía en la respuesta pública de la plataforma. Solo lo ve quien creó el equipo, quien organiza el torneo o un super administrador.',
      'Los datos de jugadores que se muestran al público se limitan a lo necesario para el torneo (nombre, dorsal, posición y estadísticas). El contacto personal no se publica a visitantes anónimos.',
    ],
  },
  {
    title: '4. Para qué usamos los datos',
    paragraphs: [
      'Usamos la información para crear tu cuenta, mostrar publicaciones, organizar torneos, procesar pagos y atender soporte. No vendemos tus datos.',
    ],
    bullets: [
      'Al postularte a un empleo, la empresa que publicó la oferta recibe los datos que enviaste.',
      'Mercado Pago recibe el correo, el monto y la referencia del cobro, y aplica su propia política.',
    ],
  },
  {
    title: '5. Conservación y seguridad',
    paragraphs: [
      'Conservamos los datos mientras la cuenta o la publicación estén activas y durante el tiempo que exija la ley. Aplicamos controles de acceso para que los datos de contacto no queden expuestos al público.',
    ],
  },
  {
    title: '6. Consultas',
    paragraphs: [
      'Para ejercer tus derechos de Habeas Data usa el formulario de contacto de Chéver. Indicaremos el trámite y el plazo de respuesta.',
    ],
  },
];
