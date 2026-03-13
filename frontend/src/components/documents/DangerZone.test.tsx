import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DangerZone from './DangerZone';
import { clearKnowledgeBaseClient } from '@/backend/client';
import { useRouter } from 'next/navigation';

jest.mock('@/backend/client', () => ({
  clearKnowledgeBaseClient: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockedClearKnowledgeBaseClient = clearKnowledgeBaseClient as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;

describe('DangerZone', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens confirmation modal when clear button is clicked', async () => {
    const user = userEvent.setup();
    mockedUseRouter.mockReturnValue({ refresh: jest.fn() });
    mockedClearKnowledgeBaseClient.mockResolvedValue(undefined);

    render(<DangerZone />);
    await user.click(screen.getByRole('button', { name: 'Clear Knowledge Base' }));

    expect(screen.getByText('Clear entire Knowledge Base?')).toBeInTheDocument();
  });

  it('clears knowledge base and refreshes on confirm', async () => {
    const user = userEvent.setup();
    const refresh = jest.fn();
    mockedUseRouter.mockReturnValue({ refresh });
    mockedClearKnowledgeBaseClient.mockResolvedValue(undefined);

    render(<DangerZone />);
    await user.click(screen.getByRole('button', { name: 'Clear Knowledge Base' }));
    await user.click(screen.getByRole('button', { name: 'Yes, delete everything' }));

    await waitFor(() => {
      expect(mockedClearKnowledgeBaseClient).toHaveBeenCalledTimes(1);
      expect(refresh).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error message when clear action fails', async () => {
    const user = userEvent.setup();
    mockedUseRouter.mockReturnValue({ refresh: jest.fn() });
    mockedClearKnowledgeBaseClient.mockRejectedValue(new Error('boom'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<DangerZone />);
    await user.click(screen.getByRole('button', { name: 'Clear Knowledge Base' }));
    await user.click(screen.getByRole('button', { name: 'Yes, delete everything' }));

    expect(await screen.findByText('boom')).toBeInTheDocument();

    errorSpy.mockRestore();
  });
});
