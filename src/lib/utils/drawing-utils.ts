import { NormalizedLandmark } from '@mediapipe/tasks-vision';

export function drawLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  options: { color?: string; lineWidth?: number; radius?: number } = {}
) {
  const { color = 'red', lineWidth = 2, radius = 2 } = options;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  for (const landmark of landmarks) {
    ctx.beginPath();
    ctx.arc(
      landmark.x * ctx.canvas.width,
      landmark.y * ctx.canvas.height,
      radius,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
}

export function drawConnectors(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  connections: [number, number][],
  options: { color?: string; lineWidth?: number } = {}
) {
  const { color = 'white', lineWidth = 4 } = options;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  for (const connection of connections) {
    const [start, end] = connection;
    if (
      start >= 0 &&
      start < landmarks.length &&
      end >= 0 &&
      end < landmarks.length
    ) {
      const startLandmark = landmarks[start];
      const endLandmark = landmarks[end];

      ctx.beginPath();
      ctx.moveTo(
        startLandmark.x * ctx.canvas.width,
        startLandmark.y * ctx.canvas.height
      );
      ctx.lineTo(
        endLandmark.x * ctx.canvas.width,
        endLandmark.y * ctx.canvas.height
      );
      ctx.stroke();
    }
  }
}
