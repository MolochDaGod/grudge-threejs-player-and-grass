/**
 * Grudge Grass Terrain (Three.js only — no Babylon)
 *
 * Learned from the live /play?char=barbarian deploy
 * (threejs-player-and-grass.vercel.app) and the bundled GrassTerrain pipeline
 * in script.js (vfs:/src/GrassTerrain.js).
 *
 * ## What this is
 * GPU instanced grass blades sitting on a multi-octave height field. Player
 * trails flatten blades via per-instance trail attributes.
 *
 * ## Three-layer terrain (see terrain-layers.mjs)
 *   L0 Bedrock / height field — continuous height function (getTerrainHeight)
 *   L1 Surface mesh           — optional ground plane / painted ground
 *   L2 Vegetation             — THIS module (instanced grass)
 *   L3 Detail scatter         — rocks/props (optional, terrain-layers)
 *
 * @see docs/GRASS_TERRAIN_SKILL.md
 */

import * as THREE from "three";

/** Simplex-ish 2D noise factory (matches deploy: multi-octave hills). */
export function createNoise2D(seed = 0) {
  // Lightweight hash noise — deterministic, good enough for hills
  const s = seed * 9999.123;
  function hash(x, z) {
    let n = Math.sin(x * 127.1 + z * 311.7 + s) * 43758.5453;
    return n - Math.floor(n);
  }
  function smooth(x, z) {
    const x0 = Math.floor(x);
    const z0 = Math.floor(z);
    const fx = x - x0;
    const fz = z - z0;
    const u = fx * fx * (3 - 2 * fx);
    const v = fz * fz * (3 - 2 * fz);
    const a = hash(x0, z0);
    const b = hash(x0 + 1, z0);
    const c = hash(x0, z0 + 1);
    const d = hash(x0 + 1, z0 + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  /** Returns roughly [-1, 1] */
  return function noise2D(x, z) {
    return smooth(x, z) * 2 - 1;
  };
}

const defaultNoise = createNoise2D(42);

/**
 * Multi-octave height field used by grass placement AND player ground snap.
 * Must stay in sync with character controller terrainY queries.
 *
 * Layers inside the height function:
 *   base  (freq ~1/220) — large hills, |n|^1.2 shaped
 *   mid   (freq ~1/90)  — rolling ridges
 *   detail(freq ~1/30)  — local bumps
 */
export function getTerrainHeight(
  x,
  z,
  chunkX = 0,
  chunkZ = 0,
  chunkSize = 120,
  noise2D = defaultNoise,
) {
  const worldX = x + chunkX * chunkSize;
  const worldZ = z + chunkZ * chunkSize;
  let base = noise2D(worldX / 220, worldZ / 220);
  base = Math.sign(base) * Math.pow(Math.abs(base), 1.2);
  const mid = noise2D(worldX / 90, worldZ / 90);
  const detail = noise2D(worldX / 30, worldZ / 30);
  return base * 20 + mid * 1 + detail * 1 + 1;
}

/**
 * Blade ShaderMaterial — wind (snoise), trail bend, tip/bottom color mix, cloud shadow.
 * Keep mediump; discard by alphaMap for cheap cutout blades.
 */
export function createGrassMaterial(THREE_NS = THREE) {
  const vertexShader = /* glsl */ `
    precision mediump float;
    attribute vec3 offset;
    attribute vec2 worldOffset;
    attribute vec4 orientation;
    attribute float halfRootAngleSin;
    attribute float halfRootAngleCos;
    attribute float stretch;
    attribute float trail;
    attribute vec2 trailDir;
    uniform float time;
    uniform float bladeHeight;
    varying vec2 vUv;
    varying float frc;
    varying float vTrail;
    varying vec3 vWorldPosition;
    vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
    float snoise(vec2 v){
      const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
      vec2 i=floor(v+dot(v,C.yy));
      vec2 x0=v-i+dot(i,C.xx);
      vec2 i1=x0.x>x0.y?vec2(1.0,0.0):vec2(0.0,1.0);
      vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1;
      i=mod289(i);
      vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
      vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
      m=m*m; m=m*m;
      vec3 x=2.0*fract(p*C.www)-1.0;
      vec3 h=abs(x)-0.5; vec3 ox=floor(x+0.5); vec3 a0=x-ox;
      m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
      vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
      return 130.0*dot(m,g);
    }
    vec3 rotateVectorByQuaternion(vec3 v, vec4 q){
      return 2.0*cross(q.xyz,v*q.w+cross(q.xyz,v))+v;
    }
    vec4 slerp(vec4 v0, vec4 v1, float t){
      v0=normalize(v0); v1=normalize(v1);
      float d=dot(v0,v1);
      if(d<0.0){v1=-v1;d=-d;}
      if(d>0.9995){return normalize(t*(v1-v0)+v0);}
      float th0=acos(d), th=th0*t, s0=cos(th)-d*sin(th)/sin(th0), s1=sin(th)/sin(th0);
      return s0*v0+s1*v1;
    }
    void main(){
      frc=position.y/bladeHeight;
      float noise=0.5-snoise(vec2(time-worldOffset.x/50.0,time-worldOffset.y/50.0));
      vec4 direction=vec4(0.0,halfRootAngleSin,0.0,halfRootAngleCos);
      direction=slerp(direction,orientation,frc);
      vec3 vPosition=vec3(position.x,position.y+position.y*stretch,position.z);
      vPosition=rotateVectorByQuaternion(vPosition,direction);
      float halfAngle=noise*0.25;
      vPosition=rotateVectorByQuaternion(vPosition,normalize(vec4(sin(halfAngle),0.0,-sin(halfAngle),cos(halfAngle))));
      float t=clamp(trail,0.0,1.0)*3.25;
      if(t>0.001){
        float len=length(trailDir);
        if(len>0.0001){
          vec3 pushDir=normalize(vec3(trailDir.x,0.0,trailDir.y));
          vPosition+=pushDir*(t*frc*0.35);
        }
      }
      vUv=uv; vTrail=clamp(trail*0.3,0.0,1.0);
      vec4 worldPos=modelMatrix*vec4(offset+vPosition,1.0);
      vWorldPosition=worldPos.xyz;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(offset+vPosition,1.0);
    }
  `;
  const fragmentShader = /* glsl */ `
    precision mediump float;
    uniform sampler2D map;
    uniform sampler2D alphaMap;
    uniform vec3 tipColor;
    uniform vec3 bottomColor;
    uniform float cloudTime;
    uniform float cloudScale;
    uniform float cloudIntensity;
    varying vec2 vUv;
    varying float frc;
    varying float vTrail;
    varying vec3 vWorldPosition;
    vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
    float snoise(vec2 v){
      const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
      vec2 i=floor(v+dot(v,C.yy));
      vec2 x0=v-i+dot(i,C.xx);
      vec2 i1=x0.x>x0.y?vec2(1.0,0.0):vec2(0.0,1.0);
      vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1;
      i=mod289(i);
      vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
      vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
      m=m*m; m=m*m;
      vec3 x=2.0*fract(p*C.www)-1.0;
      vec3 h=abs(x)-0.5; vec3 ox=floor(x+0.5); vec3 a0=x-ox;
      m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
      vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
      return 130.0*dot(m,g);
    }
    void main(){
      float alpha=texture2D(alphaMap,vUv).r;
      if(alpha<0.15) discard;
      vec4 col=texture2D(map,vUv);
      col=mix(vec4(tipColor,1.0),col,frc);
      col=mix(vec4(bottomColor,1.0),col,frc);
      col.rgb=mix(col.rgb,vec3(0.0,0.15,0.0),clamp(vTrail,0.0,1.0));
      vec2 cloudUv=vec2((vWorldPosition.x+cloudTime*10.0)/cloudScale,(vWorldPosition.z+cloudTime*10.0)/cloudScale);
      float cloud=snoise(cloudUv)*0.5+0.5;
      col.rgb*=1.0-cloud*cloudIntensity;
      gl_FragColor=vec4(col.rgb,1.0);
    }
  `;

  return new THREE_NS.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      time: { value: 0 },
      bladeHeight: { value: 1 },
      map: { value: null },
      alphaMap: { value: null },
      tipColor: { value: new THREE_NS.Color(0.45, 0.75, 0.22) },
      bottomColor: { value: new THREE_NS.Color(0.08, 0.28, 0.06) },
      cloudTime: { value: 0 },
      cloudScale: { value: 80 },
      cloudIntensity: { value: 0.18 },
    },
    side: THREE_NS.DoubleSide,
  });
}

function makeBladeGeometry(bW = 0.09, bH = 1.42) {
  // Simple tapered blade (two triangles)
  const geo = new THREE.BufferGeometry();
  const hw = bW * 0.5;
  const positions = new Float32Array([
    -hw, 0, 0, hw, 0, 0, 0, bH, 0,
    -hw * 0.6, 0, 0.01, hw * 0.6, 0, 0.01, 0, bH * 0.85, 0.01,
  ]);
  const uvs = new Float32Array([0, 0, 1, 0, 0.5, 1, 0, 0, 1, 0, 0.5, 1]);
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}

/**
 * Create one grass chunk: InstancedMesh blades on height field.
 * @returns {THREE.Group} with userData { grassMaterial, trailArray, tick, layer:'vegetation' }
 */
export function createGrassTerrain(
  options = {},
  width = 120,
  instances = 40000,
  bladeDiffuse = null,
  bladeAlpha = null,
  chunkX = 0,
  chunkZ = 0,
  chunkSize = 120,
  noise2D = defaultNoise,
) {
  const bW = options.bW ?? 0.09;
  const bH = options.bH ?? 1.42;
  const material = createGrassMaterial();
  material.uniforms.bladeHeight.value = bH;
  if (bladeDiffuse) material.uniforms.map.value = bladeDiffuse;
  if (bladeAlpha) material.uniforms.alphaMap.value = bladeAlpha;

  const baseGeo = makeBladeGeometry(bW, bH);
  const instancedGeom = new THREE.InstancedBufferGeometry();
  instancedGeom.index = baseGeo.index;
  instancedGeom.attributes.position = baseGeo.attributes.position;
  instancedGeom.attributes.uv = baseGeo.attributes.uv;
  if (baseGeo.attributes.normal) instancedGeom.attributes.normal = baseGeo.attributes.normal;

  const offsets = new Float32Array(instances * 3);
  const worldOffsets = new Float32Array(instances * 2);
  const orientations = new Float32Array(instances * 4);
  const halfSin = new Float32Array(instances);
  const halfCos = new Float32Array(instances);
  const stretch = new Float32Array(instances);
  const trail = new Float32Array(instances);
  const trailDir = new Float32Array(instances * 2);

  for (let i = 0; i < instances; i++) {
    const x = (Math.random() - 0.5) * width;
    const z = (Math.random() - 0.5) * width;
    const y = getTerrainHeight(x, z, chunkX, chunkZ, chunkSize, noise2D);
    offsets[i * 3] = x;
    offsets[i * 3 + 1] = y;
    offsets[i * 3 + 2] = z;
    worldOffsets[i * 2] = x + chunkX * chunkSize;
    worldOffsets[i * 2 + 1] = z + chunkZ * chunkSize;
    const yaw = Math.random() * Math.PI * 2;
    orientations[i * 4] = 0;
    orientations[i * 4 + 1] = Math.sin(yaw * 0.5);
    orientations[i * 4 + 2] = 0;
    orientations[i * 4 + 3] = Math.cos(yaw * 0.5);
    const ha = (Math.random() - 0.5) * 0.4;
    halfSin[i] = Math.sin(ha);
    halfCos[i] = Math.cos(ha);
    stretch[i] = 0.6 + Math.random() * 0.8;
    trail[i] = 0;
    trailDir[i * 2] = 0;
    trailDir[i * 2 + 1] = 0;
  }

  instancedGeom.setAttribute("offset", new THREE.InstancedBufferAttribute(offsets, 3));
  instancedGeom.setAttribute("worldOffset", new THREE.InstancedBufferAttribute(worldOffsets, 2));
  instancedGeom.setAttribute("orientation", new THREE.InstancedBufferAttribute(orientations, 4));
  instancedGeom.setAttribute("halfRootAngleSin", new THREE.InstancedBufferAttribute(halfSin, 1));
  instancedGeom.setAttribute("halfRootAngleCos", new THREE.InstancedBufferAttribute(halfCos, 1));
  instancedGeom.setAttribute("stretch", new THREE.InstancedBufferAttribute(stretch, 1));
  const trailAttr = new THREE.InstancedBufferAttribute(trail, 1);
  trailAttr.setUsage(THREE.DynamicDrawUsage);
  instancedGeom.setAttribute("trail", trailAttr);
  const trailDirAttr = new THREE.InstancedBufferAttribute(trailDir, 2);
  trailDirAttr.setUsage(THREE.DynamicDrawUsage);
  instancedGeom.setAttribute("trailDir", trailDirAttr);

  const grassMesh = new THREE.Mesh(instancedGeom, material);
  grassMesh.frustumCulled = false;
  grassMesh.name = "grass_blades";
  grassMesh.userData.layer = "vegetation";

  const group = new THREE.Group();
  group.name = `grass_chunk_${chunkX}_${chunkZ}`;
  group.add(grassMesh);
  group.userData.layer = "vegetation";
  group.userData.grassMaterial = material;
  group.userData.trailArray = trail;
  group.userData.trailDirArray = trailDir;
  group.userData.offsetsArray = offsets;
  group.userData.trailAttribute = trailAttr;
  group.userData.trailDirAttribute = trailDirAttr;
  group.userData.terrainWidth = width;
  group.userData.chunkX = chunkX;
  group.userData.chunkZ = chunkZ;
  group.tick = (elapsed) => {
    material.uniforms.time.value = elapsed * 0.6;
    material.uniforms.cloudTime.value = elapsed * 0.05;
  };
  return group;
}

export const GRASS_DEFAULTS = {
  bladeWidth: 0.08,
  /** SI: ~1 m tall grass relative to 1.8 m human. */
  bladeHeight: 1,
  instancesHigh: 40000,
  instancesLow: 5000,
  chunkSize: 120,
  tipColor: 0x73bf38,
  bottomColor: 0x14470f,
};
