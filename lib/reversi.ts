export const BOARD_SIZE = 8;

export type Player = 'black' | 'white';
export type Cell = Player | null;
export type Board = Cell[][];

export interface Position {
    row: number;
    col: number;
}

const DIRECTIONS: ReadonlyArray<Readonly<Position>> = [
    {row: -1, col: -1},
    {row: -1, col: 0},
    {row: -1, col: 1},
    {row: 0, col: -1},
    {row: 0, col: 1},
    {row: 1, col: -1},
    {row: 1, col: 0},
    {row: 1, col: 1},
];

export function getOpponent(player: Player): Player {
    return player === 'black' ? 'white' : 'black';
}

export function createInitialBoard(): Board {
    const board = Array.from({length: BOARD_SIZE}, () => Array.from<Cell>({length: BOARD_SIZE}).fill(null));

    board[3][3] = 'white';
    board[3][4] = 'black';
    board[4][3] = 'black';
    board[4][4] = 'white';

    return board;
}

function isInsideBoard({row, col}: Position): boolean {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function getFlippedStones(board: Board, player: Player, position: Position): Position[] {
    if (!isInsideBoard(position) || board[position.row][position.col] !== null) {
        return [];
    }

    const opponent = getOpponent(player);
    const flipped: Position[] = [];

    for (const direction of DIRECTIONS) {
        const candidates: Position[] = [];
        let currentRow = position.row + direction.row;
        let currentCol = position.col + direction.col;

        while (isInsideBoard({row: currentRow, col: currentCol}) && board[currentRow][currentCol] === opponent) {
            candidates.push({row: currentRow, col: currentCol});
            currentRow += direction.row;
            currentCol += direction.col;
        }

        if (
            candidates.length > 0 &&
            isInsideBoard({row: currentRow, col: currentCol}) &&
            board[currentRow][currentCol] === player
        ) {
            flipped.push(...candidates);
        }
    }

    return flipped;
}

export function getValidMoves(board: Board, player: Player): Position[] {
    const moves: Position[] = [];

    for (let row = 0; row < BOARD_SIZE; row += 1) {
        for (let col = 0; col < BOARD_SIZE; col += 1) {
            if (getFlippedStones(board, player, {row, col}).length > 0) {
                moves.push({row, col});
            }
        }
    }

    return moves;
}

export function applyMove(board: Board, player: Player, position: Position): Board | null {
    const flipped = getFlippedStones(board, player, position);

    if (flipped.length === 0) {
        return null;
    }

    const nextBoard = board.map((row) => [...row]);
    nextBoard[position.row][position.col] = player;

    for (const stone of flipped) {
        nextBoard[stone.row][stone.col] = player;
    }

    return nextBoard;
}

export function countStones(board: Board): Record<Player, number> {
    return board.reduce(
        (counts, row) => {
            for (const cell of row) {
                if (cell === 'black') {
                    counts.black += 1;
                } else if (cell === 'white') {
                    counts.white += 1;
                }
            }

            return counts;
        },
        {black: 0, white: 0},
    );
}

function evaluateBoard(board: Board): number {
    const counts = countStones(board);
    return counts.white - counts.black;
}

export function selectBestNpcMove(board: Board): Position | null {
    const npcMoves = getValidMoves(board, 'white');

    if (npcMoves.length === 0) {
        return null;
    }

    let bestMove: Position | null = null;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const move of npcMoves) {
        const npcBoard = applyMove(board, 'white', move);

        if (!npcBoard) {
            continue;
        }

        const humanMoves = getValidMoves(npcBoard, 'black');
        const score = humanMoves.length === 0
            ? evaluateBoard(npcBoard)
            : Math.min(
                ...humanMoves.map((humanMove) => evaluateBoard(applyMove(npcBoard, 'black', humanMove) ?? npcBoard)),
            );

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove;
}

export function getWinnerMessage(board: Board): string {
    const counts = countStones(board);

    if (counts.black > counts.white) {
        return `ゲーム終了: ${counts.black}対${counts.white}であなたの勝ちです。`;
    }

    if (counts.white > counts.black) {
        return `ゲーム終了: ${counts.black}対${counts.white}でNPCの勝ちです。`;
    }

    return `ゲーム終了: ${counts.black}対${counts.white}で引き分けです。`;
}
