import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { authApi, authStorage, userApi, User } from './api-client';
import { toast } from 'sonner';

// ✅ FIXED: Using unified api-client.ts (fetch-based HttpClient)
// Removed duplicate api.ts (axios-based ApiClient)

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  hasRole: (roles: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Define helper function first (before useCallback)
  const resolveUserProfile = async (fallbackEmail?: string): Promise<User> => {
    try {
      const profile = await authApi.getProfile();
      return profile;
    } catch (error) {
      if (fallbackEmail) {
        try {
          const fallbackUser = await userApi.findByEmail(fallbackEmail);
          if (fallbackUser) {
            return fallbackUser;
          }
        } catch {
          // ignore fallback errors and rethrow original error below
        }
      }
      throw error;
    }
  };

  // ✅ Define loadUser before useEffect uses it
  const loadUser = useCallback(async () => {
    try {
      // Try to get user data from localStorage first
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('✅ Loaded user from localStorage:', userData);
          setUser(userData);
          // Add small delay to ensure state is updated before loading=false
          await new Promise(resolve => setTimeout(resolve, 50));
          setLoading(false);
          return;
        } catch (parseError) {
          console.warn('Failed to parse stored user data:', parseError);
        }
      }

      // If no stored user data, try to get from API
      const fallbackEmail = authStorage.readEmail() ?? undefined;
      const userData = await resolveUserProfile(fallbackEmail);
      setUser(userData);
      authStorage.saveUser(userData);

    } catch (error) {
      console.warn('Failed to load user:', error);
      // Token invalid or expired - clear all auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_email');
      authStorage.clearToken();
      authStorage.clearUser();
      authStorage.clearEmail();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - resolveUserProfile is stable

  // ✅ Now useEffect can safely reference loadUser
  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem('auth_token');
    
    if (storedToken) {
      setToken(storedToken);
      // HttpClient auto-reads token from localStorage, no need to manually set
      // Verify with backend
      loadUser();
    } else {
      setLoading(false);
    }
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      const accessToken = response.access_token;

      if (!accessToken) {
        throw new Error('Token tidak ditemukan pada respons');
      }

      // Save token and email
      authStorage.saveToken(accessToken);
      authStorage.saveEmail(email);
      setToken(accessToken);

      // Create user object from login response (supports both flat and nested structure)
      const userProfile: User = {
        id: String(response.user_id || response.user?.id || ''),
        email: response.email || response.user?.email || email,
        nama: response.name || response.user?.display_name || email,
        role: (response.role || response.user?.role || 'regional_admin') as 'super_admin' | 'regional_admin',
        profile_picture_url: response.profile_picture_url ?? response.user?.profile_picture_url ?? null,
        is_active: response.user?.is_active ?? true,
        created_at: response.user?.created_at || new Date().toISOString(),
        updated_at: response.user?.updated_at || new Date().toISOString()
      };

      authStorage.saveUser(userProfile);
      setUser(userProfile);
      
      // HttpClient auto-reads token from localStorage, no manual setToken needed
      
      toast.success('Berhasil masuk ke sistem');
    } catch (error) {
      const status = (error as Error & { status?: number }).status;
      const message = status
        ? 'Email atau password salah'
        : 'Layanan autentikasi tidak tersedia. Coba lagi nanti.';
      toast.error(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout().catch(() => undefined);
    authStorage.clearToken();
    authStorage.clearUser();
    authStorage.clearEmail();
    setToken(null);
    setUser(null);
    toast.success('Berhasil keluar dari sistem');
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem('auth_token');
    if (!currentToken) {
      console.warn('No token found, cannot refresh user');
      return;
    }
    
    try {
      console.log('🔄 Refreshing user data from API...');
      const profile = await authApi.getProfile();
      console.log('✅ User data refreshed:', profile);
      setUser(profile);
      authStorage.saveUser(profile);
    } catch (error) {
      console.error('❌ Failed to refresh user:', error);
      // If refresh fails, try fallback
      try {
        const fallbackEmail = authStorage.readEmail();
        if (fallbackEmail) {
          const fallbackUser = await userApi.findByEmail(fallbackEmail);
          if (fallbackUser) {
            console.log('✅ User data loaded from fallback:', fallbackUser);
            setUser(fallbackUser);
            authStorage.saveUser(fallbackUser);
            return;
          }
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
      }
      throw error;
    }
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...userData };
      authStorage.saveUser(updated);
      return updated;
    });
  }, []);

  const hasRole = useCallback((roles: string | string[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  }, [user]);


  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    logout,
    refreshUser,
    updateUser,
    isAuthenticated: !!token && !!user,
    hasRole,
  }), [user, token, loading, login, logout, refreshUser, updateUser, hasRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth harus digunakan dalam AuthProvider');
  }
  return context;
}
