import { CanvasTexture, SRGBColorSpace } from "three";

const textureWidth = 1024;

// Drawn procedurally instead of loading an image asset so the frame is
// royalty-free and can be composed at exactly the screen's aspect ratio,
// which varies from 1.43:1 (IMAX 15/70) to 2.39:1 scope screens.
export function createFilmFrameTexture(aspectRatio: number): CanvasTexture {
  const width = textureWidth;
  const height = Math.round(width / aspectRatio);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (context) {
    drawFilmFrame(context, width, height);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;

  return texture;
}

function drawFilmFrame(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const random = createSeededRandom(20260701);
  const horizonY = height * 0.74;

  const sky = context.createLinearGradient(0, 0, 0, horizonY);
  sky.addColorStop(0, "#141c3f");
  sky.addColorStop(0.5, "#463763");
  sky.addColorStop(0.82, "#a45a4c");
  sky.addColorStop(1, "#e8a45e");
  context.fillStyle = sky;
  context.fillRect(0, 0, width, horizonY);

  drawStars(context, width, horizonY, random);
  drawSun(context, width, height, horizonY);

  drawRidge(context, width, height, random, {
    baseY: horizonY,
    amplitude: height * 0.055,
    color: "#5c4058",
  });
  drawRidge(context, width, height, random, {
    baseY: height * 0.81,
    amplitude: height * 0.045,
    color: "#39283f",
  });
  drawRidge(context, width, height, random, {
    baseY: height * 0.89,
    amplitude: height * 0.03,
    color: "#1d1526",
  });

  drawVignette(context, width, height);
}

function drawStars(
  context: CanvasRenderingContext2D,
  width: number,
  horizonY: number,
  random: () => number,
) {
  for (let index = 0; index < 90; index += 1) {
    const x = random() * width;
    const y = random() * horizonY * 0.55;
    const radius = 0.4 + random() * 1.1;
    const fade = 1 - y / (horizonY * 0.55);

    context.fillStyle = `rgba(232, 236, 255, ${0.25 + fade * 0.55})`;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
}

function drawSun(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  horizonY: number,
) {
  const sunX = width * 0.63;
  const sunY = horizonY * 0.97;
  const glowRadius = height * 0.52;

  const glow = context.createRadialGradient(
    sunX,
    sunY,
    0,
    sunX,
    sunY,
    glowRadius,
  );
  glow.addColorStop(0, "rgba(255, 214, 148, 0.85)");
  glow.addColorStop(0.25, "rgba(255, 186, 118, 0.4)");
  glow.addColorStop(1, "rgba(255, 186, 118, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  context.fillStyle = "#ffedc8";
  context.beginPath();
  context.arc(sunX, sunY, height * 0.055, 0, Math.PI * 2);
  context.fill();
}

function drawRidge(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  random: () => number,
  { baseY, amplitude, color }: { baseY: number; amplitude: number; color: string },
) {
  const segments = 26;

  context.fillStyle = color;
  context.beginPath();
  context.moveTo(0, height);
  context.lineTo(0, baseY - random() * amplitude);

  for (let index = 1; index <= segments; index += 1) {
    const x = (index / segments) * width;
    const peak = baseY - random() * amplitude * 2;

    context.lineTo(x, peak);
  }

  context.lineTo(width, height);
  context.closePath();
  context.fill();
}

function drawVignette(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const vignette = context.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.45,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.72,
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.32)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);
}

function createSeededRandom(initialSeed: number) {
  let seed = initialSeed;

  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
