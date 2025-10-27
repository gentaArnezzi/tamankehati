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
  AlertCircle
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
        <Button variant="outline" onClick={onClose}>
          Tutup
        </Button>
      </div>

      {/* Main Info */}
      <div className="grid gap-4 md:grid-cols-2">
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
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">Dibuat Oleh</h4>
              <p className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {activity.created_by || 'N/A'}
              </p>
            </div>
            
            {activity.submitted_at && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Dikirim untuk Review</h4>
                <p>{formatDateTime(activity.submitted_at)}</p>
              </div>
            )}
            
            {activity.approved_by && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Disetujui Oleh</h4>
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  {activity.approved_by}
                </p>
                {activity.approved_at && (
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(activity.approved_at)}
                  </p>
                )}
              </div>
            )}
            
            {activity.rejected_at && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Ditolak</h4>
                <p className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  {formatDateTime(activity.rejected_at)}
                </p>
                {activity.rejection_reason && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Alasan: {activity.rejection_reason}
                  </p>
                )}
              </div>
            )}
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
