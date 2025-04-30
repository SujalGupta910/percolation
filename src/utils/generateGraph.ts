import { Edge, Node } from "../types/graph";

type ClusteredNode = Node & { id: string; clusterId: string };
type Graph = { nodes: ClusteredNode[]; edges: Edge[] };

type WeightedEdge = Edge & { weight: number };
type CachedGraph = {
  edges: WeightedEdge[];
  nodes: string[]; // store ids only
};

const graphWeightCache = new Map<string, CachedGraph>(); // "colsxrows"
const graphCache = new Map<string, Map<number, Graph>>(); // "colsxrows" -> p -> Graph
const pSteps = 100;

// Disjoint-set Union-Find
function unionFind(ids: string[], edges: Edge[]): Record<string, string> {
  const parent: Record<string, string> = {};
  const find = (x: string): string => {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  };
  const union = (x: string, y: string) => {
    const rx = find(x);
    const ry = find(y);
    if (rx !== ry) parent[ry] = rx;
  };
  for (const id of ids) parent[id] = id;
  for (const { from, to } of edges) union(from, to);
  for (const id of ids) find(id);
  return parent;
}

// One-time edge weight generation
function generateWeightedEdges(cols: number, rows: number): CachedGraph {
  const edges: WeightedEdge[] = [];
  const ids: string[] = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const id = `${x},${y}`;
      ids.push(id);

      if (x < cols - 1) {
        edges.push({
          from: id,
          to: `${x + 1},${y}`,
          weight: parseFloat((Math.floor(Math.random() * 100) / 100).toFixed(2))

        });
      }
      if (y < rows - 1) {
        edges.push({
          from: id,
          to: `${x},${y + 1}`,
          weight: parseFloat((Math.floor(Math.random() * 100) / 100).toFixed(2))
        });
      }
    }
  }

  return { edges, nodes: ids };
}

// Core graph generation logic based on threshold p
function computeGraph(cols: number, rows: number, p: number): Graph {
  const gridKey = `${cols}x${rows}`;
  if (!graphWeightCache.has(gridKey)) {
    graphWeightCache.set(gridKey, generateWeightedEdges(cols, rows));
  }

  const { edges: weightedEdges, nodes: ids } = graphWeightCache.get(gridKey)!;

  const edges = weightedEdges
    .filter((e) => e.weight < p)
    .map(({ from, to }) => ({ from, to }));

  const clusterMap = unionFind(ids, edges);

  const nodes: ClusteredNode[] = ids.map((id) => {
    const [x, y] = id.split(",").map(Number);
    return { x, y, id, clusterId: clusterMap[id] };
  });

  return { nodes, edges };
}

// Public function to retrieve from cache
export function generateGraph(cols: number, rows: number, p: number): Graph {
  const gridKey = `${cols}x${rows}`;
  const pRounded = parseFloat(p.toFixed(2));

  if (!graphCache.has(gridKey)) {
    graphCache.set(gridKey, new Map());

    // Optional: precompute full range asynchronously
    setTimeout(() => {
      for (let i = 0; i <= pSteps; i++) {
        const pi = parseFloat((i / pSteps).toFixed(2));
        const g = computeGraph(cols, rows, pi);
        graphCache.get(gridKey)!.set(pi, g);
      }
    }, 0);
  }

  const innerMap = graphCache.get(gridKey)!;
  if (!innerMap.has(pRounded)) {
    const g = computeGraph(cols, rows, pRounded);
    innerMap.set(pRounded, g);
  }

  return innerMap.get(pRounded)!;
}
