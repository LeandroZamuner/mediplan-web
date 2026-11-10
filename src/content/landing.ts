/** Textos de la landing, tal como figuran en el diseño de Figma. Se editan acá, no en los componentes. */

export const navItems = [
  { id: "aplicacion", label: "Nuestra Aplicación" },
  { id: "nosotros", label: "Sobre nosotros" },
  { id: "testimonios", label: "Testimonios" },
  { id: "faq", label: "Preguntas frecuentes" },
] as const;

export const features = [
  {
    icon: "/icons/first-aid-kit.svg",
    title: "Gestión de tus medicamentos",
    text: "Organiza tus medicamentos, configura recordatorios personalizados para asegurarte de tomarlos a tiempo, y marca fácilmente si has seguido o no tu tratamiento.",
    shape: "one",
  },
  {
    icon: "/icons/report-analytics.svg",
    title: "Control del stock",
    text: "Lleva un seguimiento del stock de tus medicamentos y recibe alertas cuando queden pocas dosis para asegurarte de estar siempre preparado.",
    shape: "two",
  },
  {
    icon: "/icons/heart-handshake.svg",
    title: "Sincronización con familiares y cuidadores",
    text: "Mantén a tus seres queridos informados. Comparte tu progreso y estado del tratamiento con familiares o cuidadores de manera automática para que estén al tanto de tu bienestar.",
    shape: "three",
  },
] as const;

export const about = {
  title: "Sobre nosotros",
  text: "Nuestra misión es facilitar la gestión de tratamientos médicos, ayudando a los pacientes y sus familiares a mantenerse organizados y saludables",
  teamTitle: "Personas que forman parte de MediPlan",
  teamText:
    "Nuestro equipo está formado por expertos en tecnología, salud y diseño, unidos por la idea de mejorar la calidad de vida de los usuarios.",
  quote:
    "“Después de ver a nuestros seres queridos lidiar con tratamientos médicos complejos, nos propusimos crear una solución que hiciera el proceso más fácil y menos estresante.”",
  author: "Martín Bruno, CEO de MediPlan",
  teamPhotos: 9,
} as const;

export const testimonials = {
  title: "Historias de nuestros usuarios",
  text: "Miles de personas ya gestionan su tratamiento de manera sencilla con nuestra aplicación.",
  items: [
    {
      photo: "/images/testimonials/user-1.png",
      quote:
        "Gracias a esta app, no me preocupo más por olvidar mis medicamentos. Los recordatorios son puntuales y me avisan si me estoy quedando sin stock. Además, mis hijos se sienten mucho más tranquilos al recibir informes sobre mi salud.",
      author: "Ana G., 65 años",
    },
    {
      photo: "/images/testimonials/user-2.png",
      quote:
        "Como cuidador de mi madre, la sincronización con la app me ha sido invaluable. Sé en todo momento si está siguiendo su tratamiento y puedo tomar medidas si algo no va como debería.",
      author: "Carlos M., 38 años",
    },
    {
      photo: "/images/testimonials/user-3.png",
      // OJO: este testimonio (y la pregunta de IA del FAQ) menciona un "análisis predictivo" que
      // está FUERA del alcance actual del producto. Pendiente de decidir con Lea.
      quote:
        "El sistema de análisis predictivo me ha ayudado a planificar mejor las compras de mis medicamentos. Es increíble saber exactamente cuándo necesitaré reabastecerme, ¡sin sorpresas!",
      author: "Laura P., 29 años",
    },
  ],
} as const;

export const faq = {
  title: ["Dudas comunes", "sobre nuestra app"],
  text: "Aquí respondemos algunas de las dudas más comunes para que puedas empezar a usar nuestra plataforma sin complicaciones.",
  // Dos columnas, como en el diseño.
  columns: [
    [
      {
        q: "¿Cómo agrego mis medicamentos en la app?",
        a: "Simplemente selecciona ‘Agregar medicamento’, ingresa el nombre, dosis, frecuencia y duración del tratamiento. Luego podrás configurar recordatorios.",
      },
      {
        q: "¿Puedo agregar varios medicamentos con diferentes horarios de toma?",
        a: "Sí, puedes añadir tantos medicamentos como necesites, cada uno con su propio horario de recordatorios y detalles específicos. La app te permite gestionar tratamientos complejos de forma sencilla.",
      },
    ],
    [
      {
        q: "¿Puedo agregar a más de un familiar o cuidador?",
        a: "Sí, puedes agregar múltiples contactos de confianza que recibirán notificaciones y resúmenes sobre el estado de tu tratamiento",
      },
      {
        q: "¿Cómo funciona el análisis predictivo con IA?",
        a: "La IA analiza tu consumo de medicamentos y te sugiere cuándo será necesario reabastecer tu stock, ayudándote a planificar mejor tus compras.",
      },
      {
        q: "¿Es segura la información que ingreso en la app?",
        a: "Sí, toda tu información está protegida con altos estándares de seguridad y encriptación. Tu privacidad es nuestra prioridad.",
      },
    ],
  ],
} as const;

export const download = {
  title: "Descarga la app y nunca más olvides tomar tus medicamentos",
  button: "Descargar aplicación",
  soon: "Próximamente en Google Play",
} as const;

export const footer = {
  slogan: ["Tu plan de medicación", "siempre bajo control."],
  newsletterLabel: "Suscríbase a nuestro newsletter",
  newsletterPlaceholder: "Escriba su correo electrónico",
  main: {
    title: "Principal",
    links: [
      { label: "Nuestra aplicación", href: "#aplicacion" },
      { label: "Sobre nosotros", href: "#nosotros" },
      { label: "Testimonios de nuestros usuarios", href: "#testimonios" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Política de privacidad", href: "/privacidad" },
      { label: "Términos y condiciones", href: "/terminos" },
      { label: "Soporte o Centro de Ayuda", href: "/ayuda" },
      { label: "FAQ (Preguntas Frecuentes)", href: "#faq" },
    ],
  },
  downloadButton: "Descargar App",
  registerButton: "Registrarme ahora",
} as const;
