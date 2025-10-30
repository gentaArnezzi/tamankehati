'use client';

import { Activity } from '../../lib/api-client';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { 
  Calendar, 
  MapPin, 
  Building, 
  User, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Image as ImageIcon,
  Eye,
  Download
} from 'lucide-react';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const renderStatusBadge = (status: string) => {
  const statusConfig = {
    draft: { label: 'Draft', variant: 'secondary' as const, icon: Clock },
    in_review: { label: 'Review', variant: 'default' as const, icon: AlertCircle },
    approved: { label: 'Approved', variant: 'default' as const, icon: CheckCircle },
    rejected: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

interface ActivityDetailProps {
  activity: Activity;
  onClose: () => void;
}

export function ActivityDetail({ activity, onClose }: ActivityDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{activity.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            {renderStatusBadge(activity.status)}
            <span className="text-sm text-muted-foreground">
              Dibuat: {activity.created_at ? formatDateTime(activity.created_at) : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Activity Images */}
      {activity.images && activity.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Dokumentasi Kegiatan
            </CardTitle>
            <CardDescription>
              {activity.images.length} gambar dokumentasi kegiatan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activity.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-zxb9.onrender.com'}${image}`}
                    alt={`${activity.title} - Gambar ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary">
                        <Eye className="h-4 w-4 mr-1" />
                        Lihat
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Download className="h-4 w-4 mr-1" />
                        Unduh
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Info */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tanggal Pelaksanaan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {formatDate(activity.activity_date)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(activity.activity_date).toLocaleDateString('id-ID', { 
                weekday: 'long',
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-5 w-5" />
              Taman
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {activity.park?.name || 'N/A'}
            </p>
            {activity.park_id && (
              <p className="text-sm text-muted-foreground mt-1">
                ID: {activity.park_id}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {renderStatusBadge(activity.status)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {activity.status === 'approved' && 'Kegiatan telah disetujui'}
              {activity.status === 'draft' && 'Kegiatan dalam status draft'}
              {activity.status === 'in_review' && 'Kegiatan sedang dalam review'}
              {activity.status === 'rejected' && 'Kegiatan ditolak'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Location */}
      {activity.location && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Lokasi Kegiatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{activity.location}</p>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {activity.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Deskripsi Kegiatan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{activity.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Workflow Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informasi Workflow</CardTitle>
          <CardDescription>
            Detail proses persetujuan dan status kegiatan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Dibuat Oleh</h4>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                <span className="font-medium">{activity.created_by || 'N/A'}</span>
              </div>
              {activity.created_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  Dibuat pada: {formatDateTime(activity.created_at)}
                </p>
              )}
            </div>
            
            {activity.submitted_at && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Dikirim untuk Review</h4>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900">
                    {formatDateTime(activity.submitted_at)}
                  </p>
                </div>
              </div>
            )}
            
            {activity.approved_by && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Disetujui Oleh</h4>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">{activity.approved_by}</span>
                  </div>
                  {activity.approved_at && (
                    <p className="text-sm text-green-700 mt-1">
                      Disetujui pada: {formatDateTime(activity.approved_at)}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {activity.rejected_at && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Ditolak Oleh</h4>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-900">{activity.rejected_by || 'N/A'}</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Ditolak pada: {formatDateTime(activity.rejected_at)}
                  </p>
                </div>
                {activity.rejection_reason && (
                  <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Alasan penolakan:</strong>
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      {activity.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3">Timeline Kegiatan</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Kegiatan dibuat</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.created_at ? formatDateTime(activity.created_at) : 'N/A'}
                  </p>
                </div>
              </div>
              
              {activity.submitted_at && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Dikirim untuk review</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(activity.submitted_at)}
                    </p>
                  </div>
                </div>
              )}
              
              {activity.approved_at && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Disetujui</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(activity.approved_at)}
                    </p>
                  </div>
                </div>
              )}
              
              {activity.rejected_at && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Ditolak</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(activity.rejected_at)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID Kegiatan:</span>
              <span>{activity.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID Taman:</span>
              <span>{activity.park_id}</span>
            </div>
            {activity.updated_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Terakhir Diupdate:</span>
                <span>{formatDateTime(activity.updated_at)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
