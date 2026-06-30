import LegalLayout from '@/components/LegalLayout';

export const metadata = { title: 'Términos y Condiciones | Ducklab' };

export default function Terminos() {
  return (
    <LegalLayout title="Términos y Condiciones" updated="19 de junio de 2026">
      <p>
        Estos términos regulan el uso de los servicios de desarrollo de software y del portal de
        clientes de Ducklab. Al contratar un servicio o usar el portal, aceptas lo aquí descrito.
      </p>

      <h2>1. Servicios</h2>
      <p>
        Ducklab desarrolla software a medida (páginas web, sistemas POS, aplicaciones de escritorio,
        bots de WhatsApp y automatizaciones). El alcance, los entregables y los tiempos de cada
        proyecto se acuerdan por escrito antes de iniciar.
      </p>

      <h2>2. Pagos</h2>
      <p>
        Los precios de cada plan se informan antes de contratar. Los proyectos son de pago único y
        los planes de mantenimiento son mensuales. Los trabajos de complejidad especial se cotizan
        aparte. No hay costos ocultos.
      </p>

      <h2>3. Entrega</h2>
      <p>
        Una vez completado el pago, el cliente recibe <strong>todos los archivos y entregables</strong>
        del proyecto, y se le indica dónde puede publicarse o desplegarse el sistema (servidores,
        dominios o plataformas compatibles). A partir de ese momento el cliente puede usar y publicar
        su software.
      </p>

      <h2>4. Propiedad y licencias</h2>
      <p>
        Al completar el pago, el cliente recibe los derechos de uso del software entregado. Las
        herramientas, librerías y componentes de terceros mantienen sus propias licencias.
      </p>

      <h2>5. Soporte y garantía</h2>
      <p>
        Los planes de mantenimiento incluyen corrección de errores, actualizaciones de seguridad,
        copias de respaldo y soporte prioritario. La garantía cubre fallos del software entregado,
        no cambios de alcance ni mal uso.
      </p>

      <h2>6. Alojamiento y publicación en la nube</h2>
      <p>
        Mantener tu sistema publicado y en línea (alojamiento en la nube, en proveedores como
        Cloudflare, Vercel, Render u otros) <strong>no está incluido en el precio de compra</strong> del
        proyecto. Es un servicio aparte que forma parte de los planes de mantenimiento; el cliente
        elige libremente el plan que prefiera según sus necesidades.
      </p>

      <h2>7. Responsabilidad</h2>
      <p>
        Ducklab no se hace responsable por pérdidas derivadas de un uso indebido del software, de
        servicios de terceros (hosting, pasarelas de pago) o de causas fuera de su control.
      </p>

      <h2>8. Contacto</h2>
      <p>
        Para cualquier duda sobre estos términos, escríbenos a <a href="mailto:jramirezramirez2005@gmail.com">jramirezramirez2005@gmail.com</a>.
      </p>
    </LegalLayout>
  );
}
