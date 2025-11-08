"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  parksApi,
  approvalsApi,
  floraApi,
  faunaApi,
  activitiesApi,
} from "../../../../../lib/api-client";
import { toast } from "sonner";
import {
  CheckCircle,
  Leaf,
  Bird,
  Calendar,
  TreePine,
  ArrowLeft,
  Loader2,
  ChevronDown,
  ChevronUp,
  XCircle,
} from "lucide-react";
import { CollapsibleApprovalItem } from "../../../../../components/approval/CollapsibleApprovalItem";
import { Button } from "../../../../../components/ui/button";
import { imageUrl } from "../../../../../lib/api-url";
import { ActionDialog } from "../../../../../components/ui/action-dialog";

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
  const [activeTab, setActiveTab] = useState<"flora" | "fauna" | "kegiatan">(
    "flora",
  );
  const [showParkInfo, setShowParkInfo] = useState(false);

  // Dialog states
  const [bulkApproveDialog, setBulkApproveDialog] = useState({
    open: false,
  });
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    entityType?: string;
    entityId?: number;
    title?: string;
  }>({ open: false });

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
      const parkGroup = grouped.groups.find((g) => g.parkId === parkId);
      setGroupData(parkGroup);
    } catch (error) {
      console.error("Failed to load park detail", error);
      toast.error("Gagal memuat detail taman");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (!groupData) return;
    setBulkApproveDialog({ open: true });
  };

  const executeBulkApprove = async () => {
    if (!groupData || !park) return;

    try {
      setApproving(true);

      const result = await approvalsApi.bulkApprove(parkId);

      toast.success(`✅ Berhasil menyetujui ${result.approvedCount} item`, {
        description: `Flora: ${result.details.flora || 0}, Fauna: ${result.details.fauna || 0}, Kegiatan: ${result.details.kegiatan || 0}`,
      });

      setBulkApproveDialog({ open: false });
      router.push("/dashboard/approval");
    } catch (error) {
      console.error("Failed to bulk approve", error);
      toast.error("Gagal melakukan bulk approval");
    } finally {
      setApproving(false);
    }
  };

  const handleSingleApprove = async (
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
      await loadParkDetail();
    } catch (error) {
      console.error("Failed to approve item", error);
      toast.error("Gagal menyetujui item");
    }
  };

  const handleSingleReject = async (
    entityType: string,
    entityId: number,
    title: string,
  ) => {
    setRejectDialog({
      open: true,
      entityType,
      entityId,
      title,
    });
  };

  const executeReject = async (reason?: string) => {
    const { entityType, entityId, title } = rejectDialog;
    if (!reason || !reason.trim() || !entityType || !entityId) {
      toast.error("Alasan penolakan harus diisi");
      return;
    }

    try {
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
      setRejectDialog({ open: false });
      await loadParkDetail();
    } catch (error) {
      console.error("Failed to reject item", error);
      toast.error("Gagal menolak item");
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
            case "flora":
              detail = await floraApi.getById(entityId);
              break;
            case "fauna":
              detail = await faunaApi.getById(entityId);
              break;
            case "kegiatan":
              detail = await activitiesApi.getById(entityId);
              break;
          }

          // Fetch galleries for flora/fauna
          if (entityType === "flora" || entityType === "fauna") {
            try {
              const galleriesResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://38.47.93.167:8080"}/api/v1/galleries/entity/${entityType}/${entityId}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                  },
                },
              );

              if (galleriesResponse.ok) {
                const galleriesData = await galleriesResponse.json();
                galleries = galleriesData.data || [];
              }
            } catch (galleriesError) {
              console.error("Failed to load galleries:", galleriesError);
            }
          }

          const detailWithGalleries = { ...detail, galleries };
          setDetailsCache((prev) => ({
            ...prev,
            [key]: detailWithGalleries,
          }));
        } catch (error) {
          console.error("Failed to load detail", error);
          toast.error("Gagal memuat detail");
        }
      }
    }

    setExpandedItems(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Memuat data...</p>
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
          <Button
            onClick={() => router.push("/dashboard/approval")}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  const totalPendingItems = groupData.totalItems || 0;
  const floraCount = groupData.floraCount || 0;
  const faunaCount = groupData.faunaCount || 0;
  const kegiatanCount = groupData.kegiatanCount || 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Elegant Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Back Button - Subtle */}
          <button
            onClick={() => router.push("/dashboard/approval")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Kembali</span>
          </button>

          {/* Title Section - Clean & Minimal */}
          <div className="flex items-start justify-between gap-6 mb-8">
            <div className="flex-1">
              <h1 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">
                {park.name}
              </h1>
              <p className="text-sm text-gray-500 font-light">
                Review data yang menunggu persetujuan
              </p>
            </div>

            {totalPendingItems > 0 && (
              <Button
                onClick={handleBulkApprove}
                disabled={approving}
                size="sm"
                className="h-9 px-4 text-xs font-medium bg-gray-900 hover:bg-gray-800 text-white rounded-md shadow-sm"
              >
                {approving ? (
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
            )}
          </div>

          {/* Stats - Elegant & Minimal */}
          {totalPendingItems > 0 && (
            <div className="flex items-center gap-8 text-xs text-gray-500">
              <div>
                <span className="font-medium text-gray-900">{totalPendingItems}</span>{" "}
                item
              </div>
              {floraCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <Leaf className="h-3.5 w-3.5 text-green-500" />
                  <span>{floraCount}</span>
                </div>
              )}
              {faunaCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <Bird className="h-3.5 w-3.5 text-blue-500" />
                  <span>{faunaCount}</span>
                </div>
              )}
              {kegiatanCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-purple-500" />
                  <span>{kegiatanCount}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content - Clean Layout */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Park Information - Elegant Collapsible */}
        <div className="mb-10">
          <button
            onClick={() => setShowParkInfo(!showParkInfo)}
            className="w-full flex items-center justify-between py-3 px-0 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors group"
          >
            <span>Informasi Taman</span>
            {showParkInfo ? (
              <ChevronUp className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            )}
          </button>

          {showParkInfo && (
            <div className="mt-6 space-y-8 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Park Image - Elegant */}
              {park.gambar_utama && (
                <div className="rounded-lg overflow-hidden border border-gray-100">
                  <img
                    src={imageUrl(park.gambar_utama)}
                    alt={park.name}
                    className="w-full h-72 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Information Grid - Clean */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Profil */}
                <div className="space-y-4">
                  <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Profil
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Nama Kawasan</div>
                      <div className="text-gray-900 font-medium">{park.name || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">SK Penetapan</div>
                      <div className="text-gray-900 font-medium">{park.sk_penetapan || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Pengelola</div>
                      <div className="text-gray-900 font-medium">{park.pengelola || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Luas Kawasan</div>
                      <div className="text-gray-900 font-medium">
                        {park.area_ha ? `${park.area_ha} ha` : "-"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lokasi */}
                <div className="space-y-4">
                  <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Lokasi
                  </h3>
                  <div className="space-y-3 text-sm">
                    {park.provinsi && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Provinsi</div>
                        <div className="text-gray-900 font-medium">{park.provinsi}</div>
                      </div>
                    )}
                    {park.kota_kabupaten && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Kota/Kabupaten</div>
                        <div className="text-gray-900 font-medium">{park.kota_kabupaten}</div>
                      </div>
                    )}
                    {park.kecamatan && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Kecamatan</div>
                        <div className="text-gray-900 font-medium">{park.kecamatan}</div>
                      </div>
                    )}
                    {park.desa_kelurahan && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Desa/Kelurahan</div>
                        <div className="text-gray-900 font-medium">{park.desa_kelurahan}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Karakteristik & Dokumen - If exists */}
              {(park.tipe_ekoregion ||
                park.kondisi_fisik ||
                park.nilai_penting ||
                park.description ||
                park.sejarah ||
                park.visi ||
                park.misi ||
                park.nilai_dasar) && (
                <div className="pt-6 border-t border-gray-100 space-y-6">
                  {park.tipe_ekoregion && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1.5">Tipe Ekoregion</div>
                      <div className="text-sm text-gray-900">{park.tipe_ekoregion}</div>
                    </div>
                  )}
                  {park.kondisi_fisik && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1.5">Kondisi Fisik</div>
                      <div className="text-sm text-gray-900">{park.kondisi_fisik}</div>
                    </div>
                  )}
                  {park.nilai_penting && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1.5">Nilai Penting</div>
                      <div className="text-sm text-gray-900">{park.nilai_penting}</div>
                    </div>
                  )}
                  {park.description && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1.5">Deskripsi</div>
                      <p className="text-sm text-gray-700 leading-relaxed">{park.description}</p>
                    </div>
                  )}
                  {park.sejarah && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1.5">Sejarah</div>
                      <p className="text-sm text-gray-700 leading-relaxed">{park.sejarah}</p>
                    </div>
                  )}
                  {(park.visi || park.misi) && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {park.visi && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1.5">Visi</div>
                          <p className="text-sm text-gray-700 leading-relaxed">{park.visi}</p>
                        </div>
                      )}
                      {park.misi && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1.5">Misi</div>
                          <p className="text-sm text-gray-700 leading-relaxed">{park.misi}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {park.nilai_dasar && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1.5">Nilai Dasar</div>
                      <p className="text-sm text-gray-700 leading-relaxed">{park.nilai_dasar}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabs - Elegant Design */}
        {totalPendingItems > 0 ? (
          <div>
            {/* Tab Navigation - Minimal & Clean */}
            <div className="flex items-center gap-1 border-b border-gray-100 mb-6">
              <button
                onClick={() => setActiveTab("flora")}
                className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === "flora"
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4" />
                  <span>Flora</span>
                  {floraCount > 0 && (
                    <span className="text-xs text-gray-400">({floraCount})</span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab("fauna")}
                className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === "fauna"
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bird className="h-4 w-4" />
                  <span>Fauna</span>
                  {faunaCount > 0 && (
                    <span className="text-xs text-gray-400">({faunaCount})</span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab("kegiatan")}
                className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === "kegiatan"
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Kegiatan</span>
                  {kegiatanCount > 0 && (
                    <span className="text-xs text-gray-400">({kegiatanCount})</span>
                  )}
                </div>
              </button>
            </div>

            {/* Tab Content - Clean Spacing */}
            <div className="space-y-4">
              {/* Flora Tab */}
              {activeTab === "flora" &&
                (floraCount > 0 ? (
                  groupData.items
                    .filter((i: any) => i.entityType === "flora")
                    .map((item: any) => {
                      const key = `flora-${item.entityId}`;
                      return (
                        <CollapsibleApprovalItem
                          key={item.entityId}
                          item={item}
                          entityType="flora"
                          detail={detailsCache[key]}
                          isExpanded={expandedItems.has(key)}
                          isLoadingDetail={
                            expandedItems.has(key) && !detailsCache[key]
                          }
                          onToggle={() => toggleItemExpand("flora", item.entityId)}
                          onApprove={() =>
                            handleSingleApprove("flora", item.entityId, item.title)
                          }
                          onReject={() =>
                            handleSingleReject("flora", item.entityId, item.title)
                          }
                        />
                      );
                    })
                ) : (
                  <div className="py-16 text-center">
                    <p className="text-sm text-gray-400">Tidak ada flora yang menunggu persetujuan</p>
                  </div>
                ))}

              {/* Fauna Tab */}
              {activeTab === "fauna" &&
                (faunaCount > 0 ? (
                  groupData.items
                    .filter((i: any) => i.entityType === "fauna")
                    .map((item: any) => {
                      const key = `fauna-${item.entityId}`;
                      return (
                        <CollapsibleApprovalItem
                          key={item.entityId}
                          item={item}
                          entityType="fauna"
                          detail={detailsCache[key]}
                          isExpanded={expandedItems.has(key)}
                          isLoadingDetail={
                            expandedItems.has(key) && !detailsCache[key]
                          }
                          onToggle={() => toggleItemExpand("fauna", item.entityId)}
                          onApprove={() =>
                            handleSingleApprove("fauna", item.entityId, item.title)
                          }
                          onReject={() =>
                            handleSingleReject("fauna", item.entityId, item.title)
                          }
                        />
                      );
                    })
                ) : (
                  <div className="py-16 text-center">
                    <p className="text-sm text-gray-400">Tidak ada fauna yang menunggu persetujuan</p>
                  </div>
                ))}

              {/* Kegiatan Tab */}
              {activeTab === "kegiatan" &&
                (kegiatanCount > 0 ? (
                  groupData.items
                    .filter((i: any) => i.entityType === "kegiatan")
                    .map((item: any) => {
                      const key = `kegiatan-${item.entityId}`;
                      return (
                        <CollapsibleApprovalItem
                          key={item.entityId}
                          item={item}
                          entityType="kegiatan"
                          detail={detailsCache[key]}
                          isExpanded={expandedItems.has(key)}
                          isLoadingDetail={
                            expandedItems.has(key) && !detailsCache[key]
                          }
                          onToggle={() =>
                            toggleItemExpand("kegiatan", item.entityId)
                          }
                          onApprove={() =>
                            handleSingleApprove(
                              "kegiatan",
                              item.entityId,
                              item.title,
                            )
                          }
                          onReject={() =>
                            handleSingleReject(
                              "kegiatan",
                              item.entityId,
                              item.title,
                            )
                          }
                        />
                      );
                    })
                ) : (
                  <div className="py-16 text-center">
                    <p className="text-sm text-gray-400">Tidak ada kegiatan yang menunggu persetujuan</p>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">
              Tidak ada data yang menunggu persetujuan
            </h3>
            <p className="text-sm text-gray-500">
              Semua data dari taman ini sudah diproses
            </p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {/* Bulk Approve Dialog */}
      <ActionDialog
        open={bulkApproveDialog.open}
        onOpenChange={(open) => setBulkApproveDialog({ open })}
        type="approve"
        title={`Setujui Semua Data dari "${park?.name}"`}
        description={`Apakah Anda yakin ingin menyetujui SEMUA data (${totalPendingItems} item) dari taman "${park?.name}"?\n\nTindakan ini tidak dapat dibatalkan.`}
        onConfirm={executeBulkApprove}
        confirmLabel="Ya, Setujui Semua"
        isLoading={approving}
      />

      {/* Reject Dialog */}
      <ActionDialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog({ ...rejectDialog, open })}
        type="reject"
        title={`Tolak "${rejectDialog.title}"`}
        description="Masukkan alasan penolakan data ini. Alasan ini akan dikirim ke pengirim data."
        onConfirm={executeReject}
        requireReason={true}
        reasonPlaceholder="Masukkan alasan penolakan..."
      />
    </div>
  );
}
