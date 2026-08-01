/**
 * Solves an approximate Traveling Salesman ordering given a precomputed
 * distance matrix. Uses nearest-neighbor construction followed by 2-opt
 * local search — a good balance of speed and quality for the small stop
 * counts (<= ~15) a trip planner deals with.
 */

export interface TspOptions {
  /** Index of the fixed start point (default 0). */
  startIndex?: number;
  /** If true, the route must return to the start point. */
  roundTrip?: boolean;
}

function routeLength(order: number[], matrix: number[][], roundTrip: boolean): number {
  let total = 0;
  for (let i = 0; i < order.length - 1; i++) {
    total += matrix[order[i]][order[i + 1]];
  }
  if (roundTrip) total += matrix[order[order.length - 1]][order[0]];
  return total;
}

function nearestNeighbor(matrix: number[][], startIndex: number): number[] {
  const n = matrix.length;
  const visited = new Array(n).fill(false);
  const order = [startIndex];
  visited[startIndex] = true;

  for (let step = 1; step < n; step++) {
    const last = order[order.length - 1];
    let best = -1;
    let bestDist = Infinity;
    for (let j = 0; j < n; j++) {
      if (!visited[j] && matrix[last][j] < bestDist) {
        bestDist = matrix[last][j];
        best = j;
      }
    }
    order.push(best);
    visited[best] = true;
  }
  return order;
}

/** Classic 2-opt: repeatedly reverse segments if it shortens the route. */
function twoOpt(
  order: number[],
  matrix: number[][],
  roundTrip: boolean,
  lockFirst: boolean
): number[] {
  let improved = true;
  let best = [...order];
  const start = lockFirst ? 1 : 0;

  while (improved) {
    improved = false;
    for (let i = start; i < best.length - 1; i++) {
      for (let k = i + 1; k < best.length; k++) {
        const candidate = [
          ...best.slice(0, i),
          ...best.slice(i, k + 1).reverse(),
          ...best.slice(k + 1),
        ];
        if (routeLength(candidate, matrix, roundTrip) < routeLength(best, matrix, roundTrip)) {
          best = candidate;
          improved = true;
        }
      }
    }
  }
  return best;
}

/**
 * Returns the optimized visiting order as an array of original indices,
 * e.g. [0, 3, 1, 2] means "visit point 0, then 3, then 1, then 2".
 */
export function solveTsp(matrix: number[][], options: TspOptions = {}): number[] {
  const { startIndex = 0, roundTrip = false } = options;
  const n = matrix.length;
  if (n <= 2) return matrix.map((_, i) => i);

  const initial = nearestNeighbor(matrix, startIndex);
  const optimized = twoOpt(initial, matrix, roundTrip, true);
  return optimized;
}
