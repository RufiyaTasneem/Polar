import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { POLAR_STATIONS, latLonToVector3 } from './polarStationData';

export interface PolarGlobeHandle {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  earthGroup: THREE.Group;
  earthMesh: THREE.Mesh;
  markersGroup: THREE.Group;
  setRotation: (y: number, x?: number, z?: number) => void;
  setCameraPosition: (x: number, y: number, z: number) => void;
  setCameraDistance: (distance: number) => void;
  setActiveStation: (stationId: string | null) => void;
  setAutoRotate: (autoRotate: boolean) => void;
}

export interface PolarGlobeProps {
  className?: string;
  autoRotate?: boolean;
  rotationSpeed?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  cameraDistance?: number;
  cameraPosition?: [number, number, number];
  onReady?: (handle: PolarGlobeHandle) => void;
}

// Subtle, restrained Fresnel atmosphere shader for POLAR dark theme
function createPolarFresnelMaterial(): THREE.ShaderMaterial {
  const uniforms = {
    color1: { value: new THREE.Color(0x1c4a7c) }, // Restrained polar deep blue/cyan rim
    color2: { value: new THREE.Color(0x000000) },
    fresnelBias: { value: 0.05 },
    fresnelScale: { value: 0.8 },
    fresnelPower: { value: 4.5 },
  };

  const vertexShader = `
    uniform float fresnelBias;
    uniform float fresnelScale;
    uniform float fresnelPower;

    varying float vReflectionFactor;

    void main() {
      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      vec4 worldPosition = modelMatrix * vec4( position, 1.0 );

      vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
      vec3 I = worldPosition.xyz - cameraPosition;

      vReflectionFactor = fresnelBias + fresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), fresnelPower );

      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    uniform vec3 color1;
    uniform vec3 color2;

    varying float vReflectionFactor;

    void main() {
      float f = clamp( vReflectionFactor, 0.0, 1.0 );
      gl_FragColor = vec4(mix(color2, color1, vec3(f)), f * 0.55);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

// Starfield background
function createStarfield(numStars = 1200): THREE.Points {
  const verts: number[] = [];
  const colors: number[] = [];

  for (let i = 0; i < numStars; i++) {
    const radius = Math.random() * 30 + 20;
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    verts.push(x, y, z);

    const col = new THREE.Color().setHSL(0.6, 0.15, 0.3 + Math.random() * 0.5);
    colors.push(col.r, col.g, col.b);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
  });

  return new THREE.Points(geo, mat);
}

const DEFAULT_AXIAL_TILT = (-23.4 * Math.PI) / 180;

const PolarGlobe = forwardRef<PolarGlobeHandle, PolarGlobeProps>(({
  className = 'w-full h-full',
  autoRotate = true,
  rotationSpeed = 0.0015,
  rotationX,
  rotationY,
  rotationZ,
  cameraDistance,
  cameraPosition,
  onReady,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // References for external control and animation loop
  const handleRef = useRef<PolarGlobeHandle | null>(null);
  const autoRotateRef = useRef(autoRotate);
  const rotationSpeedRef = useRef(rotationSpeed);
  const rotationYPropRef = useRef(rotationY);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);
  rotationSpeedRef.current = rotationSpeed;
  rotationYPropRef.current = rotationY;

  useImperativeHandle(
    ref,
    () => ({
      get scene() {
        return handleRef.current?.scene!;
      },
      get camera() {
        return handleRef.current?.camera!;
      },
      get renderer() {
        return handleRef.current?.renderer!;
      },
      get earthGroup() {
        return handleRef.current?.earthGroup!;
      },
      get earthMesh() {
        return handleRef.current?.earthMesh!;
      },
      get markersGroup() {
        return handleRef.current?.markersGroup!;
      },
      setRotation: (y: number, x?: number, z?: number) => {
        handleRef.current?.setRotation(y, x, z);
      },
      setCameraPosition: (x: number, y: number, z: number) => {
        handleRef.current?.setCameraPosition(x, y, z);
      },
      setCameraDistance: (distance: number) => {
        handleRef.current?.setCameraDistance(distance);
      },
      setActiveStation: (stationId: string | null) => {
        handleRef.current?.setActiveStation(stationId);
      },
      setAutoRotate: (rotate: boolean) => {
        handleRef.current?.setAutoRotate(rotate);
      },
    }),
    []
  );

  // 1. One-time Scene & Renderer initialization on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712); // Near-black space matching POLAR palette

    // Camera setup
    const initialDist = cameraDistance ?? 4.2;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    if (cameraPosition) {
      camera.position.set(...cameraPosition);
    } else {
      camera.position.set(0, 0, initialDist);
    }

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    container.appendChild(renderer.domElement);

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();
    const earthMap = textureLoader.load('/textures/00_earthmap1k.jpg');
    const lightsMap = textureLoader.load('/textures/03_earthlights1k.jpg');
    const cloudMap = textureLoader.load('/textures/04_earthcloudmap.jpg');
    const cloudAlphaMap = textureLoader.load('/textures/05_earthcloudmaptrans.jpg');

    // Earth Meshes
    const geo = new THREE.IcosahedronGeometry(1.0, 16);

    // Main Earth
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthMap,
      roughness: 0.7,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(geo, earthMat);

    // Night Lights
    const lightsMat = new THREE.MeshBasicMaterial({
      map: lightsMap,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.85,
    });
    const lightsMesh = new THREE.Mesh(geo, lightsMat);

    // Cloud Layer
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudMap,
      transparent: true,
      opacity: 0.4,
      alphaMap: cloudAlphaMap,
      blending: THREE.AdditiveBlending,
    });
    const cloudMesh = new THREE.Mesh(geo, cloudMat);
    cloudMesh.scale.setScalar(1.004);

    // Atmosphere Fresnel Glow
    const fresnelMat = createPolarFresnelMaterial();
    const glowMesh = new THREE.Mesh(geo, fresnelMat);
    glowMesh.scale.setScalar(1.012);

    // 3D Station Markers setup inside markersGroup
    const markersGroup = new THREE.Group();
    markersGroup.name = 'markersGroup';

    interface MarkerObject {
      group: THREE.Group;
      coreMat: THREE.MeshBasicMaterial;
      ringMat: THREE.MeshBasicMaterial;
      ringMesh: THREE.Mesh;
      pinMesh: THREE.Mesh;
    }

    const markerObjects = new Map<string, MarkerObject>();

    POLAR_STATIONS.forEach((st) => {
      const markerGroup = new THREE.Group();
      markerGroup.name = `marker_${st.id}`;
      const pos = latLonToVector3(st.lat, st.lon, 1.015);
      markerGroup.position.copy(pos);
      markerGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize());

      // Core dot (bright point)
      const coreGeo = new THREE.SphereGeometry(0.018, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0x3b4e60, depthTest: true, depthWrite: true });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);

      // Glow ring
      const ringGeo = new THREE.RingGeometry(0.024, 0.045, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x3b4e60,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.15,
        depthTest: true,
        depthWrite: false,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);

      // Vertical indicator pin line
      const pinGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.06, 8);
      pinGeo.translate(0, 0.03, 0);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0x8fd8e8 });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.rotation.x = Math.PI / 2;
      pinMesh.visible = false;

      markerGroup.add(coreMesh);
      markerGroup.add(ringMesh);
      markerGroup.add(pinMesh);
      markerGroup.scale.setScalar(0.75);

      markersGroup.add(markerGroup);

      markerObjects.set(st.id, { group: markerGroup, coreMat, ringMat, ringMesh, pinMesh });
    });

    let activeStationId: string | null = null;

    const setActiveStation = (id: string | null) => {
      activeStationId = id;
      markerObjects.forEach((mObj, stId) => {
        const isActive = stId === id;
        if (isActive) {
          mObj.coreMat.color.setHex(0xffffff);
          mObj.ringMat.color.setHex(0x8fd8e8);
          mObj.ringMat.opacity = 0.9;
          mObj.group.scale.setScalar(1.6);
          mObj.pinMesh.visible = true;
        } else {
          mObj.coreMat.color.setHex(0x3b4e60);
          mObj.ringMat.color.setHex(0x3b4e60);
          mObj.ringMat.opacity = 0.15;
          mObj.group.scale.setScalar(0.7);
          mObj.pinMesh.visible = false;
        }
      });
    };

    // Combine into Earth Group with axial tilt
    const earthGroup = new THREE.Group();
    earthGroup.rotation.x = rotationX ?? 0;
    earthGroup.rotation.y = rotationY ?? 0;
    earthGroup.rotation.z = rotationZ ?? DEFAULT_AXIAL_TILT;

    earthGroup.add(earthMesh);
    earthGroup.add(lightsMesh);
    earthGroup.add(cloudMesh);
    earthGroup.add(glowMesh);
    earthGroup.add(markersGroup);

    scene.add(earthGroup);

    // Starfield Background
    const starfield = createStarfield(1000);
    scene.add(starfield);

    // Lighting (Cinematic polar direction)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(-2, 0.8, 1.5);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x1a2638, 0.3);
    scene.add(ambientLight);

    // Imperative handle initialization
    const handle: PolarGlobeHandle = {
      scene,
      camera,
      renderer,
      earthGroup,
      earthMesh,
      markersGroup,
      setRotation: (y: number, x?: number, z?: number) => {
        earthGroup.rotation.y = y;
        if (x !== undefined) earthGroup.rotation.x = x;
        if (z !== undefined) earthGroup.rotation.z = z;
      },
      setCameraPosition: (x: number, y: number, z: number) => {
        camera.position.set(x, y, z);
        camera.lookAt(0, 0, 0);
      },
      setCameraDistance: (distance: number) => {
        camera.position.setLength(distance);
      },
      setActiveStation,
      setAutoRotate: (rotate: boolean) => {
        autoRotateRef.current = rotate;
      },
    };
    handleRef.current = handle;
    if (onReady) {
      onReady(handle);
    }

    // Animation Loop with Depth Occlusion check
    let animFrameId: number;
    let clock = 0;
    let lastTime = performance.now();
    const worldPos = new THREE.Vector3();

    const animate = (currentTime: number = performance.now()) => {
      animFrameId = requestAnimationFrame(animate);
      const delta = Math.min((currentTime - lastTime) * 0.001, 0.1);
      lastTime = currentTime;
      clock += delta;

      if (camera && earthGroup) {
        const camDir = camera.position.clone().normalize();

        markerObjects.forEach((mObj, stId) => {
          mObj.group.getWorldPosition(worldPos);
          const markerDir = worldPos.clone().normalize();
          const dot = markerDir.dot(camDir);

          // Hide marker if it is on the back hemisphere facing away from camera
          mObj.group.visible = dot > 0.08;

          // Pulse ring for active station if visible on front (~3.0s calm beacon cycle)
          if (stId === activeStationId && mObj.group.visible) {
            const pulseWave = Math.sin(clock * ((2 * Math.PI) / 3.0));
            const pulse = 1.0 + 0.25 * pulseWave;
            mObj.ringMesh.scale.set(pulse, pulse, 1);
            mObj.ringMat.opacity = 0.75 + 0.2 * pulseWave;
          }
        });
      }

      if (autoRotateRef.current) {
        if (rotationYPropRef.current === undefined) {
          earthGroup.rotation.y += rotationSpeedRef.current;
        }
        cloudMesh.rotation.y += rotationSpeedRef.current * 1.25;
        starfield.rotation.y -= rotationSpeedRef.current * 0.15;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();

      // Dispose scene objects
      scene.traverse((object) => {
        if ((object as THREE.Mesh).isMesh || (object as THREE.Points).isPoints) {
          const mesh = object as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();

          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat) => mat.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        }
      });

      // Dispose textures
      earthMap.dispose();
      lightsMap.dispose();
      cloudMap.dispose();
      cloudAlphaMap.dispose();

      // Dispose renderer
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 2. React prop updates listener (updates Three.js objects without re-creating scene)
  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;

    if (rotationX !== undefined) {
      handle.earthGroup.rotation.x = rotationX;
    }
    if (rotationY !== undefined) {
      handle.earthGroup.rotation.y = rotationY;
    }
    if (rotationZ !== undefined) {
      handle.earthGroup.rotation.z = rotationZ;
    }

    if (cameraPosition) {
      handle.camera.position.set(...cameraPosition);
    } else if (cameraDistance !== undefined) {
      handle.camera.position.setLength(cameraDistance);
    }
  }, [rotationX, rotationY, rotationZ, cameraDistance, cameraPosition]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ minHeight: '100%' }}
    />
  );
});

PolarGlobe.displayName = 'PolarGlobe';

export default PolarGlobe;
