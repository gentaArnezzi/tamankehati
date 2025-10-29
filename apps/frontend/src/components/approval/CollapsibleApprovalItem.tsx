'use client';

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import {
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
  Image as ImageIcon,
  XCircle,
} from 'lucide-react';

interface CollapsibleApprovalItemProps {
  item: any;
  entityType: 'flora' | 'fauna' | 'kegiatan';
  detail: any | null;
  isExpanded: boolean;
  isLoadingDetail: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onReject?: () => void;
}

// Helper to ensure full URL
const getFullImageUrl = (url: string | undefined) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:8000${url.startsWith('/') ? '' : '/'}${url}`;
};

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
  const borderColor = {
    flora: 'border-l-green-500',
    fauna: 'border-l-blue-500',
    kegiatan: 'border-l-purple-500',
  }[entityType];

  const badgeColor = {
    flora: 'bg-green-100 text-green-700 border-green-300',
    fauna: 'bg-blue-100 text-blue-700 border-blue-300',
    kegiatan: 'bg-purple-100 text-purple-700 border-purple-300',
  }[entityType];

  const typeLabel = {
    flora: 'Flora',
    fauna: 'Fauna',
    kegiatan: 'Kegiatan',
  }[entityType];

  return (
    <Card className={`border-l-4 ${borderColor} transition-all hover:shadow-md`}>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <CollapsibleTrigger className="flex items-center gap-3 flex-1 text-left hover:opacity-70 transition-opacity">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={badgeColor}>{typeLabel}</Badge>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs">
                    {item.status === 'in_review' ? 'Menunggu Review' : item.status}
                  </Badge>
                </div>
                <h4 className="font-semibold text-base italic truncate">{item.title}</h4>
                <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                  <span>ID: #{item.entityId}</span>
                  <span>{item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}</span>
                </div>
              </div>
            </CollapsibleTrigger>
            
            <div className="flex gap-2 flex-shrink-0">
              <Button
                onClick={onApprove}
                className="bg-[#356447] hover:bg-[#2d5239]"
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Setujui
              </Button>
              {onReject && (
                <Button
                  onClick={onReject}
                  variant="destructive"
                  size="sm"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Tolak
                </Button>
              )}
            </div>
          </div>

          {/* Expanded Detail */}
          <CollapsibleContent>
            <div className="mt-4 pt-4 border-t">
              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#356447]" />
                </div>
              ) : detail ? (
                <div className="space-y-6">
                  {/* Flora Detail */}
                  {entityType === 'flora' && (
                    <>
                      {/* Image */}
                      {detail.gambar_utama ? (
                        <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                          <img
                            src={getFullImageUrl(detail.gambar_utama)}
                            alt={detail.nama_ilmiah || detail.nama_umum}
                            className="w-full h-64 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              console.error('Failed to load main image:', detail.gambar_utama);
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                          <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-500">Gambar tidak tersedia</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Galleries */}
                      {detail.galleries && detail.galleries.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">
                            Galeri Gambar ({detail.galleries.length})
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {detail.galleries.map((gallery: any, index: number) => (
                              <div key={gallery.id || index} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                  <img
                                    src={getFullImageUrl(gallery.image_url)}
                                    alt={gallery.title || 'Gallery image'}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      console.error('Failed to load gallery image:', gallery.image_url);
                                      target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Gambar Detail Flora */}
                      {(detail.gambar_daun || detail.gambar_batang || detail.gambar_bunga || detail.gambar_buah) && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">
                            Dokumentasi Detail Flora
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {detail.gambar_daun && (
                              <div className="space-y-2">
                                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                  <img
                                    src={getFullImageUrl(detail.gambar_daun)}
                                    alt="Pertelaan Daun"
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      console.error('Failed to load leaf image:', detail.gambar_daun);
                                      target.style.display = 'none';
                                    }}
                                  />
                                </div>
                                <div className="text-center">
                                  <p className="text-xs font-medium text-gray-900">Pertelaan Daun</p>
                                  <p className="text-[10px] text-gray-500">Detail struktur daun</p>
                                </div>
                              </div>
                            )}
                            {detail.gambar_batang && (
                              <div className="space-y-2">
                                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                  <img
                                    src={getFullImageUrl(detail.gambar_batang)}
                                    alt="Batang/Percabangan"
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      console.error('Failed to load stem image:', detail.gambar_batang);
                                      target.style.display = 'none';
                                    }}
                                  />
                                </div>
                                <div className="text-center">
                                  <p className="text-xs font-medium text-gray-900">Batang</p>
                                  <p className="text-[10px] text-gray-500">Batang & percabangan</p>
                                </div>
                              </div>
                            )}
                            {detail.gambar_bunga && (
                              <div className="space-y-2">
                                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                  <img
                                    src={getFullImageUrl(detail.gambar_bunga)}
                                    alt="Bunga"
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      console.error('Failed to load flower image:', detail.gambar_bunga);
                                      target.style.display = 'none';
                                    }}
                                  />
                                </div>
                                <div className="text-center">
                                  <p className="text-xs font-medium text-gray-900">Bunga</p>
                                  <p className="text-[10px] text-gray-500">Detail struktur bunga</p>
                                </div>
                              </div>
                            )}
                            {detail.gambar_buah && (
                              <div className="space-y-2">
                                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                  <img
                                    src={getFullImageUrl(detail.gambar_buah)}
                                    alt="Buah"
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      console.error('Failed to load fruit image:', detail.gambar_buah);
                                      target.style.display = 'none';
                                    }}
                                  />
                                </div>
                                <div className="text-center">
                                  <p className="text-xs font-medium text-gray-900">Buah</p>
                                  <p className="text-[10px] text-gray-500">Detail struktur buah</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <DetailField label="Nama Ilmiah" value={detail.nama_ilmiah} italic />
                        <DetailField label="Nama Umum" value={detail.nama_umum} />
                        <DetailField label="Famili" value={detail.famili} />
                        <DetailField label="Genus" value={detail.genus} />
                        <DetailField label="Sinonim" value={detail.sinonim} italic />
                        <DetailField label="Waktu Berbunga" value={detail.waktu_berbunga} />
                        <DetailField label="Status IUCN" value={detail.status_iucn} />
                        <DetailField label="Endemik" value={detail.is_endemic ? 'Ya' : 'Tidak'} />
                      </div>
                      
                      <DetailField label="Deskripsi Umum" value={detail.deskripsi} fullWidth multiline />
                      <DetailField label="Morfologi" value={detail.morfologi} fullWidth multiline />
                      <DetailField label="Habitat" value={detail.habitat} fullWidth multiline />
                      <DetailField label="Manfaat" value={detail.manfaat} fullWidth multiline />
                      <DetailField label="Penyebaran" value={detail.penyebaran} fullWidth multiline />
                      <DetailField label="Metode Perbanyakan" value={detail.metode_perbanyakan} fullWidth multiline />
                      <DetailField label="Referensi" value={detail.referensi} fullWidth multiline />
                    </>
                  )}

                  {/* Fauna Detail */}
                  {entityType === 'fauna' && (
                    <>
                      {/* Image */}
                      {detail.gambar_utama ? (
                        <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                          <img
                            src={getFullImageUrl(detail.gambar_utama)}
                            alt={detail.nama_ilmiah || detail.nama_umum}
                            className="w-full h-64 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              console.error('Failed to load main image:', detail.gambar_utama);
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                          <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-500">Gambar tidak tersedia</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Galleries */}
                      {detail.galleries && detail.galleries.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">
                            Galeri Gambar ({detail.galleries.length})
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {detail.galleries.map((gallery: any, index: number) => (
                              <div key={gallery.id || index} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                  <img
                                    src={getFullImageUrl(gallery.image_url)}
                                    alt={gallery.title || 'Gallery image'}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      console.error('Failed to load gallery image:', gallery.image_url);
                                      target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <DetailField label="Nama Ilmiah" value={detail.nama_ilmiah} italic />
                        <DetailField label="Nama Umum" value={detail.nama_umum} />
                        <DetailField label="Ordo" value={detail.ordo} />
                        <DetailField label="Status IUCN" value={detail.status_iucn} />
                        <DetailField label="Endemik" value={detail.is_endemic ? 'Ya' : 'Tidak'} />
                        <DetailField label="Status Hama" value={detail.status_hama} />
                        <DetailField label="Tingkat Hama" value={detail.tingkat_hama} />
                      </div>
                      
                      <DetailField label="Habitat & Sumber Makanan" value={detail.habitat_sumber_makanan} fullWidth multiline />
                      <DetailField label="Deskripsi" value={detail.deskripsi} fullWidth multiline />
                    </>
                  )}

                  {/* Kegiatan Detail */}
                  {entityType === 'kegiatan' && (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <DetailField label="Judul" value={detail.title} />
                        <DetailField label="Tanggal" value={detail.date ? new Date(detail.date).toLocaleDateString('id-ID') : '-'} />
                      </div>
                      
                      <DetailField label="Deskripsi" value={detail.description} fullWidth multiline />
                    </>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Tidak ada detail tersedia
                </p>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </Card>
  );
}

interface DetailFieldProps {
  label: string;
  value: any;
  fullWidth?: boolean;
  multiline?: boolean;
  italic?: boolean;
}

function DetailField({ label, value, fullWidth, multiline, italic }: DetailFieldProps) {
  const displayValue = value || '-';
  
  return (
    <div className={fullWidth ? 'col-span-full' : ''}>
      <div className="text-xs font-medium text-muted-foreground mb-1">{label}</div>
      <div className={`text-sm ${italic ? 'italic' : ''} ${multiline ? 'whitespace-pre-wrap leading-relaxed' : 'font-medium'}`}>
        {displayValue}
      </div>
    </div>
  );
}

