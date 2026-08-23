'use client';
import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────
   RoboticArm — capa WebGL con el brazo robótico que sostiene el
   portátil CSS 3D del hero.

   El truco para que las dos capas no se despeguen es que compartan
   proyección: la cámara de three.js reproduce exactamente el
   `perspective` del contenedor CSS (cámara a esa distancia del origen
   y FOV derivado de la altura de la escena), y el mismo giro se aplica
   a un pivote en el origen, igual que hace `.rig` en la hoja de
   estilos. Con eso el portátil sigue apoyado en la palma incluso
   girando 360°.

   El mundo se mide en píxeles CSS con el origen en el centro de la
   escena. CSS mide +Y hacia abajo y three.js hacia arriba, de ahí los
   signos invertidos al posicionar.

   El modelo es el .glb de Meshy ya optimizado: 323 k → 23 k triángulos
   y sin texturas (se repinta en cromo negro), 19 MB → 816 KB.
   ───────────────────────────────────────────────────────────── */

// Pose base del modelo, en grados. El .glb viene con los dedos hacia +Y:
// Z lo tumba hasta la horizontal y X lo voltea para dejar la palma arriba.
const ARM_ROT = { x: 180, y: 0, z: -132 };
const ARM_SCALE = 780;
// Dónde debe quedar el centro de la palma, en píxeles y coordenadas CSS
// (+Y hacia abajo). La base del portátil apoya alrededor de y≈190.
const PALM_TARGET = { x: 30, y: 250, z: 60 };

const DEG = Math.PI / 180;

// La mano ocupa el extremo +Y del modelo. El centroide de ese 22 % superior
// da un ancla estable para la palma sin depender de números mágicos.
function findPalm(mesh, Vector3) {
  const pos = mesh.geometry.attributes.position;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const cut = maxY - (maxY - minY) * 0.22;
  let cx = 0;
  let cy = 0;
  let cz = 0;
  let n = 0;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y < cut) continue;
    cx += pos.getX(i);
    cy += y;
    cz += pos.getZ(i);
    n++;
  }
  return new Vector3(cx / n, cy / n, cz / n);
}

export default function RoboticArm({ apiRef, perspective, sceneRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = sceneRef.current;
    if (!canvas || !host) return;

    let disposed = false;
    let cleanup = () => {};

    // three.js son ~600 KB: se carga aparte para no entrar en el bundle
    // inicial ni retrasar el primer pintado del hero.
    (async () => {
      let THREE;
      let GLTFLoader;
      let RoomEnvironment;
      try {
        [THREE, { GLTFLoader }, { RoomEnvironment }] = await Promise.all([
          import('three'),
          import('three/examples/jsm/loaders/GLTFLoader.js'),
          import('three/examples/jsm/environments/RoomEnvironment.js'),
        ]);
      } catch {
        return; // sin WebGL el hero se queda con el portátil solo
      }
      if (disposed) return;

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      } catch {
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      const scene = new THREE.Scene();
      // Un material metálico sin entorno que reflejar se ve negro plano.
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envRT.texture;
      scene.environmentIntensity = 0.55;

      const camera = new THREE.PerspectiveCamera(30, 1, 10, 20000);

      // Luces: contra rojo de marca a un lado, relleno frío al otro.
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      const key = new THREE.DirectionalLight(0xffffff, 1.5);
      key.position.set(600, 900, 800);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xff2b33, 6);
      rim.position.set(-800, 200, -400);
      scene.add(rim);
      const underGlow = new THREE.PointLight(0xff2b33, 11, 1600, 2);
      underGlow.position.set(150, 120, 300);
      scene.add(underGlow);
      const fill = new THREE.DirectionalLight(0x8aa0ff, 0.45);
      fill.position.set(-400, -300, 600);
      scene.add(fill);

      // El pivote replica a `.rig`: gira y escala alrededor del origen.
      const pivot = new THREE.Group();
      scene.add(pivot);

      const resize = () => {
        const { width, height } = host.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        // Reproduce el `perspective` de CSS: cámara a esa distancia del
        // plano z=0 y FOV tal que la altura de la escena encaje exacta.
        camera.position.set(0, 0, perspective);
        camera.fov = (2 * Math.atan(height / 2 / perspective)) / DEG;
        camera.updateProjectionMatrix();
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(host);

      new GLTFLoader().load(
        '/models/robotic-arm.glb',
        (gltf) => {
          if (disposed) return;
          const arm = gltf.scene;
          let mesh = null;
          arm.traverse((o) => {
            if (!o.isMesh) return;
            mesh = o;
            o.material.dispose();
            o.material = new THREE.MeshPhysicalMaterial({
              color: 0x111114,
              metalness: 0.9,
              roughness: 0.25,
              clearcoat: 1,
              clearcoatRoughness: 0.08,
            });
          });
          if (!mesh) return;

          arm.scale.setScalar(ARM_SCALE);
          arm.rotation.set(ARM_ROT.x * DEG, ARM_ROT.y * DEG, ARM_ROT.z * DEG);
          // Se posiciona por la palma, no por el origen del modelo.
          const palm = findPalm(mesh, THREE.Vector3)
            .multiplyScalar(ARM_SCALE)
            .applyEuler(arm.rotation);
          arm.position.set(
            PALM_TARGET.x - palm.x,
            -PALM_TARGET.y - palm.y,
            PALM_TARGET.z - palm.z
          );
          pivot.add(arm);
          canvas.style.opacity = '1';
        },
        undefined,
        () => {} // si el modelo no carga, el hero funciona igual sin brazo
      );

      // Sin bucle propio: Laptop3D llama a `render` desde su rAF, así las
      // dos capas se pintan en el mismo fotograma y nunca se desfasan.
      apiRef.current = {
        render(rx, ry, zoom) {
          // Equivalencias con CSS: rotateX(a) → -a, rotateY(b) → +b, y el
          // orden XYZ por defecto da Rx·Ry, igual que en la hoja de estilos.
          pivot.rotation.set(-rx * DEG, ry * DEG, 0);
          pivot.scale.setScalar(zoom);
          renderer.render(scene, camera);
        },
      };

      cleanup = () => {
        observer.disconnect();
        apiRef.current = null;
        envRT.dispose();
        pmrem.dispose();
        scene.traverse((o) => {
          if (!o.isMesh) return;
          o.geometry.dispose();
          o.material.dispose();
        });
        renderer.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [apiRef, perspective, sceneRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0,
        transition: 'opacity 900ms ease',
      }}
    />
  );
}
