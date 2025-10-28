'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../lib/useAuth';
import { parksApi, Park } from '../../lib/api-client';
import { Card, CardContent, CardDescription,CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  TreePine,
  FileText,
  MapPin,
  Loader2,
  AlertCircle,
  Plus,
  Send,
  Building2,
  Leaf,
  Target,
  BookOpen,
  ChevronRight,
  Save
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { ApprovedParkDetails } from './ApprovedParkDetails';
import dynamic from 'next/dynamic';

const InteractiveMapWrapper = dynamic(() => import('../ui/interactive-map-wrapper').then(mod => ({ default: mod.InteractiveMapWrapper })), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Memuat peta...</p>
      </div>
    </div>
  )
});

interface ParkFormData {
  name: string;
  slug: string;
  // region_id: number;  // Removed - using user-based access control
  sk_penetapan: string;
  pengelola: string;
  provinsi: string;
  kota_kabupaten: string;
  kecamatan: string;
  desa_kelurahan: string;
  area_ha: number | null;
  kondisi_fisik: string;
  nilai_penting: string;
  tipe_ekoregion: string;
  description: string;
  sejarah: string;
  visi: string;
  misi: string;
  nilai_dasar: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
}

// Interfaces for Indonesian Region API
interface Province {
  id: string;
  name: string;
}

interface City {
  id: string;
  name: string;
  province_id: string;
}

interface District {
  id: string;
  name: string;
  city_id: string;
}

interface Village {
  id: string;
  name: string;
  district_id: string;
}

export function TamanSubmissionPage() {
  const { user } = useAuth();
  const [parks, setParks] = useState<Park[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // ✅ Find draft park for editing
  const draftPark = parks.find(p => p.status === 'draft');

  // Location data states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  // Selected location IDs (for cascading)
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<ParkFormData>({
    name: '',
    slug: '',
    // region_id: 0,  // Removed - using user-based access control
    sk_penetapan: '',
    pengelola: '',
    provinsi: '',
    kota_kabupaten: '',
    kecamatan: '',
    desa_kelurahan: '',
    area_ha: null,
    kondisi_fisik: '',
    nilai_penting: '',
    tipe_ekoregion: '',
    description: '',
    sejarah: '',
    visi: '',
    misi: '',
    nilai_dasar: '',
    status: 'draft',
    latitude: null,
    longitude: null,
  });

  // Current tab state for multi-step form
  const [currentTab, setCurrentTab] = useState('profil');
  
  // Tab completion tracking
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);
  
  // Guard untuk mencegah double fetch di StrictMode
  const didFetch = useRef(false);

  // Load parks and provinces on mount
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    loadParks();
    loadProvinces();
  }, []);
  
  // ✅ NEW: Pre-fill form when editing draft park
  useEffect(() => {
    if (draftPark) {
      setFormData({
        name: draftPark.name || '',
        slug: draftPark.slug || '',
        sk_penetapan: (draftPark as any).sk_penetapan || '',
        pengelola: (draftPark as any).pengelola || '',
        provinsi: draftPark.provinsi || '',
        kota_kabupaten: draftPark.kota_kabupaten || '',
        kecamatan: draftPark.kecamatan || '',
        desa_kelurahan: draftPark.desa_kelurahan || '',
        area_ha: draftPark.area_ha || null,
        kondisi_fisik: (draftPark as any).kondisi_fisik || '',
        nilai_penting: (draftPark as any).nilai_penting || '',
        tipe_ekoregion: (draftPark as any).tipe_ekoregion || '',
        description: draftPark.description || '',
        sejarah: (draftPark as any).sejarah || '',
        visi: (draftPark as any).visi || '',
        misi: (draftPark as any).misi || '',
        nilai_dasar: (draftPark as any).nilai_dasar || '',
        status: 'draft',
        latitude: (draftPark as any).latitude || null,
        longitude: (draftPark as any).longitude || null,
      });
    }
  }, [parks]); // Depend on parks, will update when parks load

  // Load provinces from API
  const loadProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const response = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
      const data = await response.json();
      console.log('Provinces loaded:', data);
      // Ensure data is an array
      if (Array.isArray(data)) {
        setProvinces(data);
      } else {
        console.error('Provinces data is not an array:', data);
        setProvinces([]);
      }
    } catch (err) {
      console.error('Failed to load provinces:', err);
      toast.error('Gagal memuat daftar provinsi');
      setProvinces([]);
    } finally {
      setLoadingProvinces(false);
    }
  };

  // Load cities when province is selected
  const loadCities = async (provinceId: string) => {
    try {
      setLoadingCities(true);
      const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
      const data = await response.json();
      console.log('Cities loaded:', data);
      if (Array.isArray(data)) {
        setCities(data);
      } else {
        console.error('Cities data is not an array:', data);
        setCities([]);
      }
    } catch (err) {
      console.error('Failed to load cities:', err);
      toast.error('Gagal memuat daftar kabupaten/kota');
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  // Load districts when city is selected
  const loadDistricts = async (cityId: string) => {
    try {
      setLoadingDistricts(true);
      const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${cityId}.json`);
      const data = await response.json();
      console.log('Districts loaded:', data);
      if (Array.isArray(data)) {
        setDistricts(data);
      } else {
        console.error('Districts data is not an array:', data);
        setDistricts([]);
      }
    } catch (err) {
      console.error('Failed to load districts:', err);
      toast.error('Gagal memuat daftar kecamatan');
      setDistricts([]);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Load villages when district is selected
  const loadVillages = async (districtId: string) => {
    try {
      setLoadingVillages(true);
      const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${districtId}.json`);
      const data = await response.json();
      console.log('Villages loaded:', data);
      if (Array.isArray(data)) {
        setVillages(data);
      } else {
        console.error('Villages data is not an array:', data);
        setVillages([]);
      }
    } catch (err) {
      console.error('Failed to load villages:', err);
      toast.error('Gagal memuat daftar desa/kelurahan');
      setVillages([]);
    } finally {
      setLoadingVillages(false);
    }
  };

  // Handle province selection
  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvinceId(provinceId);
    const province = provinces.find(p => p.id === provinceId);
    if (province) {
      setFormData(prev => ({ ...prev, provinsi: province.name }));
      loadCities(provinceId);
      // Reset dependent fields
      setSelectedCityId('');
      setSelectedDistrictId('');
      setCities([]);
      setDistricts([]);
      setVillages([]);
      setFormData(prev => ({ ...prev, kota_kabupaten: '', kecamatan: '', desa_kelurahan: '' }));
    }
  };

  // Handle city selection
  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    const city = cities.find(c => c.id === cityId);
    if (city) {
      setFormData(prev => ({ ...prev, kota_kabupaten: city.name }));
      loadDistricts(cityId);
      // Reset dependent fields
      setSelectedDistrictId('');
      setDistricts([]);
      setVillages([]);
      setFormData(prev => ({ ...prev, kecamatan: '', desa_kelurahan: '' }));
    }
  };

  // Handle district selection
  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrictId(districtId);
    const district = districts.find(d => d.id === districtId);
    if (district) {
      setFormData(prev => ({ ...prev, kecamatan: district.name }));
      loadVillages(districtId);
      // Reset dependent field
      setFormData(prev => ({ ...prev, desa_kelurahan: '' }));
    }
  };

  // Handle village selection
  const handleVillageChange = (villageName: string) => {
    // Since SelectItem value is already village.name, we can use it directly
    setFormData(prev => ({ ...prev, desa_kelurahan: villageName }));
  };

  const handleCoordinatesChange = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  };

  const loadParks = async () => {
    try {
      setLoading(true);
      const response = await parksApi.list({ limit: 100 });
      console.log('📊 Parks loaded:', response.items);
      response.items?.forEach(park => {
        console.log(`  - Park "${park.name}" (ID: ${park.id}) - Status: ${park.status}`);
      });
      setParks(response.items || []);
    } catch (err) {
      console.error('Failed to load parks:', err);
      setParks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ParkFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from name
    if (field === 'name' && typeof value === 'string') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (submitStatus: 'draft' | 'in_review') => {
    // Validation
    if (!formData.name.trim()) {
      setError('Nama taman harus diisi');
      toast.error('Nama taman harus diisi');
      return;
    }

    console.log('Taman form submitting - status:', submitStatus);
    console.log('Taman form data:', formData);

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const parkData = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        sk_penetapan: formData.sk_penetapan,
        pengelola: formData.pengelola,
        area_ha: formData.area_ha,
        kondisi_fisik: formData.kondisi_fisik,
        nilai_penting: formData.nilai_penting,
        tipe_ekoregion: formData.tipe_ekoregion,
        description: formData.description,
        sejarah: formData.sejarah,
        visi: formData.visi,
        misi: formData.misi,
        nilai_dasar: formData.nilai_dasar,
        provinsi: formData.provinsi,
        kota_kabupaten: formData.kota_kabupaten,
        kecamatan: formData.kecamatan,
        desa_kelurahan: formData.desa_kelurahan,
        latitude: formData.latitude,    // ✅ Send coordinates to backend
        longitude: formData.longitude,  // ✅ Send coordinates to backend
        status: submitStatus, // Use status from button clicked
      };

      console.log('Taman data to submit:', parkData);

      // ✅ Check if we're editing existing draft or creating new
      if (draftPark) {
        // UPDATE existing draft park
        const result = await parksApi.update(draftPark.id, parkData);
        console.log('Taman update result:', result);
        
        // If user clicked "Submit untuk Review", call submit endpoint
        if (submitStatus === 'in_review') {
          await handleSubmitPark(draftPark.id);
          toast.success('Taman berhasil diperbarui dan diajukan untuk review!');
          setSuccess('Taman berhasil diajukan untuk review!');
        } else {
          toast.success('Draft taman berhasil diperbarui!');
          setSuccess('Draft taman berhasil diperbarui!');
        }
      } else {
        // CREATE new draft park - always as draft first
        const result = await parksApi.create({ ...parkData, status: 'draft' });
        console.log('Taman create result:', result);
        
        // If user clicked "Submit untuk Review", call submit endpoint
        if (submitStatus === 'in_review' && result.id) {
          await handleSubmitPark(parseInt(result.id));
          toast.success('Taman berhasil dibuat dan diajukan untuk review!');
          setSuccess('Taman berhasil diajukan untuk review!');
        } else {
          toast.success('Taman berhasil disimpan sebagai draft!');
          setSuccess('Taman berhasil dibuat! Status: Draft');
        }
      }

      // Reload parks list to reflect changes
      await loadParks();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Gagal submit taman';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Taman submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitPark = async (parkId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
        window.location.href = '/login';
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/parks/${parkId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Gagal submit park');
      }

      toast.success('Park berhasil diajukan untuk review!');
      loadParks(); // Reload to show updated status
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal submit park';
      toast.error(errorMessage);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      draft: { 
        label: 'Draft', 
        variant: 'secondary', 
        icon: <FileText className="w-3 h-3 mr-1" /> 
      },
      in_review: { 
        label: 'Under Review', 
        variant: 'default', 
        icon: <Clock className="w-3 h-3 mr-1" /> 
      },
      approved: { 
        label: 'Approved', 
        variant: 'default', 
        icon: <CheckCircle className="w-3 h-3 mr-1" /> 
      },
      rejected: { 
        label: 'Rejected', 
        variant: 'destructive', 
        icon: <XCircle className="w-3 h-3 mr-1" /> 
      },
      published: { 
        label: 'Published', 
        variant: 'default', 
        icon: <CheckCircle className="w-3 h-3 mr-1" /> 
      },
    };

    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <Badge variant={config.variant} className="flex items-center w-fit">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'text-gray-600',
      in_review: 'text-blue-600',
      approved: 'text-green-600',
      rejected: 'text-red-600',
      published: 'text-green-600',
    };
    return colors[status] || colors.draft;
  };

  // Find approved park
  const approvedPark = parks.find(p => p.status === 'approved');
  
  // Find park in review (waiting for approval) - should HIDE form
  const parkInReview = parks.find(p => p.status === 'in_review' || p.status === 'pending_approval');
  
  // ✅ State for full park details
  const [fullParkDetails, setFullParkDetails] = useState<Park | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // ✅ Memoize approved park ID to prevent unnecessary re-fetches
  const approvedParkId = useMemo(() => approvedPark?.id, [approvedPark?.id]);
  
  // ✅ Fetch full park details when approved park is found
  useEffect(() => {
    if (!approvedParkId || !approvedPark) {
      setFullParkDetails(null);
      return;
    }
    
    const fallbackPark = approvedPark; // Capture for use in catch block
    
    const fetchFullParkDetails = async () => {
      try {
        setLoadingDetails(true);
        const details = await parksApi.getById(approvedParkId);
        console.log('✅ Full park details loaded:', details);
        setFullParkDetails(details);
      } catch (error) {
        console.error('Failed to load full park details:', error);
        // Fallback to list data if detail fetch fails
        setFullParkDetails(fallbackPark);
      } finally {
        setLoadingDetails(false);
      }
    };
    
    fetchFullParkDetails();
  }, [approvedParkId, approvedPark]); // Depend on both ID and park object
  
  // ✅ Debug logging
  console.log('🔍 Conditional rendering check:', {
    totalParks: parks.length,
    draftPark: draftPark ? `"${draftPark.name}" (${draftPark.status})` : 'none',
    approvedPark: approvedPark ? `"${approvedPark.name}" (${approvedPark.status})` : 'none',
    parkInReview: parkInReview ? `"${parkInReview.name}" (${parkInReview.status})` : 'none',
    fullParkDetails: fullParkDetails ? 'loaded' : 'not loaded',
  });

  // Show loading state while checking for parks
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat data taman...</p>
        </div>
      </div>
    );
  }

  // If there's an approved park, show the details page
  if (approvedPark) {
    // Show loading while fetching full details
    if (loadingDetails || !fullParkDetails) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Memuat detail taman...</p>
          </div>
        </div>
      );
    }
    return <ApprovedParkDetails park={fullParkDetails} />;
  }

  // If user has park in review (waiting for super admin approval), show waiting status (HIDE form)
  if (parkInReview) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Taman & Zona</h1>
          <p className="text-muted-foreground mt-2">
            Taman Anda sedang dalam proses review
          </p>
        </div>

        {/* Park Status Card - Waiting for Approval */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Clock className="w-5 h-5" />
              Menunggu Persetujuan Super Admin
            </CardTitle>
            <CardDescription>
              Form pembuatan taman tidak tersedia saat taman Anda sedang dalam review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{parkInReview.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Submitted: {parkInReview.created_at 
                      ? new Date(parkInReview.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      : 'N/A'
                    }
                  </p>
                </div>
                <div className="text-right">
                  {getStatusBadge(parkInReview.status)}
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium mb-2 text-blue-800">ℹ️ Informasi:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Taman Anda sedang dalam proses review oleh Super Admin</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Anda tidak dapat membuat taman baru sampai proses review selesai</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Jika taman <strong>disetujui</strong>, Anda dapat mengelola data flora, fauna, dan kegiatan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Jika taman <strong>ditolak</strong>, Anda dapat membuat submission baru</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions List */}
        {parks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Taman yang Sudah Disubmit</CardTitle>
              <CardDescription>
                Daftar taman yang sudah Anda submit beserta status review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : parks.length === 0 ? (
                <div className="text-center py-8">
                  <TreePine className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Belum ada taman yang disubmit</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {parks.map((park) => (
                    <div key={park.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{park.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {park.created_at 
                              ? new Date(park.created_at).toLocaleDateString('id-ID')
                              : 'N/A'
                            }
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(park.status)}
                          {park.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSubmitPark(park.id)}
                              title="Kirim untuk Review"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Submit
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Taman & Zona</h1>
        <p className="text-muted-foreground mt-2">
          {draftPark 
            ? "Edit draft taman Anda, lalu submit untuk review oleh Super Admin"
            : parks.length === 0 
              ? "Buat taman kehati baru untuk memulai"
              : "Kelola taman kehati Anda"
          }
        </p>
      </div>

      {/* Form Card - Only show if no approved park exists */}
      {!approvedPark && (
        <Card data-tour="taman-form">
          <CardHeader data-tour="add-taman-button">
            <CardTitle className="flex items-center gap-2">
              {draftPark ? (
                <>
                  <FileText className="w-5 h-5" />
                  Edit Draft Taman
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Submit Taman Baru
                </>
              )}
            </CardTitle>
            <CardDescription>
              {draftPark 
                ? `Edit dan perbarui draft taman "${draftPark.name}" sebelum submit untuk review`
                : "Isi form di bawah untuk menambahkan taman kehati baru"
              }
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {/* Modern Wizard with Step Indicators */}
            <div className="w-full">
              {/* Step Indicators */}
              <div className="mb-8">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                  {[
                    { id: 'profil', label: 'Profil', icon: Building2 },
                    { id: 'lokasi', label: 'Lokasi & Koordinat', icon: MapPin },
                    { id: 'karakteristik', label: 'Karakteristik', icon: Leaf },
                    { id: 'deskripsi', label: 'Deskripsi', icon: FileText },
                    { id: 'visi-misi', label: 'Visi & Misi', icon: BookOpen }
                  ].map((step, index, array) => {
                    const StepIcon = step.icon;
                    const isActive = currentTab === step.id;
                    const isCompleted = ['profil', 'lokasi', 'karakteristik', 'deskripsi', 'visi-misi'].indexOf(currentTab) > index;
                    const stepNumber = index + 1;
                    
                    return (
                      <div key={step.id} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <button
                            onClick={() => setCurrentTab(step.id)}
                            className={`
                              w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 mb-2
                              ${isActive 
                                ? 'bg-blue-600 text-white shadow-lg scale-110 ring-4 ring-blue-200' 
                                : isCompleted 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                              }
                            `}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-6 h-6" />
                            ) : (
                              <StepIcon className="w-6 h-6" />
                            )}
                          </button>
                          <span className={`text-xs font-medium text-center ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                            {step.label}
                          </span>
                        </div>
                        {index < array.length - 1 && (
                          <div className={`h-1 flex-1 mx-2 rounded transition-all duration-300 ${
                            isCompleted ? 'bg-green-500' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step Content with Animation */}
              <div className="relative min-h-[500px]">
                {/* Step 1: Profil */}
                {currentTab === 'profil' && (
                  <div className="animate-in fade-in slide-in-from-right-5 duration-300">
                {/* Section 1: Profil Taman */}
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                      <Building2 className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Profil Taman</h2>
                    <p className="text-gray-600 text-lg">Informasi dasar tentang taman kehati</p>
                  </div>

                  <Card className="shadow-lg border-t-4 border-t-blue-500">
                    <CardContent className="pt-8 pb-6">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama Resmi Kawasan */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">
                    Nama Resmi Kawasan Taman Kehati <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    data-tour="field-nama-taman"
                    placeholder="Contoh: Taman Kehati Cibinong"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">Nama resmi kawasan Taman Kehati</p>
                </div>

                {/* SK Penetapan */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="sk_penetapan">
                    SK Penetapan/Penunjukan
                  </Label>
                  <Input
                    id="sk_penetapan"
                    placeholder="Contoh: SK Bupati Bogor No. 123/2019"
                    value={formData.sk_penetapan}
                    onChange={(e) => handleInputChange('sk_penetapan', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">Nomor Surat Keputusan (SK) penetapan atau penunjukan</p>
                </div>

                {/* Instansi Pengelola */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="pengelola">
                    Instansi Pengelola
                  </Label>
                  <Input
                    id="pengelola"
                    placeholder="Contoh: DLH Kabupaten Bogor"
                    value={formData.pengelola}
                    onChange={(e) => handleInputChange('pengelola', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">Nama lembaga atau instansi yang mengelola taman</p>
                        </div>
                      </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Navigation */}
                  <div className="flex justify-end mt-8">
                    <Button size="lg" onClick={() => setCurrentTab('lokasi')} className="gap-2 px-8">
                      Selanjutnya: Lokasi <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                  </div>
                )}

                {/* Step 2: Lokasi */}
                {currentTab === 'lokasi' && (
                  <div className="animate-in fade-in slide-in-from-right-5 duration-300">
                {/* Section 2: Lokasi */}
                <div className="space-y-6" data-tour="section-lokasi">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                      <MapPin className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Lokasi</h2>
                    <p className="text-gray-600 text-lg">Lokasi administratif taman kehati</p>
                  </div>

                  <Card className="shadow-lg border-t-4 border-t-red-500">
                    <CardContent className="pt-8 pb-6">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Provinsi */}
                <div className="space-y-2">
                  <Label htmlFor="provinsi">
                    Provinsi <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedProvinceId}
                    onValueChange={handleProvinceChange}
                    disabled={loadingProvinces}
                  >
                    <SelectTrigger id="provinsi">
                      <SelectValue placeholder={loadingProvinces ? "Memuat..." : "Pilih Provinsi"} />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province.id} value={province.id}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Pilih provinsi tempat taman berada
                  </p>
                </div>

                {/* Kabupaten/Kota */}
                <div className="space-y-2">
                  <Label htmlFor="kota_kabupaten">
                    Kabupaten/Kota <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedCityId}
                    onValueChange={handleCityChange}
                    disabled={!selectedProvinceId || loadingCities}
                  >
                    <SelectTrigger id="kota_kabupaten">
                      <SelectValue 
                        placeholder={
                          !selectedProvinceId 
                            ? "Pilih provinsi terlebih dahulu" 
                            : loadingCities 
                            ? "Memuat..." 
                            : "Pilih Kabupaten/Kota"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Kecamatan */}
                <div className="space-y-2">
                  <Label htmlFor="kecamatan">
                    Kecamatan <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedDistrictId}
                    onValueChange={handleDistrictChange}
                    disabled={!selectedCityId || loadingDistricts}
                  >
                    <SelectTrigger id="kecamatan">
                      <SelectValue 
                        placeholder={
                          !selectedCityId 
                            ? "Pilih kabupaten/kota terlebih dahulu" 
                            : loadingDistricts 
                            ? "Memuat..." 
                            : "Pilih Kecamatan"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Desa/Kelurahan */}
                <div className="space-y-2">
                  <Label htmlFor="desa_kelurahan">
                    Desa/Kelurahan <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.desa_kelurahan}
                    onValueChange={handleVillageChange}
                    disabled={!selectedDistrictId || loadingVillages}
                  >
                    <SelectTrigger id="desa_kelurahan">
                      <SelectValue 
                        placeholder={
                          !selectedDistrictId 
                            ? "Pilih kecamatan terlebih dahulu" 
                            : loadingVillages 
                            ? "Memuat..." 
                            : "Pilih Desa/Kelurahan"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {villages.map((village) => (
                        <SelectItem key={village.id} value={village.name}>
                          {village.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Navigation */}
                  <div className="flex justify-between mt-8">
                    <Button size="lg" variant="outline" onClick={() => setCurrentTab('profil')} className="gap-2 px-8">
                      <ChevronRight className="w-5 h-5 rotate-180" /> Kembali
                    </Button>
                    <Button size="lg" onClick={() => setCurrentTab('karakteristik')} className="gap-2 px-8">
                      Selanjutnya: Karakteristik <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Koordinat Geografis */}
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">🗺️ Koordinat Geografis</h3>
                    <p className="text-sm text-gray-600">
                      Pilih koordinat taman konservasi menggunakan peta interaktif
                    </p>
                  </div>
                  
                  <Card className="shadow-lg border-t-4 border-t-blue-500">
                    <CardContent className="pt-6 pb-6">
                      <InteractiveMapWrapper
                        latitude={formData.latitude}
                        longitude={formData.longitude}
                        onCoordinatesChange={handleCoordinatesChange}
                        height="400px"
                      />
                    </CardContent>
                  </Card>
                </div>
                  </div>
                )}

                {/* Step 3: Karakteristik */}
                {currentTab === 'karakteristik' && (
                  <div className="animate-in fade-in slide-in-from-right-5 duration-300">
                {/* Section 3: Karakteristik Kawasan */}
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                      <Leaf className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Karakteristik Kawasan</h2>
                    <p className="text-gray-600 text-lg">Deskripsi fisik dan ekologi kawasan</p>
                  </div>

                  <Card className="shadow-lg border-t-4 border-t-green-500">
                    <CardContent className="pt-8 pb-6">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Luas Kawasan */}
                <div className="space-y-2">
                  <Label htmlFor="area">
                    Luas Kawasan (ha)
                  </Label>
                  <Input
                    id="area"
                    type="number"
                    step="0.01"
                    placeholder="Contoh: 45.3"
                    value={formData.area_ha || ''}
                    onChange={(e) => handleInputChange('area_ha', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                  <p className="text-sm text-muted-foreground">Luas wilayah taman dalam hektar</p>
                </div>

                {/* Tipe Ekoregion */}
                <div className="space-y-2">
                  <Label htmlFor="tipe_ekoregion">
                    Tipe Ekoregion
                  </Label>
                  <Select
                    value={formData.tipe_ekoregion}
                    onValueChange={(value) => handleInputChange('tipe_ekoregion', value)}
                  >
                    <SelectTrigger id="tipe_ekoregion">
                      <SelectValue placeholder="Pilih tipe ekoregion" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[400px]">
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">DARAT (Terrestrial)</div>
                      <SelectItem value="Hutan Hujan Dataran Rendah">Hutan Hujan Dataran Rendah</SelectItem>
                      <SelectItem value="Hutan Hujan Pegunungan">Hutan Hujan Pegunungan</SelectItem>
                      <SelectItem value="Hutan Gambut">Hutan Gambut</SelectItem>
                      <SelectItem value="Hutan Mangrove">Hutan Mangrove</SelectItem>
                      <SelectItem value="Hutan Musim">Hutan Musim</SelectItem>
                      <SelectItem value="Savana">Savana</SelectItem>
                      <SelectItem value="Karst">Karst</SelectItem>
                      
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 mt-2">AIR TAWAR (Freshwater)</div>
                      <SelectItem value="Sungai Kapuas">Sungai Kapuas</SelectItem>
                      <SelectItem value="Sungai Mahakam">Sungai Mahakam</SelectItem>
                      <SelectItem value="Sungai Barito">Sungai Barito</SelectItem>
                      <SelectItem value="Sungai Musi">Sungai Musi</SelectItem>
                      <SelectItem value="Sungai Batanghari">Sungai Batanghari</SelectItem>
                      <SelectItem value="Danau Toba">Danau Toba</SelectItem>
                      <SelectItem value="Danau Poso">Danau Poso</SelectItem>
                      <SelectItem value="Danau Sentani">Danau Sentani</SelectItem>
                      <SelectItem value="Sistem Sungai Sumatera">Sistem Sungai Sumatera</SelectItem>
                      <SelectItem value="Sistem Sungai Jawa">Sistem Sungai Jawa</SelectItem>
                      <SelectItem value="Sistem Sungai Kalimantan">Sistem Sungai Kalimantan</SelectItem>
                      <SelectItem value="Sistem Sungai Sulawesi">Sistem Sungai Sulawesi</SelectItem>
                      <SelectItem value="Sistem Sungai Papua">Sistem Sungai Papua</SelectItem>
                      
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 mt-2">LAUT (Marine)</div>
                      <SelectItem value="Papua">Papua</SelectItem>
                      <SelectItem value="Laut Banda">Laut Banda</SelectItem>
                      <SelectItem value="Nusa Tenggara">Nusa Tenggara</SelectItem>
                      <SelectItem value="Laut Sulawesi/Selat Makassar">Laut Sulawesi/Selat Makassar</SelectItem>
                      <SelectItem value="Halmahera">Halmahera</SelectItem>
                      <SelectItem value="Palawan/Borneo Utara">Palawan/Borneo Utara</SelectItem>
                      <SelectItem value="Sumatera Bagian Barat">Sumatera Bagian Barat</SelectItem>
                      <SelectItem value="Timur Laut Sulawesi/Teluk Tomini">Timur Laut Sulawesi/Teluk Tomini</SelectItem>
                      <SelectItem value="Dangkalan Sunda/Laut Jawa">Dangkalan Sunda/Laut Jawa</SelectItem>
                      <SelectItem value="Laut Arafura">Laut Arafura</SelectItem>
                      <SelectItem value="Jawa Bagian Selatan">Jawa Bagian Selatan</SelectItem>
                      <SelectItem value="Selat Malaka">Selat Malaka</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">Pilih kategori ekoregion sesuai karakteristik kawasan (darat, air tawar, atau laut)</p>
                </div>

                {/* Kondisi Fisik Kawasan */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="kondisi_fisik">
                    Kondisi Fisik Kawasan
                  </Label>
                  <Textarea
                    id="kondisi_fisik"
                    placeholder="Contoh: Hutan kota dengan vegetasi campuran"
                    value={formData.kondisi_fisik}
                    onChange={(e) => handleInputChange('kondisi_fisik', e.target.value)}
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">Kondisi umum (misal: hutan dataran rendah, rawa, pantai, dll)</p>
                </div>

                {/* Nilai Penting Kawasan */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nilai_penting">
                    Nilai Penting Kawasan
                  </Label>
                  <Textarea
                    id="nilai_penting"
                    placeholder="Contoh: Habitat spesies endemik Jabodetabek"
                    value={formData.nilai_penting}
                    onChange={(e) => handleInputChange('nilai_penting', e.target.value)}
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">Nilai penting ekologi atau keanekaragaman hayati kawasan</p>
                </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Navigation */}
                  <div className="flex justify-between mt-8">
                    <Button size="lg" variant="outline" onClick={() => setCurrentTab('lokasi')} className="gap-2 px-8">
                      <ChevronRight className="w-5 h-5 rotate-180" /> Kembali
                    </Button>
                    <Button size="lg" onClick={() => setCurrentTab('deskripsi')} className="gap-2 px-8">
                      Selanjutnya: Deskripsi <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                  </div>
                )}

                {/* Step 4: Deskripsi */}
                {currentTab === 'deskripsi' && (
                  <div className="animate-in fade-in slide-in-from-right-5 duration-300">
                {/* Section 4: Deskripsi Umum */}
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                      <FileText className="w-8 h-8 text-purple-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Deskripsi Umum</h2>
                    <p className="text-gray-600 text-lg">Gambaran menyeluruh tentang taman</p>
                  </div>

                  <Card className="shadow-lg border-t-4 border-t-purple-500">
                    <CardContent className="pt-8 pb-6">
                      <div className="space-y-6">
                        <div className="space-y-2">
                <Label htmlFor="description">Deskripsi Taman</Label>
                <Textarea
                  id="description"
                  data-tour="field-deskripsi"
                  placeholder="Deskripsi singkat tentang taman kehati..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Navigation */}
                  <div className="flex justify-between mt-8">
                    <Button size="lg" variant="outline" onClick={() => setCurrentTab('karakteristik')} className="gap-2 px-8">
                      <ChevronRight className="w-5 h-5 rotate-180" /> Kembali
                    </Button>
                    <Button size="lg" onClick={() => setCurrentTab('visi-misi')} className="gap-2 px-8">
                      Selanjutnya: Visi & Misi <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                  </div>
                )}

                {/* Step 5: Visi & Misi */}
                {currentTab === 'visi-misi' && (
                  <div className="animate-in fade-in slide-in-from-right-5 duration-300">
                {/* Section 5: Visi, Misi & Nilai */}
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
                      <Target className="w-8 h-8 text-orange-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Visi, Misi & Nilai</h2>
                    <p className="text-gray-600 text-lg">Visi, misi, dan nilai-nilai pengelolaan taman</p>
                  </div>

                  <Card className="shadow-lg border-t-4 border-t-orange-500">
                    <CardContent className="pt-8 pb-6">
                      <div className="space-y-6">
                {/* Sejarah Taman */}
                <div className="space-y-2">
                  <Label htmlFor="sejarah">
                    📖 Sejarah Taman
                  </Label>
                  <Textarea
                    id="sejarah"
                    placeholder="Ceritakan sejarah pembentukan atau latar belakang taman kehati ini..."
                    value={formData.sejarah}
                    onChange={(e) => handleInputChange('sejarah', e.target.value)}
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">
                    Riwayat singkat tentang bagaimana taman ini terbentuk
                  </p>
                </div>

                {/* Visi */}
                <div className="space-y-2">
                  <Label htmlFor="visi">
                    🎯 Visi
                  </Label>
                  <Textarea
                    id="visi"
                    placeholder="Contoh: Menjadi kawasan konservasi keanekaragaman hayati yang lestari dan berkelanjutan..."
                    value={formData.visi}
                    onChange={(e) => handleInputChange('visi', e.target.value)}
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    Visi atau cita-cita jangka panjang pengelolaan taman
                  </p>
                </div>

                {/* Misi */}
                <div className="space-y-2">
                  <Label htmlFor="misi">
                    📋 Misi
                  </Label>
                  <Textarea
                    id="misi"
                    placeholder="Contoh: 1) Melindungi habitat flora dan fauna endemik&#10;2) Meningkatkan kesadaran masyarakat tentang konservasi&#10;3) Mengembangkan ekowisata berkelanjutan"
                    value={formData.misi}
                    onChange={(e) => handleInputChange('misi', e.target.value)}
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">
                    Langkah-langkah atau program untuk mencapai visi
                  </p>
                </div>

                {/* Nilai Dasar */}
                <div className="space-y-2">
                  <Label htmlFor="nilai_dasar">
                    ⭐ Nilai Dasar
                  </Label>
                  <Textarea
                    id="nilai_dasar"
                    placeholder="Contoh: Konservasi, Keberlanjutan, Partisipasi Masyarakat, Pendidikan Lingkungan..."
                    value={formData.nilai_dasar}
                    onChange={(e) => handleInputChange('nilai_dasar', e.target.value)}
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    Nilai-nilai atau prinsip yang dipegang dalam pengelolaan taman
                  </p>
                </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Navigation & Submit */}
                  <div className="space-y-4 mt-8">
                    <div className="flex justify-between">
                      <Button size="lg" variant="outline" onClick={() => setCurrentTab('deskripsi')} className="gap-2 px-8">
                        <ChevronRight className="w-5 h-5 rotate-180" /> Kembali
                      </Button>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border-2 border-green-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Siap untuk Submit?</h3>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button 
                          size="lg"
                          type="button"
                          variant="secondary"
                          disabled={submitting}
                          onClick={() => handleSubmit('draft')}
                          className="gap-2 px-8"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Menyimpan...
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5" />
                              Simpan sebagai Draft
                            </>
                          )}
                        </Button>
                        <Button 
                          size="lg"
                          type="button"
                          disabled={submitting}
                          onClick={() => handleSubmit('in_review')}
                          data-tour="submit-taman-button"
                          className="gap-2 px-8 bg-green-600 hover:bg-green-700"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Mengirim...
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5" />
                              Submit untuk Review
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                  </div>
                )}

              </div>
            </div>

          </form>
        </CardContent>
      </Card>
      )}

      {/* Submissions List - Only show if there are parks */}
      {parks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Taman yang Sudah Disubmit</CardTitle>
            <CardDescription>
              Daftar taman yang sudah Anda submit beserta status review
            </CardDescription>
          </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : parks.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Belum ada taman yang disubmit. Submit taman pertama Anda di atas!
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Taman</TableHead>
                    <TableHead>Wilayah</TableHead>
                    <TableHead>Luas (ha)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Submit</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parks.map((park) => (
                    <TableRow key={park.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {park.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        Indonesia
                      </TableCell>
                      <TableCell>
                        {park.area_ha ? `${park.area_ha} ha` : '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(park.status)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {park.created_at 
                          ? new Date(park.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        {park.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSubmitPark(park.id)}
                            title="Kirim untuk Review"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Submit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary Stats */}
          {parks.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">{parks.length}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {parks.filter(p => p.status === 'draft').length}
                </div>
                <div className="text-sm text-muted-foreground">Draft</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {parks.filter(p => p.status === 'in_review').length}
                </div>
                <div className="text-sm text-muted-foreground">Under Review</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {parks.filter(p => p.status === 'approved' || p.status === 'published').length}
                </div>
                <div className="text-sm text-muted-foreground">Approved</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  );
}

