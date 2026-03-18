export interface Tile {
  id: number;
  type: 'start' | 'coin' | 'move';
  value: number;
  label: string;
  bonusDice?: boolean;
}

export const BOARD: Tile[] = [
  { id: 0, type: 'start', value: 0, label: 'START' },
  { id: 1, type: 'coin', value: 100, label: '+100' },
  { id: 2, type: 'coin', value: 400, label: '+400' },
  { id: 3, type: 'coin', value: 300, label: '+300' },
  { id: 4, type: 'coin', value: 300, label: '+300' },
  { id: 5, type: 'coin', value: 100, label: '+100' },
  { id: 6, type: 'coin', value: 400, label: '+400' },
  { id: 7, type: 'coin', value: 400, label: '+400' },
  { id: 8, type: 'coin', value: 200, label: '+200' },
  { id: 9, type: 'coin', value: 300, label: '+300' },
  { id: 10, type: 'move', value: 10, label: '+10칸' }, // 코너

  { id: 11, type: 'coin', value: 300, label: '+300' },
  { id: 12, type: 'coin', value: 100, label: '+100' },
  { id: 13, type: 'coin', value: 400, label: '+400' },
  { id: 14, type: 'coin', value: 100, label: '+100' },
  { id: 15, type: 'move', value: -3, label: '-3칸' },
  { id: 16, type: 'coin', value: 300, label: '+300' },
  { id: 17, type: 'coin', value: 400, label: '+400' },
  { id: 18, type: 'coin', value: 100, label: '+100' },
  { id: 19, type: 'coin', value: 300, label: '+300' },
  { id: 20, type: 'coin', value: 400, label: '+400', bonusDice: true }, // 미스터리 박스, 코너

  { id: 21, type: 'coin', value: 300, label: '+300' },
  { id: 22, type: 'coin', value: 300, label: '+300' },
  { id: 23, type: 'move', value: -2, label: '-2칸' },
  { id: 24, type: 'coin', value: 100, label: '+100' },
  { id: 25, type: 'coin', value: 600, label: '+600' },
  { id: 26, type: 'coin', value: 400, label: '+400', bonusDice: true }, // 미스터리 박스
  { id: 27, type: 'coin', value: 400, label: '+400' },
  { id: 28, type: 'coin', value: 300, label: '+300' },
  { id: 29, type: 'move', value: 3, label: '+3칸' },
  { id: 30, type: 'coin', value: 250, label: '???(+250)' }, // 코너

  { id: 31, type: 'coin', value: 600, label: '+600' },
  { id: 32, type: 'coin', value: 300, label: '+300' },
  { id: 33, type: 'coin', value: 100, label: '+100' },
  { id: 34, type: 'coin', value: 100, label: '+100' },
  { id: 35, type: 'coin', value: 600, label: '+600' },
  { id: 36, type: 'coin', value: 600, label: '+600' },
  { id: 37, type: 'coin', value: 400, label: '+400', bonusDice: true }, // 미스터리 박스
  { id: 38, type: 'coin', value: 600, label: '+600' },
  { id: 39, type: 'coin', value: 400, label: '+400' },
];

export interface PathStep {
  roll: number;
  landedOn: number;
  coinsGained: number;
  bonusDice: boolean;
  moveDest?: number;
}

export interface SimulationResult {
  order: number[];
  path: PathStep[];
  totalCoins: number;
  bonusDiceCount: number;
}

function getPermutations(arr: number[]): number[][] {
  if (arr.length === 0) return [[]];
  const result: number[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = getPermutations(arr.slice(0, i).concat(arr.slice(i + 1)));
    for (const r of rest) {
      result.push([arr[i], ...r]);
    }
  }
  return result;
}

export type TileModifier = 'golden_bee' | 'homunculus';

export function simulate(startPos: number, dice: number[], modifiers: Record<number, TileModifier> = {}): SimulationResult[] {
  const permutations = getPermutations(dice);
  const uniquePermutations = Array.from(new Set(permutations.map(p => p.join(',')))).map(s => s.split(',').map(Number));

  return uniquePermutations.map(order => {
    let currentPos = startPos;
    let totalCoins = 0;
    let bonusDiceCount = 0;
    const path: PathStep[] = [];

    for (const roll of order) {
      currentPos = ((currentPos + roll) % BOARD.length + BOARD.length) % BOARD.length;
      let initialPos = currentPos;
      let tile = BOARD[currentPos];
      let coinsGained = 0;
      let gotBonusDice = false;
      let moveDest: number | undefined = undefined;
      let finalTileId = currentPos;

      if (tile.type === 'move') {
        moveDest = (currentPos + tile.value + BOARD.length) % BOARD.length;
        finalTileId = moveDest;
      }

      const finalTile = BOARD[finalTileId];
      if (finalTile.type === 'coin') {
        coinsGained = finalTile.value;
        
        if (modifiers[finalTileId] === 'golden_bee') {
          coinsGained *= 2;
        } else if (modifiers[finalTileId] === 'homunculus') {
          coinsGained = Math.floor(coinsGained * 0.5);
        }

        if (finalTile.bonusDice) {
          gotBonusDice = true;
          bonusDiceCount++;
        }
      }
      
      if (tile.type === 'move') {
        currentPos = moveDest!;
      }

      totalCoins += coinsGained;
      path.push({ roll, landedOn: initialPos, coinsGained, bonusDice: gotBonusDice, moveDest });
    }

    return { order, path, totalCoins, bonusDiceCount };
  }).sort((a, b) => {
    if (b.totalCoins !== a.totalCoins) return b.totalCoins - a.totalCoins;
    return b.bonusDiceCount - a.bonusDiceCount;
  });
}
