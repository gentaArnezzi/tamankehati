'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../lib/useAuth';
import { parksApi, Park } from '../../lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  MapPin, 
  TreePine, 
  Bird, 
  Eye, 
  ChevronRight, 
  AlertCircle,
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  CheckCircle,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import { ParkDetailStats } from './ParkDetailStats';
// RegionForm removed - using park-based scoping
import { ParkForm } from './ParkForm';
import { Input } from '../ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Progress } from '../ui/progress';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

// Regions will be loaded from API

export function TamanZonaDashboard() {
  const { user } = useAuth();
  const [selectedPark, setSelectedPark] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // API data states
  const [parks, setParks] = useState<Park[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [showParkForm, setShowParkForm] = useState(false);

  // Load parks on component mount
  useEffect(() => {
    loadParks();
  }, []);

  const loadParks = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params: Record<string, any> = { 
        limit: 100 
      };

      // Regional admin filtering is now handled by backend automatically
      // No need to pass region or created_by param here

      const response = await parksApi.list(params);
      setParks(response.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data taman');
      setParks([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Regions functionality removed - using park-based scoping

  const parksInRegion = useMemo(() => {
    if (!Array.isArray(parks)) return [];
    if (!searchQuery) return parks;
    return parks.filter(park => 
      park.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [parks, searchQuery]);

  const park = useMemo(() => 
    selectedPark ? parks.find(p => p.id === selectedPark) : null
  , [selectedPark, parks]);

  // Region selection removed - using park-based scoping

  const handleParkSelect = (parkId: number) => {
    setSelectedPark(parkId);
  };

  const handleBackToParks = () => {
    setSelectedPark(null);
  };

  const handleFormSuccess = (formType: 'park' | 'zone') => {
    if (formType === 'park') {
      setShowParkForm(false);
      loadParks(); // Reload parks
    }
  };

  const handleSubmitPark = async (parkId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
        // Redirect to login
        window.location.href = '/login';
        return;
      }
      
      console.log('Submit park:', parkId, 'with token length:', token.length);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}/api/v1/parks/${parkId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
          // Clear invalid token
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          // Redirect to login
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Gagal submit park');
      }

      const result = await response.json();
      console.log('Submit success:', result);
      toast.success('Park berhasil diajukan untuk review!');
      loadParks(); // Reload to show updated status
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal submit park';
      console.error('Submit park error:', err);
      toast.error(errorMessage);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      draft: { label: 'Draft', className: 'bg-slate-200 text-slate-800' },
      in_review: { label: 'Menunggu Persetujuan', className: 'bg-blue-100 text-blue-800' },
      approved: { label: 'Disetujui', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-700' },
      published: { label: 'Dipublikasi', className: 'bg-emerald-100 text-emerald-800' },
      archived: { label: 'Diarsipkan', className: 'bg-gray-100 text-gray-700' },
    };
    
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Section: Statistics with Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Statistics Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Region</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">1</div>
            <p className="text-xs text-muted-foreground">Wilayah konservasi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Taman</CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{parks.length}</div>
            <p className="text-xs text-muted-foreground">Kawasan konservasi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Zona</CardTitle>
            <Grid3X3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">0</div>
            <p className="text-xs text-muted-foreground">Fitur zona dihapus</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taman Aktif</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {Array.isArray(parks) ? parks.filter(p => p.status === 'published').length : 0}
            </div>
            <p className="text-xs text-muted-foreground">Taman dipublikasi</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Status Taman</CardTitle>
          <CardDescription>Distribusi status taman konservasi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {Array.isArray(parks) ? parks.filter(p => p.status === 'published').length : 0}
              </div>
              <div className="text-sm text-muted-foreground">Published</div>
              <Progress 
                value={Array.isArray(parks) ? (parks.filter(p => p.status === 'published').length / Math.max(parks.length, 1)) * 100 : 0} 
                className="mt-2 h-2"
              />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {Array.isArray(parks) ? parks.filter(p => p.status === 'draft').length : 0}
              </div>
              <div className="text-sm text-muted-foreground">Draft</div>
              <Progress 
                value={Array.isArray(parks) ? (parks.filter(p => p.status === 'draft').length / Math.max(parks.length, 1)) * 100 : 0} 
                className="mt-2 h-2 bg-yellow-200"
              />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">
                {Array.isArray(parks) ? parks.filter(p => p.status === 'archived').length : 0}
              </div>
              <div className="text-sm text-muted-foreground">Archived</div>
              <Progress 
                value={Array.isArray(parks) ? (parks.filter(p => p.status === 'archived').length / Math.max(parks.length, 1)) * 100 : 0} 
                className="mt-2 h-2 bg-gray-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parks List */}
      <div className="space-y-6">
        {selectedPark && park ? (
          // Park Detail View
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handleBackToParks} className="px-2">
                <ChevronRight className="h-4 w-4 rotate-180" />
              </Button>
              <h2 className="text-2xl font-bold">{park.name}</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Luas Area</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{park.area_ha ? `${park.area_ha} ha` : 'N/A'}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <TreePine className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{park.status}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Jumlah Zona</CardTitle>
                  <Grid3X3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                </CardContent>
              </Card>
            </div>

            <ParkDetailStats 
              park={park}
              zones={[]}
            />
          </div>
        ) : (
          // Park List View
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Taman Nasional</CardTitle>
                <CardDescription>
                  {loading ? 'Memuat...' : `${parksInRegion.length} taman ditemukan`}
                </CardDescription>
              </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Cari taman..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
              <Dialog open={showParkForm} onOpenChange={setShowParkForm}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Park Baru</DialogTitle>
                    <DialogDescription>
                      Buat park baru untuk mengelola zona konservasi
                    </DialogDescription>
                  </DialogHeader>
                  <ParkForm 
                    onSuccess={() => handleFormSuccess('park')}
                    onCancel={() => setShowParkForm(false)}
                  />
                </DialogContent>
              </Dialog>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setViewMode('grid')} 
                disabled={viewMode === 'grid'}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setViewMode('list')} 
                disabled={viewMode === 'list'}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : parksInRegion.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Tidak ada taman ditemukan.</p>
              ) : (
                <div className={viewMode === 'grid' ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
                  {parksInRegion.map((p) => (
                    <Card 
                      key={p.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleParkSelect(p.id)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-base">{p.name}</CardTitle>
                            <CardDescription>{p.area_ha ? `${p.area_ha} ha` : 'N/A'}</CardDescription>
                          </div>
                          {p.status === 'draft' && user?.role === 'regional_admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleSubmitPark(p.id, e)}
                              title="Ajukan untuk Review"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="flex justify-between items-center text-sm">
                        {getStatusBadge(p.status)}
                        <span className="text-muted-foreground">ID: {p.id}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}