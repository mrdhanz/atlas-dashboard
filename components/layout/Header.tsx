// components/layout/Header.tsx
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ModeToggle } from '@/components/mode-toggle';
import { auth } from '@/auth'; // Import the auth function
import { SignOutButton } from '../auth/sign-out-button'; // Import our new component
import { User } from 'lucide-react';

export async function Header() {
  // Fetch the session on the server
  const session = await auth();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex-1">
        {/* The search button remains the same */}
        <Button variant="outline" className="gap-2 text-muted-foreground">
          <Search className="h-4 w-4"/>
          <span>Search...</span>
          <span className="ml-auto text-xs tracking-widest text-muted-foreground">⌘K</span>
        </Button>
      </div>
      
      <div className="flex items-center gap-4">
        <ModeToggle />
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                {/* Placeholder for user avatar - we'll improve this later */}
               <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                <User className='h-5 w-5 text-muted-foreground'/>
               </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                {/* DYNAMICALLY display user data! */}
                <p className="text-sm font-medium leading-none">{session?.user?.name ?? 'Guest'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email ?? 'No email'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* Use our new SignOutButton component */}
            <SignOutButton />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}