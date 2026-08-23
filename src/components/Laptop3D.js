'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import DuckMark from '@/components/DuckMark';
import LaptopScreen from '@/components/LaptopScreen';
import RoboticArm from '@/components/RoboticArm';
import s from './Laptop3D.module.css';

/* ─────────────────────────────────────────────────────────────
   Portátil interactivo del hero.

   El equipo se construye con transformaciones CSS 3D: la pantalla es
   DOM real, así que el dashboard se ve nítido a cualquier zoom y se
   traduce junto al resto del sitio. En pantallas grandes se le suma
   `RoboticArm`, una capa WebGL que dibuja el brazo que lo sostiene;
   las dos comparten proyección y giran juntas (ver ese archivo).

   Interacción:
     · arrastrar (ratón o dedo) → gira el equipo
     · rueda / pellizco vertical → acerca y aleja
     · mover el cursor → el equipo lo sigue ligeramente
     · doble clic → vuelve a la posición inicial
   ───────────────────────────────────────────────────────────── */

// Pose de reposo, en grados.
const REST = { rx: -14, ry: -26, lid: 12 };
// Pose de arranque: más lejos, más girado y con la tapa casi cerrada.
const INTRO = { rx: -34, ry: -64, lid: 94, zoom: 0.5 };

const ZOOM_MIN = 0.55;
const ZOOM_MAX = 2.1;
const RX_MIN = -68;
const RX_MAX = 32;
// Cuánto puede desviar el cursor la pose de reposo (grados).
const FOLLOW_RY = 13;
const FOLLOW_RX = 7;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// Safari 13 y anteriores sólo tienen addListener/removeListener en
// MediaQueryList. Sin esto, un addEventListener lanza y se cae el efecto
// entero: el portátil quedaría congelado en la pose de arranque.
function onMedia(mq, handler) {
  if (mq.addEventListener) {
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }
  mq.addListener(handler);
  return () => mq.removeListener(handler);
}

// Debe coincidir con `perspective` de .scene en el módulo CSS: es lo que
// permite que la capa WebGL del brazo comparta proyección con el CSS 3D.
const PERSPECTIVE = 1700;

const KEY_ROWS = [
  Array(15).fill(1),
  Array(15).fill(1),
  Array(15).fill(1),
  Array(15).fill(1),
  [2, 1, 1, 7, 1, 1, 2],
];

const copy = {
  en: {
    drag: 'Drag to explore',
    zoom: 'Scroll or ⌘ + scroll to zoom',
    reset: 'Double-click to reset',
    hotspots: [
      { id: 'screen', x: 62, y: 34, title: 'Your live dashboard', text: 'Real-time sales, stock and clients — the same portal your team uses every day.' },
      { id: 'keys', x: 56, y: 70, title: 'Desktop app', text: 'Native Windows software, built to keep working even when the internet does not.' },
      { id: 'shell', x: 26, y: 76, title: 'Built by Ducklab', text: 'Designed, developed and maintained end to end. No middlemen.' },
    ],
  },
  es: {
    drag: 'Arrastra para explorar',
    zoom: 'Scroll o Ctrl + scroll para zoom',
    reset: 'Doble clic para reiniciar',
    hotspots: [
      { id: 'screen', x: 62, y: 34, title: 'Tu dashboard en vivo', text: 'Ventas, inventario y clientes en tiempo real — el mismo portal que usa tu equipo a diario.' },
      { id: 'keys', x: 56, y: 70, title: 'App de escritorio', text: 'Software nativo para Windows, pensado para seguir funcionando aunque se caiga internet.' },
      { id: 'shell', x: 26, y: 76, title: 'Hecho por Ducklab', text: 'Diseñado, desarrollado y mantenido de principio a fin. Sin intermediarios.' },
    ],
  },
};

export default function Laptop3D({ lang = 'es' }) {
  const t = copy[lang] ?? copy.es;

  const sceneRef = useRef(null);
  const rigRef = useRef(null);
  const lidRef = useRef(null);
  const hotspotsRef = useRef(null);
  const armApi = useRef(null);
  // El bucle se duerme solo; esto deja despertarlo desde fuera del efecto.
  const wakeRef = useRef(null);
  const [touched, setTouched] = useState(false);
  // El brazo son 816 KB + WebGL, cargados en idle. Se omite si el usuario
  // pidió menos movimiento o si el equipo es de gama muy baja.
  const [showArm, setShowArm] = useState(false);

  // Todo el estado de animación vive en un ref: el bucle rAF escribe
  // directamente en el DOM, así que girar el portátil no provoca ni un
  // solo re-render de React.
  const anim = useRef({
    // pose actual (la que se pinta) y objetivo (a la que tiende)
    cur: { rx: INTRO.rx, ry: INTRO.ry, lid: INTRO.lid, zoom: INTRO.zoom },
    tgt: { rx: REST.rx, ry: REST.ry, lid: INTRO.lid, zoom: 1 },
    drag: { rx: REST.rx, ry: REST.ry }, // acumulado por arrastre
    follow: { rx: 0, ry: 0 },           // desvío por posición del cursor
    userZoom: 1,
    fit: 1,
    dragging: false,
    visible: true,
    active: false,   // el usuario ya agarró el modelo → la rueda hace zoom
    last: { x: 0, y: 0 },
    reduced: false,
    raf: 0,
  });

  const resetPose = useCallback(() => {
    const a = anim.current;
    a.drag.rx = REST.rx;
    a.drag.ry = REST.ry;
    a.userZoom = 1;
  }, []);

  useEffect(() => {
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Ahora que el bucle se duerme, el brazo no cuesta nada en reposo y
    // también se muestra en móvil. Sólo se salta en equipos de gama muy
    // baja, donde el contexto WebGL sí pesa.
    const flojo = (navigator.deviceMemory ?? 8) < 4 || (navigator.hardwareConcurrency ?? 8) < 4;
    const decide = () => setShowArm(!calm.matches && !flojo);

    // three.js es un chunk aparte de ~660 KB: se pide cuando el navegador
    // está ocioso, para no competir con el primer pintado del hero ni con
    // las fuentes. El portátil ya se ve mientras tanto.
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(decide, { timeout: 2500 })
      : window.setTimeout(decide, 1200);

    const offCalm = onMedia(calm, decide);
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      offCalm();
    };
  }, []);

  useEffect(() => {
    const a = anim.current;
    const scene = sceneRef.current;
    const rig = rigRef.current;
    const lid = lidRef.current;
    if (!scene || !rig || !lid) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    a.reduced = motionQuery.matches;

    // ── Escala responsive: el modelo mide ~720px de ancho, lo ajustamos
    //    al contenedor para que nunca se salga por los lados.
    const fitToBox = () => {
      const { width, height } = scene.getBoundingClientRect();
      a.fit = clamp(Math.min(width / 880, height / 700), 0.32, 1);
      startLoop();
    };
    fitToBox();
    const observer = new ResizeObserver(fitToBox);
    observer.observe(scene);

    if (a.reduced) {
      // Sin animación de entrada: se pinta directamente en reposo.
      a.cur = { rx: REST.rx, ry: REST.ry, lid: REST.lid, zoom: a.fit };
      a.tgt.lid = REST.lid;
    }

    // La tapa se abre un instante después de que el equipo entre en escena.
    const lidTimer = window.setTimeout(() => { a.tgt.lid = REST.lid; startLoop(); }, a.reduced ? 0 : 380);

    // ── Bucle de animación ──
    // Sólo corre mientras algo se mueve. En cuanto la pose se asienta se
    // detiene solo y no vuelve hasta que haya interacción: dejarlo girando
    // a 60 fps contra un objetivo fijo era gasto puro, y en móvil —donde
    // ni siquiera hay cursor que seguir— se notaba como lentitud.
    const EPS = 0.02;
    // Declaradas con `function` a propósito: se izan, y así `fitToBox()`
    // —que corre más arriba— ya puede despertar el bucle.
    function startLoop() {
      if (!a.raf && a.visible) a.raf = window.requestAnimationFrame(frame);
    }
    function frame() {
      a.tgt.rx = clamp(a.drag.rx + a.follow.rx, RX_MIN, RX_MAX);
      a.tgt.ry = a.drag.ry + a.follow.ry;
      a.tgt.zoom = a.fit * a.userZoom;

      const k = a.dragging ? 0.32 : 0.1;
      a.cur.rx += (a.tgt.rx - a.cur.rx) * k;
      a.cur.ry += (a.tgt.ry - a.cur.ry) * k;
      a.cur.zoom += (a.tgt.zoom - a.cur.zoom) * k;
      a.cur.lid += (a.tgt.lid - a.cur.lid) * 0.105;

      rig.style.setProperty('--rx', `${a.cur.rx.toFixed(3)}deg`);
      rig.style.setProperty('--ry', `${a.cur.ry.toFixed(3)}deg`);
      rig.style.setProperty('--zoom', a.cur.zoom.toFixed(4));
      lid.style.setProperty('--lid', `${a.cur.lid.toFixed(3)}deg`);

      // Los rótulos sólo tienen sentido en la pose de reposo: se
      // desvanecen en cuanto el equipo se gira.
      if (hotspotsRef.current) {
        const off = Math.hypot(a.cur.ry - REST.ry, a.cur.rx - REST.rx);
        hotspotsRef.current.style.opacity = clamp(1 - off / 26, 0, 1).toFixed(3);
        hotspotsRef.current.style.pointerEvents = off > 14 ? 'none' : 'auto';
      }

      // El brazo se pinta en el mismo fotograma que el CSS para que las
      // dos capas nunca queden desfasadas.
      armApi.current?.render(a.cur.rx, a.cur.ry, a.cur.zoom);

      const quieto =
        !a.dragging &&
        Math.abs(a.tgt.rx - a.cur.rx) < EPS &&
        Math.abs(a.tgt.ry - a.cur.ry) < EPS &&
        Math.abs(a.tgt.lid - a.cur.lid) < EPS &&
        Math.abs(a.tgt.zoom - a.cur.zoom) < EPS / 100;

      if (quieto) {
        // Se cuadra en el objetivo exacto para no quedar a medio píxel.
        a.cur.rx = a.tgt.rx;
        a.cur.ry = a.tgt.ry;
        a.cur.lid = a.tgt.lid;
        a.cur.zoom = a.tgt.zoom;
        a.raf = 0;
        return;
      }

      a.raf = window.requestAnimationFrame(frame);
    }
    a.visible = true;
    wakeRef.current = startLoop;
    startLoop();

    // Con WebGL en juego, seguir pintando el hero fuera de pantalla es
    // gasto puro de batería: el bucle se pausa al salir del viewport.
    const visibility = new IntersectionObserver(([entry]) => {
      a.visible = entry.isIntersecting;
      if (a.visible) {
        startLoop();
      } else if (a.raf) {
        window.cancelAnimationFrame(a.raf);
        a.raf = 0;
      }
    }, { rootMargin: '120px' });
    visibility.observe(scene);

    // ── Arrastre ──
    const onPointerDown = (e) => {
      if (e.button != null && e.button !== 0) return;
      a.dragging = true;
      a.active = true;
      a.last = { x: e.clientX, y: e.clientY };
      setTouched(true);
      startLoop();
      scene.setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e) => {
      if (!a.dragging) return;
      const dx = e.clientX - a.last.x;
      const dy = e.clientY - a.last.y;
      a.last = { x: e.clientX, y: e.clientY };
      a.drag.ry += dx * 0.38;
      a.drag.rx = clamp(a.drag.rx - dy * 0.26, RX_MIN, RX_MAX);
      startLoop();
    };
    const endDrag = (e) => {
      if (!a.dragging) return;
      a.dragging = false;
      scene.releasePointerCapture?.(e.pointerId);
    };

    scene.addEventListener('pointerdown', onPointerDown);
    scene.addEventListener('pointermove', onPointerMove);
    scene.addEventListener('pointerup', endDrag);
    scene.addEventListener('pointercancel', endDrag);

    // ── Seguimiento del cursor ──
    const onWindowMove = (e) => {
      if (a.dragging || a.reduced) return;
      const r = scene.getBoundingClientRect();
      const nx = clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2), -1, 1);
      const ny = clamp((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2), -1, 1);
      a.follow.ry = nx * FOLLOW_RY;
      a.follow.rx = -ny * FOLLOW_RX;
      startLoop();
    };
    window.addEventListener('pointermove', onWindowMove, { passive: true });

    // ── Zoom con rueda ──
    // Sólo se activa cuando el usuario ya agarró el portátil (o mantiene
    // Ctrl/⌘). Si no, la rueda sigue haciendo scroll normal de la página:
    // secuestrar el scroll de un hero es la forma más rápida de atrapar
    // a quien sólo quería bajar a ver los servicios.
    const onWheel = (e) => {
      if (!a.active && !e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      a.userZoom = clamp(a.userZoom * (1 - e.deltaY * 0.0014), ZOOM_MIN, ZOOM_MAX);
      setTouched(true);
      startLoop();
    };
    scene.addEventListener('wheel', onWheel, { passive: false });

    // Al salir del hero se suelta el zoom con rueda para no atrapar el scroll.
    const onPointerLeave = () => { if (!a.dragging) a.active = false; };
    scene.addEventListener('pointerleave', onPointerLeave);

    const onDoubleClick = () => { resetPose(); startLoop(); };
    scene.addEventListener('dblclick', onDoubleClick);

    const offMotion = onMedia(motionQuery, (e) => { a.reduced = e.matches; });

    return () => {
      window.cancelAnimationFrame(a.raf);
      window.clearTimeout(lidTimer);
      observer.disconnect();
      visibility.disconnect();
      wakeRef.current = null;
      scene.removeEventListener('pointerdown', onPointerDown);
      scene.removeEventListener('pointermove', onPointerMove);
      scene.removeEventListener('pointerup', endDrag);
      scene.removeEventListener('pointercancel', endDrag);
      scene.removeEventListener('wheel', onWheel);
      scene.removeEventListener('dblclick', onDoubleClick);
      scene.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('pointermove', onWindowMove);
      offMotion();
    };
  }, [resetPose]);

  return (
    <div className={s.wrap}>
      <div className={s.glow} />

      <div
        ref={sceneRef}
        className={s.scene}
        role="img"
        aria-label={
          lang === 'en'
            ? 'Interactive 3D laptop showing the Ducklab dashboard'
            : 'Portátil 3D interactivo mostrando el dashboard de Ducklab'
        }
      >
        {/* Capa WebGL con el brazo, detrás del portátil CSS */}
        {showArm && (
          <RoboticArm
            apiRef={armApi}
            perspective={PERSPECTIVE}
            sceneRef={sceneRef}
            /* El modelo llega tarde: si el bucle ya se durmió, hay que
               pedirle un fotograma o el brazo nunca se pintaría. */
            onReady={() => wakeRef.current?.()}
          />
        )}

        <div
          ref={rigRef}
          className={s.rig}
          /* Pose de arranque en línea: garantiza que la animación de
             entrada empiece siempre desde aquí, sin un fotograma suelto
             en la pose de reposo. */
          style={{ '--rx': `${INTRO.rx}deg`, '--ry': `${INTRO.ry}deg`, '--zoom': INTRO.zoom }}
        >
          <div className={s.model}>
            <div className={s.shadow} />
            <div className={s.ringOuter} />
            <div className={s.ringInner} />

            {/* ── Base / teclado ── */}
            <div className={`${s.box} ${s.baseBox}`}>
              <div className={`${s.face} ${s.baseBottom}`} />
              <div className={`${s.face} ${s.baseBack} ${s.shellEdge}`} />
              <div className={`${s.face} ${s.baseLeft} ${s.shellSide}`} />
              <div className={`${s.face} ${s.baseRight} ${s.shellSide}`} />
              <div className={`${s.face} ${s.baseFront}`} />
              <div className={`${s.face} ${s.baseTop}`}>
                <div className={s.keyboard}>
                  {KEY_ROWS.map((row, r) =>
                    row.map((span, i) => (
                      <span
                        key={`${r}-${i}`}
                        className={`${s.key} ${span > 1 ? s.keyWide : ''} ${r === 0 && i === row.length - 1 ? s.keyAccent : ''}`}
                        style={span > 1 ? { gridColumn: `span ${span}` } : undefined}
                      />
                    ))
                  )}
                </div>
                <div className={s.trackpad} />
              </div>
            </div>

            <div className={s.hinge} />

            {/* ── Tapa / pantalla ── */}
            <div ref={lidRef} className={s.lidHinge} style={{ '--lid': `${INTRO.lid}deg` }}>
              <div className={`${s.box} ${s.lidBox}`}>
                <div className={`${s.face} ${s.lidTop} ${s.shellEdge}`} />
                <div className={`${s.face} ${s.lidBottom} ${s.shellEdge}`} />
                <div className={`${s.face} ${s.lidLeft} ${s.shellSide}`} />
                <div className={`${s.face} ${s.lidRight} ${s.shellSide}`} />
                <div className={`${s.face} ${s.lidBack}`}>
                  <span className={s.backLogo}>
                    <span className={s.backLogoMark}>
                      <DuckMark className="h-8 w-8 text-white" />
                    </span>
                    <span className={s.backLogoText}>Duck<em>lab</em></span>
                  </span>
                </div>
                <div className={`${s.face} ${s.lidFront}`}>
                  <div className={s.screen}>
                    <div className={s.screenScale}>
                      <LaptopScreen lang={lang} />
                    </div>
                    <div className={s.glass} />
                  </div>
                  <span className={s.notch}><DuckMark className="h-4 w-4" eye="#0a0a0c" />Ducklab</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rótulos sobre el equipo. Viven en 2D para que el texto siempre
            se lea de frente; se ocultan solos al girar el modelo. */}
        <div ref={hotspotsRef} style={{ position: 'absolute', inset: 0 }}>
          {t.hotspots.map((h) => (
            <button
              key={h.id}
              type="button"
              className={s.hotspot}
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              aria-label={`${h.title}: ${h.text}`}
            >
              <span className={s.tip}>
                <span className={s.tipTitle}>{h.title}</span>
                <span className={s.tipText}>{h.text}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className={`${s.hint} ${touched ? s.hintFaded : ''}`}>
        <span className={s.hintItem}><span className={s.hintDot} />{t.drag}</span>
        <span className={`${s.hintItem} ${s.hintDesktopOnly}`}><span className={s.hintDot} />{t.zoom}</span>
        <span className={`${s.hintItem} ${s.hintDesktopOnly}`}><span className={s.hintDot} />{t.reset}</span>
      </p>
    </div>
  );
}
