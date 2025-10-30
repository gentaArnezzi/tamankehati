'use client';

import { ReactNode, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  TreePine,
  Bird,
  FileText,
  CheckCircle,
  LogOut,
  Calendar,
  Megaphone,
  Sparkles,
  BarChart3,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
  Settings,
} from 'lucide-react';
import type { User } from '../lib/api-client';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface DashboardLayoutBaseProps {
  children: ReactNode;
  user: User | null;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

type NavItem = {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
};

const resolveCurrentPage = (path: string) => {
  if (path === '/dashboard') return 'dashboard';
  if (path.startsWith('/dashboard/comprehensive')) return 'comprehensive';
  if (path.startsWith('/dashboard/users')) return 'users';
  if (path.startsWith('/dashboard/approval')) return 'approval';
  if (path.startsWith('/dashboard/announcements')) return 'announcements';
  if (path.startsWith('/dashboard/announcement')) return 'announcements';
  if (path.startsWith('/dashboard/taman/berita')) return 'berita';
  if (path.startsWith('/dashboard/taman/flora')) return 'flora';
  if (path.startsWith('/dashboard/taman/fauna')) return 'fauna';
  if (path.startsWith('/dashboard/taman')) return 'taman';
  if (path.startsWith('/dashboard/taman/activities')) return 'activities';
  return 'dashboard';
};

const buildNavItems = (role?: User['role'] | null): NavItem[] => {
  const baseItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'comprehensive', label: 'Analytics', icon: BarChart3, path: '/dashboard/comprehensive' },
  ];

  if (role === 'super_admin') {
    return [
      ...baseItems,
      { id: 'users', label: 'Pengguna', icon: Users, path: '/dashboard/users' },
      { id: 'approval', label: 'Persetujuan', icon: CheckCircle, path: '/dashboard/approval' },
      { id: 'announcements', label: 'Pengumuman', icon: Megaphone, path: '/dashboard/announcements' },
      { id: 'berita', label: 'Artikel & Berita', icon: FileText, path: '/dashboard/taman/berita' },
    ];
  }

  if (role === 'regional_admin') {
    return [
      ...baseItems,
      { id: 'announcements', label: 'Pengumuman', icon: Megaphone, path: '/dashboard/announcements' },
      { id: 'taman', label: 'Taman', icon: TreePine, path: '/dashboard/taman' },
      { id: 'flora', label: 'Flora', icon: TreePine, path: '/dashboard/taman/flora' },
      { id: 'fauna', label: 'Fauna', icon: Bird, path: '/dashboard/taman/fauna' },
      { id: 'activities', label: 'Kegiatan', icon: Calendar, path: '/dashboard/taman/activities' },
      { id: 'ai-demo', label: 'AI Demo', icon: Sparkles, path: '/dashboard/ai-demo' },
    ];
  }

  return baseItems;
};

export function DashboardLayoutBase({
  children,
  user,
  currentPath,
  onNavigate,
  onLogout,
}: DashboardLayoutBaseProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navItems = useMemo(() => buildNavItems(user?.role), [user?.role]);
  const currentPage = resolveCurrentPage(currentPath);
  const avatarInitial = user?.nama?.charAt(0)?.toUpperCase() ?? 'U';

  const handleNavigation = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Header - Clean & Minimalist */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
        <div className="flex h-14 items-center px-4 sm:px-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden mr-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-black" />
            ) : (
              <Menu className="w-5 h-5 text-black" />
            )}
          </button>

          {/* Desktop Collapse Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex mr-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? (
              <ChevronsRight className="w-5 h-5 text-black" />
            ) : (
              <ChevronsLeft className="w-5 h-5 text-black" />
            )}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 bg-black rounded flex items-center justify-center flex-shrink-0">
              <div className="w-3 h-3 border-2 border-white rounded-sm"></div>
            </div>
            <span className="font-semibold text-black text-base sm:text-lg tracking-tight">
              Taman Kehati
            </span>
          </div>

          {/* User Section */}
          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-black leading-tight">{user?.nama}</p>
              <p className="text-xs text-gray-500">
                {user?.role === 'super_admin' && 'Super Admin'}
                {user?.role === 'regional_admin' && 'Regional Admin'}
              </p>
            </div>
            <Avatar key={user?.profile_picture_url || 'no-avatar-header-base'} className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0">
              {user?.profile_picture_url && (
                <AvatarImage 
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-zxb9.onrender.com'}${user.profile_picture_url}`}
                  alt={user?.nama || user?.display_name || 'Profile photo'}
                />
              )}
              <AvatarFallback className="bg-black text-white font-medium text-sm">
                {avatarInitial}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Black Minimalist with Collapse */}
        <aside
          className={`
            fixed lg:sticky top-14 left-0 z-40 h-[calc(100vh-3.5rem)]
            bg-black border-r border-gray-800
            transition-all duration-300 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${sidebarCollapsed ? 'lg:w-16' : 'w-64 sm:w-72 lg:w-60'}
          `}
        >
          <ScrollArea className="h-full">
            {/* User Info - Mobile Only */}
            <div className="lg:hidden px-4 py-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <Avatar key={user?.profile_picture_url || 'no-avatar-mobile-base'} className="h-10 w-10">
                  {user?.profile_picture_url && (
                    <AvatarImage 
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-zxb9.onrender.com'}${user.profile_picture_url}`}
                      alt={user?.nama || user?.display_name || 'Profile photo'}
                    />
                  )}
                  <AvatarFallback className="bg-white text-black font-medium">
                    {avatarInitial}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-white">{user?.nama}</p>
                  <p className="text-xs text-gray-400">
                    {user?.role === 'super_admin' && 'Super Admin'}
                    {user?.role === 'regional_admin' && 'Regional Admin'}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="px-2 py-4 sm:py-6 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNavigation(item.path);
                    }}
                    className={`
                      relative w-full flex items-center rounded-lg
                      text-sm font-medium transition-all duration-200
                      ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-3 py-2.5'}
                      ${isActive 
                        ? 'bg-white text-black shadow-sm' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-900'
                      }
                    `}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Divider */}
            <div className={`py-2 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
              <div className="h-px bg-gray-800"></div>
            </div>

            {/* Settings & Logout */}
            <div className={`pb-6 space-y-1 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
              {/* Settings Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNavigation('/dashboard/settings');
                }}
                className={`
                  w-full flex items-center rounded-lg text-sm font-medium
                  text-gray-400 hover:text-white hover:bg-gray-900 transition-all duration-200
                  ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-3 py-2.5'}
                  ${currentPath === '/dashboard/settings' ? 'bg-white text-black' : ''}
                `}
                title={sidebarCollapsed ? 'Pengaturan' : undefined}
              >
                <Settings className="h-4 w-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Pengaturan</span>}
              </button>

              {/* Logout Button */}
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center rounded-lg text-sm font-medium
                  text-gray-400 hover:text-white hover:bg-gray-900 transition-all duration-200
                  ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-3 py-2.5'}
                `}
                title={sidebarCollapsed ? 'Keluar' : undefined}
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Keluar</span>}
              </button>
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className={`
          flex-1 w-full min-h-[calc(100vh-3.5rem)] bg-gray-50
          transition-all duration-300 ease-in-out
        `}>
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
