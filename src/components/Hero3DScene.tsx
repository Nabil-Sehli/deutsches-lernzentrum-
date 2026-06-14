import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { SoftShadows } from "@react-three/drei";
import * as THREE from "three";

function createClayMaterial(color: string, roughness = 0.7, metalness = 0.05) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness,
    metalness,
  });
}

const clayMaterials = {
  teal: createClayMaterial("#00695c"),
  tealDark: createClayMaterial("#004d40"),
  cream: createClayMaterial("#fff8e1"),
  white: createClayMaterial("#ffffff", 0.8),
  sage: createClayMaterial("#81c784", 0.85),
  stone: createClayMaterial("#78909c"),
  knob: createClayMaterial("#81c784", 0.5),
};

function Schoolhouse() {
  const groupRef = useRef<THREE.Group>(null);
  const smokeRefs = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.08;
      groupRef.current.rotation.y = Math.sin(t * 0.15) * 0.03;
    }
    smokeRefs.current.forEach((smoke, i) => {
      if (!smoke) return;
      smoke.position.y += 0.008;
      smoke.position.x += Math.sin(t + i) * 0.001;
      const scale = Math.max(0.3, 1 - (smoke.position.y - 3.5) / 2);
      smoke.scale.setScalar(scale);
      if (smoke.position.y > 4.8) {
        smoke.position.y = 3.5;
        smoke.position.x = 0.5;
        smoke.scale.setScalar(0.3);
      }
    });
  });

  return (
    <group ref={groupRef} position={[0.5, 0, 0]} scale={0.7}>
      <mesh position={[0, 1, 0]} material={clayMaterials.teal} castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.2, 2, 32]} />
      </mesh>
      <mesh
        position={[0, 2.75, 0]}
        rotation={[0, Math.PI / 4, 0]}
        material={clayMaterials.tealDark}
        castShadow
      >
        <coneGeometry args={[1.5, 1.5, 4]} />
      </mesh>
      <mesh position={[0, 0.3, 1.15]} material={clayMaterials.cream} castShadow>
        <boxGeometry args={[0.4, 0.6, 0.1]} />
      </mesh>
      <mesh position={[0.12, 0.3, 1.22]} material={clayMaterials.knob}>
        <sphereGeometry args={[0.04, 16, 16]} />
      </mesh>
      <mesh
        position={[0, 1.2, 1.15]}
        rotation={[Math.PI / 2, 0, 0]}
        material={clayMaterials.white}
        castShadow
      >
        <cylinderGeometry args={[0.25, 0.25, 0.1, 16]} />
      </mesh>
      <mesh position={[0, 1.2, 1.18]} material={clayMaterials.tealDark} castShadow>
        <torusGeometry args={[0.28, 0.03, 8, 16]} />
      </mesh>
      <mesh position={[0.5, 3.2, -0.3]} material={clayMaterials.stone} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.6, 12]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) smokeRefs.current[i] = el;
          }}
          position={[0.5, 3.5 + i * 0.25, -0.3]}
          material={clayMaterials.white}
        >
          <sphereGeometry args={[0.06 + i * 0.02, 8, 8]} />
        </mesh>
      ))}
    </group>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} material={clayMaterials.stone} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.8, 8]} />
      </mesh>
      <mesh position={[0, 1, 0]} material={clayMaterials.teal} castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
      </mesh>
    </group>
  );
}

function Cloud({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.x =
      position[0] + Math.sin(clock.getElapsedTime() * 0.2 + offset) * 0.3;
  });

  return (
    <group ref={ref} position={position}>
      <mesh material={clayMaterials.white}>
        <sphereGeometry args={[0.3, 12, 12]} />
      </mesh>
      <mesh position={[0.25, 0.05, 0]} material={clayMaterials.white}>
        <sphereGeometry args={[0.25, 12, 12]} />
      </mesh>
      <mesh position={[-0.2, -0.05, 0.1]} material={clayMaterials.white}>
        <sphereGeometry args={[0.2, 12, 12]} />
      </mesh>
    </group>
  );
}

function Ground() {
  return (
    <mesh
      position={[0, -0.1, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      material={clayMaterials.sage}
      receiveShadow
    >
      <circleGeometry args={[6, 32]} />
    </mesh>
  );
}

function SceneContent() {
  const cameraRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });

  useFrame(({ pointer }) => {
    targetRef.current.x = pointer.x * 0.5;
    targetRef.current.y = pointer.y * 0.3;
    cameraRef.current.x += (targetRef.current.x - cameraRef.current.x) * 0.05;
    cameraRef.current.y += (targetRef.current.y - cameraRef.current.y) * 0.05;
  });

  return (
    <>
      <SoftShadows size={20} samples={16} focus={0.5} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        color="#fff8e1"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-3, 2, -3]} intensity={0.3} color="#e8f5e9" />
      <hemisphereLight args={["#e8f5e9", "#00695c", 0.4]} />

      <group
        position={[cameraRef.current.x * 0.5, cameraRef.current.y * 0.2, 0]}
      >
        <Schoolhouse />
        <Ground />
        <Tree position={[-1.5, 0.4, 1.2]} />
        <Tree position={[1.8, 0.4, 0.8]} />
        <Tree position={[-0.8, 0.4, -1.5]} />
        <Tree position={[2.2, 0.4, -0.5]} />
        <Tree position={[-2, 0.4, -0.3]} />
        <Cloud position={[-2, 3.5, -1]} />
        <Cloud position={[2.5, 4, 0.5]} />
        <Cloud position={[-1, 4.2, 1.5]} />
        <Cloud position={[3, 3.8, -1.5]} />
      </group>
    </>
  );
}

export default function Hero3DScene() {
  return (
    <div className="w-full h-full min-h-[400px] md:min-h-0">
      <Canvas
        shadows
        camera={{ position: [0, 2, 8], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        style={{ background: "transparent" }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}
