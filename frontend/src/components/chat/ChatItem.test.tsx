import { render, screen } from '@testing-library/react';

import ChatItem from './ChatItem';

describe('ChatItem', () => {
  it('renders title and date', () => {
    render(<ChatItem title="Distributed Systems Review" date="Mar 13" />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Distributed Systems Review')).toBeInTheDocument();
    expect(screen.getByText('Mar 13')).toBeInTheDocument();
  });

  it('sets aria-current when active', () => {
    render(<ChatItem title="Active Chat" date="Today" isActive />);

    expect(screen.getByRole('button')).toHaveAttribute('aria-current', 'true');
  });
});
