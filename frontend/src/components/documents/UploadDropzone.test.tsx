import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UploadDropzone from './UploadDropzone';
import { uploadDocumentClient } from '@/backend/client';
import { useRouter } from 'next/navigation';

jest.mock('@/backend/client', () => ({
  uploadDocumentClient: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockedUploadDocumentClient = uploadDocumentClient as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;

describe('UploadDropzone', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uploads selected file and refreshes page', async () => {
    const refresh = jest.fn();
    mockedUseRouter.mockReturnValue({ refresh });
    mockedUploadDocumentClient.mockResolvedValue(undefined);
    render(<UploadDropzone />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['a'], 'notes.md', { type: 'text/markdown' });
    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(mockedUploadDocumentClient).toHaveBeenCalledWith(file, '/');
      expect(refresh).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error when upload fails', async () => {
    mockedUseRouter.mockReturnValue({ refresh: jest.fn() });
    mockedUploadDocumentClient.mockRejectedValue(new Error('upload failed'));
    render(<UploadDropzone />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['a'], 'notes.md', { type: 'text/markdown' });
    await userEvent.upload(input, file);

    expect(await screen.findByText('Upload failed.')).toBeInTheDocument();
  });
});
