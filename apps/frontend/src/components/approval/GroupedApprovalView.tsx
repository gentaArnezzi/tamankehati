'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { approvalsApi, floraApi, faunaApi, activitiesApi, ParkGroup, parksApprovalApi, Park } from '../../lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import {
  CheckCircle,
  Leaf,
  Bird,
  Calendar,
  TreePine,
  ChevronDown,
  ChevronUp,
  Loader2,
  Eye,
  MapPin,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { Alert, AlertDescription } from '../ui/alert';

export function GroupedApprovalView() {
  const router = useRouter();
  const [groups, setGroups] = useState<ParkGroup[]>([]);
  const [pendingParks, setPendingParks] = useState<Park[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [expandedParkDetails, setExpandedParkDetails] = useState<Set<number>>(new Set());
  const [processingGroups, setProcessingGroups] = useState<Set<number>>(new Set());
  const [processingParks, setProcessingParks] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadGroupedData();
  }, []);

  const loadGroupedData = async () => {
    try {
      setLoading(true);
      const [groupData, parkData] = await Promise.all([
        approvalsApi.listGrouped(),
        parksApprovalApi.listPending().catch(() => []), // Gracefully handle errors
      ]);
      
      setGroups(groupData.groups);
      setPendingParks(parkData);
      
      // Auto-expand first group if exists
      if (groupData.groups.length > 0) {
        setExpandedGroups(new Set([groupData.groups[0].parkId]));
      }
    } catch (error) {
      console.error('Failed to load grouped approvals', error);
      toast.error('Gagal memuat data persetujuan');
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (parkId: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(parkId)) {
      newExpanded.delete(parkId);
    } else {
      newExpanded.add(parkId);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleParkDetail = (parkId: number) => {
    const newExpanded = new Set(expandedParkDetails);
    if (newExpanded.has(parkId)) {
      newExpanded.delete(parkId);
    } else {
      newExpanded.add(parkId);
    }
    setExpandedParkDetails(newExpanded);
  };

  const handleBulkApprove = async (parkId: number, parkName: string) => {
    if (!confirm(`Setujui SEMUA data (${getTotalCount(parkId)} item) dari taman "${parkName}"?\n\nTindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      setProcessingGroups(new Set([...processingGroups, parkId]));
      
      const result = await approvalsApi.bulkApprove(parkId);
      
      toast.success(
        `✅ Berhasil menyetujui ${result.approvedCount} item dari taman "${parkName}"`,
        {
          description: `Flora: ${result.details.flora || 0}, Fauna: ${result.details.fauna || 0}, Kegiatan: ${result.details.kegiatan || 0}`,
        }
      );
      
      // Reload data
      await loadGroupedData();
    } catch (error) {
      console.error('Failed to bulk approve', error);
      toast.error('Gagal melakukan bulk approval');
    } finally {
      setProcessingGroups((prev) => {
        const newSet = new Set(prev);
        newSet.delete(parkId);
        return newSet;
      });
    }
  };

  const handleSingleApprove = async (
    parkId: number,
    entityType: string,
    entityId: number,
    title: string
  ) => {
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
      await loadGroupedData();
    } catch (error) {
      console.error('Failed to approve item', error);
      toast.error('Gagal menyetujui item');
    }
  };

  const handleApprovePark = async (parkId: number, parkName: string) => {
    if (!confirm(`Setujui taman "${parkName}"?\n\nTaman akan menjadi aktif dan dapat dikelola oleh regional admin.`)) {
      return;
    }

    try {
      setProcessingParks(new Set([...processingParks, parkId]));
      await parksApprovalApi.approve(parkId);
      toast.success(`✅ Taman "${parkName}" berhasil disetujui`);
      await loadGroupedData();
    } catch (error) {
      console.error('Failed to approve park', error);
      toast.error('Gagal menyetujui taman');
    } finally {
      setProcessingParks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(parkId);
        return newSet;
      });
    }
  };

  const handleRejectPark = async (parkId: number, parkName: string) => {
    const reason = prompt(`Alasan menolak taman "${parkName}":`);
    if (!reason) return;

    try {
      setProcessingParks(new Set([...processingParks, parkId]));
      await parksApprovalApi.reject(parkId, reason);
      toast.success(`❌ Taman "${parkName}" ditolak`);
      await loadGroupedData();
    } catch (error) {
      console.error('Failed to reject park', error);
      toast.error('Gagal menolak taman');
    } finally {
      setProcessingParks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(parkId);
        return newSet;
      });
    }
  };

  const handleViewParkDetail = (parkId: number) => {
    router.push(`/dashboard/approval/park/${parkId}`);
  };

  const getTotalCount = (parkId: number) => {
    const group = groups.find(g => g.parkId === parkId);
    return group?.totalItems || 0;
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'flora':
        return <Leaf className="h-4 w-4 text-green-600" />;
      case 'fauna':
        return <Bird className="h-4 w-4 text-blue-600" />;
      case 'kegiatan':
        return <Calendar className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getEntityLabel = (type: string) => {
    const labels: Record<string, string> = {
      flora: 'Flora',
      fauna: 'Fauna',
      kegiatan: 'Kegiatan',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#233c2b] mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (groups.length === 0 && pendingParks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <TreePine className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600 mb-2">
            Tidak ada data yang menunggu persetujuan
          </p>
          <p className="text-sm text-muted-foreground">
            Semua data sudah diproses atau belum ada submission baru
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals
  const totalPendingParks = pendingParks.length;
  const totalPendingFlora = groups.reduce((sum, g) => sum + g.floraCount, 0);
  const totalPendingFauna = groups.reduce((sum, g) => sum + g.faunaCount, 0);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Taman</div>
                <div className="text-3xl font-bold text-[#356447]">{totalPendingParks}</div>
                <div className="text-xs text-muted-foreground mt-1">Menunggu persetujuan</div>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Flora</div>
                <div className="text-3xl font-bold text-[#356447]">{totalPendingFlora}</div>
                <div className="text-xs text-muted-foreground mt-1">Menunggu persetujuan</div>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Fauna</div>
                <div className="text-3xl font-bold text-[#356447]">{totalPendingFauna}</div>
                <div className="text-xs text-muted-foreground mt-1">Menunggu persetujuan</div>
              </div>
              <div className="p-3 rounded-lg bg-sky-50">
                <Bird className="h-8 w-8 text-sky-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Parks - Taman yang menunggu approval */}
      {pendingParks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-[#356447]" />
            <h3 className="text-lg font-semibold">Taman Menunggu Persetujuan</h3>
            <Badge variant="secondary">{pendingParks.length}</Badge>
          </div>
          
          {pendingParks.map((park) => {
            const isProcessing = processingParks.has(park.id);
            const isExpanded = expandedParkDetails.has(park.id);
            
            return (
              <Card key={park.id} className="overflow-hidden border-2 border-blue-200 bg-blue-50/30">
                <Collapsible open={isExpanded} onOpenChange={() => toggleParkDetail(park.id)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200">
                          <MapPin className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-1">{park.name}</CardTitle>
                          <CardDescription className="flex items-center gap-3 flex-wrap">
                            <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                              Taman Baru
                            </Badge>
                            {park.provinsi && (
                              <span className="text-xs text-gray-600">
                                📍 {park.provinsi}
                                {park.kota_kabupaten && `, ${park.kota_kabupaten}`}
                              </span>
                            )}
                            {park.area_ha && (
                              <span className="text-xs text-gray-600">
                                📐 {park.area_ha} ha
                              </span>
                            )}
                            {park.submitted_at && (
                              <span className="text-xs text-gray-500">
                                📅 {new Date(park.submitted_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-300 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {isExpanded ? 'Sembunyikan' : 'Lihat Detail'}
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 ml-2" />
                            ) : (
                              <ChevronDown className="h-4 w-4 ml-2" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <Button
                          onClick={() => handleApprovePark(park.id, park.name)}
                          disabled={isProcessing}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Setujui
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleRejectPark(park.id, park.name)}
                          disabled={isProcessing}
                          size="sm"
                          variant="destructive"
                        >
                          Tolak
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4 bg-white rounded-lg p-4 border border-blue-100">
                        {/* Basic Info */}
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">Informasi Dasar</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {park.pengelola && (
                              <div>
                                <span className="text-gray-500">Pengelola:</span>
                                <p className="font-medium text-gray-900">{park.pengelola}</p>
                              </div>
                            )}
                            {park.sk_penetapan && (
                              <div>
                                <span className="text-gray-500">SK Penetapan:</span>
                                <p className="font-medium text-gray-900">{park.sk_penetapan}</p>
                              </div>
                            )}
                            {park.tipe_ekoregion && (
                              <div>
                                <span className="text-gray-500">Tipe Ekoregion:</span>
                                <p className="font-medium text-gray-900">{park.tipe_ekoregion}</p>
                              </div>
                            )}
                            {park.kondisi_fisik && (
                              <div>
                                <span className="text-gray-500">Kondisi Fisik:</span>
                                <p className="font-medium text-gray-900">{park.kondisi_fisik}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Location */}
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">Lokasi</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {park.provinsi && (
                              <div>
                                <span className="text-gray-500">Provinsi:</span>
                                <p className="font-medium text-gray-900">{park.provinsi}</p>
                              </div>
                            )}
                            {park.kota_kabupaten && (
                              <div>
                                <span className="text-gray-500">Kota/Kabupaten:</span>
                                <p className="font-medium text-gray-900">{park.kota_kabupaten}</p>
                              </div>
                            )}
                            {park.kecamatan && (
                              <div>
                                <span className="text-gray-500">Kecamatan:</span>
                                <p className="font-medium text-gray-900">{park.kecamatan}</p>
                              </div>
                            )}
                            {park.desa_kelurahan && (
                              <div>
                                <span className="text-gray-500">Desa/Kelurahan:</span>
                                <p className="font-medium text-gray-900">{park.desa_kelurahan}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        {park.description && (
                          <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Deskripsi</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{park.description}</p>
                          </div>
                        )}

                        {/* Sejarah */}
                        {park.sejarah && (
                          <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Sejarah</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{park.sejarah}</p>
                          </div>
                        )}

                        {/* Visi & Misi */}
                        {(park.visi || park.misi) && (
                          <div className="grid grid-cols-2 gap-4">
                            {park.visi && (
                              <div>
                                <h4 className="font-semibold text-sm text-gray-700 mb-2">Visi</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{park.visi}</p>
                              </div>
                            )}
                            {park.misi && (
                              <div>
                                <h4 className="font-semibold text-sm text-gray-700 mb-2">Misi</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{park.misi}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Nilai Penting & Nilai Dasar */}
                        {(park.nilai_penting || park.nilai_dasar) && (
                          <div className="grid grid-cols-2 gap-4">
                            {park.nilai_penting && (
                              <div>
                                <h4 className="font-semibold text-sm text-gray-700 mb-2">Nilai Penting</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{park.nilai_penting}</p>
                              </div>
                            )}
                            {park.nilai_dasar && (
                              <div>
                                <h4 className="font-semibold text-sm text-gray-700 mb-2">Nilai Dasar</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{park.nilai_dasar}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      {/* Grouped Items - Konten yang menunggu approval per taman */}
      {groups.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-2 mt-6">
            <TreePine className="h-5 w-5 text-[#356447]" />
            <h3 className="text-lg font-semibold">Konten Menunggu Persetujuan (per Taman)</h3>
          </div>
          <div className="space-y-3">
            {groups.map((group) => {
          const isExpanded = expandedGroups.has(group.parkId);
          const isProcessing = processingGroups.has(group.parkId);

          return (
            <Card key={group.parkId} className="overflow-hidden border-2">
              <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(group.parkId)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                          <TreePine className="h-6 w-6 text-[#356447]" />
                        </div>
                        <div>
                          <CardTitle className="text-xl mb-1">{group.parkName}</CardTitle>
                          <CardDescription className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                              {group.totalItems} Item Menunggu
                            </Badge>
                            {group.floraCount > 0 && (
                              <span className="text-xs text-gray-600">
                                🌿 {group.floraCount} Flora
                              </span>
                            )}
                            {group.faunaCount > 0 && (
                              <span className="text-xs text-gray-600">
                                🦋 {group.faunaCount} Fauna
                              </span>
                            )}
                            {group.kegiatanCount > 0 && (
                              <span className="text-xs text-gray-600">
                                📅 {group.kegiatanCount} Kegiatan
                              </span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewParkDetail(group.parkId);
                          }}
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 hover:border-blue-300"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat Detail
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBulkApprove(group.parkId, group.parkName);
                          }}
                          disabled={isProcessing}
                          className="bg-[#356447] hover:bg-[#2d5239] shadow-md hover:shadow-lg transition-all"
                          size="sm"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Memproses...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Setujui Semua ({group.totalItems})
                            </>
                          )}
                        </Button>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0 pb-6">
                    <div className="border-t pt-4">
                      {/* Summary by Type */}
                      <div className="mb-4 flex items-center gap-4 px-4">
                        {group.floraCount > 0 && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                            <Leaf className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">
                              {group.floraCount} Flora
                            </span>
                          </div>
                        )}
                        {group.faunaCount > 0 && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                            <Bird className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">
                              {group.faunaCount} Fauna
                            </span>
                          </div>
                        )}
                        {group.kegiatanCount > 0 && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-200">
                            <Calendar className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-700">
                              {group.kegiatanCount} Kegiatan
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Detailed Items List */}
                      <div className="space-y-3">
                        {group.items.map((item, idx) => (
                          <div
                            key={`${item.entityType}-${item.entityId}`}
                            className="mx-4 p-5 rounded-lg border-2 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg hover:border-[#356447] transition-all"
                          >
                            <div className="flex items-start justify-between gap-4">
                              {/* Left: Icon & Info */}
                              <div className="flex items-start gap-4 flex-1">
                                <div className="p-3 rounded-xl bg-white border-2 shadow-sm">
                                  {getEntityIcon(item.entityType)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  {/* Type Badge */}
                                  <Badge
                                    variant="outline"
                                    className="mb-2 bg-blue-50 text-blue-700 border-blue-200 font-medium"
                                  >
                                    {getEntityLabel(item.entityType)}
                                  </Badge>
                                  
                                  {/* Title */}
                                  <h4 className="text-base font-semibold text-gray-900 mb-2">
                                    {item.entityType === 'flora' || item.entityType === 'fauna' ? (
                                      <i>{item.title}</i>
                                    ) : (
                                      item.title
                                    )}
                                  </h4>
                                  
                                  {/* Metadata Grid */}
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <span className="font-medium text-gray-700">ID:</span>
                                      <span>#{item.entityId}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <span className="font-medium text-gray-700">Status:</span>
                                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs">
                                        {item.status === 'in_review' ? 'Menunggu Review' : item.status}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <span className="font-medium text-gray-700">Diajukan:</span>
                                      <span>
                                        {item.submittedAt 
                                          ? new Date(item.submittedAt).toLocaleDateString('id-ID', {
                                              day: 'numeric',
                                              month: 'short',
                                              year: 'numeric'
                                            })
                                          : '-'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <span className="font-medium text-gray-700">Update:</span>
                                      <span>
                                        {item.updatedAt 
                                          ? new Date(item.updatedAt).toLocaleDateString('id-ID', {
                                              day: 'numeric',
                                              month: 'short',
                                              year: 'numeric'
                                            })
                                          : '-'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Right: Action Button */}
                              <div className="flex flex-col gap-2">
                                <Button
                                  onClick={() =>
                                    handleSingleApprove(
                                      group.parkId,
                                      item.entityType,
                                      item.entityId,
                                      item.title
                                    )
                                  }
                                  className="bg-[#356447] hover:bg-[#2d5239] shadow-md hover:shadow-lg transition-all"
                                  size="sm"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Setujui
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
          </div>
          
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800 text-sm">
              💡 <strong>Tips:</strong> Klik "Lihat Detail" untuk membuka halaman review lengkap semua data dari taman. 
              Gunakan "Setujui Semua" untuk approve semua data dari taman sekaligus.
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
}

