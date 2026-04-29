import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import Home from '../../../src/app/page';
import '@testing-library/jest-dom';

describe('Home', () => {
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

        act(() => {
            jest.advanceTimersByTime(400);
        });

        expect(screen.getByTestId('current-player')).toHaveTextContent('あなた（黒）');
        expect(screen.getByTestId('black-count')).toHaveTextContent('3');
        expect(screen.getByTestId('white-count')).toHaveTextContent('3');
        expect(screen.getByTestId('status-message')).toHaveTextContent('あなたの手番です。');
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
