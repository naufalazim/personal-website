import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skills } from './Skills';

describe('Skills', () => {
  it('renders every skill as a badge, with no invalid Tailwind classes', () => {
    render(<Skills />);

    const badge = screen.getByText('Java');
    expect(badge).toBeInTheDocument();
    expect(badge.className).not.toContain('bg-orange');
    expect(badge.className).not.toContain('text-whit-600');
  });

  it('renders all skill category headings', () => {
    render(<Skills />);

    expect(screen.getByText('Backend & Core')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Industry & Tools')).toBeInTheDocument();
  });
});
