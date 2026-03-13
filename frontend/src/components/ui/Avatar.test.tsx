import { render, screen } from '@testing-library/react';

import Avatar from './Avatar';

describe('Avatar', () => {
  it('renders initials with accessible label', () => {
    render(<Avatar initials="LS" />);

    expect(screen.getByRole('img', { name: 'Avatar for LS' })).toBeInTheDocument();
    expect(screen.getByText('LS')).toBeInTheDocument();
  });

  it('applies custom size and color', () => {
    render(<Avatar initials="DM" size="lg" color="#123456" />);

    const avatar = screen.getByRole('img', { name: 'Avatar for DM' });
    expect(avatar).toHaveClass('h-10', 'w-10');
    expect(avatar).toHaveStyle({ backgroundColor: '#123456' });
  });
});
