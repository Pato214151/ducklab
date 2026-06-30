// Artículos del blog de Ducklab. Cada post tiene su contenido aquí y se
// renderiza tanto en el índice (/blog) como en su página (/blog/[slug]).

export const posts = [
  {
    slug: 'por-que-tu-negocio-necesita-un-pos',
    tag: 'Negocios',
    date: 'Jun 2026',
    readTime: '5 min',
    title: '¿Por qué tu negocio necesita un sistema POS?',
    excerpt: 'Cómo un punto de venta a medida te ahorra tiempo, reduce errores y te da control real de tu inventario.',
    intro: 'Si todavía llevas las ventas en un cuaderno o en un Excel, no estás solo, pero te está costando más de lo que crees. Un buen sistema POS no es un lujo de cadenas grandes: es la herramienta que separa a un negocio que adivina de uno que sabe.',
    body: [
      { h: 'El problema del cuaderno (y del Excel)' },
      { p: 'El cuaderno funciona hasta que deja de funcionar. No sabes cuánto te queda de un producto sin ir a contarlo, no sabes qué se vende más, y cuando hay un error de cuentas no hay forma de rastrearlo. El Excel es mejor, pero depende de que alguien lo llene bien, todos los días, sin equivocarse. Un descuido y el inventario queda desfasado.' },
      { p: 'El costo real no es la plata que se pierde en un error puntual: es no tener información para decidir. ¿Conviene pedir más de ese producto? ¿A qué hora vendes más? ¿Qué empleado cuadra mejor la caja? Sin datos, todo es intuición.' },
      { h: 'Qué hace un POS por ti' },
      { ul: [
        'Inventario en tiempo real: cada venta descuenta del stock automáticamente. Sabes qué tienes sin contar.',
        'Caja cuadrada: registra cada pago (efectivo, tarjeta, Nequi) y cierra el día con un solo clic.',
        'Reportes que sí usas: qué se vende, cuándo y cuánto. Decisiones con datos, no con corazonadas.',
        'Menos errores: el precio lo pone el sistema, no la memoria del cajero.',
        'Facturación lista: recibos e incluso factura electrónica DIAN cuando la necesitas.',
      ] },
      { h: 'A medida vs. genérico' },
      { p: 'Los POS genéricos te obligan a adaptar tu negocio al software. Un POS a medida hace lo contrario: se adapta a cómo trabajas tú. Un restaurante necesita cuentas abiertas y un visor de cocina; una tienda de uniformes necesita tallas y colegios; un bar necesita boletas de entrada. Forzar todo eso en una plantilla genérica termina en parches y frustración.' },
      { p: 'Eso no significa que un sistema a medida tenga que ser caro o eterno. La clave es construir exactamente lo que tu operación necesita —ni más, ni menos— y dejarlo crecer contigo.' },
      { h: '¿Cuándo es el momento?' },
      { p: 'Si ya te pasó perder una venta por no saber si tenías stock, si el cierre de caja te toma demasiado, o si no podrías decir cuál es tu producto estrella sin pensarlo mucho: ese es el momento. No esperes a que el desorden sea el que mande en tu negocio.' },
    ],
  },
  {
    slug: 'pagina-web-vs-solo-redes-sociales',
    tag: 'Web',
    date: 'May 2026',
    readTime: '4 min',
    title: 'Página web vs. solo redes sociales',
    excerpt: 'Por qué tener tu propio sitio te da credibilidad y clientes que las redes sociales no pueden darte.',
    intro: 'Instagram y WhatsApp son geniales para vender, y no te digo que los dejes. Pero apostar todo a las redes es construir tu negocio en terreno que no es tuyo. Una página web propia cambia esa ecuación.',
    body: [
      { h: 'En redes, tú no eres el dueño' },
      { p: 'Tu cuenta de Instagram no es tuya: es de Instagram. Si mañana cambian el algoritmo, te bloquean por error o simplemente tus seguidores dejan de ver tus historias, no hay a quién reclamarle. Llevas años construyendo audiencia sobre algo que no controlas.' },
      { p: 'Tu página web sí es tuya. Tu dominio, tu contenido, tus reglas. Nadie te baja el alcance ni te mete publicidad de la competencia al lado.' },
      { h: 'Credibilidad: el detalle que decide' },
      { p: 'Cuando alguien te va a comprar algo de cierto valor, te busca. Y si lo único que encuentra es un perfil con fotos, duda. Una página web con tu propio dominio, información clara y un diseño cuidado dice "esto es un negocio serio". Es la diferencia entre que te tomen en serio o que sigan buscando.' },
      { h: 'Te encuentran en Google' },
      { p: 'Nadie busca un producto en Instagram; lo busca en Google. Si no tienes página, no apareces. Una web bien hecha hace que cuando alguien busque "uniformes escolares en mi ciudad" o "restaurante en tal pueblo", tú estés ahí. Las redes no te dan eso.' },
      { h: 'No es uno u otro' },
      { p: 'La fórmula que funciona es: redes para conversar y mostrar el día a día, web para cerrar y dar confianza. Las redes traen gente; la web la convierte en cliente. Lo ideal es que tu web esté conectada a tu sistema, de modo que un pedido en línea entre directo a tu inventario y a tu caja, sin volver a teclear nada.' },
    ],
  },
  {
    slug: 'automatiza-tu-atencion-con-bots-de-whatsapp',
    tag: 'IA',
    date: 'Abr 2026',
    readTime: '4 min',
    title: 'Automatiza tu atención con bots de WhatsApp',
    excerpt: 'Responde a tus clientes 24/7 con automatización inteligente conectada a tu sistema.',
    intro: 'En Colombia, el cliente no te escribe por correo: te escribe por WhatsApp. Y espera respuesta ya. Un bot bien hecho atiende esas primeras preguntas al instante, a cualquier hora, sin que tú estés pegado al celular.',
    body: [
      { h: 'El cliente está en WhatsApp' },
      { p: 'No hay que convencer a nadie de usar WhatsApp: ya está ahí. El problema es que las preguntas llegan a toda hora —precios, horarios, "¿tienen tal cosa?", "¿ya salió mi pedido?"— y responderlas todas, todos los días, agota. Muchas ventas se pierden simplemente porque nadie contestó a tiempo.' },
      { h: 'Qué puede hacer un bot (bien hecho)' },
      { ul: [
        'Responder las preguntas frecuentes al instante: precios, ubicación, horarios, métodos de pago.',
        'Dar el estado de un pedido conectándose a tu sistema, sin que tú revises nada.',
        'Tomar datos de un pedido o una reserva y pasártelos ordenados.',
        'Avisar al cliente automáticamente cuando algo cambia ("tu pedido está listo").',
        'Pasarle la conversación a una persona cuando se necesita trato humano.',
      ] },
      { h: 'Conectado, no aislado' },
      { p: 'Un bot que solo manda mensajes prearmados se nota y cansa. El que sirve de verdad está conectado a tu sistema: sabe tu inventario, tus precios reales y el estado de los pedidos. Así no inventa ni te hace quedar mal; responde con tu información, en vivo.' },
      { h: 'No reemplaza a las personas, las libera' },
      { p: 'La idea no es robotizar tu negocio. Es que el bot se encargue de lo repetitivo —el 80% de mensajes que son siempre lo mismo— para que tú y tu equipo dediquen su tiempo a lo que de verdad necesita una persona: cerrar la venta importante, resolver el caso difícil, atender bien. Tecnología para que atiendas mejor, no menos.' },
    ],
  },
];

export function getPost(slug) {
  return posts.find((p) => p.slug === slug);
}
