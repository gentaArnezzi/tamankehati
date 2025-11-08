"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  approvalsApi,
  floraApi,
  faunaApi,
  activitiesApi,
  ParkGroup,
  parksApprovalApi,
  Park,
} from "../../lib/api-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { imageUrl } from "../../lib/api-url";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { toast } from "sonner";
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
  XCircle,
  Search,
  Filter,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Alert, AlertDescription } from "../ui/alert";
import { ActionDialog } from "../ui/action-dialog";

export function GroupedApprovalView() {
  const router = useRouter();
  const [groups, setGroups] = useState<ParkGroup[]>([]);
  const [pendingParks, setPendingParks] = useState<Park[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [expandedParkDetails, setExpandedParkDetails] = useState<Set<number>>(
    new Set(),
  );
  const [processingGroups, setProcessingGroups] = useState<Set<number>>(
    new Set(),
  );
  const [processingParks, setProcessingParks] = useState<Set<number>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "flora" | "fauna" | "kegiatan">("all");
  
  // Dialog states
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    parkId?: number;
    entityType?: string;
    entityId?: number;
    title?: string;
    isPark?: boolean;
  }>({ open: false });
  const [bulkApproveDialog, setBulkApproveDialog] = useState<{
    open: boolean;
    parkId?: number;
    parkName?: string;
    count?: number;
  }>({ open: false });
  const [parkApproveDialog, setParkApproveDialog] = useState<{
    open: boolean;
    parkId?: number;
    parkName?: string;
  }>({ open: false });

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
      console.error("Failed to load grouped approvals", error);
      toast.error("Gagal memuat data persetujuan");
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
    setBulkApproveDialog({
      open: true,
      parkId,
      parkName,
      count: getTotalCount(parkId),
    });
  };

  const executeBulkApprove = async () => {
    const { parkId, parkName } = bulkApproveDialog;
    if (!parkId || !parkName) return;

    try {
      setProcessingGroups(new Set(Array.from(processingGroups).concat([parkId])));

      const result = await approvalsApi.bulkApprove(parkId);

      toast.success(
        `✅ Berhasil menyetujui ${result.approvedCount} item dari taman "${parkName}"`,
        {
          description: `Flora: ${result.details.flora || 0}, Fauna: ${result.details.fauna || 0}, Kegiatan: ${result.details.kegiatan || 0}`,
        },
      );

      setBulkApproveDialog({ open: false });
      await loadGroupedData();
    } catch (error) {
      console.error("Failed to bulk approve", error);
      toast.error("Gagal melakukan bulk approval");
    } finally {
      setProcessingGroups((prev) => {
        const newSet = new Set(prev);
        newSet.delete(parkId!);
        return newSet;
      });
    }
  };

  const handleSingleApprove = async (
    parkId: number,
    entityType: string,
    entityId: number,
    title: string,
  ) => {
    try {
      switch (entityType) {
        case "flora":
          await floraApi.approve(entityId);
          break;
        case "fauna":
          await faunaApi.approve(entityId);
          break;
        case "kegiatan":
          await activitiesApi.approve(entityId);
          break;
      }

      toast.success(`Berhasil menyetujui: ${title}`);
      await loadGroupedData();
    } catch (error) {
      console.error("Failed to approve item", error);
      toast.error("Gagal menyetujui item");
    }
  };

  const handleSingleReject = async (
    parkId: number,
    entityType: string,
    entityId: number,
    title: string,
  ) => {
    setRejectDialog({
      open: true,
      parkId,
      entityType,
      entityId,
      title,
      isPark: false,
    });
  };

  const executeReject = async (reason?: string) => {
    const { parkId, entityType, entityId, title, isPark } = rejectDialog;
    if (!reason || !reason.trim()) {
      toast.error("Alasan penolakan harus diisi");
      return;
    }

    try {
      if (isPark && parkId) {
        await parksApprovalApi.reject(parkId, reason);
        toast.success(`❌ Taman "${title}" ditolak`);
      } else if (entityType && entityId) {
        switch (entityType) {
          case "flora":
            await floraApi.reject(entityId, reason);
            break;
          case "fauna":
            await faunaApi.reject(entityId, reason);
            break;
          case "kegiatan":
            await activitiesApi.reject(entityId, reason);
            break;
        }
        toast.success(`Berhasil menolak: ${title}`);
      }

      setRejectDialog({ open: false });
      await loadGroupedData();
    } catch (error) {
      console.error("Failed to reject item", error);
      toast.error("Gagal menolak item");
    }
  };

  const handleApprovePark = async (parkId: number, parkName: string) => {
    setParkApproveDialog({
      open: true,
      parkId,
      parkName,
    });
  };

  const executeParkApprove = async () => {
    const { parkId, parkName } = parkApproveDialog;
    if (!parkId || !parkName) return;

    try {
      setProcessingParks(new Set(Array.from(processingParks).concat([parkId])));
      await parksApprovalApi.approve(parkId);
      toast.success(`✅ Taman "${parkName}" berhasil disetujui`);
      setParkApproveDialog({ open: false });
      await loadGroupedData();
    } catch (error) {
      console.error("Failed to approve park", error);
      toast.error("Gagal menyetujui taman");
    } finally {
      setProcessingParks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(parkId);
        return newSet;
      });
    }
  };

  const handleRejectPark = async (parkId: number, parkName: string) => {
    setRejectDialog({
      open: true,
      parkId,
      title: parkName,
      isPark: true,
    });
  };

  const handleViewParkDetail = (parkId: number) => {
    router.push(`/dashboard/approval/park/${parkId}`);
  };

  const getTotalCount = (parkId: number) => {
    const group = groups.find((g) => g.parkId === parkId);
    return group?.totalItems || 0;
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "flora":
        return <Leaf className="h-4 w-4 text-green-600" />;
      case "fauna":
        return <Bird className="h-4 w-4 text-blue-600" />;
      case "kegiatan":
        return <Calendar className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getEntityLabel = (type: string) => {
    const labels: Record<string, string> = {
      flora: "Flora",
      fauna: "Fauna",
      kegiatan: "Kegiatan",
    };
    return labels[type] || type;
  };

  // Calculate totals
  const totalPendingParks = pendingParks.length;
  const totalPendingFlora = groups.reduce((sum, g) => sum + g.floraCount, 0);
  const totalPendingFauna = groups.reduce((sum, g) => sum + g.faunaCount, 0);
  const totalPendingKegiatan = groups.reduce((sum, g) => sum + g.kegiatanCount, 0);
  const totalPendingItems = groups.reduce((sum, g) => sum + g.totalItems, 0);

  // Filter and search logic
  const filteredGroups = groups.filter((group) => {
    // Filter by type
    if (filterType !== "all") {
      const hasType = group.items.some((item) => item.entityType === filterType);
      if (!hasType) return false;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesParkName = group.parkName.toLowerCase().includes(query);
      const matchesItems = group.items.some(
        (item) => item.title.toLowerCase().includes(query),
      );
      return matchesParkName || matchesItems;
    }

    return true;
  });

  const filteredParks = pendingParks.filter((park) => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        park.name.toLowerCase().includes(query) ||
        park.provinsi?.toLowerCase().includes(query) ||
        park.kota_kabupaten?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Stats Bar - Minimalis */}
      {totalPendingItems > 0 ? (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="text-gray-600">
                  <span className="font-medium text-gray-900">{totalPendingItems}</span> item menunggu
                </div>
                {totalPendingParks > 0 && (
                  <div className="text-gray-500">
                    {totalPendingParks} taman
                  </div>
                )}
                {totalPendingFlora > 0 && (
                  <div className="text-gray-500">
                    {totalPendingFlora} flora
                  </div>
                )}
                {totalPendingFauna > 0 && (
                  <div className="text-gray-500">
                    {totalPendingFauna} fauna
                  </div>
                )}
                {totalPendingKegiatan > 0 && (
                  <div className="text-gray-500">
                    {totalPendingKegiatan} kegiatan
                  </div>
                )}
              </div>

              {/* Search and Filter */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Cari taman atau item..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 w-64 text-sm border-gray-200 focus:border-gray-400"
                  />
                </div>
                <div className="flex items-center gap-1 border border-gray-200 rounded-md">
                  <Button
                    variant={filterType === "all" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilterType("all")}
                    className="h-8 px-3 text-xs"
                  >
                    Semua
                  </Button>
                  <Button
                    variant={filterType === "flora" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilterType("flora")}
                    className="h-8 px-3 text-xs"
                  >
                    <Leaf className="h-3 w-3 mr-1" />
                    Flora
                  </Button>
                  <Button
                    variant={filterType === "fauna" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilterType("fauna")}
                    className="h-8 px-3 text-xs"
                  >
                    <Bird className="h-3 w-3 mr-1" />
                    Fauna
                  </Button>
                  <Button
                    variant={filterType === "kegiatan" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilterType("kegiatan")}
                    className="h-8 px-3 text-xs"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Kegiatan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        {filteredGroups.length === 0 && filteredParks.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Tidak ada data yang menunggu persetujuan
            </h3>
            <p className="text-sm text-gray-500">
              Semua data sudah diproses
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pending Parks - Taman yang menunggu approval */}
            {filteredParks.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Taman ({filteredParks.length})
                </h2>
                <div className="space-y-3">
                  {filteredParks.map((park) => {
                    const isProcessing = processingParks.has(park.id);
                    const isExpanded = expandedParkDetails.has(park.id);

                    return (
                      <div
                        key={park.id}
                        className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors overflow-hidden"
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-base font-medium text-gray-900">
                                  {park.name}
                                </h3>
                                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                                  Baru
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                                {park.provinsi && (
                                  <span>{park.provinsi}{park.kota_kabupaten && `, ${park.kota_kabupaten}`}</span>
                                )}
                                {park.area_ha && (
                                  <span>{park.area_ha} ha</span>
                                )}
                                {park.submitted_at && (
                                  <span>
                                    {new Date(park.submitted_at).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleParkDetail(park.id)}
                                  className="h-7 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                >
                                  {isExpanded ? "Sembunyikan" : "Detail"}
                                  {isExpanded ? (
                                    <ChevronUp className="ml-1 h-3 w-3" />
                                  ) : (
                                    <ChevronDown className="ml-1 h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex-shrink-0 flex items-center gap-2">
                              <Button
                                onClick={() => handleApprovePark(park.id, park.name)}
                                disabled={isProcessing}
                                className="h-8 px-4 text-xs font-medium bg-gray-900 hover:bg-gray-800 text-white rounded-md"
                              >
                                {isProcessing ? (
                                  <>
                                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                                    Memproses
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-1.5 h-3 w-3" />
                                    Setujui
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={() => handleRejectPark(park.id, park.name)}
                                disabled={isProcessing}
                                variant="outline"
                                className="h-8 px-4 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-gray-300 rounded-md"
                              >
                                <XCircle className="mr-1.5 h-3 w-3" />
                                Tolak
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Collapsible Detail */}
                        <Collapsible
                          open={isExpanded}
                          onOpenChange={() => toggleParkDetail(park.id)}
                        >
                          <CollapsibleContent>
                            <div className="px-5 pb-5 pt-0">
                              <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                              {/* Park Image */}
                              {park.gambar_utama && (
                                <div>
                                  <img
                                    src={imageUrl(park.gambar_utama)}
                                    alt={park.name}
                                    className="w-full h-48 object-cover rounded-md"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                  />
                                </div>
                              )}

                              {/* Basic Info */}
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                {park.pengelola && (
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Pengelola</div>
                                    <div className="text-gray-900">{park.pengelola}</div>
                                  </div>
                                )}
                                {park.sk_penetapan && (
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">SK Penetapan</div>
                                    <div className="text-gray-900">{park.sk_penetapan}</div>
                                  </div>
                                )}
                                {park.tipe_ekoregion && (
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Tipe Ekoregion</div>
                                    <div className="text-gray-900">{park.tipe_ekoregion}</div>
                                  </div>
                                )}
                                {park.kondisi_fisik && (
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Kondisi Fisik</div>
                                    <div className="text-gray-900">{park.kondisi_fisik}</div>
                                  </div>
                                )}
                              </div>

                              {/* Location */}
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                {park.provinsi && (
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Provinsi</div>
                                    <div className="text-gray-900">{park.provinsi}</div>
                                  </div>
                                )}
                                {park.kota_kabupaten && (
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Kota/Kabupaten</div>
                                    <div className="text-gray-900">{park.kota_kabupaten}</div>
                                  </div>
                                )}
                                {park.kecamatan && (
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Kecamatan</div>
                                    <div className="text-gray-900">{park.kecamatan}</div>
                                  </div>
                                )}
                                {park.desa_kelurahan && (
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Desa/Kelurahan</div>
                                    <div className="text-gray-900">{park.desa_kelurahan}</div>
                                  </div>
                                )}
                              </div>

                              {/* Description */}
                              {park.description && (
                                <div>
                                  <div className="text-xs text-gray-500 mb-1.5">Deskripsi</div>
                                  <p className="text-sm text-gray-700 leading-relaxed">
                                    {park.description}
                                  </p>
                                </div>
                              )}

                              {/* Sejarah */}
                              {park.sejarah && (
                                <div>
                                  <div className="text-xs text-gray-500 mb-1.5">Sejarah</div>
                                  <p className="text-sm text-gray-700 leading-relaxed">
                                    {park.sejarah}
                                  </p>
                                </div>
                              )}

                              {/* Visi & Misi */}
                              {(park.visi || park.misi) && (
                                <div className="grid grid-cols-2 gap-4">
                                  {park.visi && (
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1.5">Visi</div>
                                      <p className="text-sm text-gray-700 leading-relaxed">
                                        {park.visi}
                                      </p>
                                    </div>
                                  )}
                                  {park.misi && (
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1.5">Misi</div>
                                      <p className="text-sm text-gray-700 leading-relaxed">
                                        {park.misi}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Nilai Penting & Nilai Dasar */}
                              {(park.nilai_penting || park.nilai_dasar) && (
                                <div className="grid grid-cols-2 gap-4">
                                  {park.nilai_penting && (
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1.5">Nilai Penting</div>
                                      <p className="text-sm text-gray-700 leading-relaxed">
                                        {park.nilai_penting}
                                      </p>
                                    </div>
                                  )}
                                  {park.nilai_dasar && (
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1.5">Nilai Dasar</div>
                                      <p className="text-sm text-gray-700 leading-relaxed">
                                        {park.nilai_dasar}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Grouped Items - Konten yang menunggu approval per taman */}
            {filteredGroups.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Konten ({filteredGroups.length} taman)
                </h2>
                <div className="space-y-3">
                  {filteredGroups.map((group) => {
                    const isExpanded = expandedGroups.has(group.parkId);
                    const isProcessing = processingGroups.has(group.parkId);

                    return (
                      <div
                        key={group.parkId}
                        className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors overflow-hidden"
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-base font-medium text-gray-900">
                                  {group.parkName}
                                </h3>
                                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                                  {group.totalItems} item
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                                {group.floraCount > 0 && (
                                  <span>{group.floraCount} flora</span>
                                )}
                                {group.faunaCount > 0 && (
                                  <span>{group.faunaCount} fauna</span>
                                )}
                                {group.kegiatanCount > 0 && (
                                  <span>{group.kegiatanCount} kegiatan</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewParkDetail(group.parkId)}
                                  className="h-7 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                >
                                  <Eye className="mr-1.5 h-3 w-3" />
                                  Detail
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleGroup(group.parkId)}
                                  className="h-7 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                >
                                  {isExpanded ? "Sembunyikan" : "Item"}
                                  {isExpanded ? (
                                    <ChevronUp className="ml-1 h-3 w-3" />
                                  ) : (
                                    <ChevronDown className="ml-1 h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            {/* Action Button */}
                            <div className="flex-shrink-0">
                              <Button
                                onClick={() => handleBulkApprove(group.parkId, group.parkName)}
                                disabled={isProcessing}
                                className="h-8 px-4 text-xs font-medium bg-gray-900 hover:bg-gray-800 text-white rounded-md"
                              >
                                {isProcessing ? (
                                  <>
                                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                                    Memproses
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-1.5 h-3 w-3" />
                                    Setujui Semua
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Collapsible Items */}
                        <Collapsible
                          open={isExpanded}
                          onOpenChange={() => toggleGroup(group.parkId)}
                        >
                          <CollapsibleContent>
                            <div className="px-5 pb-5 pt-0">
                              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                                {group.items.map((item) => (
                                  <div
                                    key={`${item.entityType}-${item.entityId}`}
                                    className="p-4 rounded-md border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors"
                                  >
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            {getEntityLabel(item.entityType)}
                                          </span>
                                          <span className="text-xs text-gray-400">#{item.entityId}</span>
                                        </div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                                          {item.entityType === "flora" ||
                                          item.entityType === "fauna" ? (
                                            <i>{item.title}</i>
                                          ) : (
                                            item.title
                                          )}
                                        </h4>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                          {item.submittedAt && (
                                            <span>
                                              {new Date(item.submittedAt).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                              })}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex-shrink-0 flex items-center gap-1.5">
                                        <Button
                                          onClick={() =>
                                            handleSingleApprove(
                                              group.parkId,
                                              item.entityType,
                                              item.entityId,
                                              item.title,
                                            )
                                          }
                                          className="h-7 px-3 text-xs font-medium bg-gray-900 hover:bg-gray-800 text-white rounded-md"
                                        >
                                          <CheckCircle className="mr-1 h-3 w-3" />
                                          Setujui
                                        </Button>
                                        <Button
                                          onClick={() =>
                                            handleSingleReject(
                                              group.parkId,
                                              item.entityType,
                                              item.entityId,
                                              item.title,
                                            )
                                          }
                                          variant="outline"
                                          className="h-7 px-3 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-gray-300 rounded-md"
                                        >
                                          <XCircle className="mr-1 h-3 w-3" />
                                          Tolak
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      {/* Reject Dialog */}
      <ActionDialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog({ ...rejectDialog, open })}
        type="reject"
        title={rejectDialog.isPark ? `Tolak Taman "${rejectDialog.title}"` : `Tolak "${rejectDialog.title}"`}
        description={
          rejectDialog.isPark
            ? "Masukkan alasan penolakan taman ini. Alasan ini akan dikirim ke pengelola taman."
            : "Masukkan alasan penolakan data ini. Alasan ini akan dikirim ke pengirim data."
        }
        onConfirm={executeReject}
        requireReason={true}
        reasonPlaceholder="Masukkan alasan penolakan..."
      />

      {/* Bulk Approve Dialog */}
      <ActionDialog
        open={bulkApproveDialog.open}
        onOpenChange={(open) => setBulkApproveDialog({ ...bulkApproveDialog, open })}
        type="approve"
        title={`Setujui Semua Data dari "${bulkApproveDialog.parkName}"`}
        description={`Apakah Anda yakin ingin menyetujui SEMUA data (${bulkApproveDialog.count} item) dari taman "${bulkApproveDialog.parkName}"?\n\nTindakan ini tidak dapat dibatalkan.`}
        onConfirm={executeBulkApprove}
        confirmLabel="Ya, Setujui Semua"
        isLoading={bulkApproveDialog.parkId ? processingGroups.has(bulkApproveDialog.parkId) : false}
      />

      {/* Park Approve Dialog */}
      <ActionDialog
        open={parkApproveDialog.open}
        onOpenChange={(open) => setParkApproveDialog({ ...parkApproveDialog, open })}
        type="approve"
        title={`Setujui Taman "${parkApproveDialog.parkName}"`}
        description={`Apakah Anda yakin ingin menyetujui taman "${parkApproveDialog.parkName}"?\n\nTaman akan menjadi aktif dan dapat dikelola oleh regional admin.`}
        onConfirm={executeParkApprove}
        confirmLabel="Ya, Setujui"
        isLoading={parkApproveDialog.parkId ? processingParks.has(parkApproveDialog.parkId) : false}
      />
    </div>
  );
}
