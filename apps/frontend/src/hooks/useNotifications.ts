'use client';

import { useState, useEffect, useCallback } from 'react';
import { notificationsApi, Notification } from '../lib/api-client';
import { toast } from 'sonner';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated (has token)
  const isAuthenticated = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('auth_token');
    return !!token;
  }, []);

  const fetchNotifications = useCallback(async () => {
    // Don't fetch if not authenticated
    if (!isAuthenticated()) {
      console.log('📭 Notifications: Skipping fetch (not authenticated)');
      setLoading(false);
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      console.log('📬 Notifications: Fetching notifications...');
      setLoading(true);
      const response = await notificationsApi.list({ limit: 50, offset: 0 });
      console.log('📬 Notifications: Fetched', response.items.length, 'notifications');
      setNotifications(response.items);
      
      // Calculate unread count
      const unread = response.items.filter(n => !n.is_read).length;
      setUnreadCount(unread);
      
      setError(null);
    } catch (err) {
      console.error('❌ Notifications: Failed to fetch:', err);
      // Don't set error state - fail silently to avoid blocking UI
      // setError('Gagal memuat notifikasi');
      setNotifications([]); // Empty array instead of error
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = useCallback(async () => {
    // Don't fetch if not authenticated
    if (!isAuthenticated()) {
      console.log('📭 Notifications: Skipping unread count (not authenticated)');
      setUnreadCount(0);
      return;
    }

    try {
      console.log('🔔 Notifications: Fetching unread count...');
      const response = await notificationsApi.getUnreadCount();
      console.log('🔔 Notifications: Unread count =', response.count);
      setUnreadCount(response.count);
    } catch (err) {
      console.error('❌ Notifications: Failed to fetch unread count:', err);
      // Fail silently - don't crash the app
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      toast.error('Gagal menandai notifikasi sebagai sudah dibaca');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      
      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      
      setUnreadCount(0);
      toast.success('Semua notifikasi ditandai sudah dibaca');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      toast.error('Gagal menandai semua notifikasi');
    }
  }, []);

  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
  };
}




