'use client';

import React, { ReactNode, useState, useEffect, useRef } from 'react';
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
  ChevronsRight,
  Bell,
  User as UserIcon,
  ChevronDown,
  Settings,
  HelpCircle,
} from 'lucide-react';
import type { User } from '../lib/api-client';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { NotificationDropdown } from './notifications/NotificationDropdown';
import { useNotifications } from '../hooks/useNotifications';
import { useRouter } from 'next/navigation';

interface CollapsibleDashboardLayoutProps {
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
  notifs?: number;
};

const resolveCurrentPage = (path: string) => {
  if (path === '/dashboard') return 'dashboard';
  if (path.startsWith('/dashboard/comprehensive')) return 'comprehensive';
  if (path.startsWith('/dashboard/users')) return 'users';
  if (path.startsWith('/dashboard/approval')) return 'approval';
  if (path.startsWith('/dashboard/announcements')) return 'announcements';
  if (path.startsWith('/dashboard/settings')) return 'settings';
  if (path.startsWith('/dashboard/announcement')) return 'announcements';
  if (path.startsWith('/dashboard/taman/berita')) return 'berita';
  if (path.startsWith('/dashboard/taman/flora')) return 'flora';
  if (path.startsWith('/dashboard/taman/fauna')) return 'fauna';
  if (path.startsWith('/dashboard/taman')) return 'taman';
  if (path.startsWith('/dashboard/taman/activities')) return 'activities';
  if (path.startsWith('/dashboard/ai-demo')) return 'ai-demo';
  if (path.startsWith('/dashboard/demo')) return 'demo';
  return 'dashboard';
};

const buildNavItems = (role?: User['role'] | null): NavItem[] => {
  const baseItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  ];

  if (role === 'super_admin') {
    return [
      ...baseItems,
      { id: 'users', label: 'Pengguna', icon: Users, path: '/dashboard/users' },
      { id: 'approval', label: 'Persetujuan', icon: CheckCircle, path: '/dashboard/approval' },
      { id: 'announcements', label: 'Pengumuman', icon: Megaphone, path: '/dashboard/announcements' },
      { id: 'berita', label: 'Artikel & Berita', icon: FileText, path: '/dashboard/taman/berita' },
      { id: 'demo', label: 'Dashboard Demo', icon: BarChart3, path: '/dashboard/demo' },
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
      { id: 'demo', label: 'Dashboard Demo', icon: BarChart3, path: '/dashboard/demo' },
      { id: 'ai-demo', label: 'AI Demo', icon: Sparkles, path: '/dashboard/ai-demo' },
    ];
  }

  return baseItems;
};

export function CollapsibleDashboardLayout({
  children,
  user,
  currentPath,
  onNavigate,
  onLogout,
}: CollapsibleDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navItems = buildNavItems(user?.role);
  const currentPage = resolveCurrentPage(currentPath);
  const avatarInitial = user?.nama?.charAt(0)?.toUpperCase() ?? 'U';
  const router = useRouter();
  
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleNotificationClick = (notification: any) => {
    // Navigate based on notification type
    if (notification.resource === 'announcement' && notification.resource_id) {
      router.push(`/dashboard/announcements`);
    } else if (notification.resource === 'article' && notification.resource_id) {
      router.push(`/dashboard/taman/berita`);
    } else if (notification.resource === 'park' && notification.resource_id) {
      router.push(`/dashboard/taman`);
    } else if (notification.resource === 'activity' && notification.resource_id) {
      router.push(`/dashboard/taman/activities`);
    }
  };

  // Close user menu when sidebar is collapsed
  useEffect(() => {
    if (!sidebarOpen) {
      setUserMenuOpen(false);
    }
  }, [sidebarOpen]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (userMenuOpen && !target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex w-full bg-gray-50 text-gray-900">
        {/* Sidebar */}
        <nav
          className={`sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'w-64' : 'w-16'
          } border-gray-200 bg-white p-2 shadow-sm`}
        >
          {/* Title Section */}
          <div className="mb-6 border-b border-gray-200 pb-4 relative user-menu-container">
            <div 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Logo user={user} />
                {sidebarOpen && (
                  <div className={`transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex items-center gap-2">
                      <div>
                        <span className="block text-sm font-bold text-gray-900">
                          {user?.nama || 'User'}
                        </span>
                        <span className="block text-xs text-gray-700 font-medium">
                          {user?.role === 'super_admin' && 'Super Admin'}
                          {user?.role === 'regional_admin' && 'Regional Admin'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {sidebarOpen && (
                <ChevronDown className={`h-4 w-4 text-gray-700 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              )}
            </div>
            
            {/* User Dropdown Menu */}
            {userMenuOpen && sidebarOpen && (
              <div className="absolute top-full left-2 right-2 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onNavigate('/dashboard/settings');
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Pengaturan</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onNavigate('/dashboard/help');
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Bantuan</span>
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <div className="space-y-1 mb-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.path)}
                  className={`relative flex h-11 w-full items-center rounded-md transition-all duration-200 ${
                    isSelected 
                      ? "bg-brand-50 text-brand-700 shadow-sm border-l-2 border-brand-500" 
                      : "text-gray-900 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="grid h-full w-12 place-content-center">
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  {sidebarOpen && (
                    <span
                      className={`text-sm font-medium transition-opacity duration-200 ${
                        sidebarOpen ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {item.label}
                    </span>
                  )}

                  {item.notifs && item.notifs > 0 && sidebarOpen && (
                    <span className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs text-white font-medium">
                      {item.notifs}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Account Section */}
          {sidebarOpen && (
            <div className="border-t border-gray-200 pt-4 space-y-1">
              <div className="px-3 py-2 text-xs font-bold text-gray-900 uppercase tracking-wide">
                Account
              </div>
              {/* Settings Button */}
              <button
                onClick={() => onNavigate('/dashboard/settings')}
                className={`relative flex h-11 w-full items-center rounded-md transition-all duration-200 ${
                  currentPage === 'settings' 
                    ? 'bg-brand-50 text-brand-700 shadow-sm border-l-2 border-brand-500'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="grid h-full w-12 place-content-center">
                  <Settings className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Pengaturan</span>
              </button>
              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="relative flex h-11 w-full items-center rounded-md transition-all duration-200 text-gray-900 hover:bg-gray-50 hover:text-gray-900"
              >
                <div className="grid h-full w-12 place-content-center">
                  <LogOut className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Keluar</span>
              </button>
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute bottom-0 left-0 right-0 border-t border-gray-200 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center p-3">
              <div className="grid size-10 place-content-center">
                <ChevronsRight
                  className={`h-4 w-4 transition-transform duration-300 text-gray-900 ${
                    sidebarOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {sidebarOpen && (
                <span
                  className={`text-sm font-bold text-gray-900 transition-opacity duration-200 ${
                    sidebarOpen ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  Sembunyikan
                </span>
              )}
            </div>
          </button>
        </nav>

        {/* Main Content */}
        <div className="flex-1 bg-gray-50 overflow-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {navItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
                </h1>
                <p className="text-gray-700 mt-1 text-sm font-medium">
                  Selamat datang kembali, {user?.nama}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <NotificationDropdown
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onNotificationClick={handleNotificationClick}
                  loading={notificationsLoading}
                />
                <Avatar key={user?.profile_picture_url || 'no-avatar-header'} className="h-9 w-9">
                  {user?.profile_picture_url && (
                    <AvatarImage 
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.profile_picture_url}`}
                      alt={user?.nama || user?.display_name || 'Profile photo'}
                    />
                  )}
                  <AvatarFallback className="bg-brand-600 text-white font-medium text-sm">
                    {avatarInitial}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

const Logo = ({ user }: { user: User | null }) => {
  const avatarInitial = user?.nama?.charAt(0)?.toUpperCase() ?? 'T';
  
  return (
    <Avatar key={user?.profile_picture_url || 'no-avatar-sidebar'} className="size-10 shrink-0 shadow-sm border-2 border-white">
      {user?.profile_picture_url && (
        <AvatarImage 
          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.profile_picture_url}`}
          alt={user?.nama || 'Profile photo'}
        />
      )}
      <AvatarFallback className="bg-gradient-to-br from-brand-600 to-brand-700 text-white font-bold text-sm">
        {avatarInitial}
      </AvatarFallback>
    </Avatar>
  );
};

