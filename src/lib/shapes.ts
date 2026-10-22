import type { TileShape } from "./types";

// altezza / larghezza di ogni forma (serve per bilanciare le colonne)
export const SHAPE_RATIO: Record<TileShape, number> = {
  square: 1,
  portrait: 4 / 3,
  tall: 3 / 2,
  landscape: 3 / 4,
  wide: 9 / 16,
};

export const SHAPE_ASPECT: Record<TileShape, string> = {
  square: "1 / 1",
  portrait: "3 / 4",
  tall: "2 / 3",
  landscape: "4 / 3",
  wide: "16 / 9",
};
