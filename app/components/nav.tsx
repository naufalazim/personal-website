'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

const navItems = {
  '/': {
    name: 'home',
  },
  '/blog': {
    name: 'blog',
  },
};

export function Navbar() {
  const pathname = usePathname();

  return (
    <aside className="-ml-[8px] mb-16 tracking-tight">
      <div className="lg:sticky lg:top-20">
        <nav
          className="flex flex-row items-center justify-between relative px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative"
          id="nav"
        >
          <div className="flex flex-row space-x-0 pr-10">
            {Object.entries(navItems).map(([path, { name }]) => {
              const isActive =
                path === '/' ? pathname === '/' : pathname.startsWith(path);

              return (
                <Link
                  key={path}
                  href={path}
                  className={cn(
                    'transition-all hover:text-neutral-800 dark:hover:text-neutral-200 flex align-middle relative py-1 px-2 m-1',
                    isActive && 'text-neutral-900 dark:text-neutral-100'
                  )}
                >
                  {name}
                </Link>
              );
            })}
          </div>
          <ThemeToggle />
        </nav>
      </div>
    </aside>
  );
}
