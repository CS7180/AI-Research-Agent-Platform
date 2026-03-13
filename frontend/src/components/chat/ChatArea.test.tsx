import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ChatArea from './ChatArea';
import { streamChatClient } from '@/backend/client';

jest.mock('@/backend/client', () => ({
  streamChatClient: jest.fn(),
}));

const mockedStreamChatClient = streamChatClient as jest.Mock;

describe('ChatArea', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows initial empty-state hint', () => {
    render(<ChatArea />);

    expect(
      screen.getByText('Ask your first question to start a real backend chat session.'),
    ).toBeInTheDocument();
  });

  it('streams assistant tokens and source cards after submit', async () => {
    const user = userEvent.setup();
    mockedStreamChatClient.mockImplementation(
      async (
        _message: string,
        handlers: { onToken: (token: string) => void; onSources?: (sources: unknown[]) => void },
      ) => {
        handlers.onToken('Answer');
        handlers.onSources?.([{ filename: 'lecture.pdf', chunk_index: 3 }]);
      },
    );

    render(<ChatArea />);
    await user.type(screen.getByLabelText('Chat message input'), 'What is 2PC?');
    await user.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => {
      expect(mockedStreamChatClient).toHaveBeenCalledWith(
        'What is 2PC?',
        expect.objectContaining({
          onToken: expect.any(Function),
          onSources: expect.any(Function),
        }),
      );
    });

    expect(await screen.findByText('Answer')).toBeInTheDocument();
    expect(screen.getByText('lecture.pdf')).toBeInTheDocument();
    expect(screen.getByText('chunk 3')).toBeInTheDocument();
  });

  it('shows error if stream fails', async () => {
    const user = userEvent.setup();
    mockedStreamChatClient.mockRejectedValue(new Error('stream failed'));

    render(<ChatArea />);
    await user.type(screen.getByLabelText('Chat message input'), 'question');
    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(await screen.findByText('stream failed')).toBeInTheDocument();
  });
});
