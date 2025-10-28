import { ReactNode } from 'react';
import Menu, { IMenu } from './navbar';

interface NavBarProps {
  children?: ReactNode;
  logo?: ReactNode;
  className?: string;
}

export function NavBar({ children, logo, className = "" }: NavBarProps) {
  return (
    <header className={`sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center">
            {logo || (
              <a href="/" className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-sm font-bold">TK</span>
                </div>
                <span className="font-bold text-xl">Taman Kehati</span>
              </a>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Menu list={[
              { id: 1, title: 'Beranda', url: '/' },
              { id: 2, title: 'Flora', url: '/flora' },
              { id: 3, title: 'Fauna', url: '/fauna' },
              { id: 4, title: 'Taman', url: '/taman' },
              { id: 5, title: 'Kegiatan', url: '/kegiatan' },
              { id: 6, title: 'Artikel', url: '/artikel' },
            ]} />
          </div>

          {/* Mobile Menu Button - You can implement mobile menu here */}
          <div className="md:hidden">
            <button className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Additional content slot */}
        {children}
      </div>
    </header>
  );
}

export default NavBar;
