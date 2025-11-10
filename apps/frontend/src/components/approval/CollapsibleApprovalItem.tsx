"use client";

import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
  Image as ImageIcon,
  XCircle,
} from "lucide-react";
import { imageUrl } from "../../lib/api-url";

interface CollapsibleApprovalItemProps {
  item: any;
  entityType: "flora" | "fauna" | "kegiatan";
  detail: any | null;
  isExpanded: boolean;
  isLoadingDetail: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onReject?: () => void;
}

export function CollapsibleApprovalItem({
  item,
  entityType,
  detail,
  isExpanded,
  isLoadingDetail,
  onToggle,
  onApprove,
  onReject,
}: CollapsibleApprovalItemProps) {
  const iconColor = {
    flora: "text-green-500",
    fauna: "text-blue-500",
    kegiatan: "text-purple-500",
  }[entityType];

  const badgeColor = {
    flora: "bg-green-50 text-green-700 border-green-200",
    fauna: "bg-blue-50 text-blue-700 border-blue-200",
    kegiatan: "bg-purple-50 text-purple-700 border-purple-200",
  }[entityType];

  const typeLabel = {
    flora: "Flora",
    fauna: "Fauna",
    kegiatan: "Kegiatan",
  }[entityType];

  return (
    <div className="bg-white border border-gray-100 rounded-lg hover:border-gray-200 transition-all duration-200">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <div className="p-5">
          {/* Header - Clean & Minimal */}
          <div className="flex items-start justify-between gap-4">
            <CollapsibleTrigger className="flex items-start gap-3 flex-1 text-left group">
              <div className={`mt-0.5 ${iconColor} transition-transform ${isExpanded ? "rotate-90" : ""}`}>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                {/* Badges - Subtle */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`${badgeColor} text-xs font-medium border`}
                  >
                    {typeLabel}
                  </Badge>
                  <span className="text-xs text-gray-400">#{item.entityId}</span>
                </div>
                
                {/* Title - Elegant */}
                <h4 className="text-base font-medium text-gray-900 leading-tight">
                  {entityType === "flora" || entityType === "fauna" ? (
                    <i className="font-normal">{item.title}</i>
                  ) : (
                    item.title
                  )}
                </h4>
                
                {/* Meta Info - Subtle */}
                {item.submittedAt && (
                  <div className="text-xs text-gray-400">
                    {new Date(item.submittedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                )}
              </div>
            </CollapsibleTrigger>

            {/* Action Buttons - Minimal & Clean */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove();
                }}
                size="sm"
                className="h-8 px-3 text-xs font-medium bg-gray-900 hover:bg-gray-800 text-white rounded-md shadow-sm"
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                Setujui
              </Button>
              {onReject && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject();
                  }}
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-gray-200 rounded-md"
                >
                  <XCircle className="h-3.5 w-3.5 mr-1.5" />
                  Tolak
                </Button>
              )}
            </div>
          </div>

          {/* Expanded Detail - Clean Layout */}
          <CollapsibleContent>
            <div className="mt-5 pt-5 border-t border-gray-100">
              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : detail ? (
                <div className="space-y-8">
                  {/* Flora Detail */}
                  {entityType === "flora" && (
                    <>
                      {/* Main Image - Elegant */}
                      {detail.gambar_utama ? (
                        <div className="rounded-lg overflow-hidden border border-gray-100">
                          <img
                            src={imageUrl(detail.gambar_utama)}
                            alt={detail.nama_ilmiah || detail.nama_umum}
                            className="w-full h-72 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="rounded-lg border border-gray-100 bg-gray-50 h-72 flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">Gambar tidak tersedia</p>
                          </div>
                        </div>
                      )}

                      {/* Galleries - Clean Grid */}
                      {detail.galleries && detail.galleries.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">
                            Galeri ({detail.galleries.length})
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {detail.galleries.map(
                              (gallery: any, index: number) => (
                                <div
                                  key={gallery.id || index}
                                  className="aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50 group cursor-pointer"
                                >
                                  <img
                                    src={imageUrl(gallery.image_url)}
                                    alt={gallery.title || "Gallery image"}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                  />
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {/* Detail Images - Clean Layout */}
                      {(detail.gambar_daun ||
                        detail.gambar_batang ||
                        detail.gambar_bunga ||
                        detail.gambar_buah) && (
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">
                            Dokumentasi Detail
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {detail.gambar_daun && (
                              <div className="space-y-2">
                                <div className="aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50 group">
                                  <img
                                    src={imageUrl(detail.gambar_daun)}
                                    alt="Pertelaan Daun"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                  />
                                </div>
                                <div className="text-center">
                                  <p className="text-xs font-medium text-gray-900">Daun</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">Pertelaan</p>
                                </div>
                              </div>
                            )}
                            {detail.gambar_batang && (
                              <div className="space-y-2">
                                <div className="aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50 group">
                                  <img
                                    src={imageUrl(detail.gambar_batang)}
                                    alt="Batang"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                  />
                                </div>
                                <div className="text-center">
                                  <p className="text-xs font-medium text-gray-900">Batang</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">Percabangan</p>
                                </div>
                              </div>
                            )}
                            {detail.gambar_bunga && (
                              <div className="space-y-2">
                                <div className="aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50 group">
                                  <img
                                    src={imageUrl(detail.gambar_bunga)}
                                    alt="Bunga"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                  />
                                </div>
                                <div className="text-center">
                                  <p className="text-xs font-medium text-gray-900">Bunga</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">Struktur</p>
                                </div>
                              </div>
                            )}
                            {detail.gambar_buah && (
                              <div className="space-y-2">
                                <div className="aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50 group">
                                  <img
                                    src={imageUrl(detail.gambar_buah)}
                                    alt="Buah"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                  />
                                </div>
                                <div className="text-center">
                                  <p className="text-xs font-medium text-gray-900">Buah</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">Struktur</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Information Grid - Clean */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <DetailField
                          label="Nama Ilmiah"
                          value={detail.nama_ilmiah}
                          italic
                        />
                        <DetailField
                          label="Nama Umum"
                          value={detail.nama_umum}
                        />
                        <DetailField label="Kelas" value={detail.kelas} />
                        <DetailField label="Famili" value={detail.famili} />
                        <DetailField label="Genus" value={detail.genus} />
                        <DetailField
                          label="Sinonim"
                          value={detail.sinonim}
                          italic
                        />
                        <DetailField
                          label="Waktu Berbunga"
                          value={detail.waktu_berbunga}
                        />
                        <DetailField
                          label="Status IUCN"
                          value={detail.status_iucn}
                        />
                        <DetailField
                          label="Endemik"
                          value={detail.is_endemic ? "Ya" : "Tidak"}
                        />
                      </div>

                      {/* Full Width Fields */}
                      <DetailField
                        label="Deskripsi Umum"
                        value={detail.deskripsi}
                        fullWidth
                        multiline
                      />
                      <DetailField
                        label="Morfologi"
                        value={detail.morfologi}
                        fullWidth
                        multiline
                      />
                      <DetailField
                        label="Habitat"
                        value={detail.habitat}
                        fullWidth
                        multiline
                      />
                      <DetailField
                        label="Manfaat"
                        value={detail.manfaat}
                        fullWidth
                        multiline
                      />
                      <DetailField
                        label="Penyebaran"
                        value={detail.penyebaran}
                        fullWidth
                        multiline
                      />
                      <DetailField
                        label="Metode Perbanyakan"
                        value={detail.metode_perbanyakan}
                        fullWidth
                        multiline
                      />
                      <DetailField
                        label="Referensi"
                        value={detail.referensi}
                        fullWidth
                        multiline
                      />
                    </>
                  )}

                  {/* Fauna Detail */}
                  {entityType === "fauna" && (
                    <>
                      {/* Main Image */}
                      {detail.gambar_utama ? (
                        <div className="rounded-lg overflow-hidden border border-gray-100">
                          <img
                            src={imageUrl(detail.gambar_utama)}
                            alt={detail.nama_ilmiah || detail.nama_umum}
                            className="w-full h-72 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="rounded-lg border border-gray-100 bg-gray-50 h-72 flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">Gambar tidak tersedia</p>
                          </div>
                        </div>
                      )}

                      {/* Galleries */}
                      {detail.galleries && detail.galleries.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">
                            Galeri ({detail.galleries.length})
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {detail.galleries.map(
                              (gallery: any, index: number) => (
                                <div
                                  key={gallery.id || index}
                                  className="aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50 group cursor-pointer"
                                >
                                  <img
                                    src={imageUrl(gallery.image_url)}
                                    alt={gallery.title || "Gallery image"}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                  />
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {/* Information Grid */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <DetailField
                          label="Nama Ilmiah"
                          value={detail.nama_ilmiah}
                          italic
                        />
                        <DetailField
                          label="Nama Umum"
                          value={detail.nama_umum}
                        />
                        <DetailField label="Kelas" value={detail.kelas} />
                        <DetailField label="Famili" value={detail.family || detail.famili} />
                        <DetailField label="Ordo" value={detail.ordo} />
                        <DetailField
                          label="Status IUCN"
                          value={detail.status_iucn}
                        />
                        <DetailField
                          label="Endemik"
                          value={detail.is_endemic ? "Ya" : "Tidak"}
                        />
                        <DetailField
                          label="Status Hama"
                          value={detail.status_hama}
                        />
                        <DetailField
                          label="Tingkat Hama"
                          value={detail.tingkat_hama}
                        />
                      </div>

                      {/* Full Width Fields */}
                      <DetailField
                        label="Habitat & Sumber Makanan"
                        value={detail.habitat_sumber_makanan}
                        fullWidth
                        multiline
                      />
                      <DetailField
                        label="Deskripsi"
                        value={detail.deskripsi}
                        fullWidth
                        multiline
                      />
                    </>
                  )}

                  {/* Kegiatan Detail */}
                  {entityType === "kegiatan" && (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        <DetailField label="Judul" value={detail.title} />
                        <DetailField
                          label="Tanggal"
                          value={
                            detail.date
                              ? new Date(detail.date).toLocaleDateString(
                                  "id-ID",
                                )
                              : "-"
                          }
                        />
                      </div>

                      <DetailField
                        label="Deskripsi"
                        value={detail.description}
                        fullWidth
                        multiline
                      />
                    </>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-gray-400">Tidak ada detail tersedia</p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}

interface DetailFieldProps {
  label: string;
  value: any;
  fullWidth?: boolean;
  multiline?: boolean;
  italic?: boolean;
}

function DetailField({
  label,
  value,
  fullWidth,
  multiline,
  italic,
}: DetailFieldProps) {
  const displayValue = value || "-";

  return (
    <div className={fullWidth ? "col-span-full" : ""}>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
        {label}
      </div>
      <div
        className={`text-sm text-gray-900 ${italic ? "italic" : ""} ${multiline ? "whitespace-pre-wrap leading-relaxed" : "font-medium"}`}
      >
        {displayValue}
      </div>
    </div>
  );
}
