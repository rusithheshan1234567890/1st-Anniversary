import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { soundService } from '../../services/soundService';

interface HeartMergeSceneProps {
  mergeProgress: number; // 0 (scattered petals) to 1 (fully formed beating heart)
  onMergeComplete?: () => void;
}

export const HeartMergeScene: React.FC<HeartMergeSceneProps> = ({
  mergeProgress,
  onMergeComplete,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const lightRef = useRef<THREE.PointLight | null>(null);
  const mergeValRef = useRef({ progress: mergeProgress });

  useEffect(() => {
    gsap.to(mergeValRef.current, {
      progress: mergeProgress,
      duration: 2.4,
      ease: 'power2.out',
      onComplete: () => {
        if (mergeProgress >= 0.99 && onMergeComplete) {
          onMergeComplete();
        }
      },
    });
  }, [mergeProgress, onMergeComplete]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c070a, 0.03);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    mount.appendChild(renderer.domElement);

    // Heart Center Light
    const heartLight = new THREE.PointLight(0xff2d55, 3.5, 10);
    heartLight.position.set(0, 0, 0);
    scene.add(heartLight);
    lightRef.current = heartLight;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffe4e6, 0.8);
    scene.add(ambientLight);

    // Generate 1,800 Petal Particles
    const particleCount = 1800;
    const currentPositions = new Float32Array(particleCount * 3);
    const originPositions = new Float32Array(particleCount * 3);
    const targetPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0xff0055); // Crimson Rose
    const color2 = new THREE.Color(0xff6b8b); // Blush Pink
    const color3 = new THREE.Color(0xffd166); // Golden Amber

    for (let i = 0; i < particleCount; i++) {
      // 1. Initial Scattered Whirlpool Position (Swirling romantic bloom)
      const r = 1.8 + Math.random() * 2.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.8;

      originPositions[i * 3] = r * Math.cos(theta) * Math.cos(phi);
      originPositions[i * 3 + 1] = r * Math.sin(phi);
      originPositions[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi);

      currentPositions[i * 3] = originPositions[i * 3];
      currentPositions[i * 3 + 1] = originPositions[i * 3 + 1];
      currentPositions[i * 3 + 2] = originPositions[i * 3 + 2];

      // 2. Parametric 3D Heart Target Position
      // t ranges from 0 to 2*PI
      const t = Math.random() * Math.PI * 2;
      // 3D Heart equation
      const scale = 0.16;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      // Volume jitter inside and in depth
      const depthJitter = (Math.random() - 0.5) * 1.6;
      const volumeScale = 0.7 + Math.random() * 0.35;

      targetPositions[i * 3] = x * scale * volumeScale;
      targetPositions[i * 3 + 1] = y * scale * volumeScale + 0.3;
      targetPositions[i * 3 + 2] = depthJitter;

      // Color Palette Distribution
      const mixRatio = Math.random();
      const pColor = mixRatio < 0.6 ? color1.clone().lerp(color2, mixRatio / 0.6) : color2.clone().lerp(color3, (mixRatio - 0.6) / 0.4);
      colors[i * 3] = pColor.r;
      colors[i * 3 + 1] = pColor.g;
      colors[i * 3 + 2] = pColor.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Petal Texture via Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.4, 'rgba(255, 120, 160, 0.85)');
      grad.addColorStop(1, 'rgba(255, 50, 100, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(32, 32, 32, 0, Math.PI * 2);
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.16,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    pointsRef.current = points;

    // Window Resize
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Mouse movement
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.4;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.4;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Heartbeat Audio Trigger timer
    let lastBeatTime = 0;
    let clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();
      const p = mergeValRef.current.progress;

      // Heartbeat pulse cycle (thump-thump every ~1.2s)
      const beatFreq = 1.1;
      const beatPhase = (time % beatFreq) / beatFreq;
      let heartbeatScale = 1.0;

      if (p > 0.8) {
        if (beatPhase < 0.15) {
          heartbeatScale = 1.0 + Math.sin((beatPhase / 0.15) * Math.PI) * 0.14;
        } else if (beatPhase >= 0.22 && beatPhase < 0.35) {
          heartbeatScale = 1.0 + Math.sin(((beatPhase - 0.22) / 0.13) * Math.PI) * 0.08;
        }

        // Trigger sound effect on beat peak
        if (time - lastBeatTime > beatFreq - 0.05) {
          lastBeatTime = time;
          soundService.playHeartbeat();
        }
      }

      // Interpolate positions between scattered and heart target
      const posArray = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const ox = originPositions[i * 3];
        const oy = originPositions[i * 3 + 1];
        const oz = originPositions[i * 3 + 2];

        const tx = targetPositions[i * 3];
        const ty = targetPositions[i * 3 + 1];
        const tz = targetPositions[i * 3 + 2];

        // Swirling effect during convergence
        const swirlAngle = (1.0 - p) * Math.PI * 3.0;
        const cosS = Math.cos(swirlAngle);
        const sinS = Math.sin(swirlAngle);

        const currentTx = tx * cosS - tz * sinS;
        const currentTz = tx * sinS + tz * cosS;

        // Smooth cubic blend
        const easeP = p * p * (3 - 2 * p);

        const basePosX = ox + (currentTx - ox) * easeP;
        const basePosY = oy + (ty - oy) * easeP;
        const basePosZ = oz + (currentTz - oz) * easeP;

        // Apply heartbeat scale when formed
        posArray[i * 3] = basePosX * (p > 0.6 ? heartbeatScale : 1.0);
        posArray[i * 3 + 1] = basePosY * (p > 0.6 ? heartbeatScale : 1.0);
        posArray[i * 3 + 2] = basePosZ * (p > 0.6 ? heartbeatScale : 1.0);
      }
      geometry.attributes.position.needsUpdate = true;

      // Group rotation
      points.rotation.y = time * 0.25 + mouseX;
      points.rotation.x = Math.sin(time * 0.4) * 0.08 - mouseY;

      // Light intensity pulses with heartbeat
      if (heartLight) {
        heartLight.intensity = (2.5 + (heartbeatScale - 1.0) * 12.0) * p;
      }

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
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
    />
  );
};
