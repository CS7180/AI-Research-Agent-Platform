import { render, screen } from '@testing-library/react';

import ChatSidebar from './ChatSidebar';

describe('ChatSidebar', () => {
  it('renders sidebar title and empty state', () => {
    render(<ChatSidebar />);

    expect(screen.getByText('Chats')).toBeInTheDocument();
    expect(screen.getByText('No chat history yet.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new chat/i })).toBeInTheDocument();
  });
});
