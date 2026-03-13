import { render, screen } from '@testing-library/react';

import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('renders each status with expected accessible label', () => {
    const statuses = [
      { value: 'ready', label: 'READY' },
      { value: 'processing', label: 'PROCESSING' },
      { value: 'pending', label: 'PENDING' },
      { value: 'failed', label: 'FAILED' },
    ] as const;

    for (const status of statuses) {
      const { unmount } = render(<StatusBadge status={status.value} />);
      expect(screen.getByText(status.label)).toBeInTheDocument();
      expect(screen.getByLabelText(`Status: ${status.label}`)).toBeInTheDocument();
      unmount();
    }
  });
});
