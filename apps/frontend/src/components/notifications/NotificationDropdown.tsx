'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Megaphone, Calendar, FileText, TreePine, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  resource?: string | null;
  resource_id?: number | null;
  region_code?: string | null;
  is_read: boolean;
  created_at: string;
  from_user_id?: number | null;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (notificationId: number) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: Notification) => void;
  loading?: boolean;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'announcement':
    case 'announcement_published':
      return <Megaphone className="h-5 w-5 text-blue-600" />;
    case 'activity':
    case 'activity_created':
      return <Calendar className="h-5 w-5 text-green-600" />;
    case 'article':
    case 'article_published':
      return <FileText className="h-5 w-5 text-purple-600" />;
    case 'park':
    case 'park_approved':
      return <TreePine className="h-5 w-5 text-emerald-600" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-600" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'announcement':
    case 'announcement_published':
      return 'bg-blue-50 border-blue-100';
    case 'activity':
    case 'activity_created':
      return 'bg-green-50 border-green-100';
    case 'article':
    case 'article_published':
      return 'bg-purple-50 border-purple-100';
    case 'park':
    case 'park_approved':
      return 'bg-emerald-50 border-emerald-100';
    default:
      return 'bg-gray-50 border-gray-100';
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Baru saja';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
  
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export function NotificationDropdown({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
  loading = false,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    onNotificationClick(notification);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <Card className="absolute right-0 top-full mt-2 w-96 z-50 shadow-lg border-gray-200">
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900">Notifikasi</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              {unreadCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {unreadCount} notifikasi belum dibaca
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMarkAllAsRead}
                    className="text-brand-600 hover:text-brand-700 text-xs"
                  >
                    Tandai semua sudah dibaca
                  </Button>
                </div>
              )}
            </div>

            <ScrollArea className="h-[400px]">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Memuat notifikasi...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-900">Tidak ada notifikasi</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Notifikasi baru akan muncul di sini
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`
                        p-4 cursor-pointer transition-colors hover:bg-gray-50
                        ${!notification.is_read ? 'bg-blue-50/50' : ''}
                      `}
                    >
                      <div className="flex gap-3">
                        <div className={`
                          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                          ${getNotificationColor(notification.type)}
                        `}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-semibold text-gray-900 ${!notification.is_read ? 'font-bold' : ''}`}>
                              {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1"></span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.created_at)}
                            </span>
                            
                            {notification.resource && (
                              <Badge variant="outline" className="text-xs">
                                {notification.resource}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {notifications.length > 0 && (
              <div className="border-t border-gray-200 p-3">
                <Button
                  variant="ghost"
                  className="w-full text-sm text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to notifications page if exists
                  }}
                >
                  Lihat semua notifikasi
                </Button>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}




