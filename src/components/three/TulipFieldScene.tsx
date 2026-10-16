import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MemoryItem } from '../../types';

interface TulipFieldSceneProps {
  currentStoneIndex: number;
  totalStones?: number;
  onSelectStone?: (stoneIndex: number) => void;
  onSelectMemoryTulip?: (memoryIndex: number) => void;
  memories?: MemoryItem[];
  windSpeed?: number;
  lookYawTarget?: number;
  onLookYawChange?: (yaw: number) => void;
  isPaused?: boolean;
  viewMode?: 'elevated' | 'overhead' | 'pathway';
  discoveredIndices?: number[];
  showAllThumbnails?: boolean;
  zoomLevel?: number;
  onZoomChange?: (zoom: number) => void;
}

/**
 * Creates a realistically curved 3D botanical tulip petal geometry.
 * Curves outward at the base and curls gracefully inward at the top to form a lush flower cup.
 */
function createCurvedPetalGeo(
  width: number,
  height: number,
  archDepth: number,
  inwardCurl: number,
  widthPower: number = 0.65
): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(width, height, 10, 14);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const rawX = pos.getX(i);
    const rawY = pos.getY(i);
    const u = rawX / (width * 0.5); // -1.0 to 1.0
    const v = (rawY + height * 0.5) / height; // 0.0 (base) to 1.0 (tip)

    // Tulip petal profile: narrow base, wide mid-body, rounded soft point at apex
    const shapeProfile = Math.sin(Math.pow(Math.max(0, v), widthPower) * Math.PI);
    const newX = u * (width * 0.5) * shapeProfile;
    pos.setX(i, newX);

    // Convex cup curvature: petal arches outward in the center
    const cupArch = Math.sin(v * Math.PI) * archDepth;
    // Lateral curvature (scoop shape along X)
    const lateralScoop = (1.0 - Math.cos(u * Math.PI * 0.5)) * (archDepth * 0.35);
    // Inward curling toward the center at the upper rim
    const topCurl = -Math.pow(v, 2.0) * inwardCurl;

    pos.setZ(i, cupArch - lateralScoop + topCurl);
    // Anchor base to origin (0, 0, 0)
    pos.setY(i, rawY + height * 0.5);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates an elegant curved tulip leaf that hugs the stem and arches outward.
 */
function createCurvedLeafGeo(
  width: number,
  height: number,
  curveOut: number
): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(width, height, 8, 12);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const rawX = pos.getX(i);
    const rawY = pos.getY(i);
    const u = rawX / (width * 0.5);
    const v = (rawY + height * 0.5) / height;

    const shapeProfile = Math.sin(Math.pow(Math.max(0, v), 0.5) * Math.PI);
    pos.setX(i, u * (width * 0.5) * shapeProfile);

    // Arch outward away from stem
    const archZ = Math.sin(v * Math.PI * 0.8) * curveOut;
    pos.setZ(i, archZ);
    pos.setY(i, rawY + height * 0.5);
  }

  geo.computeVertexNormals();
  return geo;
}

export const TulipFieldScene: React.FC<TulipFieldSceneProps> = ({
  currentStoneIndex,
  totalStones = 16,
  onSelectStone,
  onSelectMemoryTulip,
  memories = [],
  windSpeed = 1.0,
  lookYawTarget = 0,
  onLookYawChange,
  isPaused = false,
  viewMode = 'elevated',
  discoveredIndices = [],
  showAllThumbnails = false,
  zoomLevel = 1.0,
  onZoomChange,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Mutable refs to prevent React state changes from re-creating the WebGL scene
  const currentStoneRef = useRef(currentStoneIndex);
  const hopProgressRef = useRef(0);
  const windSpeedRef = useRef(windSpeed);
  const memoriesRef = useRef(memories);
  const onSelectStoneRef = useRef(onSelectStone);
  const onSelectMemoryTulipRef = useRef(onSelectMemoryTulip);
  const onLookYawChangeRef = useRef(onLookYawChange);
  const isPausedRef = useRef(isPaused);
  const viewModeRef = useRef(viewMode);
  const discoveredIndicesRef = useRef(discoveredIndices);
  const showAllThumbnailsRef = useRef(showAllThumbnails);
  const targetZoomRef = useRef(zoomLevel);
  const currentZoomRef = useRef(zoomLevel);
  const onZoomChangeRef = useRef(onZoomChange);

  // Look around state refs (standing on stone and looking left/right/both sides)
  const targetLookYawRef = useRef(lookYawTarget);
  const targetLookPitchRef = useRef(0);
  const currentLookYawRef = useRef(lookYawTarget);
  const currentLookPitchRef = useRef(0);

  // Keep refs synchronized without scene reloads
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  useEffect(() => {
    discoveredIndicesRef.current = discoveredIndices;
  }, [discoveredIndices]);

  useEffect(() => {
    showAllThumbnailsRef.current = showAllThumbnails;
  }, [showAllThumbnails]);

  useEffect(() => {
    targetZoomRef.current = zoomLevel;
  }, [zoomLevel]);

  useEffect(() => {
    onZoomChangeRef.current = onZoomChange;
  }, [onZoomChange]);

  useEffect(() => {
    currentStoneRef.current = currentStoneIndex;
    hopProgressRef.current = 1.0;
  }, [currentStoneIndex]);

  useEffect(() => {
    targetLookYawRef.current = lookYawTarget;
  }, [lookYawTarget]);

  useEffect(() => {
    windSpeedRef.current = windSpeed;
  }, [windSpeed]);

  useEffect(() => {
    memoriesRef.current = memories;
  }, [memories]);

  useEffect(() => {
    onSelectStoneRef.current = onSelectStone;
  }, [onSelectStone]);

  useEffect(() => {
    onSelectMemoryTulipRef.current = onSelectMemoryTulip;
  }, [onSelectMemoryTulip]);

  useEffect(() => {
    onLookYawChangeRef.current = onLookYawChange;
  }, [onLookYawChange]);

  // Main Three.js lifecycle: runs ONCE on mount for silky 60fps stability
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let animId: number;
    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    // 1. Scene & Atmosphere (Sunset Twilight Fog)
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x190d16, 0.032);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 75);
    camera.position.set(0, 1.65, 8.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setClearColor(0x130811);
    mount.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffdfd3, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffa278, 1.3);
    sunLight.position.set(12, 14, 8);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 0.65);
    rimLight.position.set(-10, 8, -15);
    scene.add(rimLight);

    const pathLight = new THREE.PointLight(0xffedd5, 1.6, 12, 1.2);
    scene.add(pathLight);

    // Helper: calculate exact X centerline of the winding stone pathway for any world Z
    const getPathCenterX = (worldZ: number) => {
      const t = Math.max(0, Math.min(1, (4.2 - worldZ) / 32));
      return Math.sin(t * Math.PI * 2.8) * 1.55;
    };

    // 3. Ground Terrain (Smooth & Level Along Stone Pathway to prevent ANY clipping or fractured stones)
    const groundGeo = new THREE.PlaneGeometry(36, 68, 32, 32);
    const groundPos = groundGeo.attributes.position;
    for (let i = 0; i < groundPos.count; i++) {
      const gx = groundPos.getX(i);
      const gz = groundPos.getY(i); // gz maps to world Z upon -PI/2 rotation

      const pathX = getPathCenterX(gz);
      const distFromPathway = Math.abs(gx - pathX);

      // Within 2.2m of the pathway centerline, terrain is kept completely smooth and level
      // so stones never clip or have chunks missing ("kali kali thibba samahara than hadanna")
      const pathwayMoundFactor = Math.min(1, Math.max(0, (distFromPathway - 2.0) / 1.6));
      const hill = (Math.sin(gz * 0.25) * 0.16 + Math.cos(gx * 0.35) * 0.1) * pathwayMoundFactor;
      const bankElevation = Math.max(0, distFromPathway - 2.4) * 0.15;

      groundPos.setZ(i, hill + bankElevation);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x140a10,
      roughness: 0.95,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    scene.add(ground);

    // 4. Stepping Stones Layout (Winding S-Curve Path)
    // 36 segments for perfectly circular, smooth round stones ("raumatama load wela thiyenna")
    // Height 0.22 placed at y = 0.11 so top face sits proudly at Y = 0.22, immune to ground clipping
    const stonePositions: THREE.Vector3[] = [];
    const stoneMeshes: THREE.Mesh[] = [];
    const hitColliders: THREE.Mesh[] = [];

    const stoneGeo = new THREE.CylinderGeometry(0.64, 0.72, 0.22, 36);
    // Subtle golden rim ring placed ON TOP face of the stone (y = 0.112)
    const ringGeo = new THREE.RingGeometry(0.52, 0.62, 36);

    const stoneMatNormal = new THREE.MeshStandardMaterial({
      color: 0x473b43,
      roughness: 0.85,
      metalness: 0.1,
    });
    const stoneMatActive = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.55,
      roughness: 0.45,
    });

    for (let i = 0; i < totalStones; i++) {
      const t = i / (totalStones - 1);
      const z = 4.2 - t * 32;
      const x = Math.sin(t * Math.PI * 2.8) * 1.55;
      const pos = new THREE.Vector3(x, 0.11, z);
      stonePositions.push(pos);

      const stone = new THREE.Mesh(stoneGeo, i === currentStoneIndex ? stoneMatActive : stoneMatNormal);
      stone.position.copy(pos);
      stone.rotation.y = (i * 0.45) % Math.PI;
      stone.userData = { isStone: true, stoneIndex: i };

      // Golden Halo Ring on the top face of the stone (never buried by ground!)
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: i === currentStoneIndex ? 0.85 : 0.3,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.112; // Exactly on the top surface of the stone
      stone.add(ring);

      scene.add(stone);
      stoneMeshes.push(stone);
      hitColliders.push(stone);
    }

    // 5. Shared Geometries for Tulip Anatomy
    const stemGeo = new THREE.CylinderGeometry(0.018, 0.024, 0.88, 8);
    stemGeo.translate(0, 0.44, 0);

    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x22543d,
      roughness: 0.7,
      metalness: 0.1,
    });

    const outerPetalGeo = createCurvedPetalGeo(0.24, 0.42, 0.14, 0.08, 0.65);
    const innerPetalGeo = createCurvedPetalGeo(0.22, 0.38, 0.12, 0.11, 0.6);
    const leaf1Geo = createCurvedLeafGeo(0.18, 0.72, 0.24);
    const leaf2Geo = createCurvedLeafGeo(0.15, 0.64, 0.2);

    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x1f4e38,
      roughness: 0.75,
      side: THREE.DoubleSide,
    });

    const stamenCoreGeo = new THREE.CylinderGeometry(0.02, 0.03, 0.14, 6);
    const stamenCoreMat = new THREE.MeshBasicMaterial({ color: 0x2d1810 });

    const pollenHeadGeo = new THREE.SphereGeometry(0.035, 6, 6);
    const pollenMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    const tulipHitGeo = new THREE.CylinderGeometry(0.78, 0.78, 2.2, 8);
    const tulipHitMat = new THREE.MeshBasicMaterial({
      visible: false,
    });

    const haloGeo = new THREE.RingGeometry(0.35, 0.46, 20);
    const sparkleDiamondGeo = new THREE.OctahedronGeometry(0.09, 0);

    // Floating thumbnail badge geometries & texture loader
    const textureLoader = new THREE.TextureLoader();
    const textureCache = new Map<string, THREE.Texture>();
    const badgeFrameGeo = new THREE.PlaneGeometry(0.56, 0.56);
    const badgePhotoGeo = new THREE.PlaneGeometry(0.48, 0.48);
    const badgePinGeo = new THREE.CircleGeometry(0.065, 16);

    const createBadgeForTulip = (tulipGroup: THREE.Group, memoryItem: MemoryItem) => {
      const thumbUrl = memoryItem.thumbnailUrl || memoryItem.imageUrl;
      if (!textureCache.has(thumbUrl)) {
        const tex = textureLoader.load(thumbUrl);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = false;
        tex.minFilter = THREE.LinearFilter;
        textureCache.set(thumbUrl, tex);
      }
      const tex = textureCache.get(thumbUrl)!;

      const badgeGroup = new THREE.Group();
      badgeGroup.position.y = 1.76;

      const isVideo = !!memoryItem.videoUrl;
      const frameMat = new THREE.MeshBasicMaterial({
        color: isVideo ? 0xf59e0b : 0xffffff,
        side: THREE.DoubleSide,
      });
      const frame = new THREE.Mesh(badgeFrameGeo, frameMat);
      badgeGroup.add(frame);

      const photoMat = new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.DoubleSide,
      });
      const photo = new THREE.Mesh(badgePhotoGeo, photoMat);
      photo.position.z = 0.01;
      badgeGroup.add(photo);

      // Top heart / star pin on the floating badge
      const pinMat = new THREE.MeshBasicMaterial({
        color: isVideo ? 0xef4444 : 0xf43f5e,
        side: THREE.DoubleSide,
      });
      const pin = new THREE.Mesh(badgePinGeo, pinMat);
      pin.position.set(0, 0.28, 0.02);
      badgeGroup.add(pin);

      // Large forgiving hit collider so clicking on the floating thumbnail also opens the memory
      const badgeHitGeo = new THREE.BoxGeometry(0.85, 0.85, 0.25);
      const badgeHit = new THREE.Mesh(badgeHitGeo, tulipHitMat);
      badgeHit.position.set(0, 0, 0.01);
      badgeHit.userData = {
        isTulip: true,
        memoryIndex: tulipGroup.userData.memoryIndex,
      };
      badgeGroup.add(badgeHit);
      hitColliders.push(badgeHit);

      tulipGroup.add(badgeGroup);
      tulipGroup.userData.thumbnailBadge = badgeGroup;
    };

    const materialCache = new Map<number, THREE.MeshStandardMaterial>();
    const getPetalMaterial = (hex: number) => {
      if (!materialCache.has(hex)) {
        materialCache.set(
          hex,
          new THREE.MeshStandardMaterial({
            color: hex,
            roughness: 0.35,
            metalness: 0.15,
            side: THREE.DoubleSide,
          })
        );
      }
      return materialCache.get(hex)!;
    };

    const tulipGroups: THREE.Group[] = [];

    // 6. Master Tulip Mesh Builder
    const createTulipMesh = (
      colorHex: number,
      isMemory: boolean,
      mappedMemoryIndex: number,
      memoryItem?: MemoryItem
    ) => {
      const group = new THREE.Group();

      // Stem
      const stem = new THREE.Mesh(stemGeo, stemMat);
      group.add(stem);

      // Leaves
      const leaf1 = new THREE.Mesh(leaf1Geo, leafMat);
      leaf1.rotation.y = 0.4;
      leaf1.rotation.z = -0.15;
      leaf1.position.set(-0.02, 0.08, 0);
      group.add(leaf1);

      const leaf2 = new THREE.Mesh(leaf2Geo, leafMat);
      leaf2.rotation.y = 2.6;
      leaf2.rotation.z = -0.18;
      leaf2.position.set(0.02, 0.12, 0);
      group.add(leaf2);

      // Blossom Head
      const blossomHead = new THREE.Group();
      blossomHead.position.y = 0.86;

      const petalMat = getPetalMaterial(colorHex);

      // Center Stamen & Core
      const stamen = new THREE.Mesh(stamenCoreGeo, stamenCoreMat);
      stamen.position.y = 0.06;
      blossomHead.add(stamen);

      const pollen = new THREE.Mesh(pollenHeadGeo, pollenMat);
      pollen.position.y = 0.14;
      blossomHead.add(pollen);

      // 3 Outer Petals (0°, 120°, 240°)
      for (let p = 0; p < 3; p++) {
        const angle = (p * Math.PI * 2) / 3;
        const outerPetal = new THREE.Mesh(outerPetalGeo, petalMat);
        outerPetal.rotation.y = angle;
        outerPetal.position.set(
          Math.sin(angle) * 0.045,
          0.01,
          Math.cos(angle) * 0.045
        );
        blossomHead.add(outerPetal);
      }

      // 3 Inner Petals (60°, 180°, 300°)
      for (let p = 0; p < 3; p++) {
        const angle = (p * Math.PI * 2) / 3 + Math.PI / 3;
        const innerPetal = new THREE.Mesh(innerPetalGeo, petalMat);
        innerPetal.rotation.y = angle;
        innerPetal.position.set(
          Math.sin(angle) * 0.025,
          0.02,
          Math.cos(angle) * 0.025
        );
        blossomHead.add(innerPetal);
      }

      group.add(blossomHead);

      // Video Memory Special Glowing Beacon vs Photo Memory Glow
      const isVideoMemory = !!memoryItem?.videoUrl;

      if (isMemory) {
        // Glowing aura ring around stem
        const haloMat = new THREE.MeshBasicMaterial({
          color: isVideoMemory ? 0xf59e0b : colorHex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: isVideoMemory ? 0.95 : 0.75,
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.rotation.x = Math.PI / 2;
        halo.position.y = 1.15;
        group.add(halo);

        // Floating Diamond Star (Golden for video, White for photo)
        const sparkleMat = new THREE.MeshBasicMaterial({
          color: isVideoMemory ? 0xfef08a : 0xffffff,
          transparent: true,
          opacity: 0.95,
        });
        const sparkle = new THREE.Mesh(sparkleDiamondGeo, sparkleMat);
        sparkle.position.y = 1.38;
        if (isVideoMemory) {
          sparkle.scale.setScalar(1.35);
        }
        group.add(sparkle);

        // Video memory beacon uses glowing emissive geometries with zero GPU light shader overhead
        if (isVideoMemory) {
          sparkle.scale.setScalar(1.6);
        }

        group.userData.sparkleMesh = sparkle;
        group.userData.haloMesh = halo;
        group.userData.isVideo = isVideoMemory;
      }

      // User data for animations and interactions
      group.userData = {
        ...group.userData,
        isTulip: true,
        isMemory,
        memoryIndex: mappedMemoryIndex,
        memoryItem,
        colorHex,
        phase: Math.random() * Math.PI * 2,
      };

      // 5. Invisible Hit Collider for INSTANT, ZERO-LAG RAYCASTING
      if (isMemory) {
        const collider = new THREE.Mesh(tulipHitGeo, tulipHitMat);
        collider.position.y = 0.95;
        collider.userData = {
          isTulip: true,
          memoryIndex: mappedMemoryIndex,
        };
        group.add(collider);
        hitColliders.push(collider);
      }

      return group;
    };

    // 7. Place ALL 65 Dedicated Memory Tulips Along Stepping Stones
    // "Garden eke bima gal tika depasa hodin madak ida thabanna":
    // Generous 2.2m - 4.3m clearance on BOTH Left Bank and Right Bank so standing on stone user has open room on both sides!
    const currentMemories = memoriesRef.current;
    currentMemories.forEach((mem, idx) => {
      const stoneIdx = Math.min(
        totalStones - 1,
        mem.stoneIndex !== undefined
          ? mem.stoneIndex
          : Math.floor((idx / Math.max(1, currentMemories.length - 1)) * (totalStones - 1))
      );
      const stonePos = stonePositions[stoneIdx] || new THREE.Vector3(0, 0, 0);

      // Alternate left side (-1) and right side (+1)
      const side = idx % 2 === 0 ? -1 : 1;
      // Staggered depth away from the stone path: 2.2m to 4.3m leaves ample open breathing space on both sides of stones!
      const depth = 2.2 + ((idx * 7) % 5) * 0.42 + ((idx % 3) * 0.24);
      const offsetZ = (((idx * 5) % 7) - 3) * 0.32;

      const x = stonePos.x + side * depth;
      const z = stonePos.z + offsetZ;

      const colorInt = mem.color
        ? parseInt(mem.color.replace('#', '0x'), 16)
        : 0xef4444;

      const memTulip = createTulipMesh(colorInt, true, idx, mem);
      memTulip.position.set(x, 0, z);
      // Give video memories slightly larger presence
      memTulip.scale.setScalar(mem.videoUrl ? 1.25 : 1.1);

      scene.add(memTulip);
      tulipGroups.push(memTulip);
    });

    // 8. Meadow Tulips (Scattered purely decorative background flowers well outside the pathway)
    const meadowColors = [0xef4444, 0xf43f5e, 0xec4899, 0xa855f7, 0xf59e0b, 0x3b82f6];
    const meadowCount = 50;
    for (let i = 0; i < meadowCount; i++) {
      const z = -28 + (i / meadowCount) * 38;
      const side = i % 2 === 0 ? 1 : -1;
      // Positioned 4.4m - 9.4m away to keep pathway corridor completely open
      const distFromCenter = 4.4 + Math.pow(Math.random(), 0.85) * 5.0;
      const x = side * distFromCenter;

      const color = meadowColors[i % meadowColors.length];
      const wildTulip = createTulipMesh(color, false, -1);

      wildTulip.position.set(x, 0, z);
      wildTulip.scale.setScalar(0.75 + Math.random() * 0.3);
      wildTulip.rotation.y = Math.random() * Math.PI * 2;

      scene.add(wildTulip);
      tulipGroups.push(wildTulip);
    }

    // 9. Romantic Fairy Dust Particles
    const dustCount = 85;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 22;
      dustPos[i * 3 + 1] = Math.random() * 3.6 + 0.3;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 38;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xffeedd,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);

    // 9b. Dense White Twinkling Night Stars Filling the Sky Above Flowers
    // ("Mal nathi mal walata uda kalu pata kotasa sampurnama sudu dot tharuwalin purawanna")
    const createStarDotTexture = (): THREE.Texture => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d')!;

      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.65, 'rgba(255, 245, 250, 0.45)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.fill();

      const tex = new THREE.CanvasTexture(canvas);
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
      return tex;
    };

    const starTexture = createStarDotTexture();
    const starCount = 1200; // Densely fill the upper black expanse with glowing stars
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      if (i < 700) {
        // Celestial dome distribution surrounding the garden
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 0.88 + 0.08); // High sky down towards horizon
        const radius = 28 + Math.random() * 26;

        starPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        starPos[i * 3 + 1] = 2.4 + radius * Math.cos(phi); // Elevated above the flowers (2.4m to 35m)
        starPos[i * 3 + 2] = -12 + radius * Math.sin(phi) * Math.sin(theta);
      } else {
        // Direct field canopy directly above the stepping stones and tulips
        starPos[i * 3] = (Math.random() - 0.5) * 44;
        starPos[i * 3 + 1] = 2.6 + Math.random() * 22; // In the black area directly above flowers
        starPos[i * 3 + 2] = 16 - Math.random() * 58;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));

    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.28,
      map: starTexture,
      transparent: true,
      opacity: 0.96,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false, // CRITICAL: fog: false prevents Three.js fog from swallowing the stars in the upper sky!
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // 10. Smooth Pointer Drag (Looking Around Both Sides) & Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let isPointerDown = false;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerDragDistance = 0;

    const doRaycastClick = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(hitColliders, false);

      if (hits.length > 0) {
        // Prioritize memory tulip click first so flowers always open
        const tulipHit = hits.find(
          (h) => h.object.userData.isTulip && h.object.userData.memoryIndex >= 0
        );
        if (tulipHit && onSelectMemoryTulipRef.current) {
          onSelectMemoryTulipRef.current(tulipHit.object.userData.memoryIndex);
          return;
        }

        const stoneHit = hits.find((h) => h.object.userData.isStone);
        if (stoneHit && onSelectStoneRef.current) {
          onSelectStoneRef.current(stoneHit.object.userData.stoneIndex);
          return;
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Only initiate pointer down if clicked directly on the WebGL canvas
      if (e.target !== renderer.domElement) {
        isPointerDown = false;
        return;
      }
      isPointerDown = true;
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
      pointerDragDistance = 0;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isPointerDown) {
        const dx = e.clientX - pointerStartX;
        const dy = e.clientY - pointerStartY;
        pointerDragDistance += Math.abs(dx) + Math.abs(dy);
        pointerStartX = e.clientX;
        pointerStartY = e.clientY;

        // Smooth swipe direction:
        // Full 360-degree panoramic rotation
        const sensitivity = 0.0032;
        targetLookYawRef.current -= dx * sensitivity;

        // Pitch clamp (gentle up/down look)
        targetLookPitchRef.current = Math.max(
          -0.45,
          Math.min(0.45, targetLookPitchRef.current + dy * 0.0022)
        );

        if (onLookYawChangeRef.current) {
          onLookYawChangeRef.current(targetLookYawRef.current);
        }
      } else {
        // Throttled pointer hover cursor check (every 120ms) when pointer is not down
        const now = performance.now();
        if (now - lastHoverTime > 120) {
          lastHoverTime = now;
          // Check if hover is over an overlay UI element
          const topElement = document.elementFromPoint(e.clientX, e.clientY);
          if (topElement && topElement !== renderer.domElement) {
            renderer.domElement.style.cursor = 'default';
            return;
          }

          const rect = renderer.domElement.getBoundingClientRect();
          mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

          raycaster.setFromCamera(mouse, camera);
          const hits = raycaster.intersectObjects(hitColliders, false);
          renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
        }
      }
    };

    let lastHoverTime = 0;

    const handlePointerUp = (e: PointerEvent) => {
      if (!isPointerDown) return;
      isPointerDown = false;

      // Do NOT trigger flower click if pointerup occurred over UI overlays / option bar
      if (e.target !== renderer.domElement) return;

      const topElement = document.elementFromPoint(e.clientX, e.clientY);
      if (topElement && topElement !== renderer.domElement) return;

      // Tap threshold ensures intentional clicks register without drag jitter
      if (pointerDragDistance < 22) {
        doRaycastClick(e.clientX, e.clientY);
      }
    };

    // 3D Camera Zoom with Mouse Wheel ("mal zoom karala balanna puluwan")
    const handleWheel = (e: WheelEvent) => {
      // Do not zoom if mouse is over an overlay UI element (like modal or drawer)
      const topElement = document.elementFromPoint(e.clientX, e.clientY);
      if (topElement && topElement !== renderer.domElement) return;

      e.preventDefault();
      const zoomDelta = -e.deltaY * 0.0012;
      const nextZoom = Math.max(0.7, Math.min(2.5, targetZoomRef.current + zoomDelta));
      targetZoomRef.current = nextZoom;
      if (onZoomChangeRef.current) {
        onZoomChangeRef.current(+nextZoom.toFixed(2));
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

    // Window resize handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 11. High-Performance Render Loop with Smooth Hop Physics & Look-Around
    const clock = new THREE.Clock();
    let lastRenderedStone = -1;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // When video or photo modal is opened, pause 3D rendering so GPU/CPU is 100% dedicated to smooth video & instant photo viewing
      if (isPausedRef.current) {
        return;
      }

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Camera follows current stone with smooth hop arc & elevated / overhead view modes
      const stoneIdx = Math.max(0, Math.min(totalStones - 1, currentStoneRef.current));
      const targetStonePt = stonePositions[stoneIdx] || new THREE.Vector3(0, 0, 0);

      const mode = viewModeRef.current;
      const isOverhead = mode === 'overhead';
      const isPathway = mode === 'pathway';
      // Elevated: 2.95m (clearly above flower tops, looking across & down gracefully)
      // Overhead: 7.8m (aerial birds-eye view looking directly down from above)
      // Pathway: 1.85m (walking at intimate eye level)
      const baseCamY = isOverhead ? 7.8 : isPathway ? 1.85 : 2.95;
      const camTargetZ = targetStonePt.z + (isOverhead ? 1.2 : isPathway ? 2.6 : 3.4);
      const camTargetX = targetStonePt.x;

      // Hop arc physics
      let hopYOffset = 0;
      if (hopProgressRef.current > 0) {
        hopProgressRef.current = Math.max(0, hopProgressRef.current - delta * 2.4);
        const arc = Math.sin((1 - hopProgressRef.current) * Math.PI);
        hopYOffset = arc * 0.42;
      }

      // Smooth camera interpolation to stone position and height
      camera.position.x += (camTargetX - camera.position.x) * 0.085;
      camera.position.z += (camTargetZ - camera.position.z) * 0.085;
      camera.position.y += (baseCamY + hopYOffset + Math.sin(time * 1.5) * 0.02 - camera.position.y) * 0.085;

      // Smooth camera zoom interpolation ("mal zoom karala balanna")
      currentZoomRef.current +=
        (targetZoomRef.current - currentZoomRef.current) * 0.1;
      if (Math.abs(camera.zoom - currentZoomRef.current) > 0.001) {
        camera.zoom = currentZoomRef.current;
        camera.updateProjectionMatrix();
      }

      // Smooth look-around interpolation (Standing on rock looking at both sides)
      currentLookYawRef.current +=
        (targetLookYawRef.current - currentLookYawRef.current) * 0.065;
      currentLookPitchRef.current +=
        (targetLookPitchRef.current - currentLookPitchRef.current) * 0.065;

      const lookDist = isOverhead ? 4.5 : 6.2;
      const forwardX = Math.sin(currentLookYawRef.current) * lookDist;
      const forwardZ = -Math.cos(currentLookYawRef.current) * lookDist;
      const forwardY = isOverhead
        ? -6.6 + Math.sin(currentLookPitchRef.current) * 2.0
        : isPathway
        ? -0.25 + Math.sin(currentLookPitchRef.current) * 2.2
        : -1.05 + Math.sin(currentLookPitchRef.current) * 2.4;

      camera.lookAt(
        camera.position.x + forwardX,
        camera.position.y + forwardY,
        camera.position.z + forwardZ
      );

      // Light position follows current camera focus
      pathLight.position.set(camTargetX, isOverhead ? 5.5 : 2.4, targetStonePt.z);

      // Active stone highlight - only change mesh materials when active stone changes
      const activeIdx = currentStoneRef.current;
      if (activeIdx !== lastRenderedStone) {
        lastRenderedStone = activeIdx;
        stoneMeshes.forEach((st, idx) => {
          st.material = idx === activeIdx ? stoneMatActive : stoneMatNormal;
        });
      }
      // Warm pulsing golden ring only on the active stone
      if (activeIdx >= 0 && activeIdx < stoneMeshes.length) {
        const activeRing = stoneMeshes[activeIdx]?.children[0] as THREE.Mesh;
        if (activeRing?.material) {
          (activeRing.material as THREE.MeshBasicMaterial).opacity =
            0.75 + Math.sin(time * 4) * 0.2;
        }
      }

      // Synchronize floating thumbnail badges for discovered flowers & organic wind sway
      const speed = windSpeedRef.current;
      const discoveredSet = new Set(discoveredIndicesRef.current || []);
      const showAll = showAllThumbnailsRef.current;

      tulipGroups.forEach((tulip) => {
        const u = tulip.userData;
        const shouldShowBadge =
          u.isMemory && u.memoryItem && (showAll || discoveredSet.has(u.memoryIndex));

        if (shouldShowBadge) {
          if (!u.thumbnailBadge) {
            createBadgeForTulip(tulip, u.memoryItem);
          }
          if (u.thumbnailBadge && !u.thumbnailBadge.visible) {
            u.thumbnailBadge.visible = true;
          }
        } else if (u.thumbnailBadge && u.thumbnailBadge.visible) {
          u.thumbnailBadge.visible = false;
        }

        // Floating thumbnail badge bobs gracefully and aligns with camera projection
        if (u.thumbnailBadge?.visible) {
          u.thumbnailBadge.quaternion.copy(camera.quaternion);
          u.thumbnailBadge.position.y = 1.76 + Math.sin(time * 2.6 + u.phase) * 0.045;
        }

        const swayZ = Math.sin(time * 2.2 * speed + u.phase) * 0.06 * speed;
        tulip.rotation.z = swayZ;

        if (u.isMemory) {
          if (u.sparkleMesh) {
            u.sparkleMesh.rotation.y = time * 2;
            u.sparkleMesh.position.y = 1.38 + Math.sin(time * 3 + u.phase) * 0.05;
          }
          if (u.haloMesh) {
            u.haloMesh.rotation.z = time * 1.5;
          }
        }
      });

      // Slowly rotate fairy dust & twinkle stars
      dustParticles.rotation.y = time * 0.02;
      starPoints.rotation.y = time * 0.003;
      starMat.opacity = 0.82 + Math.sin(time * 2.2) * 0.14;

      renderer.render(scene, camera);
    };

    animate();

    // 12. Complete GPU & DOM Cleanup on unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }

      // Dispose Geometries
      groundGeo.dispose();
      groundMat.dispose();
      stoneGeo.dispose();
      ringGeo.dispose();
      stoneMatNormal.dispose();
      stoneMatActive.dispose();
      stemGeo.dispose();
      outerPetalGeo.dispose();
      innerPetalGeo.dispose();
      leaf1Geo.dispose();
      leaf2Geo.dispose();
      leafMat.dispose();
      stamenCoreGeo.dispose();
      stamenCoreMat.dispose();
      pollenHeadGeo.dispose();
      pollenMat.dispose();
      tulipHitGeo.dispose();
      tulipHitMat.dispose();
      haloGeo.dispose();
      sparkleDiamondGeo.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      starTexture.dispose();
      starGeo.dispose();
      starMat.dispose();
      materialCache.forEach((mat) => mat.dispose());
      renderer.dispose();
    };
  }, [totalStones]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden touch-none"
    />
  );
};
