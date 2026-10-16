import React, { useEffect, useRef } from 'react';

interface PetalRainSceneProps {
  density?: number;
  speed?: number;
}

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotSpeed: number;
  flip: number;
  flipSpeed: number;
  opacity: number;
  color: string;
}

export const PetalRainScene: React.FC<PetalRainSceneProps> = ({
  density = 45,
  speed = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const colors = [
      'rgba(244, 63, 94, ',  // Rose Pink
      'rgba(251, 113, 133, ', // Coral
      'rgba(253, 164, 175, ', // Light Blush
      'rgba(225, 29, 72, ',   // Ruby
      'rgba(254, 205, 211, ', // Soft white-pink
    ];

    const petals: Petal[] = [];
    for (let i = 0; i < density; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        size: 8 + Math.random() * 12,
        speedY: (1.2 + Math.random() * 2.0) * speed,
        speedX: (Math.random() - 0.5) * 1.5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        flip: Math.random() * Math.PI,
        flipSpeed: 0.02 + Math.random() * 0.03,
        opacity: 0.4 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let animId: number;

    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(1, Math.cos(p.flip));

      ctx.beginPath();
      // Curved Tulip/Rose petal path
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.5, p.size * 0.7, p.size * 0.6, 0, p.size);
      ctx.bezierCurveTo(-p.size * 0.7, p.size * 0.6, -p.size * 0.7, -p.size * 0.5, 0, -p.size);
      ctx.fillStyle = `${p.color}${p.opacity})`;
      ctx.fill();

      // Subtle petal rib vein
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 0.7);
      ctx.lineTo(0, p.size * 0.8);
      ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity * 0.4})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    };

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      petals.forEach((p) => {
        p.y += p.speedY;
        p.x += Math.sin(p.y * 0.008) * 1.2 + p.speedX;
        p.rotation += p.rotSpeed;
        p.flip += p.flipSpeed;

        if (p.y > height + 20) {
          p.y = -30;
          p.x = Math.random() * width;
        }

        drawPetal(p);
      });

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [density, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
};
