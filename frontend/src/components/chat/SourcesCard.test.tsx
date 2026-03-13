import { render, screen } from '@testing-library/react';

import SourcesCard from './SourcesCard';

describe('SourcesCard', () => {
  const sources = [
    { name: 'lecture1.pdf', type: 'pdf', detail: 'p. 1-8' },
    { name: 'notes.md', type: 'md', detail: 'section 2' },
  ] as const;

  it('renders all sources and details', () => {
    render(<SourcesCard sources={[...sources]} />);

    expect(screen.getByText('lecture1.pdf')).toBeInTheDocument();
    expect(screen.getByText('notes.md')).toBeInTheDocument();
    expect(screen.getByText('p. 1-8')).toBeInTheDocument();
    expect(screen.getByText('section 2')).toBeInTheDocument();
    expect(screen.getByText('2 docs · 12s')).toBeInTheDocument();
  });

  it('renders custom label', () => {
    render(<SourcesCard sources={[...sources]} label="RAG Context" />);

    expect(screen.getByText('RAG Context')).toBeInTheDocument();
  });
});
