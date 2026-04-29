import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import Home from '../../../src/app/page';
import '@testing-library/jest-dom';

describe('Home', () => {
    beforeEach(() => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({message: 'Hello, world.'}),
        } as Response);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('アプリ名として reversi-next-js-app を表示する', async () => {
        render(<Home/>);

        expect(screen.getByRole('heading', {name: 'reversi-next-js-app'})).toBeInTheDocument();

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/message');
        });
    });
});
