import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'next-themes';
import { ThemeToggle } from './theme-toggle';

function renderToggle() {
  return render(
    <ThemeProvider attribute="class">
      <ThemeToggle />
    </ThemeProvider>
  );
}

describe('ThemeToggle', () => {
  it('offers Light, Dark, and System options', async () => {
    renderToggle();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /toggle theme/i }));

    expect(
      await screen.findByRole('menuitem', { name: /light/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /dark/i })).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /system/i })
    ).toBeInTheDocument();
  });
});
