import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import Home from '../../../src/app/page';
import '@testing-library/jest-dom';

describe('Home', () => {
    const advanceNpcTurn = () => {
        act(() => {
            jest.advanceTimersByTime(400);
        });
    };

    const playMove = (label: string) => {
        fireEvent.click(screen.getByRole('button', {name: label}));
        advanceNpcTurn();
    };

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('初期状態のリバーシ盤面を表示する', () => {
        render(<Home/>);

        expect(screen.getByRole('heading', {name: 'リバーシ'})).toBeInTheDocument();
        expect(screen.getByTestId('current-player')).toHaveTextContent('あなた（黒）');
        expect(screen.getByTestId('black-count')).toHaveTextContent('2');
        expect(screen.getByTestId('white-count')).toHaveTextContent('2');
        expect(screen.getByRole('button', {name: '3行4列に黒を置く'})).toBeEnabled();
        expect(screen.getByRole('button', {name: '4行3列に黒を置く'})).toBeEnabled();
        expect(screen.getByRole('button', {name: '5行6列に黒を置く'})).toBeEnabled();
        expect(screen.getByRole('button', {name: '6行5列に黒を置く'})).toBeEnabled();
        expect(screen.getByRole('button', {name: 'パス'})).toBeDisabled();
    });

    it('人間が着手すると NPC が応手する', () => {
        render(<Home/>);

        fireEvent.click(screen.getByRole('button', {name: '3行4列に黒を置く'}));
        expect(screen.getByTestId('status-message')).toHaveTextContent('NPCが考えています...');

        advanceNpcTurn();

        expect(screen.getByTestId('current-player')).toHaveTextContent('あなた（黒）');
        expect(screen.getByTestId('black-count')).toHaveTextContent('3');
        expect(screen.getByTestId('white-count')).toHaveTextContent('3');
        expect(screen.getByTestId('status-message')).toHaveTextContent('あなたの手番です。');
    });

    it('合法手がないときはパスでき、双方打てなければ終局する', () => {
        render(<Home/>);

        [
            '3行4列に黒を置く',
            '3行2列に黒を置く',
            '1行2列に黒を置く',
            '4行3列に黒を置く',
            '2行3列に黒を置く',
            '1行4列に黒を置く',
            '4行2列に黒を置く',
        ].forEach(playMove);

        const passButton = screen.getByRole('button', {name: 'パス'});

        expect(passButton).toBeEnabled();
        expect(screen.getByTestId('status-message')).toHaveTextContent('置ける場所がありません。パスしてください。');

        fireEvent.click(passButton);

        expect(screen.getByTestId('current-player')).toHaveTextContent('NPC（白）');
        expect(screen.getByTestId('status-message')).toHaveTextContent('あなたはパスしました。NPCが考えています...');

        advanceNpcTurn();

        expect(screen.getByTestId('status-message')).toHaveTextContent('ゲーム終了: 0対19でNPCの勝ちです。');
        expect(screen.getByRole('button', {name: 'パス'})).toBeDisabled();
        expect(screen.getByRole('button', {name: '終了'})).toBeDisabled();
    });

    it('終了後は盤面操作と終了ボタンが無効化され、リセットで初期化できる', () => {
        render(<Home/>);
        const playableCell = screen.getByRole('button', {name: '3行4列に黒を置く'});

        fireEvent.click(screen.getByRole('button', {name: '終了'}));

        expect(screen.getByTestId('status-message')).toHaveTextContent('終了済み');
        expect(screen.getByRole('button', {name: '終了'})).toBeDisabled();
        expect(playableCell).toBeDisabled();

        fireEvent.click(screen.getByRole('button', {name: 'リセット'}));

        expect(screen.getByTestId('status-message')).toHaveTextContent('あなたが先手です。黒の石を置いてください。');
        expect(screen.getByTestId('black-count')).toHaveTextContent('2');
        expect(screen.getByTestId('white-count')).toHaveTextContent('2');
        expect(screen.getByRole('button', {name: '終了'})).toBeEnabled();
        expect(screen.getByRole('button', {name: '3行4列に黒を置く'})).toBeEnabled();
    });
});
