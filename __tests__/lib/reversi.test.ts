import {applyMove, countStones, createInitialBoard, getValidMoves, selectBestNpcMove} from '../../lib/reversi';

describe('reversi logic', () => {
    it('初期盤面では黒に 4 つの合法手がある', () => {
        const board = createInitialBoard();

        expect(getValidMoves(board, 'black')).toEqual([
            {row: 2, col: 3},
            {row: 3, col: 2},
            {row: 4, col: 5},
            {row: 5, col: 4},
        ]);
    });

    it('着手時に挟んだ石を正しく反転する', () => {
        const board = createInitialBoard();
        const nextBoard = applyMove(board, 'black', {row: 2, col: 3});

        expect(nextBoard).not.toBeNull();
        expect(nextBoard?.[2][3]).toBe('black');
        expect(nextBoard?.[3][3]).toBe('black');
        expect(countStones(nextBoard ?? board)).toEqual({black: 4, white: 1});
    });

    it('NPC は同点時に行優先順で最初の合法手を選ぶ', () => {
        const board = createInitialBoard();

        expect(selectBestNpcMove(board)).toEqual({row: 2, col: 4});
    });
});
