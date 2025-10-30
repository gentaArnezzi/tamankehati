import { User } from '../../lib/api-client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { Switch } from '../ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useState } from 'react';


interface UserTableProps {
  data: User[];
  loading?: boolean;
  onEdit: (user: User) => void;
  onPreview: (user: User) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

export function UserTable({ data, loading, onEdit, onPreview, onToggleActive, onDelete }: UserTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);


  const getRoleBadge = (role: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      super_admin: { label: 'Super Admin', className: 'bg-purple-50 text-purple-700 border-purple-100 font-medium' },
      regional_admin: { label: 'Admin Regional', className: 'bg-blue-50 text-blue-700 border-blue-100 font-medium' },
    };
    
    const config = variants[role] || variants.regional_admin;
    return <Badge variant="outline" className={`${config.className} px-3 py-1`}>{config.label}</Badge>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Pengguna</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Role</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Status</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Bergabung</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="border-b border-gray-50">
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 bg-gray-200 animate-pulse">
                      <AvatarFallback className="bg-gray-200"></AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                      <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                      <div className="h-3 w-48 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full"></div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex justify-end gap-1">
                    <div className="h-9 w-9 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-9 w-9 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-9 w-9 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-gray-900 font-medium mb-1">Tidak ada pengguna ditemukan</p>
          <p className="text-sm text-gray-500">Coba ubah filter atau tambah pengguna baru</p>
        </div>
      </div>
    );
  }

  // Get user initials for avatar
  const getUserInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Pengguna</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Role</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Status</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Bergabung</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((user, index) => (
              <TableRow 
                key={user.id} 
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors duration-150"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <Avatar key={user.profile_picture_url || `user-avatar-${user.id}`} className="flex-shrink-0 w-10 h-10 shadow-sm">
                      {user.profile_picture_url && (
                        <AvatarImage 
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-zxb9.onrender.com'}${user.profile_picture_url}`}
                          alt={user.nama || 'User avatar'}
                        />
                      )}
                      <AvatarFallback className="bg-gradient-to-br from-brand-500 to-brand-600 text-white font-semibold text-sm">
                        {getUserInitials(user.nama)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-gray-900 truncate">{user.nama}</span>
                      <span className="text-sm text-gray-500 truncate">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  {getRoleBadge(user.role)}
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={user.is_active}
                      onCheckedChange={(checked) => onToggleActive(user.id, checked)}
                    />
                    <span className={`text-sm font-medium ${user.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                      {user.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-sm text-gray-600">
                    {formatDate(user.created_at)}
                  </span>
                </TableCell>
                <TableCell className="py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPreview(user)}
                      title="Lihat Detail"
                      className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(user)}
                      title="Edit"
                      className="h-9 w-9 p-0 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {user.role !== 'super_admin' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(user.id)}
                        title="Hapus"
                        className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId);
                  setDeleteId(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
