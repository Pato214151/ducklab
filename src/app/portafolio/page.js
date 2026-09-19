/** Página /portafolio (el contenido está en PortfolioContent). */

import PortfolioContent from './PortfolioContent';

export const metadata = {
  title: 'Portfolio | Ducklab',
  description: 'Three production systems designed, built, and maintained by Julián Ramírez — Raloz, Ducklab, and Pocitos Azufrados.',
};

export default function Portafolio() {
  return <PortfolioContent />;
}
