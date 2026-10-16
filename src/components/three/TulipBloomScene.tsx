import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

interface TulipBloomSceneProps {
  bloomProgress: number; // 0 (closed bud) to 1 (full bloom)
  isCameraZooming?: boolean; // triggers camera fly-in into the core
  onZoomComplete?: () => void;
  interactiveParallax?: boolean;
}

export const TulipBloomScene: React.FC<TulipBloomSceneProps> = ({
  bloomProgress,
  isCameraZooming = false,
  onZoomComplete,
  interactiveParallax = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const petalsRef = useRef<THREE.Mesh[]>([]);
  const coreLightRef = useRef<THREE.PointLight | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mousePosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c070a, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.2);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    // Main Group
    const tulipGroup = new THREE.Group();
    scene.add(tulipGroup);
    groupRef.current = tulipGroup;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffe4e6, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xff99aa, 1.8);
    dirLight1.position.set(5, 8, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf43f5e, 1.0);
    dirLight2.position.set(-5, 4, -3);
    scene.add(dirLight2);

    const coreLight = new THREE.PointLight(0xffd166, 2.5, 6, 2);
    coreLight.position.set(0, 1.3, 0);
    tulipGroup.add(coreLight);
    coreLightRef.current = coreLight;

    // Stem: Curved tube
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -2.5, 0),
      new THREE.Vector3(0.08, -1.2, 0.05),
      new THREE.Vector3(-0.04, 0.2, -0.02),
      new THREE.Vector3(0, 1.0, 0),
    ]);
    const stemGeo = new THREE.TubeGeometry(stemCurve, 32, 0.09, 12, false);
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.4,
      metalness: 0.1,
    });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    tulipGroup.add(stemMesh);

    // Leaves
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.35, 1.0, 0.05, 2.0);
    leafShape.quadraticCurveTo(-0.35, 1.0, 0, 0);
    const leafGeo = new THREE.ShapeGeometry(leafShape, 16);
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      side: THREE.DoubleSide,
      roughness: 0.5,
    });

    const leaf1 = new THREE.Mesh(leafGeo, leafMat);
    leaf1.position.set(0.05, -1.2, 0);
    leaf1.rotation.set(0.2, 0.3, -0.35);
    leaf1.scale.set(0.7, 0.7, 0.7);
    tulipGroup.add(leaf1);

    const leaf2 = new THREE.Mesh(leafGeo, leafMat);
    leaf2.position.set(-0.05, -0.7, 0);
    leaf2.rotation.set(-0.1, -2.4, 0.4);
    leaf2.scale.set(0.6, 0.6, 0.6);
    tulipGroup.add(leaf2);

    // Central Stamen Core
    const stamenGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8);
    const stamenMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.6,
    });
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const stamen = new THREE.Mesh(stamenGeo, stamenMat);
      stamen.position.set(Math.cos(angle) * 0.12, 1.25, Math.sin(angle) * 0.12);
      stamen.rotation.z = Math.cos(angle) * 0.2;
      stamen.rotation.x = Math.sin(angle) * 0.2;
      tulipGroup.add(stamen);
    }

    const pistilGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const pistilMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    });
    const pistil = new THREE.Mesh(pistilGeo, pistilMat);
    pistil.position.set(0, 1.25, 0);
    tulipGroup.add(pistil);

    // Tulip Petals: 6 Petals (3 inner, 3 outer)
    // Create petal curve shape
    const petalCurve = new THREE.Shape();
    petalCurve.moveTo(0, 0);
    petalCurve.bezierCurveTo(0.45, 0.3, 0.55, 1.1, 0, 1.6);
    petalCurve.bezierCurveTo(-0.55, 1.1, -0.45, 0.3, 0, 0);

    const petalGeo = new THREE.ShapeGeometry(petalCurve, 24);
    // Deform into cup curve along Z
    const posAttr = petalGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const y = posAttr.getY(i);
      const x = posAttr.getX(i);
      // Cup curvature
      const z = Math.sin((y / 1.6) * Math.PI) * 0.28 - (x * x) * 0.3;
      posAttr.setZ(i, z);
    }
    petalGeo.computeVertexNormals();

    const outerPetalMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e, // Romantic Rose Coral
      emissive: 0x9f1239,
      emissiveIntensity: 0.25,
      roughness: 0.35,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });

    const innerPetalMat = new THREE.MeshStandardMaterial({
      color: 0xfb7185, // Tender Blush Pink
      emissive: 0xbe123c,
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    const petals: THREE.Mesh[] = [];

    // Outer 3 Petals
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const petalMesh = new THREE.Mesh(petalGeo, outerPetalMat);
      petalMesh.position.set(0, 1.05, 0);
      petalMesh.rotation.y = angle;
      // Tilt slightly inward as closed bud
      petalMesh.rotation.x = 0.15;
      petalMesh.scale.set(1.05, 1.05, 1.05);
      tulipGroup.add(petalMesh);
      petals.push(petalMesh);
    }

    // Inner 3 Petals (rotated 60 deg)
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + Math.PI / 3;
      const petalMesh = new THREE.Mesh(petalGeo, innerPetalMat);
      petalMesh.position.set(0, 1.05, 0);
      petalMesh.rotation.y = angle;
      petalMesh.rotation.x = 0.08;
      petalMesh.scale.set(0.95, 0.95, 0.95);
      tulipGroup.add(petalMesh);
      petals.push(petalMesh);
    }

    petalsRef.current = petals;

    // Floating Sparkle Particles around the flower
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 4.5;
      particlePos[i * 3 + 1] = Math.random() * 3.5 - 0.5;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 4.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfed7aa,
      size: 0.06,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    tulipGroup.add(particlePoints);

    // Window resize listener
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Mouse movement listener for gentle parallax
    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      mousePosRef.current.targetX = nx * 0.4;
      mousePosRef.current.targetY = ny * 0.3;
    };
    if (interactiveParallax) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Animation loop
    let clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth mouse parallax
      mousePosRef.current.x += (mousePosRef.current.targetX - mousePosRef.current.x) * 0.05;
      mousePosRef.current.y += (mousePosRef.current.targetY - mousePosRef.current.y) * 0.05;

      tulipGroup.rotation.y = time * 0.15 + mousePosRef.current.x;
      tulipGroup.rotation.x = mousePosRef.current.y * 0.5;

      // Breathing effect on flower
      const breathing = Math.sin(time * 1.5) * 0.02;
      tulipGroup.position.y = breathing;

      // Particle float
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += delta * 0.15;
        if (positions[i * 3 + 1] > 3.0) {
          positions[i * 3 + 1] = -0.5;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [interactiveParallax]);

  // Update Petals on bloomProgress change
  useEffect(() => {
    if (petalsRef.current.length === 0) return;

    petalsRef.current.forEach((petal, idx) => {
      // 0 to 1 bloom
      const isInner = idx >= 3;
      // Inner petals open a bit less than outer
      const targetOpening = isInner ? bloomProgress * 0.48 : bloomProgress * 0.68;
      const initialTilt = isInner ? 0.08 : 0.15;

      // Outer petals angle out radially
      gsap.to(petal.rotation, {
        x: initialTilt + targetOpening,
        duration: 0.8,
        ease: 'power2.out',
      });

      // Scale petal width slightly on bloom
      gsap.to(petal.scale, {
        x: 1.0 + bloomProgress * 0.2,
        z: 1.0 + bloomProgress * 0.15,
        duration: 0.8,
        ease: 'power2.out',
      });
    });

    if (coreLightRef.current) {
      gsap.to(coreLightRef.current, {
        intensity: 2.5 + bloomProgress * 8.0,
        distance: 6 + bloomProgress * 4,
        duration: 0.8,
      });
    }
  }, [bloomProgress]);

  // Handle camera zoom into glowing core (Bloom Transition)
  useEffect(() => {
    if (!isCameraZooming || !cameraRef.current) return;

    const camera = cameraRef.current;
    gsap.timeline({
      onComplete: () => {
        if (onZoomComplete) onZoomComplete();
      },
    })
      .to(camera.position, {
        x: 0,
        y: 1.35,
        z: 1.2,
        duration: 2.2,
        ease: 'power3.inOut',
      })
      .to(camera.position, {
        z: 0.45,
        duration: 1.0,
        ease: 'power2.in',
      });
  }, [isCameraZooming, onZoomComplete]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
    />
  );
};
