import * as THREE from "three";

function vertKey(x: number, y: number, z: number, p = 3): string {
  return `${x.toFixed(p)},${y.toFixed(p)},${z.toFixed(p)}`;
}

export function splitGeometryByComponents(
  geometry: THREE.BufferGeometry
): THREE.BufferGeometry[] {
  const pos = geometry.attributes.position;
  if (!pos) return [];

  const triCount = Math.floor(pos.count / 3);

  const posToTris = new Map<string, number[]>();
  for (let i = 0; i < triCount; i++) {
    for (let j = 0; j < 3; j++) {
      const idx = i * 3 + j;
      const key = vertKey(pos.getX(idx), pos.getY(idx), pos.getZ(idx));
      let arr = posToTris.get(key);
      if (!arr) {
        arr = [];
        posToTris.set(key, arr);
      }
      if (!arr.includes(i)) arr.push(i);
    }
  }

  const adj: Set<number>[] = Array.from({ length: triCount }, () => new Set());
  for (const [, tris] of posToTris) {
    if (tris.length < 2) continue;
    for (let i = 0; i < tris.length; i++) {
      for (let j = i + 1; j < tris.length; j++) {
        adj[tris[i]].add(tris[j]);
        adj[tris[j]].add(tris[i]);
      }
    }
  }

  const visited = new Uint8Array(triCount);
  const groups: number[][] = [];
  for (let i = 0; i < triCount; i++) {
    if (visited[i]) continue;
    const stack = [i];
    const group: number[] = [];
    while (stack.length) {
      const t = stack.pop()!;
      if (visited[t]) continue;
      visited[t] = 1;
      group.push(t);
      for (const n of adj[t]) {
        if (!visited[n]) stack.push(n);
      }
    }
    groups.push(group);
  }

  const results: THREE.BufferGeometry[] = [];
  for (const group of groups) {
    const verts: number[] = [];
    const idx: number[] = [];
    const map = new Map<number, number>();
    for (const t of group) {
      for (let j = 0; j < 3; j++) {
        const gi = t * 3 + j;
        let ni = map.get(gi);
        if (ni === undefined) {
          ni = verts.length / 3;
          map.set(gi, ni);
          verts.push(pos.getX(gi), pos.getY(gi), pos.getZ(gi));
        }
        idx.push(ni);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    results.push(g);
  }

  results.sort((a, b) => {
    const ap = a.attributes.position as THREE.BufferAttribute;
    const bp = b.attributes.position as THREE.BufferAttribute;
    const ab = new THREE.Box3().setFromBufferAttribute(ap);
    const bb = new THREE.Box3().setFromBufferAttribute(bp);
    const asz =
      ab.max.x - ab.min.x + (ab.max.y - ab.min.y) + (ab.max.z - ab.min.z);
    const bsz =
      bb.max.x - bb.min.x + (bb.max.y - bb.min.y) + (bb.max.z - bb.min.z);
    return bsz - asz;
  });

  return results;
}
