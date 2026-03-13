import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ConfirmModal from './ConfirmModal';

describe('ConfirmModal', () => {
  it('renders title and message when opened', () => {
    render(
      <ConfirmModal
        isOpen
        title="Delete file"
        message="This action cannot be undone."
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByText('Delete file')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });

  it('calls cancel and confirm handlers from buttons', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    const onConfirm = jest.fn();

    render(
      <ConfirmModal
        isOpen
        title="Confirm"
        message="Proceed?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('applies danger styles for danger variant', () => {
    render(
      <ConfirmModal
        isOpen
        title="Delete"
        message="Dangerous action"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass('bg-accent-red');
  });
});
