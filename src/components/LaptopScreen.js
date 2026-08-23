'use client';
import DuckMark from '@/components/DuckMark';
import s from './LaptopScreen.module.css';

/* La UI que vive dentro de la pantalla del portátil 3D. Es DOM real,
   así que el texto se ve nítido a cualquier zoom y se traduce con el
   resto del sitio. Los datos son de demostración. */

const copy = {
  en: {
    nav: ['Dashboard', 'Projects', 'Clients', 'Sales', 'Products', 'Reports', 'Settings'],
    user: 'Julián', role: 'Developer',
    greeting: 'Welcome, Julián', greetingSub: "Let's keep building.",
    stats: [
      { label: 'Sales today', value: '$1,250,000', delta: '12.5%' },
      { label: 'Projects', value: '18', delta: '22%' },
      { label: 'Clients', value: '42', delta: '12%' },
      { label: 'Products', value: '128', delta: '8%' },
    ],
    chartTitle: 'Recent sales', chartBadge: '+18.3%',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    projectsTitle: 'Active projects',
    rows: [
      { name: 'Raloz Web', status: 'In progress', color: '#4ade80' },
      { name: 'Restaurant POS', status: 'In progress', color: '#4ade80' },
      { name: 'Inventory App', status: 'Testing', color: '#facc15' },
      { name: 'DuckMusic', status: 'Done', color: '#3b82f6', done: true },
    ],
    tagA: 'Software that powers', tagAccent: 'real business.',
  },
  es: {
    nav: ['Dashboard', 'Proyectos', 'Clientes', 'Ventas', 'Productos', 'Reportes', 'Configuración'],
    user: 'Julián', role: 'Desarrollador',
    greeting: 'Bienvenido, Julián', greetingSub: 'Sigamos construyendo.',
    stats: [
      { label: 'Ventas hoy', value: '$1.250.000', delta: '12,5%' },
      { label: 'Proyectos', value: '18', delta: '22%' },
      { label: 'Clientes', value: '42', delta: '12%' },
      { label: 'Productos', value: '128', delta: '8%' },
    ],
    chartTitle: 'Ventas recientes', chartBadge: '+18,3%',
    months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
    projectsTitle: 'Proyectos activos',
    rows: [
      { name: 'Raloz Web', status: 'En progreso', color: '#4ade80' },
      { name: 'POS Restaurante', status: 'En progreso', color: '#4ade80' },
      { name: 'App Inventario', status: 'Testing', color: '#facc15' },
      { name: 'DuckMusic', status: 'Completado', color: '#3b82f6', done: true },
    ],
    tagA: 'Software que impulsa negocios', tagAccent: 'reales.',
  },
};

// Serie de la gráfica en un viewBox de 560×150. Se declara una sola vez
// para que la línea, el área y el punto de pico compartan el recorrido.
const POINTS = [
  [0, 122], [40, 108], [80, 118], [120, 92], [160, 104], [200, 74],
  [240, 88], [280, 58], [320, 76], [360, 44], [400, 62], [440, 34],
  [480, 48], [520, 20], [560, 8],
];
const LINE_PATH = POINTS.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
const AREA_PATH = `${LINE_PATH} L560 150 L0 150 Z`;
const PEAK = POINTS[POINTS.length - 2];

// Destellos diagonales del panel de marca, como en el render de referencia.
const STREAKS = [
  { top: '30%', left: '-14%', width: '72%', rotate: '-26deg' },
  { top: '46%', left: '38%', width: '78%', rotate: '-18deg' },
  { top: '17%', left: '30%', width: '58%', rotate: '22deg' },
  { top: '58%', left: '-6%', width: '52%', rotate: '14deg' },
];

export default function LaptopScreen({ lang = 'es' }) {
  const t = copy[lang] ?? copy.es;

  return (
    <div className={s.app}>
      <div className={s.topbar}>
        <span className={s.brand}>
          <span className={s.brandMark}>
            <DuckMark className="h-4 w-4 text-white" />
          </span>
          Duck<em>lab</em>
        </span>
        <span className={s.topActions}>
          <span className={s.iconBtn}><span className={s.iconDot} /></span>
          <span className={s.iconBtn} />
          <span className={s.user}>
            <span className={s.avatar} />
            <span>
              <span className={s.userName} style={{ display: 'block' }}>{t.user}</span>
              <span className={s.userRole}>{t.role}</span>
            </span>
          </span>
        </span>
      </div>

      <div className={s.body}>
        <nav className={s.sidebar}>
          {t.nav.map((item, i) => (
            <span key={item} className={`${s.navItem} ${i === 0 ? s.navItemActive : ''}`}>
              <span className={s.navIcon} />
              {item}
            </span>
          ))}
        </nav>

        <div className={s.main}>
          <div className={s.col}>
            <div>
              <div className={s.greeting}>{t.greeting}</div>
              <div className={s.greetingSub}>{t.greetingSub}</div>
            </div>

            <div className={s.stats}>
              {t.stats.map((stat) => (
                <div key={stat.label} className={s.stat}>
                  <div className={s.statLabel}>{stat.label}</div>
                  <div className={s.statValue}>{stat.value}</div>
                  <div className={s.statDelta}>↑ {stat.delta}</div>
                </div>
              ))}
            </div>

            <div className={s.panels}>
              <div className={s.panel}>
                <div className={s.panelHead}>
                  <span className={s.panelTitle}>{t.chartTitle}</span>
                  <span className={s.panelBadge}>{t.chartBadge}</span>
                </div>
                <div className={s.chartWrap}>
                  <svg className={s.chart} viewBox="0 0 560 150" preserveAspectRatio="none" aria-hidden="true">
                    <defs>
                      <linearGradient id="ducklabArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.42" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[30, 70, 110].map((y) => (
                      <line key={y} className={s.chartGrid} x1="0" y1={y} x2="560" y2={y} />
                    ))}
                    <path className={s.chartArea} d={AREA_PATH} />
                    <path className={s.chartLine} d={LINE_PATH} />
                    <circle className={s.chartPeak} cx={PEAK[0]} cy={PEAK[1]} r="5" />
                  </svg>
                  <div className={s.months}>
                    {t.months.map((m) => <span key={m}>{m}</span>)}
                  </div>
                </div>
              </div>

              <div className={s.panel}>
                <div className={s.panelHead}>
                  <span className={s.panelTitle}>{t.projectsTitle}</span>
                </div>
                <div className={s.rows}>
                  {t.rows.map((row) => (
                    <div key={row.name} className={s.row}>
                      <span className={s.rowDot} style={{ background: row.color, boxShadow: `0 0 8px ${row.color}` }} />
                      <span className={s.rowName}>{row.name}</span>
                      <span className={`${s.pill} ${row.done ? s.pillDone : ''}`}>{row.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Panel de marca: el mismo lenguaje visual del hero, dentro de la pantalla */}
          <div className={s.brandRail}>
            {STREAKS.map((st, i) => (
              <span
                key={i}
                className={s.streak}
                style={{ top: st.top, left: st.left, width: st.width, transform: `rotate(${st.rotate})` }}
              />
            ))}
            <span className={s.railMark}>
              <DuckMark className="h-14 w-14 text-[#ff6b6b]" eye="#2b0d10" />
            </span>
            <span className={s.railTag}>
              {t.tagA} <em>{t.tagAccent}</em>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
