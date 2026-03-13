import { render, screen } from '@testing-library/react';

import ChatMessage from './ChatMessage';

describe('ChatMessage', () => {
  it('renders user message variant', () => {
    render(<ChatMessage variant="user">Hello from user</ChatMessage>);

    expect(screen.getByText('Hello from user')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Avatar for JD' })).toBeInTheDocument();
  });

  it('renders assistant message variant', () => {
    render(<ChatMessage variant="assistant">Hello from assistant</ChatMessage>);

    expect(screen.getByText('Hello from assistant')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Avatar for D' })).toBeInTheDocument();
  });
});
