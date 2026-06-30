import LegalLayout from '@/components/LegalLayout';

export const metadata = { title: 'Política de Privacidad | Ducklab' };

export default function Privacidad() {
  return (
    <LegalLayout title="Política de Privacidad" updated="12 de junio de 2026">
      <p>
        En Ducklab respetamos tu privacidad. Esta política explica qué datos recogemos, para qué y
        qué derechos tienes sobre ellos.
      </p>

      <h2>1. Qué datos recogemos</h2>
      <p>
        Para tu cuenta de cliente: nombre, correo electrónico y la información de los sistemas que
        te desarrollamos (versiones, estado, pagos y tickets de soporte). No recogemos datos que no
        necesitemos para prestarte el servicio.
      </p>

      <h2>2. Para qué los usamos</h2>
      <p>
        Únicamente para darte acceso a tu portal, entregarte actualizaciones, gestionar tus pagos y
        brindarte soporte. <strong>No vendemos ni compartimos tus datos</strong> con terceros para
        fines comerciales.
      </p>

      <h2>3. Seguridad</h2>
      <p>
        Las contraseñas se guardan cifradas (bcrypt) y nunca en texto plano. Las sesiones usan
        tokens firmados en cookies seguras. El acceso al portal está protegido y aislado por cliente.
      </p>

      <h2>4. Tus derechos</h2>
      <p>
        Puedes solicitar acceso, corrección o eliminación de tus datos en cualquier momento
        escribiendo a <a href="mailto:jramirezramirez2005@gmail.com">jramirezramirez2005@gmail.com</a>.
      </p>

      <h2>5. Conservación</h2>
      <p>
        Conservamos tus datos mientras tengas una relación activa con nosotros. Si cierras tu
        cuenta, los eliminamos salvo lo que la ley nos obligue a conservar (p. ej. facturación).
      </p>
    </LegalLayout>
  );
}
