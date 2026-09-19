/** Página /demo (el contenido está en DemoContent). */

import DemoContent from './DemoContent';

export const metadata = {
  title: 'How It Works | Ducklab',
  description: 'See exactly how we build, deliver and support your custom restaurant system — step by step.',
};

export default function Demo() {
  return <DemoContent />;
}
