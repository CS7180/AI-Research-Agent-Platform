import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PageUploadDropzone from './PageUploadDropzone';
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

describe('PageUploadDropzone', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uploads selected file and refreshes page', async () => {
    const refresh = jest.fn();
    mockedUseRouter.mockReturnValue({ refresh });
    mockedUploadDocumentClient.mockResolvedValue(undefined);
    render(<PageUploadDropzone />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'slides.pdf', { type: 'application/pdf' });
    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(mockedUploadDocumentClient).toHaveBeenCalledWith(file, '/');
      expect(refresh).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error message on upload failure', async () => {
    mockedUseRouter.mockReturnValue({ refresh: jest.fn() });
    mockedUploadDocumentClient.mockRejectedValue(new Error('network error'));
    render(<PageUploadDropzone />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'slides.pdf', { type: 'application/pdf' });
    await userEvent.upload(input, file);

    expect(await screen.findByText('Upload failed. Please try again.')).toBeInTheDocument();
  });
});
