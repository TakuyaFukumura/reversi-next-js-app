'use client';

import {useEffect, useMemo, useReducer} from 'react';
import {applyMove, type Board, countStones, createInitialBoard, getValidMoves, getWinnerMessage, selectBestNpcMove} from '../../lib/reversi';

type GamePhase = 'playing' | 'npcThinking' | 'gameOver' | 'ended';

interface GameState {
    board: Board;
    currentPlayer: 'black' | 'white';
    phase: GamePhase;
    message: string;
}

type GameAction =
    | { type: 'PLAY_MOVE'; row: number; col: number }
    | { type: 'NPC_MOVE' }
    | { type: 'PASS' }
    | { type: 'END_GAME' }
    | { type: 'RESET' };

const initialState: GameState = {
    board: createInitialBoard(),
    currentPlayer: 'black',
    phase: 'playing',
    message: 'あなたが先手です。黒の石を置いてください。',
};

function getPassMessage(): string {
    return 'あなたはパスしました。NPCが考えています...';
}

function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case 'PLAY_MOVE': {
            if (state.phase !== 'playing' || state.currentPlayer !== 'black') {
                return state;
            }

            const nextBoard = applyMove(state.board, 'black', {row: action.row, col: action.col});

            if (!nextBoard) {
                return state;
            }

            const whiteMoves = getValidMoves(nextBoard, 'white');

            if (whiteMoves.length === 0) {
                const blackMoves = getValidMoves(nextBoard, 'black');

                if (blackMoves.length === 0) {
                    return {
                        board: nextBoard,
                        currentPlayer: 'black',
                        phase: 'gameOver',
                        message: getWinnerMessage(nextBoard),
                    };
                }

                return {
                    board: nextBoard,
                    currentPlayer: 'black',
                    phase: 'playing',
                    message: 'NPCはパスしました。あなたの手番です。',
                };
            }

            return {
                board: nextBoard,
                currentPlayer: 'white',
                phase: 'npcThinking',
                message: 'NPCが考えています...',
            };
        }

        case 'NPC_MOVE': {
            if (state.phase !== 'npcThinking' || state.currentPlayer !== 'white') {
                return state;
            }

            const move = selectBestNpcMove(state.board);

            if (!move) {
                const blackMoves = getValidMoves(state.board, 'black');

                if (blackMoves.length === 0) {
                    return {
                        ...state,
                        phase: 'gameOver',
                        currentPlayer: 'black',
                        message: getWinnerMessage(state.board),
                    };
                }

                return {
                    ...state,
                    phase: 'playing',
                    currentPlayer: 'black',
                    message: 'NPCはパスしました。あなたの手番です。',
                };
            }

            const nextBoard = applyMove(state.board, 'white', move);

            if (!nextBoard) {
                return state;
            }

            const blackMoves = getValidMoves(nextBoard, 'black');

            if (blackMoves.length === 0) {
                const whiteMoves = getValidMoves(nextBoard, 'white');

                if (whiteMoves.length === 0) {
                    return {
                        board: nextBoard,
                        currentPlayer: 'black',
                        phase: 'gameOver',
                        message: getWinnerMessage(nextBoard),
                    };
                }

                return {
                    board: nextBoard,
                    currentPlayer: 'black',
                    phase: 'playing',
                    message: '置ける場所がありません。パスしてください。',
                };
            }

            return {
                board: nextBoard,
                currentPlayer: 'black',
                phase: 'playing',
                message: 'あなたの手番です。',
            };
        }

        case 'PASS': {
            const blackMoves = getValidMoves(state.board, 'black');

            if (state.phase !== 'playing' || state.currentPlayer !== 'black' || blackMoves.length > 0) {
                return state;
            }

            const whiteMoves = getValidMoves(state.board, 'white');

            if (whiteMoves.length === 0) {
                return {
                    ...state,
                    phase: 'gameOver',
                    message: getWinnerMessage(state.board),
                };
            }

            return {
                ...state,
                currentPlayer: 'white',
                phase: 'npcThinking',
                message: getPassMessage(),
            };
        }

        case 'END_GAME':
            return {
                ...state,
                phase: 'ended',
                message: '終了済み',
            };

        case 'RESET':
            return initialState;

        default:
            return state;
    }
}

function getCellLabel(cell: Board[number][number], row: number, col: number, canPlace: boolean): string {
    const prefix = `${row + 1}行${col + 1}列`;

    if (cell === 'black') {
        return `${prefix} 黒`;
    }

    if (cell === 'white') {
        return `${prefix} 白`;
    }

    if (canPlace) {
        return `${prefix}に黒を置く`;
    }

    return `${prefix} 空き`;
}

function Stone({cell}: { cell: Board[number][number] }) {
    if (!cell) {
        return null;
    }

    return (
        <span
            aria-hidden="true"
            className={`block h-9 w-9 rounded-full shadow-inner sm:h-10 sm:w-10 ${
                cell === 'black' ? 'bg-gray-900' : 'bg-gray-100 border border-gray-300'
            }`}
        />
    );
}

export default function Home() {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    const blackMoves = useMemo(
        () => (state.phase === 'playing' && state.currentPlayer === 'black' ? getValidMoves(state.board, 'black') : []),
        [state.board, state.currentPlayer, state.phase],
    );
    const validMoveKeys = useMemo(() => new Set(blackMoves.map(({row, col}) => `${row}-${col}`)), [blackMoves]);
    const counts = useMemo(() => countStones(state.board), [state.board]);
    const passDisabled = state.phase !== 'playing' || state.currentPlayer !== 'black' || blackMoves.length > 0;
    const endDisabled = state.phase === 'gameOver' || state.phase === 'ended';

    useEffect(() => {
        if (state.phase !== 'npcThinking') {
            return undefined;
        }

        const timer = window.setTimeout(() => {
            dispatch({type: 'NPC_MOVE'});
        }, 400);

        return () => window.clearTimeout(timer);
    }, [state.phase]);

    return (
        <div className="font-sans min-h-[calc(100vh-4rem)] bg-linear-to-br from-emerald-50 to-teal-100 px-4 py-8 dark:from-gray-900 dark:to-gray-800">
            <main className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-start">
                <section className="rounded-3xl bg-white p-6 shadow-lg dark:bg-gray-800 lg:w-96">
                    <h1 className="mb-4 text-3xl font-bold text-gray-800 dark:text-gray-100">リバーシ</h1>
                    <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
                        あなたが黒、NPC が白です。合法手のみクリックできます。
                    </p>

                    <div className="space-y-4">
                        <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
                            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">現在の手番</p>
                            <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-gray-100" data-testid="current-player">
                                {state.currentPlayer === 'black' ? 'あなた（黒）' : 'NPC（白）'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl bg-gray-100 p-4 dark:bg-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-300">あなた（黒）</p>
                                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white" data-testid="black-count">
                                    {counts.black}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-gray-100 p-4 dark:bg-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-300">NPC（白）</p>
                                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white" data-testid="white-count">
                                    {counts.white}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-200 p-4 text-sm text-gray-700 dark:border-emerald-700 dark:text-gray-200">
                            <p className="font-medium text-emerald-800 dark:text-emerald-200">状態メッセージ</p>
                            <p className="mt-2" data-testid="status-message">{state.message}</p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <button
                                className="rounded-xl bg-amber-500 px-4 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-amber-300"
                                disabled={passDisabled}
                                onClick={() => dispatch({type: 'PASS'})}
                                type="button"
                            >
                                パス
                            </button>
                            <button
                                className="rounded-xl bg-rose-500 px-4 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-rose-300"
                                disabled={endDisabled}
                                onClick={() => dispatch({type: 'END_GAME'})}
                                type="button"
                            >
                                終了
                            </button>
                            <button
                                className="rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white transition hover:bg-sky-500"
                                onClick={() => dispatch({type: 'RESET'})}
                                type="button"
                            >
                                リセット
                            </button>
                        </div>
                    </div>
                </section>

                <section className="flex-1 rounded-3xl bg-white p-4 shadow-lg dark:bg-gray-800 sm:p-6">
                    <div className="mx-auto w-full max-w-[32rem]">
                        <div className="grid aspect-square grid-cols-8 gap-1 rounded-3xl bg-emerald-900 p-3 shadow-inner">
                            {state.board.map((row, rowIndex) => row.map((cell, colIndex) => {
                                const key = `${rowIndex}-${colIndex}`;
                                const canPlace = validMoveKeys.has(key);
                                const boardDisabled = state.phase !== 'playing' || state.currentPlayer !== 'black' || !canPlace;

                                return (
                                    <button
                                        aria-label={getCellLabel(cell, rowIndex, colIndex, canPlace)}
                                        className="flex aspect-square items-center justify-center rounded-md bg-emerald-600 transition enabled:hover:bg-emerald-500 disabled:cursor-not-allowed"
                                        disabled={boardDisabled}
                                        key={key}
                                        onClick={() => dispatch({type: 'PLAY_MOVE', row: rowIndex, col: colIndex})}
                                        type="button"
                                    >
                                        {cell ? <Stone cell={cell}/> : canPlace && (
                                            <span aria-hidden="true" className="h-3 w-3 rounded-full bg-emerald-200"/>
                                        )}
                                    </button>
                                );
                            }))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
