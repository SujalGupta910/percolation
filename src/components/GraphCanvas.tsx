import { useEffect, useRef } from "react";
import { generateGraph } from "../utils/generateGraph";

type Props = {
  p: number;
  width: number;
  height: number;
  cellSize: number;
};

export default function GraphCanvas({ p, width, height, cellSize }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const cols = Math.ceil(width / cellSize / 10) * 10;
    const rows = Math.ceil(height / cellSize / 10) * 10;

    const { nodes, edges } = generateGraph(cols, rows, p); // `mode` comes from state
    // Assign a unique color to each cluster
    const clusterColors = new Map<string, string>();
    const colorFor = (id: string): string => {
      if (!clusterColors.has(id)) {
        const hue = Math.floor(Math.random() * 360);
        clusterColors.set(id, `hsl(${hue}, 70%, 60%)`);
      }
      return clusterColors.get(id)!;
    };
    ctx.clearRect(0, 0, width, height);

    // Draw nodes by cluster
    for (const node of nodes) {
      const cx = node.x * cellSize;
      const cy = node.y * cellSize;
      ctx.beginPath();
      ctx.fillStyle = colorFor(node.clusterId);
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw edges colored by cluster
    ctx.lineWidth = 2;
    for (const edge of edges) {
      const fromNode = nodes.find((n) => n.id === edge.from);
      if (!fromNode) continue;

      const [x1, y1] = edge.from.split(",").map(Number);
      const [x2, y2] = edge.to.split(",").map(Number);

      ctx.beginPath();
      ctx.strokeStyle = colorFor(fromNode.clusterId);
      ctx.moveTo(x1 * cellSize, y1 * cellSize);
      ctx.lineTo(x2 * cellSize, y2 * cellSize);
      ctx.stroke();
    }
  }, [p, width, height, cellSize]);

  return <canvas ref={canvasRef} />;
}
