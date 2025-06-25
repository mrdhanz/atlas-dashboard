// components/layout/Sidebar.tsx
"use client"; // This must be a client component to use the usePathname hook.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BotMessageSquare, FolderKanban, Home, Settings } from 'lucide-react';
import { cn } from '@/lib/utils'; // We'll use this for conditional class names.

// 1. Define navigation items in a data structure for easy maintenance.
const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: Home,
  },
  {
    href: '/projects',
    label: 'Projects',
    icon: FolderKanban,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
];

export function Sidebar() {
  // 2. Get the current path from Next.js router.
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col gap-y-4 border-r bg-background p-4">
      <div className="flex items-center gap-2 p-4">
        <BotMessageSquare className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold">Atlas</h1>
      </div>
      <nav className="flex flex-col gap-y-1">
        {/* 3. Map over the navItems array to render links dynamically. */}
        {navItems.map((item) => {
          // Check if the current route matches the link's href.
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              // 4. Use cn() to conditionally apply active/inactive styles.
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-muted text-primary' // Active link styles
                  : 'text-muted-foreground hover:bg-muted/50' // Inactive link styles
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}