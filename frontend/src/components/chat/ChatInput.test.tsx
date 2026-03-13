import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ChatInput from './ChatInput';

describe('ChatInput', () => {
  it('calls onChange when user types', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onSubmit = jest.fn();

    render(<ChatInput value="" onChange={onChange} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Chat message input'), 'hello');

    expect(onChange).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits on Enter key', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onSubmit = jest.fn();

    render(<ChatInput value="question" onChange={onChange} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Chat message input'), '{enter}');

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('disables send button for blank input and disables input when disabled', () => {
    const onChange = jest.fn();
    const onSubmit = jest.fn();
    const { rerender } = render(<ChatInput value="   " onChange={onChange} onSubmit={onSubmit} />);

    expect(screen.getByLabelText('Send message')).toBeDisabled();

    rerender(<ChatInput value="hello" disabled onChange={onChange} onSubmit={onSubmit} />);

    expect(screen.getByLabelText('Chat message input')).toBeDisabled();
    expect(screen.getByLabelText('Send message')).toBeDisabled();
  });
});
