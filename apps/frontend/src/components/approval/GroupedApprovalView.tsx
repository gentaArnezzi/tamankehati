'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { approvalsApi, floraApi, faunaApi, activitiesApi, ParkGroup } from '../../lib/api-client';
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
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [processingGroups, setProcessingGroups] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadGroupedData();
  }, []);

  const loadGroupedData = async () => {
    try {
      setLoading(true);
      const data = await approvalsApi.listGrouped();
      setGroups(data.groups);
      
      // Auto-expand first group if exists
      if (data.groups.length > 0) {
        setExpandedGroups(new Set([data.groups[0].parkId]));
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

  if (groups.length === 0) {
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

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Total Taman</div>
            <div className="text-3xl font-bold text-[#356447]">{groups.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Total Item</div>
            <div className="text-3xl font-bold text-[#356447]">
              {groups.reduce((sum, g) => sum + g.totalItems, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Taman Terbanyak</div>
            <div className="text-lg font-semibold text-gray-900 truncate">
              {groups[0]?.parkName || '-'}
            </div>
            <div className="text-sm text-muted-foreground">
              {groups[0]?.totalItems || 0} item
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grouped Items */}
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
    </div>
  );
}

