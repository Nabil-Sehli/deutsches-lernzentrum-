import { useEffect, useState, useMemo, useRef, useCallback, Suspense } from "react";
import type { ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Line, Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { germanStates, type GermanState } from "@/data/german-states";

const GEO_URL = "/data/germany-states.geo.json";

const STATE_IDS: Record<string, string> = {
  "Baden-Württemberg": "baden-wuerttemberg",
  Bayern: "bavaria",
  Berlin: "berlin",
  Brandenburg: "brandenburg",
  Bremen: "bremen",
  Hamburg: "hamburg",
  Hessen: "hesse",
  "Mecklenburg-Vorpommern": "mecklenburg-vorpommern",
  Niedersachsen: "lower-saxony",
  "Nordrhein-Westfalen": "north-rhine-westphalia",
  "Rheinland-Pfalz": "rhineland-palatinate",
  Saarland: "saarland",
  Sachsen: "saxony",
  "Sachsen-Anhalt": "saxony-anhalt",
  "Schleswig-Holstein": "schleswig-holstein",
  Thüringen: "thuringia",
};

const CITIES = [
  { name: "Berlin", lng: 13.405, lat: 52.52, label: "Berlin" },
  { name: "München", lng: 11.582, lat: 48.135, label: "München" },
  { name: "Frankfurt", lng: 8.682, lat: 50.111, label: "Frankfurt" },
  { name: "Hamburg", lng: 9.993, lat: 53.551, label: "Hamburg" },
  { name: "Köln", lng: 6.958, lat: 50.938, label: "Köln" },
  { name: "Stuttgart", lng: 9.182, lat: 48.776, label: "Stuttgart" },
];

function toVec2(lng: number, lat: number): THREE.Vector2 {
  return new THREE.Vector2((lng - 10.4) * 0.2, (lat - 51.2) * 0.2);
}

function ringToShape(ring: number[][]): THREE.Shape {
  const shape = new THREE.Shape(ring.map(([l, a]) => toVec2(l, a)));
  return shape;
}

function featureToGeometries(feature: any): THREE.BufferGeometry[] {
  const type = feature.geometry.type;
  const coords = feature.geometry.coordinates;
  const polys: { outer: number[][]; holes: number[][][] }[] = [];

  if (type === "Polygon") {
    polys.push({ outer: coords[0], holes: coords.slice(1) });
  } else if (type === "MultiPolygon") {
    for (const p of coords) polys.push({ outer: p[0], holes: p.slice(1) });
  }

  const opts = {
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.004,
    bevelSegments: 2,
  };

  return polys.map(({ outer, holes }) => {
    const shape = ringToShape(outer);
    for (const h of holes) {
      const path = new THREE.Path(h.map(([l, a]) => toVec2(l, a)));
      shape.holes.push(path);
    }
    const g = new THREE.ExtrudeGeometry(shape, opts);
    g.computeVertexNormals();
    return g;
  });
}

function getStateIdx(shapeName: string): number {
  const id = STATE_IDS[shapeName];
  return id ? germanStates.findIndex((s) => s.id === id) : -1;
}

interface StateMesh {
  geometry: THREE.BufferGeometry;
  center: THREE.Vector3;
  state: GermanState | null;
  index: number;
}

function featureToOutlines(feature: any): THREE.Vector2[][] {
  const type = feature.geometry.type;
  const coords = feature.geometry.coordinates;
  const outlines: THREE.Vector2[][] = [];
  if (type === "Polygon") {
    outlines.push(coords[0].map(([l, a]: number[]) => toVec2(l, a)));
  } else if (type === "MultiPolygon") {
    for (const p of coords) {
      outlines.push(p[0].map(([l, a]: number[]) => toVec2(l, a)));
    }
  }
  return outlines;
}

function GermanyModel({
  onSelectState,
}: {
  onSelectState: (state: GermanState) => void;
}) {
  const [geoJson, setGeoJson] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setGeoJson)
      .catch((e) => setError(e.message));
  }, []);

  const stateMeshes = useMemo(() => {
    if (!geoJson) return [];
    const meshes: StateMesh[] = [];
    for (const feature of geoJson.features) {
      const shapeName = feature.properties.shapeName;
      const idx = getStateIdx(shapeName);
      const geoms = featureToGeometries(feature);
      if (geoms.length === 0) continue;
      const geom =
        geoms.length > 1 ? mergeGeometries(geoms, false) : geoms[0];
      if (geoms.length > 1) geoms.forEach((g) => g.dispose());

      const pos = geom.attributes.position as THREE.BufferAttribute;
      const box = new THREE.Box3().setFromBufferAttribute(pos);
      const cx = (box.min.x + box.max.x) / 2;
      const cy = (box.min.y + box.max.y) / 2;
      const cz = (box.min.z + box.max.z) / 2;

      for (let i = 0; i < pos.count; i++) {
        pos.setXYZ(i, pos.getX(i) - cx, pos.getY(i) - cy, pos.getZ(i) - cz);
      }
      pos.needsUpdate = true;
      geom.computeVertexNormals();

      meshes.push({
        geometry: geom,
        center: new THREE.Vector3(cx, cy, cz),
        state: germanStates[idx] ?? null,
        index: idx,
      });
    }
    return meshes;
  }, [geoJson]);

  const stateOutlines = useMemo(() => {
    if (!geoJson) return [];
    const result: [number, number, number][][] = [];
    for (const feature of geoJson.features) {
      const geoms = featureToGeometries(feature);
      if (geoms.length === 0) continue;
      const outlines = featureToOutlines(feature);
      for (const ring of outlines) {
        result.push(ring.map((v) => [v.x, v.y, 0.1] as [number, number, number]));
      }
    }
    return result;
  }, [geoJson]);

  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const baseY = useMemo(() => stateMeshes.map((m) => m.center.y), [stateMeshes]);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const group = child as THREE.Group;
      const mesh = group.children[0] as THREE.Mesh;
      if (!mesh?.isMesh) return;
      const isSel = i === selected;
      const isHov = i === hovered;
      const ts = isSel ? 1.12 : isHov ? 1.04 : 1;
      const ty = isSel ? baseY[i] + 0.4 : baseY[i];
      mesh.scale.lerp(new THREE.Vector3(ts, ts, ts), 0.08);
      mesh.position.y += (ty - mesh.position.y) * 0.08;
    });
  });

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>, i: number) => {
      e.stopPropagation();
      const mat = (e.object as THREE.Mesh).material as THREE.MeshStandardMaterial;
      const s = stateMeshes[i]?.state;
      mat.emissive = new THREE.Color(s?.color ?? "#445E5D");
      mat.emissiveIntensity = 0.2;
      setHovered(i);
      document.body.style.cursor = "pointer";
    },
    [stateMeshes],
  );

  const handlePointerOut = useCallback(
    (e: ThreeEvent<PointerEvent>, i: number) => {
      e.stopPropagation();
      if (selected !== i) {
        const mat = (e.object as THREE.Mesh).material as THREE.MeshStandardMaterial;
        mat.emissive = new THREE.Color("#000000");
        mat.emissiveIntensity = 0;
      }
      setHovered(null);
      document.body.style.cursor = "default";
    },
    [selected],
  );

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>, i: number) => {
      e.stopPropagation();
      setSelected(i);
      const s = stateMeshes[i]?.state;
      if (s) onSelectState(s);
    },
    [onSelectState, stateMeshes],
  );

  if (error) {
    return (
      <mesh>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#ef4444" wireframe />
      </mesh>
    );
  }

  if (stateMeshes.length === 0) {
    return (
      <mesh>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#445E5D" wireframe />
      </mesh>
    );
  }

  return (
    <>
      <group ref={groupRef}>
      {stateMeshes.map((sm, i) => (
        <group key={i}>
          <mesh
            geometry={sm.geometry}
            position={sm.center}
            onPointerOver={(e) => handlePointerOver(e, i)}
            onPointerOut={(e) => handlePointerOut(e, i)}
            onClick={(e) => handleClick(e, i)}
          >
            <meshStandardMaterial
              color={sm.state?.color ?? "#445E5D"}
              metalness={0.15}
              roughness={0.65}
            />
          </mesh>
        </group>
      ))}
    </group>
      <group>
        {stateOutlines.map((ring, i) => (
          <group key={i}>
            <group position={[-0.014, -0.01, -0.04]}>
              <Line points={ring} color="#000000" opacity={0.05} transparent />
            </group>
            <group position={[-0.01, -0.007, -0.03]}>
              <Line points={ring} color="#000000" opacity={0.08} transparent />
            </group>
            <group position={[-0.006, -0.004, -0.02]}>
              <Line points={ring} color="#000000" opacity={0.12} transparent />
            </group>
            <group position={[-0.003, -0.002, -0.01]}>
              <Line points={ring} color="#000000" opacity={0.18} transparent />
            </group>
            <group position={[0, 0, -0.002]}>
              <Line points={ring} color="#F5D742" opacity={0.08} transparent />
            </group>
            <Line points={ring} color="#FFFFFF" />
          </group>
        ))}
      </group>
    </>
  );
}

function CityPins() {
  return (
    <group>
      {CITIES.map((city) => {
        const pos = toVec2(city.lng, city.lat);
        const labelY = city.name === "Frankfurt" ? 0.035 : 0.01;
        return (
          <group key={city.name} position={[pos.x, pos.y, 0.15]}>
            <mesh position={[0, 0, -0.002]}>
              <circleGeometry args={[0.025, 16]} />
              <meshBasicMaterial color="#00E5FF" opacity={0.12} transparent />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.009, 8, 8]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            <Line points={[[0, 0, 0.04], [0, 0, -0.15]]} color="#00E5FF" opacity={0.15} transparent depthWrite={false} />
            <Billboard position={[0.035, labelY, 0]}>
              <Text
                position={[0, 0, -0.003]}
                fontSize={0.035}
                color="#00E5FF"
                fillOpacity={0.25}
                anchorX="left"
                anchorY="middle"
                font=""
              >
                {city.label}
              </Text>
              <Text
                position={[0, 0, 0]}
                fontSize={0.035}
                color="#FFFFFF"
                anchorX="left"
                anchorY="middle"
                font=""
              >
                {city.label}
              </Text>
            </Billboard>
          </group>
        );
      })}
    </group>
  );
}

function beamGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(0, 229, 255, 1)");
  gradient.addColorStop(0.15, "rgba(0, 229, 255, 0.85)");
  gradient.addColorStop(0.4, "rgba(0, 180, 216, 0.3)");
  gradient.addColorStop(1, "rgba(0, 119, 182, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

const NUM_PARTICLES = 5;

function DataBeam({ a, b, offset }: { a: number; b: number; offset: number }) {
  const curve = useMemo(() => {
    const p1 = toVec2(CITIES[a].lng, CITIES[a].lat);
    const p2 = toVec2(CITIES[b].lng, CITIES[b].lat);
    const dist = p1.distanceTo(p2);
    const baseZ = 0.15;
    const arcHeight = Math.max(dist * 0.25, 0.16);
    const latOffset = 0.08 + dist * 0.04;
    const mid = new THREE.Vector2((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
    const cp = new THREE.Vector3(mid.x, mid.y + latOffset, baseZ + arcHeight);
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(p1.x, p1.y, baseZ),
      cp,
      new THREE.Vector3(p2.x, p2.y, baseZ),
    );
  }, [a, b]);

  const tubeGeom = useMemo(() => {
    const g = new THREE.TubeGeometry(curve, 40, 0.016, 8, false);
    g.computeVertexNormals();
    return g;
  }, [curve]);

  const innerTubeGeom = useMemo(() => {
    const g = new THREE.TubeGeometry(curve, 40, 0.006, 8, false);
    g.computeVertexNormals();
    return g;
  }, [curve]);

  const pts = useMemo(() =>
    curve.getPoints(40).map(p => [p.x, p.y, p.z] as [number, number, number]),
    [curve]
  );

  const tex = useMemo(() => beamGlowTexture(), []);
  const dashRef = useRef<any>(null);
  const glowRefs = useRef<(THREE.Sprite | null)[]>([]);
  const coreRefs = useRef<(THREE.Sprite | null)[]>([]);

  useFrame(({ clock }) => {
    const base = clock.elapsedTime * 0.45 + offset;
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const t = ((base - i * 0.09) % 1 + 1) % 1;
      const pos = curve.getPoint(t);
      if (coreRefs.current[i]) coreRefs.current[i]!.position.copy(pos);
      if (glowRefs.current[i]) glowRefs.current[i]!.position.copy(pos);
    }
    if (dashRef.current) {
      dashRef.current.material.dashOffset = clock.elapsedTime * 0.5 + offset;
    }
  });

  return (
    <group>
      <mesh geometry={tubeGeom}>
        <meshBasicMaterial color="#0077B6" transparent opacity={0.08} depthWrite={false} />
      </mesh>
      <mesh geometry={tubeGeom}>
        <meshBasicMaterial color="#00B4D8" transparent opacity={0.15} depthWrite={false} />
      </mesh>
      <mesh geometry={innerTubeGeom}>
        <meshBasicMaterial color="#00E5FF" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <Line points={pts} color="#FFFFFF" opacity={0.45} transparent depthWrite={false} />
      <Line ref={dashRef} points={pts} color="#00E5FF" opacity={0.9} transparent depthWrite={false}
            dashed dashSize={0.04} gapSize={0.06} dashScale={1} />
      {Array.from({ length: NUM_PARTICLES }, (_, i) => (
        <sprite key={`g${i}`} ref={el => glowRefs.current[i] = el} scale={[0.055 - i * 0.007, 0.045 - i * 0.006, 1]}>
          <spriteMaterial map={tex} transparent depthWrite={false} color="#00B4D8" />
        </sprite>
      ))}
      {Array.from({ length: NUM_PARTICLES }, (_, i) => (
        <sprite key={`c${i}`} ref={el => coreRefs.current[i] = el} scale={[0.028 - i * 0.004, 0.022 - i * 0.003, 1]}>
          <spriteMaterial map={tex} transparent depthWrite={false} color="#FFFFFF" />
        </sprite>
      ))}
    </group>
  );
}

function ConnectorLines() {
  const pairs = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 3],
  ];
  return (
    <group>
      {pairs.map(([a, b], i) => (
        <DataBeam key={i} a={a} b={b} offset={i * 0.3} />
      ))}
    </group>
  );
}

function shadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, "rgba(15, 26, 23, 0.55)");
  gradient.addColorStop(0.3, "rgba(15, 26, 23, 0.35)");
  gradient.addColorStop(0.6, "rgba(15, 26, 23, 0.12)");
  gradient.addColorStop(1, "rgba(15, 26, 23, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function silhouetteEdgeKey(a: number[], b: number[]): string {
  const k1 = `${a[0].toFixed(4)},${a[1].toFixed(4)}`;
  const k2 = `${b[0].toFixed(4)},${b[1].toFixed(4)}`;
  return k1 < k2 ? `${k1}||${k2}` : `${k2}||${k1}`;
}

function extractOuterSilhouetteEdges(
  geoJson: any,
): [THREE.Vector2, THREE.Vector2][] {
  const edgeCounts = new Map<string, number>();
  const edgeData = new Map<string, { from: THREE.Vector2; to: THREE.Vector2 }>();

  for (const feature of geoJson.features) {
    const type = feature.geometry.type;
    const coords = feature.geometry.coordinates;
    const outerRings: number[][][] = [];
    if (type === "Polygon") {
      outerRings.push(coords[0]);
    } else if (type === "MultiPolygon") {
      for (const p of coords) outerRings.push(p[0]);
    }
    for (const ring of outerRings) {
      for (let i = 0; i < ring.length - 1; i++) {
        const a = ring[i];
        const b = ring[i + 1];
        const key = silhouetteEdgeKey(a, b);
        edgeCounts.set(key, (edgeCounts.get(key) ?? 0) + 1);
        if (!edgeData.has(key)) {
          edgeData.set(key, { from: toVec2(a[0], a[1]), to: toVec2(b[0], b[1]) });
        }
      }
    }
  }

  const result: [THREE.Vector2, THREE.Vector2][] = [];
  for (const [key, count] of edgeCounts) {
    if (count === 1) {
      const edge = edgeData.get(key);
      if (edge) result.push([edge.from, edge.to]);
    }
  }
  return result;
}

function vec2Key(v: THREE.Vector2): string {
  return `${v.x.toFixed(4)},${v.y.toFixed(4)}`;
}

function chainSilhouetteEdges(
  edges: [THREE.Vector2, THREE.Vector2][],
): THREE.Vector2[][] {
  if (edges.length === 0) return [];

  const adj = new Map<string, THREE.Vector2[]>();
  for (const [a, b] of edges) {
    const ka = vec2Key(a);
    const kb = vec2Key(b);
    if (!adj.has(ka)) adj.set(ka, []);
    if (!adj.has(kb)) adj.set(kb, []);
    adj.get(ka)!.push(b);
    adj.get(kb)!.push(a);
  }

  const used = new Set<string>();
  const chains: THREE.Vector2[][] = [];

  for (const [a, b] of edges) {
    const ek = `${vec2Key(a)}|${vec2Key(b)}`;
    if (used.has(ek)) continue;

    const chain: THREE.Vector2[] = [a.clone(), b.clone()];
    used.add(ek);

    let current = b;
    let prev = a;
    for (let attempts = 0; attempts < 10000; attempts++) {
      const ck = vec2Key(current);
      const neighbors = adj.get(ck) || [];
      let found = false;
      for (const next of neighbors) {
        const nk = vec2Key(next);
        if (nk === vec2Key(prev)) continue;
        const ek2 = `${ck}|${nk}`;
        const ek3 = `${nk}|${ck}`;
        if (!used.has(ek2) && !used.has(ek3)) {
          used.add(ek2);
          used.add(ek3);
          chain.push(next.clone());
          prev = current;
          current = next;
          found = true;
          break;
        }
      }
      if (!found) break;
    }

    current = a;
    prev = b;
    for (let attempts = 0; attempts < 10000; attempts++) {
      const ck = vec2Key(current);
      const neighbors = adj.get(ck) || [];
      let found = false;
      for (const next of neighbors) {
        const nk = vec2Key(next);
        if (nk === vec2Key(prev)) continue;
        const ek2 = `${ck}|${nk}`;
        const ek3 = `${nk}|${ck}`;
        if (!used.has(ek2) && !used.has(ek3)) {
          used.add(ek2);
          used.add(ek3);
          chain.unshift(next.clone());
          prev = current;
          current = next;
          found = true;
          break;
        }
      }
      if (!found) break;
    }

    chains.push(chain);
  }

  return chains;
}

function ConcentricLines() {
  const [geoJson, setGeoJson] = useState<any>(null);

  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setGeoJson)
      .catch(() => {});
  }, []);

  const layers = useMemo(() => {
    if (!geoJson) return null;

    const edges = extractOuterSilhouetteEdges(geoJson);
    if (edges.length === 0) return null;

    const chains = chainSilhouetteEdges(edges);
    if (chains.length === 0) return null;

    let cx = 0, cy = 0, total = 0;
    for (const chain of chains) {
      for (const v of chain) {
        cx += v.x;
        cy += v.y;
        total++;
      }
    }
    cx /= total;
    cy /= total;

    let minY = Infinity, maxY = -Infinity;
    for (const chain of chains) {
      for (const v of chain) {
        if (v.y < minY) minY = v.y;
        if (v.y > maxY) maxY = v.y;
      }
    }
    const yRange = maxY - minY;

    const cent = new THREE.Vector2(cx, cy);
    const numLayers = 3;

    return Array.from({ length: numLayers }, (_, i) => {
      const scale = 1.0 + (i + 1) * 0.18;
      const opacity = Math.max(0.12 - i * 0.035, 0.003);
      const scaledChains = chains.map((chain) =>
        chain.map((v) => {
          const t = yRange > 0 ? (v.y - minY) / yRange : 0.5;
          const expandBias = 1 + t * 0.5;
          const biasedScale = 1 + (scale - 1) * expandBias;
          const p = v.clone().sub(cent).multiplyScalar(biasedScale).add(cent);
          return [p.x, p.y, -0.2] as [number, number, number];
        }),
      );
      return { chains: scaledChains, opacity };
    });
  }, [geoJson]);

  if (!layers) return null;

  return (
    <group>
      {layers.map((layer, i) =>
        layer.chains.map((chain, ci) => (
          <Line
            key={`${i}-${ci}`}
            points={chain}
            color="#182E21"
            transparent
            opacity={layer.opacity}
            lineWidth={2}
            depthWrite={false}
          />
        )),
      )}
    </group>
  );
}

function ShadowBehind() {
  const tex = useMemo(() => shadowTexture(), []);
  return (
    <mesh position={[0, 0, -0.7]}>
      <planeGeometry args={[3.6, 3.6]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
}

function MapContainer({ children }: { children: ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.25) * 0.6;
    }
  });
  return <group ref={groupRef}>{children}</group>;
}

function SceneFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#445E5D" wireframe />
    </mesh>
  );
}

function Scene({
  onSelectState,
}: {
  onSelectState: (state: GermanState) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <directionalLight position={[-5, 3, -5]} intensity={0.4} />
      <ShadowBehind />
      <ConcentricLines />
      <Suspense fallback={<SceneFallback />}>
        <MapContainer>
          <GermanyModel onSelectState={onSelectState} />
          <ConnectorLines />
          <CityPins />
        </MapContainer>
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={false}
        minDistance={1.5}
        maxDistance={6}
      />
    </>
  );
}

export default function GermanyMap3D({
  onSelectState,
}: {
  onSelectState: (state: GermanState) => void;
}) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        gl={{ antialias: true }}
      >
        <Scene onSelectState={onSelectState} />
      </Canvas>
      <div className="absolute bottom-8 left-4 flex items-center gap-1.5 opacity-30">
        <span className="font-serif text-[#182E21] font-bold text-xs tracking-tight" style={{ fontFamily: "'Times New Roman',serif" }}>DLZ</span>
      </div>
    </div>
  );
}
