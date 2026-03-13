import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RenameModal from './RenameModal';

describe('RenameModal', () => {
  it('does not render when closed', () => {
    const { container } = render(
      <RenameModal
        isOpen={false}
        filename="lecture.pdf"
        newName="lecture"
        isRenaming={false}
        onNameChange={jest.fn()}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders extension and triggers callbacks from keyboard', async () => {
    const user = userEvent.setup();
    const onNameChange = jest.fn();
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    render(
      <RenameModal
        isOpen
        filename="lecture.pdf"
        newName="lecture"
        isRenaming={false}
        onNameChange={onNameChange}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByText('.pdf')).toBeInTheDocument();

    const input = screen.getByRole('textbox');
    await user.type(input, '2');
    await user.keyboard('{Enter}');
    await user.keyboard('{Escape}');

    expect(onNameChange).toHaveBeenCalled();
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
