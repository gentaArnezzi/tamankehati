'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { parksApi, approvalsApi, floraApi, faunaApi, activitiesApi } from '../../../../../lib/api-client';
import { toast } from 'sonner';
import {
  CheckCircle,
  Leaf,
  Bird,
  Calendar,
  TreePine,
  ArrowLeft,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { CollapsibleApprovalItem } from '../../../../../components/approval/CollapsibleApprovalItem';

export default function ParkApprovalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const parkId = parseInt(params.parkId as string);

  const [park, setPark] = useState<any>(null);
  const [groupData, setGroupData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [detailsCache, setDetailsCache] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<'flora' | 'fauna' | 'kegiatan'>('flora');
  const [showParkInfo, setShowParkInfo] = useState(false);

  useEffect(() => {
    loadParkDetail();
  }, [parkId]);

  const loadParkDetail = async () => {
    try {
      setLoading(true);
      
      // Get park details
      const parkDetail = await parksApi.getById(parkId);
      setPark(parkDetail);
      
      // Get grouped approvals
      const grouped = await approvalsApi.listGrouped();
      const parkGroup = grouped.groups.find(g => g.parkId === parkId);
      setGroupData(parkGroup);
    } catch (error) {
      console.error('Failed to load park detail', error);
      toast.error('Gagal memuat detail taman');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (!groupData) return;
    
    if (!confirm(`Setujui SEMUA data (${groupData.totalItems} item) dari taman "${park?.name}"?\n\nTindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      setApproving(true);
      
      const result = await approvalsApi.bulkApprove(parkId);
      
      toast.success(
        `✅ Berhasil menyetujui ${result.approvedCount} item`,
        {
          description: `Flora: ${result.details.flora || 0}, Fauna: ${result.details.fauna || 0}, Kegiatan: ${result.details.kegiatan || 0}`,
        }
      );
      
      // Navigate back to approval page
      router.push('/dashboard/approval');
    } catch (error) {
      console.error('Failed to bulk approve', error);
      toast.error('Gagal melakukan bulk approval');
    } finally {
      setApproving(false);
    }
  };

  const handleSingleApprove = async (entityType: string, entityId: number, title: string) => {
    try {
      switch (entityType) {
        case 'flora':
          await floraApi.approve(entityId);
          break;
        case 'fauna':
          await faunaApi.approve(entityId);
          break;
        case 'kegiatan':
          await activitiesApi.approve(entityId);
          break;
      }
      
      toast.success(`Berhasil menyetujui: ${title}`);
      await loadParkDetail();
    } catch (error) {
      console.error('Failed to approve item', error);
      toast.error('Gagal menyetujui item');
    }
  };

  const handleSingleReject = async (entityType: string, entityId: number, title: string) => {
    const reason = prompt(`Alasan menolak "${title}":`);
    if (!reason || !reason.trim()) {
      toast.error('Alasan penolakan harus diisi');
      return;
    }

    try {
      switch (entityType) {
        case 'flora':
          await floraApi.reject(entityId, reason);
          break;
        case 'fauna':
          await faunaApi.reject(entityId, reason);
          break;
        case 'kegiatan':
          await activitiesApi.reject(entityId, reason);
          break;
      }
      
      toast.success(`Berhasil menolak: ${title}`);
      await loadParkDetail();
    } catch (error) {
      console.error('Failed to reject item', error);
      toast.error('Gagal menolak item');
    }
  };

  const toggleItemExpand = async (entityType: string, entityId: number) => {
    const key = `${entityType}-${entityId}`;
    const newExpanded = new Set(expandedItems);
    
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
      
      // Load detail if not in cache
      if (!detailsCache[key]) {
        try {
          let detail;
          let galleries = [];
          
          switch (entityType) {
            case 'flora':
              detail = await floraApi.getById(entityId);
              break;
            case 'fauna':
              detail = await faunaApi.getById(entityId);
              break;
            case 'kegiatan':
              detail = await activitiesApi.getById(entityId);
              break;
          }
          
          // Fetch galleries for flora/fauna
          if (entityType === 'flora' || entityType === 'fauna') {
            try {
              console.log(`Fetching galleries for ${entityType} #${entityId}...`);
              const galleriesResponse = await fetch(
                `http://localhost:8000/api/v1/galleries/entity/${entityType}/${entityId}`,
                {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                  },
                }
              );
              
              console.log('Galleries response status:', galleriesResponse.status);
              
              if (galleriesResponse.ok) {
                const galleriesData = await galleriesResponse.json();
                galleries = galleriesData.data || [];
                console.log('Galleries fetched:', galleries.length, 'items', galleries);
              } else {
                console.error('Galleries fetch failed:', await galleriesResponse.text());
              }
            } catch (galleriesError) {
              console.error('Failed to load galleries:', galleriesError);
            }
          }
          
          const detailWithGalleries = { ...detail, galleries };
          console.log('Setting detail cache with galleries:', detailWithGalleries);
          
          setDetailsCache(prev => ({
            ...prev,
            [key]: detailWithGalleries
          }));
        } catch (error) {
          console.error('Failed to load detail', error);
          toast.error('Gagal memuat detail');
        }
      }
    }
    
    setExpandedItems(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-900 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Memuat detail taman...</p>
        </div>
      </div>
    );
  }

  if (!park || !groupData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <TreePine className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-base font-medium text-gray-900 mb-1">
            Taman tidak ditemukan
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Tidak ada data pending untuk taman ini
          </p>
          <button
            onClick={() => router.push('/dashboard/approval')}
            className="text-sm px-4 py-2 border border-gray-300 hover:border-gray-900 rounded-md transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4 inline" />
            Kembali ke Persetujuan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={() => router.push('/dashboard/approval')}
            className="text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4 inline" />
            Kembali ke Persetujuan
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-medium text-gray-900 mb-1">
                {park.name}
              </h1>
              <p className="text-sm text-gray-500">
                Review data yang menunggu persetujuan dari taman ini
              </p>
            </div>
            
            <button
              onClick={handleBulkApprove}
              disabled={approving || groupData.totalItems === 0}
              className="text-sm px-6 py-2.5 bg-gray-900 text-white hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {approving ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin inline" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-1.5 h-4 w-4 inline" />
                  Setujui Semua ({groupData.totalItems})
                </>
              )}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6 mt-8">
            <div className="text-center py-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900 mb-1">{groupData.totalItems}</div>
              <div className="text-xs text-gray-500">Total Data</div>
            </div>
            <div className="text-center py-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900 mb-1">{groupData.floraCount}</div>
              <div className="text-xs text-gray-500">Flora</div>
            </div>
            <div className="text-center py-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900 mb-1">{groupData.faunaCount}</div>
              <div className="text-xs text-gray-500">Fauna</div>
            </div>
            <div className="text-center py-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900 mb-1">{groupData.kegiatanCount}</div>
              <div className="text-xs text-gray-500">Kegiatan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Park Information */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <button
          onClick={() => setShowParkInfo(!showParkInfo)}
          className="flex items-center justify-between w-full py-3 text-left hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-medium text-gray-900">Informasi Taman</span>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showParkInfo ? 'transform rotate-180' : ''}`} />
        </button>
        
        {showParkInfo && (
        <div className="mt-4 space-y-6 pb-6 border-b border-gray-200">
          {/* Profil Taman */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Profil Taman</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Nama Kawasan</p>
                <p className="text-sm font-medium">{park.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">SK Penetapan/Penunjukan</p>
                <p className="text-sm font-medium">{park.sk_penetapan || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Instansi Pengelola</p>
                <p className="text-sm font-medium">{park.pengelola || '-'}</p>
              </div>
            </div>
          </div>

          {/* Lokasi Administratif */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Lokasi Administratif</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Provinsi</p>
                <p className="text-sm font-medium">{park.provinsi || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Kota/Kabupaten</p>
                <p className="text-sm font-medium">{park.kota_kabupaten || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Kecamatan</p>
                <p className="text-sm font-medium">{park.kecamatan || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Desa/Kelurahan</p>
                <p className="text-sm font-medium">{park.desa_kelurahan || '-'}</p>
              </div>
            </div>
          </div>

          {/* Karakteristik Kawasan */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Karakteristik Kawasan</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Luas Kawasan (ha)</p>
                <p className="text-sm font-medium">{park.area_ha || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tipe Ekoregion</p>
                <p className="text-sm font-medium">{park.tipe_ekoregion || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Kondisi Fisik Kawasan</p>
                <p className="text-sm font-medium">{park.kondisi_fisik || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Nilai Penting Kawasan</p>
                <p className="text-sm font-medium">{park.nilai_penting || '-'}</p>
              </div>
            </div>
          </div>

          {/* Dokumen Taman */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Dokumen Taman</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Deskripsi Umum</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{park.description || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Sejarah Taman</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{park.sejarah || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Visi</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{park.visi || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Misi</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{park.misi || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Nilai-Nilai Dasar</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{park.nilai_dasar || '-'}</p>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Tabs for Items */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('flora')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'flora'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Leaf className="h-4 w-4 inline mr-1.5" />
              Flora ({groupData.floraCount})
            </button>
            <button
              onClick={() => setActiveTab('fauna')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'fauna'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Bird className="h-4 w-4 inline mr-1.5" />
              Fauna ({groupData.faunaCount})
            </button>
            <button
              onClick={() => setActiveTab('kegiatan')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'kegiatan'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Calendar className="h-4 w-4 inline mr-1.5" />
              Kegiatan ({groupData.kegiatanCount})
            </button>
          </div>
        </div>

        {/* Flora Tab Content */}
        {activeTab === 'flora' && (
          groupData.items.filter((i: any) => i.entityType === 'flora').length > 0 ? (
            <div className="space-y-2">
              {groupData.items
                .filter((i: any) => i.entityType === 'flora')
                .map((item: any) => {
                  const key = `flora-${item.entityId}`;
                  return (
                    <CollapsibleApprovalItem
                      key={item.entityId}
                      item={item}
                      entityType="flora"
                      detail={detailsCache[key]}
                      isExpanded={expandedItems.has(key)}
                      isLoadingDetail={expandedItems.has(key) && !detailsCache[key]}
                      onToggle={() => toggleItemExpand('flora', item.entityId)}
                      onApprove={() => handleSingleApprove('flora', item.entityId, item.title)}
                      onReject={() => handleSingleReject('flora', item.entityId, item.title)}
                    />
                  );
                })}
            </div>
          ) : (
            <div className="py-12 text-center border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-500">
                Tidak ada flora yang menunggu persetujuan
              </p>
            </div>
          )
        )}

        {/* Fauna Tab Content */}
        {activeTab === 'fauna' && (
          groupData.items.filter((i: any) => i.entityType === 'fauna').length > 0 ? (
            <div className="space-y-2">
              {groupData.items
                .filter((i: any) => i.entityType === 'fauna')
                .map((item: any) => {
                  const key = `fauna-${item.entityId}`;
                  return (
                    <CollapsibleApprovalItem
                      key={item.entityId}
                      item={item}
                      entityType="fauna"
                      detail={detailsCache[key]}
                      isExpanded={expandedItems.has(key)}
                      isLoadingDetail={expandedItems.has(key) && !detailsCache[key]}
                      onToggle={() => toggleItemExpand('fauna', item.entityId)}
                      onApprove={() => handleSingleApprove('fauna', item.entityId, item.title)}
                      onReject={() => handleSingleReject('fauna', item.entityId, item.title)}
                    />
                  );
                })}
            </div>
          ) : (
            <div className="py-12 text-center border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-500">
                Tidak ada fauna yang menunggu persetujuan
              </p>
            </div>
          )
        )}

        {/* Kegiatan Tab Content */}
        {activeTab === 'kegiatan' && (
          groupData.items.filter((i: any) => i.entityType === 'kegiatan').length > 0 ? (
            <div className="space-y-2">
              {groupData.items
                .filter((i: any) => i.entityType === 'kegiatan')
                .map((item: any) => {
                  const key = `kegiatan-${item.entityId}`;
                  return (
                    <CollapsibleApprovalItem
                      key={item.entityId}
                      item={item}
                      entityType="kegiatan"
                      detail={detailsCache[key]}
                      isExpanded={expandedItems.has(key)}
                      isLoadingDetail={expandedItems.has(key) && !detailsCache[key]}
                      onToggle={() => toggleItemExpand('kegiatan', item.entityId)}
                      onApprove={() => handleSingleApprove('kegiatan', item.entityId, item.title)}
                      onReject={() => handleSingleReject('kegiatan', item.entityId, item.title)}
                    />
                  );
                })}
            </div>
          ) : (
            <div className="py-12 text-center border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-500">
                Tidak ada kegiatan yang menunggu persetujuan
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
