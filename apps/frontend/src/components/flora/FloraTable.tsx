import { Flora } from "../../lib/api-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Eye, Pencil, Trash2, Send } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useState } from "react";

interface FloraTableProps {
  data: Flora[];
  loading?: boolean;
  onEdit: (flora: Flora) => void;
  onView: (flora: Flora) => void;
  onDelete: (id: string) => void;
  onSubmitReview: (id: string) => void;
}

export function FloraTable({
  data,
  loading,
  onEdit,
  onView,
  onDelete,
  onSubmitReview,
}: FloraTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      draft: { label: "Draft", variant: "secondary" },
      in_review: { label: "Dalam Peninjauan", variant: "default" },
      approved: { label: "Disetujui", variant: "outline" },
      rejected: { label: "Ditolak", variant: "destructive" },
    };

    const config = variants[status] || variants.draft;
    return (
      <Badge
        variant={config.variant}
        className={
          status === "approved"
            ? "bg-green-100 text-green-800 border-green-200"
            : ""
        }
      >
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">
                Nama Ilmiah
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">
                Nama Lokal
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">
                Famili
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 text-right">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="border-b border-gray-50">
                <TableCell className="py-4">
                  <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full"></div>
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
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
          <p className="text-gray-900 font-medium mb-1">
            Tidak ada data flora ditemukan
          </p>
          <p className="text-sm text-gray-500">
            Coba ubah filter atau tambah data baru
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">
                Nama Ilmiah
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">
                Nama Lokal
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">
                Kelas
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">
                Famili
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">
                Genus
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">
                Morfologi
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">
                Manfaat / Kegunaan
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">
                Status IUCN
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">
                Tanggal
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 text-right">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((flora) => (
              <TableRow
                key={flora.id}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                <TableCell className="py-4">
                  <span className="font-medium italic">
                    {flora.nama_ilmiah}
                  </span>
                </TableCell>
                <TableCell className="py-4">{flora.nama_umum || "-"}</TableCell>
                <TableCell className="py-4">{flora.kelas || "-"}</TableCell>
                <TableCell className="py-4">{flora.famili || "-"}</TableCell>
                <TableCell className="py-4">{flora.genus || "-"}</TableCell>
                <TableCell className="py-4 max-w-[200px] truncate">
                  {flora.morfologi || "-"}
                </TableCell>
                <TableCell className="py-4 max-w-[200px] truncate">
                  {flora.manfaat || "-"}
                </TableCell>
                <TableCell className="py-4">
                  {flora.status_iucn ? (
                    <Badge variant="outline" className="text-xs">
                      {flora.status_iucn}
                    </Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="py-4">
                  {getStatusBadge(flora.status)}
                </TableCell>
                <TableCell className="py-4 text-sm text-muted-foreground">
                  {formatDate(flora.created_at)}
                </TableCell>
                <TableCell className="py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(flora)}
                      title="Lihat Detail"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {(flora.status === "draft" ||
                      flora.status === "approved") && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(flora)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {flora.status === "draft" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSubmitReview(flora.id)}
                            title="Ajukan untuk Ditinjau"
                            style={{ color: "#356447" }}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(flora.id)}
                          title="Hapus"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {flora.status === "rejected" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(flora)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
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
              Apakah Anda yakin ingin menghapus data flora ini? Tindakan ini
              tidak dapat dibatalkan.
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
