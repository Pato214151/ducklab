/** Política de cookies. */

import LegalLayout from '@/components/LegalLayout';

export const metadata = { title: 'Política de Cookies | Ducklab' };

export default function Cookies() {
  return (
    <LegalLayout title="Política de Cookies" updated="19 de junio de 2026">
      <p>
        Usamos la mínima cantidad de cookies posible: solo las necesarias para que el portal funcione.
        Por eso no verás un banner de consentimiento: las cookies estrictamente necesarias no requieren
        tu autorización previa.
      </p>

      <h2>1. Cookies que usamos</h2>
      <p>
        Una única cookie de <strong>sesión</strong> (esencial), que mantiene tu inicio de sesión
        activo y seguro mientras usas el portal. Es del tipo HttpOnly (no accesible desde scripts) y
        caduca a los 7 días.
      </p>

      <h2>2. Cookies que NO usamos</h2>
      <p>
        No usamos cookies de publicidad, de seguimiento entre sitios ni de terceros para perfilarte.
      </p>

      <h2>3. Control</h2>
      <p>
        Puedes borrar las cookies desde tu navegador en cualquier momento. Ten en cuenta que si
        borras la cookie de sesión, tendrás que volver a iniciar sesión.
      </p>

      <h2>4. Contacto</h2>
      <p>
        ¿Dudas? Escríbenos a <a href="mailto:jramirezramirez2005@gmail.com">jramirezramirez2005@gmail.com</a>.
      </p>
    </LegalLayout>
  );
}
